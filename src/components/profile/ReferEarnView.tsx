"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Gift, Loader2, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsPageLayout } from "@/components/layout/SettingsPageLayout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  applyReferEarnCode,
  getReferEarn,
  referEarnProgress,
  referEarnRewardLine,
  type ReferEarnDashboard,
} from "@/lib/refer-earn-api";

async function copyText(text: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fall through to execCommand on iOS / insecure contexts.
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.focus();
  el.select();
  el.setSelectionRange(0, text.length);
  const ok = document.execCommand("copy");
  document.body.removeChild(el);
  if (!ok) throw new Error("copy failed");
}

export function ReferEarnView() {
  const [data, setData] = useState<ReferEarnDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"code" | "message" | null>(null);
  const [friendCode, setFriendCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getReferEarn());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const inviteMessage = (dashboard: ReferEarnDashboard) =>
    dashboard.shareMessage?.trim() ||
    `Join Bull Wave Rides with my code ${dashboard.inviteCode}.`;

  const shareInvite = async (dashboard: ReferEarnDashboard) => {
    const text = inviteMessage(dashboard);
    setError("");
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: "Bull Wave Rides",
          text,
        });
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(url);
    }
  };

  const apply = async () => {
    if (!friendCode.trim()) {
      setError("Enter a referral code");
      return;
    }
    setApplying(true);
    setError("");
    setNotice("");
    try {
      setData(await applyReferEarnCode(friendCode.trim()));
      setFriendCode("");
      setNotice("Referral code saved to your account.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply code");
    } finally {
      setApplying(false);
    }
  };

  const copy = async (text: string, kind: "code" | "message") => {
    try {
      await copyText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setError("Could not copy. Please select and copy manually.");
    }
  };

  return (
    <AppShell showBottomNav={false} className="pb-0">
      <SettingsPageLayout title="Refer & Earn" backHref={ROUTES.profile} wide>
        <div className="relative z-10 mx-auto w-full max-w-4xl pb-[calc(7.5rem+env(safe-area-inset-bottom))] text-[#283614] sm:pb-10">
          {loading ? (
            <div className="flex min-h-[42vh] items-center justify-center gap-2 rounded-3xl border border-[#e8f0c8] bg-[#f7fbe8] text-sm text-[#5a6330]">
              <Loader2 className="h-5 w-5 animate-spin text-[#B8D926]" />
              Loading Refer & Earn…
            </div>
          ) : error && !data ? (
            <div className="mx-auto max-w-md rounded-3xl border border-destructive/20 bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                type="button"
                className="mt-4 rounded-full bg-[#B8D926] text-[#38471B]"
                onClick={() => void load()}
              >
                Retry
              </Button>
            </div>
          ) : !data?.enabled ? (
            <div className="rounded-3xl border border-[#e8f0c8] bg-[#f7fbe8] px-5 py-12 text-center text-sm text-[#5a6330]">
              Refer & Earn is not available right now.
            </div>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              <section className="relative overflow-hidden rounded-3xl bg-[#38471B] text-white shadow-[0_24px_50px_-28px_rgba(40,54,20,0.55)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_100%_0%,rgba(200,232,74,0.28),transparent_55%)]"
                />
                <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5 sm:p-7">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                    <Gift className="h-6 w-6 text-[#C8E84A]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#C8E84A]/90 uppercase">
                      Invite friends
                    </p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                      Refer & Earn
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-[15px]">
                      {data.program.description}
                    </p>
                  </div>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {[
                      { label: "Referrals", value: data.stats.referrals },
                      { label: "1st rides", value: data.stats.firstRides },
                      { label: "Free rides", value: data.stats.freeRides },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-[#e8f0c8] bg-white px-2 py-4 text-center shadow-[0_10px_28px_-22px_rgba(56,71,27,0.4)] sm:px-3 sm:py-5"
                      >
                        <p className="font-heading text-2xl font-bold tabular-nums text-[#38471B] sm:text-[1.85rem]">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold tracking-wide text-[#5a6330] uppercase sm:text-xs">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const progress = referEarnProgress(data);
                    return (
                      <div className="rounded-2xl border border-[#e8f0c8] bg-white p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-[#38471B]">
                            Progress to next free ride
                          </p>
                          <p className="text-sm font-bold tabular-nums text-[#38471B]">
                            {progress.current}/{progress.need}
                          </p>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eef5d4]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#B8D926] to-[#C8E84A] transition-[width]"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="relative z-[20] rounded-3xl border border-[#e8f0c8] bg-white p-4 shadow-[0_16px_36px_-28px_rgba(56,71,27,0.4)] sm:p-6">
                  <p className="text-sm font-semibold text-[#38471B]">Your invite code</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                    <div className="min-w-0 flex-1 rounded-2xl bg-[#38471B] px-4 py-3.5">
                      <span className="block break-all font-heading text-lg font-bold tracking-[0.14em] text-[#C8E84A] sm:text-xl">
                        {data.inviteCode || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:w-[9.5rem] sm:shrink-0 sm:grid-cols-1">
                      <button
                        type="button"
                        className="inline-flex h-12 min-h-12 touch-manipulation items-center justify-center gap-2 rounded-2xl border border-[#e8f0c8] bg-white text-sm font-semibold text-[#38471B] active:bg-[#f7fbe8]"
                        onClick={() => void copy(data.inviteCode, "code")}
                        disabled={!data.inviteCode}
                      >
                        {copied === "code" ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied === "code" ? "Copied" : "Copy"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-12 min-h-12 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[#38471B] text-sm font-semibold text-white active:bg-[#2c3916]"
                        onClick={() => void shareInvite(data)}
                        disabled={!data.inviteCode}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#e8f0c8] bg-[#f7fbe8] px-4 py-4">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#7a8448] uppercase">
                      Share message preview
                    </p>
                    <p className="mt-2 break-words text-sm leading-relaxed text-[#4a5228]">
                      {inviteMessage(data)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 max-sm:pr-16 sm:grid sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-full touch-manipulation rounded-xl border-[#c5d48a] bg-white font-semibold text-[#38471B] hover:bg-[#f7fbe8]"
                      onClick={() => void copy(inviteMessage(data), "message")}
                    >
                      {copied === "message" ? "Copied" : "Copy invite message"}
                    </Button>
                    <button
                      type="button"
                      className="inline-flex h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-[#25D366] text-sm font-semibold text-white active:bg-[#1ebe5d]"
                      onClick={() => void shareInvite(data)}
                    >
                      Share on WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e8f0c8] bg-[#f7fbe8] px-4 py-4 sm:px-5">
                <p className="text-sm font-semibold leading-relaxed text-[#283614] sm:text-[15px]">
                  {referEarnRewardLine(data)}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#5a6330] sm:text-[13px]">
                  {data.program.terms}
                </p>
              </div>

              {data.referrals.length > 0 ? (
                <div className="rounded-2xl border border-[#e8f0c8] bg-white p-4 sm:p-5">
                  <p className="text-sm font-semibold text-[#38471B]">Your referrals</p>
                  <ul className="mt-3 divide-y divide-[#eef5d4]">
                    {data.referrals.map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-sm font-medium capitalize text-[#283614]">
                          {row.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-[#5a6330] sm:text-sm">
                          {row.ridesCompleted}/{row.requiredRides} first rides
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!data.hasAppliedCode ? (
                <div className="rounded-2xl border border-[#e8f0c8] bg-white p-4 sm:p-5">
                  <p className="text-sm font-semibold text-[#38471B]">Have a friend’s code?</p>
                  <p className="mt-1 text-xs text-[#5a6330]">
                    Applying saves it on your account in the backend.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={friendCode}
                      onChange={(e) =>
                        setFriendCode(e.target.value.toUpperCase().slice(0, 24))
                      }
                      placeholder="Enter code"
                      autoComplete="off"
                      className="h-11 min-w-0 flex-1 rounded-xl border border-[#e8f0c8] bg-[#fbfdf4] px-3.5 text-sm font-semibold tracking-wide text-[#38471B] outline-none focus:border-[#C8E84A] focus:ring-2 focus:ring-[#C8E84A]/25"
                    />
                    <Button
                      type="button"
                      className="h-11 rounded-xl bg-[#B8D926] px-5 font-semibold text-[#38471B] hover:bg-[#C8E84A] sm:w-auto"
                      onClick={() => void apply()}
                      disabled={applying}
                    >
                      {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save code"}
                    </Button>
                  </div>
                </div>
              ) : null}

              {error && data ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {notice ? (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm font-medium text-emerald-700">
                  {notice}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </SettingsPageLayout>
    </AppShell>
  );
}
