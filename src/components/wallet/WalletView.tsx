"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  CreditCard,
  Gift,
  Loader2,
  Plus,
  ScanLine,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AppShell, HeroHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { ROUTES } from "@/constants/routes";
import {
  clearAuthSession,
  requireAuthRedirect,
  setPostLoginRedirect,
} from "@/lib/auth-session";
import { openSubscriptionCheckout } from "@/lib/razorpay-checkout";
import { formatFare } from "@/lib/ride-booking";
import { cn } from "@/lib/utils";
import {
  createWalletCheckout,
  getPaymentMethods,
  getWalletSummary,
  verifyWalletPayment,
  type PaymentMethod,
  type WalletSummary,
} from "@/lib/wallet-api";

const TOP_UP_AMOUNTS = [100, 200, 500, 1000] as const;
const PAYMENT_PREF_KEY = "bwr_preferred_payment";

const WALLET_NAV = [
  { id: "balance", label: "Balance" },
  { id: "topup", label: "Add money" },
  { id: "pay", label: "Pay" },
] as const;

const EMPTY_WALLET: WalletSummary = {
  balance: 0,
  bonus_balance: 0,
  referral_balance: 0,
  total: 0,
  has_bank_account: false,
  bank: null,
  cashback_total: 0,
  referral_earned: 0,
};

function isAuthTokenError(message: string) {
  return /invalid|expired|token|unauthorized|unauthenticated|401/i.test(
    message,
  );
}

const paymentMethods = [
  {
    id: "cash",
    title: "Cash",
    description: "Pay your captain directly after the ride",
    icon: Banknote,
    badge: null,
    accent: "from-emerald-500/15 to-emerald-500/5",
    iconBg: "bg-emerald-500/15 text-emerald-700",
    iconBgActive: "bg-emerald-600 text-white",
  },
  {
    id: "upi",
    title: "UPI",
    description: "Instant pay with any UPI app",
    icon: ScanLine,
    badge: "Popular",
    accent: "from-primary/15 to-secondary/10",
    iconBg: "bg-primary/12 text-primary",
    iconBgActive: "bg-primary text-primary-foreground",
  },
  {
    id: "card",
    title: "Card",
    description: "Visa, Mastercard, RuPay & more",
    icon: CreditCard,
    badge: null,
    accent: "from-sky-500/15 to-sky-500/5",
    iconBg: "bg-sky-500/15 text-sky-700",
    iconBgActive: "bg-sky-600 text-white",
  },
  {
    id: "wallet",
    title: "Wallet",
    description: "Use your Bull Wave Rides balance",
    icon: Wallet,
    badge: null,
    accent: "from-secondary/20 to-primary/10",
    iconBg: "bg-secondary/20 text-primary",
    iconBgActive: "bg-primary text-primary-foreground",
  },
] as const;

type PaymentMethodId = (typeof paymentMethods)[number]["id"];
const PAYMENT_METHOD_IDS = new Set<string>(
  paymentMethods.map((method) => method.id),
);

function isPaymentMethodId(value: string): value is PaymentMethodId {
  return PAYMENT_METHOD_IDS.has(value);
}

export function WalletView() {
  const router = useRouter();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [preferredPay, setPreferredPay] = useState<PaymentMethodId>("cash");
  const [activeNav, setActiveNav] = useState<(typeof WALLET_NAV)[number]["id"]>(
    "balance",
  );
  const [topUpAmount, setTopUpAmount] = useState<number>(200);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState("");
  const [topUpSuccess, setTopUpSuccess] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [paySaved, setPaySaved] = useState(false);

  const loadWallet = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      setLoadError("");
      try {
        const [wallet, methods] = await Promise.all([
          getWalletSummary(),
          getPaymentMethods().catch(() => [] as PaymentMethod[]),
        ]);
        setSummary(wallet);
        setSavedMethods(methods);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load wallet";

        if (isAuthTokenError(message)) {
          clearAuthSession();
          setPostLoginRedirect(ROUTES.wallet);
          router.replace(requireAuthRedirect(ROUTES.wallet));
          return;
        }

        setSummary(EMPTY_WALLET);
        setSavedMethods([]);
        setLoadError(
          "We couldn’t refresh your wallet right now. You can still browse payment options and try again.",
        );
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PAYMENT_PREF_KEY);
      if (stored && isPaymentMethodId(stored)) setPreferredPay(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const ids = WALLET_NAV.map((item) => item.id);
    const nodes = ids
      .map((id) => document.getElementById(`wallet-${id}`))
      .filter(Boolean) as HTMLElement[];

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        const id = visible.target.id.replace(
          "wallet-",
          "",
        ) as (typeof WALLET_NAV)[number]["id"];
        if (ids.includes(id)) setActiveNav(id);
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.15, 0.35, 0.55],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [loading]);

  const linkedCards = useMemo(
    () =>
      savedMethods.filter(
        (method) =>
          Boolean(method.last_four) && !PAYMENT_METHOD_IDS.has(method.id),
      ),
    [savedMethods],
  );

  const selectedMethod = useMemo(
    () =>
      paymentMethods.find((method) => method.id === preferredPay) ??
      paymentMethods[0],
    [preferredPay],
  );

  const selectPayment = useCallback((id: PaymentMethodId) => {
    startTransition(() => {
      setPreferredPay(id);
      setPaySaved(true);
    });
    try {
      localStorage.setItem(PAYMENT_PREF_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!paySaved) return;
    const timer = window.setTimeout(() => setPaySaved(false), 1400);
    return () => window.clearTimeout(timer);
  }, [paySaved, preferredPay]);

  const onPaymentKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = paymentMethods.findIndex(
        (method) => method.id === preferredPay,
      );
      if (currentIndex < 0) return;

      let nextIndex = currentIndex;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        nextIndex = (currentIndex + 1) % paymentMethods.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        nextIndex =
          (currentIndex - 1 + paymentMethods.length) % paymentMethods.length;
      } else {
        return;
      }

      selectPayment(paymentMethods[nextIndex].id);
    },
    [preferredPay, selectPayment],
  );

  function scrollToSection(id: (typeof WALLET_NAV)[number]["id"]) {
    setActiveNav(id);
    const el = document.getElementById(`wallet-${id}`);
    if (!el) return;
    const offset = 72;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  async function handleTopUp() {
    setTopUpError("");
    setTopUpSuccess("");
    setTopUpLoading(true);
    try {
      const res = await createWalletCheckout(topUpAmount);
      const checkout =
        "checkout" in res && res.checkout
          ? res.checkout
          : (res as {
              key_id: string;
              order_id: string;
              amount?: number;
              currency?: string;
              name?: string;
              description?: string;
              prefill?: { name?: string; email?: string; contact?: string };
            });
      const paid = await openSubscriptionCheckout(checkout);
      await verifyWalletPayment(paid);
      await loadWallet({ silent: true });
      setTopUpSuccess(`${formatFare(topUpAmount)} added to wallet`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to start top-up";
      if (message === "Payment cancelled") return;
      if (isAuthTokenError(message)) {
        clearAuthSession();
        setPostLoginRedirect(ROUTES.wallet);
        router.replace(requireAuthRedirect(ROUTES.wallet));
        return;
      }
      setTopUpError(message);
    } finally {
      setTopUpLoading(false);
    }
  }

  const wallet = summary ?? EMPTY_WALLET;
  const cashBalance = wallet.balance ?? 0;
  const totalBalance = wallet.total ?? cashBalance;

  return (
    <AppShell>
      <HeroHeader
        eyebrow="Payments"
        title="Wallet"
        description="Manage balances, payouts, and how you pay for rides."
        icon={ShieldCheck}
      />

      {/* Sticky payment nav — fixed under hero while scrolling */}
      <div className="sticky top-0 z-40 border-b border-primary/10 bg-[#f7fbe8]/92 backdrop-blur-md supports-[backdrop-filter]:bg-[#f7fbe8]/80">
        <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-3 sm:px-6 md:px-8 lg:px-10">
          <nav
            aria-label="Wallet sections"
            className="-mx-1 flex gap-1 overflow-x-auto px-1 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:py-3"
          >
            {WALLET_NAV.map((item) => {
              const selected = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                    selected
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "text-[#4a5228] hover:bg-primary/8 hover:text-primary",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-3 pb-20 pt-5 sm:px-6 sm:pb-24 sm:pt-6 md:px-8 lg:px-10">
        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading wallet…</p>
          </div>
        ) : (
          <>
            {loadError ? (
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-[20px] sm:p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {loadError}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 rounded-full px-5"
                  onClick={() => void loadWallet()}
                >
                  Try again
                </Button>
              </div>
            ) : null}

            <section id="wallet-balance" className="scroll-mt-24">
              <Stagger className="mb-5 grid grid-cols-1 gap-4 sm:mb-6 sm:gap-5 lg:grid-cols-2">
                <StaggerItem>
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-[24px] sm:p-5">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent"
                    />
                    <p className="relative text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:text-[11px]">
                      Payouts
                    </p>
                    <p className="relative mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      {formatFare(cashBalance)}
                    </p>
                    <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      Add a bank / UPI account, then request withdrawal to your
                      account.
                    </p>
                    <Button
                      className="relative mt-4 h-11 w-full rounded-full sm:mt-5 sm:w-auto"
                      onClick={() => router.push(ROUTES.walletWithdraw)}
                    >
                      <Plus className="h-4 w-4" />
                      Add account & withdraw
                    </Button>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-[24px] sm:p-5">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-transparent"
                    />
                    <p className="relative text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:text-[11px]">
                      Rewards
                    </p>
                    <div className="relative mt-3 space-y-2.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          Bull Wave Rides Cash
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatFare(cashBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-2.5 text-sm">
                        <span className="font-medium text-foreground">
                          Total wallet value
                        </span>
                        <span className="font-bold tabular-nums text-foreground">
                          {formatFare(totalBalance)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="relative mt-4 h-11 w-full rounded-full sm:mt-5 sm:w-auto"
                      onClick={() =>
                        setGiftMessage(
                          "Gift cards are coming soon. Top up your wallet for rides today.",
                        )
                      }
                    >
                      <Gift className="h-4 w-4" />
                      Gift card
                    </Button>
                    {giftMessage ? (
                      <p className="relative mt-3 text-xs leading-relaxed text-primary sm:text-sm">
                        {giftMessage}
                      </p>
                    ) : null}
                  </div>
                </StaggerItem>
              </Stagger>
            </section>

            <AnimateIn delay={0.06}>
              <section
                id="wallet-topup"
                className="mb-6 scroll-mt-24 rounded-2xl border border-border bg-card p-4 shadow-sm sm:mb-8 sm:rounded-[24px] sm:p-6"
              >
                <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                  Add money
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Top up via Razorpay — same checkout as the app.
                </p>
                <div
                  role="group"
                  aria-label="Top-up amount"
                  className="mt-4 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3"
                >
                  {TOP_UP_AMOUNTS.map((amount) => {
                    const selected = topUpAmount === amount;
                    return (
                      <button
                        key={amount}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setTopUpAmount(amount)}
                        className={cn(
                          "min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 sm:min-h-10",
                          selected
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                            : "bg-muted text-muted-foreground hover:bg-muted/80",
                        )}
                      >
                        ₹{amount}
                      </button>
                    );
                  })}
                </div>
                {topUpError ? (
                  <p className="mt-3 text-sm text-destructive">{topUpError}</p>
                ) : null}
                {topUpSuccess ? (
                  <p className="mt-3 text-sm text-success">{topUpSuccess}</p>
                ) : null}
                <Button
                  className="mt-4 h-11 w-full rounded-full sm:mt-5 sm:w-auto sm:min-w-[11rem]"
                  disabled={topUpLoading}
                  onClick={() => void handleTopUp()}
                >
                  {topUpLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add {formatFare(topUpAmount)}
                    </>
                  )}
                </Button>
              </section>
            </AnimateIn>

            <AnimateIn delay={0.06}>
              <section id="wallet-pay" className="scroll-mt-24">
                <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                      Payment methods
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose how you want to pay for rides
                    </p>
                  </div>
                  <div
                    className={cn(
                      "inline-flex min-h-9 items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 sm:self-auto",
                      paySaved
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                        : "border-primary/15 bg-primary/[0.06] text-primary",
                    )}
                    aria-live="polite"
                  >
                    {paySaved ? (
                      <>
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Saved for rides
                      </>
                    ) : (
                      <>
                        Preferred · {selectedMethod.title}
                      </>
                    )}
                  </div>
                </div>

                {linkedCards.length > 0 ? (
                  <div className="mb-3 flex flex-col gap-2.5 sm:mb-4">
                    {linkedCards.map((method) => (
                      <div
                        key={method.id}
                        className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm"
                      >
                        <p className="font-semibold text-foreground">
                          {method.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.type}
                          {method.last_four
                            ? ` • ****${method.last_four}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div
                  role="radiogroup"
                  aria-label="Preferred payment method"
                  aria-orientation="horizontal"
                  tabIndex={0}
                  onKeyDown={onPaymentKeyDown}
                  className="grid grid-cols-1 gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 sm:grid-cols-2 sm:gap-3.5"
                >
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const selected = preferredPay === method.id;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => selectPayment(method.id)}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-150 ease-out sm:rounded-[1.25rem] sm:p-5",
                          "active:scale-[0.985]",
                          selected
                            ? "border-primary bg-white shadow-[0_14px_32px_-18px_rgba(184,217,38,0.45)] ring-2 ring-primary/25"
                            : "border-border/90 bg-card shadow-sm hover:border-primary/30 hover:bg-primary/[0.02]",
                        )}
                      >
                        <div
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-150",
                            method.accent,
                            selected && "opacity-100",
                          )}
                        />

                        <div className="relative flex items-start gap-3.5">
                          <span
                            className={cn(
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-150",
                              selected ? method.iconBgActive : method.iconBg,
                            )}
                          >
                            <Icon className="h-5 w-5" strokeWidth={1.9} />
                          </span>

                          <span className="min-w-0 flex-1 pt-0.5">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-heading text-[15px] font-bold text-foreground sm:text-base">
                                {method.title}
                              </span>
                              {method.badge ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                                  {method.badge}
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                              {method.description}
                            </span>
                            {selected ? (
                              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                                <Check className="h-3 w-3" strokeWidth={3} />
                                Selected for rides
                              </span>
                            ) : null}
                          </span>

                          <span
                            className={cn(
                              "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
                              selected
                                ? "scale-100 border-primary bg-primary text-primary-foreground"
                                : "scale-95 border-border bg-transparent group-hover:border-primary/40",
                            )}
                            aria-hidden
                          >
                            {selected ? (
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            ) : null}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </AnimateIn>
          </>
        )}

        <AnimateIn delay={0.12} className="mt-6 sm:mt-8">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm sm:rounded-[20px] sm:p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Secure payments
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Your payment details are encrypted and never shared with
                drivers.
              </p>
            </div>
          </div>
        </AnimateIn>
      </div>
    </AppShell>
  );
}
