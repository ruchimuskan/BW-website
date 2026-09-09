import { apiFetch, authFetch } from "@/lib/api";
import { directionsQuery, type SelectedPlace } from "@/lib/places-api";
import {
  stopsToApiPayload,
  stopsToWaypointsQuery,
  type TripStop,
} from "@/lib/trip-stops";

export interface RideDriver {
  id?: string;
  name?: string | null;
  phone?: string | null;
  rating?: number | null;
  photo_url?: string | null;
  vehicle_number?: string | null;
}

export interface Ride {
  id: string;
  public_id?: string | null;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  fare_estimate: number | null;
  fare_final: number | null;
  cancelled_reason?: string | null;
  cancelled_by?: string | null;
  driver_id?: string | null;
  created_at: string;
  prefer_women_riders?: boolean;
  allow_all_riders?: boolean;
  women_riders_available?: boolean;
  requires_rider_preference_choice?: boolean;
  women_safety_enabled?: boolean;
  message?: string;
  driver?: RideDriver | null;
  start_code?: string | null;
  vehicle_number?: string | null;
  vehicle_type_name?: string | null;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
  driver_lat?: number | null;
  driver_lng?: number | null;
  estimated_duration_min?: number | null;
  estimated_distance_km?: number | null;
  payment_method?: string | null;
  is_emergency?: boolean;
  scheduled_at?: string | null;
  booking_purpose?: string | null;
  ride_type?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
}

interface BackendRide {
  id: string;
  public_id?: string | null;
  pickup_address?: string | null;
  dropoff_address?: string | null;
  status: string;
  estimated_fare?: number;
  final_fare?: number | null;
  fare_estimate?: number | null;
  fare_final?: number | null;
  cancellation_reason?: string | null;
  cancelled_reason?: string | null;
  cancel_reason?: string | null;
  cancelled_by?: string | null;
  driver_id?: string | null;
  created_at: string;
  prefer_women_riders?: boolean;
  allow_all_riders?: boolean;
  women_riders_available?: boolean;
  requires_rider_preference_choice?: boolean;
  women_safety_enabled?: boolean;
  message?: string;
  driver?: RideDriver | null;
  start_code?: string | null;
  vehicle_number?: string | null;
  vehicle_type_name?: string | null;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
  driver_lat?: number | null;
  driver_lng?: number | null;
  estimated_duration_min?: number | null;
  estimated_distance_km?: number | null;
  payment_method?: string | null;
  is_emergency?: boolean;
  scheduled_at?: string | null;
  booking_purpose?: string | null;
  ride_type?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
}

function unwrapApiData<T>(res: unknown): T {
  let current: unknown = res;
  for (let i = 0; i < 4; i += 1) {
    if (!current || typeof current !== "object" || Array.isArray(current)) break;
    const record = current as Record<string, unknown>;
    if (record.data != null && typeof record.data === "object") {
      current = record.data;
      continue;
    }
    break;
  }
  return current as T;
}

function asRideRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Reject empty / coerced "undefined" strings from bad URL params or slim API payloads. */
export function isUsableAddress(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.toLowerCase() !== "undefined" &&
    trimmed.toLowerCase() !== "null"
  );
}

export function resolveRideAddress(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    if (isUsableAddress(candidate)) return candidate.trim();
  }
  return "";
}

function readAddress(
  ride: BackendRide,
  primary: "pickup_address" | "dropoff_address",
): string {
  const direct = ride[primary];
  if (isUsableAddress(direct)) return direct.trim();

  const record = ride as BackendRide & Record<string, unknown>;
  const aliases =
    primary === "pickup_address"
      ? ["pickup", "from_address", "source_address", "start_address"]
      : ["dropoff", "drop_address", "to_address", "destination_address", "end_address"];

  for (const key of aliases) {
    const value = record[key];
    if (isUsableAddress(value)) return value.trim();
    if (value && typeof value === "object" && "address" in value) {
      const nested = (value as { address?: unknown }).address;
      if (isUsableAddress(nested)) return nested.trim();
    }
  }
  return "";
}

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function mapRide(ride: BackendRide): Ride {
  const extra = ride as BackendRide & Record<string, unknown>;
  return {
    id: ride.id,
    public_id: ride.public_id,
    pickup_address: readAddress(ride, "pickup_address"),
    dropoff_address: readAddress(ride, "dropoff_address"),
    status: ride.status ?? "REQUESTED",
    fare_estimate: ride.fare_estimate ?? ride.estimated_fare ?? null,
    fare_final: ride.fare_final ?? ride.final_fare ?? null,
    cancelled_reason: firstNonEmptyString(
      ride.cancellation_reason,
      ride.cancelled_reason,
      ride.cancel_reason,
      extra.cancellationReason,
      extra.cancelReason,
    ),
    cancelled_by: firstNonEmptyString(ride.cancelled_by, extra.cancelled_by, extra.canceled_by),
    driver_id: firstNonEmptyString(ride.driver_id, extra.driver_id) ,
    created_at: ride.created_at ?? new Date().toISOString(),
    prefer_women_riders: ride.prefer_women_riders,
    allow_all_riders: ride.allow_all_riders,
    women_riders_available: ride.women_riders_available,
    requires_rider_preference_choice: ride.requires_rider_preference_choice,
    women_safety_enabled: ride.women_safety_enabled,
    message: ride.message,
    driver: ride.driver,
    start_code: ride.start_code,
    vehicle_number: ride.vehicle_number,
    vehicle_type_name: ride.vehicle_type_name,
    pickup_lat: ride.pickup_lat,
    pickup_lng: ride.pickup_lng,
    dropoff_lat: ride.dropoff_lat,
    dropoff_lng: ride.dropoff_lng,
    driver_lat: ride.driver_lat,
    driver_lng: ride.driver_lng,
    estimated_duration_min: ride.estimated_duration_min,
    estimated_distance_km: ride.estimated_distance_km ?? null,
    payment_method: ride.payment_method,
    is_emergency: ride.is_emergency,
    scheduled_at: ride.scheduled_at ?? null,
    booking_purpose: ride.booking_purpose ?? null,
    ride_type: ride.ride_type ?? null,
    receiver_name: ride.receiver_name ?? null,
    receiver_phone: ride.receiver_phone ?? null,
  };
}

export function isDeliveryRide(ride: Pick<Ride, "booking_purpose" | "vehicle_type_name">): boolean {
  if (ride.booking_purpose?.toUpperCase() === "PARCEL") return true;
  const name = ride.vehicle_type_name?.toLowerCase() ?? "";
  return name.includes("parcel") || name.includes("delivery");
}

export function isEmergencyRide(
  ride: Pick<Ride, "is_emergency" | "vehicle_type_name" | "booking_purpose" | "ride_type">,
): boolean {
  if (ride.is_emergency) return true;
  if (ride.ride_type?.toUpperCase() === "EMERGENCY") return true;
  const name = ride.vehicle_type_name?.toLowerCase() ?? "";
  return name.includes("ambulance") || name.includes("emergency");
}

export interface RideHistoryResponse {
  items: Ride[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface FareEstimate {
  category_id: string;
  estimated_fare: number;
  original_fare?: number | null;
  member_discount?: number;
  discount_percent?: number;
  currency: string;
}

export interface RideDirections {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  distance_km: number;
  duration_min: number;
  pickup_address?: string;
  dropoff_address?: string;
}

export async function getRideDirections(
  pickup: SelectedPlace | string,
  dropoff: SelectedPlace | string,
  stops: TripStop[] = []
): Promise<RideDirections> {
  const pickupPlace: SelectedPlace =
    typeof pickup === "string" ? { label: pickup } : pickup;
  const dropoffPlace: SelectedPlace =
    typeof dropoff === "string" ? { label: dropoff } : dropoff;

  const params = new URLSearchParams({
    pickup: directionsQuery(pickupPlace),
    dropoff: directionsQuery(dropoffPlace),
  });
  const waypoints = stopsToWaypointsQuery(stops);
  if (waypoints) params.set("waypoints", waypoints);

  const data = await apiFetch<{
    pickup: { lat: number; lng: number; address?: string };
    dropoff: { lat: number; lng: number; address?: string };
    distance_km: number;
    duration_min: number;
  }>(`/public/places/directions?${params.toString()}`, undefined, "Unable to load route");

  return {
    pickup_lat: data.pickup.lat,
    pickup_lng: data.pickup.lng,
    dropoff_lat: data.dropoff.lat,
    dropoff_lng: data.dropoff.lng,
    distance_km: data.distance_km,
    duration_min: data.duration_min,
    pickup_address: data.pickup.address,
    dropoff_address: data.dropoff.address,
  };
}

interface VehicleFareQuote {
  vehicle_type_id: string;
  name?: string;
  estimated_fare: number;
  original_fare?: number | null;
  member_discount?: number;
  discount_percent?: number;
}

function parseFareQuotes(res: unknown): {
  discount_percent: number | null;
  distance_km?: number;
  duration_min?: number;
  quotes: Record<string, VehicleFareQuote>;
} {
  const body = unwrapApiData<Record<string, unknown>>(res);
  const rawList = Array.isArray(body.vehicle_types)
    ? body.vehicle_types
    : Array.isArray(body.quotes)
      ? body.quotes
      : Array.isArray(body.items)
        ? body.items
        : [];

  const quotes: Record<string, VehicleFareQuote> = {};
  for (const row of rawList) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const id = String(item.vehicle_type_id ?? item.id ?? "").trim();
    const fare = Number(item.estimated_fare ?? item.fare ?? item.price ?? NaN);
    if (!id || !Number.isFinite(fare)) continue;
    const quote: VehicleFareQuote = {
      vehicle_type_id: id,
      name: typeof item.name === "string" ? item.name : undefined,
      estimated_fare: fare,
      original_fare:
        item.original_fare == null ? null : Number(item.original_fare),
      member_discount: Number(item.member_discount ?? 0),
      discount_percent: Number(item.discount_percent ?? 0),
    };
    quotes[id.toLowerCase()] = quote;
    if (quote.name) quotes[quote.name.toLowerCase()] = quote;
  }

  return {
    discount_percent:
      typeof body.discount_percent === "number" ? body.discount_percent : null,
    distance_km:
      typeof body.distance_km === "number" ? body.distance_km : undefined,
    duration_min:
      typeof body.duration_min === "number" ? body.duration_min : undefined,
    quotes,
  };
}

export async function estimateRideFares(payload: {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  distance_km?: number;
  duration_min?: number;
  service_group?: string;
  stops?: TripStop[];
  scheduled_at?: string;
}): Promise<{
  discount_percent: number | null;
  distance_km?: number;
  duration_min?: number;
  quotes: Record<string, VehicleFareQuote>;
}> {
  const stopsPayload = payload.stops ? stopsToApiPayload(payload.stops) : [];
  const res = await authFetch<unknown>(
    "/rides/estimate",
    {
      method: "POST",
      body: JSON.stringify({
        service_group: payload.service_group ?? "ride",
        pickup_lat: payload.pickup_lat,
        pickup_lng: payload.pickup_lng,
        dropoff_lat: payload.dropoff_lat,
        dropoff_lng: payload.dropoff_lng,
        ...(payload.distance_km != null ? { distance_km: payload.distance_km } : {}),
        ...(payload.duration_min != null ? { duration_min: payload.duration_min } : {}),
        ...(payload.scheduled_at ? { scheduled_at: payload.scheduled_at } : {}),
        ...(stopsPayload.length > 0 ? { stops: stopsPayload } : {}),
      }),
    },
    "Unable to estimate fare",
  );

  return parseFareQuotes(res);
}

export function estimateFare(payload: {
  vehicle_category_id: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  distance_km?: number;
  duration_min?: number;
}): Promise<FareEstimate> {
  return estimateRideFares({
    pickup_lat: payload.pickup_lat,
    pickup_lng: payload.pickup_lng,
    dropoff_lat: payload.dropoff_lat,
    dropoff_lng: payload.dropoff_lng,
    distance_km: payload.distance_km,
    duration_min: payload.duration_min,
  }).then((res) => {
    const match =
      res.quotes[payload.vehicle_category_id.toLowerCase()] ??
      Object.values(res.quotes)[0];
    return {
      category_id: match?.vehicle_type_id ?? payload.vehicle_category_id,
      estimated_fare: match?.estimated_fare ?? 0,
      original_fare: match?.original_fare ?? null,
      member_discount: match?.member_discount ?? 0,
      discount_percent: match?.discount_percent ?? res.discount_percent ?? 0,
      currency: "INR",
    };
  });
}

function coordsMatch(
  aLat?: number | null,
  aLng?: number | null,
  bLat?: number | null,
  bLng?: number | null,
) {
  if (
    typeof aLat !== "number" ||
    typeof aLng !== "number" ||
    typeof bLat !== "number" ||
    typeof bLng !== "number"
  ) {
    return false;
  }
  return Math.abs(aLat - bLat) < 0.0009 && Math.abs(aLng - bLng) < 0.0009;
}

function isSameActiveTrip(
  ride: Ride,
  payload: {
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
  },
) {
  return (
    coordsMatch(ride.pickup_lat, ride.pickup_lng, payload.pickup_lat, payload.pickup_lng) &&
    coordsMatch(ride.dropoff_lat, ride.dropoff_lng, payload.dropoff_lat, payload.dropoff_lng)
  );
}

const bookInflight = new Map<string, Promise<Ride>>();
const lastBooked = new Map<string, Ride>();

function bookFingerprint(payload: {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_category_id?: string;
  scheduled_at?: string;
}) {
  return [
    payload.pickup_lat.toFixed(4),
    payload.pickup_lng.toFixed(4),
    payload.dropoff_lat.toFixed(4),
    payload.dropoff_lng.toFixed(4),
    payload.vehicle_category_id ?? "",
    payload.scheduled_at ?? "",
  ].join("|");
}

export type PaymentMethod = "CASH" | "UPI" | "WALLET" | "CARD";

export function bookRide(payload: {
  pickup_address: string;
  dropoff_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_category_id?: string;
  payment_method?: PaymentMethod;
  promo_code?: string;
  rental_hours?: number;
  scheduled_at?: string;
  women_safety_enabled?: boolean;
  prefer_women_riders?: boolean;
  distance_km?: number;
  duration_min?: number;
  stops?: TripStop[];
  notes?: string;
  /** RIDE (passenger) or PARCEL (delivery) — matches backend BookRideRequest */
  booking_purpose?: "RIDE" | "PARCEL";
  is_emergency?: boolean;
  ride_type?: "NORMAL" | "EMERGENCY";
  receiver_name?: string;
  receiver_phone?: string;
  pay_by_receiver?: boolean;
}): Promise<Ride> {
  const fingerprint = bookFingerprint(payload);
  const pending = bookInflight.get(fingerprint);
  if (pending) return pending;

  const run = (async () => {
    const stopsPayload = payload.stops ? stopsToApiPayload(payload.stops) : [];
    const existing = await getActiveRide();
    if (existing && !isRideTerminal(existing.status)) {
      if (isSameActiveTrip(existing, payload)) {
        return existing;
      }
      throw new Error(
        "You already have an active ride. Open Bookings to view or cancel it, then try again.",
      );
    }
    const recent = lastBooked.get(fingerprint);
    if (recent && !isRideTerminal(recent.status) && isSameActiveTrip(recent, payload)) {
      return recent;
    }

    const ride = await authFetch<BackendRide>(
    "/book-ride",
    {
      method: "POST",
      timeoutMs: 45_000,
      body: JSON.stringify({
        pickup_address: payload.pickup_address,
        dropoff_address: payload.dropoff_address,
        pickup_lat: payload.pickup_lat,
        pickup_lng: payload.pickup_lng,
        dropoff_lat: payload.dropoff_lat,
        dropoff_lng: payload.dropoff_lng,
        payment_method: payload.payment_method ?? "CASH",
        women_safety_enabled: payload.women_safety_enabled ?? false,
        prefer_women_riders: payload.prefer_women_riders ?? false,
        booking_purpose: payload.booking_purpose ?? "RIDE",
        is_emergency: payload.is_emergency ?? false,
        ...(payload.vehicle_category_id
          ? { vehicle_category_id: payload.vehicle_category_id }
          : {}),
        ...(payload.promo_code ? { promo_code: payload.promo_code } : {}),
        ...(payload.rental_hours != null ? { rental_hours: payload.rental_hours } : {}),
        ...(payload.scheduled_at ? { scheduled_at: payload.scheduled_at } : {}),
        ...(payload.distance_km != null ? { distance_km: payload.distance_km } : {}),
        ...(payload.duration_min != null ? { duration_min: payload.duration_min } : {}),
        ...(stopsPayload.length > 0 ? { stops: stopsPayload } : {}),
        ...(payload.notes?.trim()
          ? { special_notes: payload.notes.trim() }
          : {}),
        ...(payload.receiver_name?.trim()
          ? { receiver_name: payload.receiver_name.trim() }
          : {}),
        ...(payload.receiver_phone?.trim()
          ? { receiver_phone: payload.receiver_phone.trim() }
          : {}),
        ...(payload.pay_by_receiver != null
          ? { pay_by_receiver: payload.pay_by_receiver }
          : {}),
        ...(payload.ride_type ? { ride_type: payload.ride_type } : {}),
      }),
    },
    "Unable to book ride"
  ).then((res) => mapRide(unwrapApiData<BackendRide>(res)));
    lastBooked.set(fingerprint, ride);
    return ride;
  })();

  bookInflight.set(fingerprint, run);
  void run.finally(() => {
    if (bookInflight.get(fingerprint) === run) {
      bookInflight.delete(fingerprint);
    }
  });
  return run;
}

export function continueWithAllRiders(rideId: string): Promise<Ride> {
  return authFetch<unknown>(
    "/continue-with-all-riders",
    { method: "POST", body: JSON.stringify({ ride_id: rideId }) },
    "Unable to continue ride search"
  ).then((res) => mapRide(unwrapApiData<BackendRide>(res)));
}

export function getActiveRide(): Promise<Ride | null> {
  return loadBlockingRideFromBackend();
}

async function loadBlockingRideFromBackend(): Promise<Ride | null> {
  const candidates: Ride[] = [];
  let lastError: Error | null = null;

  try {
    const res = await authFetch<unknown>("/dashboard", undefined, "Unable to load active ride");
    const body = unwrapApiData<Record<string, unknown>>(res);
    const record = asRideRecord(body) ?? {};
    const nestedActive =
      record.active_ride ??
      record.current_ride ??
      record.ongoing_ride ??
      record.latest_ride ??
      record.activeRide;
    if (nestedActive && typeof nestedActive === "object") {
      candidates.push(mapRide(nestedActive as BackendRide));
    }
    candidates.push(...extractRideList(body).map(mapRide));
  } catch (error) {
    lastError = error instanceof Error ? error : new Error("Unable to load active ride");
  }

  try {
    const history = await getRideHistory(1, 20);
    candidates.push(...history.items);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/session expired|sign in again|invalid or expired token|unauthorized/i.test(message)) {
      throw error;
    }
    if (!lastError) {
      lastError = error instanceof Error ? error : new Error("Unable to load rides");
    }
  }

  const blocking = sortRidesByBookedAt(candidates).find((ride) => {
    if (!ride.id || isRideTerminal(ride.status)) return false;
    const upper = ride.status.toUpperCase();
    if (upper.includes("SCHEDULE")) return false;
    return isRideInProgress(ride.status) || upper === "UPCOMING";
  });
  if (blocking) return blocking;
  if (candidates.length === 0 && lastError) throw lastError;
  return null;
}

export function isActiveRideBlockingError(message: string): boolean {
  return /already have an active ride|active ride in progress|ongoing ride|open ride|finish (your )?current|one ride at a time|complete or cancel/i.test(
    message,
  );
}

export async function bookRideWithRetry(payload: Parameters<typeof bookRide>[0]): Promise<Ride> {
  try {
    return await bookRide(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (isActiveRideBlockingError(message)) {
      throw new Error(
        "You already have an active ride. Open Bookings to view or cancel it, then try again.",
      );
    }
    throw err;
  }
}

function extractRideList(res: unknown): BackendRide[] {
  if (Array.isArray(res)) return res as BackendRide[];
  if (!res || typeof res !== "object") return [];
  const obj = res as Record<string, unknown>;
  const lists = [
    obj.items,
    obj.rides,
    obj.recent_rides,
    obj.results,
    obj.records,
    obj.history,
    obj.past_rides,
    obj.bookings,
  ];
  const collected: BackendRide[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const id = (item as BackendRide | undefined)?.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      collected.push(item as BackendRide);
    }
  }
  const singles = [obj.active_ride, obj.current_ride, obj.ongoing_ride, obj.latest_ride];
  for (const single of singles) {
    if (!single || typeof single !== "object") continue;
    const ride = single as BackendRide;
    if (!ride.id || seen.has(ride.id)) continue;
    seen.add(ride.id);
    collected.unshift(ride);
  }
  if (collected.length > 0) return collected;
  if (obj.data) return extractRideList(obj.data);
  return [];
}

export function sortRidesByBookedAt(rides: Ride[]): Ride[] {
  return [...rides].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  });
}

export function mergeRideLists(primary: Ride[], secondary: Ride[] = []): Ride[] {
  const map = new Map<string, Ride>();
  for (const ride of [...primary, ...secondary]) {
    if (ride?.id) map.set(ride.id, ride);
  }
  return sortRidesByBookedAt(Array.from(map.values()));
}

async function fetchDashboardRides(): Promise<Ride[]> {
  const res = await authFetch<unknown>("/dashboard", undefined, "Unable to load dashboard");
  const body = unwrapApiData<Record<string, unknown>>(res);
  return extractRideList(body).map(mapRide);
}

function parseRideHistoryResponse(
  res: unknown,
  page: number,
  pageSize: number,
): RideHistoryResponse {
  const body = unwrapApiData<unknown>(res);
  const rawItems = extractRideList(body);
  const items = rawItems.map(mapRide);
  const meta =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  return {
    items: sortRidesByBookedAt(items),
    total: typeof meta.total === "number" ? meta.total : items.length,
    page: typeof meta.page === "number" ? meta.page : page,
    page_size: typeof meta.page_size === "number" ? meta.page_size : pageSize,
    pages: typeof meta.pages === "number" ? meta.pages : 1,
  };
}

export async function getRideHistory(
  page = 1,
  pageSize = 50,
): Promise<RideHistoryResponse> {
  let listResponse: RideHistoryResponse | null = null;
  let listError: Error | null = null;

  try {
    const res = await authFetch<unknown>(
      `/rides?page=${page}&page_size=${pageSize}`,
      undefined,
      "Unable to load ride history",
    );
    listResponse = parseRideHistoryResponse(res, page, pageSize);
    if (listResponse.items.length > 0) return listResponse;
  } catch (err) {
    listError =
      err instanceof Error ? err : new Error("Unable to load ride history");
    if (/session expired|sign in again|invalid or expired token|unauthorized/i.test(listError.message)) {
      throw listError;
    }
  }

  try {
    const dashboardItems = await fetchDashboardRides();
    if (dashboardItems.length > 0) {
      const merged = mergeRideLists(listResponse?.items ?? [], dashboardItems);
      return {
        items: merged,
        total: merged.length,
        page,
        page_size: pageSize,
        pages: 1,
      };
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to load ride history";
    if (/session expired|sign in again|invalid or expired token|unauthorized/i.test(message)) {
      throw err instanceof Error ? err : new Error(message);
    }
  }

  if (listError) throw listError;
  return listResponse ?? { items: [], total: 0, page, page_size: pageSize, pages: 1 };
}

export function getRide(rideId: string): Promise<Ride> {
  return authFetch<unknown>(`/ride/${rideId}`, undefined, "Unable to load ride").then(
    (res) => mapRide(unwrapApiData<BackendRide>(res)),
  );
}

export function getRideStatus(rideId: string): Promise<{ status: string }> {
  return authFetch<unknown>(`/ride/${rideId}`, undefined, "Unable to load ride status").then(
    (res) => {
      const ride = unwrapApiData<BackendRide>(res);
      return { status: ride.status };
    },
  );
}

export function cancelRide(rideId: string, reason?: string): Promise<Ride> {
  return authFetch<BackendRide>(
    "/cancel-ride",
    { method: "POST", body: JSON.stringify({ ride_id: rideId, reason: reason || "User cancelled" }) },
    "Unable to cancel ride"
  ).then((res) => mapRide(unwrapApiData<BackendRide>(res)));
}

export function getRideTracking(rideId: string): Promise<Record<string, unknown>> {
  return authFetch<unknown>(`/ride/${rideId}`, undefined, "Unable to load tracking").then(
    (res) => unwrapApiData<Record<string, unknown>>(res),
  );
}

export function rateRide(
  rideId: string,
  rating: number,
  comment?: string
): Promise<{ ride_id: string; rating: number }> {
  return authFetch<{ ride_id: string; rating: number }>(
    `/ride/${rideId}/rate`,
    {
      method: "POST",
      body: JSON.stringify({ rating, comment: comment ?? null }),
    },
    "Unable to submit rating"
  );
}

export function isSearchingForCaptain(status: string | null | undefined): boolean {
  if (!status) return false;
  const key = status.toUpperCase().replace(/[\s-]+/g, "_");
  return (
    key === "SEARCHING" ||
    key === "REQUESTED" ||
    key === "PENDING" ||
    key === "SEARCHING_DRIVER" ||
    key === "DRIVER_SEARCH"
  );
}

export function isDriverAssigned(status: string | null | undefined): boolean {
  if (!status) return false;
  const key = status.toUpperCase().replace(/[\s-]+/g, "_");
  const assigned = new Set([
    "ACCEPTED",
    "DRIVER_ASSIGNED",
    "ARRIVED",
    "DRIVER_ARRIVED",
    "OTP_VERIFIED",
    "STARTED",
    "IN_PROGRESS",
    "EN_ROUTE",
  ]);
  return assigned.has(key);
}

export function isRideTerminal(status: string | null | undefined): boolean {
  if (!status) return false;
  const key = status.toUpperCase().replace(/[\s-]+/g, "_");
  if (key.includes("CANCEL")) return true;
  if (
    key.includes("COMPLETE") ||
    key === "DONE" ||
    key === "ENDED" ||
    key === "FINISHED"
  ) {
    return true;
  }
  if (key === "FAILED" || key === "EXPIRED" || key === "REJECTED") return true;
  return false;
}

export function isRideInProgress(status: string | null | undefined): boolean {
  if (!status) return false;
  return isSearchingForCaptain(status) || isDriverAssigned(status);
}

export interface RideDriverDetails {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicle_number: string;
  photo_url?: string | null;
}

export function getRideDriver(rideId: string): Promise<RideDriverDetails> {
  return authFetch<RideDriverDetails>(
    `/ride/${rideId}/driver`,
    undefined,
    "Unable to load driver"
  );
}

export function triggerRideSos(
  rideId: string,
  payload?: { lat?: number; lng?: number; message?: string }
): Promise<{
  message?: string;
  emergency_sms_sent?: boolean;
  ticket_id?: string;
}> {
  return authFetch(
    `/ride/${rideId}/sos`,
    {
      method: "POST",
      body: JSON.stringify({
        lat: payload?.lat ?? null,
        lng: payload?.lng ?? null,
        message: payload?.message ?? "Passenger triggered SOS",
      }),
    },
    "Unable to send SOS"
  );
}

export interface SafetyAudioUploadResult {
  url?: string;
  audio_url?: string;
  message?: string;
}

/** Upload ride-safety audio (data URL) to backend S3 storage. */
export function uploadSafetyAudio(audioDataUrl: string): Promise<SafetyAudioUploadResult> {
  return authFetch<SafetyAudioUploadResult>(
    "/safety-audio",
    {
      method: "POST",
      body: JSON.stringify({ audio: audioDataUrl }),
    },
    "Unable to upload safety audio",
  );
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unable to read audio recording"));
    };
    reader.onerror = () => reject(new Error("Unable to read audio recording"));
    reader.readAsDataURL(blob);
  });
}

export async function getCurrentCoords(timeoutMs = 4000): Promise<{
  lat?: number;
  lng?: number;
}> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return {};
  }
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: timeoutMs,
      });
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return {};
  }
}

export interface RideChatMessage {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
  sender_id?: string;
}

export function listRideMessages(rideId: string): Promise<RideChatMessage[]> {
  return authFetch<{ success?: boolean; data?: RideChatMessage[] } | RideChatMessage[]>(
    `/ride/${rideId}/messages`,
    undefined,
    "Unable to load chat"
  ).then((res) => {
    if (Array.isArray(res)) return res;
    return res.data ?? [];
  });
}

export function sendRideMessage(rideId: string, message: string): Promise<RideChatMessage> {
  return authFetch<{ success?: boolean; data?: RideChatMessage } | RideChatMessage>(
    `/ride/${rideId}/messages`,
    { method: "POST", body: JSON.stringify({ message }) },
    "Unable to send message"
  ).then((res) => {
    if (res && typeof res === "object" && "data" in res && res.data) return res.data;
    return res as RideChatMessage;
  });
}

export function buildLiveRideShareText(ride: Ride, etaMinutes?: number | null): string {
  const driver = (ride.driver?.name ?? "Captain").trim();
  const vehicle = (ride.vehicle_number ?? ride.driver?.vehicle_number ?? "—").trim();
  const lat = ride.driver_lat ?? ride.pickup_lat;
  const lng = ride.driver_lng ?? ride.pickup_lng;
  const maps =
    lat != null && lng != null ? `https://www.google.com/maps?q=${lat},${lng}` : null;
  const eta = etaMinutes != null ? `${etaMinutes} min` : "Updating…";
  const rideRef = ride.public_id?.trim() || ride.id;

  return [
    "BW Rides — Live Trip Share",
    `Driver: ${driver}`,
    `Vehicle: ${vehicle}`,
    `Destination: ${ride.dropoff_address}`,
    `ETA: ${eta}`,
    ...(maps ? [`Live location: ${maps}`] : []),
    `Ride: ${rideRef}`,
  ].join("\n");
}

/** Nearby-driver ETA must come from a live endpoint — do not invent values. */
export function getNearbyDrivers(): Promise<{ count: number; eta_minutes: number }> {
  return Promise.reject(
    new Error("Nearby driver ETA is not available from the server yet."),
  );
}
