import { apiFetch } from "@/lib/api";
import { normalizePhone, toOtpPhone } from "@/lib/phone";
import {
  clearPendingSignup,
  getPendingSignup,
  setPendingSignup,
} from "@/lib/auth-session";
import { getEmailValidationError } from "@/lib/auth-validation";
import { splitE164ByCountry } from "@/data/countries";

/**
 * SMS OTP is paused on the backend. Send/verify still hit the live API;
 * when the API returns no code, use this dummy OTP (accepted while delivery is off).
 */
export const BACKEND_FALLBACK_OTP = "123456";

function coerceApiOtp(value: unknown): string | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    const digits = String(value);
    return /^\d{4,6}$/.test(digits) ? digits : null;
  }
  if (typeof value === "string") {
    const digits = value.trim();
    return /^\d{4,6}$/.test(digits) ? digits : null;
  }
  return null;
}

export function resolveOtpForDisplay(apiOtp?: string | null): string | null {
  const fromApi = coerceApiOtp(apiOtp);
  if (fromApi) return fromApi;
  return BACKEND_FALLBACK_OTP;
}

export interface LoginRequest {
  dial_code: string;
  phone: string;
  password: string;
  remember: boolean;
}

export interface RegisterRequest {
  dial_code: string;
  phone: string;
  password: string;
  full_name: string;
  email?: string;
}

export interface SignupStartRequest {
  dial_code: string;
  phone: string;
  full_name: string;
  email?: string;
  password: string;
  confirm_password: string;
  terms_agreed: boolean;
}

export interface OtpSendRequest {
  dial_code: string;
  phone: string;
  mode?: "login" | "signup";
}

export interface OtpVerifyRequest {
  dial_code: string;
  phone: string;
  otp: string;
  mode?: "login" | "signup";
  full_name?: string;
  email?: string;
  password?: string;
}

function mapAuthError(message: string, mode: "login" | "signup"): string {
  const lower = message.toLowerCase();
  if (
    /not registered|not found|no user|does not exist|unknown user/.test(lower)
  ) {
    return mode === "login"
      ? "This number is not registered. Create an account first."
      : message;
  }
  if (/already registered|already exists|already in use/.test(lower)) {
    return mode === "signup"
      ? "This number is already registered. Please sign in."
      : message;
  }
  if (/invalid otp|incorrect otp|wrong otp|expired otp/.test(lower)) {
    return "Invalid or expired OTP. Request a new code and try again.";
  }
  return message;
}

function sanitizedOptionalEmail(email: string | undefined, fullName?: string): string | undefined {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed) return undefined;
  const error = getEmailValidationError(trimmed, { required: true, fullName });
  if (error) {
    throw new Error(error);
  }
  return trimmed;
}

function isSignupFlow(payload: { mode?: "login" | "signup" }): boolean {
  return payload.mode === "signup";
}

export interface AuthUser {
  id?: string;
  phone: string;
  name?: string | null;
  email?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: AuthUser;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

function parseAuthTokens(json: unknown): TokenResponse {
  if (json && typeof json === "object") {
    const record = json as Record<string, unknown>;
    if (typeof record.access_token === "string") {
      return {
        access_token: record.access_token,
        refresh_token:
          typeof record.refresh_token === "string" ? record.refresh_token : "",
        token_type: typeof record.token_type === "string" ? record.token_type : "bearer",
      };
    }
    if (record.data) return parseAuthTokens(record.data);
  }
  throw new Error("Invalid authentication response from server");
}

interface UserMeResponse {
  id?: string;
  email?: string | null;
  phone?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string | null;
  is_verified?: boolean;
}

function parseUserMe(json: unknown): UserMeResponse {
  const record = unwrapBody(json);
  const nested = asRecord(record.user) ?? record;
  return {
    id: typeof nested.id === "string" ? nested.id : undefined,
    email: typeof nested.email === "string" ? nested.email : null,
    phone: typeof nested.phone === "string" ? nested.phone : "",
    first_name: typeof nested.first_name === "string" ? nested.first_name : "",
    last_name: typeof nested.last_name === "string" ? nested.last_name : "",
    full_name: typeof nested.full_name === "string" ? nested.full_name : null,
    is_verified: nested.is_verified === true,
  };
}

function toAuthUser(me: UserMeResponse): AuthUser {
  const name =
    me.full_name?.trim() ||
    `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim();
  const email = me.email?.trim() || null;
  return {
    id: me.id,
    phone: me.phone || "",
    name: name || null,
    email:
      email && !getEmailValidationError(email, { required: true, fullName: name })
        ? email
        : null,
  };
}

async function fetchUserProfile(accessToken: string): Promise<AuthUser> {
  const json = await apiFetch<unknown>(
    "/auth/me",
    { headers: { Authorization: `Bearer ${accessToken}` } },
    "Unable to load profile",
  );
  return toAuthUser(parseUserMe(json));
}

async function tokensToAuthResponse(tokens: TokenResponse): Promise<AuthResponse> {
  const user = await fetchUserProfile(tokens.access_token);
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type ?? "bearer",
    user,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapBody(json: unknown): Record<string, unknown> {
  const record = asRecord(json);
  if (!record) return {};
  const nested = asRecord(record.data);
  return nested ?? record;
}

function splitFullName(fullName: string | undefined): { first_name: string; last_name: string } {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || "User",
    last_name: parts.slice(1).join(" ") || "",
  };
}

export function parseContactPhone(contact: string): { dial_code: string; phone: string } {
  const trimmed = contact.trim();
  const spaced = trimmed.match(/^(\+\d{1,4})\s+(.+)$/);
  if (spaced) {
    return {
      dial_code: spaced[1],
      phone: spaced[2].replace(/\D/g, ""),
    };
  }

  const split = splitE164ByCountry(trimmed);
  if (split) {
    return { dial_code: split.country.dialCode, phone: split.national };
  }

  throw new Error("Invalid phone number format");
}

export async function loginWithPassword(payload: LoginRequest): Promise<AuthResponse> {
  const phone = normalizePhone(payload.dial_code, payload.phone);
  const tokens = parseAuthTokens(
    await apiFetch<unknown>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ phone, password: payload.password, role: "user" }),
        skipAuth: true,
      },
      "Unable to sign in. Please try again.",
    ),
  );
  return tokensToAuthResponse(tokens);
}

export async function registerAccount(payload: RegisterRequest): Promise<AuthResponse> {
  const phone = normalizePhone(payload.dial_code, payload.phone);
  const parts = payload.full_name.trim().split(" ", 2);
  const tokens = parseAuthTokens(
    await apiFetch<unknown>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          email: sanitizedOptionalEmail(payload.email, payload.full_name),
          phone,
          password: payload.password,
          first_name: parts[0] || "User",
          last_name: parts[1] || "",
          role: "user",
        }),
        skipAuth: true,
      },
      "Unable to create account. Please try again.",
    ),
  );
  return tokensToAuthResponse(tokens);
}

export async function sendSignupOtp(
  payload: SignupStartRequest
): Promise<{ message: string; phone: string; otp: string | null }> {
  setPendingSignup({
    dial_code: payload.dial_code,
    phone: payload.phone.replace(/\D/g, ""),
    full_name: payload.full_name.trim(),
    email: sanitizedOptionalEmail(payload.email, payload.full_name),
    password: payload.password,
  });
  return sendLoginOtp({
    dial_code: payload.dial_code,
    phone: payload.phone,
    mode: "signup",
  });
}

export interface SignupVerifyOtpRequest {
  dial_code: string;
  phone: string;
  otp: string;
}

export async function verifySignupOtp(payload: SignupVerifyOtpRequest): Promise<AuthResponse> {
  const pending = getPendingSignup();
  const result = await verifyOtp({
    dial_code: payload.dial_code,
    phone: payload.phone,
    otp: payload.otp,
    mode: "signup",
    full_name: pending?.full_name,
    email: pending?.email,
    password: pending?.password,
  });
  clearPendingSignup();
  return result;
}

export async function sendLoginOtp(
  payload: OtpSendRequest
): Promise<{ message: string; phone: string; otp: string | null }> {
  const localDigits = payload.phone.replace(/\D/g, "");
  if (localDigits.length < 6) {
    throw new Error("Please enter a valid mobile number.");
  }

  // MSG91 / Ride-Booking gateway expects country code + number with no '+'.
  const phone = toOtpPhone(payload.dial_code, localDigits);
  if (phone.length < 10) {
    throw new Error("Please enter a valid mobile number with country code.");
  }

  const signup = isSignupFlow(payload);
  let json: unknown;
  try {
    json = await apiFetch<unknown>(
      "/auth/send-otp",
      {
        method: "POST",
        body: JSON.stringify({
          role: "user",
          phone,
          purpose: signup ? "register" : "login",
        }),
        skipAuth: true,
        skipRetry: false,
        maxRetries: 1,
        sameOrigin: true,
        timeoutMs: 45_000,
      },
      signup
        ? "Unable to send signup OTP. Please try again."
        : "Unable to send OTP. Please try again.",
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to send OTP. Please try again.";
    throw new Error(mapAuthError(message, signup ? "signup" : "login"));
  }
  const body = unwrapBody(json);
  const root = asRecord(json) ?? {};
  if (body.success === false || root.success === false) {
    throw new Error(
      mapAuthError(
        String(body.message ?? root.message ?? "Unable to send OTP. Please try again."),
        signup ? "signup" : "login",
      ),
    );
  }

  const rawOtp = body.otp ?? root.otp;
  const otp = resolveOtpForDisplay(coerceApiOtp(rawOtp));
  const message = String(
    body.message ?? root.message ?? "OTP sent to your mobile number.",
  );

  return {
    message,
    phone: `${payload.dial_code}${localDigits}`,
    otp,
  };
}

export async function verifyOtp(payload: OtpVerifyRequest): Promise<AuthResponse> {
  const phone = toOtpPhone(payload.dial_code, payload.phone);
  const signup = isSignupFlow(payload);
  const pending = signup ? getPendingSignup() : null;
  const names = splitFullName(payload.full_name ?? pending?.full_name);
  const tokens = parseAuthTokens(
    await apiFetch<unknown>(
      "/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({
          role: "user",
          phone,
          otp: payload.otp.trim(),
          purpose: signup ? "register" : "login",
          ...(signup
            ? {
                first_name: names.first_name,
                last_name: names.last_name,
                email: sanitizedOptionalEmail(
                  payload.email ?? pending?.email,
                  payload.full_name ?? pending?.full_name,
                ) ?? null,
                password: payload.password ?? pending?.password ?? null,
              }
            : {}),
        }),
        skipAuth: true,
        skipRetry: true,
        sameOrigin: true,
      },
      "Unable to verify OTP. Please try again.",
    ).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to verify OTP. Please try again.";
      throw new Error(mapAuthError(message, signup ? "signup" : "login"));
    }),
  );
  if (signup) clearPendingSignup();
  return tokensToAuthResponse(tokens);
}

/** Google sign-in via Firebase, then exchange ID token for Bull Wave JWT. */
export async function loginWithGoogleAccount(): Promise<AuthResponse> {
  const { loginWithGoogle } = await import("@/services/authService");
  const result = await loginWithGoogle();
  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    token_type: result.token_type,
    user: {
      id: result.user.id,
      phone: result.user.phone,
      name: result.user.name,
      email: result.user.email,
    },
  };
}
