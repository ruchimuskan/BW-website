import type { LandingBookingTab } from "@/constants/services";

/** Durable draft — survives full page refresh (localStorage). */
export const LANDING_BOOKING_DRAFT_KEY = "bw_landing_booking_draft_v3";
const LEGACY_DRAFT_KEYS = [
  "bw_landing_booking_draft_v2",
  "bw_landing_booking_draft_v1",
] as const;

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

function isFutureIso(iso: string | null | undefined): iso is string {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t > Date.now() - 60_000;
}

/** Drop past schedule times so the UI never shows a stale Reschedule label. */
export function normalizeScheduledAt(iso: string | null | undefined): string | null {
  return isFutureIso(iso) ? iso : null;
}

function readRaw(key: string): LandingBookingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LandingBookingDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...parsed,
      scheduledAt: normalizeScheduledAt(parsed.scheduledAt),
    };
  } catch {
    return null;
  }
}

export function saveLandingBookingDraft(
  draft: Omit<LandingBookingDraft, "updatedAt">,
): void {
  if (typeof window === "undefined") return;
  const payload: LandingBookingDraft = {
    ...draft,
    // Never keep a schedule in draft unless the caller explicitly set one
    // (landing only persists schedule when URL/user has confirmed it).
    scheduledAt: normalizeScheduledAt(draft.scheduledAt),
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(LANDING_BOOKING_DRAFT_KEY, JSON.stringify(payload));
    window.sessionStorage.setItem(LANDING_BOOKING_DRAFT_KEY, JSON.stringify(payload));
    for (const key of LEGACY_DRAFT_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Quota or private mode — non-fatal.
  }
}

export function readLandingBookingDraft(): LandingBookingDraft | null {
  const current = readRaw(LANDING_BOOKING_DRAFT_KEY);
  if (current) return current;
  for (const key of LEGACY_DRAFT_KEYS) {
    const legacy = readRaw(key);
    if (legacy) {
      // Migrate pickup/drop/tab only — drop stale schedule from older drafts.
      return { ...legacy, scheduledAt: null };
    }
  }
  return null;
}

export function clearLandingBookingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LANDING_BOOKING_DRAFT_KEY);
    window.sessionStorage.removeItem(LANDING_BOOKING_DRAFT_KEY);
    for (const key of LEGACY_DRAFT_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

/** Patch only schedule without clobbering pickup/dropoff. */
export function patchLandingBookingSchedule(scheduledAt: string | null): void {
  const existing = readLandingBookingDraft();
  saveLandingBookingDraft({
    pickup: existing?.pickup ?? "",
    dropoff: existing?.dropoff ?? "",
    tab: existing?.tab ?? "rides",
    scheduledAt: normalizeScheduledAt(scheduledAt),
    pickupLat: existing?.pickupLat,
    pickupLng: existing?.pickupLng,
    dropoffLat: existing?.dropoffLat,
    dropoffLng: existing?.dropoffLng,
  });
}

/**
 * Keep `scheduled_at` in the address bar so refresh / share / back restore the choice.
 */
export function syncScheduledAtQuery(iso: string | null, hash = "#book"): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (iso) url.searchParams.set("scheduled_at", iso);
    else url.searchParams.delete("scheduled_at");
    if (hash && !url.hash) url.hash = hash;
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch {
    // ignore
  }
}
