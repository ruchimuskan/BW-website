"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginServicesPanel } from "@/components/auth/LoginServicesPanel";
import { OTPInput } from "@/components/OTPInput";
import {
  PhoneInput,
  toE164Phone,
  isValidPhoneNumber,
} from "@/components/PhoneInput";
import { ROUTES } from "@/constants/routes";
import { SITE_BRAND } from "@/constants/seo";
import {
  needsProfileSetup,
  resolvePostAuthDestination,
  setAuthSession,
  setPostLoginRedirect,
  isAuthenticated,
} from "@/lib/auth-session";
import { sendLoginOtp, verifyOtp } from "@/lib/auth-api";
import { defaultCountry, type Country } from "@/lib/countries";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Step = "phone" | "verify";

export function PhoneLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("phone");
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deliveredOtp, setDeliveredOtp] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [e164Phone, setE164Phone] = useState("");
  const verifyLock = useRef(false);
  const sendLock = useRef(false);

  useEffect(() => {
    const next = searchParams.get("next") ?? searchParams.get("redirect");
    if (next) setPostLoginRedirect(next);
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated()) return;
    router.replace(resolvePostAuthDestination());
  }, [router]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const finishLogin = useCallback(
    (
      phoneDisplay: string,
      tokens: {
        accessToken: string;
        refreshToken?: string;
        name?: string;
        email?: string;
      },
    ) => {
      const accessToken = tokens.accessToken?.trim();
      if (!accessToken) {
        setPhoneError("Login succeeded without an access token. Please try again.");
        return;
      }

      const profileComplete = !needsProfileSetup(tokens.name, tokens.email);
      setAuthSession({
        phone: phoneDisplay,
        verified: true,
        ...(tokens.name ? { name: tokens.name } : {}),
        ...(tokens.email ? { email: tokens.email } : {}),
        accessToken,
        ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
        profileComplete,
      });

      if (!profileComplete) {
        router.replace(ROUTES.createProfile);
        return;
      }

      router.replace(resolvePostAuthDestination());
    },
    [router],
  );

  const handleSendOtp = async () => {
    if (sendLock.current || isSending) return;
    if (!isValidPhoneNumber(phone, country)) {
      setPhoneError("Please enter a valid mobile number");
      return;
    }

    sendLock.current = true;
    setPhoneError("");
    setSuccessMessage("");
    setIsSending(true);

    try {
      const result = await sendLoginOtp({
        dial_code: country.dialCode,
        phone,
        mode: "login",
      });
      setE164Phone(toE164Phone(country, phone));
      setDeliveredOtp(result.otp);
      setStep("verify");
      setResendSeconds(30);
      setOtp(result.otp ?? "");
      setSuccessMessage(
        result.otp
          ? "OTP ready — enter the code below to continue."
          : "OTP sent to your mobile number.",
      );
    } catch (error) {
      setDeliveredOtp(null);
      setPhoneError(
        error instanceof Error
          ? error.message
          : "Unable to send OTP. Please try again.",
      );
    } finally {
      setIsSending(false);
      sendLock.current = false;
    }
  };

  const handleVerifyOtp = async (code = otp) => {
    if (verifyLock.current || code.length !== 6) return;

    verifyLock.current = true;
    setOtpError("");
    setIsVerifying(true);

    try {
      const result = await verifyOtp({
        dial_code: country.dialCode,
        phone,
        otp: code,
        mode: "login",
      });
      finishLogin(result.user.phone, {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        name: result.user.name ?? undefined,
        email: result.user.email ?? undefined,
      });
    } catch (error) {
      setOtpError(
        error instanceof Error
          ? error.message
          : "Invalid OTP. Please try again.",
      );
      verifyLock.current = false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || isSending) return;
    setOtp("");
    setOtpError("");
    await handleSendOtp();
  };

  const passwordHref = (() => {
    const next = searchParams.get("next") ?? searchParams.get("redirect");
    const params = new URLSearchParams({ mode: "password" });
    if (next) params.set("next", next);
    return `${ROUTES.login}?${params.toString()}`;
  })();

  return (
    <AuthPageShell
      aside={<LoginServicesPanel compact className="w-full" />}
    >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.reveal}
          className="w-full min-w-0"
        >
          <AuthFormCard
            title={step === "phone" ? "Login with mobile" : "Enter OTP"}
            subtitle={
              step === "phone"
                ? `We'll send a one-time code from ${SITE_BRAND} to your number.`
                : `Code sent to ${e164Phone}`
            }
            hideBrandOnDesktop
            eyebrow={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e8da] bg-[#f5f7f0] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#5a7a12]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C6E31A]" strokeWidth={2.25} />
                Secure OTP verification
              </span>
            }
            footer={
              <p className="text-center text-xs text-[#5A6158] sm:text-sm">
                Prefer password?{" "}
                <Link
                  href={passwordHref}
                  className="font-semibold text-[#5a7a12] underline-offset-2 hover:text-[#111411] hover:underline"
                >
                  Sign in with password
                </Link>
              </p>
            }
          >
            {step === "verify" ? (
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setOtpError("");
                  setSuccessMessage("");
                  setDeliveredOtp(null);
                }}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6158] transition hover:text-[#111411]"
              >
                <ArrowLeft className="h-4 w-4" />
                Change number
              </button>
            ) : null}

            {step === "phone" ? (
              <div className="flex flex-col gap-4 sm:gap-5">
                <PhoneInput
                  country={country}
                  phone={phone}
                  onCountryChange={setCountry}
                  onPhoneChange={(value) => {
                    setPhone(value);
                    if (phoneError) setPhoneError("");
                  }}
                  error={phoneError}
                  disabled={isSending}
                />

                {successMessage ? (
                  <p className="text-sm font-medium text-[#3d6b2e]">
                    {successMessage}
                  </p>
                ) : null}

                <div className="space-y-3 pt-1">
                  <Button
                    type="button"
                    className={cn(
                      "h-11 w-full rounded-xl text-sm font-bold tracking-wide sm:h-12 sm:rounded-[14px] sm:text-[15px]",
                      BRAND_CTA_LIME,
                    )}
                    disabled={isSending}
                    onClick={() => void handleSendOtp()}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP…
                      </>
                    ) : (
                      <>
                        <Smartphone className="mr-2 h-4 w-4" />
                        Send OTP
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[11px] leading-relaxed text-[#8a9184]">
                    By continuing you agree to receive a one-time SMS from{" "}
                    {SITE_BRAND}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-5">
                {deliveredOtp ? (
                  <div className="rounded-xl border border-[#dce8a8] bg-[#f5f9e8] px-4 py-3 text-sm text-[#283614]">
                    <p className="font-semibold tracking-wide">Your verification code</p>
                    <p className="mt-1 font-heading text-2xl font-bold tracking-[0.18em] text-[#111411] sm:tracking-[0.28em]">
                      {deliveredOtp}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#5a6330]">
                      SMS delivery is delayed on the server. Use this code to verify
                      your number.
                    </p>
                  </div>
                ) : null}

                <OTPInput
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    if (otpError) setOtpError("");
                    if (val.length < 6) {
                      verifyLock.current = false;
                      setIsVerifying(false);
                      return;
                    }
                    void handleVerifyOtp(val);
                  }}
                  error={!!otpError}
                  length={6}
                />

                {otpError ? (
                  <p className="text-sm text-destructive">{otpError}</p>
                ) : null}

                <div className="space-y-3 pt-1">
                  <Button
                    type="button"
                    className={cn(
                      "h-11 w-full rounded-xl text-sm font-bold tracking-wide sm:h-12 sm:rounded-[14px] sm:text-[15px]",
                      BRAND_CTA_LIME,
                    )}
                    disabled={isVerifying || otp.length !== 6}
                    onClick={() => void handleVerifyOtp()}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <div className="text-center text-sm text-[#5A6158]">
                    {resendSeconds > 0 ? (
                      <span>
                        Resend OTP in{" "}
                        <span className="font-semibold text-[#111411]">
                          {resendSeconds}s
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleResend()}
                        className="font-semibold text-[#5a7a12] hover:text-[#111411] hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </AuthFormCard>
        </motion.div>
    </AuthPageShell>
  );
}
