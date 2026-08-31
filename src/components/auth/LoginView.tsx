"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Smartphone } from "lucide-react";
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
    "h-10 rounded-xl border-[#d7e0c0] bg-[#fbfcf6] text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all placeholder:text-muted-foreground/55 focus-visible:border-[#9BB820] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#B8D926]/25 sm:h-11 sm:rounded-2xl sm:text-base",
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto font-sans lg:h-[100dvh] lg:overflow-hidden"
    >
      <LoginSceneDecor />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-stretch justify-center px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-stretch lg:gap-6 lg:overflow-hidden lg:px-8 lg:py-5 xl:gap-10">
        <aside className="hidden min-h-0 w-full flex-1 lg:flex lg:max-w-[52%]">
          <LoginServicesPanel compact className="w-full" />
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.reveal, delay: 0.05 }}
          className="mx-auto flex w-full max-w-[420px] flex-col lg:mx-0 lg:min-h-0 lg:max-w-[420px] lg:flex-1 lg:flex-none xl:max-w-[440px]"
        >
          <AuthFormCard
            title="Welcome back"
            subtitle="Sign in to book rides, deliveries, and more."
            hideBrandOnDesktop
            className="min-h-0 flex-1 lg:flex-1"
            footer={
              <p className="text-center text-xs text-muted-foreground sm:text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href={ROUTES.signup}
                  className="font-bold text-[#6B7A14] underline-offset-2 hover:text-[#38471B] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            }
          >
            <form onSubmit={handleSubmit} className="flex h-full flex-col gap-2.5 sm:gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="phone" className="text-xs font-semibold text-[#38471B] sm:text-sm">
                  Phone number
                </Label>
                <div className="flex gap-2">
                  <CountryCodeSelector
                    value={country}
                    onChange={handleCountryChange}
                    size="default"
                    showDialCode
                    className="h-10 max-w-[7.5rem] rounded-xl border-[#d7e0c0] bg-[#fbfcf6] px-2 shadow-sm sm:h-11 sm:max-w-none sm:rounded-2xl sm:px-2.5"
                  />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Phone number"
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

              <div className="flex flex-col gap-1">
                <Label htmlFor="password" className="text-xs font-semibold text-[#38471B] sm:text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5a6330]/70 sm:h-4 sm:w-4" />
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
                    className={cn(fieldClass(!!passwordError), "pl-9 pr-10 sm:pl-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#f0f5dc] hover:text-[#38471B]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
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

              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <label className="flex cursor-pointer items-center gap-1.5 text-[#5a6330]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[#d7e0c0] accent-[#9BB820]"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="shrink-0 font-medium text-[#5a6330] transition-colors hover:text-[#38471B]"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              <div className="mt-auto space-y-2 pt-1 sm:space-y-2.5">
                <motion.div whileTap={{ scale: 0.985 }} transition={transitions.fast}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "h-10 w-full rounded-xl text-sm font-bold tracking-wide sm:h-11 sm:rounded-2xl sm:text-base",
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
                    <div className="w-full border-t border-[#e4ecc8]" />
                  </div>
                  <p className="relative mx-auto w-fit bg-white px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#5a6330]/75">
                    or continue with
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isSendingOtp || isSubmitting}
                  onClick={() => void handleOtpContinue()}
                  className="h-10 w-full rounded-xl border-[#d7e0c0] bg-white text-sm font-semibold text-[#38471B] shadow-sm transition-colors hover:border-[#B8D926] hover:bg-[#fbfcf6] sm:h-11 sm:rounded-2xl"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Sending OTP…
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-1.5 h-4 w-4 text-[#9BB820]" />
                      Continue with OTP
                    </>
                  )}
                </Button>
              </div>
            </form>
          </AuthFormCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
