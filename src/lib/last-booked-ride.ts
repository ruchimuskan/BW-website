import type { Ride } from "@/lib/ride-api";

const LAST_BOOKED_RIDE_KEY = "bw_last_booked_ride_v1";

export function saveLastBookedRide(ride: Ride) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LAST_BOOKED_RIDE_KEY, JSON.stringify(ride));
}

export function readLastBookedRide(): Ride | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(LAST_BOOKED_RIDE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Ride;
  } catch {
    return null;
  }
}

export function clearLastBookedRide() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LAST_BOOKED_RIDE_KEY);
}
