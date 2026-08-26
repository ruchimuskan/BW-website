"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SettingsHeader } from "@/components/layout/SettingsHeader";
import {
  SETTINGS_PAGE_BG,
  settingsShell,
} from "@/lib/settings-shell";
import { cn } from "@/lib/utils";

interface InfoPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function InfoPageLayout({ title, children }: InfoPageLayoutProps) {
  return (
    <AppShell showBottomNav={false} className="pb-0">
      <div className={cn(SETTINGS_PAGE_BG, "flex flex-1 flex-col pb-10")}>
        <SettingsHeader title={title} />
        <div className={settingsShell("flex-1 py-6 sm:py-8")}>{children}</div>
      </div>
    </AppShell>
  );
}
