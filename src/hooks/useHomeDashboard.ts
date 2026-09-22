"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHomeDashboard, type HomeDashboard } from "@/lib/home-api";
import { getUnreadNotificationCount } from "@/lib/notifications-api";
import {
  clearAuthSession,
  isAuthenticated,
  requireAuthRedirect,
} from "@/lib/auth-session";
import { isAuthErrorMessage } from "@/lib/api";
import { ROUTES } from "@/constants/routes";

export function useHomeDashboard() {
  const router = useRouter();
  const [data, setData] = useState<HomeDashboard | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isAuthenticated()) {
        clearAuthSession();
        router.replace(requireAuthRedirect(ROUTES.home));
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [dashboard, unread] = await Promise.all([
          getHomeDashboard(),
          getUnreadNotificationCount().catch(() => ({ count: 0 })),
        ]);
        if (!cancelled) {
          setData(dashboard);
          setUnreadCount(unread.count);
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load home data";
        if (isAuthErrorMessage(message)) {
          clearAuthSession();
          router.replace(requireAuthRedirect(ROUTES.home));
          return;
        }
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { data, unreadCount, isLoading, error };
}
