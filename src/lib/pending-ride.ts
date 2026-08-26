import type { PaymentMethod } from "@/lib/ride-api";
import type { TripStop } from "@/lib/trip-stops";

export const PENDING_RIDE_STORAGE_KEY = "bw_pending_ride_v1";

export interface PendingRidePayload {
  pickup_address: string;
  dropoff_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_category_id: string;
  prefer_women_riders: boolean;
  women_safety_enabled: boolean;
  payment_method: PaymentMethod;
  distance_km?: number;
  duration_min?: number;
  stops?: TripStop[];
  promo_code?: string;
  scheduled_at?: string;
  notes?: string;
  toast: "scheduled" | "booked";
}

export function savePendingRide(payload: PendingRidePayload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_RIDE_STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingRide(): PendingRidePayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_RIDE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRidePayload;
  } catch {
    return null;
  }
}

export function clearPendingRide() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_RIDE_STORAGE_KEY);
}
