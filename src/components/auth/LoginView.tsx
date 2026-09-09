"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { CountryCodeSelector } from "@/components/auth/CountryCodeSelector";
import { LoginSceneDecor } from "@/components/auth/LoginSceneDecor";
import { LoginServicesPanel } from "@/components/auth/LoginServicesPanel";
import { ROUTES } from "@/constants/routes";
import {
  isAuthenticated,
  needsProfileSetup,
  resolvePostAuthDestination,
  setAuthSession,
  setPostLoginRedirect,
} from "@/lib/auth-session";
import {
  defaultCountry,
  formatPhoneDisplay,
  isValidPhoneNumber,
  parsePhoneDisplay,
  sanitizePhoneInput,
  type Country,
} from "@/lib/countries";
import { easeOut, transitions } from "@/lib/motion";
import { loginWithPassword, sendLoginOtp } from "@/lib/auth-api";
import { setPendingOtpPhone } from "@/lib/auth-session";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";

const fieldClass = (hasError: boolean) =>
  cn(
    "h-11 rounded-xl border-[#d4dbc8] bg-[#f5f7f0] text-sm text-[#111411] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-all placeholder:text-[#8a9184] focus-visible:border-[#C6E31A] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#C6E31A]/30 sm:h-12 sm:rounded-[14px] sm:text-[15px]",
    hasError &&
      "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
  );

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    const next = searchParams.get("next") ?? searchParams.get("redirect");
    if (next?.startsWith("/")) setPostLoginRedirect(next);
    router.replace(resolvePostAuthDestination());
  }, [router, searchParams]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      document.body.style.overflow = mq.matches ? "hidden" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = "";
    };
  }, []);

  const validatePhone = () => {
    if (!isValidPhoneNumber(mobileNumber, country)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleCountryChange = (selected: Country) => {
    setCountry(selected);
    setMobileNumber((prev) => sanitizePhoneInput(prev, selected));
    if (phoneError) setPhoneError("");
  };

  const finishLogin = async (
    phone: string,
    profile?: {
      name?: string | null;
      email?: string | null;
      accessToken?: string;
      refreshToken?: string;
    },
  ) => {
    const next = searchParams.get("next") ?? searchParams.get("redirect");
    if (next) setPostLoginRedirect(next);

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

    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsExiting(true);

    const destination = profileComplete
      ? resolvePostAuthDestination()
      : ROUTES.createProfile;
    await new Promise((resolve) => setTimeout(resolve, reduceMotion ? 0 : 400));
    router.push(destination);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!validatePhone()) return;

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithPassword({
        dial_code: country.dialCode,
        phone: mobileNumber,
        password,
        remember,
      });

      await finishLogin(result.user.phone, {
        name: result.user.name,
        email: result.user.email,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      });
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpContinue = async () => {
    if (!validatePhone()) return;
    const next = searchParams.get("next") ?? searchParams.get("redirect");
    setIsSendingOtp(true);
    setPhoneError("");
    try {
      const result = await sendLoginOtp({
        dial_code: country.dialCode,
        phone: mobileNumber,
        mode: "login",
      });
      setPendingOtpPhone(result.phone);
      const params = new URLSearchParams();
      params.set("phone", result.phone);
      params.set("mode", "login");
      params.set("sent", "1");
      if (next) params.set("next", next);
      router.push(`${ROUTES.otp}?${params.toString()}`);
    } catch (error) {
      setPhoneError(
        error instanceof Error ? error.message : "Unable to send OTP. Please try again.",
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const otpHref = (() => {
    const next = searchParams.get("next") ?? searchParams.get("redirect");
    const params = new URLSearchParams();
    if (next) params.set("next", next);
    const qs = params.toString();
    return qs ? `${ROUTES.login}?${qs}` : ROUTES.login;
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto font-sans lg:h-[100dvh] lg:overflow-hidden"
    >
      <LoginSceneDecor />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-stretch justify-center gap-4 px-3 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-stretch lg:gap-7 lg:overflow-hidden lg:px-8 lg:py-6 xl:gap-10">
        <aside className="hidden min-h-0 w-full flex-1 lg:flex lg:max-w-[52%]">
          <LoginServicesPanel compact className="w-full" />
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.reveal, delay: 0.05 }}
          className="mx-auto flex w-full max-w-[420px] flex-col justify-center lg:mx-0 lg:max-w-[430px] lg:flex-none xl:max-w-[450px]"
        >
          <AuthFormCard
            title="Welcome back"
            subtitle="Sign in to book rides, deliveries, and more."
            hideBrandOnDesktop
            eyebrow={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e8da] bg-[#f5f7f0] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#5a7a12]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C6E31A]" strokeWidth={2.25} />
                Secure account access
              </span>
            }
            footer={
              <p className="text-center text-xs text-[#5A6158] sm:text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href={ROUTES.signup}
                  className="font-bold text-[#5a7a12] underline-offset-2 hover:text-[#111411] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            }
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold text-[#111411] sm:text-[13px]"
                >
                  Phone number
                </Label>
                <div className="flex gap-2">
                  <CountryCodeSelector
                    value={country}
                    onChange={handleCountryChange}
                    size="default"
                    showDialCode
                    className="h-11 max-w-[7.5rem] rounded-xl border-[#d4dbc8] bg-[#f5f7f0] px-2 shadow-sm sm:h-12 sm:max-w-none sm:rounded-[14px] sm:px-2.5"
                  />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="00000 00000"
                    maxLength={country.maxLength + 1}
                    value={formatPhoneDisplay(mobileNumber, country)}
                    onChange={(e) => {
                      setMobileNumber(parsePhoneDisplay(e.target.value, country));
                      if (phoneError) setPhoneError("");
                    }}
                    aria-invalid={!!phoneError}
                    className={cn(fieldClass(!!phoneError), "min-w-0 flex-1")}
                  />
                </div>
                <AnimatePresence>
                  {phoneError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-destructive"
                    >
                      {phoneError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-[#111411] sm:text-[13px]"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9184]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    aria-invalid={!!passwordError}
                    className={cn(fieldClass(!!passwordError), "pl-10 pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8a9184] hover:bg-[#eef2e3] hover:text-[#111411]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-destructive"
                    >
                      {passwordError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs sm:text-[13px]">
                <label className="flex cursor-pointer items-center gap-2 text-[#5A6158]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[#d4dbc8] accent-[#9BB820]"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="shrink-0 font-semibold text-[#5a7a12] transition-colors hover:text-[#111411]"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              <div className="space-y-3 pt-1">
                <motion.div whileTap={{ scale: 0.985 }} transition={transitions.fast}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "h-11 w-full rounded-xl text-sm font-bold tracking-wide sm:h-12 sm:rounded-[14px] sm:text-[15px]",
                      BRAND_CTA_LIME,
                    )}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in…
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>

                <div className="relative py-0.5">
                  <div className="absolute inset-0 flex items-center" aria-hidden>
                    <div className="w-full border-t border-[#e8ecdf]" />
                  </div>
                  <p className="relative mx-auto w-fit bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a9184]">
                    or
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isSendingOtp || isSubmitting}
                  onClick={() => void handleOtpContinue()}
                  className="h-11 w-full rounded-xl border-[#d4dbc8] bg-[#fafbf7] text-sm font-semibold text-[#111411] shadow-sm transition-colors hover:border-[#C6E31A] hover:bg-white sm:h-12 sm:rounded-[14px]"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Sending OTP…
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-1.5 h-4 w-4 text-[#5a7a12]" />
                      Continue with OTP
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] text-[#8a9184]">
                  Prefer the OTP screen?{" "}
                  <Link
                    href={otpHref}
                    className="font-semibold text-[#5a7a12] hover:text-[#111411] hover:underline"
                  >
                    Start with mobile
                  </Link>
                </p>
              </div>
            </form>
          </AuthFormCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
