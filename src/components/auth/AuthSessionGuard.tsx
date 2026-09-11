"use client";

import { useEffect } from "react";
import {
  clearAuthSession,
  getAuthSession,
  hasAuthCookie,
  isAuthenticated,
} from "@/lib/auth-session";
import { AUTH_SESSION_KEY } from "@/constants/auth";

/**
 * Keeps middleware cookie and sessionStorage JWT in sync.
 * Clears stale cookies that would otherwise bounce users to /login incorrectly.
 */
export function AuthSessionGuard() {
  useEffect(() => {
    const sync = () => {
      if (hasAuthCookie() && !getAuthSession()?.accessToken) {
        clearAuthSession();
        return;
      }
      // Refresh cookie TTL while a valid session is open (long-lived tabs).
      if (getAuthSession()?.accessToken) {
        isAuthenticated();
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

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener("wavego-auth-update", sync);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wavego-auth-update", sync);
    };
  }, []);

  return null;
}
