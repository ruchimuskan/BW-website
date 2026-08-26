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
}

export interface AppliedCoupon {
  coupon: RideCoupon;
  discount_amount: number;
  final_amount: number;
}

export function listCoupons(): Promise<RideCoupon[]> {
  return authFetch<RideCoupon[] | { items?: RideCoupon[]; data?: RideCoupon[] }>(
    "/coupons",
    undefined,
    "Unable to load offers"
  ).then((res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  });
}

export function validateCoupon(
  code: string,
  orderAmount: number,
  vehicleTypeId?: string,
): Promise<AppliedCoupon> {
  return authFetch<AppliedCoupon>(
    "/coupons/validate",
    {
      method: "POST",
      body: JSON.stringify({
        code,
        order_amount: orderAmount,
        ...(vehicleTypeId ? { vehicle_type_id: vehicleTypeId } : {}),
      }),
    },
    "Unable to apply coupon"
  );
}

function isPercentageCoupon(coupon: RideCoupon): boolean {
  const t = (coupon.discount_type || "").trim().toLowerCase();
  return t === "percentage" || t === "percent";
}

export function couponAppliesToVehicle(coupon: RideCoupon, vehicleTypeId?: string): boolean {
  const ids = coupon.vehicle_type_ids || [];
  if (ids.length === 0) return true;
  if (!vehicleTypeId) return false;
  return ids.includes(vehicleTypeId);
}

/** Client-side discount for any vehicle fare (%, flat, or 100% free). */
export function couponDiscountForAmount(coupon: RideCoupon, orderAmount: number): number {
  if (orderAmount <= 0) return 0;
  const minOrder = Number(coupon.min_order_amount ?? 0);
  if (orderAmount < minOrder) return 0;

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
): number {
  if (!couponAppliesToVehicle(coupon, vehicleTypeId)) return orderAmount;
  return Math.max(0, orderAmount - couponDiscountForAmount(coupon, orderAmount));
}
