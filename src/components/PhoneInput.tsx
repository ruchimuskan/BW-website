"use client";

import { CountryCodeSelector } from "@/components/auth/CountryCodeSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  defaultCountry,
  formatPhoneDisplay,
  getPhonePlaceholder,
  isValidPhoneNumber,
  sanitizePhoneInput,
  type Country,
} from "@/lib/countries";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  country: Country;
  phone: string;
  onCountryChange: (country: Country) => void;
  onPhoneChange: (phone: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PhoneInput({
  country,
  phone,
  onCountryChange,
  onPhoneChange,
  error,
  disabled,
}: PhoneInputProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="phone-input"
        className="text-xs font-semibold text-[#111411] sm:text-sm"
      >
        Mobile number
      </Label>
      <div className="flex gap-2">
        <CountryCodeSelector
          value={country}
          onChange={(selected) => {
            onCountryChange(selected);
            onPhoneChange(sanitizePhoneInput(phone, selected));
          }}
          className="h-11 rounded-xl border-[#d7e0c0] bg-[#f7f8f3] px-2 shadow-sm sm:h-12 sm:rounded-2xl"
        />
        <Input
          id="phone-input"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={getPhonePlaceholder(country)}
          value={formatPhoneDisplay(phone, country)}
          disabled={disabled}
          onChange={(e) =>
            onPhoneChange(sanitizePhoneInput(e.target.value, country))
          }
          className={cn(
            "h-11 min-w-0 flex-1 rounded-xl border-[#d7e0c0] bg-[#f7f8f3] text-base text-[#111411] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors placeholder:text-[#8a9184] focus-visible:border-[#C6E31A] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#C6E31A]/25 sm:h-12 sm:rounded-2xl",
            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30",
          )}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function toE164Phone(country: Country, phoneDigits: string): string {
  if (!isValidPhoneNumber(phoneDigits, country)) {
    throw new Error("Please enter a valid mobile number");
  }
  return `${country.dialCode}${phoneDigits}`;
}

export { defaultCountry, isValidPhoneNumber };
