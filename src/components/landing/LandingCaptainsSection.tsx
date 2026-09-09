"use client";

import Link from "next/link";
import { AnimateIn } from "@/components/motion";
import { CaptainsShowcaseGallery } from "@/components/landing/CaptainsShowcaseGallery";
import { DownloadAppMenu } from "@/components/landing/DownloadAppMenu";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { landingShell } from "@/lib/landing-shell";

const benefits = [
  "Flexible hours — you choose when to drive",
  "Weekly payouts with zero hidden fees",
  "24/7 captain support & safety tools",
] as const;

/**
 * Landing captains teaser — contained photo, responsive two-column layout.
 */
export function LandingCaptainsSection() {
  return (
    <section
      id="captains"
      className="relative scroll-mt-20 overflow-hidden border-y border-[#eef5d4] bg-white"
    >
      <div className={landingShell("grid grid-cols-1 items-center gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-2 lg:gap-10 lg:py-12")}>
        <AnimateIn className="order-2 min-w-0 lg:order-1">
          <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[#6b7344] sm:text-[10px]">
            Drive with BW Rides
          </p>
          <div className="mt-1.5 h-px w-10 bg-gradient-to-r from-[#B8D926] to-transparent" />
          <h2 className="mt-2.5 font-heading text-[1.3rem] font-light leading-snug tracking-tight text-[#283614] sm:text-[1.55rem] lg:text-[1.75rem]">
            Earn on your terms.
            <span className="mt-0.5 block font-semibold text-[#1A1F16]">
              Drive with pride.
            </span>
          </h2>
          <p className="mt-2.5 max-w-md text-[13px] font-light leading-relaxed text-[#4a5228] sm:text-sm">
            Set your own schedule, get transparent payouts, and partner with a
            platform that invests in captain safety and support.
          </p>

          <ol className="mt-4 space-y-2">
            {benefits.map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13px] text-[#4a5228] sm:text-sm"
              >
                <span className="mt-0.5 font-heading text-[10px] tracking-[0.14em] text-[#7a8450]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <DownloadAppMenu
              size="default"
              label="Download Captain App"
              buttonClassName="h-10 w-full gap-2 rounded-full bg-[#C6E31A] px-5 text-sm font-semibold text-[#111411] shadow-[0_10px_22px_-10px_rgba(17,20,17,0.4)] hover:bg-[#D4F04A] sm:w-auto sm:min-w-[13.5rem]"
              androidApkUrl={APP_DOWNLOAD.captainAndroidApkUrl}
              iosUrl={APP_DOWNLOAD.captainIosAppStoreUrl}
            />
            <Link
              href={ROUTES.captains}
              className="text-center text-[11px] font-semibold tracking-[0.14em] uppercase text-[#38471B] hover:text-[#5a6330] sm:text-left"
            >
              Learn more →
            </Link>
          </div>
        </AnimateIn>

        <AnimateIn className="order-1 lg:order-2">
          <CaptainsShowcaseGallery />
        </AnimateIn>
      </div>
    </section>
  );
}
