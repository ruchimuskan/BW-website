import { ROUTES } from "@/constants/routes";
import {
  getActiveRide,
  isDriverAssigned,
  isRideInProgress,
  isRideTerminal,
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

export function buildActiveRideViewUrl(ride: Ride): string {
  return `${ROUTES.bookings}?highlight=${encodeURIComponent(ride.id)}`;
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
