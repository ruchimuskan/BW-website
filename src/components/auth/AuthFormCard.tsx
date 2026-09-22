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
  /** Optional eyebrow above the title (e.g. Secure sign-in). */
  eyebrow?: ReactNode;
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
  eyebrow,
}: AuthFormCardProps) {
  return (
    <div
      className={cn(
        "relative flex w-full min-h-0 flex-col overflow-visible rounded-2xl border border-[#dfe4d4] bg-white/95 shadow-[0_24px_56px_-32px_rgba(17,20,17,0.4)] backdrop-blur-sm sm:rounded-[26px]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#111411] via-[#C6E31A] to-[#9BB820]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-44 w-44 rounded-full bg-[#C8E84A]/16 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-40 w-40 rounded-full bg-[#111411]/[0.04] blur-3xl"
        aria-hidden
      />

      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-7 lg:py-6",
          bodyClassName,
        )}
      >
        <Link
          href={ROUTES.landing}
          className={cn(
            "mb-3 inline-flex items-center gap-2 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#C6E31A]/40 sm:mb-3.5",
            hideBrandOnDesktop && "lg:hidden",
          )}
        >
          <WaveGoLogo size="sm" priority className="!h-7 !w-7 sm:!h-9 sm:!w-9" />
          <span className="font-heading text-[13px] font-bold tracking-tight text-[#111411] sm:text-sm">
            {SITE_BRAND}
          </span>
        </Link>

        <div className="mb-4 shrink-0 sm:mb-5">
          {eyebrow ? <div className="mb-2.5">{eyebrow}</div> : null}
          <h1 className="font-heading text-[1.35rem] font-bold leading-tight tracking-tight text-[#111411] sm:text-[1.55rem] lg:text-[1.7rem]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-full text-pretty text-[12.5px] leading-relaxed text-[#5A6158] sm:max-w-[42ch] sm:text-[13.5px]">
            {subtitle}
          </p>
        </div>

        <div className="min-h-0 flex-1">{children}</div>

        {footer ? (
          <div className="mt-4 shrink-0 border-t border-[#eef1e6] pt-3.5 sm:mt-5 sm:pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
