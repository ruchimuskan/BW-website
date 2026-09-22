"use client";

import { listCoupons, type RideCoupon } from "@/lib/coupons-api";
import { getRideHistory } from "@/lib/ride-api";

/** First N completed trips can be free when the backend offer is active. */
export const FIRST_FREE_RIDES = 5;
/** Free only for trips at or under this distance (km). */
export const FREE_RIDE_MAX_KM = 5;

export type FreeRideEligibility = {
  enabled: boolean;
  total: number;
  remaining: number;
  maxKm: number;
  completedRides: number;
  coupon: RideCoupon | null;
  message: string;
};

function couponText(coupon: RideCoupon): string {
  return `${coupon.code} ${coupon.title} ${coupon.description ?? ""}`.toLowerCase();
}

function isPercentageCoupon(coupon: RideCoupon): boolean {
  const t = (coupon.discount_type || "").trim().toLowerCase();
  return t === "percentage" || t === "percent";
}

function couponMaxKm(coupon: RideCoupon | null | undefined): number {
  const raw = Number(
    coupon?.max_distance_km ?? coupon?.max_km ?? coupon?.free_ride_km ?? NaN,
  );
  if (Number.isFinite(raw) && raw > 0) return raw;
  return FREE_RIDE_MAX_KM;
}

/** Detect welcome / first-rides / 100% off offers from the coupons API. */
export function isFreeRideCoupon(coupon: RideCoupon): boolean {
  const text = couponText(coupon);
  if (
    /first\s*5|5\s*(free|rides)|free\s*ride|welcome\s*ride|complimentary|under\s*5\s*km|upto\s*5\s*km|up to\s*5\s*km/.test(
      text,
    )
  ) {
    return true;
  }
  const value = Number(coupon.discount_value ?? coupon.discount_percent ?? 0);
  if (isPercentageCoupon(coupon) && value >= 100) return true;
  if (
    coupon.per_user_limit === FIRST_FREE_RIDES &&
    isPercentageCoupon(coupon) &&
    value >= 99
  ) {
    return true;
  }
  return false;
}

export function pickFreeRideCoupon(coupons: RideCoupon[]): RideCoupon | null {
  const matches = coupons.filter(isFreeRideCoupon);
  if (matches.length === 0) return null;
  return (
    matches.find((c) => /first\s*5|5\s*free|5\s*km/.test(couponText(c))) ??
    matches.sort((a, b) => {
      const av = Number(a.discount_value ?? a.discount_percent ?? 0);
      const bv = Number(b.discount_value ?? b.discount_percent ?? 0);
      return bv - av;
    })[0] ??
    null
  );
}

/** Trip qualifies for a free ride only when distance is within the free-km cap. */
export function isTripEligibleForFreeRide(
  distanceKm: number | null | undefined,
  maxKm: number = FREE_RIDE_MAX_KM,
): boolean {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return false;
  if (distanceKm <= 0) return false;
  return distanceKm <= maxKm + 0.01;
}

/**
 * Resolve free-ride eligibility from backend coupons + ride history.
 * Prices always come from `/rides/estimate`; free apply uses `/coupons/validate`
 * with `distance_km` so the backend stores usage correctly.
 */
export async function fetchFreeRideEligibility(): Promise<FreeRideEligibility> {
  const [couponsResult, historyResult] = await Promise.allSettled([
    listCoupons(),
    getRideHistory(1, 1),
  ]);

  const coupons =
    couponsResult.status === "fulfilled" ? couponsResult.value : [];
  const completedRides =
    historyResult.status === "fulfilled"
      ? Math.max(0, Number(historyResult.value.total) || 0)
      : 0;

  const coupon = pickFreeRideCoupon(coupons);
  const maxKm = couponMaxKm(coupon);
  const total =
    Number(coupon?.per_user_limit) > 0
      ? Number(coupon?.per_user_limit)
      : FIRST_FREE_RIDES;
  const remaining = Math.max(0, total - completedRides);
  const enabled =
    remaining > 0 && (coupon != null || completedRides < FIRST_FREE_RIDES);

  const message = enabled
    ? remaining === total
      ? `First ${total} rides free (up to ${maxKm} km)`
      : `${remaining} of ${total} free rides left (up to ${maxKm} km)`
    : "";

  return {
    enabled,
    total,
    remaining,
    maxKm,
    completedRides,
    coupon,
    message,
  };
}
