"use client";

import { useEffect } from "react";

/** Idle-deferred backend ping — avoids competing with first paint / LCP. */
export function BackendWarmup() {
  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      void import("@/lib/api").then((m) => {
        if (!cancelled) void m.warmBackend();
      });
    };

    const ric = window.requestIdleCallback?.(run, { timeout: 5000 });
    const timer = window.setTimeout(run, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (ric != null) window.cancelIdleCallback?.(ric);
    };
  }, []);

  return null;
}
