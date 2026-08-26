import { apiFetch } from "@/lib/api";
import { normalizePhone, toOtpPhone } from "@/lib/phone";
import {
  clearPendingSignup,
  getPendingSignup,
  setPendingSignup,
} from "@/lib/auth-session";

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
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

function toAuthUser(me: UserMeResponse): AuthUser {
  return {
    id: me.id,
    phone: me.phone,
    name: `${me.first_name} ${me.last_name}`.trim(),
    email: me.email,
  };
}

async function fetchUserProfile(accessToken: string): Promise<AuthUser> {
  const me = await apiFetch<UserMeResponse>(
    "/auth/me",
    { headers: { Authorization: `Bearer ${accessToken}` } },
    "Unable to load profile"
  );
  return toAuthUser(me);
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
  const e164 = trimmed.match(/^(\+\d{1,4})(\d{6,14})$/);
  if (e164) {
    return { dial_code: e164[1], phone: e164[2] };
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return { dial_code: "+91", phone: digits };
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return { dial_code: "+91", phone: digits.slice(2) };
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
          email: payload.email || undefined,
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
): Promise<{ message: string; phone: string }> {
  setPendingSignup({
    dial_code: payload.dial_code,
    phone: payload.phone.replace(/\D/g, ""),
    full_name: payload.full_name.trim(),
    email: payload.email?.trim() || undefined,
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
): Promise<{ message: string; phone: string }> {
  const phone = toOtpPhone(payload.dial_code, payload.phone);
  const signup = isSignupFlow(payload);
  const json = await apiFetch<unknown>(
    "/auth/send-otp",
    {
      method: "POST",
      body: JSON.stringify({
        role: "user",
        phone,
        purpose: signup ? "register" : "login",
      }),
      skipAuth: true,
      skipRetry: true,
      sameOrigin: true,
    },
    signup
      ? "Unable to send signup OTP. Please try again."
      : "Unable to send OTP. Please try again.",
  );
  const body = unwrapBody(json);
  const root = asRecord(json) ?? {};
  if (body.success === false || root.success === false) {
    throw new Error(
      String(body.message ?? root.message ?? "Unable to send OTP. Please try again."),
    );
  }
  const message = String(
    body.message ?? root.message ?? "OTP sent to your mobile number.",
  );
  // Never surface OTP from API responses in the client (XSS / shared-device risk).
  return {
    message,
    phone: `${payload.dial_code} ${payload.phone.replace(/\D/g, "")}`,
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
                email: payload.email ?? pending?.email ?? null,
                password: payload.password ?? pending?.password ?? null,
              }
            : {}),
        }),
        skipAuth: true,
        skipRetry: true,
        sameOrigin: true,
      },
      "Unable to verify OTP. Please try again.",
    ),
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
