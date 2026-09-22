import { authFetch } from "@/lib/api";

export interface RideCoupon {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discount_type?: string;
  discount_value?: number;
  discount_percent?: number | null;
  max_discount?: number | null;
  min_order_amount?: number;
  vehicle_type_ids?: string[];
  per_user_limit?: number;
  /** Max trip distance (km) for free / welcome rides — from backend when present. */
  max_distance_km?: number | null;
  max_km?: number | null;
  free_ride_km?: number | null;
}

export interface AppliedCoupon {
  coupon: RideCoupon;
  discount_amount: number;
  final_amount: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeCoupon(raw: unknown): RideCoupon | null {
  const row = asRecord(raw);
  if (!row) return null;
  const code = String(row.code ?? row.coupon_code ?? "").trim();
  const id = String(row.id ?? code).trim();
  const title = String(row.title ?? row.name ?? code).trim();
  if (!id || !code) return null;

  const vehicleIds = Array.isArray(row.vehicle_type_ids)
    ? row.vehicle_type_ids.map((v) => String(v))
    : Array.isArray(row.vehicle_types)
      ? row.vehicle_types.map((v) => String(v))
      : undefined;

  return {
    id,
    code,
    title: title || code,
    description: typeof row.description === "string" ? row.description : null,
    discount_type:
      typeof row.discount_type === "string" ? row.discount_type : undefined,
    discount_value: toNum(row.discount_value) ?? undefined,
    discount_percent: toNum(row.discount_percent),
    max_discount: toNum(row.max_discount),
    min_order_amount: toNum(row.min_order_amount) ?? undefined,
    vehicle_type_ids: vehicleIds,
    per_user_limit: toNum(row.per_user_limit) ?? undefined,
    max_distance_km: toNum(
      row.max_distance_km ?? row.max_km ?? row.free_ride_km,
    ),
    max_km: toNum(row.max_km),
    free_ride_km: toNum(row.free_ride_km),
  };
}

function unwrapCouponList(res: unknown): RideCoupon[] {
  if (Array.isArray(res)) {
    return res.map(normalizeCoupon).filter(Boolean) as RideCoupon[];
  }
  const record = asRecord(res);
  if (!record) return [];
  const nested =
    record.items ??
    record.data ??
    record.coupons ??
    (asRecord(record.data)?.items as unknown);
  if (!Array.isArray(nested)) return [];
  return nested.map(normalizeCoupon).filter(Boolean) as RideCoupon[];
}

export function listCoupons(): Promise<RideCoupon[]> {
  return authFetch<unknown>("/coupons", undefined, "Unable to load offers").then(
    unwrapCouponList,
  );
}

export function validateCoupon(
  code: string,
  orderAmount: number,
  vehicleTypeId?: string,
  distanceKm?: number | null,
): Promise<AppliedCoupon> {
  const amount = Math.max(0.01, Number(orderAmount) || 0.01);
  return authFetch<AppliedCoupon>(
    "/coupons/validate",
    {
      method: "POST",
      body: JSON.stringify({
        code,
        order_amount: amount,
        ...(vehicleTypeId ? { vehicle_type_id: vehicleTypeId } : {}),
        ...(distanceKm != null && Number.isFinite(distanceKm)
          ? { distance_km: distanceKm }
          : {}),
      }),
    },
    "Unable to apply coupon",
  );
}

function isPercentageCoupon(coupon: RideCoupon): boolean {
  const t = (coupon.discount_type || "").trim().toLowerCase();
  return t === "percentage" || t === "percent";
}

function looksLikeFreeRideCoupon(coupon: RideCoupon): boolean {
  const text =
    `${coupon.code} ${coupon.title} ${coupon.description ?? ""}`.toLowerCase();
  if (
    /first\s*5|5\s*(free|rides)|free\s*ride|welcome\s*ride|complimentary|5\s*km/.test(
      text,
    )
  ) {
    return true;
  }
  const value = Number(coupon.discount_value ?? coupon.discount_percent ?? 0);
  return isPercentageCoupon(coupon) && value >= 100;
}

function couponDistanceCap(coupon: RideCoupon): number | null {
  const cap = Number(
    coupon.max_distance_km ?? coupon.max_km ?? coupon.free_ride_km ?? NaN,
  );
  if (Number.isFinite(cap) && cap > 0) return cap;
  if (looksLikeFreeRideCoupon(coupon)) return 5;
  return null;
}

function withinDistanceCap(
  distanceKm: number | null | undefined,
  maxKm: number,
): boolean {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm <= 0) {
    return false;
  }
  return distanceKm <= maxKm + 0.01;
}

export function couponAppliesToVehicle(
  coupon: RideCoupon,
  vehicleTypeId?: string,
): boolean {
  const ids = coupon.vehicle_type_ids || [];
  if (ids.length === 0) return true;
  if (!vehicleTypeId) return false;
  return ids.includes(vehicleTypeId);
}

/** Client-side discount for any vehicle fare (%, flat, or 100% free). */
export function couponDiscountForAmount(
  coupon: RideCoupon,
  orderAmount: number,
  distanceKm?: number | null,
): number {
  if (orderAmount <= 0) return 0;
  const minOrder = Number(coupon.min_order_amount ?? 0);
  if (orderAmount < minOrder) return 0;

  const cap = couponDistanceCap(coupon);
  if (cap != null && !withinDistanceCap(distanceKm, cap)) {
    return 0;
  }

  const value = Number(coupon.discount_value ?? coupon.discount_percent ?? 0);
  let discount = 0;
  if (isPercentageCoupon(coupon)) {
    discount = orderAmount * (value / 100);
    if (coupon.max_discount != null && coupon.max_discount !== undefined) {
      discount = Math.min(discount, Number(coupon.max_discount));
    }
  } else {
    discount = value;
  }

  return Math.max(0, Math.min(discount, orderAmount));
}

export function couponFinalAmount(
  coupon: RideCoupon,
  orderAmount: number,
  vehicleTypeId?: string,
  distanceKm?: number | null,
): number {
  if (!couponAppliesToVehicle(coupon, vehicleTypeId)) return orderAmount;
  return Math.max(
    0,
    orderAmount - couponDiscountForAmount(coupon, orderAmount, distanceKm),
  );
}
