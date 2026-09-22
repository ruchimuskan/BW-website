"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AnimateIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  SafetyAtmosphere,
  SafetyEyebrow,
  SafetyHeroStats,
  SafetyMeasureCell,
  SafetyOffsetImage,
  SafetySectionBand,
} from "@/components/landing/safety/SafetyPrimitives";
import { captainSafetyPage } from "@/constants/safety-content";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

export function CaptainSafetyView() {
  const router = useRouter();
  const { hero, measures } = captainSafetyPage;

  return (
    <>
      <section
        className="relative overflow-hidden py-10 sm:py-14 lg:py-16 xl:py-20"
        aria-labelledby="captain-safety-heading"
      >
        <SafetyAtmosphere />

        <div className={landingShell("relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16")}>
          <div>
            <AnimateIn>
              <SafetyEyebrow>Captains</SafetyEyebrow>
            </AnimateIn>
            <AnimateIn delay={0.06}>
              <h1
                id="captain-safety-heading"
                className="mt-5 font-heading text-[2.15rem] font-light leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.1rem] bw-title"
              >
                {hero.title}
              </h1>
            </AnimateIn>
            <AnimateIn delay={0.12}>
              <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-[#4a5228] sm:text-lg">
                {hero.description}
              </p>
            </AnimateIn>
            <AnimateIn delay={0.16}>
              <SafetyHeroStats />
            </AnimateIn>
            <AnimateIn delay={0.2}>
              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-primary px-7 font-semibold text-white shadow-[0_14px_32px_-18px_rgba(184,217,38,0.55)] hover:bg-[#D4F04A] hover:text-white"
                  onClick={() => router.push(ROUTES.captains)}
                >
                  Become a captain
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-primary/25 bg-white/80 px-7 font-semibold text-primary backdrop-blur-sm hover:bg-primary/5"
                  onClick={() =>
                    document
                      .getElementById("captain-safety-measures")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See measures
                </Button>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn direction="right" delay={0.1}>
            <SafetyOffsetImage
              src={hero.image}
              alt={hero.alt}
              align="right"
              fallbackSrc={hero.fallbackSrc}
              imageClassName={hero.imageClassName}
            />
          </AnimateIn>
        </div>
      </section>

      <SafetySectionBand
        tinted
        id="captain-safety-measures"
        aria-labelledby="captain-measures-heading"
      >
        <div className="w-full min-w-0">
          <div className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-[0_28px_64px_-36px_rgba(184,217,38,0.45)] sm:rounded-3xl">
            <div className="grid sm:grid-cols-2">
              <AnimateIn className="relative flex flex-col justify-center border-b border-primary/10 bg-[#38471B] p-6 text-white sm:border-r sm:p-8 lg:p-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_0%_0%,rgba(200,232,74,0.28),transparent_60%)]"
                />
                <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-primary">
                  Partner protection
                </p>
                <h2
                  id="captain-measures-heading"
                  className="mt-3 font-heading text-2xl font-light leading-snug tracking-tight sm:text-3xl lg:text-[2.15rem]"
                >
                  {measures.heading}
                </h2>
              </AnimateIn>

              {measures.items.map((item, index) => (
                <AnimateIn
                  key={item.title}
                  delay={index * 0.05}
                  className={cn(
                    "group border-b border-l-4 border-l-transparent border-primary/10 bg-white/95 transition-all duration-300 hover:border-l-primary hover:bg-[#ffffff]",
                    index === 0 && "sm:border-r",
                    index === 1 && "sm:border-b-0",
                    index === 2 && "sm:border-r sm:border-b-0",
                  )}
                >
                  <SafetyMeasureCell {...item} />
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </SafetySectionBand>

      <SafetySectionBand aria-labelledby="captain-cta-heading">
        <AnimateIn className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-primary/12 bg-white px-6 py-10 shadow-[0_24px_56px_-32px_rgba(184,217,38,0.4)] sm:rounded-3xl sm:px-10 sm:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary/15 blur-3xl"
          />
          <SafetyEyebrow>Partner with us</SafetyEyebrow>
          <h2
            id="captain-cta-heading"
            className="mt-5 font-heading text-2xl font-light tracking-tight sm:text-3xl bw-title"
          >
            Drive safer. Earn with confidence.
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
            Download the Captain app for insurance guidance, SOS tools, and 24×7 partner
            support on every trip.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={APP_DOWNLOAD.captainAndroidPlayStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-[#9BB820] px-7 text-sm font-semibold text-white shadow-[0_14px_32px_-18px_rgba(56,71,27,0.38)] transition-opacity hover:opacity-95"
            >
              Get Captain App
            </a>
            <Link
              href={ROUTES.captains}
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase text-primary transition-colors hover:text-secondary sm:text-sm"
            >
              Learn more
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimateIn>
      </SafetySectionBand>
    </>
  );
}
