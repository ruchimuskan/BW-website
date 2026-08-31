"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, MapPin, Tag, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimateIn } from "@/components/motion";
import { PremiumSectionBackdrop } from "@/components/landing/PremiumSectionBackdrop";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useProtectedHref } from "@/hooks/useProtectedHref";
import { landingFeatures } from "@/constants/services";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

const featureMeta = [
  { icon: Zap, bar: "bg-[#C6E31A]" },
  { icon: Tag, bar: "bg-[#111411]" },
  { icon: MapPin, bar: "bg-[#5A6158]" },
] as const;

const AUTO_MS = 6000;

const FEATURE_POSITION: Record<string, string> = {
  /** Anchor top — keeps QUICK FARE / BEST FARE headlines visible. */
  "Quick Pickup": "center top",
  "Best Fares": "center top",
  "Never Too Far": "center 28%",
};

function featureSrcChain(src: string, title: string): string[] {
  if (title === "Best Fares" || src.includes("best-fare") || src.includes("pic-7")) {
    return [
      "/images/pic-best-fare.webp?v=align3",
      "/images/features/best-fare.webp?v=align3",
      "/images/pic-best-fare.png?v=align3",
      "/images/features/best-fare.png?v=align3",
    ];
  }
  if (title === "Quick Pickup" || src.includes("pic-8") || src.includes("quick")) {
    return [
      "/images/pic-8.webp?v=align3",
      "/images/features/quick-pickup.webp?v=align3",
      "/images/pic-8.png?v=align3",
      "/images/features/quick-pickup.png?v=align3",
    ];
  }
  if (title === "Never Too Far" || src.includes("pic-9") || src.includes("never")) {
    return [
      "/images/pic-9.webp?v=align3",
      "/images/features/never-too-far.webp?v=align3",
      "/images/pic-9.png?v=align3",
      "/images/features/never-too-far.png?v=align3",
    ];
  }
  const png = src.replace(/\.webp(\?.*)?$/i, ".png$1");
  const webp = png.replace(/\.png(\?.*)?$/i, ".webp$1");
  return [...new Set([src, webp, png].filter(Boolean))];
}

function FeatureCoverPanel({
  src,
  title,
  alt,
  visible,
  priority,
}: {
  src: string;
  title: string;
  alt: string;
  visible: boolean;
  priority?: boolean;
}) {
  const chain = useMemo(() => featureSrcChain(src, title), [src, title]);
  const [, setIndex] = useState(0);
  const [bgUrl, setBgUrl] = useState(chain[0]);

  useEffect(() => {
    setIndex(0);
    setBgUrl(chain[0]);
  }, [src, title, chain]);

  useEffect(() => {
    if (!priority || !visible) return;
    const href = chain[0];
    if (!href) return;
    const img = new window.Image();
    img.decoding = "async";
    img.src = href;
  }, [chain, priority, visible]);

  const position = FEATURE_POSITION[title] ?? "center";

  return (
    <div
      className={cn(
        "absolute inset-0 bg-[#1a1f16] transition-opacity duration-500",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{
        backgroundImage: `url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: position,
        backgroundRepeat: "no-repeat",
      }}
      role="img"
      aria-label={visible ? alt : undefined}
      aria-hidden={!visible}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgUrl}
        alt=""
        aria-hidden
        className="hidden"
        onError={() => {
          setIndex((i) => {
            const next = i < chain.length - 1 ? i + 1 : i;
            if (chain[next]) setBgUrl(chain[next]);
            return next;
          });
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111411]/20 via-transparent to-transparent"
      />
    </div>
  );
}

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

  useEffect(() => {
    for (const item of landingFeatures) {
      const href = featureSrcChain(item.image, item.title)[0];
      if (!href) continue;
      const img = new window.Image();
      img.decoding = "async";
      img.src = href;
    }
  }, []);

  const feature = landingFeatures[active];

  return (
    <section
      id="why-wavego"
      className={cn("relative scroll-mt-20 overflow-hidden", LANDING_SECTION_PY)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <PremiumSectionBackdrop opacity={0.12} side="full" />

      <div className={landingShell("relative z-10 flex max-h-[calc(100dvh-5rem)] min-h-0 flex-col")}>
        <AnimateIn className="mb-4 shrink-0 sm:mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            Difference
          </p>
          <h2 className="mt-1 font-heading text-[1.35rem] font-light tracking-tight text-foreground sm:text-3xl lg:text-[2.1rem] lg:leading-tight">
            The Bull Wave Rides difference
          </h2>
          <p className="mt-1.5 max-w-xl text-[13px] font-light leading-snug text-muted-foreground sm:text-sm">
            Premium experience inspired by global standards — with a distinctly
            Indian touch.
          </p>
        </AnimateIn>

        <AnimateIn delay={0.05} className="min-h-0 flex-1">
          <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-primary/15 bg-white shadow-[0_20px_48px_-28px_rgba(184,217,38,0.32)] sm:rounded-2xl">
            {/* Mobile tabs */}
            <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-primary/10 bg-[#f8faf2] p-2.5 [-ms-overflow-style:auto] [scrollbar-width:thin] lg:hidden">
              {landingFeatures.map((item, idx) => {
                const isActive = idx === active;
                const { icon: TabIcon } = featureMeta[idx] ?? featureMeta[0];
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={cn(
                      "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold transition-all",
                      isActive
                        ? "border-primary/30 bg-primary text-primary-foreground"
                        : "border-transparent bg-white/70 text-foreground/70",
                    )}
                  >
                    <TabIcon className="h-3 w-3" />
                    {item.title}
                  </button>
                );
              })}
            </div>

            {/* Desktop: tabs | image | copy — single compact row */}
            <div className="grid min-h-0 flex-1 lg:grid-cols-[190px_minmax(0,1fr)_minmax(220px,260px)] xl:grid-cols-[200px_minmax(0,1fr)_280px]">
              {/* Tabs */}
              <div className="hidden flex-col justify-start gap-2 border-r border-primary/10 bg-[#f8faf2] p-3 lg:flex">
                {landingFeatures.map((item, idx) => {
                  const isActive = idx === active;
                  const { icon: TabIcon, bar } = featureMeta[idx] ?? featureMeta[0];
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setActive(idx)}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all duration-200",
                        isActive
                          ? "border-primary/25 bg-white shadow-sm"
                          : "border-transparent bg-white/50 hover:bg-white/90",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-2 bottom-2 left-0 w-0.5 rounded-full",
                          isActive ? bar : "bg-transparent",
                        )}
                      />
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <TabIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                          0{idx + 1}
                        </span>
                        <span
                          className={cn(
                            "block font-heading text-[13px] font-bold leading-tight",
                            isActive ? "text-foreground" : "text-foreground/70",
                          )}
                        >
                          {item.title}
                        </span>
                      </span>
                      {isActive && !reduceMotion && (
                        <motion.span
                          className="absolute inset-x-2 bottom-0 h-[2px] origin-left bg-gradient-to-r from-primary to-secondary"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Image — fixed viewport-relative height */}
              <div className="relative min-h-[190px] w-full overflow-hidden bg-[#f4f8ec] sm:min-h-[210px] lg:min-h-0 lg:h-full lg:max-h-[min(50vh,360px)]">
                {landingFeatures.map((item, idx) => (
                  <FeatureCoverPanel
                    key={item.title}
                    src={item.image}
                    title={item.title}
                    alt={item.title}
                    visible={idx === active}
                    priority={idx === 0 || idx === active}
                  />
                ))}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-[#C6E31A]/70"
                />
              </div>

              {/* Copy — beside image on desktop, below on mobile */}
              <div className="flex min-h-0 flex-col justify-between gap-3 border-t border-primary/10 p-4 lg:border-t-0 lg:border-l lg:p-4 xl:p-5">
                <div className="min-h-0 overflow-y-auto">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Feature 0{active + 1}
                  </p>
                  <h3 className="mt-0.5 font-heading text-lg font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[13px] font-medium leading-snug text-foreground">
                    {feature.desc}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {feature.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-[12px] text-foreground/85"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={2.5}
                        />
                        <span className="line-clamp-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={getStartedHref}
                  prefetch
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "h-9 w-full shrink-0 px-4 text-sm font-semibold",
                  )}
                >
                  <span className="inline-flex items-center">
                    Get started
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          </article>
        </AnimateIn>

        <div className="mt-3 flex shrink-0 justify-center gap-2 lg:hidden">
          {landingFeatures.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Feature ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === active ? "w-5 bg-primary" : "w-1.5 bg-primary/25",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
