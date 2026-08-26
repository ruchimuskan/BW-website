"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { GlowButton } from "@/components/landing/GlowButton";
import { ROUTES } from "@/constants/routes";
import { landingAssets } from "@/constants/services";

const openAreas = [
  {
    title: "Product & Design",
    description:
      "Shape rider and captain experiences that feel calm, clear, and premium.",
  },
  {
    title: "Engineering",
    description:
      "Build reliable matching, maps, payments, and safety systems at city scale.",
  },
  {
    title: "Operations",
    description:
      "Keep cities running smoothly — captain quality, support, and on-ground excellence.",
  },
  {
    title: "Growth & Partnerships",
    description:
      "Tell the Bull Wave Rides story and grow trusted mobility across India.",
  },
] as const;

export function CareersView() {
  const router = useRouter();

  return (
    <MarketingPageShell>
      <LandingHeader />

      <section className="relative overflow-hidden bw-hero-atmosphere px-4 py-14 sm:px-6 sm:py-20 lg:py-24">

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <AnimateIn>
              <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-secondary sm:text-xs">
                Careers
              </p>
              <div className="mt-3 h-px w-14 bg-gradient-to-r from-secondary via-primary to-transparent" />
            </AnimateIn>
            <AnimateIn delay={0.06}>
              <h1
                className="mt-4 font-heading text-[2rem] font-light leading-[1.15] tracking-tight sm:text-5xl"
                style={{ color: "#B8D926" }}
              >
                Build mobility
                <span className="mt-1 block bg-gradient-to-r from-primary to-secondary bg-clip-text font-semibold text-transparent">
                  that feels composed.
                </span>
              </h1>
            </AnimateIn>
            <AnimateIn delay={0.12}>
              <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-[#4a5228] sm:text-lg">
                Join Bull Wave Rides and help millions move with confidence —
                through rides, parcels, and emergency care across India.
              </p>
            </AnimateIn>
            <AnimateIn delay={0.18}>
              <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <GlowButton
                  onClick={() => {
                    window.location.href = "mailto:careers@bullwaverides.com";
                  }}
                >
                  Email careers team
                </GlowButton>
                <GlowButton
                  tone="outline"
                  onClick={() => router.push(ROUTES.captains)}
                >
                  Drive as a captain
                  <span aria-hidden>→</span>
                </GlowButton>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn delay={0.1} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/4] sm:rounded-[1.4rem] lg:aspect-[4/5]">
              <Image
                src={landingAssets.slideFleet}
                alt="Bull Wave Rides team and fleet"
                fill
                priority
                quality={85}
                className={BRAND_PHOTO_CLASS}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <BrandImageOverlay variant="default" />
            </div>
          </AnimateIn>
        </div>
      </section>

      <section className="border-t border-primary/10 bg-gradient-to-b from-[#ffffff] to-white px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <AnimateIn className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-secondary sm:text-xs">
              Where you can contribute
            </p>
            <h2
              className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: "#B8D926" }}
            >
              Teams shaping every mile
            </h2>
            <p className="mt-3 text-sm font-light text-[#4a5228] sm:text-base">
              We hire curious people who care about safety, craft, and rider trust.
            </p>
          </AnimateIn>

          <Stagger className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:gap-5">
            {openAreas.map((area, index) => (
              <StaggerItem key={area.title} index={index}>
                <article className="h-full rounded-2xl border border-primary/10 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(40,54,20,0.35)] sm:rounded-[1.25rem] sm:p-6">
                  <h3
                    className="font-heading text-lg font-semibold tracking-tight"
                    style={{ color: "#B8D926" }}
                  >
                    {area.title}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-[#4a5228]">
                    {area.description}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <AnimateIn className="mt-12 text-center sm:mt-14">
            <p className="text-sm text-[#4a5228]">
              Send your resume to{" "}
              <a
                href="mailto:careers@bullwaverides.com"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                careers@bullwaverides.com
              </a>
            </p>
          </AnimateIn>
        </div>
      </section>

      <LandingFooter />
    </MarketingPageShell>
  );
}
