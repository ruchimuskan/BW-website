"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { SettingsPageLayout } from "@/components/layout/SettingsPageLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VerificationCodeInput } from "@/components/profile/VerificationCodeInput";
import {
  parseContactPhone,
  sendLoginOtp,
  verifyOtp,
} from "@/lib/auth-api";
import {
  clearPendingContactVerify,
  getAuthSession,
  getPendingContactVerify,
  setAuthSession,
  setPendingContactVerify,
} from "@/lib/auth-session";
import { updateProfile } from "@/lib/profile-api";

interface ContactVerifyFormProps {
  type: "phone" | "email";
  contact: string;
  backHref: string;
  successHref?: string;
}

/**
 * Phone: same OTP APIs as login/signup (`/auth/send-otp` + `/auth/verify-otp`).
 * Email: profile PATCH (no email-OTP endpoint on the existing backend).
 */
export function ContactVerifyForm({
  type,
  contact: contactProp,
  backHref,
  successHref = "/profile/account-settings",
}: ContactVerifyFormProps) {
  const router = useRouter();
  const [contact, setContact] = useState(contactProp.trim());
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [ready, setReady] = useState(false);
  const verifyLock = useRef(false);

  const sendPhoneOtp = useCallback(async (target: string) => {
    const { dial_code, phone } = parseContactPhone(target);
    await sendLoginOtp({
      dial_code,
      phone,
      mode: "login",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const fromUrl = contactProp.trim();
      const pending = getPendingContactVerify();
      const resolved =
        fromUrl ||
        (pending?.type === type && pending.contact ? pending.contact : "");

      if (!resolved) {
        router.replace(backHref);
        return;
      }

      setContact(resolved);
      setPendingContactVerify({ type, contact: resolved });

      if (type === "email") {
        setSending(true);
        try {
          await updateProfile({ email: resolved });
          const session = getAuthSession();
          if (session) {
            setAuthSession({ ...session, email: resolved });
          }
          clearPendingContactVerify();
          if (!cancelled) router.replace(successHref);
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Unable to update email.",
            );
            setReady(true);
          }
        } finally {
          if (!cancelled) setSending(false);
        }
        return;
      }

      // Phone: send genuine OTP (same APIs as login). Avoid duplicate sends
      // within a short window (React Strict Mode remounts / back-forward).
      const sentKey = `bw-contact-otp-sent:${resolved}`;
      const lastSentAt = Number(sessionStorage.getItem(sentKey) || "0");
      const recentlySent = Date.now() - lastSentAt < 25_000;

      setSending(true);
      setError("");
      try {
        if (!recentlySent) {
          await sendPhoneOtp(resolved);
          sessionStorage.setItem(sentKey, String(Date.now()));
          if (!cancelled) {
            setInfo("OTP sent to your mobile number.");
            setTimeLeft(30);
          }
        } else {
          if (!cancelled) {
            setInfo("Enter the OTP sent to your mobile number.");
            const remaining = Math.max(
              0,
              30 - Math.floor((Date.now() - lastSentAt) / 1000),
            );
            setTimeLeft(remaining);
          }
        }
        if (!cancelled) setReady(true);
      } catch (err) {
        sessionStorage.removeItem(sentKey);
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to send OTP. Please try again.",
          );
          setReady(true);
          setTimeLeft(0);
        }
      } finally {
        if (!cancelled) setSending(false);
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [backHref, contactProp, router, sendPhoneOtp, successHref, type]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerify = async (nextCode = code) => {
    if (type !== "phone") return;
    if (verifyLock.current || nextCode.length !== 6 || !contact) return;

    verifyLock.current = true;
    setVerifying(true);
    setError("");
    setInfo("");

    try {
      const { dial_code, phone } = parseContactPhone(contact);
      const result = await verifyOtp({
        dial_code,
        phone,
        otp: nextCode,
        mode: "login",
      });

      const existing = getAuthSession();
      setAuthSession({
        phone: result.user.phone || contact,
        verified: true,
        name: result.user.name ?? existing?.name,
        email: result.user.email ?? existing?.email,
        accessToken: result.access_token,
        refreshToken: result.refresh_token ?? existing?.refreshToken,
        profileComplete: existing?.profileComplete ?? true,
      });

      sessionStorage.removeItem(`bw-contact-otp-sent:${contact}`);
      clearPendingContactVerify();
      router.push(successHref);
    } catch (err) {
      const raw =
        err instanceof Error ? err.message : "Invalid OTP. Please try again.";
      const friendly = /invalid or expired token/i.test(raw)
        ? "Verification failed. Tap Resend OTP, then enter the new code."
        : raw;
      setError(friendly);
      setCode("");
      verifyLock.current = false;
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (type !== "phone" || timeLeft > 0 || sending || !contact) return;
    setSending(true);
    setError("");
    setInfo("");
    setCode("");
    verifyLock.current = false;
    try {
      await sendPhoneOtp(contact);
      sessionStorage.setItem(`bw-contact-otp-sent:${contact}`, String(Date.now()));
      setInfo("A new OTP was sent to your mobile number.");
      setTimeLeft(30);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to resend OTP.",
      );
    } finally {
      setSending(false);
    }
  };

  if (!ready && (sending || !contact)) {
    return (
      <SettingsPageLayout backHref={backHref}>
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#5a6330]">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm">
            {type === "phone" ? "Sending OTP…" : "Saving email…"}
          </p>
        </div>
      </SettingsPageLayout>
    );
  }

  if (type === "email") {
    return (
      <SettingsPageLayout backHref={backHref} title="Email">
        <div className="rounded-2xl border border-[#eef5d4] bg-white p-5 sm:p-6">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : (
            <p className="text-sm text-[#5a6330]">Redirecting…</p>
          )}
          <Button
            type="button"
            className="mt-6"
            onClick={() => router.push(backHref)}
          >
            Go back
          </Button>
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout backHref={backHref} wide>
      <div className="mx-auto grid w-full max-w-4xl items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <aside className="relative overflow-hidden rounded-2xl border border-[#eef5d4] bg-gradient-to-br from-[#38471B] via-[#B8D926] to-[#C8E84A] p-5 text-white shadow-[0_22px_48px_-28px_rgba(40,54,20,0.55)] sm:rounded-3xl sm:p-6 lg:sticky lg:top-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h2 className="relative mt-4 font-heading text-xl font-semibold sm:text-2xl">
            Verify your number
          </h2>
          <p className="relative mt-2 text-sm leading-relaxed text-white/85">
            Enter the 6-digit SMS code sent to{" "}
            <span className="break-all font-semibold text-white">{contact}</span>.
          </p>
          <div className="relative mt-5 flex items-start gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white/90">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              This uses the same secure OTP flow as sign-in. Codes expire
              quickly — request a new one if needed.
            </span>
          </div>
        </aside>

        <div className="rounded-2xl border border-[#eef5d4] bg-white p-5 shadow-[0_18px_44px_-28px_rgba(40,54,20,0.4)] sm:rounded-3xl sm:p-7">
          <h1 className="font-heading text-xl font-semibold leading-snug text-[#38471B] sm:text-2xl">
            Enter the 6-digit code
          </h1>
          <p className="mt-2 text-sm text-[#5a6330]">
            Sent to <span className="font-medium text-[#B8D926]">{contact}</span>
          </p>

          {info ? (
            <p
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"
              role="status"
            >
              {info}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col items-center sm:items-start">
            <Label className="mb-3 self-start text-sm font-semibold text-[#38471B]">
              6-digit code
            </Label>

            <VerificationCodeInput
              length={6}
              value={code}
              error={!!error}
              disabled={verifying || sending}
              onChange={(val) => {
                setCode(val);
                if (error) setError("");
                if (val.length === 6) {
                  void handleVerify(val);
                }
              }}
            />

            {error ? (
              <p
                className="mt-3 self-start text-sm font-medium text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 self-start">
              {timeLeft > 0 ? (
                <p className="text-sm text-[#5a6330]">
                  Resend available in 0:
                  {timeLeft.toString().padStart(2, "0")}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleResend()}
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f7fbe8] px-4 py-2 text-sm font-semibold text-[#38471B] ring-1 ring-[#e8f0c8] transition-colors hover:bg-[#eef5d4] disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f9e4] text-[#B8D926] transition-colors hover:bg-[#eef5d4]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <Button
              type="button"
              onClick={() => void handleVerify()}
              disabled={code.length !== 6 || verifying || sending}
              className="h-11 rounded-full px-6 font-semibold disabled:bg-[#eef5d4] disabled:text-[#8a6a9a]"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </SettingsPageLayout>
  );
}
