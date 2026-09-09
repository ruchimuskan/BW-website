"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { landingPremiumGallery } from "@/constants/services";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

const items = landingPremiumGallery;
const AUTO_MS = 4500;
const TOTAL = items.length;
const PANEL_ID = "visual-journey-panel";

function gallerySrcChain(src: string, fallback?: string): string[] {
  const png = src.replace(/\.webp$/i, ".png");
  return [...new Set([src, png, fallback].filter(Boolean))] as string[];
}

function GalleryStill({
  src,
  fallback,
  alt,
  className,
  style,
  priority,
  sizes,
  width,
  height,
}: {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes: string;
  width: number;
  height: number;
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
      width={width}
      height={height}
      className={className}
      style={style}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      sizes={sizes}
      onError={() => {
        setIndex((i) => (i < chain.length - 1 ? i + 1 : i));
      }}
    />
  );
}

function slideTabId(label: string) {
  return `visual-journey-tab-${label.toLowerCase()}`;
}

/**
 * Contained, semantic visual journey — photograph sized to the page, not the viewport.
 */
export function LandingPremiumGallery() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.18 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const next = items[(active + 1) % TOTAL];
    if (!next) return;
    const img = new window.Image();
    img.decoding = "async";
    img.src = next.src;
  }, [active]);

  useEffect(() => {
    const onVisibility = () => {
      setPageVisible(document.visibilityState === "visible");
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const goTo = useCallback((index: number) => {
    setActive(((index % TOTAL) + TOTAL) % TOTAL);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      goTo(activeRef.current + dir);
    },
    [goTo],
  );

  const focusStep = (index: number) => {
    const next = ((index % TOTAL) + TOTAL) % TOTAL;
    goTo(next);
    requestAnimationFrame(() => {
      document.getElementById(slideTabId(items[next].label))?.focus();
    });
  };

  useEffect(() => {
    if (inView) setHasEntered(true);
  }, [inView]);

  useEffect(() => {
    if (!inView || paused || !pageVisible || TOTAL < 2) {
      return;
    }
    setProgressKey((k) => k + 1);
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % TOTAL);
    }, AUTO_MS);
    return () => window.clearTimeout(timer);
  }, [inView, paused, pageVisible, active]);

  const onTabListKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusStep(activeRef.current + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusStep(activeRef.current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusStep(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusStep(TOTAL - 1);
    }
  };

  const onDragStart = () => {
    setPaused(true);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setPaused(false);
    if (info.offset.x < -36 || info.velocity.x < -280) go(1);
    else if (info.offset.x > 36 || info.velocity.x > 280) go(-1);
  };

  const current = items[active] ?? items[0];
  const autoplayActive = Boolean(inView && !paused && pageVisible && TOTAL > 1);

  return (
    <section
      ref={sectionRef}
      id="visual-journey"
      aria-labelledby="visual-journey-title"
      className={cn("relative overflow-x-clip bg-white", LANDING_SECTION_PY)}
    >
      <div className={landingShell("relative z-10")}>
        <motion.div
          className="flex items-end justify-between gap-6"
          initial={reduceMotion ? false : { y: 14, opacity: 0.96 }}
          animate={hasEntered ? { y: 0, opacity: 1 } : undefined}
          transition={transitions.reveal}
        >
          <SectionHeading
            titleId="visual-journey-title"
            eyebrow="Visual journey"
            title="From book to support"
            description="Book, track, ride, pay, rate, and get help — plus parcel and SOS when you need them."
            className="max-w-xl"
          />
          <p
            aria-hidden
            className="hidden font-heading text-5xl font-semibold leading-none tracking-tight text-[#111411]/10 sm:block lg:text-6xl"
          >
            {String(active + 1).padStart(2, "0")}
          </p>
        </motion.div>

        <nav className="mt-6 sm:mt-7" aria-label="Journey steps">
          <ol
            role="tablist"
            aria-orientation="horizontal"
            className="grid grid-cols-4 gap-x-0 gap-y-1 sm:grid-cols-8 sm:gap-0"
            onKeyDown={onTabListKeyDown}
          >
            {items.map((slide, i) => {
              const isActive = i === active;
              return (
                <li key={slide.label} role="presentation" className="min-w-0">
                  <button
                    type="button"
                    role="tab"
                    id={slideTabId(slide.label)}
                    aria-selected={isActive}
                    aria-controls={PANEL_ID}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => goTo(i)}
                    className={cn(
                      "relative w-full px-1 py-1.5 text-center text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E31A]/60 sm:px-2 sm:text-[11px] sm:tracking-[0.16em] md:text-xs",
                      isActive
                        ? "text-[#111411]"
                        : "text-[#8a9184] hover:text-[#111411]",
                    )}
                  >
                    {slide.label}
                    {isActive ? (
                      <span
                        key={progressKey}
                        className="absolute inset-x-2 bottom-0 h-[2px] bg-[#C6E31A] sm:inset-x-2.5"
                        style={
                          autoplayActive
                            ? {
                                animation: `bw-gallery-progress ${AUTO_MS}ms linear forwards`,
                              }
                            : { width: "calc(100% - 1.25rem)" }
                        }
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute inset-x-2.5 bottom-0 h-px bg-[#e4e8da]"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <figure className="mt-5 sm:mt-6">
          <div className="flex justify-center">
            <motion.div
              id={PANEL_ID}
              role="tabpanel"
              aria-labelledby={slideTabId(current.label)}
              aria-roledescription="carousel"
              aria-label={`${current.label}, ${active + 1} of ${TOTAL}`}
              aria-live="polite"
              className="relative mx-auto aspect-[3/2] w-full max-w-[45rem] overflow-hidden bg-[#eef2e0]"
              drag={reduceMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.05}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 40 }}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.src}
                  className="absolute inset-0"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.12 : 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <GalleryStill
                    src={current.src}
                    fallback={current.fallback}
                    alt={current.alt}
                    priority
                    width={1536}
                    height={1024}
                    sizes="(max-width: 639px) 94vw, min(720px, 70vw)"
                    className="absolute inset-0 h-full w-full select-none object-contain object-center"
                  />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                aria-label="Previous still"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => go(-1)}
                className="absolute top-1/2 left-2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#111411] transition hover:bg-[#C6E31A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E31A] sm:left-3 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                type="button"
                aria-label="Next still"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => go(1)}
                className="absolute top-1/2 right-2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#C6E31A] text-[#111411] transition hover:bg-[#d4f04a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111411]/30 sm:right-3 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </motion.div>
          </div>

          <figcaption className="mt-3 flex flex-col gap-1 sm:mt-3.5 sm:flex-row sm:items-baseline sm:gap-3">
            <span className="font-heading text-[11px] font-semibold tracking-[0.2em] text-[#5A6158] uppercase sm:text-xs">
              {String(active + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
              <span className="ml-2 text-[#111411]">{current.label}</span>
            </span>
            <span className="hidden h-3 w-px bg-[#d5dcc0] sm:block" aria-hidden />
            <span className="font-heading text-[15px] font-semibold leading-snug tracking-tight text-[#111411] sm:text-lg">
              {current.line}
            </span>
          </figcaption>
        </figure>

        <nav className="mt-4 sm:mt-5" aria-label="Journey stills">
          <ol className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-2.5">
            {items.map((slide, i) => {
              const isActive = i === active;
              return (
                <li key={slide.label}>
                  <button
                    type="button"
                    aria-label={`Show ${slide.label}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => goTo(i)}
                    className="group flex w-full flex-col gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E31A]/60"
                  >
                    <span
                      className={cn(
                        "relative block aspect-[3/2] w-full overflow-hidden bg-[#eef2e0]",
                        isActive
                          ? "ring-2 ring-[#C6E31A] ring-offset-2 ring-offset-white"
                          : "opacity-55 transition-opacity group-hover:opacity-90",
                      )}
                    >
                      <GalleryStill
                        src={slide.src}
                        fallback={slide.fallback}
                        alt=""
                        width={240}
                        height={160}
                        sizes="(max-width: 639px) 22vw, 12vw"
                        className="h-full w-full object-contain object-center"
                      />
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-semibold tracking-[0.14em] uppercase sm:text-[10px]",
                        isActive ? "text-[#111411]" : "text-[#8a9184]",
                      )}
                    >
                      {slide.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}
