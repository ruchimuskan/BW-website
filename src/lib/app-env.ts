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

/** Demo hubs, mock trips, and hardcoded rental SKUs — dev/staging only. */
export function allowDemoDataFallbacks(): boolean {
  return !isProductionEnv();
}
