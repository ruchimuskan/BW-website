"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuthSession,
  getAuthSession,
  hasAuthCookie,
  isAuthenticated,
  needsProfileSetup,
  requireAuthRedirect,
  resolvePostAuthDestination,
} from "@/lib/auth-session";
import { AUTH_SESSION_KEY } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { requiresRiderAuth } from "@/lib/route-access";

function isAuthGatePath(pathname: string): boolean {
  return (
    pathname === ROUTES.login ||
    pathname === ROUTES.signup ||
    pathname === ROUTES.otp
  );
}

/**
 * Keeps middleware cookie and sessionStorage JWT in sync.
 * Clears stale cookies and redirects protected pages when the backend token is missing.
 * Also keeps signed-in users off login/signup/otp (e.g. browser Back after login).
 */
export function AuthSessionGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const sync = () => {
      const token = getAuthSession()?.accessToken?.trim();
      const path = pathname || "/";
      const onProtected = requiresRiderAuth(path);

      if (!token) {
        const hasStaleSession =
          hasAuthCookie() ||
          (typeof sessionStorage !== "undefined" &&
            Boolean(sessionStorage.getItem(AUTH_SESSION_KEY)));
        if (hasStaleSession) {
          clearAuthSession();
        }
        if (onProtected) {
          router.replace(requireAuthRedirect(path || "/home"));
        }
        return;
      }

      // Refresh cookie TTL while a valid session is open (long-lived tabs).
      isAuthenticated();

      const session = getAuthSession();
      const needsProfile =
        !!session && needsProfileSetup(session.name, session.email);
      if (
        needsProfile &&
        onProtected &&
        path !== ROUTES.createProfile &&
        !path.startsWith(`${ROUTES.createProfile}/`)
      ) {
        router.replace(ROUTES.createProfile);
        return;
      }

      // Browser Back to login/signup/otp should not dump a signed-in user there.
      if (isAuthGatePath(path)) {
        router.replace(
          needsProfile ? ROUTES.createProfile : resolvePostAuthDestination(),
        );
      }
    };

    sync();

    const onVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };
    const onFocus = () => sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_KEY || event.key == null) sync();
    };
    const onPopState = () => {
      // History Back/Forward can land on /login while the JWT is still valid.
      sync();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener("wavego-auth-update", sync);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wavego-auth-update", sync);
      window.removeEventListener("popstate", onPopState);
    };
  }, [pathname, router]);

  return null;
}
