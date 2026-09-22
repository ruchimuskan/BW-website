import { getAuthSession, setAuthSession } from "@/lib/auth-session";



export const USER_API = "/api/v1/users";

export const AUTH_API = "/api/v1/auth";

export const COMMON_API = "/api/v1/common";

export const PUBLIC_API = "/api/v1/public";



export function resolveUserPath(path: string): string {
  if (
    path.startsWith(USER_API) ||
    path.startsWith(AUTH_API) ||
    path.startsWith(COMMON_API) ||
    path.startsWith(PUBLIC_API) ||
    path.startsWith("/api/v1/rides/") ||
    path.startsWith("/api/v1/corporate/")
  ) {
    return path;
  }

  if (path.startsWith("/api/v1/user-panel")) {
    return path.replace("/api/v1/user-panel", USER_API);
  }

  // Match Flutter: base /api/v1 + /rides/estimate (not under /user).
  if (path.startsWith("/rides/estimate")) {
    return `/api/v1${path}`;
  }

  // Match Flutter: /public/places/* → /api/v1/public/places/*
  if (path.startsWith("/public/")) {
    return `/api/v1${path}`;
  }

  if (path.startsWith("/common/")) {
    return `${COMMON_API}${path.slice("/common".length)}`;
  }

  if (path.startsWith("/api/v1/")) {
    return path.replace("/api/v1/", `${USER_API}/`).replace("/auth/user/", "/auth/");
  }

  if (path.startsWith("/auth/")) {
    return `${AUTH_API}${path.slice(5)}`;
  }

  // Paths like "/user/student-pass" must not become "/api/v1/user/user/...".
  if (path.startsWith("/user/")) {
    return `${USER_API}${path.slice("/user".length)}`;
  }

  return `${USER_API}${path.startsWith("/") ? path : `/${path}`}`;
}



/** Default backend — Bullwave production / staging API (matches Flutter User-Panel).
 * Overrides:
 *   npm run staging           → .env.staging (live API + local frontend)
 *   npm run staging:local-api → .env.local.backend (http://127.0.0.1:8000)
 *   NEXT_PUBLIC_API_URL=…     → any custom host
 */
const PRODUCTION_API_URL = "https://api.bullwaverides.com";

function defaultApiBaseUrl(): string {
  return PRODUCTION_API_URL;
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || defaultApiBaseUrl();
  }

  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_URL ||
    defaultApiBaseUrl()
  );
}

const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Wake a sleeping Render/free-tier backend before the user hits a real API call. */
export async function warmBackend(timeoutMs = 8_000): Promise<void> {
  const base = getApiBaseUrl().replace(/\/$/, "");
  if (!base || base.includes("127.0.0.1") || base.includes("localhost")) {
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await fetch(`${base}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    // Warmup is best-effort; real requests still retry on 503.
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve Admin-uploaded media for <img>.
 * Private S3 URLs are routed through `/api/v1/common/media` (presigned redirect).
 */
export function resolveMediaUrl(url: string | undefined | null): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;

  const base = getApiBaseUrl().replace(/\/$/, "");

  const isSigned =
    trimmed.includes("X-Amz-Signature=") || trimmed.includes("X-Amz-Credential=");
  const isOurBucket =
    trimmed.includes("bullwaverides-storage.s3.") ||
    trimmed.includes("bullwaverides-storage.s3.amazonaws.com");

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (isOurBucket && !isSigned) {
      try {
        const u = new URL(trimmed);
        let key = u.pathname.replace(/^\//, "");
        if (key.startsWith("bullwaverides-storage/")) {
          key = key.slice("bullwaverides-storage/".length);
        }
        if (key) {
          return `${base}/api/v1/common/media?key=${encodeURIComponent(key)}`;
        }
      } catch {
        return `${base}/api/v1/common/media?url=${encodeURIComponent(trimmed)}`;
      }
    }
    return trimmed;
  }

  if (
    trimmed.startsWith("vehicles/") ||
    trimmed.startsWith("drivers/") ||
    trimmed.startsWith("users/") ||
    trimmed.startsWith("selfies/")
  ) {
    return `${base}/api/v1/common/media?key=${encodeURIComponent(trimmed)}`;
  }

  if (trimmed.startsWith("/uploads/")) {
    const key = trimmed.replace(/^\/uploads\//, "");
    return `${base}/api/v1/common/media?key=${encodeURIComponent(key)}`;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}



export function getErrorMessage(payload: unknown, fallback: string): string {

  if (!payload || typeof payload !== "object") return fallback;



  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string") return record.message;



  const detail = record.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {

    const messages = detail

      .map((item) => {

        if (typeof item === "string") return item;

        if (item && typeof item === "object" && "msg" in item) {

          return String((item as { msg: unknown }).msg);

        }

        return null;

      })

      .filter(Boolean);

    if (messages.length > 0) return messages.join(". ");

  }

  return fallback;

}



function buildAuthHeaders(init?: RequestInit & { skipAuth?: boolean }): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (init?.skipAuth) {
    delete headers.Authorization;
    delete headers.authorization;
    return headers;
  }

  // Prefer an Authorization header supplied by the caller (e.g. fresh OTP token).
  if (headers.Authorization || headers.authorization) {
    return headers;
  }

  if (typeof window !== "undefined") {
    const token = getAuthSession()?.accessToken;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

let refreshInFlight: Promise<string | null> | null = null;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 15_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function isAuthErrorMessage(message: string): boolean {
  return /session expired|sign in again|invalid or expired token|unauthorized|authentication required/i.test(
    message,
  );
}

interface TokenPayload {
  access_token?: string;
  refresh_token?: string;
}

function parseTokenPayload(json: unknown): TokenPayload | null {
  if (!json || typeof json !== "object") return null;
  const record = json as Record<string, unknown>;

  if (typeof record.access_token === "string") {
    return {
      access_token: record.access_token,
      refresh_token:
        typeof record.refresh_token === "string" ? record.refresh_token : undefined,
    };
  }

  if (record.data && typeof record.data === "object") {
    return parseTokenPayload(record.data);
  }

  return null;
}

function isAccessTokenExpired(token: string, bufferSeconds = 90): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
    if (!payload.exp) return false;
    return Date.now() >= (payload.exp - bufferSeconds) * 1000;
  } catch {
    return false;
  }
}

function sessionNeedsRefresh(accessToken?: string | null): boolean {
  if (!accessToken) return true;
  return isAccessTokenExpired(accessToken);
}

/** Refresh access token using stored refresh token (best-effort before API calls). */
export async function refreshSessionIfNeeded(): Promise<boolean> {
  const session = getAuthSession();
  if (!session?.accessToken && !session?.refreshToken) return false;
  if (!session.refreshToken) return Boolean(session.accessToken);
  if (!sessionNeedsRefresh(session.accessToken)) return true;

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  const token = await refreshInFlight;
  if (token) return true;
  return Boolean(getAuthSession()?.accessToken && !sessionNeedsRefresh(getAuthSession()?.accessToken));
}

/** Ensure a usable access token; refresh when expired. Returns false when re-login is required. */
export async function ensureValidSession(): Promise<boolean> {
  const session = getAuthSession();
  if (!session?.accessToken && !session?.refreshToken) return false;
  if (session.accessToken && !sessionNeedsRefresh(session.accessToken)) return true;
  if (!session.refreshToken) {
    return Boolean(session.accessToken && !sessionNeedsRefresh(session.accessToken));
  }

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  const token = await refreshInFlight;
  return Boolean(token ?? (getAuthSession()?.accessToken && !sessionNeedsRefresh(getAuthSession()?.accessToken)));
}

async function refreshAccessToken(): Promise<string | null> {
  const session = getAuthSession();
  const refreshToken = session?.refreshToken;
  if (!refreshToken || !session) return null;

  const tryRefresh = async (path: string, init: RequestInit) => {
    const url = `${getApiBaseUrl()}${resolveUserPath(path)}`;
    const response = await fetchWithTimeout(url, init, 15_000);
    if (!response.ok) return null;
    const json = (await response.json()) as unknown;
    const tokens = parseTokenPayload(json);
    if (!tokens?.access_token) return null;
    setAuthSession({
      ...session,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? refreshToken,
    });
    return tokens.access_token;
  };

  try {
    const withBody = await tryRefresh("/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (withBody) return withBody;

    const legacyBody = await tryRefresh("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (legacyBody) return legacyBody;

    return await tryRefresh("/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  } catch {
    return null;
  }
}

function friendlyAuthError(message: string) {
  if (/invalid or expired token/i.test(message) || /unauthorized/i.test(message)) {
    return "Session expired. Please sign in again.";
  }
  return message;
}

export type ApiFetchInit = RequestInit & {
  skipAuth?: boolean;
  /** Abort the request after this many ms (default 30s). */
  timeoutMs?: number;
  /** Do not retry (OTP verify must not fire twice). */
  skipRetry?: boolean;
  /** Override retry count (e.g. 2 after a 504 on send-otp). */
  maxRetries?: number;
  /** Use the Next.js `/api` rewrite (same origin) instead of calling the API host directly. */
  sameOrigin?: boolean;
};

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit,
  fallbackError = "Request failed"
): Promise<T> {
  const { skipAuth, timeoutMs = 30_000, skipRetry, maxRetries, sameOrigin, ...fetchInit } = init ?? {};
  const url =
    sameOrigin && typeof window !== "undefined"
      ? resolveUserPath(path)
      : `${getApiBaseUrl()}${resolveUserPath(path)}`;
  const headers = buildAuthHeaders({ ...fetchInit, skipAuth });
  let response: Response | null = null;
  const maxAttempts = skipRetry ? 0 : (maxRetries ?? MAX_RETRIES);

  for (let attempt = 0; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      response = await fetch(url, {
        ...fetchInit,
        headers,
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(
          "Request timed out. The server is taking too long — please try again.",
        );
      }
      if (attempt < maxAttempts) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      throw error instanceof Error
        ? error
        : new Error("Network error. Please try again.");
    } finally {
      clearTimeout(timeout);
    }

    if (response.ok || !RETRYABLE_STATUS.has(response.status) || attempt === maxAttempts) {
      break;
    }

    // Render free tier often returns 503 while waking from idle.
    await sleep(1000 * (attempt + 1));
  }

  if (!response) {
    throw new Error(fallbackError);
  }

  if (response.status === 401 && !skipAuth) {
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
    }
    const newToken = await refreshInFlight;
    if (newToken) {
      const retryHeaders = {
        ...(headers as Record<string, string>),
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetchWithTimeout(
        url,
        { ...fetchInit, headers: retryHeaders },
        timeoutMs,
      );
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const raw =
      response.status === 503
        ? getErrorMessage(
            errorBody,
            "Server is waking up. Please wait a few seconds and try again.",
          )
        : getErrorMessage(errorBody, fallbackError);
    if (response.status === 401 && !skipAuth && typeof window !== "undefined") {
      const { clearAuthSession } = await import("@/lib/auth-session");
      clearAuthSession();
    }
    throw new Error(
      response.status === 401 ? friendlyAuthError(raw) : raw,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}



export function authFetch<T>(
  path: string,
  init?: ApiFetchInit,
  fallbackError = "Request failed"
): Promise<T> {
  return apiFetch<T>(path.startsWith("/") ? path : `/${path}`, init, fallbackError);
}

