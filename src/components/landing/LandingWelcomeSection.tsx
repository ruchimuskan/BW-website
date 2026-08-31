"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { GlowButton } from "@/components/landing/GlowButton";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import {
  landingStats,
  landingWelcomeDetails,
  landingWelcomeGallery,
} from "@/constants/services";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

const welcomePanelBg: Record<
  (typeof landingWelcomeGallery)[number]["panel"],
  string
> = {
  dark: "bg-[#283614]",
  lime: "bg-[#f7fbe8]",
  sage: "bg-gradient-to-br from-[#eef5d4] via-[#f4f9e4] to-[#dce8a8]",
};

type ParsedStat =
  | { kind: "static"; text: string }
  | { kind: "count"; prefix: string; target: number; suffix: string };

function parseStatValue(value: string): ParsedStat {
  const match = value.match(/^([^0-9]*)(\d+)(.*)$/);
  if (!match) return { kind: "static", text: value };
  const [, prefix, digits, suffix] = match;
  // Skip non-countable patterns like 24×7
  if (suffix.includes("×") || suffix.includes("x") || prefix.includes("×")) {
    return { kind: "static", text: value };
  }
  return {
    kind: "count",
    prefix,
    target: Number(digits),
    suffix,
  };
}

function AnimatedStat({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px", amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [entered, setEntered] = useState(!!reduceMotion);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    setEntered(true);

    const parsed = parseStatValue(value);
    if (reduceMotion || parsed.kind !== "count") {
      setDisplay(value);
      return;
    }

    setDisplay(`${parsed.prefix}0${parsed.suffix}`);
    const target = parsed.target;
    const duration = 1100;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(target * eased);
      setDisplay(`${parsed.prefix}${current}${parsed.suffix}`);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value]);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative px-3 py-6 text-center transition-transform duration-500 ease-out sm:px-5 sm:py-8 lg:py-9",
        entered ? "translate-y-0" : "translate-y-3",
      )}
      style={{
        transitionDelay: reduceMotion ? "0ms" : `${index * 80}ms`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#C8E84A]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:inset-x-8"
      />
      <p
        className="font-heading text-[1.65rem] font-light tracking-tight text-white sm:text-3xl lg:text-4xl"
        aria-label={value}
      >
        <span className="bg-gradient-to-b from-[#eef5d4] via-[#D4E88A] to-[#C8E84A] bg-clip-text text-transparent">
          {display}
        </span>
      </p>
      <p className="mt-2 text-[10px] font-medium tracking-[0.22em] text-white/60 uppercase sm:mt-2.5 sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

function PrinciplesStandard() {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <div className="mt-12 border-t border-primary/15 pt-10 sm:mt-16 sm:pt-14 lg:mt-20">
      <div
        ref={headerRef}
        className={cn(
          "transition-transform duration-500 ease-out",
          headerInView || reduceMotion ? "translate-y-0" : "translate-y-3",
        )}
      >
        <p className="text-[0.65rem] font-semibold tracking-[0.28em] uppercase text-[#6B7344]">
          The standard
        </p>
        <div className="mt-2.5 h-px w-12 bg-gradient-to-r from-secondary via-primary to-transparent" />
        <h3
          className="mt-3 font-heading text-xl font-light tracking-tight sm:text-2xl bw-title"
        >
          What every journey is measured against
        </h3>
      </div>

      <ol className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 lg:gap-5">
        {landingWelcomeDetails.map((detail, index) => (
          <motion.li
            key={detail.label}
            initial={reduceMotion ? false : { y: 18 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-40px", amount: 0.35 }}
            transition={{
              ...transitions.reveal,
              delay: reduceMotion ? 0 : index * 0.1,
            }}
            whileHover={
              reduceMotion
                ? undefined
                : { y: -4, transition: transitions.hover }
            }
            className="group relative list-none overflow-hidden rounded-xl border border-primary/12 bg-white px-5 py-6 shadow-[0_14px_36px_-28px_rgba(184,217,38,0.4)] transition-[border-color,box-shadow] duration-300 hover:border-primary/25 hover:shadow-[0_22px_44px_-24px_rgba(184,217,38,0.45)] sm:rounded-2xl sm:px-6 sm:py-8"
          >
            {/* Soft hover wash */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffffff] via-transparent to-[#eef5d4] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            {/* Top accent line */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-transparent transition-transform duration-300 ease-out group-hover:scale-x-100"
            />

            <span
              className="relative font-heading text-xs font-medium tracking-[0.22em] text-secondary transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <p
              className="relative mt-3 font-heading text-lg font-medium tracking-tight text-[#38471B] transition-colors duration-300 group-hover:text-[#283614] sm:text-xl"
            >
              {detail.label}
            </p>

            <p className="relative mt-2 text-[13px] font-light leading-relaxed text-[#4a5228] sm:text-sm">
              {detail.description}
            </p>

            <span
              aria-hidden
              className="relative mt-5 block h-px w-8 origin-left bg-gradient-to-r from-secondary to-primary transition-all duration-300 group-hover:w-16"
            />
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

interface LandingWelcomeSectionProps {
  onBookNow?: () => void;
}

/**
 * Editorial brand story — distinct from the Services catalog.
 * Soft band + collage + numbered principles (no photo-service cards).
 */
export function LandingWelcomeSection({ onBookNow }: LandingWelcomeSectionProps) {
  const gallery = landingWelcomeGallery;

  return (
    <section
      id="welcome"
      className="relative scroll-mt-24 overflow-hidden bw-section-glow px-4 py-12 sm:px-5 md:px-6 lg:px-8 sm:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[90rem]">
        {/* Stats ribbon — dark luxury, animated, responsive */}
        <div className="relative overflow-hidden rounded-xl border border-[#C8E84A]/20 bg-[#38471B] shadow-[0_28px_56px_-28px_rgba(32,42,16,0.65)] sm:rounded-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bw-accent-shimmer opacity-80"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_0%,rgba(200,232,74,0.22),transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_100%,rgba(184,217,38,0.28),transparent_50%)]"
          />

          <div className="relative grid grid-cols-2 lg:grid-cols-4">
            {landingStats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "relative",
                  index % 2 === 1 && "border-l border-white/10",
                  index >= 2 && "border-t border-white/10 lg:border-t-0",
                  index > 0 && "lg:border-l lg:border-white/10",
                )}
              >
                <AnimatedStat
                  value={stat.value}
                  label={stat.label}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Editorial split */}
        <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:mt-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <AnimateIn>
            <p className="text-[0.65rem] font-semibold tracking-[0.28em] uppercase text-[#6B7344]">
              Our story
            </p>
            <div className="mt-3 h-px w-14 bg-gradient-to-r from-secondary via-primary to-transparent" />
            <h2
              className="mt-4 font-heading text-[1.55rem] font-light leading-[1.2] tracking-tight sm:text-4xl lg:text-[2.45rem] bw-title"
            >
              Travel that feels composed — from the first tap to the final drop.
            </h2>
            <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-[#4a5228] sm:mt-6 sm:text-lg">
              Bull Wave Rides is built for riders who want calm confidence: premium
              matching, polished vehicles, and emergency SOS when seconds matter.
            </p>
            <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[#4a5228]/90 sm:text-base">
              Across the city or across an urgent moment — every trip is designed to
              feel quiet, punctual, and entirely yours.
            </p>
            {onBookNow ? (
              <div className="mt-8">
                <GlowButton onClick={onBookNow}>
                  Book a ride
                  <span aria-hidden>→</span>
                </GlowButton>
              </div>
            ) : null}
          </AnimateIn>

          {/* Asymmetric photo collage — brand atmosphere, not a service menu */}
          <Stagger className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {gallery.map((slide, index) => {
              const isFirst = index === 0;
              const isOddLast =
                index === gallery.length - 1 && gallery.length % 2 === 1;

              return (
                <StaggerItem
                  key={slide.src}
                  index={index}
                  className={cn(
                    isFirst && "sm:col-span-2",
                    isOddLast && "col-span-2 sm:col-span-1",
                  )}
                >
                  <figure
                    className={cn(
                      "group relative aspect-[3/4] h-full overflow-hidden rounded-xl sm:aspect-[4/3] sm:rounded-2xl",
                      welcomePanelBg[slide.panel],
                      isFirst && "sm:aspect-[16/10]",
                      isOddLast && "aspect-[16/10] sm:aspect-[4/3]",
                    )}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      quality={90}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 45vw"
                      className={cn(
                        "select-none",
                        BRAND_PHOTO_CLASS,
                        "transition-transform duration-700 group-hover:scale-[1.03]",
                      )}
                    />
                    <BrandImageOverlay variant="card" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/10" />
                  </figure>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        {/* Numbered principles — animated, professional */}
        <PrinciplesStandard />
      </div>
    </section>
  );
}
