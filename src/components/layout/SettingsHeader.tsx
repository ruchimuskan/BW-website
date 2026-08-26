"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { settingsShell } from "@/lib/settings-shell";
import { brandTheme } from "@/lib/brand-theme";
import { cn } from "@/lib/utils";

interface SettingsHeaderProps {
  title?: string;
  className?: string;
  backHref?: string;
  onBack?: () => void;
}

export function SettingsHeader({
  title,
  className,
  backHref,
  onBack,
}: SettingsHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };

  return (
    <header className={cn(brandTheme.stickyHeader, className)}>
      <div className={settingsShell("flex items-center gap-3 py-3.5 sm:gap-4 sm:py-4")}>
        <button
          type="button"
          onClick={handleBack}
          className={cn(
            "group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            "border border-[#dce8a8]/90 bg-gradient-to-br from-[#f7fbe8] via-white to-[#f0f7d8]",
            "text-[#38471B] shadow-[0_10px_24px_-14px_rgba(56,71,27,0.38)]",
            "transition-all duration-200",
            "hover:border-[#B8D926]/70 hover:from-[#eef8c8] hover:via-[#f7fbe8] hover:to-[#e8f4c4]",
            "hover:shadow-[0_14px_32px_-14px_rgba(56,71,27,0.48)]",
            "active:scale-[0.96]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D926]/45 focus-visible:ring-offset-2",
          )}
          aria-label="Go back"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[#B8D926]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />
          <ArrowLeft
            className="relative h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5"
            strokeWidth={2.25}
          />
        </button>
        {title ? (
          <h1 className={cn("min-w-0 truncate", brandTheme.pageTitle)}>
            {title}
          </h1>
        ) : null}
      </div>
    </header>
  );
}
