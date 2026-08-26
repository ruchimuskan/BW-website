/** App runtime environment (set via .env / npm scripts). */
export type AppEnv = "development" | "staging" | "production" | "local";

export function getAppEnv(): AppEnv {
  const raw = (process.env.NEXT_PUBLIC_APP_ENV || "").toLowerCase().trim();
  if (raw === "staging" || raw === "production" || raw === "local") return raw;
  return "development";
}

export function isStaging(): boolean {
  return getAppEnv() === "staging";
}

export function isLocalApi(): boolean {
  return getAppEnv() === "local";
}
