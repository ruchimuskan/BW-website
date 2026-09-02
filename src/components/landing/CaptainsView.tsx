"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Handshake,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { ResilientImage } from "@/components/brand/ResilientImage";
import { CaptainsShowcaseGallery } from "@/components/landing/CaptainsShowcaseGallery";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { DownloadAppMenu } from "@/components/landing/DownloadAppMenu";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { landingAssets } from "@/constants/services";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";

const benefits = [
  {
    icon: Clock3,
    title: "Flexible hours",
    description: "Go online when it suits you — mornings, nights, or weekends.",
  },
  {
    icon: Wallet,
    title: "Transparent payouts",
    description: "Weekly settlements with zero hidden fees and clear trip earnings.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & support",
    description: "24×7 captain helpline, SOS tools, and insurance guidance.",
  },
  {
    icon: Handshake,
    title: "Fair matching",
    description: "Smart trip assignment across bike, auto, cab, and parcel.",
  },
] as const;

export function CaptainsView() {
  return (
    <MarketingPageShell>
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bw-hero-atmosphere">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-20 z-0 h-48 w-48 rounded-full bg-[#C6E31A]/12 blur-3xl"
        />

        <div className={landingShell("relative z-10 grid grid-cols-1 items-center gap-6 py-10 sm:gap-8 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:py-16")}>
          <AnimateIn direction="right" delay={0.08} className="order-2 min-w-0 lg:order-2">
            <CaptainsShowcaseGallery priority />
          </AnimateIn>

          <div className="order-1 min-w-0 lg:order-1">
            <AnimateIn>
              <p className="font-heading text-2xl font-semibold tracking-tight text-[#111411] sm:text-3xl">
                Bull Wave Rides
              </p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.24em] text-[#6b7344] uppercase sm:text-[11px]">
                Drive with us
              </p>
              <div className="mt-3 h-px w-14 bg-gradient-to-r from-[#B8D926] to-transparent" />
            </AnimateIn>

            <AnimateIn delay={0.06}>
              <h1 className="mt-4 font-heading text-[1.65rem] font-light leading-snug tracking-tight text-[#111411] min-[400px]:text-[1.85rem] sm:text-4xl lg:text-[2.5rem]">
                Earn on your terms.
                <span className="mt-1 block font-semibold text-[#1A1F16]">
                  Drive with pride.
                </span>
              </h1>
            </AnimateIn>

            <AnimateIn delay={0.1}>
              <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
                Set your own schedule, get transparent payouts, and partner with a
                platform that invests in captain safety and support.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.14}>
              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <DownloadAppMenu
                  size="lg"
                  label="Download Captain App"
                  buttonClassName="h-12 w-full gap-2 rounded-full bg-[#C6E31A] px-7 text-[15px] font-semibold text-[#111411] shadow-[0_12px_28px_-12px_rgba(17,20,17,0.4)] hover:bg-[#D4F04A] sm:w-auto sm:min-w-[15.5rem]"
                  androidApkUrl={APP_DOWNLOAD.captainAndroidApkUrl}
                  iosUrl={APP_DOWNLOAD.captainIosAppStoreUrl}
                />
                <p className="text-center text-xs tracking-wide text-[#5a6330] sm:text-left">
                  Available on Android &amp; iOS
                </p>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative border-y border-[#eef5d4] bg-white bw-responsive-section">
        <div className="bw-marketing-container">
          <AnimateIn>
            <p className="text-[10px] font-semibold tracking-[0.24em] text-[#7a8450] uppercase sm:text-[11px]">
              Why captains choose us
            </p>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#B8D926] to-transparent" />
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#38471B] sm:text-3xl">
              Built for partners on the road
            </h2>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
              Everything you need to earn with confidence — flexibility, clarity,
              and support at every mile.
            </p>
          </AnimateIn>

          <Stagger className="mt-8 grid grid-cols-1 gap-3.5 min-[520px]:grid-cols-2 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title} index={index}>
                  <article
                    className={cn(
                      "group relative h-full overflow-hidden rounded-2xl border border-[#E4E7E0] bg-white p-5 shadow-sm transition-[border-color,box-shadow] duration-200 sm:p-6",
                      "hover:border-[#C6E31A] hover:shadow-[0_16px_36px_-24px_rgba(17,20,17,0.2)]",
                    )}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-[2px] bg-[#C6E31A]"
                    />
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E4E7E0] bg-[#F4F5F2] text-[#111411] transition-colors duration-200 group-hover:border-[#C6E31A] group-hover:bg-[#C6E31A]">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <span className="mt-4 block font-heading text-xs tracking-[0.16em] text-[#7a8450]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1.5 font-heading text-lg font-semibold text-[#38471B]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-[#4a5228]">
                      {item.description}
                    </p>
                    <span className="mt-4 block h-px w-8 bg-gradient-to-r from-[#B8D926] to-transparent transition-all duration-300 group-hover:w-14" />
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Safety */}
      <section className="bw-responsive-section">
        <div className="bw-marketing-container grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <AnimateIn className="relative order-1 overflow-hidden rounded-2xl border border-[#dce8a8]/60 shadow-[0_24px_48px_-28px_rgba(40,54,20,0.4)] sm:rounded-3xl">
            <div
              className="relative aspect-[16/11] w-full bg-[#F4F5F2]"
              style={{
                backgroundImage: `url(${landingAssets.slideFleet})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <ResilientImage
                src={landingAssets.slideFleet}
                alt="Bull Wave Rides captain fleet"
                fill
                className={BRAND_PHOTO_CLASS}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <BrandImageOverlay variant="default" />
            </div>
          </AnimateIn>

          <AnimateIn delay={0.08} className="order-2 min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-[#7a8450] uppercase sm:text-[11px]">
              Safety first
            </p>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#B8D926] to-transparent" />
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#38471B] sm:text-3xl">
              Protected while you earn
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
              From verification to on-road SOS, Bull Wave Rides backs captains with
              tools and policies designed for calm, confident trips.
            </p>
            <Link
              href={ROUTES.safety}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.1em] text-[#38471B] uppercase transition hover:text-[#B8D926]"
            >
              Captain safety
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* CTA */}
      <section className="bw-responsive-section pb-14 sm:pb-20">
        <AnimateIn className="bw-marketing-container relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#283614] via-[#38471B] to-[#4a5824] px-6 py-10 shadow-[0_28px_56px_-28px_rgba(32,42,16,0.55)] sm:rounded-3xl sm:px-10 sm:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#C6E31A]/15 blur-3xl"
          />
          <div className="relative max-w-xl">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#D4E88A]/85 uppercase">
              Get started
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">
              Ready to partner?
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-white/75 sm:text-base">
              Download the Captain app and start earning with transparent payouts
              and 24×7 support.
            </p>
            <div className="mt-6">
              <DownloadAppMenu
                size="lg"
                label="Get Captain App"
                buttonClassName="h-12 bg-[#C6E31A] px-8 font-semibold text-[#111411] shadow-[0_12px_28px_-12px_rgba(0,0,0,0.35)] hover:bg-[#D4F04A]"
                androidApkUrl={APP_DOWNLOAD.captainAndroidApkUrl}
                iosUrl={APP_DOWNLOAD.captainIosAppStoreUrl}
              />
            </div>
          </div>
        </AnimateIn>
      </section>

      <LandingFooter />
    </MarketingPageShell>
  );
}
