"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, HeroHeader } from "@/components/layout";
import { AnimateIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  clearAuthSession,
  requireAuthRedirect,
  setPostLoginRedirect,
} from "@/lib/auth-session";
import {
  getWalletSummary,
  requestWalletWithdraw,
  saveWalletBank,
  type WalletSummary,
} from "@/lib/wallet-api";
import { formatFare } from "@/lib/ride-booking";
import { ArrowLeft, Loader2, Wallet } from "lucide-react";

function isAuthTokenError(message: string) {
  return /invalid|expired|token|unauthorized|unauthenticated|401/i.test(
    message,
  );
}

export function WalletWithdrawView() {
  const router = useRouter();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [payoutType, setPayoutType] = useState<"bank" | "upi">("bank");
  const [holder, setHolder] = useState("");
  const [account, setAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [upi, setUpi] = useState("");

  function handleAuthFailure(message: string) {
    if (!isAuthTokenError(message)) return false;
    clearAuthSession();
    setPostLoginRedirect(ROUTES.walletWithdraw);
    router.replace(requireAuthRedirect(ROUTES.walletWithdraw));
    return true;
  }

  async function reload() {
    const wallet = await getWalletSummary();
    setSummary(wallet);
  }

  useEffect(() => {
    void (async () => {
      try {
        await reload();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unable to load wallet";
        if (!handleAuthFailure(msg)) {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
  }, []);

  async function onSaveBank(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await saveWalletBank(
        payoutType === "upi"
          ? {
              payment_type: "upi",
              account_holder_name: holder,
              upi_id: upi,
            }
          : {
              payment_type: "bank",
              account_holder_name: holder,
              account_number: account,
              ifsc_code: ifsc,
              bank_name: bankName,
            }
      );
      setMessage("Payout account saved");
      await reload();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save account";
      if (!handleAuthFailure(msg)) setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onWithdraw(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value < 1) {
      setError("Enter a valid amount");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await requestWalletWithdraw(value);
      setMessage(res.message || "Withdrawal requested");
      setAmount("");
      await reload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Withdrawal failed";
      if (!handleAuthFailure(msg)) setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const hasBank = Boolean(summary?.has_bank_account && summary.bank);

  return (
    <AppShell>
      <HeroHeader
        eyebrow="Wallet"
        title="Withdraw"
        description="Send wallet balance to your bank or UPI. Admin approves and pays."
        icon={Wallet}
      />
      <div className="relative z-10 mx-auto w-full max-w-xl flex-1 px-4 pb-16 sm:px-6 md:px-12">
        <AnimateIn>
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => router.push(ROUTES.wallet)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </AnimateIn>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimateIn delay={0.05}>
            <div className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:space-y-6 sm:p-6">
              <div>
                <p className="text-sm text-muted-foreground">Available balance</p>
                <p className="font-heading text-3xl font-bold">
                  {formatFare(summary?.balance ?? 0)}
                </p>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {message ? (
                <p className="text-sm text-emerald-600">{message}</p>
              ) : null}

              {!hasBank ? (
                <form className="space-y-3" onSubmit={onSaveBank}>
                  <p className="font-medium">Add payout account first</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={payoutType === "bank" ? "default" : "outline"}
                      onClick={() => setPayoutType("bank")}
                    >
                      Bank
                    </Button>
                    <Button
                      type="button"
                      variant={payoutType === "upi" ? "default" : "outline"}
                      onClick={() => setPayoutType("upi")}
                    >
                      UPI
                    </Button>
                  </div>
                  <input
                    className="min-h-11 w-full rounded-xl border px-3 py-2 text-sm sm:text-base"
                    placeholder="Account holder name"
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    required
                  />
                  {payoutType === "upi" ? (
                    <input
                      className="min-h-11 w-full rounded-xl border px-3 py-2 text-sm sm:text-base"
                      placeholder="UPI ID"
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      required
                    />
                  ) : (
                    <>
                      <input
                        className="min-h-11 w-full rounded-xl border px-3 py-2 text-sm sm:text-base"
                        placeholder="Account number"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        required
                      />
                      <input
                        className="min-h-11 w-full rounded-xl border px-3 py-2 text-sm sm:text-base"
                        placeholder="IFSC"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                        required
                      />
                      <input
                        className="min-h-11 w-full rounded-xl border px-3 py-2 text-sm sm:text-base"
                        placeholder="Bank name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                      />
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Save account"}
                  </Button>
                </form>
              ) : (
                <>
                  <div className="rounded-xl border p-4 text-sm">
                    <p className="font-medium">
                      {summary?.bank?.account_holder}
                    </p>
                    <p>
                      {summary?.bank?.upi_id || summary?.bank?.account_number}
                    </p>
                    {!summary?.bank?.upi_id ? (
                      <p className="text-muted-foreground">
                        {summary?.bank?.bank_name} · {summary?.bank?.ifsc}
                      </p>
                    ) : null}
                  </div>
                  <form className="space-y-3" onSubmit={onWithdraw}>
                    <input
                      className="min-h-11 w-full rounded-xl border px-3 py-2 text-sm sm:text-base"
                      placeholder="Amount (₹)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      inputMode="decimal"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={busy || (summary?.balance ?? 0) < 1}
                    >
                      {busy ? "Submitting…" : "Request withdrawal"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </AnimateIn>
        )}
      </div>
    </AppShell>
  );
}
