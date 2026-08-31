"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { ResilientImage } from "@/components/brand/ResilientImage";
import { BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { AnimateIn } from "@/components/motion";
import { BRAND_IMAGES } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

const AUTO_MS = 5500;

const experiences = [
  {
    src: BRAND_IMAGES.limeCab,
    alt: "Premium lime Bull Wave Rides sedan",
    title: "Polished rides",
    tagline: "Premium cab experience",
    description:
      "Clean vehicles and courteous service for a calm, premium experience.",
    objectPosition: "center center",
  },
  {
    src: BRAND_IMAGES.parcelDelivery,
    alt: "Doorstep parcel delivery in brand lime",
    title: "On your schedule",
    tagline: "Parcel at your door",
    description:
      "24×7 availability with average pickups under five minutes in active zones.",
    objectPosition: "62% center",
  },
  {
    src: BRAND_IMAGES.ambulanceBrand,
    alt: "Bull Wave Rides emergency ambulance",
    title: "Safety first",
    tagline: "Emergency SOS",
    description:
      "Verified captains, trip sharing, and SOS tools built into every journey.",
    objectPosition: "center center",
  },
  {
    src: BRAND_IMAGES.cityBike,
    alt: "Bull Wave Rides premium bike",
    title: "Live tracking",
    tagline: "Every mile, visible",
    description:
      "Follow your captain in real time with precise ETAs from pickup to drop.",
    objectPosition: "center center",
  },
] as const;

function ExperiencePanel({
  item,
  index,
  active,
  onActivate,
  reduceMotion,
}: {
  item: (typeof experiences)[number];
  index: number;
  active: boolean;
  onActivate: () => void;
  reduceMotion: boolean | null;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      layout={!reduceMotion}
      role="button"
      tabIndex={0}
      aria-expanded={active}
      aria-label={`${item.title} — ${item.description}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-[1.25rem] border bg-[#f7fbe8] outline-none sm:rounded-[1.35rem]",
        "transition-[border-color,box-shadow] duration-500",
        active
          ? "border-[#C8E84A]/45 shadow-[0_28px_56px_-22px_rgba(184,217,38,0.55)] ring-1 ring-[#C8E84A]/20"
          : "cursor-pointer border-[#38471B]/80 hover:border-[#B8D926]/35",
        "lg:min-h-0 lg:h-full lg:flex-1",
        active ? "lg:flex-[2.75]" : "lg:flex-[0.85]",
      )}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { type: "spring", stiffness: 260, damping: 32 }
      }
    >
      {/* Active lime rail */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 z-20 w-1 origin-top bg-gradient-to-b from-[#C8E84A] via-[#B8D926] to-transparent transition-transform duration-500",
          active ? "scale-y-100" : "scale-y-0",
        )}
      />

      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
        <ResilientImage
          src={item.src}
          alt={item.alt}
          fill
          quality={NEXT_IMAGE_QUALITY.high}
          sizes={
            active
              ? "(max-width: 1024px) 100vw, 42vw"
              : "(max-width: 1024px) 100vw, 18vw"
          }
          className={cn(
            BRAND_PHOTO_CLASS,
            "transition-transform duration-[850ms] ease-out",
            active ? "scale-100" : "scale-110 grayscale-[0.15]",
            "group-hover:scale-105",
          )}
          style={{ objectPosition: item.objectPosition }}
          priority={index === 0}
          fallbackSrc={BRAND_IMAGES.cityCab}
        />
      </div>

      {/* Watermark number */}
      <span
        aria-hidden
          className={cn(
            "pointer-events-none absolute font-heading font-bold leading-none text-[#38471B] transition-all duration-500",
            active
              ? "right-4 top-3 text-[4.5rem] opacity-[0.08] sm:text-[5.5rem] lg:right-6 lg:top-4 lg:text-[7rem]"
              : "right-3 top-3 text-3xl opacity-[0.12] lg:right-4 lg:top-5 lg:text-4xl",
          )}
      >
        {number}
      </span>

      {/* Collapsed vertical label — desktop only */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-center pb-8 lg:flex",
          active && "opacity-0",
        )}
      >
        <p
          className="text-[11px] font-semibold tracking-[0.28em] text-[#38471B]/70 uppercase [writing-mode:vertical-rl]"
          style={{ transform: "rotate(180deg)" }}
        >
          {item.title}
        </p>
      </div>

      {/* Content panel — desktop accordion */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 hidden p-4 sm:p-5 lg:block lg:p-6",
          "bg-[#f7fbe8]/92 backdrop-blur-[2px]",
          "transition-all duration-500",
          active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <p className="text-[10px] font-semibold tracking-[0.24em] text-[#4A5824] uppercase">
          {number} · {item.tagline}
        </p>
        <h3 className="mt-1.5 font-heading text-xl font-semibold text-[#38471B] sm:text-2xl">
          {item.title}
        </h3>
        <p className="mt-2 max-w-md text-[13px] font-light leading-relaxed text-[#4A5824] sm:text-sm">
          {item.description}
        </p>
        <span
          className={cn(
            "mt-3 block h-0.5 rounded-full bg-[#B8D926] transition-all duration-500",
            active ? "w-14" : "w-8",
          )}
        />
      </div>

      {/* Mobile / tablet — caption under the image so artwork stays fully visible */}
      <div className="border-t border-[#e8f0c8] bg-[#f7fbe8] p-4 sm:p-5 lg:hidden">
        <p className="text-[10px] font-semibold tracking-[0.24em] text-[#4A5824] uppercase">
          {number}
        </p>
        <h3 className="mt-1 font-heading text-lg font-semibold text-[#38471B] sm:text-xl">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] font-light leading-relaxed text-[#4A5824] sm:text-sm">
          {item.description}
        </p>
        <span className="mt-3 block h-0.5 w-10 rounded-full bg-[#B8D926]" />
      </div>
    </motion.article>
  );
}

export function LandingPremiumExperience() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const activate = useCallback((index: number) => {
    setActive(index);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % experiences.length);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused]);

  return (
    <section
      id="experience"
      className={cn(
        "relative scroll-mt-20 overflow-hidden bw-section-glow",
        LANDING_SECTION_PY,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_80%_0%,rgba(200,232,74,0.08),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-64 w-64 rounded-full bg-[#B8D926]/10 blur-3xl"
      />

      <div className={landingShell("relative z-10")}>
        <AnimateIn>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Experience"
              title="Designed like a premium service"
              description="Every detail — from matching to arrival — is crafted for composure and confidence."
              className="max-w-2xl"
            />

            {/* Step indicators — desktop */}
            <div
              className="hidden shrink-0 items-center gap-2 lg:flex"
              role="tablist"
              aria-label="Experience highlights"
            >
              {experiences.map((item, index) => {
                const isActive = active === index;
                return (
                  <button
                    key={item.title}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={item.title}
                    onClick={() => activate(index)}
                    className={cn(
                      "flex h-11 min-w-[2.75rem] items-center justify-center rounded-full border text-xs font-semibold tracking-wider transition-all duration-300",
                      isActive
                        ? "border-[#B8D926] bg-[#B8D926] text-[#38471B] shadow-[0_8px_20px_-8px_rgba(184,217,38,0.8)]"
                        : "border-[#B8D926]/25 bg-white/80 text-[#38471B]/70 hover:border-[#B8D926]/50 hover:bg-[#f7fbe8]",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>
        </AnimateIn>

        {/* Mobile / tablet — stacked cinematic cards */}
        <div className="mt-8 flex flex-col gap-4 sm:mt-10 lg:hidden">
          {experiences.map((item, index) => (
            <ExperiencePanel
              key={item.title}
              item={item}
              index={index}
              active
              onActivate={() => activate(index)}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        {/* Desktop — expanding accordion strip */}
        <div className="mt-8 hidden h-[min(480px,52vh)] min-h-[380px] lg:flex lg:gap-3">
          {experiences.map((item, index) => (
            <ExperiencePanel
              key={item.title}
              item={item}
              index={index}
              active={active === index}
              onActivate={() => activate(index)}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
