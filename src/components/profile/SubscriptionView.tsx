"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  CheckCircle2,
  Crown,
  Headset,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { SoftSpinner } from "@/components/profile/FormExtras";
import { Button } from "@/components/ui/button";
import {
  createSubscriptionCheckout,
  getUserSubscription,
  listSubscriptionPlans,
  selectSubscriptionPlan,
  verifySubscriptionPayment,
} from "@/lib/membership-api";
import { cacheActiveMembershipPlan } from "@/lib/membership-sync";
import {
  isAllowedPaymentRedirectUrl,
  openSubscriptionCheckout,
} from "@/lib/razorpay-checkout";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_inr: number;
  ride_discount_percent: number;
  benefits: string[];
  is_popular?: boolean;
  description?: string;
}

const MEMBERSHIP_HIGHLIGHTS = [
  {
    icon: BadgePercent,
    title: "Ride discounts",
    blurb: "Save on every completed trip with Plus or Premium.",
  },
  {
    icon: Zap,
    title: "Faster matching",
    blurb: "Priority booking when captains are in high demand.",
  },
  {
    icon: Headset,
    title: "Priority support",
    blurb: "Reach help faster when something goes wrong on a trip.",
  },
] as const;

function parseMoney(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  // Some APIs send paise (9900) for ₹99.
  if (n >= 1000 && Number.isInteger(n) && n % 100 === 0) return n / 100;
  return n;
}

function parseBenefits(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          return String((item as { text?: unknown }).text ?? "");
        }
        if (item && typeof item === "object" && "title" in item) {
          return String((item as { title?: unknown }).title ?? "");
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/\n|•|;/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

function mapApiPlans(raw: Array<Record<string, unknown>>): Plan[] {
  return raw
    .map((p) => {
      const slug = String(
        p.slug ?? p.plan_slug ?? p.code ?? p.plan_code ?? p.id ?? "",
      ).trim();
      const id = String(p.id ?? slug);
      const benefits = parseBenefits(
        p.benefits ?? p.features ?? p.perks ?? p.description_list,
      );
      return {
        id,
        slug,
        name: String(p.name ?? p.title ?? slug),
        price_inr: parseMoney(
          p.price_inr ?? p.price ?? p.amount ?? p.monthly_price ?? p.price_monthly,
        ),
        ride_discount_percent: Number(
          p.ride_discount_percent ?? p.discount_percent ?? p.discount ?? 0,
        ),
        benefits,
        is_popular: Boolean(p.is_popular ?? p.popular ?? p.is_featured),
        description:
          typeof p.description === "string" ? p.description : undefined,
      };
    })
    .filter((p) => p.slug && p.name);
}

export function SubscriptionView() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSlug, setActiveSlug] = useState("free");
  const [loading, setLoading] = useState(true);
  const [selectingSlug, setSelectingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    let nextPlans: Plan[] = [];
    let liveCatalog = false;

    try {
      const plansRes = await listSubscriptionPlans();
      const mapped = mapApiPlans(plansRes.plans ?? []);
      if (mapped.length > 0) {
        nextPlans = mapped;
        liveCatalog = true;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subscription plans from the server",
      );
    }

    if (!liveCatalog) {
      nextPlans = [];
    }
    setPlans(nextPlans);

    try {
      const subRes = await getUserSubscription();
      const plan = (subRes.subscription?.plan ?? subRes.subscription) as
        | Record<string, unknown>
        | undefined;
      const slug = String(plan?.slug ?? (nextPlans[0]?.price_inr === 0 ? nextPlans[0].slug : "free"));
      setActiveSlug(slug || "free");
      if (plan?.name) {
        cacheActiveMembershipPlan({
          name: String(plan.name),
          slug: String(plan.slug ?? slug),
          benefits: Array.isArray(plan.benefits) ? (plan.benefits as string[]) : undefined,
          ride_discount_percent:
            typeof plan.ride_discount_percent === "number"
              ? plan.ride_discount_percent
              : undefined,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (!/not found|no subscription|no active/i.test(message)) {
        setError((prev) => prev || message || "Unable to load your subscription");
      }
      setActiveSlug("free");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSelect = async (plan: Plan) => {
    if (selectingSlug) return;
    const slug = plan.slug;
    setSelectingSlug(slug);
    setError("");
    setToast("");
    try {
      if (plan.price_inr <= 0 || slug === "free") {
        const res = await selectSubscriptionPlan(slug);
        const next = res.subscription?.plan;
        if (next?.slug) {
          cacheActiveMembershipPlan({
            name: next.name,
            slug: next.slug,
            benefits: next.benefits,
          });
          setActiveSlug(next.slug);
        } else {
          setActiveSlug(slug);
        }
        setToast(res.message || "Plan updated");
      } else {
        const { checkout } = await createSubscriptionCheckout(slug, plan.id);
        if (checkout.payment_url && (!checkout.order_id || !checkout.key_id)) {
          if (!isAllowedPaymentRedirectUrl(checkout.payment_url)) {
            throw new Error("Payment link is not from a trusted provider.");
          }
          window.location.assign(checkout.payment_url);
          return;
        }
        if (!checkout.order_id || !checkout.key_id) {
          throw new Error("Payment could not be started. Try again.");
        }
        const payment = await openSubscriptionCheckout(checkout);
        const verified = await verifySubscriptionPayment({
          plan_slug: checkout.plan?.slug || slug,
          ...payment,
        });
        const next = verified.subscription?.plan;
        if (next?.slug) {
          cacheActiveMembershipPlan({
            name: next.name,
            slug: next.slug,
            benefits: next.benefits,
            ride_discount_percent: next.ride_discount_percent,
          });
          setActiveSlug(next.slug);
        } else {
          setActiveSlug(slug);
        }
        setToast(verified.message || "Subscription activated");
      }
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update plan";
      if (message === "Payment cancelled" || /redirecting to payment/i.test(message)) {
        return;
      }
      setError(message);
    } finally {
      setSelectingSlug(null);
    }
  };

  const activePlan = useMemo(
    () => plans.find((plan) => plan.slug === activeSlug),
    [plans, activeSlug],
  );

  const isFree = (activePlan?.slug ?? activeSlug) === "free";

  return (
    <AppShell>
      <PageHeader
        title="Subscriptions"
        subtitle="Choose a plan that matches your rides"
      />

      <div className="relative flex-1 overflow-hidden bg-[#f7fbe8]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_80%_at_0%_0%,rgba(184,217,38,0.18),transparent_55%),radial-gradient(ellipse_50%_60%_at_100%_20%,rgba(56,71,27,0.06),transparent_50%)]"
        />

        <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {loading ? (
            <SoftSpinner label="Loading plans…" />
          ) : (
            <div className="space-y-8 sm:space-y-10">
              <AnimateIn>
                <section className="relative overflow-hidden rounded-3xl border border-[#38471B]/10 bg-[#38471B] text-white shadow-[0_28px_60px_-32px_rgba(40,54,20,0.55)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_100%_0%,rgba(200,232,74,0.28),transparent_55%)]"
                  />
                  <div className="relative grid gap-6 p-5 sm:grid-cols-[1.2fr_0.8fr] sm:gap-8 sm:p-7 lg:p-8">
                    <div>
                      <div className="flex items-start gap-3.5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                          <Crown className="h-6 w-6 text-[#C8E84A]" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#C8E84A]/90 uppercase">
                            Membership
                          </p>
                          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
                            Bull Wave Rides Membership
                          </h2>
                          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/70">
                            Unlock discounts, priority matching, and faster
                            support — or stay on Free with standard pricing.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                          <Sparkles className="h-3.5 w-3.5 text-[#C8E84A]" />
                          Current plan: {activePlan?.name ?? "Free"}
                        </span>
                        {activePlan?.ride_discount_percent ? (
                          <span className="rounded-full border border-[#C8E84A]/35 bg-[#C8E84A]/15 px-3 py-1.5 text-xs font-semibold text-[#E8F5A0]">
                            {activePlan.ride_discount_percent}% ride discount
                          </span>
                        ) : (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/65">
                            Standard ride rates
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
                      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#C8E84A] uppercase">
                        {isFree ? "Upgrade to save" : "Your active perks"}
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {(activePlan?.benefits?.length
                          ? activePlan.benefits
                          : [
                              "Book rides anytime",
                              "Standard pricing",
                              "In-app support",
                            ]
                        )
                          .slice(0, 4)
                          .map((benefit) => (
                            <li
                              key={benefit}
                              className="flex items-start gap-2 text-sm text-white/85"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8E84A]" />
                              {benefit}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </section>
              </AnimateIn>

              <AnimateIn delay={0.04}>
                <section className="grid gap-3 sm:grid-cols-3">
                  {MEMBERSHIP_HIGHLIGHTS.map(({ icon: Icon, title, blurb }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-[#e8f0c8] bg-white/90 p-4 shadow-[0_12px_28px_-24px_rgba(56,71,27,0.35)] sm:p-5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f5dc] text-[#38471B]">
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                      </span>
                      <h3 className="mt-3 font-heading text-sm font-semibold text-[#283614]">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#5a6330] sm:text-[13px]">
                        {blurb}
                      </p>
                    </div>
                  ))}
                </section>
              </AnimateIn>

              {error ? (
                <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {toast ? (
                <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-sm font-medium text-emerald-700">
                  {toast}
                </p>
              ) : null}

              <section>
                <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-[#283614] sm:text-2xl">
                      Choose your plan
                    </h3>
                    <p className="mt-1 text-sm text-[#5a6330]">
                      {plans.length === 0
                        ? "Plans load from Bull Wave Rides. Paid checkout opens only for live catalog entries."
                        : "Pick a plan. Paid plans open Razorpay, then the server activates membership."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 self-start gap-1.5 rounded-full border-[#dce8a8] bg-white text-[#38471B] hover:border-[#B8D926]/50 hover:bg-[#f7fbe8]"
                    onClick={() => void load()}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>

                {plans.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#dce8a8] bg-white px-5 py-12 text-center">
                    <Crown className="mx-auto h-8 w-8 text-[#C8E84A]" />
                    <p className="mt-3 text-sm font-semibold text-[#283614]">
                      No live subscription plans from the server
                    </p>
                    <p className="mt-1 text-sm text-[#5a6330]">
                      Plus ₹99 and Premium ₹199 appear here after they are added
                      in the admin catalog. Pay & Subscribe then opens Razorpay
                      and saves the membership on your account.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-5 rounded-xl border-[#B8D926]/40 text-[#38471B]"
                      onClick={() => void load()}
                    >
                      Refresh plans
                    </Button>
                  </div>
                ) : (
                  <Stagger className="grid gap-4 md:grid-cols-3">
                    {plans.map((plan) => {
                      const isActive = plan.slug === activeSlug;
                      const isSelecting = selectingSlug === plan.slug;
                      const popular = Boolean(plan.is_popular);

                      return (
                        <StaggerItem key={plan.id || plan.slug}>
                          <article
                            className={cn(
                              "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_16px_40px_-28px_rgba(40,54,20,0.4)] transition-all sm:p-6",
                              isActive
                                ? "border-[#B8D926] ring-2 ring-[#C8E84A]/35"
                                : popular
                                  ? "border-[#C8E84A]/45"
                                  : "border-[#e8f0c8] hover:border-[#B8D926]/40",
                            )}
                          >
                            {popular ? (
                              <span className="absolute top-0 right-0 rounded-bl-xl bg-[#38471B] px-3 py-1 text-[10px] font-bold tracking-wide text-[#C8E84A] uppercase">
                                Popular
                              </span>
                            ) : null}

                            <div className="min-w-0 pr-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-heading text-lg font-semibold text-[#283614]">
                                  {plan.name}
                                </h4>
                                {isActive ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#B8D926]/20 px-2 py-0.5 text-[11px] font-semibold text-[#38471B]">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Active
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 flex items-baseline gap-1">
                                <span className="font-heading text-3xl font-bold tracking-tight text-[#283614]">
                                  {plan.price_inr === 0
                                    ? "₹0"
                                    : `₹${plan.price_inr}`}
                                </span>
                                <span className="text-sm text-[#5a6330]">
                                  {plan.price_inr === 0 ? "forever" : "/month"}
                                </span>
                              </p>
                              <p className="mt-1.5 text-sm text-[#5a6330]">
                                {plan.description ||
                                  (plan.ride_discount_percent > 0
                                    ? `${plan.ride_discount_percent}% off every ride`
                                    : "Essential rides at standard rates")}
                              </p>
                            </div>

                            <ul className="mt-5 flex-1 space-y-2.5">
                              {plan.benefits.map((benefit) => (
                                <li
                                  key={benefit}
                                  className="flex items-start gap-2 text-sm text-[#4a5228]"
                                >
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9BB820]" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>

                            {isActive ? (
                              <div className="mt-6 flex h-11 items-center justify-center rounded-xl border border-[#e8f0c8] bg-[#f7fbe8] text-sm font-semibold text-[#38471B]">
                                Your current plan
                              </div>
                            ) : (
                              <Button
                                className={cn(
                                  "mt-6 h-11 w-full rounded-xl font-semibold shadow-[0_10px_24px_-14px_rgba(56,71,27,0.35)] disabled:opacity-60",
                                  popular
                                    ? "bg-gradient-to-r from-[#B8D926] to-[#C8E84A] text-[#283614] hover:brightness-105"
                                    : "bg-[#38471B] text-white hover:bg-[#4A5824]",
                                )}
                                disabled={!!selectingSlug}
                                onClick={() => void handleSelect(plan)}
                              >
                                {isSelecting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating…
                                  </>
                                ) : plan.price_inr > 0 ? (
                                  `Pay ₹${plan.price_inr} & Subscribe`
                                ) : (
                                  `Select ${plan.name}`
                                )}
                              </Button>
                            )}
                          </article>
                        </StaggerItem>
                      );
                    })}
                  </Stagger>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
