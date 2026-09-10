"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  SafetyAtmosphere,
  SafetyEyebrow,
  SafetyFaqAccordion,
  SafetyFeatureCard,
  SafetyHeroStats,
  SafetyImageCollage,
  SafetyMeasureCell,
  SafetySectionBand,
  SafetyWayForward,
} from "@/components/landing/safety/SafetyPrimitives";
import {
  protectionSteps,
  safetyFeatureCards,
  safetyFaqItems,
  safetyOverviewPage,
  type SafetyAudience,
} from "@/constants/safety-content";
import { ROUTES } from "@/constants/routes";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { getProtectedPath } from "@/lib/auth-session";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

type SafetyOverviewViewProps = {
  onTabChange: (tab: Exclude<SafetyAudience, "all">) => void;
};

export function SafetyOverviewView({ onTabChange }: SafetyOverviewViewProps) {
  const router = useRouter();
  const { hero, coversEveryone, measures, wayForward } = safetyOverviewPage;

  return (
    <>
      <section
        className="relative overflow-hidden py-10 sm:py-14 lg:py-16 xl:py-20"
        aria-labelledby="overview-hero-heading"
      >
        <SafetyAtmosphere />

        <div className={landingShell("relative grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 xl:gap-16")}>
          <div className="min-w-0">
            <AnimateIn>
              <SafetyEyebrow>Safety</SafetyEyebrow>
            </AnimateIn>

            <AnimateIn delay={0.06}>
              <h1
                id="overview-hero-heading"
                className="mt-5 font-heading text-[2.15rem] font-light leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.35rem] bw-title"
              >
                {hero.title.replace(".", "")}
                <span className="text-[#B8D926]">.</span>
              </h1>
            </AnimateIn>

            <AnimateIn delay={0.12}>
              <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-[#4a5228] sm:mt-6 sm:text-lg">
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
                  className="h-12 rounded-xl px-7 font-semibold shadow-[0_14px_32px_-18px_rgba(184,217,38,0.55)]"
                  onClick={() =>
                    router.push(getProtectedPath(ROUTES.ambulanceBook))
                  }
                >
                  Book ambulance for free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-primary/25 bg-white/80 px-7 font-semibold text-primary backdrop-blur-sm hover:bg-primary/5"
                  onClick={() =>
                    document
                      .getElementById("safety-measures")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See measures
                </Button>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn
            direction="right"
            delay={0.1}
            className="flex w-full min-w-0 items-center justify-center lg:justify-end"
          >
            <SafetyImageCollage
              images={hero.images}
              className="w-full lg:max-w-[min(100%,28rem)] xl:max-w-[min(100%,32rem)]"
            />
          </AnimateIn>
        </div>
      </section>

      <SafetySectionBand tinted id="covers-everyone" aria-labelledby="covers-everyone-heading">
        <div className="w-full min-w-0">
          <AnimateIn>
            <SafetyEyebrow>Who we protect</SafetyEyebrow>
            <h2
              id="covers-everyone-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl lg:text-4xl bw-title"
            >
              {coversEveryone.title}
            </h2>
          </AnimateIn>

          <Stagger className="mt-9 grid gap-5 sm:mt-11 sm:grid-cols-2 sm:gap-6">
            {coversEveryone.cards.map((card, index) => (
              <StaggerItem key={card.id} index={index}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/12 bg-white shadow-[0_20px_50px_-32px_rgba(184,217,38,0.4)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-30px_rgba(184,217,38,0.45)] sm:rounded-3xl">
                  <div className="absolute left-5 top-5 z-10 rounded-full border border-white/40 bg-white/90 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-primary shadow-sm backdrop-blur-sm">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div
                    className={cn(
                      "relative aspect-[16/10] overflow-hidden",
                      card.id === "captains" ? "bg-[#1a1f16]" : "bg-[#eef3dc]",
                    )}
                  >
                    <ResilientImage
                      src={card.image}
                      alt={card.alt}
                      fill
                      quality={NEXT_IMAGE_QUALITY.medium}
                      className={cn(
                        BRAND_PHOTO_CLASS,
                        "transition-transform duration-700 group-hover:scale-[1.03]",
                        "imageClassName" in card ? card.imageClassName : undefined,
                      )}
                      sizes="(max-width: 640px) 100vw, 480px"
                      fallbackSrc={
                        "imageFallbackSrc" in card ? card.imageFallbackSrc : undefined
                      }
                    />
                    <BrandImageOverlay variant="card" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
                  </div>
                  <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
                    <h3
                      className="font-heading text-xl font-semibold tracking-tight sm:text-2xl bw-title"
                    >
                      {card.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[13px] font-light leading-relaxed text-[#4a5228] sm:text-sm">
                      {card.description}
                    </p>
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => onTabChange(card.tab)}
                      className="mt-5 h-11 w-full rounded-xl px-5 text-xs font-semibold uppercase tracking-[0.14em] shadow-[0_14px_32px_-18px_rgba(184,217,38,0.55)] sm:w-auto sm:text-sm"
                    >
                      Know more
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </SafetySectionBand>

      <SafetySectionBand id="safety-journey" aria-labelledby="safety-journey-heading">
        <div className="w-full min-w-0">
          <AnimateIn className="max-w-2xl">
            <SafetyEyebrow>How we protect</SafetyEyebrow>
            <h2
              id="safety-journey-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl bw-title"
            >
              Your safety journey, step by step
            </h2>
          </AnimateIn>

          <div className="mt-8 grid items-start gap-3 min-[480px]:grid-cols-2 sm:mt-10 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5 lg:gap-4">
            {protectionSteps.map((step, index) => (
              <AnimateIn key={step.step} delay={index * 0.05}>
                <div className="relative flex h-full flex-col rounded-2xl border border-[#dce8a8]/50 bg-gradient-to-b from-white to-[#f8fbe8]/60 p-5 shadow-[0_12px_36px_-24px_rgba(56,71,27,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_44px_-26px_rgba(184,217,38,0.32)] sm:p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#9BB820] text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(184,217,38,0.65)]">
                    {step.step}
                  </span>
                  <h3
                    className="mt-4 font-heading text-base font-semibold tracking-tight sm:text-lg bw-title"
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] font-light leading-relaxed text-[#4a5228]">
                    {step.description}
                  </p>
                  {index < protectionSteps.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute -right-2 top-1/2 hidden h-px w-4 bg-gradient-to-r from-primary/40 to-transparent lg:block"
                    />
                  ) : null}
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </SafetySectionBand>

      <SafetySectionBand tinted id="safety-measures" aria-labelledby="overview-measures-heading">
        <div className="w-full min-w-0">
          <div className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-[0_28px_64px_-36px_rgba(184,217,38,0.45)] sm:rounded-3xl">
            <div className="grid sm:grid-cols-2">
              <AnimateIn className="relative flex flex-col justify-center border-b border-primary/10 bg-[#38471B] p-6 text-white sm:border-r sm:p-8 lg:p-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_0%_0%,rgba(200,232,74,0.28),transparent_60%)]"
                />
                <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-secondary">
                  Core measures
                </p>
                <h2
                  id="overview-measures-heading"
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

      <SafetySectionBand accent aria-labelledby="safety-features-heading">
        <div className="w-full min-w-0">
          <AnimateIn className="max-w-2xl">
            <SafetyEyebrow>Built in</SafetyEyebrow>
            <h2
              id="safety-features-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl lg:text-4xl bw-title"
            >
              Safety tools on every trip
            </h2>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[#4a5228] sm:mt-4 sm:text-base">
              From verified captains to one-tap SOS — every BW Rides journey
              includes tools designed to keep you safe before, during, and after the ride.
            </p>
          </AnimateIn>

          <Stagger className="mt-8 grid grid-cols-1 items-start gap-3 min-[480px]:grid-cols-2 sm:mt-10 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {safetyFeatureCards.map((feature, index) => (
              <StaggerItem key={feature.title} index={index}>
                <SafetyFeatureCard {...feature} index={index} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </SafetySectionBand>

      <SafetySectionBand tinted aria-labelledby="safety-faq-heading">
        <div className="w-full min-w-0 lg:max-w-4xl lg:mx-auto">
          <AnimateIn className="text-center">
            <SafetyEyebrow>FAQ</SafetyEyebrow>
            <h2
              id="safety-faq-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl bw-title"
            >
              Common safety questions
            </h2>
          </AnimateIn>

          <div className="mt-9 sm:mt-11">
            <SafetyFaqAccordion items={safetyFaqItems} limit={5} />
          </div>

          <AnimateIn className="mt-8 text-center">
            <Link
              href={getProtectedPath(ROUTES.profileHelp)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-secondary"
            >
              Visit help center
              <ChevronRight className="h-4 w-4" />
            </Link>
          </AnimateIn>
        </div>
      </SafetySectionBand>

      <section className="pb-10 sm:pb-14 lg:pb-16">
        <AnimateIn className={landingShell()}>
          <SafetyWayForward
            title={wayForward.title}
            description={wayForward.description}
            linkLabel={wayForward.linkLabel}
            href={wayForward.href}
          />
        </AnimateIn>
      </section>
    </>
  );
}
