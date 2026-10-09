"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { landingPremiumGallery } from "@/constants/services";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

const items = landingPremiumGallery;
const TOTAL = items.length;
const AUTO_MS = 4000;

function gallerySrcChain(src: string, fallback?: string): string[] {
  const png = src.replace(/\.webp$/i, ".png");
  return [...new Set([src, png, fallback].filter(Boolean))] as string[];
}

function GalleryStill({
  src,
  fallback,
  alt,
  className,
  priority,
  sizes,
}: {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
}) {
  const chain = useMemo(() => gallerySrcChain(src, fallback), [src, fallback]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const current = chain[Math.min(index, chain.length - 1)] ?? src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      sizes={sizes}
      onError={() => setIndex((i) => (i < chain.length - 1 ? i + 1 : i))}
    />
  );
}

type LabelSide = "top" | "bottom" | "left" | "right";

const PATH_NODES: { x: number; y: number; label: LabelSide }[] = [
  { x: 78, y: 210, label: "left" },
  { x: 205, y: 118, label: "top" },
  { x: 345, y: 72, label: "top" },
  { x: 485, y: 188, label: "bottom" },
  { x: 615, y: 248, label: "bottom" },
  { x: 745, y: 122, label: "top" },
  { x: 870, y: 64, label: "top" },
  { x: 965, y: 168, label: "right" },
];

const ROAD_D =
  "M78 210 C 130 210 145 118 205 118 C 270 118 286 72 345 72 C 420 72 430 188 485 188 C 550 188 565 248 615 248 C 680 248 690 122 745 122 C 810 122 820 64 870 64 C 920 64 935 168 965 168";

const LABEL_CLASS: Record<LabelSide, string> = {
  top: "bottom-full left-1/2 mb-1.5 -translate-x-1/2 text-center sm:mb-2",
  bottom: "top-full left-1/2 mt-1.5 -translate-x-1/2 text-center sm:mt-2",
  left: "right-full top-1/2 mr-1.5 -translate-y-1/2 text-right sm:mr-2.5",
  right: "left-full top-1/2 ml-1.5 -translate-y-1/2 text-left sm:ml-2.5",
};

/**
 * Winding lime journey — Book → Support. Same path + photo on every breakpoint;
 * auto-advances every AUTO_MS.
 */
export function LandingPremiumGallery() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.2 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const onVisibility = () =>
      setPageVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const goTo = useCallback((index: number) => {
    setActive(((index % TOTAL) + TOTAL) % TOTAL);
  }, []);

  useEffect(() => {
    if (!inView || paused || !pageVisible || TOTAL < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % TOTAL);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [inView, paused, pageVisible]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      goTo(activeRef.current + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      goTo(activeRef.current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(TOTAL - 1);
    }
  };

  const current = items[active] ?? items[0];
  const runProgress = inView && !paused && pageVisible && !reduceMotion;

  return (
    <section
      ref={sectionRef}
      id="visual-journey"
      aria-labelledby="visual-journey-title"
      className={cn("relative overflow-x-clip bg-[#f7f8f3]", LANDING_SECTION_PY)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_0%,rgba(198,227,26,0.18),transparent_58%)]"
      />

      <div className={landingShell("relative z-10")}>
        <motion.header
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { y: 16, opacity: 0.96 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={transitions.reveal}
        >
          <p className="text-[10px] font-semibold tracking-[0.26em] uppercase text-[#5a7a12] sm:text-xs">
            Visual journey
          </p>
          <h2
            id="visual-journey-title"
            className="mt-3 font-heading text-[#111411]"
          >
            <span className="block text-[1.05rem] font-bold tracking-[0.12em] sm:text-xl">
              FROM BOOK TO
            </span>
            <span className="mt-2 inline-flex rounded-full bg-[#C6E31A] px-6 py-1.5 text-lg font-extrabold tracking-[0.14em] sm:px-8 sm:text-2xl">
              SUPPORT
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[13px] leading-relaxed text-[#5a6330] sm:mt-4 sm:text-[15px]">
            Book, track, ride, pay, rate, and get help — plus parcel and SOS
            when you need them.
          </p>
        </motion.header>

        <div className="mt-6 grid items-center gap-5 sm:mt-8 sm:gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:gap-10 xl:gap-12">
          <div
            className="relative px-7 pt-8 pb-10 sm:px-10 sm:pt-8 sm:pb-12 lg:px-8 lg:pt-10 lg:pb-14"
            role="tablist"
            aria-label="Journey steps"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <svg
              viewBox="0 0 1000 300"
              className="pointer-events-none h-auto w-full"
              aria-hidden
            >
              <path
                d={ROAD_D}
                fill="none"
                stroke="#d8e48c"
                strokeWidth="36"
                strokeLinecap="round"
              />
              <path
                d={ROAD_D}
                fill="none"
                stroke="#C6E31A"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d={ROAD_D}
                fill="none"
                stroke="#111411"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray="9 13"
                opacity="0.2"
              />
            </svg>

            {items.map((slide, i) => {
              const node = PATH_NODES[i];
              if (!node) return null;
              const selected = i === active;

              return (
                <button
                  key={slide.label}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`${slide.label}: ${slide.line}`}
                  onClick={() => goTo(i)}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
                  style={{
                    left: `${(node.x / 1000) * 100}%`,
                    top: `${(node.y / 300) * 100}%`,
                  }}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-full border-[2.5px] font-heading font-extrabold tabular-nums shadow-[0_10px_20px_-10px_rgba(17,20,17,0.45)] transition-all duration-300 sm:border-[3px]",
                      selected
                        ? "h-8 w-8 scale-110 border-[#111411] bg-[#C6E31A] text-[11px] text-[#111411] sm:h-12 sm:w-12 sm:text-[15px] lg:h-16 lg:w-16 lg:text-lg"
                        : "h-6 w-6 border-[#C6E31A] bg-[#111411] text-[9px] text-[#C6E31A] hover:bg-[#1A1F16] sm:h-10 sm:w-10 sm:text-[13px] lg:h-[46px] lg:w-[46px]",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "pointer-events-none absolute font-heading font-bold",
                      selected
                        ? "text-[10px] text-[#111411] sm:text-[12px] lg:text-[13px]"
                        : "hidden text-[#3a4030] sm:block sm:text-[12px] lg:text-[13px]",
                      LABEL_CLASS[node.label],
                    )}
                  >
                    <span className="mr-0.5 hidden h-0 w-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-[#C6E31A] align-middle sm:mr-1 sm:inline-block" />
                    {slide.label}
                  </span>
                </button>
              );
            })}
          </div>

          <figure
            className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="overflow-hidden rounded-2xl border border-[#e4e9d8] bg-white shadow-[0_24px_48px_-28px_rgba(17,20,17,0.4)] sm:rounded-[1.35rem]">
              <div className="relative aspect-[16/10] w-full bg-[#eef2e0] sm:aspect-[16/11]">
                <GalleryStill
                  src={current.src}
                  fallback={current.fallback}
                  alt={current.alt}
                  priority
                  sizes="(max-width: 1023px) 94vw, 40vw"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111411]/85 via-[#111411]/35 to-transparent p-3 sm:p-4">
                  <p className="font-heading text-[10px] font-semibold tracking-[0.2em] text-[#C6E31A] uppercase sm:text-[11px]">
                    {String(active + 1).padStart(2, "0")} · {current.label}
                  </p>
                  <p className="mt-0.5 font-heading text-[13px] font-semibold leading-snug text-white sm:text-base">
                    {current.line}
                  </p>
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 h-[3px] bg-[#111411]/25"
                  aria-hidden
                >
                  <motion.span
                    key={`${active}-${runProgress ? "run" : "pause"}`}
                    className="block h-full bg-[#C6E31A]"
                    initial={{ width: "0%" }}
                    animate={{ width: runProgress ? "100%" : "0%" }}
                    transition={
                      runProgress
                        ? { duration: AUTO_MS / 1000, ease: "linear" }
                        : { duration: 0.2 }
                    }
                  />
                </div>
              </div>
            </div>

            <div
              className="mt-3 flex justify-center gap-1.5 sm:mt-4"
              role="presentation"
            >
              {items.map((slide, i) => (
                <button
                  key={`dot-${slide.label}`}
                  type="button"
                  aria-label={`Show ${slide.label}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === active
                      ? "w-6 bg-[#C6E31A]"
                      : "w-1.5 bg-[#c5d0a8] hover:bg-[#9BB820]",
                  )}
                />
              ))}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
