/** App environment helpers — gate demo/mock fallbacks for production deploys. */

export type AppEnvironment = "development" | "staging" | "production" | "local";

export function getAppEnvironment(): AppEnvironment {
  const raw = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();
  if (
    raw === "production" ||
    raw === "staging" ||
    raw === "local" ||
    raw === "development"
  ) {
    return raw;
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function isProductionEnv(): boolean {
  return getAppEnvironment() === "production";
}

/** Demo OTP / mock SKUs — off unless explicitly enabled (never in production). */
export function allowDemoDataFallbacks(): boolean {
  if (isProductionEnv()) return false;
  return process.env.NEXT_PUBLIC_ALLOW_DEMO_OTP === "1";
}
