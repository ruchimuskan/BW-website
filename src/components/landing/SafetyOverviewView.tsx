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
        className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:py-24"
        aria-labelledby="overview-hero-heading"
      >
        <SafetyAtmosphere />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <AnimateIn>
              <SafetyEyebrow>Safety</SafetyEyebrow>
            </AnimateIn>

            <AnimateIn delay={0.06}>
              <h1
                id="overview-hero-heading"
                className="mt-5 font-heading text-[2.15rem] font-light leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.35rem]"
                style={{ color: "#B8D926" }}
              >
                {hero.title.replace(".", "")}
                <span className="text-secondary">.</span>
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
                  Ambulance SOS
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

          <AnimateIn direction="right" delay={0.1}>
            <SafetyImageCollage images={hero.images} />
          </AnimateIn>
        </div>
      </section>

      <SafetySectionBand tinted id="covers-everyone" aria-labelledby="covers-everyone-heading">
        <div className="mx-auto max-w-6xl">
          <AnimateIn>
            <SafetyEyebrow>Who we protect</SafetyEyebrow>
            <h2
              id="covers-everyone-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl lg:text-4xl"
              style={{ color: "#B8D926" }}
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
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#f7fbe8]">
                    <ResilientImage
                      src={card.image}
                      alt={card.alt}
                      fill
                      quality={NEXT_IMAGE_QUALITY.medium}
                      className={cn(
                        BRAND_PHOTO_CLASS,
                        "transition-transform duration-700 group-hover:scale-105",
                      )}
                      sizes="(max-width: 640px) 100vw, 480px"
                    />
                    <BrandImageOverlay variant="card" />
                  </div>
                  <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
                    <h3
                      className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
                      style={{ color: "#B8D926" }}
                    >
                      {card.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[13px] font-light leading-relaxed text-[#4a5228] sm:text-sm">
                      {card.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => onTabChange(card.tab)}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-primary/15 bg-[#ffffff] px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase text-primary transition-colors hover:border-primary/30 hover:bg-primary hover:text-white sm:text-sm"
                    >
                      Know more
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </SafetySectionBand>

      <SafetySectionBand id="safety-journey" aria-labelledby="safety-journey-heading">
        <div className="mx-auto max-w-6xl">
          <AnimateIn className="max-w-2xl">
            <SafetyEyebrow>How we protect</SafetyEyebrow>
            <h2
              id="safety-journey-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl"
              style={{ color: "#B8D926" }}
            >
              Your safety journey, step by step
            </h2>
          </AnimateIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 lg:gap-3">
            {protectionSteps.map((step, index) => (
              <AnimateIn key={step.step} delay={index * 0.05}>
                <div className="relative h-full rounded-2xl border border-primary/12 bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-28px_rgba(184,217,38,0.35)] sm:p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#9BB820] text-sm font-bold text-white shadow-md">
                    {step.step}
                  </span>
                  <h3
                    className="mt-4 font-heading text-base font-semibold tracking-tight sm:text-lg"
                    style={{ color: "#B8D926" }}
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
        <div className="mx-auto max-w-6xl">
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

      <SafetySectionBand aria-labelledby="safety-features-heading">
        <div className="mx-auto max-w-6xl">
          <AnimateIn className="max-w-2xl">
            <SafetyEyebrow>Built in</SafetyEyebrow>
            <h2
              id="safety-features-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl"
              style={{ color: "#B8D926" }}
            >
              Safety tools on every trip
            </h2>
          </AnimateIn>

          <Stagger className="mt-9 grid grid-cols-1 gap-3 sm:mt-11 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {safetyFeatureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title} index={index}>
                  <article
                    className={cn(
                      "group h-full overflow-hidden rounded-2xl border border-primary/12 bg-white px-5 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-30px_rgba(184,217,38,0.4)] sm:rounded-3xl sm:px-6 sm:py-7",
                      index === 0 && "lg:row-span-1",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-[#ffffff] text-primary transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-white sm:h-11 sm:w-11">
                      <Icon
                        className="h-5 w-5 shrink-0 text-primary transition-colors duration-300 group-hover:text-white"
                        strokeWidth={1.8}
                      />
                    </span>
                    <h3
                      className="mt-4 font-heading text-base font-semibold tracking-tight sm:text-lg"
                      style={{ color: "#B8D926" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] font-light leading-relaxed text-[#4a5228]">
                      {feature.description}
                    </p>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </SafetySectionBand>

      <SafetySectionBand tinted aria-labelledby="safety-faq-heading">
        <div className="mx-auto max-w-3xl">
          <AnimateIn className="text-center">
            <SafetyEyebrow>FAQ</SafetyEyebrow>
            <h2
              id="safety-faq-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl"
              style={{ color: "#B8D926" }}
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

      <section className="px-4 pb-14 sm:px-6 sm:pb-20">
        <AnimateIn className="mx-auto max-w-6xl">
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
