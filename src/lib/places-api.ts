import { apiFetch } from "@/lib/api";

export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  source?: string;
  /** Straight-line distance from search bias point (km), when known. */
  distanceKm?: number | null;
}

export interface SelectedPlace {
  label: string;
  latitude?: number;
  longitude?: number;
}

export interface PlaceSearchBias {
  latitude: number;
  longitude: number;
  /** Search radius in meters (default 35 km). */
  radiusMeters?: number;
}

/** Default metro bias — New Delhi (used until GPS / map pin is available). */
export const DEFAULT_PLACE_BIAS: PlaceSearchBias = {
  latitude: 28.6139,
  longitude: 77.209,
  radiusMeters: 45_000,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapPayload<T>(res: unknown): T {
  const record = asRecord(res);
  if (record && "data" in record && record.data != null) {
    return unwrapPayload<T>(record.data);
  }
  return res as T;
}

function toCoord(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseSuggestion(value: unknown): PlaceSuggestion | null {
  const row = asRecord(value);
  if (!row) return null;
  const name = String(row.name ?? row.label ?? "").trim();
  const address = String(row.address ?? row.formatted_address ?? row.vicinity ?? name).trim();
  const id = String(row.id ?? row.place_id ?? `${name}-${address}`);
  if (!id && !name && !address) return null;
  return {
    id: id || `${name}-${address}`,
    name: name || address,
    address: address || name,
    latitude: toCoord(row.latitude ?? row.lat),
    longitude: toCoord(row.longitude ?? row.lng ?? row.lon),
    source: typeof row.source === "string" ? row.source : undefined,
    distanceKm: toCoord(row.distanceKm ?? row.distance_km),
  };
}

function hasCoordinates(
  place: Pick<PlaceSuggestion, "latitude" | "longitude"> | SelectedPlace,
): boolean {
  const lat = "latitude" in place ? place.latitude : undefined;
  const lng = "longitude" in place ? place.longitude : undefined;
  return typeof lat === "number" && typeof lng === "number";
}

/** Haversine distance in kilometers. */
export function distanceKmBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function rankByProximity(
  results: PlaceSuggestion[],
  bias?: PlaceSearchBias | null,
): PlaceSuggestion[] {
  if (!bias || results.length === 0) return results;

  const radiusKm = (bias.radiusMeters ?? 45_000) / 1000;
  const scored = results.map((place) => {
    const hasCoords =
      typeof place.latitude === "number" && typeof place.longitude === "number";
    const distanceKm = hasCoords
      ? distanceKmBetween(
          bias.latitude,
          bias.longitude,
          place.latitude!,
          place.longitude!,
        )
      : null;
    return { ...place, distanceKm };
  });

  const nearby = scored.filter(
    (p) => p.distanceKm != null && p.distanceKm <= radiusKm * 1.35,
  );
  const rest = scored.filter(
    (p) => p.distanceKm == null || p.distanceKm > radiusKm * 1.35,
  );

  const byDistance = (a: PlaceSuggestion, b: PlaceSuggestion) =>
    (a.distanceKm ?? Number.POSITIVE_INFINITY) -
    (b.distanceKm ?? Number.POSITIVE_INFINITY);

  // Prefer local matches; keep farther results only as a short fallback list.
  if (nearby.length >= 3) {
    return nearby.sort(byDistance);
  }
  return [...nearby.sort(byDistance), ...rest.sort(byDistance)].slice(0, 10);
}

export async function searchPlaces(
  query: string,
  options?: {
    limit?: number;
    bias?: PlaceSearchBias | null;
  },
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const limit = options?.limit ?? 10;
  const bias = options?.bias ?? null;

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
    country: "in",
  });

  if (bias) {
    params.set("lat", String(bias.latitude));
    params.set("lng", String(bias.longitude));
    params.set("radius", String(bias.radiusMeters ?? 45_000));
    // Common alternate keys used by places backends / Google-style proxies.
    params.set("location", `${bias.latitude},${bias.longitude}`);
  }

  const raw = await apiFetch<unknown>(
    `/public/places/search?${params.toString()}`,
    { skipAuth: true, timeoutMs: 8_000, skipRetry: true },
    "Unable to search places",
  );
  const data = unwrapPayload<unknown>(raw);
  const record = asRecord(data);
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(record?.results)
      ? record.results
      : Array.isArray(record?.predictions)
        ? record.predictions
        : [];
  const results = rows
    .map(parseSuggestion)
    .filter((row): row is PlaceSuggestion => Boolean(row));

  return rankByProximity(results, bias);
}

export async function getPlaceDetails(placeId: string): Promise<PlaceSuggestion> {
  const params = new URLSearchParams({ place_id: placeId });
  const raw = await apiFetch<unknown>(
    `/public/places/details?${params.toString()}`,
    { skipAuth: true, timeoutMs: 12_000 },
    "Unable to load place details",
  );
  const parsed = parseSuggestion(unwrapPayload(raw));
  if (!parsed) {
    throw new Error("Unable to load place details");
  }
  return parsed;
}

/** Resolve place_id when search results lack lat/lng (same as Flutter). */
export async function resolvePlaceDetails(
  place: PlaceSuggestion,
): Promise<SelectedPlace> {
  if (hasCoordinates(place)) {
    return {
      label: place.address || place.name,
      latitude: place.latitude!,
      longitude: place.longitude!,
    };
  }

  const details = await getPlaceDetails(place.id);
  if (!hasCoordinates(details)) {
    throw new Error("Unable to load place details");
  }
  return {
    label: details.address || details.name || place.address || place.name,
    latitude: details.latitude!,
    longitude: details.longitude!,
  };
}

/**
 * Resolve a free-text address to lat/lng via the places search API.
 * Used when landing/home book without map-picker coordinates.
 */
export async function resolveAddressCoords(
  address: string,
  bias?: PlaceSearchBias | null,
): Promise<{ latitude: number; longitude: number; label: string } | null> {
  const trimmed = address.trim();
  if (trimmed.length < 2) return null;

  try {
    const results = await searchPlaces(trimmed, { limit: 5, bias: bias ?? null });
    const withCoords = results.find((row) => hasCoordinates(row));
    if (withCoords?.latitude != null && withCoords.longitude != null) {
      return {
        latitude: withCoords.latitude,
        longitude: withCoords.longitude,
        label: withCoords.address || withCoords.name || trimmed,
      };
    }
    if (results[0]) {
      const resolved = await resolvePlaceDetails(results[0]);
      if (resolved.latitude != null && resolved.longitude != null) {
        return {
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          label: resolved.label || trimmed,
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** Backend reverse-geocode (same contract as Flutter: GET /public/places/reverse). */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<SelectedPlace> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });

  try {
    const data = unwrapPayload<{
      address?: string;
      formatted_address?: string;
      city?: string | null;
      state?: string | null;
      latitude?: number;
      longitude?: number;
    }>(
      await apiFetch<unknown>(
        `/public/places/reverse?${params.toString()}`,
        { skipAuth: true, timeoutMs: 12_000 },
        "Unable to resolve location",
      ),
    );

    const address =
      data.address?.trim() ||
      data.formatted_address?.trim() ||
      [data.city, data.state].filter(Boolean).join(", ").trim();

    return {
      label: address || "Current location",
      latitude: toCoord(data.latitude) ?? lat,
      longitude: toCoord(data.longitude) ?? lng,
    };
  } catch {
    return {
      label: "Current location",
      latitude: lat,
      longitude: lng,
    };
  }
}

function readGpsPosition(
  options: PositionOptions,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * App-style current location: high-accuracy device GPS, optional short refine,
 * then address + coords from backend `/public/places/reverse`.
 */
export async function resolveCurrentGpsPlace(options?: {
  timeoutMs?: number;
  /** Wait briefly for a more accurate GPS fix (mobile-app style). */
  refineMs?: number;
  signal?: AbortSignal;
}): Promise<SelectedPlace> {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const refineMs = options?.refineMs ?? 3_500;
  const signal = options?.signal;

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation unavailable");
  }

  const geoOpts: PositionOptions = {
    enableHighAccuracy: true,
    timeout: timeoutMs,
    maximumAge: 0,
  };

  let best = await readGpsPosition(geoOpts);
  const accuracy = best.coords.accuracy;

  if (
    refineMs > 0 &&
    Number.isFinite(accuracy) &&
    accuracy > 40 &&
    typeof navigator.geolocation.watchPosition === "function"
  ) {
    best = await new Promise<GeolocationPosition>((resolve) => {
      let current = best;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let settled = false;
      let watchId = 0;

      const finish = (pos: GeolocationPosition) => {
        if (settled) return;
        settled = true;
        if (timer != null) window.clearTimeout(timer);
        if (watchId) navigator.geolocation.clearWatch(watchId);
        resolve(pos);
      };

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (
            !Number.isFinite(current.coords.accuracy) ||
            pos.coords.accuracy < current.coords.accuracy
          ) {
            current = pos;
          }
          if (pos.coords.accuracy <= 25) finish(current);
        },
        () => finish(current),
        { enableHighAccuracy: true, maximumAge: 0, timeout: timeoutMs },
      );

      timer = setTimeout(() => finish(current), refineMs);

      signal?.addEventListener("abort", () => finish(current), { once: true });
    });
  }

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  return reverseGeocode(best.coords.latitude, best.coords.longitude);
}

export function directionsQuery(place: SelectedPlace): string {
  if (hasCoordinates(place)) {
    return `${place.latitude},${place.longitude}`;
  }
  return place.label;
}

export function formatDistanceKm(km: number | null | undefined): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return `${Math.max(100, Math.round(km * 1000))} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

const SUGGESTION_SEEDS: Record<"pickup" | "dropoff" | "stop", string[]> = {
  pickup: ["metro", "market"],
  dropoff: ["metro", "mall", "hospital"],
  stop: ["metro", "mall"],
};

/**
 * Nearby dropoff/pickup suggestions from the public places search API,
 * biased to the rider GPS / map pin (no dedicated /nearby endpoint).
 */
export async function fetchSuggestedPlaces(
  field: "pickup" | "dropoff" | "stop",
  bias?: PlaceSearchBias | null,
): Promise<PlaceSuggestion[]> {
  const seeds = SUGGESTION_SEEDS[field];
  const biasPoint = bias ?? DEFAULT_PLACE_BIAS;

  const batches = await Promise.all(
    seeds.map((seed) =>
      searchPlaces(seed, { limit: 5, bias: biasPoint }).catch(
        () => [] as PlaceSuggestion[],
      ),
    ),
  );

  const merged: PlaceSuggestion[] = [];
  const seen = new Set<string>();
  for (const batch of batches) {
    for (const place of batch) {
      const key = place.id || `${place.name}|${place.address}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(place);
    }
  }

  return rankByProximity(merged, biasPoint).slice(0, 8);
}
