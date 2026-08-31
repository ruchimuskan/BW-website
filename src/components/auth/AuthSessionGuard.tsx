"use client";

import { useEffect } from "react";
import {
  clearAuthSession,
  getAuthSession,
  hasAuthCookie,
} from "@/lib/auth-session";

/** Clears stale auth cookies when sessionStorage has no valid API token. */
export function AuthSessionGuard() {
  useEffect(() => {
    if (hasAuthCookie() && !getAuthSession()?.accessToken) {
      clearAuthSession();
    }
  }, []);

  return null;
}
