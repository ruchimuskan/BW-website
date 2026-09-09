"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  KeyRound,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { SettingsPageLayout } from "@/components/layout/SettingsPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCodeSelector } from "@/components/auth/CountryCodeSelector";
import { ROUTES } from "@/constants/routes";
import { getAuthSession, setPendingContactVerify } from "@/lib/auth-session";
import {
  defaultCountry,
  formatPhoneDisplay,
  getPhonePlaceholder,
  isValidPhoneNumber,
  parsePhoneDisplay,
  sanitizePhoneInput,
  type Country,
} from "@/lib/countries";
import { cn } from "@/lib/utils";

function digitsFromSessionPhone(): string {
  const raw = getAuthSession()?.phone?.trim() ?? "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(-10);
  }
  return digits.slice(-defaultCountry.maxLength);
}

const benefits = [
  {
    icon: Bell,
    title: "Trip alerts",
    text: "Pickup ETAs and live updates",
  },
  {
    icon: KeyRound,
    title: "Secure sign-in",
    text: "OTP login & account recovery",
  },
  {
    icon: ShieldCheck,
    title: "Safety contact",
    text: "Reach you during emergencies",
  },
] as const;

export function PhoneSettingsView() {
  const router = useRouter();
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState(() => digitsFromSessionPhone());
  const [error, setError] = useState("");

  const valid = isValidPhoneNumber(phoneNumber, country);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!valid) {
      setError("Please enter a valid phone number");
      return;
    }

    setError("");
    const contact = `${country.dialCode} ${formatPhoneDisplay(phoneNumber, country)}`;
    setPendingContactVerify({ type: "phone", contact });
    router.push(
      `${ROUTES.profilePhoneVerify}?contact=${encodeURIComponent(contact)}`,
    );
  };

  const handleCountryChange = (selected: Country) => {
    setCountry(selected);
    setPhoneNumber((prev) => sanitizePhoneInput(prev, selected));
    setError("");
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(parsePhoneDisplay(value, country));
    if (error) setError("");
  };

  return (
    <SettingsPageLayout
      title="Phone number"
      backHref={ROUTES.profileAccountSettings}
      wide
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
        {/* Intro panel */}
        <aside className="relative overflow-hidden rounded-2xl border border-[#eef5d4] bg-gradient-to-br from-[#38471B] via-[#B8D926] to-[#C8E84A] p-5 text-white shadow-[0_22px_48px_-28px_rgba(40,54,20,0.55)] sm:rounded-3xl sm:p-6 lg:sticky lg:top-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
            <Phone className="h-5 w-5" strokeWidth={2} />
          </div>
          <h2 className="relative mt-4 font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Keep your number current
          </h2>
          <p className="relative mt-2 text-sm leading-relaxed text-white/85">
            You&apos;ll use this number for notifications, sign-in, and account
            recovery — so trips stay connected to you.
          </p>

          <ul className="relative mt-5 space-y-3">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="block text-xs text-white/75">
                      {item.text}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Form panel */}
        <form
          onSubmit={handleUpdate}
          className="rounded-2xl border border-[#eef5d4] bg-white p-5 shadow-[0_18px_44px_-28px_rgba(40,54,20,0.4)] sm:rounded-3xl sm:p-7"
        >
          <div className="mb-6 border-b border-[#eef5d4] pb-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#B8D926] uppercase">
              Update number
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5a6330]">
              Enter your mobile number. We&apos;ll send a one-time code to
              confirm it&apos;s yours.
            </p>
          </div>

          <Label
            htmlFor="phone"
            className="text-sm font-semibold text-[#38471B]"
          >
            Mobile number
          </Label>

          <div
            className={cn(
              "mt-2.5 flex min-w-0 overflow-hidden rounded-2xl border bg-[#fcfef8] transition-shadow focus-within:bg-white focus-within:ring-2",
              error
                ? "border-destructive focus-within:ring-destructive/25"
                : "border-[#eef5d4] focus-within:border-[#C8E84A]/50 focus-within:ring-primary/20",
            )}
          >
            <CountryCodeSelector
              value={country}
              onChange={handleCountryChange}
              className="h-14 rounded-none border-0 border-r border-[#eef5d4] bg-transparent px-3.5 hover:bg-[#f4f9e4]"
            />
            <div className="flex min-w-0 flex-1 items-center gap-1.5 px-3 sm:px-4">
              <span className="shrink-0 text-sm font-semibold text-[#B8D926] sm:text-base">
                {country.dialCode}
              </span>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={formatPhoneDisplay(phoneNumber, country)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="h-14 min-w-0 flex-1 border-0 bg-transparent px-0 text-base text-[#38471B] shadow-none placeholder:text-[#a889b8] focus-visible:ring-0"
                placeholder={getPhonePlaceholder(country)}
                maxLength={country.maxLength + 1}
                aria-invalid={!!error}
                autoComplete="tel-national"
              />
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B8D926]" />
            <p className="text-xs leading-relaxed text-[#5a6330]">
              We&apos;ll send a genuine 6-digit SMS OTP to this number — same
              secure flow as sign-in.
            </p>
          </div>

          {error ? (
            <p className="mt-3 text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={!valid}
            className="mt-8 h-12 w-full rounded-xl text-sm font-semibold tracking-wide shadow-[0_14px_32px_-14px_rgba(184,217,38,0.55)] transition hover:brightness-105 disabled:shadow-none sm:h-14 sm:text-base"
          >
            Send OTP
          </Button>

          <button
            type="button"
            onClick={() => router.push(ROUTES.profileAccountSettings)}
            className="mt-3 w-full py-2.5 text-center text-sm font-medium text-[#38471B] transition-colors hover:text-[#4A5824]"
          >
            Cancel
          </button>
        </form>
      </div>
    </SettingsPageLayout>
  );
}
