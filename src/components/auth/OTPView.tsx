"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { CountryCodeSelector } from "@/components/auth/CountryCodeSelector";
import { OTPInput } from "@/components/auth/OTPInput";
import { parseContactPhone, resolveOtpForDisplay, sendLoginOtp, verifyOtp, verifySignupOtp } from "@/lib/auth-api";
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
  findCountryByDialCode,
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
  const [deliveredOtp, setDeliveredOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const otpVerifyLock = useRef(false);

  const applyContactToInputs = useCallback((contact: string) => {
    try {
      const { dial_code, phone } = parseContactPhone(contact);
      const nextCountry = findCountryByDialCode(dial_code);
      setCountry(nextCountry);
      setMobileNumber(sanitizePhoneInput(phone, nextCountry));
    } catch {
      // Keep whatever the user already typed.
    }
  }, []);

  useEffect(() => {
    const next = searchParams.get("next") ?? searchParams.get("redirect");
    if (next) setPostLoginRedirect(next);
  }, [searchParams]);

  useEffect(() => {
    if (!urlPhone) return;
    setOtpContact(urlPhone);
    setPendingOtpPhone(urlPhone);
    applyContactToInputs(urlPhone);

    if (otpAlreadySent) {
      setOtpStep("verify");
      setResendSeconds(30);
      setDeliveredOtp(resolveOtpForDisplay(null));
      setOtp(resolveOtpForDisplay(null) ?? "");
      return;
    }

    const sentKey = `bw-login-otp-sent:${urlPhone}:${isSignup ? "signup" : "login"}`;
    const lastSentAt = Number(sessionStorage.getItem(sentKey) || "0");
    if (Date.now() - lastSentAt < 25_000) {
      setOtpStep("verify");
      setResendSeconds(Math.max(0, 30 - Math.floor((Date.now() - lastSentAt) / 1000)));
      setDeliveredOtp(resolveOtpForDisplay(null));
      setOtp(resolveOtpForDisplay(null) ?? "");
      return;
    }

    let cancelled = false;
    setIsSendingOtp(true);
    setPhoneError("");
    void (async () => {
      try {
        const { dial_code, phone } = parseContactPhone(urlPhone);
        const result = await sendLoginOtp({
          dial_code,
          phone,
          mode: isSignup ? "signup" : "login",
        });
        sessionStorage.setItem(sentKey, String(Date.now()));
        if (cancelled) return;
        setDeliveredOtp(result.otp);
        setOtpStep("verify");
        setResendSeconds(30);
        setOtp(result.otp ?? "");
        setOtpError("");
      } catch (error) {
        if (cancelled) return;
        setDeliveredOtp(null);
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
  }, [urlPhone, otpAlreadySent, isSignup, applyContactToInputs]);

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
      const accessToken = profile?.accessToken?.trim();
      if (!accessToken) {
        setOtpError("Verification succeeded without an access token. Please try again.");
        return;
      }

      const profileComplete = !needsProfileSetup(profile?.name, profile?.email);
      setAuthSession({
        phone,
        verified: true,
        ...(profile?.name?.trim() ? { name: profile.name.trim() } : {}),
        ...(profile?.email?.trim() ? { email: profile.email.trim() } : {}),
        accessToken,
        ...(profile?.refreshToken ? { refreshToken: profile.refreshToken } : {}),
        profileComplete,
      });
      clearPendingOtpPhone();

      if (!profileComplete) {
        router.replace(ROUTES.createProfile);
        return;
      }

      router.replace(resolvePostAuthDestination());
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
    if (otpStep === "verify") {
      setOtp("");
      setOtpError("");
      setDeliveredOtp(null);
      setOtpStep("phone");
      otpVerifyLock.current = false;
      clearPendingOtpPhone();
    }
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
      const result = await sendLoginOtp({
        dial_code: country.dialCode,
        phone: mobileNumber,
        mode: isSignup ? "signup" : "login",
      });

      setPendingOtpPhone(contact);
      setOtpContact(contact);
      applyContactToInputs(contact);
      setDeliveredOtp(result.otp);
      setOtpStep("verify");
      setResendSeconds(30);
      setOtp(result.otp ?? "");
      setOtpError("");
      otpVerifyLock.current = false;
    } catch (error) {
      setDeliveredOtp(null);
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
      const result = await sendLoginOtp({
        dial_code,
        phone,
        mode: isSignup ? "signup" : "login",
      });
      setDeliveredOtp(result.otp);
      setOtp(result.otp ?? "");
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
    setDeliveredOtp(null);
    otpVerifyLock.current = false;
    clearPendingOtpPhone();
  };

  return (
    <AuthPageShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.reveal}
        className="w-full min-w-0"
      >
        <AuthFormCard
          title={isSignup ? "Verify your number" : "Login with OTP"}
          subtitle={
            otpStep === "phone"
              ? "Enter your mobile number to receive a one-time password"
              : `Enter the 6-digit code sent to ${otpContact}`
          }
          footer={
            !isSignup ? (
              <p className="text-center text-xs text-muted-foreground sm:text-sm">
                Prefer password?{" "}
                <Link href={ROUTES.login} className="font-semibold text-[#5a7a12] hover:underline">
                  Sign in
                </Link>
              </p>
            ) : undefined
          }
        >
          <button
            type="button"
            onClick={() => router.push(isSignup ? ROUTES.signup : ROUTES.login)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6158] transition hover:text-[#111411]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

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
                    className="h-11 max-w-[6.75rem] rounded-[18px] border-border bg-background px-2 shadow-sm sm:h-12 sm:max-w-none sm:px-2.5"
                  />
                  <Input
                    id="otp-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    autoFocus
                    placeholder={getPhonePlaceholder(country)}
                    maxLength={country.maxLength + 1}
                    value={formatPhoneDisplay(mobileNumber, country)}
                    onChange={(e) => {
                      setMobileNumber(parsePhoneDisplay(e.target.value, country));
                      if (phoneError) setPhoneError("");
                      if (otpStep === "verify") handleChangeNumber();
                    }}
                    disabled={isSendingOtp}
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
                  {deliveredOtp ? (
                    <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm">
                      <p className="font-semibold text-foreground">Your verification code</p>
                      <p className="mt-1 font-heading text-2xl font-bold tracking-[0.28em] text-foreground">
                        {deliveredOtp}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        SMS delivery is delayed on the server. Use this code to continue.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to your phone.
                    </p>
                  )}
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
                  <Button
                    type="button"
                    disabled={isVerifyingOtp || otp.length !== 6}
                    onClick={() => void verifyOtpCode(otp)}
                    className={cn(
                      "h-11 w-full rounded-[16px] text-base font-bold sm:h-12",
                      BRAND_CTA_LIME,
                    )}
                  >
                    {isVerifyingOtp ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
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
        </AuthFormCard>
      </motion.div>
    </AuthPageShell>
  );
}
