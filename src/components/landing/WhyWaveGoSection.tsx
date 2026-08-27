"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, MapPin, Tag, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimateIn } from "@/components/motion";
import { PremiumSectionBackdrop } from "@/components/landing/PremiumSectionBackdrop";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useProtectedHref } from "@/hooks/useProtectedHref";
import { landingFeatures } from "@/constants/services";
import { cn } from "@/lib/utils";

const featureMeta = [
  { icon: Zap, bar: "bg-primary" },
  { icon: Tag, bar: "bg-secondary" },
  { icon: MapPin, bar: "bg-[#9BB820]" },
] as const;

const AUTO_MS = 6000;

export function WhyWaveGoSection() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const getStartedHref = useProtectedHref(ROUTES.home);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % landingFeatures.length);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [paused, reduceMotion]);

  const feature = landingFeatures[active];

  return (
    <section
      id="why-wavego"
      className="relative scroll-mt-20 overflow-hidden px-4 py-14 sm:px-5 md:px-6 lg:px-8 sm:py-20 lg:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <PremiumSectionBackdrop opacity={0.14} side="full" />

      <div className="relative z-10 mx-auto max-w-[90rem]">
        <AnimateIn className="mb-10 max-w-2xl lg:mb-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary sm:text-xs sm:tracking-[0.28em]">
            Difference
          </p>
          <h2 className="mt-2.5 font-heading text-[1.45rem] font-light tracking-tight text-foreground sm:mt-3 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            The Bull Wave Rides difference
          </h2>
          <p className="mt-3 text-[13px] font-light leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
            Premium experience inspired by global standards — with a distinctly Indian touch.
          </p>
        </AnimateIn>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-14">
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:auto] [scrollbar-width:thin] lg:flex-col lg:overflow-visible lg:pb-0">
            {landingFeatures.map((item, idx) => {
              const isActive = idx === active;
              const { icon: TabIcon, bar } = featureMeta[idx] ?? featureMeta[0];

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={cn(
                    "group relative flex min-w-[200px] shrink-0 items-start gap-3 rounded-xl border px-3 py-3.5 text-left transition-all duration-200 sm:min-w-[220px] sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4 lg:min-w-0 lg:w-full",
                    isActive
                      ? "border-primary/20 bg-white/90 shadow-md shadow-primary/10"
                      : "border-transparent bg-white/40 hover:border-primary/15 hover:bg-white/70",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-4 bottom-4 left-0 w-1 rounded-full transition-all duration-200",
                      isActive ? bar : "bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-10 sm:w-10",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                    )}
                  >
                    <TabIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                      0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block font-heading text-sm font-bold leading-snug sm:text-base",
                        isActive ? "text-foreground" : "text-foreground/75",
                      )}
                    >
                      {item.title}
                    </span>
                  </span>
                  {isActive && !reduceMotion && (
                    <motion.span
                      className="absolute inset-x-3 bottom-0 h-[2px] origin-left bg-gradient-to-r from-primary to-secondary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-white shadow-[0_24px_48px_-30px_rgba(184,217,38,0.4)] sm:rounded-2xl">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-white sm:aspect-[2/1]">
              {landingFeatures.map((item, idx) => {
                const near =
                  idx === active ||
                  idx === (active + 1) % landingFeatures.length ||
                  idx ===
                    (active - 1 + landingFeatures.length) % landingFeatures.length;
                if (!near) return null;
                return (
                  <div
                    key={item.title}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500",
                      idx === active ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden={idx !== active}
                  >
                    <Image
                      src={item.image}
                      alt={idx === active ? item.title : ""}
                      fill
                      quality={90}
                      className="object-contain object-center"
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      {...(idx === 0
                        ? { priority: true as const }
                        : { loading: "lazy" as const })}
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
                  Feature 0{active + 1}
                </p>
                <h3 className="mt-1 font-heading text-xl font-bold text-foreground sm:text-2xl">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-foreground sm:text-base">{feature.desc}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                  {feature.body}
                </p>
                <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-[13px] text-foreground/85 sm:text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={getStartedHref}
                prefetch
                className={cn(
                  buttonVariants(),
                  "h-11 w-full shrink-0 px-6 font-semibold sm:w-auto",
                )}
              >
                <span className="inline-flex items-center">
                  Get started
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2 lg:hidden">
          {landingFeatures.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Feature ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={cn(
                "h-2 rounded-full transition-all",
                idx === active ? "w-6 bg-primary" : "w-2 bg-primary/25",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
