import type { RideVehicleId } from "@/data/ride-options";
import { RIDE_VEHICLE_IDS } from "@/data/ride-options";
import { ROUTES } from "@/constants/routes";
import type { PaymentMethod } from "@/lib/ride-api";
import {
  parseStopsFromParams,
  writeStopsToParams,
  type TripStop,
} from "@/lib/trip-stops";

export interface TripLocationParams {
  pickup: string;
  dropoff: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  distanceKm?: number;
  durationMin?: number;
  payment?: PaymentMethod;
  tab?: string;
  vehicle?: string;
  categoryId?: string;
  preferWomenRiders?: boolean;
  stops?: TripStop[];
  promoCode?: string;
  scheduledAt?: string;
  notes?: string;
}

function setCoordParams(
  params: URLSearchParams,
  trip: Omit<
    TripLocationParams,
    "pickup" | "dropoff" | "tab" | "vehicle" | "categoryId" | "preferWomenRiders" | "payment" | "stops"
  >
) {
  if (trip.pickupLat != null) params.set("plat", String(trip.pickupLat));
  if (trip.pickupLng != null) params.set("plng", String(trip.pickupLng));
  if (trip.dropoffLat != null) params.set("dlat", String(trip.dropoffLat));
  if (trip.dropoffLng != null) params.set("dlng", String(trip.dropoffLng));
  if (trip.distanceKm != null) params.set("distance_km", String(trip.distanceKm));
  if (trip.durationMin != null) params.set("duration_min", String(trip.durationMin));
}

function applyExtras(
  params: URLSearchParams,
  extras?: Omit<TripLocationParams, "pickup" | "dropoff" | "tab" | "vehicle">
) {
  if (!extras) return;
  setCoordParams(params, extras);
  if (extras.payment) params.set("payment", extras.payment);
  if (extras.categoryId) params.set("categoryId", extras.categoryId);
  if (extras.preferWomenRiders) params.set("preferWomen", "1");
  if (extras.stops) writeStopsToParams(params, extras.stops);
  if (extras.promoCode) params.set("promo", extras.promoCode);
  if (extras.scheduledAt) params.set("scheduled_at", extras.scheduledAt);
  if (extras.notes) params.set("notes", extras.notes);
}

export function parseTripCoords(searchParams: {
  get(name: string): string | null;
}): {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  distanceKm?: number;
  durationMin?: number;
  payment?: PaymentMethod;
  stops: TripStop[];
} {
  const num = (key: string) => {
    const raw = searchParams.get(key);
    if (raw == null || raw === "") return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  };

  const paymentRaw = searchParams.get("payment");
  const payment =
    paymentRaw === "CASH" || paymentRaw === "UPI" || paymentRaw === "WALLET" || paymentRaw === "CARD"
      ? paymentRaw
      : undefined;

  return {
    pickupLat: num("plat"),
    pickupLng: num("plng"),
    dropoffLat: num("dlat"),
    dropoffLng: num("dlng"),
    distanceKm: num("distance_km"),
    durationMin: num("duration_min"),
    payment,
    stops: parseStopsFromParams(searchParams),
  };
}

export function buildRideQueryParams(
  pickup: string,
  dropoff: string,
  vehicle: string,
  tab = "rides",
  extras?: Omit<TripLocationParams, "pickup" | "dropoff" | "tab" | "vehicle">
) {
  const params = new URLSearchParams({ pickup, dropoff, vehicle, tab });
  applyExtras(params, extras);
  return params;
}

export function buildBookUrl(
  pickup: string,
  dropoff: string,
  tab = "rides",
  vehicle?: string,
  extras?: Omit<TripLocationParams, "pickup" | "dropoff" | "tab" | "vehicle">
) {
  const params = new URLSearchParams({ pickup, dropoff, tab });
  if (vehicle) params.set("vehicle", vehicle);
  if (extras) {
    setCoordParams(params, extras);
    if (extras.payment) params.set("payment", extras.payment);
    if (extras.categoryId) params.set("category", extras.categoryId);
    if (extras.stops) writeStopsToParams(params, extras.stops);
    if (extras.promoCode) params.set("promo", extras.promoCode);
    if (extras.scheduledAt) params.set("scheduled_at", extras.scheduledAt);
    if (extras.notes) params.set("notes", extras.notes);
  }
  return `${ROUTES.book}?${params.toString()}`;
}

export function buildSearchingUrl(
  pickup: string,
  dropoff: string,
  vehicle: string,
  tab = "rides",
  categoryId?: string,
  preferWomenRiders = false,
  extras?: Omit<
    TripLocationParams,
    "pickup" | "dropoff" | "tab" | "vehicle" | "categoryId" | "preferWomenRiders"
  >
) {
  const params = buildRideQueryParams(pickup, dropoff, vehicle, tab, {
    ...extras,
    categoryId,
    preferWomenRiders,
  });
  return `${ROUTES.bookSearching}?${params.toString()}`;
}

export function buildTrackingUrl(
  pickup: string,
  dropoff: string,
  vehicle: RideVehicleId,
  tab = "rides",
  rideId?: string
) {
  const params = new URLSearchParams({ vehicle, tab });
  if (pickup && pickup !== "undefined" && pickup !== "null") {
    params.set("pickup", pickup);
  }
  if (dropoff && dropoff !== "undefined" && dropoff !== "null") {
    params.set("dropoff", dropoff);
  }
  if (rideId) params.set("rideId", rideId);
  return `${ROUTES.bookTracking}?${params.toString()}`;
}

export function buildBookingDetailUrl(
  rideId: string,
  toast?: "scheduled" | "booked",
) {
  const params = new URLSearchParams({ id: rideId });
  if (toast) params.set("toast", toast);
  return `${ROUTES.bookingDetail}?${params.toString()}`;
}

export function buildBookingsListUrl(toast?: "scheduled" | "booked") {
  if (!toast) return ROUTES.bookings;
  return `${ROUTES.bookings}?toast=${toast}`;
}

export function formatFare(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function isRideVehicleId(value: string | null): value is RideVehicleId {
  return value !== null && RIDE_VEHICLE_IDS.includes(value as RideVehicleId);
}

const DELHI_LAT = 28.6328;
const DELHI_LNG = 77.216721;

/** Rejects 0,0 / NaN / out-of-range values that make Google Maps show a world view. */
export function isValidLatLng(
  lat?: number | null,
  lng?: number | null,
): lat is number {
  if (lat == null || lng == null) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (Math.abs(lat) < 0.05 && Math.abs(lng) < 0.05) return false;
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function almostSamePoint(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
  epsilon = 0.0006,
) {
  return Math.abs(aLat - bLat) < epsilon && Math.abs(aLng - bLng) < epsilon;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

function zoomForKm(km: number) {
  if (km < 0.6) return 16;
  if (km < 1.5) return 15;
  if (km < 4) return 14;
  if (km < 10) return 13;
  if (km < 25) return 12;
  if (km < 60) return 11;
  return 10;
}

function googlePinUrl(lat: number, lng: number, zoom: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=${zoom}&hl=en&t=m&output=embed`;
}

/**
 * Street-level Google embed. The old saddr/daddr directions iframe zooms to
 * continents when pickup ≈ dropoff or coords are invalid.
 */
export function mapEmbedUrl(
  pickupLat?: number | null,
  pickupLng?: number | null,
  dropoffLat?: number | null,
  dropoffLng?: number | null,
) {
  const pickupOk =
    typeof pickupLat === "number" &&
    typeof pickupLng === "number" &&
    isValidLatLng(pickupLat, pickupLng);
  const dropoffOk =
    typeof dropoffLat === "number" &&
    typeof dropoffLng === "number" &&
    isValidLatLng(dropoffLat, dropoffLng);

  if (
    pickupOk &&
    dropoffOk &&
    !almostSamePoint(pickupLat, pickupLng, dropoffLat, dropoffLng)
  ) {
    const midLat = (pickupLat + dropoffLat) / 2;
    const midLng = (pickupLng + dropoffLng) / 2;
    const zoom = zoomForKm(haversineKm(pickupLat, pickupLng, dropoffLat, dropoffLng));
    // Pin the corridor — saddr/daddr embeds often fall back to a world/continents view.
    return googlePinUrl(midLat, midLng, zoom);
  }

  if (pickupOk) return googlePinUrl(pickupLat, pickupLng, 16);
  if (dropoffOk) return googlePinUrl(dropoffLat, dropoffLng, 16);
  return googlePinUrl(DELHI_LAT, DELHI_LNG, 13);
}
