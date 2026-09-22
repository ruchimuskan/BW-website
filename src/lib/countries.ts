export {
  countries,
  countryFlagEmoji,
  defaultCountry,
  findCountryByCode,
  findCountryByDialCode,
  splitE164ByCountry,
} from "@/data/countries";
export type { Country } from "@/types/country";

export {
  sanitizePhoneInput,
  isValidPhoneNumber,
  getPhonePlaceholder,
  formatPhoneDisplay,
  parsePhoneDisplay,
} from "@/lib/phone";
