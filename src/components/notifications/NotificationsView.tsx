"use client";

import { useEffect, useState } from "react";
import { Ambulance, Bell, Car, CreditCard, Gift, Info, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell, SettingsHeader } from "@/components/layout";
import { getNotifications, type NotificationItem } from "@/lib/notifications-api";
import {
  SETTINGS_PAGE_BG,
  settingsShell,
} from "@/lib/settings-shell";
import type { NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  NotificationType,
  { icon: LucideIcon; bg: string; color: string }
> = {
  ride: { icon: Car, bg: "bg-primary/10", color: "text-primary" },
  promo: { icon: Gift, bg: "bg-secondary/40", color: "text-primary" },
  payment: { icon: CreditCard, bg: "bg-success/10", color: "text-success" },
  ambulance: { icon: Ambulance, bg: "bg-error/10", color: "text-error" },
  system: { icon: Info, bg: "bg-muted", color: "text-muted-foreground" },
};

function inferType(title: string): NotificationType {
  const lower = title.toLowerCase();
  if (lower.includes("ride") || lower.includes("trip")) return "ride";
  if (lower.includes("offer") || lower.includes("promo")) return "promo";
  if (lower.includes("payment") || lower.includes("wallet")) return "payment";
  if (lower.includes("ambulance") || lower.includes("emergency")) return "ambulance";
  return "system";
}

function formatTime(iso?: string) {
  if (!iso) return "Recently";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationItem({ title, body, is_read, createdAt }: NotificationItem & { createdAt?: string }) {
  const type = inferType(title);
  const { icon: Icon, bg, color } = typeConfig[type];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-[#eef5d4] bg-white p-4 shadow-sm transition-all hover:border-[#C8E84A]/35 hover:shadow-[0_14px_32px_-22px_rgba(184,217,38,0.3)] sm:gap-4 sm:rounded-[20px]",
        !is_read && "border-primary/25 bg-[#fcfef8]",
      )}
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
          {!is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning" />}
        </div>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">{body}</p>
        <p className="mt-2 text-xs font-medium text-muted-foreground/80">{formatTime(createdAt)}</p>
      </div>
    </div>
  );
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const rows = await getNotifications();
        setNotifications(rows);
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppShell showBottomNav={false} className="pb-0">
      <div className={cn(SETTINGS_PAGE_BG, "flex flex-1 flex-col pb-10")}>
        <SettingsHeader title="Notifications" />

        <div className={settingsShell("flex-1 py-6 sm:py-8")}>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            <>
              {unreadCount > 0 ? (
                <p className="mb-4 text-sm font-medium text-[#5a6330]">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              ) : null}
              <div className="flex flex-col gap-3">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} {...notification} />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#eef5d4] bg-white/70 px-6 py-14 text-center sm:mt-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f9e4] text-[#C8E84A]">
                <Bell className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#38471B]">
                No notifications yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-[#5a6330]">
                We&apos;ll notify you about rides, payments, and offers here.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
