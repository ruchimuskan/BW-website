import { estimateRideFares } from "@/lib/ride-api";
import { getHomeDashboard, getVehicleCategories } from "@/lib/home-api";
import type { LocationCoords } from "@/lib/location-search";
import type { TripStop } from "@/lib/trip-stops";

export type SchedulePreview = {
  scheduledAt: string;
  nearbyDriversCount: number | null;
  vehicleCount: number | null;
  sampleFareMin: number | null;
  sampleFareMax: number | null;
  distanceKm: number | null;
  durationMin: number | null;
  source: "estimate" | "dashboard" | "vehicles";
};

/**
 * Fetch schedule-aware availability / fare preview from the backend.
 * Uses /rides/estimate when route coords exist; otherwise dashboard + vehicle catalog.
 */
export async function fetchSchedulePreview(options: {
  scheduledAt: string;
  coords?: LocationCoords;
  stops?: TripStop[];
  serviceGroup?: "ride" | "rental";
}): Promise<SchedulePreview> {
  const { scheduledAt, coords, stops, serviceGroup = "ride" } = options;
  const hasRoute =
    coords?.pickupLat != null &&
    coords?.pickupLng != null &&
    coords?.dropoffLat != null &&
    coords?.dropoffLng != null;

  if (hasRoute) {
    try {
      const estimate = await estimateRideFares({
        pickup_lat: coords!.pickupLat!,
        pickup_lng: coords!.pickupLng!,
        dropoff_lat: coords!.dropoffLat!,
        dropoff_lng: coords!.dropoffLng!,
        service_group: serviceGroup,
        stops,
      });
      const fares = Object.values(estimate.quotes)
        .map((q) => q.estimated_fare)
        .filter((n) => typeof n === "number" && n > 0);
      const dashboard = await getHomeDashboard().catch(() => null);

      return {
        scheduledAt,
        nearbyDriversCount: dashboard?.nearby_drivers_count ?? null,
        vehicleCount: fares.length || Object.keys(estimate.quotes).length,
        sampleFareMin: fares.length ? Math.min(...fares) : null,
        sampleFareMax: fares.length ? Math.max(...fares) : null,
        distanceKm: estimate.distance_km ?? null,
        durationMin: estimate.duration_min ?? null,
        source: "estimate",
      };
    } catch {
      // fall through to dashboard
    }
  }

  const [dashboard, vehicles] = await Promise.all([
    getHomeDashboard().catch(() => null),
    getVehicleCategories(serviceGroup).catch(() => []),
  ]);

  return {
    scheduledAt,
    nearbyDriversCount: dashboard?.nearby_drivers_count ?? null,
    vehicleCount: vehicles.length || dashboard?.vehicle_categories?.length || null,
    sampleFareMin: null,
    sampleFareMax: null,
    distanceKm: null,
    durationMin: null,
    source: dashboard ? "dashboard" : "vehicles",
  };
}

export function formatScheduleLabel(iso: string | null | undefined, nowLabel = "Leave now") {
  if (!iso) return nowLabel;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return nowLabel;

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today · ${time}`;

  const day = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${day} · ${time}`;
}

export function combineDateAndTime(date: Date, hours24: number, minutes: number) {
  const next = new Date(date);
  next.setHours(hours24, minutes, 0, 0);
  return next;
}

export function toLocalInputParts(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isPm = hours >= 12;
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return { hours12, minutes, isPm };
}

export function hours12To24(hours12: number, isPm: boolean) {
  const h = ((hours12 % 12) + 12) % 12;
  if (isPm) return h === 12 ? 12 : h + 12;
  return h === 12 ? 0 : h;
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addMonths(d: Date, delta: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
}
