const LABEL_MAX = 40;
const ADDRESS_MAX = 220;
const ADDRESS_MIN = 12;

const KEYBOARD_ROWS = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "qwerty",
  "asdfgh",
  "zxcvbn",
  "abcdefghijklmnopqrstuvwxyz",
  "1234567890",
];

function collapse(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function lettersOnly(value: string) {
  return value.replace(/[^\p{L}]/gu, "").toLowerCase();
}

function looksLikeGibberish(value: string): boolean {
  const compact = lettersOnly(value);
  if (compact.length >= 6 && /^(.)\1+$/.test(compact)) return true;
  if (compact.length >= 8 && /(..)\1{3,}/.test(compact)) return true;

  if (compact.length >= 5) {
    const lower = compact;
    if (KEYBOARD_ROWS.some((row) => row.includes(lower) || lower.includes(row))) {
      return true;
    }
  }

  if (/^[bcdfghjklmnpqrstvwxyz]{8,}$/i.test(compact)) return true;

  const unique = new Set(compact.split("")).size;
  if (compact.length >= 8 && unique <= 2) return true;

  return false;
}

function hasDangerousMarkup(value: string) {
  return /<|>|javascript:|data:text\/html|on\w+\s*=/i.test(value);
}

export function isValidCoordinate(lat: number | null | undefined, lng: number | null | undefined) {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return false;
  return true;
}

export function getSavedPlaceLabelError(raw: string): string | null {
  const label = collapse(raw);
  if (label.length < 2) return "Enter a short label, for example Home or Office.";
  if (label.length > LABEL_MAX) return "Label is too long.";
  if (hasDangerousMarkup(label)) return "Label contains invalid characters.";
  if (!/[\p{L}]/u.test(label)) return "Label must include letters.";
  if (!/^[\p{L}\p{N} .,'&/-]+$/u.test(label)) {
    return "Use only letters, numbers, and basic punctuation in the label.";
  }
  if (looksLikeGibberish(label)) return "Enter a real label, not random text.";
  return null;
}

export function getSavedPlaceAddressError(raw: string): string | null {
  const address = collapse(raw);
  if (address.length < ADDRESS_MIN) {
    return "Enter a full address, or pick one from the suggestions.";
  }
  if (address.length > ADDRESS_MAX) return "Address is too long.";
  if (hasDangerousMarkup(address)) return "Address contains invalid characters.";
  if (!/[\p{L}]/u.test(address)) return "Address must include a place name.";

  const words = address.split(" ").filter(Boolean);
  if (words.length < 2) {
    return "Enter a complete address with area and city.";
  }

  const letterCount = (address.match(/\p{L}/gu) ?? []).length;
  if (letterCount < 8) return "This does not look like a real address.";
  if (looksLikeGibberish(address)) {
    return "This address looks invalid. Search and pick a real place.";
  }
  if (!/^[\p{L}\p{N} .,'#&/()-]+$/u.test(address)) {
    return "Address contains characters that are not allowed.";
  }
  return null;
}

export function getSavedPlaceSubmitError(input: {
  label: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;
}): string | null {
  const labelError = getSavedPlaceLabelError(input.label);
  if (labelError) return labelError;

  const addressError = getSavedPlaceAddressError(input.address);
  if (addressError) return addressError;

  if (!input.verified || !isValidCoordinate(input.latitude, input.longitude)) {
    return "Pick an address from the list or use your current location.";
  }

  return null;
}

export function sanitizeSavedPlaceText(value: string, max: number) {
  return collapse(value).slice(0, max);
}

export const SAVED_PLACE_LIMITS = {
  LABEL_MAX,
  ADDRESS_MAX,
} as const;
