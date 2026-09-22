"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { ResilientImage } from "@/components/brand/ResilientImage";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import {
  SafetyAtmosphere,
  SafetyEyebrow,
  SafetyFeatureCard,
  SafetyOffsetImage,
  SafetySectionBand,
  SafetyWayForward,
} from "@/components/landing/safety/SafetyPrimitives";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { customerSafetyPage } from "@/constants/safety-content";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

function VerificationAccordion({
  items,
}: {
  items: readonly { id: string; title: string; content: string }[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-2xl border transition-all duration-300",
              isOpen
                ? "border-[#dce8a8]/80 bg-gradient-to-br from-white to-[#f8fbe8]/90 shadow-[0_16px_40px_-28px_rgba(184,217,38,0.35)]"
                : "border-[#dce8a8]/45 bg-white/95 hover:border-primary/25",
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`verification-panel-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/80 sm:px-5 sm:py-5"
            >
              <span className="font-heading text-base font-semibold tracking-tight text-[#283614] sm:text-lg bw-title">
                {item.title}
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
                  isOpen
                    ? "border-primary/30 bg-primary text-white rotate-45"
                    : "border-[#dce8a8]/70 bg-[#f8fbe8]/80 text-primary",
                )}
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`verification-panel-${item.id}`}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-5 text-[13px] font-light leading-relaxed text-[#4a5228] sm:px-5 sm:pb-6 sm:text-sm">
                    {item.content}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function CustomerSafetyView() {
  const { hero, captainVerification, appFeatures, wayForward } =
    customerSafetyPage;
  const featureCount = appFeatures.features.length;
  const lastFeatureIndex = featureCount - 1;

  return (
    <>
      <section
        className="relative overflow-hidden py-10 sm:py-14 lg:py-16 xl:py-20"
        aria-labelledby="customer-safety-heading"
      >
        <SafetyAtmosphere />

        <div className={landingShell("relative grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16")}>
          <div className="min-w-0">
            <AnimateIn>
              <SafetyEyebrow>Customers</SafetyEyebrow>
            </AnimateIn>
            <AnimateIn delay={0.06}>
              <h1
                id="customer-safety-heading"
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
          </div>

          <AnimateIn
            direction="right"
            delay={0.1}
            className="flex w-full min-w-0 items-center justify-center lg:justify-end"
          >
            <SafetyOffsetImage
              src={hero.image}
              alt={hero.alt}
              align="left"
              fallbackSrc={hero.fallbackSrc}
              className="w-full max-w-md lg:max-w-none"
            />
          </AnimateIn>
        </div>
      </section>

      <SafetySectionBand
        tinted
        id="captain-verification"
        aria-labelledby="verification-heading"
      >
        <div className="grid w-full min-w-0 items-start gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <AnimateIn className="order-2 lg:order-1">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/60 bg-[#1a1f16] shadow-[0_24px_56px_-30px_rgba(184,217,38,0.45)] ring-1 ring-primary/10 sm:rounded-3xl">
                <ResilientImage
                  src={captainVerification.image}
                  alt={captainVerification.alt}
                  fill
                  quality={NEXT_IMAGE_QUALITY.medium}
                  className={cn(
                    BRAND_PHOTO_CLASS,
                    captainVerification.imageClassName,
                  )}
                  sizes="(max-width: 1024px) 100vw, 480px"
                  fallbackSrc={captainVerification.imageFallbackSrc}
                />
                <BrandImageOverlay variant="card" />
              </div>
            </div>
          </AnimateIn>

          <AnimateIn className="order-1 min-w-0 lg:order-2">
            <SafetyEyebrow>Verification</SafetyEyebrow>
            <h2
              id="verification-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl lg:text-4xl bw-title"
            >
              {captainVerification.title}
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
              {captainVerification.description}
            </p>
            <div className="mt-6 sm:mt-8">
              <VerificationAccordion items={captainVerification.accordion} />
            </div>
          </AnimateIn>
        </div>
      </SafetySectionBand>

      <SafetySectionBand
        accent
        id="app-safety-features"
        aria-labelledby="app-features-heading"
      >
        <div className="w-full min-w-0">
          <AnimateIn className="max-w-2xl">
            <SafetyEyebrow>In the app</SafetyEyebrow>
            <h2
              id="app-features-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl lg:text-4xl bw-title"
            >
              {appFeatures.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[#4a5228] sm:mt-4 sm:text-base">
              {appFeatures.description}
            </p>
          </AnimateIn>

          <Stagger className="mt-8 grid grid-cols-1 items-start gap-3 min-[480px]:grid-cols-2 sm:mt-10 sm:gap-4 lg:gap-5">
            {appFeatures.features.map((feature, index) => (
              <StaggerItem
                key={feature.title}
                index={index}
                className={cn(
                  featureCount % 2 !== 0 &&
                    index === lastFeatureIndex &&
                    "min-[480px]:col-span-2 min-[480px]:mx-auto min-[480px]:w-full min-[480px]:max-w-md lg:max-w-lg",
                )}
              >
                <SafetyFeatureCard {...feature} index={index} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </SafetySectionBand>

      <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:pb-20" aria-labelledby="way-forward-heading">
        <AnimateIn className="w-full min-w-0">
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
