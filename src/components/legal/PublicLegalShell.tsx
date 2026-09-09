"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { ROUTES } from "@/constants/routes";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

type PublicLegalShellProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
  relatedLinks?: { label: string; href: string }[];
};

/**
 * Public legal pages (privacy, terms) — full marketing width, tight side padding.
 */
export function PublicLegalShell({
  title,
  eyebrow = "Legal",
  description,
  children,
  relatedLinks,
}: PublicLegalShellProps) {
  return (
    <MarketingPageShell className="min-h-[100dvh] bg-[#F7F8F5]">
      <LandingHeader />

      <section className="relative overflow-hidden bg-[#111411] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_100%_0%,rgba(198,227,26,0.16),transparent_58%)]"
        />
        <div className={landingShell("relative z-10 py-5 sm:py-6 lg:py-7")}>
          <Link
            href={ROUTES.landing}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/65 transition-colors hover:text-[#C6E31A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Back to home
          </Link>
          <p className="mt-3.5 text-[10px] font-semibold tracking-[0.22em] uppercase text-[#C6E31A]/90 sm:mt-4 sm:text-[11px]">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 max-w-4xl font-heading text-[1.5rem] font-bold tracking-tight text-white sm:text-[1.85rem] lg:text-[2.1rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-white/65 sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>
      </section>

      <main className={landingShell("relative z-10 pb-10 pt-5 sm:pb-12 sm:pt-6 lg:pb-14 lg:pt-7")}>
        <div className="w-full min-w-0">
          {children}

          {relatedLinks && relatedLinks.length > 0 ? (
            <nav
              aria-label="Related legal documents"
              className="mt-5 rounded-xl border border-[#E4E7E0] bg-white p-3.5 sm:mt-6 sm:p-4"
            >
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#5A6158]">
                See also
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "inline-flex rounded-lg border border-[#E4E7E0] bg-[#F4F5F2] px-3 py-1.5 text-xs font-semibold text-[#1B3A22]",
                        "transition-colors hover:border-[#C6E31A] hover:bg-[#C6E31A]/12",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </main>

      <LandingFooter />
    </MarketingPageShell>
  );
}
