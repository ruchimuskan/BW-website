"use client";

import { useEffect, useState } from "react";
import { getProtectedPath } from "@/lib/auth-session";

/**
 * Resolves a booking/app path after mount so logged-in users are not sent to /login.
 * SSR and the first paint use the destination itself; guests are rewritten to login
 * on the client (middleware also gates protected routes).
 */
export function useProtectedHref(path: string): string {
  const [href, setHref] = useState(path);

  useEffect(() => {
    const sync = () => setHref(getProtectedPath(path));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("wavego-auth-update", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("wavego-auth-update", sync);
    };
  }, [path]);

  return href;
}
