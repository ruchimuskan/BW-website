"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { CountryCodeSelector } from "@/components/auth/CountryCodeSelector";
import { LoginSceneDecor } from "@/components/auth/LoginSceneDecor";
import { LoginServicesPanel } from "@/components/auth/LoginServicesPanel";
import { ROUTES } from "@/constants/routes";
import { setPendingOtpPhone } from "@/lib/auth-session";
import { sendSignupOtp } from "@/lib/auth-api";
import {
  defaultCountry,
  formatPhoneDisplay,
  getPhonePlaceholder,
  isValidPhoneNumber,
  parsePhoneDisplay,
  sanitizePhoneInput,
  type Country,
} from "@/lib/countries";
import { easeOut, transitions } from "@/lib/motion";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import {
  getEmailValidationError,
  getFullNameValidationError,
  getPasswordValidationError,
  passwordStrengthScore,
} from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const strengthMeta = [
  { label: "Too short", color: "bg-destructive/70" },
  { label: "Weak", color: "bg-[#E8A95A]" },
  { label: "Fair", color: "bg-[#C8E84A]" },
  { label: "Good", color: "bg-[#9BB820]" },
  { label: "Strong", color: "bg-[#5FA87A]" },
] as const;

const fieldClass = (hasError: boolean) =>
  cn(
    "h-10 rounded-xl border-[#d7e0c0] bg-[#fbfcf6] text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all placeholder:text-muted-foreground/55 focus-visible:border-[#9BB820] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#B8D926]/25 sm:h-11 sm:rounded-2xl sm:text-base",
    hasError &&
      "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
  );

export function SignupView() {
  const router = useRouter();

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrengthScore(password), [password]);
  const strengthInfo = strengthMeta[password ? strength : 0];

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

  const clearError = (key: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    const nameError = getFullNameValidationError(fullName);
    if (nameError) next.name = nameError;

    if (!isValidPhoneNumber(mobileNumber, country)) {
      next.phone = "Please enter a valid phone number";
    }

    const emailError = getEmailValidationError(email);
    if (emailError) next.email = emailError;

    const passwordError = getPasswordValidationError(password);
    if (passwordError) next.password = passwordError;

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }

    if (!termsAgreed) {
      next.terms = "You must agree to continue";
    }

    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendSignupOtp({
        dial_code: country.dialCode,
        phone: mobileNumber,
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        password,
        confirm_password: confirmPassword,
        terms_agreed: termsAgreed,
      });

      setPendingOtpPhone(result.phone);
      router.push(
        `${ROUTES.otp}?phone=${encodeURIComponent(result.phone)}&mode=signup&sent=1`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create account. Please try again.";

      if (message.toLowerCase().includes("passwords do not match")) {
        setErrors((prev) => ({ ...prev, confirmPassword: message }));
      } else if (message.toLowerCase().includes("already registered")) {
        setErrors((prev) => ({ ...prev, phone: message }));
      } else if (message.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else {
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
          className="mx-auto flex h-full w-full max-w-[420px] flex-col lg:mx-0 lg:min-h-0 lg:max-w-[420px] lg:flex-1 lg:flex-none xl:max-w-[440px]"
        >
          <AuthFormCard
            title="Join Bull Wave Rides"
            subtitle="Create your account to start riding in minutes."
            hideBrandOnDesktop
            className="min-h-0 flex-1"
            footer={
              <p className="text-center text-xs text-muted-foreground sm:text-sm">
                Already have an account?{" "}
                <Link
                  href={`${ROUTES.login}?mode=password`}
                  className="font-bold text-[#6B7A14] underline-offset-2 hover:text-[#38471B] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            }
          >
            <form
              onSubmit={handleSubmit}
              className="flex h-full flex-col gap-2 sm:gap-3"
            >
              <div className="flex flex-col gap-1">
                <Label htmlFor="fullName" className="text-xs font-semibold text-[#38471B] sm:text-sm">
                  Full name
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5a6330]/70 sm:h-4 sm:w-4" />
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearError("name");
                    }}
                    aria-invalid={!!errors.name}
                    className={cn(fieldClass(!!errors.name), "pl-9 sm:pl-10")}
                  />
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-medium text-destructive"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="phone" className="text-xs font-semibold text-[#38471B] sm:text-sm">
                  Phone number
                </Label>
                <div className="flex gap-2">
                  <CountryCodeSelector
                    value={country}
                    onChange={(selected) => {
                      setCountry(selected);
                      setMobileNumber((prev) => sanitizePhoneInput(prev, selected));
                      clearError("phone");
                    }}
                    size="default"
                    showDialCode
                    className="h-10 max-w-[7.5rem] rounded-xl border-[#d7e0c0] bg-[#fbfcf6] px-2 shadow-sm sm:h-11 sm:max-w-none sm:rounded-2xl sm:px-2.5"
                  />
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder={getPhonePlaceholder(country)}
                      maxLength={country.maxLength + 1}
                      value={formatPhoneDisplay(mobileNumber, country)}
                      onChange={(e) => {
                        setMobileNumber(parsePhoneDisplay(e.target.value, country));
                        clearError("phone");
                      }}
                      aria-invalid={!!errors.phone}
                      className={cn(fieldClass(!!errors.phone), "min-w-0 flex-1")}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-medium text-destructive"
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="email" className="text-xs font-semibold text-[#38471B] sm:text-sm">
                    Email <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5a6330]/70 sm:h-4 sm:w-4" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      aria-invalid={!!errors.email}
                      className={cn(fieldClass(!!errors.email), "pl-9 sm:pl-10")}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-medium text-destructive"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="password" className="text-xs font-semibold text-[#38471B] sm:text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min. 8 chars, A-z, 0-9 & symbol"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError("password");
                      }}
                      aria-invalid={!!errors.password}
                      className={cn(fieldClass(!!errors.password), "pr-9")}
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
                  {password ? (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex gap-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-0.5 flex-1 rounded-full transition-colors",
                              i < strength ? strengthInfo.color : "bg-[#e8eed4]",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-medium text-[#5a6330]/85">
                        {strengthInfo.label}
                      </p>
                    </div>
                  ) : null}
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-medium text-destructive"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold text-[#38471B] sm:text-sm"
                  >
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearError("confirmPassword");
                      }}
                      aria-invalid={!!errors.confirmPassword}
                      className={cn(fieldClass(!!errors.confirmPassword), "pr-9")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#f0f5dc] hover:text-[#38471B]"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-medium text-destructive"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

                <p className="text-[10px] leading-snug text-[#5a6330]/85 sm:text-xs">
                  Use 8+ characters with upper &amp; lowercase, a number, and a symbol.
                </p>
              <div className="rounded-xl border border-[#e4ecc8] bg-[#fbfcf6]/80 px-2.5 py-2 sm:rounded-2xl sm:px-3 sm:py-2.5">
                <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-snug text-[#5a6330] sm:text-xs">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => {
                      setTermsAgreed(e.target.checked);
                      clearError("terms");
                    }}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[#d7e0c0] accent-[#9BB820]"
                  />
                  <span>
                    I agree to Bull Wave Rides&apos;s{" "}
                    <Link href={ROUTES.terms} className="font-semibold text-[#6B7A14] hover:underline">
                      Terms
                    </Link>
                    ,{" "}
                    <Link href={ROUTES.privacy} className="font-semibold text-[#6B7A14] hover:underline">
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link href={ROUTES.safety} className="font-semibold text-[#6B7A14] hover:underline">
                      Safety Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs font-medium text-destructive">{errors.terms}</p>
                )}
              </div>

              {submitError && (
                <p className="rounded-lg border border-destructive/20 bg-[#fff6f4] px-2.5 py-1.5 text-xs font-medium text-destructive">
                  {submitError}
                </p>
              )}

              <div className="mt-auto space-y-1.5 pt-1">
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
                        Sending OTP…
                      </span>
                    ) : (
                      "Send OTP & Continue"
                    )}
                  </Button>
                </motion.div>
                <p className="text-center text-[10px] text-[#5a6330]/85 sm:text-xs">
                  OTP will be sent to verify your phone number
                </p>
              </div>
            </form>
          </AuthFormCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
