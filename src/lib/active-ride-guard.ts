import type { RideVehicleId } from "@/data/ride-options";
import {
  buildBookingDetailUrl,
  buildSearchingUrl,
  buildTrackingUrl,
} from "@/lib/ride-booking";
import {
  getActiveRide,
  isDeliveryRide,
  isDriverAssigned,
  isRideInProgress,
  isRideTerminal,
  isSearchingForCaptain,
  type Ride,
} from "@/lib/ride-api";

export class ActiveRideBlockError extends Error {
  readonly ride: Ride;

  constructor(message: string, ride: Ride) {
    super(message);
    this.name = "ActiveRideBlockError";
    this.ride = ride;
  }
}

export function isRideBlocking(status: string | null | undefined): boolean {
  if (!status || isRideTerminal(status)) return false;
  const upper = status.toUpperCase();
  // Scheduled-only trips should not block a new now-booking.
  if (upper.includes("SCHEDULE")) return false;
  return isRideInProgress(status) || upper === "UPCOMING";
}

export function formatActiveRideStatus(ride: {
  status: string;
  scheduled_at?: string | null;
}): string {
  const upper = ride.status.toUpperCase();
  if (upper === "CANCELLED" || upper === "CANCELED") return "Cancelled";
  if (upper === "COMPLETED") return "Completed";
  if (ride.scheduled_at || upper.includes("SCHEDULE")) return "Scheduled";
  if (["SEARCHING", "REQUESTED", "PENDING"].includes(upper)) {
    return "Finding captain";
  }
  if (isDriverAssigned(ride.status)) return "Captain assigned";
  if (isRideInProgress(ride.status)) return "In progress";
  if (upper === "UPCOMING") return "Upcoming";
  return ride.status.replace(/_/g, " ");
}

export function vehicleIdFromRide(ride: {
  vehicle_type_name?: string | null;
  booking_purpose?: string | null;
  is_emergency?: boolean | null;
}): RideVehicleId {
  const key = `${ride.vehicle_type_name ?? ""} ${ride.booking_purpose ?? ""}`.toLowerCase();
  if (key.includes("bike")) return "bike";
  if (key.includes("auto")) return "auto";
  if (key.includes("parcel") || key.includes("delivery")) return "parcel";
  if (key.includes("ambulance") || ride.is_emergency) return "ambulance";
  if (key.includes("cab") || key.includes("car") || key.includes("sedan")) return "cab";
  return "cab";
}

function tabFromRide(ride: {
  is_emergency?: boolean | null;
  ride_type?: string | null;
  booking_purpose?: string | null;
  vehicle_type_name?: string | null;
}): string {
  if (ride.is_emergency || ride.ride_type === "EMERGENCY") return "ambulance";
  if (isDeliveryRide(ride)) return "parcel";
  return "rides";
}

/** Deep-link to captain search / live tracking when possible; otherwise booking detail. */
export function buildActiveRideViewUrl(ride: {
  id: string;
  status: string;
  pickup_address?: string | null;
  dropoff_address?: string | null;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
  vehicle_type_name?: string | null;
  booking_purpose?: string | null;
  is_emergency?: boolean | null;
  ride_type?: string | null;
  scheduled_at?: string | null;
}): string {
  const pickup = ride.pickup_address || "";
  const dropoff = ride.dropoff_address || "";
  const vehicle = vehicleIdFromRide(ride);
  const tab = tabFromRide(ride);
  const coords = {
    pickupLat: ride.pickup_lat ?? undefined,
    pickupLng: ride.pickup_lng ?? undefined,
    dropoffLat: ride.dropoff_lat ?? undefined,
    dropoffLng: ride.dropoff_lng ?? undefined,
    rideId: ride.id,
  };

  if (isSearchingForCaptain(ride.status)) {
    return buildSearchingUrl(pickup, dropoff, vehicle, tab, undefined, false, coords);
  }

  if (isDriverAssigned(ride.status) || isRideInProgress(ride.status)) {
    return buildTrackingUrl(pickup, dropoff, vehicle, tab, ride.id);
  }

  return buildBookingDetailUrl(ride.id);
}

export function activeRideBlockMessage(ride: Ride): string {
  const status = formatActiveRideStatus(ride).toLowerCase();
  return `You already have a ride that is ${status}. Complete it or cancel it before booking another trip.`;
}

export async function getBlockingActiveRide(
  ignoreRideId?: string,
): Promise<Ride | null> {
  const active = await getActiveRide();
  if (!active) return null;
  if (ignoreRideId && active.id === ignoreRideId) return null;
  if (!isRideBlocking(active.status)) return null;
  return active;
}

export async function assertNoBlockingActiveRide(
  ignoreRideId?: string,
): Promise<void> {
  const active = await getBlockingActiveRide(ignoreRideId);
  if (active) {
    throw new ActiveRideBlockError(activeRideBlockMessage(active), active);
  }
}
