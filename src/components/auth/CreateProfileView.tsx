"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginServicesPanel } from "@/components/auth/LoginServicesPanel";
import { OTPInput } from "@/components/auth/OTPInput";
import { ROUTES } from "@/constants/routes";
import { parseContactPhone } from "@/lib/auth-api";
import {
  clearAuthSession,
  getAuthSession,
  isPlaceholderDisplayName,
  markProfileComplete,
  needsProfileSetup,
  resolvePostAuthDestination,
  setAuthSession,
} from "@/lib/auth-session";
import { isAuthErrorMessage } from "@/lib/api";
import { getProfile, updateProfile } from "@/lib/profile-api";
import {
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
} from "@/lib/email-verify-api";
import {
  defaultCountry,
  findCountryByDialCode,
  formatPhoneDisplay,
} from "@/lib/countries";
import { transitions } from "@/lib/motion";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import {
  getEmailValidationError,
  getFullNameValidationError,
  isPlaceholderEmail,
} from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

const inputClass = (hasError: boolean) =>
  cn(
    "h-11 w-full min-w-0 rounded-xl border-border bg-background text-base text-foreground transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 sm:h-12 sm:rounded-[18px]",
    hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
  );

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

type Step = "details" | "email-otp";

function formatVerifiedPhone(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  const digits = value.replace(/\D/g, "");

  if (digits.length >= 12 && digits.startsWith("91")) {
    const national = digits.slice(2).replace(/^0+/, "").slice(0, 10);
    if (national.length === 10) {
      return `+91 ${formatPhoneDisplay(national, defaultCountry)}`;
    }
  }

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91 ${formatPhoneDisplay(digits, defaultCountry)}`;
  }

  try {
    const { dial_code, phone } = parseContactPhone(value);
    const country = findCountryByDialCode(dial_code);
    const national = phone.replace(/^0+/, "") || phone;
    if (!isValidForCountry(national, country)) return `${dial_code} ${national}`;
    return `${dial_code} ${formatPhoneDisplay(national, country)}`;
  } catch {
    return digits ? `+${digits}` : value;
  }
}

function isValidForCountry(
  national: string,
  country: { minLength: number; maxLength: number },
): boolean {
  return national.length >= country.minLength && national.length <= country.maxLength;
}

export function CreateProfileView() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [otp, setOtp] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const saveLock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const session = getAuthSession();
    if (!session?.accessToken?.trim()) {
      setIsHydrating(false);
      router.replace(ROUTES.login);
      return;
    }

    void (async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;

        const rawName = profile.full_name?.trim() || session.name?.trim() || "";
        const name = isPlaceholderDisplayName(rawName) ? "" : rawName;
        const backendEmail = profile.email?.trim() || "";
        const sessionEmail =
          session.email && !isPlaceholderEmail(session.email)
            ? session.email.trim()
            : "";
        const nextEmail = backendEmail || sessionEmail;
        const nextPhone = profile.phone?.trim() || session.phone;
        const nextGender = profile.gender?.trim().toLowerCase() || "";

        setPhone(nextPhone);
        setFullName(name);
        if (nextEmail && !isPlaceholderEmail(nextEmail)) setEmail(nextEmail);
        if (nextGender && GENDER_OPTIONS.some((option) => option.value === nextGender)) {
          setGender(nextGender);
        }
        if (profile.referral_code?.trim()) {
          setReferralCode(profile.referral_code.trim().toUpperCase());
        }

        setAuthSession({
          ...session,
          phone: nextPhone,
          verified: true,
          ...(name ? { name } : { name: undefined }),
          ...(nextEmail && !isPlaceholderEmail(nextEmail) ? { email: nextEmail } : {}),
          profileComplete: !needsProfileSetup(name, nextEmail),
        });

        if (!needsProfileSetup(name, nextEmail)) {
          markProfileComplete({ name, email: nextEmail });
          router.replace(resolvePostAuthDestination());
          return;
        }
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "";
        if (isAuthErrorMessage(message)) {
          clearAuthSession();
          router.replace(ROUTES.login);
          return;
        }
        setPhone(session.phone);
        setFullName(
          session.name && !isPlaceholderDisplayName(session.name)
            ? session.name.trim()
            : "",
        );
        if (session.email && !isPlaceholderEmail(session.email)) {
          setEmail(session.email.trim());
        }
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSendEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setNameError("");
    setEmailError("");
    setGenderError("");

    const trimmedName = fullName.trim();
    const nameErrorMsg = getFullNameValidationError(trimmedName);
    if (nameErrorMsg) {
      setNameError(nameErrorMsg);
      return;
    }

    const emailErrorMsg = getEmailValidationError(email, {
      required: true,
      fullName: trimmedName,
    });
    if (emailErrorMsg) {
      setEmailError(emailErrorMsg);
      return;
    }

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setEmailError("Email addresses do not match");
      return;
    }

    if (!gender) {
      setGenderError("Please select your gender");
      return;
    }

    setIsSubmitting(true);
    try {
      const sent = await sendEmailVerificationCode(email, trimmedName);
      setEmail(sent.email);
      setInfo(sent.message);
      setOtp("");
      setOtpError("");
      setStep("email-otp");
    } catch (error) {
      setEmailError(
        error instanceof Error
          ? error.message
          : "Unable to send a verification email to this address.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndSave = async (code = otp) => {
    if (code.length !== 6 || saveLock.current) return;
    saveLock.current = true;
    setOtpError("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const verifiedEmail = await verifyEmailVerificationCode(email, code);
      const trimmedName = fullName.trim();
      const saved = await updateProfile({
        full_name: trimmedName,
        gender,
        email: verifiedEmail,
        ...(referralCode.trim() ? { referral_code: referralCode.trim() } : {}),
      });

      const fromBackend = await getProfile().catch(() => saved);
      const persistedEmail = fromBackend.email?.trim().toLowerCase();
      if (persistedEmail !== verifiedEmail) {
        throw new Error("The server did not save this email. Please try again.");
      }

      markProfileComplete({
        name: fromBackend.full_name || trimmedName,
        email: persistedEmail,
      });

      router.replace(resolvePostAuthDestination());
    } catch (error) {
      saveLock.current = false;
      const message = error instanceof Error ? error.message : "";
      if (isAuthErrorMessage(message)) {
        clearAuthSession();
        router.replace(ROUTES.login);
        return;
      }
      setOtpError(message || "Unable to save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayPhone = formatVerifiedPhone(phone);

  return (
    <AuthPageShell aside={<LoginServicesPanel compact className="w-full" />}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.reveal}
        className="w-full min-w-0"
      >
        <AuthFormCard
          hideBrandOnDesktop
          title={step === "email-otp" ? "Verify your email" : "Complete your profile"}
          subtitle={
            step === "email-otp"
              ? `Enter the 6-digit code sent to ${email}.`
              : "Your number is already verified. Add your name and a working email from your inbox."
          }
          eyebrow={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e8da] bg-[#f5f7f0] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#5a7a12]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#C6E31A]" strokeWidth={2.25} />
              Signed in with OTP
            </span>
          }
          footer={
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
              By continuing, you agree to BW Rides&apos;s{" "}
              <Link href={ROUTES.terms} className="font-semibold text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href={ROUTES.privacy} className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          }
        >
          {isHydrating ? (
            <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-[#5a7a12]" />
              Loading your profile…
            </div>
          ) : (
            <>
          {displayPhone ? (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#e4e8da] bg-[#f7f8f3] px-3.5 py-3 sm:mb-5 sm:rounded-[16px] sm:px-4">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5a7a12]" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Verified mobile
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
                  {displayPhone}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    clearAuthSession();
                    router.replace(ROUTES.login);
                  }}
                  className="mt-1 text-xs font-semibold text-primary hover:underline"
                >
                  Use a different number
                </button>
              </div>
            </div>
          ) : null}

          {step === "details" ? (
          <form onSubmit={(e) => void handleSendEmailCode(e)} className="flex flex-col gap-3.5 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                Full name
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  aria-invalid={!!nameError}
                  className={cn(inputClass(!!nameError), "pl-10")}
                />
              </div>
              <AnimatePresence>
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium text-destructive"
                  >
                    {nameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  aria-invalid={!!emailError}
                  className={cn(inputClass(!!emailError), "pl-10")}
                />
              </div>
              <Label htmlFor="confirmEmail" className="pt-1 text-sm font-semibold text-foreground">
                Confirm email
              </Label>
              <Input
                id="confirmEmail"
                type="email"
                autoComplete="off"
                placeholder="Re-enter the same email"
                value={confirmEmail}
                onChange={(e) => {
                  setConfirmEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                aria-invalid={!!emailError}
                className={inputClass(!!emailError)}
              />
              <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                Use an inbox you can open. Placeholder addresses are blocked.
              </p>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium text-destructive"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-semibold text-foreground">Gender</Label>
              <div className="grid grid-cols-3 gap-1.5 min-[380px]:gap-2">
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={gender === option.value}
                    onClick={() => {
                      setGender(option.value);
                      if (genderError) setGenderError("");
                    }}
                    className={cn(
                      "h-10 min-w-0 rounded-xl border text-[13px] font-medium transition-colors sm:h-11 sm:rounded-[16px] sm:text-sm",
                      gender === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/30",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {genderError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium text-destructive"
                  >
                    {genderError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="referralCode" className="text-sm font-semibold text-primary">
                Referral code
              </Label>
              <Input
                id="referralCode"
                type="text"
                autoCapitalize="characters"
                placeholder="Optional"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className={inputClass(false)}
              />
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                You can also apply a code later from Refer & Earn.
              </p>
            </div>

            {submitError && (
              <p className="text-sm font-medium text-destructive">{submitError}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "h-11 w-full rounded-xl text-sm font-bold sm:h-12 sm:rounded-[16px] sm:text-base",
                BRAND_CTA_LIME,
              )}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending code…
                </span>
              ) : (
                "Send email code"
              )}
            </Button>
          </form>
          ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleVerifyAndSave();
            }}
            className="flex flex-col gap-4"
          >
            {info ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
                {info}
              </p>
            ) : null}
            <div className="flex min-w-0 flex-col items-center">
              <Label className="mb-3 self-start text-sm font-semibold">6-digit code</Label>
              <OTPInput
                value={otp}
                error={!!otpError}
                onChange={(val) => {
                  setOtp(val);
                  if (otpError) setOtpError("");
                  if (val.length === 6) void handleVerifyAndSave(val);
                }}
              />
            </div>
            {otpError ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {otpError}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={otp.length !== 6 || isSubmitting}
              className={cn(
                "h-11 w-full rounded-xl text-sm font-bold sm:h-12 sm:rounded-[16px] sm:text-base",
                BRAND_CTA_LIME,
              )}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                "Verify and continue"
              )}
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-primary"
              onClick={() => {
                setStep("details");
                setOtp("");
                setOtpError("");
              }}
            >
              Change email
            </button>
          </form>
          )}
            </>
          )}
        </AuthFormCard>
      </motion.div>
    </AuthPageShell>
  );
}
