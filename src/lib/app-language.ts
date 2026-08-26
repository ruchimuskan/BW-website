/** Frontend-only app language preference (no backend). */

export const APP_LANGUAGE_KEY = "bw-app-language";

export type AppLanguageCode = "en" | "hi" | "bn" | "ta" | "te" | "mr";

export type AppLanguage = {
  code: AppLanguageCode;
  label: string;
  nativeLabel: string;
  region: string;
};

export const APP_LANGUAGES: readonly AppLanguage[] = [
  { code: "en", label: "English", nativeLabel: "English", region: "India" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", region: "India" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", region: "India" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", region: "India" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", region: "India" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", region: "India" },
] as const;

export function getLanguageByCode(code: string | null | undefined): AppLanguage {
  return (
    APP_LANGUAGES.find((lang) => lang.code === code) ?? APP_LANGUAGES[0]
  );
}

export function readAppLanguage(): AppLanguage {
  if (typeof window === "undefined") return APP_LANGUAGES[0];
  try {
    return getLanguageByCode(localStorage.getItem(APP_LANGUAGE_KEY));
  } catch {
    return APP_LANGUAGES[0];
  }
}

export function writeAppLanguage(code: AppLanguageCode): AppLanguage {
  const language = getLanguageByCode(code);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(APP_LANGUAGE_KEY, language.code);
    } catch {
      // ignore quota / private mode
    }
    document.documentElement.lang = language.code;
    window.dispatchEvent(
      new CustomEvent("bw-language-change", { detail: language.code }),
    );
  }
  return language;
}
