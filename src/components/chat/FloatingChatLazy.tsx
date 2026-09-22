"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const FloatingChatWidget = dynamic(
  () =>
    import("@/components/chat/FloatingChatWidget").then(
      (m) => m.FloatingChatWidget,
    ),
  { ssr: false },
);

/** Mount once after first paint — never tear down on navigation. */
export function FloatingChatLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };
    const ric = window.requestIdleCallback?.(enable, { timeout: 80 });
    const timer = window.setTimeout(enable, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (ric != null) window.cancelIdleCallback?.(ric);
    };
  }, []);

  if (!ready) return null;
  return <FloatingChatWidget />;
}
