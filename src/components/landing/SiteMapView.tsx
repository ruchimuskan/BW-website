"use client";

import Link from "next/link";
import { ArrowUpRight, Map } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { SITE_BRAND } from "@/constants/seo";
import { ROUTES } from "@/constants/routes";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import type { SeoSiteLink } from "@/lib/seo-sitelinks";
import { cn } from "@/lib/utils";

const EXTRA_PAGES: SeoSiteLink[] = [
  {
    name: "Home",
    path: ROUTES.landing,
    title: `${SITE_BRAND} home`,
    description: "Book rides, parcels, and ambulance for free.",
    sitelinkDescription: "Start booking from the BW Rides homepage.",
  },
  {
    name: "Privacy policy",
    path: ROUTES.privacy,
    title: "Privacy policy",
    description: "How BW Rides handles your data.",
    sitelinkDescription: "Read how we protect rider and captain data.",
  },
  {
    name: "Terms of service",
    path: ROUTES.terms,
    title: "Terms of service",
    description: "Terms for using BW Rides.",
    sitelinkDescription: "Review the terms for booking and riding.",
  },
  {
    name: "Company login",
    path: ROUTES.corporateLogin,
    title: "Company login",
    description: "Corporate portal sign-in.",
    sitelinkDescription: "Sign in to manage employee travel.",
  },
];

type SiteMapViewProps = {
  links: SeoSiteLink[];
};

export function SiteMapView({ links }: SiteMapViewProps) {
  const seen = new Set<string>();
  const pages = [...links, ...EXTRA_PAGES].filter((page) => {
    if (seen.has(page.path)) return false;
    seen.add(page.path);
    return true;
  });

  return (
    <MarketingPageShell>
      <LandingHeader />

      <main className={cn("relative overflow-hidden bg-[#f7f8f3]", LANDING_SECTION_PY)}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_0%_0%,rgba(198,227,26,0.14),transparent_55%)]"
        />

        <div className={landingShell("relative z-10")}>
          <AnimateIn>
            <header className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] text-[#5a7a12] uppercase sm:text-[11px]">
                <Map className="h-3.5 w-3.5" aria-hidden />
                Sitemap
              </p>
              <div className="mt-2.5 h-1 w-10 rounded-full bg-[#C6E31A]" />
              <h1 className="mt-3 font-heading text-[1.75rem] font-semibold tracking-tight text-[#111411] sm:text-3xl lg:text-[2.25rem]">
                All {SITE_BRAND} pages
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-[#5A6158] sm:text-[15px]">
                Browse every public destination — book, download, safety,
                business, and more. Links stay in sync with live site data.
              </p>
            </header>
          </AnimateIn>

          <Stagger className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {pages.map((page, index) => (
              <StaggerItem key={page.path} index={index}>
                <Link
                  href={page.path}
                  className={cn(
                    "group flex h-full min-h-[6.5rem] flex-col rounded-2xl border border-[#e0e6d2] bg-white p-4",
                    "shadow-[0_12px_32px_-28px_rgba(17,20,17,0.35)] transition-[transform,border-color,box-shadow] duration-200",
                    "hover:-translate-y-0.5 hover:border-[#C6E31A]/55 hover:shadow-[0_18px_40px_-28px_rgba(17,20,17,0.4)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E31A]/40",
                  )}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-heading text-[15px] font-bold tracking-tight text-[#111411] sm:text-base">
                      {page.name}
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-[#5a7a12] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#5A6158]">
                    {page.sitelinkDescription || page.description}
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </main>

      <LandingFooter />
    </MarketingPageShell>
  );
}
