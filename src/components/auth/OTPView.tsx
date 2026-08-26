"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCodeSelector } from "@/components/auth/CountryCodeSelector";
import { LoginSceneDecor } from "@/components/auth/LoginSceneDecor";
import { OTPInput } from "@/components/auth/OTPInput";
import { parseContactPhone, sendLoginOtp, verifyOtp, verifySignupOtp } from "@/lib/auth-api";
import {
  clearPendingOtpPhone,
  needsProfileSetup,
  resolvePostAuthDestination,
  setAuthSession,
  setPendingOtpPhone,
  setPostLoginRedirect,
} from "@/lib/auth-session";
import {
  defaultCountry,
  formatPhoneDisplay,
  getPhonePlaceholder,
  isValidPhoneNumber,
  parsePhoneDisplay,
  sanitizePhoneInput,
  type Country,
} from "@/lib/countries";
import { transitions } from "@/lib/motion";
import { ROUTES } from "@/constants/routes";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";

type OtpStep = "phone" | "verify";

export function OTPView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = searchParams.get("mode") === "signup";
  const urlPhone = searchParams.get("phone");
  const otpAlreadySent = searchParams.get("sent") === "1";

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [otpContact, setOtpContact] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const otpVerifyLock = useRef(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const next = searchParams.get("next") ?? searchParams.get("redirect");
    if (next) setPostLoginRedirect(next);
  }, [searchParams]);

  useEffect(() => {
    if (!urlPhone) return;
    setOtpContact(urlPhone);
    setPendingOtpPhone(urlPhone);

    if (otpAlreadySent) {
      setOtpStep("verify");
      setResendSeconds(30);
      return;
    }

    const sentKey = `bw-login-otp-sent:${urlPhone}:${isSignup ? "signup" : "login"}`;
    const lastSentAt = Number(sessionStorage.getItem(sentKey) || "0");
    if (Date.now() - lastSentAt < 25_000) {
      setOtpStep("verify");
      setResendSeconds(Math.max(0, 30 - Math.floor((Date.now() - lastSentAt) / 1000)));
      return;
    }

    let cancelled = false;
    setIsSendingOtp(true);
    setPhoneError("");
    void (async () => {
      try {
        const { dial_code, phone } = parseContactPhone(urlPhone);
        await sendLoginOtp({
          dial_code,
          phone,
          mode: isSignup ? "signup" : "login",
        });
        sessionStorage.setItem(sentKey, String(Date.now()));
        if (cancelled) return;
        setOtpStep("verify");
        setResendSeconds(30);
        setOtp("");
        setOtpError("");
      } catch (error) {
        if (cancelled) return;
        setOtpStep("phone");
        setPhoneError(
          error instanceof Error ? error.message : "Unable to send OTP. Please try again.",
        );
      } finally {
        if (!cancelled) setIsSendingOtp(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [urlPhone, otpAlreadySent, isSignup]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const getContact = () =>
    `${country.dialCode} ${formatPhoneDisplay(mobileNumber, country)}`;

  const finishAuth = useCallback(
    (
      phone: string,
      profile?: { name?: string; email?: string; accessToken?: string; refreshToken?: string }
    ) => {
      const profileComplete = !needsProfileSetup(profile?.name);
      setAuthSession({
        phone,
        verified: true,
        ...(profile?.name?.trim() ? { name: profile.name.trim() } : {}),
        ...(profile?.email?.trim() ? { email: profile.email.trim() } : {}),
        ...(profile?.accessToken ? { accessToken: profile.accessToken } : {}),
        ...(profile?.refreshToken ? { refreshToken: profile.refreshToken } : {}),
        profileComplete,
      });
      clearPendingOtpPhone();

      if (!profileComplete) {
        router.push(ROUTES.createProfile);
        return;
      }

      router.push(resolvePostAuthDestination());
    },
    [router]
  );

  const verifyOtpCode = useCallback(
    async (code: string) => {
      if (otpVerifyLock.current || code.length !== 6 || !otpContact) return;

      otpVerifyLock.current = true;
      setOtpError("");
      setIsVerifyingOtp(true);

      try {
        const { dial_code, phone } = parseContactPhone(otpContact);

        const result = isSignup
          ? await verifySignupOtp({ dial_code, phone, otp: code })
          : await verifyOtp({
              dial_code,
              phone,
              otp: code,
              mode: "login",
            });

        finishAuth(result.user.phone, {
          name: result.user.name ?? undefined,
          email: result.user.email ?? undefined,
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
        });
      } catch (error) {
        setOtpError(error instanceof Error ? error.message : "Invalid OTP. Please try again.");
        otpVerifyLock.current = false;
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [finishAuth, isSignup, otpContact]
  );

  const handleCountryChange = (selected: Country) => {
    setCountry(selected);
    setMobileNumber((prev) => sanitizePhoneInput(prev, selected));
    if (phoneError) setPhoneError("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhoneNumber(mobileNumber, country)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    setPhoneError("");
    setIsSendingOtp(true);

    try {
      const contact = getContact();
      await sendLoginOtp({
        dial_code: country.dialCode,
        phone: mobileNumber,
        mode: isSignup ? "signup" : "login",
      });

      setPendingOtpPhone(contact);
      setOtpContact(contact);
      setOtpStep("verify");
      setResendSeconds(30);
      setOtp("");
      setOtpError("");
      otpVerifyLock.current = false;
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "Unable to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpContact || resendSeconds > 0) return;
    setOtpError("");
    setIsSendingOtp(true);
    try {
      const { dial_code, phone } = parseContactPhone(otpContact);
      await sendLoginOtp({
        dial_code,
        phone,
        mode: isSignup ? "signup" : "login",
      });
      setOtp("");
      setResendSeconds(30);
      otpVerifyLock.current = false;
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Unable to resend OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleChangeNumber = () => {
    setOtpStep("phone");
    setOtp("");
    setOtpError("");
    otpVerifyLock.current = false;
    clearPendingOtpPhone();
  };

  return (
    <div className="relative flex min-h-[100dvh] overflow-y-auto bg-background font-sans">
      <LoginSceneDecor />

      <div className="relative z-10 flex w-full flex-col">
        <header className="flex h-16 items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push(isSignup ? ROUTES.signup : ROUTES.login)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.reveal}
          className="flex flex-1 items-start justify-center px-4 pb-8 sm:px-6"
        >
          <div className="w-full max-w-[440px] rounded-[20px] border border-border/60 bg-card p-6 shadow-[0_20px_60px_-24px_rgba(49,82,110,0.18)] sm:p-8">
            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold text-primary sm:text-[1.65rem]">
                {isSignup ? "Verify your number" : "Login with OTP"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {otpStep === "phone"
                  ? "Enter your mobile number to receive a one-time password"
                  : `Enter the 6-digit code sent to ${otpContact}`}
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp-phone" className="text-sm font-semibold text-foreground">
                  Mobile number
                </Label>
                <div className="flex gap-2">
                  <CountryCodeSelector
                    value={country}
                    onChange={handleCountryChange}
                    size="lg"
                    showDialCode
                    className="h-11 rounded-[18px] border-border bg-background px-2.5 shadow-sm sm:h-12"
                  />
                  <Input
                    id="otp-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder={getPhonePlaceholder(country)}
                    maxLength={country.maxLength + 1}
                    value={formatPhoneDisplay(mobileNumber, country)}
                    onChange={(e) => {
                      setMobileNumber(parsePhoneDisplay(e.target.value, country));
                      if (phoneError) setPhoneError("");
                      if (otpStep === "verify") handleChangeNumber();
                    }}
                    disabled={otpStep === "verify"}
                    aria-invalid={!!phoneError}
                    className={cn(
                      "h-11 min-w-0 flex-1 rounded-[18px] border-border bg-background sm:h-12",
                      phoneError && "border-destructive"
                    )}
                  />
                </div>
                {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
              </div>

              {otpStep === "phone" ? (
                <Button
                  type="submit"
                  disabled={isSendingOtp}
                  className={cn(
                    "h-11 w-full rounded-[16px] text-base font-bold sm:h-12",
                    BRAND_CTA_LIME,
                  )}
                >
                  {isSendingOtp ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending OTP…
                    </span>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  OTP sent to{" "}
                  <span className="font-medium text-foreground">{otpContact}</span>.{" "}
                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    className="font-medium text-primary hover:underline"
                  >
                    Change number
                  </button>
                </p>
              )}
            </form>

            <AnimatePresence>
              {otpStep === "verify" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={transitions.fast}
                  className="mt-6 space-y-4 border-t border-border/60 pt-6"
                >
                  <Label className="text-sm font-semibold text-foreground">Verify OTP</Label>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to your phone.
                  </p>
                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (otpError) setOtpError("");
                      if (val.length < 6) {
                        otpVerifyLock.current = false;
                        setIsVerifyingOtp(false);
                        return;
                      }
                      if (otpStep === "verify") {
                        void verifyOtpCode(val);
                      }
                    }}
                    error={!!otpError}
                  />
                  {otpError && <p className="text-sm text-destructive">{otpError}</p>}
                  {isVerifyingOtp && (
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying…
                    </p>
                  )}
                  <div className="text-center text-sm">
                    {resendSeconds > 0 ? (
                      <p className="text-muted-foreground">
                        Resend code in{" "}
                        <span className="font-medium text-foreground">
                          00:{resendSeconds.toString().padStart(2, "0")}
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-medium text-primary hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isSignup && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Prefer password?{" "}
                <Link href={ROUTES.login} className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
