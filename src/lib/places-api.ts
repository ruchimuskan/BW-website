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
    undefined,
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
    undefined,
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
      latitude?: number;
      longitude?: number;
    }>(
      await apiFetch<unknown>(
        `/public/places/reverse?${params.toString()}`,
        undefined,
        "Unable to resolve location",
      ),
    );

    return {
      label: data.address?.trim() || "Current location",
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
