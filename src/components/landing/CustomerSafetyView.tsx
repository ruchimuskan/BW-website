"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import {
  SafetyAtmosphere,
  SafetyEyebrow,
  SafetyOffsetImage,
  SafetySectionBand,
  SafetyWayForward,
} from "@/components/landing/safety/SafetyPrimitives";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { customerSafetyPage } from "@/constants/safety-content";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { cn } from "@/lib/utils";

function VerificationAccordion({
  items,
}: {
  items: readonly { id: string; title: string; content: string }[];
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-2xl border transition-all duration-300",
              isOpen
                ? "border-primary/25 bg-white shadow-[0_16px_40px_-28px_rgba(184,217,38,0.35)]"
                : "border-primary/12 bg-white/95 hover:border-primary/20",
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`verification-panel-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-[#ffffff] sm:px-5 sm:py-5"
            >
              <span
                className="font-heading text-base font-semibold tracking-tight sm:text-lg"
                style={{ color: "#B8D926" }}
              >
                {item.title}
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
                  isOpen
                    ? "border-primary/30 bg-primary text-white rotate-45"
                    : "border-primary/15 bg-[#ffffff] text-primary",
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

function AppSafetyFeature({
  icon: Icon,
  title,
  description,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: readonly string[];
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/12 bg-white px-5 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-30px_rgba(184,217,38,0.4)] sm:rounded-3xl sm:px-6 sm:py-7">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-[#ffffff] text-primary transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-white sm:h-12 sm:w-12">
        <Icon
          className="h-5 w-5 shrink-0 text-primary transition-colors duration-300 group-hover:text-white"
          strokeWidth={1.7}
        />
      </span>
      <h3
        className="mt-4 font-heading text-lg font-semibold tracking-tight sm:text-xl"
        style={{ color: "#B8D926" }}
      >
        {title}
      </h3>
      <p className="mt-2 text-[13px] font-light leading-relaxed text-[#4a5228] sm:text-sm">
        {description}
      </p>
      {bullets && bullets.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-[13px] font-light text-[#4a5228]">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function CustomerSafetyView() {
  const { hero, captainVerification, appFeatures, wayForward } =
    customerSafetyPage;

  return (
    <>
      <section
        className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:py-24"
        aria-labelledby="customer-safety-heading"
      >
        <SafetyAtmosphere />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <AnimateIn>
              <SafetyEyebrow>Customers</SafetyEyebrow>
            </AnimateIn>
            <AnimateIn delay={0.06}>
              <h1
                id="customer-safety-heading"
                className="mt-5 font-heading text-[2.15rem] font-light leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.1rem]"
                style={{ color: "#B8D926" }}
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

          <AnimateIn direction="right" delay={0.1}>
            <SafetyOffsetImage src={hero.image} alt={hero.alt} align="left" />
          </AnimateIn>
        </div>
      </section>

      <SafetySectionBand
        tinted
        id="captain-verification"
        aria-labelledby="verification-heading"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <AnimateIn className="order-2 lg:order-1">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-primary/15 bg-[#f7fbe8] shadow-[0_24px_56px_-30px_rgba(184,217,38,0.45)] ring-1 ring-white/50 sm:rounded-3xl">
                <Image
                  src={captainVerification.image}
                  alt={captainVerification.alt}
                  fill
                  quality={NEXT_IMAGE_QUALITY.medium}
                  className={BRAND_PHOTO_CLASS}
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <BrandImageOverlay variant="default" />
              </div>
            </div>
          </AnimateIn>

          <AnimateIn className="order-1 lg:order-2">
            <SafetyEyebrow>Verification</SafetyEyebrow>
            <h2
              id="verification-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl lg:text-4xl"
              style={{ color: "#B8D926" }}
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
        id="app-safety-features"
        aria-labelledby="app-features-heading"
      >
        <div className="mx-auto max-w-6xl">
          <AnimateIn>
            <SafetyEyebrow>In the app</SafetyEyebrow>
            <h2
              id="app-features-heading"
              className="mt-5 font-heading text-[1.65rem] font-light tracking-tight sm:text-3xl lg:text-4xl"
              style={{ color: "#B8D926" }}
            >
              {appFeatures.title}
            </h2>
          </AnimateIn>

          <Stagger className="mt-9 grid gap-3 sm:mt-11 sm:grid-cols-2 sm:gap-4">
            {appFeatures.features.map((feature, index) => (
              <StaggerItem key={feature.title} index={index}>
                <AppSafetyFeature {...feature} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </SafetySectionBand>

      <section className="px-4 pb-14 sm:px-6 sm:pb-20" aria-labelledby="way-forward-heading">
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
