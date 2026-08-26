"use client";

import { SettingsHeader } from "@/components/layout/SettingsHeader";
import {
  SETTINGS_PAGE_BG,
  settingsShell,
} from "@/lib/settings-shell";
import { brandTheme } from "@/lib/brand-theme";
import { cn } from "@/lib/utils";

interface SettingsPageLayoutProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
  /** Wider content for denser pages */
  wide?: boolean;
}

/** Elegant, responsive wrapper for account / settings screens. */
export function SettingsPageLayout({
  title,
  subtitle,
  backHref,
  onBack,
  children,
  className,
  wide = false,
}: SettingsPageLayoutProps) {
  return (
    <div className={cn(SETTINGS_PAGE_BG, "flex flex-col pb-10", className)}>
      <SettingsHeader title={title} backHref={backHref} onBack={onBack} />
      <div
        className={cn(
          settingsShell("flex-1 py-5 sm:py-7 lg:py-8"),
          wide && "max-w-5xl xl:max-w-6xl",
        )}
      >
        {subtitle ? (
          <p className={cn("mb-6 max-w-xl sm:mb-8", brandTheme.pageSubtitle)}>
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
