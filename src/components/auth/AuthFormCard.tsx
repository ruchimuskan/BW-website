"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { ROUTES } from "@/constants/routes";
import { SITE_BRAND } from "@/constants/seo";
import { cn } from "@/lib/utils";

interface AuthFormCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Hide brand row on large screens when the left panel already shows it. */
  hideBrandOnDesktop?: boolean;
}

/** Shared branded shell for login / signup form cards. */
export function AuthFormCard({
  title,
  subtitle,
  children,
  footer,
  className,
  bodyClassName,
  hideBrandOnDesktop = false,
}: AuthFormCardProps) {
  return (
    <div
      className={cn(
        "relative flex w-full max-h-[100dvh] min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#dfe8c4]/90 bg-white/95 shadow-[0_16px_48px_-28px_rgba(40,54,20,0.4)] backdrop-blur-sm sm:rounded-[24px] lg:h-full lg:max-h-full lg:shadow-[0_20px_60px_-32px_rgba(40,54,20,0.42)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#9BB820] via-[#C8E84A] to-[#B8D926]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-36 w-36 rounded-full bg-[#C8E84A]/18 blur-3xl"
        aria-hidden
      />

      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3.5 py-3.5 sm:px-5 sm:py-5 lg:px-6 lg:py-5",
          bodyClassName,
        )}
      >
        <Link
          href={ROUTES.landing}
          className={cn(
            "mb-2.5 inline-flex items-center gap-2 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/30 sm:mb-3",
            hideBrandOnDesktop && "lg:hidden",
          )}
        >
          <WaveGoLogo size="sm" priority className="!h-7 !w-7 sm:!h-9 sm:!w-9" />
          <span className="font-heading text-[13px] font-bold tracking-tight text-[#38471B] sm:text-sm">
            {SITE_BRAND}
          </span>
        </Link>

        <div className="mb-3 shrink-0 sm:mb-4">
          <h1 className="font-heading text-[1.25rem] font-bold leading-tight tracking-tight text-[#38471B] sm:text-[1.4rem] lg:text-[1.5rem]">
            {title}
          </h1>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:mt-1 sm:text-[13px]">
            {subtitle}
          </p>
        </div>

        <div className="min-h-0 flex-1">{children}</div>

        {footer ? <div className="mt-2.5 shrink-0 sm:mt-3.5">{footer}</div> : null}
      </div>
    </div>
  );
}
