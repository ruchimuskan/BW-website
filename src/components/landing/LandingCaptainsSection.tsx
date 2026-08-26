"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { AnimateIn } from "@/components/motion";
import { DownloadAppMenu } from "@/components/landing/DownloadAppMenu";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { landingCaptainImage } from "@/constants/services";

const benefits = [
  "Flexible hours — you choose when to drive",
  "Weekly payouts with zero hidden fees",
  "24/7 captain support & safety tools",
] as const;

/** Landing teaser — full experience lives on /captains */
export function LandingCaptainsSection() {
  return (
    <section
      id="captains"
      className="relative scroll-mt-20 overflow-hidden bw-section-glow border-y border-primary/10 px-4 py-16 sm:px-5 md:px-6 lg:px-8 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_80%_40%,rgba(200,232,74,0.14),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-[90rem]">
        <AnimateIn>
          <div className="grid items-stretch overflow-hidden bw-elevated-card lg:grid-cols-2">
            <div className="relative order-1 min-h-[240px] sm:min-h-[300px] lg:order-2 lg:min-h-full">
              <Image
                src={landingCaptainImage}
                alt="Bull Wave Rides captain partner"
                fill
                quality={85}
                className={BRAND_PHOTO_CLASS}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <BrandImageOverlay variant="default" />
            </div>

            <div className="order-2 flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:order-1 lg:px-10 lg:py-14">
              <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-secondary sm:text-xs">
                Drive with Bull Wave Rides
              </p>
              <h2
                className="mt-3 font-heading text-[1.55rem] font-light leading-tight tracking-tight sm:text-3xl lg:text-4xl"
                style={{ color: "#B8D926" }}
              >
                Earn on your terms.
                <span className="mt-1 block bg-gradient-to-r from-primary to-secondary bg-clip-text font-semibold text-transparent">
                  Drive with pride.
                </span>
              </h2>
              <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
                Set your own schedule, get transparent payouts, and partner with a
                platform that invests in captain safety and support.
              </p>

              <ol className="mt-6 space-y-3">
                {benefits.map((item, i) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-[#4a5228] sm:text-[0.95rem]"
                  >
                    <span className="mt-0.5 font-heading text-xs tracking-[0.16em] text-secondary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <DownloadAppMenu
                  size="lg"
                  label="Download Captain App"
                  buttonClassName="h-12 w-full bg-primary px-8 font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  androidApkUrl={APP_DOWNLOAD.captainAndroidApkUrl}
                  iosUrl={APP_DOWNLOAD.captainIosAppStoreUrl}
                />
                <Link
                  href={ROUTES.captains}
                  className="text-center text-xs font-semibold tracking-[0.14em] uppercase text-primary hover:text-secondary sm:text-left"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
