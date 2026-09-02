import type { LandingBookingTab } from "@/constants/services";

export const LANDING_BOOKING_DRAFT_KEY = "bw_landing_booking_draft_v1";

export interface LandingBookingDraft {
  pickup: string;
  dropoff: string;
  tab: LandingBookingTab;
  scheduledAt: string | null;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  updatedAt: string;
}

export function saveLandingBookingDraft(
  draft: Omit<LandingBookingDraft, "updatedAt">,
): void {
  if (typeof window === "undefined") return;
  const payload: LandingBookingDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(LANDING_BOOKING_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Quota or private mode — non-fatal.
  }
}

export function readLandingBookingDraft(): LandingBookingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(LANDING_BOOKING_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LandingBookingDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLandingBookingDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LANDING_BOOKING_DRAFT_KEY);
}
