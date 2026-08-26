import {
  isDriverAssigned,
  isRideTerminal,
  isSearchingForCaptain,
  type Ride,
} from "@/lib/ride-api";

const ACK_PREFIX = "bw_no_captain_ack_";
const RECENT_MS = 45 * 60 * 1000;

const USER_CANCEL_REASONS = [
  "user cancelled",
  "user canceled",
  "changed my mind",
  "captain is taking too long",
  "booked by mistake",
  "found another ride",
];

export function hasCaptainAssigned(ride: Pick<Ride, "status" | "driver" | "driver_id">): boolean {
  if (isDriverAssigned(ride.status)) return true;
  if (ride.driver_id?.trim()) return true;
  const driver = ride.driver;
  if (driver && (driver.id || driver.name || driver.phone || driver.vehicle_number)) {
    return true;
  }
  return false;
}

function isRecentRide(ride: Pick<Ride, "created_at">): boolean {
  const at = new Date(ride.created_at).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at <= RECENT_MS;
}

function explicitPartyCancel(ride: Pick<Ride, "cancelled_reason" | "cancelled_by" | "message">): boolean {
  const by = (ride.cancelled_by ?? "").toLowerCase();
  if (/(user|rider|customer|captain|driver|admin)/.test(by)) return true;

  const text = `${ride.cancelled_reason ?? ""} ${ride.message ?? ""}`.toLowerCase();
  if (!text.trim()) return false;
  if (USER_CANCEL_REASONS.some((reason) => text.includes(reason))) return true;
  if (/\b(admin|captain|driver)\b.*\bcancel/.test(text)) return true;
  if (text.includes("cancelled by user") || text.includes("canceled by user")) return true;
  if (text.includes("cancelled by captain") || text.includes("canceled by driver")) return true;
  return false;
}

function looksLikeNoCaptainReason(ride: Pick<Ride, "cancelled_reason" | "message" | "status">): boolean {
  const key = ride.status.toUpperCase().replace(/[\s-]+/g, "_");
  if (key === "EXPIRED" || key === "FAILED" || key.includes("TIMEOUT")) return true;

  const text = `${ride.cancelled_reason ?? ""} ${ride.message ?? ""}`.toLowerCase();
  // Blank reasons are ambiguous (user cancel may omit text) — do not treat as no-captain.
  if (!text.trim()) return false;
  return (
    /no (driver|captain|rider)|not assigned|unassigned|unavailable|timed? ?out|no one accepted|auto.?cancel|system cancel|search (ended|expired|timeout)/.test(
      text,
    )
  );
}

/** Backend closed the trip before a captain was assigned (not a user/captain/admin cancel). */
export function isNoCaptainAssignmentCancel(ride: Ride): boolean {
  if (!isRideTerminal(ride.status)) return false;
  if (hasCaptainAssigned(ride)) return false;
  if (!isRecentRide(ride)) return false;
  if (explicitPartyCancel(ride)) return false;
  return looksLikeNoCaptainReason(ride);
}

export function shouldWatchForCaptain(ride: Ride): boolean {
  if (!isRecentRide(ride)) return false;
  if (hasCaptainAssigned(ride)) return false;
  return isSearchingForCaptain(ride.status) || isNoCaptainAssignmentCancel(ride);
}

export function hasAckedNoCaptainPrompt(rideId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(`${ACK_PREFIX}${rideId}`) === "1";
}

export function ackNoCaptainPrompt(rideId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${ACK_PREFIX}${rideId}`, "1");
}
