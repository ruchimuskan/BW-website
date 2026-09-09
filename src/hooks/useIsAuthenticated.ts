"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { getAuthSession, isAuthenticated } from "@/lib/auth-session";
import { getDisplayName } from "@/hooks/useAuthUser";

function getAccountLabel(): string {
  const session = getAuthSession();
  if (!session) return "My account";
  const name = getDisplayName(session);
  if (name === "BW Rides User") return "My account";
  const firstName = name.split(/\s+/).filter(Boolean)[0];
  return firstName || "My account";
}

export function useIsAuthenticated() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [accountLabel, setAccountLabel] = useState("My account");

  const sync = useCallback(() => {
    const authed = isAuthenticated();
    setLoggedIn(authed);
    setAccountLabel(authed ? getAccountLabel() : "My account");
  }, []);

  useLayoutEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    window.addEventListener("storage", sync);
    window.addEventListener("wavego-auth-update", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("wavego-auth-update", sync);
    };
  }, [sync]);

  return { loggedIn, accountLabel };
}
