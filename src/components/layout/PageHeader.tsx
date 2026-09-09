"use client";

import { Menu } from "lucide-react";
import { useAppShellSidebar } from "@/components/layout/AppShell";
import { brandTheme } from "@/lib/brand-theme";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  const sidebar = useAppShellSidebar();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 overflow-hidden border-b border-primary/15 text-white shadow-[0_10px_32px_-24px_rgba(40,54,20,0.35)]",
        brandTheme.heroBand,
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(200,232,74,0.35),transparent_55%)]"
      />
      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-10 lg:py-5">
        {sidebar ? (
          <button
            type="button"
            onClick={sidebar.openSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition hover:bg-white/20 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        <div className="min-w-0">
          <p className={cn(brandTheme.eyebrow, "text-[#D4E88A]/90")}>
            BW Rides
          </p>
          <h1 className="truncate font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm font-light text-white/70">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
