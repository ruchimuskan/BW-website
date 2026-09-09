"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { isChatWidgetPath } from "@/lib/chat-widget";

const FloatingChatWidget = dynamic(
  () =>
    import("@/components/chat/FloatingChatWidget").then(
      (m) => m.FloatingChatWidget,
    ),
  { ssr: false },
);

/** Defer chat JS until idle so first paint stays light. */
export function FloatingChatLazy() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const allowed = isChatWidgetPath(pathname);

  useEffect(() => {
    if (!allowed) {
      setReady(false);
      return;
    }

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    const ric = window.requestIdleCallback?.(enable, { timeout: 600 });
    const timer = window.setTimeout(enable, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (ric != null) window.cancelIdleCallback?.(ric);
    };
  }, [allowed]);

  if (!ready || !allowed) return null;
  return <FloatingChatWidget />;
}
