import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_KEY,
  POST_LOGIN_REDIRECT_KEY,
  PENDING_CONTACT_VERIFY_KEY,
  PENDING_OTP_PHONE_KEY,
  PENDING_SIGNUP_KEY,
  PROFILE_COMPLETE_COOKIE,
} from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { getEmailValidationError } from "@/lib/auth-validation";

export interface AuthSession {
  phone: string;
  verified: true;
  name?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  profileComplete?: boolean;
}

/** Password kept only in memory for the signup OTP step — never sessionStorage. */
let pendingSignupPasswordMemory: string | null = null;

export function needsProfileSetup(
  name?: string | null,
  email?: string | null,
): boolean {
  const trimmed = name?.trim();
  if (!trimmed) return true;
  if (isPlaceholderDisplayName(trimmed)) return true;
  return (
    getEmailValidationError(email ?? "", {
      required: true,
      fullName: trimmed,
    }) !== null
  );
}

/** Backend/register often stores first_name "User" when no real name was collected yet. */
export function isPlaceholderDisplayName(name?: string | null): boolean {
  const trimmed = name?.trim().toLowerCase() || "";
  if (!trimmed) return true;
  return (
    trimmed === "user" ||
    trimmed === "rider" ||
    trimmed === "bw rides user" ||
    trimmed === "bw rides"
  );
}

function cookieSecureSuffix() {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

function writeClientCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${cookieSecureSuffix()}`;
}

function clearClientCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${cookieSecureSuffix()}`;
}

function syncProfileCompleteCookie(profileComplete: boolean) {
  if (typeof document === "undefined") return;
  if (profileComplete) {
    writeClientCookie(PROFILE_COMPLETE_COOKIE, "1", 86400);
  } else {
    clearClientCookie(PROFILE_COMPLETE_COOKIE);
  }
}

/** Only same-origin relative paths — blocks open redirects. */
export function isSafeInternalPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== "string") return false;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return false;
  if (trimmed.includes("://")) return false;
  if (/[\r\n\0]/.test(trimmed)) return false;
  return true;
}

export function setPendingOtpPhone(phone: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_OTP_PHONE_KEY, phone);
}

export function setPostLoginRedirect(path: string) {
  if (typeof window === "undefined") return;
  if (!isSafeInternalPath(path)) return;
  sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
}

export function getPostLoginRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  if (!raw || !isSafeInternalPath(raw)) {
    clearPostLoginRedirect();
    return null;
  }
  return raw;
}

export function clearPostLoginRedirect() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
}

export function getPendingOtpPhone(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PENDING_OTP_PHONE_KEY);
}

export function clearPendingOtpPhone() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_OTP_PHONE_KEY);
}

export interface PendingSignupPayload {
  dial_code: string;
  phone: string;
  full_name: string;
  email?: string;
  password: string;
}

type PendingSignupStored = Omit<PendingSignupPayload, "password">;

export function setPendingSignup(payload: PendingSignupPayload) {
  if (typeof window === "undefined") return;
  pendingSignupPasswordMemory = payload.password;
  const stored: PendingSignupStored = {
    dial_code: payload.dial_code,
    phone: payload.phone,
    full_name: payload.full_name,
    ...(payload.email ? { email: payload.email } : {}),
  };
  sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(stored));
}

export function getPendingSignup(): PendingSignupPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSignupStored;
    if (!parsed?.phone || !parsed.full_name) return null;
    const password = pendingSignupPasswordMemory ?? "";
    if (!password) return null;
    return {
      dial_code: parsed.dial_code,
      phone: parsed.phone,
      full_name: parsed.full_name,
      email: parsed.email,
      password,
    };
  } catch {
    return null;
  }
}

export function clearPendingSignup() {
  if (typeof window === "undefined") return;
  pendingSignupPasswordMemory = null;
  sessionStorage.removeItem(PENDING_SIGNUP_KEY);
}

export type PendingContactVerify = {
  type: "phone" | "email";
  contact: string;
};

export function setPendingContactVerify(payload: PendingContactVerify) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_CONTACT_VERIFY_KEY, JSON.stringify(payload));
}

export function getPendingContactVerify(): PendingContactVerify | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_CONTACT_VERIFY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingContactVerify;
    if (!parsed?.contact || (parsed.type !== "phone" && parsed.type !== "email")) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingContactVerify() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_CONTACT_VERIFY_KEY);
}

export function patchAuthSession(updates: Partial<AuthSession>) {
  const session = getAuthSession();
  if (!session) return;
  setAuthSession({ ...session, ...updates });
}

export function setAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  const profileComplete =
    session.profileComplete === true &&
    !needsProfileSetup(session.name, session.email);
  const normalized: AuthSession = { ...session, profileComplete };
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalized));

  if (normalized.accessToken?.trim()) {
    writeClientCookie(AUTH_COOKIE_NAME, "1", 86400);
    syncProfileCompleteCookie(profileComplete);
  } else {
    clearClientCookie(AUTH_COOKIE_NAME);
    syncProfileCompleteCookie(false);
  }

  window.dispatchEvent(new Event("wavego-auth-update"));
}

export function markProfileComplete(updates?: { name?: string; email?: string }) {
  const session = getAuthSession();
  if (!session) return;
  setAuthSession({
    ...session,
    ...(updates?.name?.trim() ? { name: updates.name.trim() } : {}),
    ...(updates?.email?.trim() ? { email: updates.email.trim() } : {}),
    profileComplete: true,
  });
}

export function isProfileComplete(): boolean {
  const session = getAuthSession();
  if (!session) return false;
  return (
    session.profileComplete === true &&
    !needsProfileSetup(session.name, session.email)
  );
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (session.verified !== true || !session.phone) return null;
    // Cookie alone is not a login — require a backend access token.
    if (!session.accessToken?.trim()) return null;
    return session;
  } catch {
    return null;
  }
}

function refreshAuthCookie(session: AuthSession) {
  if (typeof document === "undefined") return;
  writeClientCookie(AUTH_COOKIE_NAME, "1", 86400);
  syncProfileCompleteCookie(
    session.profileComplete === true &&
      !needsProfileSetup(session.name, session.email),
  );
}

export function isAuthenticated(): boolean {
  const session = getAuthSession();
  // Require a real API token — cookie alone is not enough to book/search.
  if (!session?.accessToken) return false;
  // Keep the middleware cookie in sync. Session can outlive a 24h cookie
  // (tab left open) which otherwise sends logged-in users back to /login.
  refreshAuthCookie(session);
  return true;
}

export function requireAuthRedirect(returnPath: string): string {
  const candidate = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
  const safe = isSafeInternalPath(candidate) ? candidate : ROUTES.home;
  return `${ROUTES.login}?next=${encodeURIComponent(safe)}&redirect=${encodeURIComponent(safe)}`;
}

export function getProtectedPath(path: string): string {
  if (isAuthenticated()) return path;
  // Stale auth cookie without sessionStorage token — clear it so middleware matches.
  if (hasAuthCookie() && !getAuthSession()?.accessToken) {
    clearAuthSession();
  }
  return requireAuthRedirect(path);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  clearPendingOtpPhone();
  clearPostLoginRedirect();
  clearPendingSignup();
  clearClientCookie(AUTH_COOKIE_NAME);
  syncProfileCompleteCookie(false);
  window.dispatchEvent(new Event("wavego-auth-update"));
}

export function resolvePostAuthDestination(): string {
  const redirectTo = getPostLoginRedirect();
  if (redirectTo) {
    clearPostLoginRedirect();
    return redirectTo;
  }
  return ROUTES.home;
}

export function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${AUTH_COOKIE_NAME}=1`));
}
