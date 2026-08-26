"use client";

import { Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppShellSidebar } from "@/components/layout/AppShell";
import { brandTheme } from "@/lib/brand-theme";
import { cn } from "@/lib/utils";

interface HeroHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function HeroHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  className,
}: HeroHeaderProps) {
  const sidebar = useAppShellSidebar();

  return (
    <div
      className={cn(
        "relative overflow-hidden px-4 pb-10 pt-5 text-white sm:px-6 sm:pt-6 md:rounded-none md:px-10 md:pb-12 lg:px-10 lg:pt-8",
        brandTheme.heroBand,
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(200,232,74,0.35),transparent_55%)]"
      />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-secondary/20 blur-2xl" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {sidebar ? (
              <button
                type="button"
                onClick={sidebar.openSidebar}
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition hover:bg-white/20 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            ) : null}
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#D4E88A]/85 uppercase">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-md text-sm font-light text-white/75">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {Icon ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
              <Icon className="h-6 w-6" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
