"use client";

import Link from "next/link";
import { Apple, Smartphone } from "lucide-react";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { AnimateIn } from "@/components/motion";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function DownloadView() {
  const iosReady = Boolean(APP_DOWNLOAD.iosAppStoreUrl);

  return (
    <MarketingPageShell>
      <LandingHeader />

      <main>
        <section className="relative overflow-hidden bw-hero-atmosphere border-b border-primary/10 px-4 pt-14 pb-12 sm:px-6 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <AnimateIn>
              <p className="text-[10px] font-semibold tracking-[0.24em] text-secondary uppercase sm:text-[11px]">
                Download the app
              </p>
              <h1
                className="mt-4 font-heading text-[1.85rem] font-light leading-[1.12] tracking-tight min-[400px]:text-[2.2rem] sm:text-4xl lg:text-[2.65rem] bw-title"
              >
                Ride, deliver, and get SOS help
                <span className="mt-1 block font-semibold sm:mt-1.5">
                  in one app.
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[14px] font-light leading-relaxed text-[#4a5228] sm:mt-5 sm:text-base">
                Download BW Rides for Android or iOS. Book bike, auto, and
                cab rides, send parcels, and request ambulance SOS — with live
                tracking and safety tools built in.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.08} className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <a
                href={APP_DOWNLOAD.androidPlayStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_16px_36px_-16px_rgba(184,217,38,0.65)] transition hover:bg-primary/90",
                )}
              >
                <Smartphone className="h-4 w-4" />
                Get it on Google Play
              </a>
              {iosReady ? (
                <a
                  href={APP_DOWNLOAD.iosAppStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/30 bg-white px-7 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
                >
                  <Apple className="h-4 w-4" />
                  Download for iOS
                </a>
              ) : (
                <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/20 bg-white/80 px-7 text-sm font-medium text-[#4a5228]">
                  <Apple className="h-4 w-4" />
                  iOS coming soon
                </span>
              )}
            </AnimateIn>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-14">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {[
              {
                title: "Book rides",
                body: "Bike, auto, and cab with upfront fares and live ETAs.",
                href: ROUTES.ride,
              },
              {
                title: "Drive & earn",
                body: "Become a captain with flexible hours and clear payouts.",
                href: ROUTES.captains,
              },
              {
                title: "Emergency SOS",
                body: "Request verified medical transport when you need it most.",
                href: ROUTES.sos,
              },
            ].map((item) => (
              <AnimateIn key={item.title}>
                <Link
                  href={item.href}
                  className="block h-full rounded-2xl border border-primary/10 bg-[#ffffff] p-5 transition hover:border-primary/25 hover:bg-white hover:shadow-[0_18px_40px_-28px_rgba(40,54,20,0.35)] sm:p-6"
                >
                  <h2
                    className="font-heading text-base font-semibold bw-title"
                  >
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm font-light leading-relaxed text-[#4a5228]">
                    {item.body}
                  </p>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </MarketingPageShell>
  );
}
