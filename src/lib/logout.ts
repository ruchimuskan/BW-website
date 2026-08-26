import { clearAuthSession, getAuthSession } from "@/lib/auth-session";
import { apiFetch } from "@/lib/api";
import { clearCompanySession } from "@/lib/company-session";

/**
 * Best-effort server revoke (if the API supports it) + always clear local session.
 * Failed revoke still logs the user out locally — no backend change required.
 */
export async function logoutCurrentUser(): Promise<void> {
  const session = getAuthSession();
  if (session?.accessToken || session?.refreshToken) {
    await apiFetch(
      "/auth/logout",
      {
        method: "POST",
        body: JSON.stringify(
          session.refreshToken ? { refresh_token: session.refreshToken } : {},
        ),
        skipRetry: true,
        timeoutMs: 8_000,
      },
      "Unable to log out",
    ).catch(() => null);
  }

  clearAuthSession();
  clearCompanySession();
}
