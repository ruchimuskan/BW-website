"use client";

import {
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
} from "react";
import { landingPremiumGallery } from "@/constants/services";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

const items = landingPremiumGallery;
const AUTO_MS = 3800;
const TOTAL = items.length;
const SNAP_MS = 0.18;

function circularOffset(index: number, active: number, length: number) {
  let offset = index - active;
  const half = length / 2;
  if (offset > half) offset -= length;
  if (offset <= -half) offset += length;
  return offset;
}

function galleryNum(src: string): string | null {
  return src.split("/").pop()?.match(/track(\d+)/i)?.[1] ?? null;
}

function gallerySrcChain(src: string): string[] {
  const num = galleryNum(src);
  if (!num) {
    const png = src.replace(/\.webp(\?.*)?$/i, ".png$1");
    const webp = png.replace(/\.png(\?.*)?$/i, ".webp$1");
    return [...new Set([src, webp, png].filter(Boolean))];
  }
  return [
    `/images/gallery/track${num}-sm.webp`,
    `/images/gallery/track${num}.webp`,
    `/images/gallery/track${num}.png`,
    `/images/track${num}.png`,
    `/images/track${num}.webp`,
  ];
}

function GallerySlideImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const chain = useMemo(() => gallerySrcChain(src), [src]);
  const [index, setIndex] = useState(0);
  const num = galleryNum(src);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const current = chain[Math.min(index, chain.length - 1)] ?? src;
  const srcSet = num
    ? [
        `/images/gallery/track${num}-sm.webp 960w`,
        `/images/gallery/track${num}.webp 1260w`,
      ].join(", ")
    : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      srcSet={index === 0 ? srcSet : undefined}
      alt={alt}
      width={1260}
      height={978}
      className={className}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      sizes="(max-width: 767px) 88vw, 460px"
      onError={() => {
        setIndex((i) => (i < chain.length - 1 ? i + 1 : i));
      }}
    />
  );
}

/**
 * Overlapping cover-flow — compact, sharp assets, snappy touch.
 * Side cards use left/right inset (no translate -50%) so photos stay crisp.
 */
export function LandingPremiumGallery() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.2 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [compact, setCompact] = useState(true);
  const [progressKey, setProgressKey] = useState(0);

  const activeRef = useRef(active);
  activeRef.current = active;

  const pauseReasons = useRef({
    hover: false,
    focus: false,
    drag: false,
  });

  const syncPaused = useCallback(() => {
    const { hover, focus, drag } = pauseReasons.current;
    setPaused(hover || focus || drag);
  }, []);

  useEffect(() => {
    // Warm every slide for instant swipe.
    for (const slide of items) {
      const href = gallerySrcChain(slide.src)[0];
      if (!href) continue;
      const img = new window.Image();
      img.decoding = "async";
      img.src = href;
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  useEffect(() => {
    if (inView) setHasEntered(true);
  }, [inView]);

  useEffect(() => {
    if (!hasEntered || !inView || reduceMotion || paused || !pageVisible) {
      return;
    }
    setProgressKey((k) => k + 1);
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % TOTAL);
    }, AUTO_MS);
    return () => window.clearTimeout(timer);
  }, [hasEntered, inView, reduceMotion, paused, pageVisible, active]);

  const onDragStart = () => {
    pauseReasons.current.drag = true;
    setDragging(true);
    syncPaused();
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    pauseReasons.current.drag = false;
    setDragging(false);
    syncPaused();
    // Fast touch thresholds
    if (info.offset.x < -28 || info.velocity.x < -280) go(1);
    else if (info.offset.x > 28 || info.velocity.x > 280) go(-1);
  };

  const slots = useMemo(() => {
    return items
      .map((item, i) => {
        const offset = circularOffset(i, active, TOTAL);
        const abs = Math.abs(offset);
        if (compact && offset !== 0) return null;
        if (!compact && abs > 1) return null;
        return { item, i, offset };
      })
      .filter(
        (s): s is { item: (typeof items)[number]; i: number; offset: number } =>
          Boolean(s),
      );
  }, [active, compact]);

  const autoplayActive =
    hasEntered && inView && !reduceMotion && !paused && pageVisible;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip bw-section-band border-y border-primary/10 py-8 sm:py-12 lg:py-14"
      aria-label="Visual journey gallery"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_80%,rgba(200,232,74,0.1),transparent_60%)]"
      />

      <div className={landingShell("relative z-10")}>
        <motion.div
          className="mx-auto max-w-xl text-center"
          initial={reduceMotion ? false : { y: 12 }}
          animate={hasEntered ? { y: 0 } : undefined}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#5A7A5E] sm:text-xs">
            Visual journey
          </p>
          <h2 className="mt-2 font-heading text-[1.35rem] font-semibold tracking-tight text-[#1B3A22] sm:text-2xl md:text-3xl">
            From book to support
          </h2>
          <p className="mt-2 text-[13px] font-light text-[#5A6158] sm:text-sm">
            Book, track, ride, pay, rate, and get help — every step designed for
            a calm BW Rides trip.
          </p>
        </motion.div>

        <div
          className="mx-auto mt-5 flex w-full max-w-xs items-center gap-1.5 sm:mt-6 sm:max-w-sm"
          role="tablist"
          aria-label="Gallery slides"
        >
          {items.map((slide, i) => {
            const isActive = i === active;
            return (
              <button
                key={slide.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show ${slide.label}`}
                onClick={() => goTo(i)}
                className={cn(
                  "relative h-1 flex-1 overflow-hidden rounded-full transition-colors",
                  isActive ? "bg-primary/25" : "bg-primary/15 hover:bg-primary/30",
                )}
              >
                {isActive ? (
                  <span
                    key={progressKey}
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full bg-primary",
                      autoplayActive ? "origin-left" : "w-full",
                    )}
                    style={
                      autoplayActive
                        ? {
                            animation: `bw-gallery-progress ${AUTO_MS}ms linear forwards`,
                          }
                        : undefined
                    }
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div
          className="relative mx-auto mt-5 w-full max-w-[840px] sm:mt-7"
          onMouseEnter={() => {
            pauseReasons.current.hover = true;
            syncPaused();
          }}
          onMouseLeave={() => {
            pauseReasons.current.hover = false;
            syncPaused();
          }}
          onFocusCapture={() => {
            pauseReasons.current.focus = true;
            syncPaused();
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              pauseReasons.current.focus = false;
              syncPaused();
            }
          }}
        >
          <div
            className={cn(
              compact
                ? "mx-auto max-w-[420px]"
                : "flex items-center gap-3 md:gap-4 lg:gap-5",
            )}
          >
            {/* Large screens: arrows sit outside the image stack */}
            {!compact ? (
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(-1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-md transition active:scale-95 hover:bg-primary hover:text-white md:h-11 md:w-11"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            ) : null}

            <motion.div
              className={cn(
                "relative min-w-0 touch-pan-y select-none",
                compact
                  ? "w-full overflow-hidden"
                  : "h-[280px] flex-1 overflow-visible md:h-[300px] lg:h-[320px]",
              )}
              drag={reduceMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.06}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 40 }}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              aria-roledescription="carousel"
              aria-label={`${items[active].label}, ${active + 1} of ${TOTAL}`}
              aria-live="polite"
            >
              {slots.map(({ item, i, offset }) => {
                const isFront = offset === 0;
                const isLeft = offset < 0;

                return (
                  <motion.button
                    key={item.label}
                    type="button"
                    tabIndex={isFront ? 0 : -1}
                    aria-label={
                      isFront
                        ? `${item.label} — current`
                        : `Show ${item.label}`
                    }
                    aria-current={isFront ? "true" : undefined}
                    onClick={() => {
                      if (!isFront) goTo(i);
                    }}
                    className={cn(
                      "overflow-hidden border bg-[#EEF4E8] text-left",
                      compact
                        ? "relative flex w-full flex-col rounded-2xl"
                        : cn(
                            "absolute top-[6%] bottom-[6%] rounded-[1.15rem]",
                            isFront
                              ? "left-0 right-0 z-40 mx-auto w-[min(68%,440px)]"
                              : cn(
                                  "z-20 w-[44%] max-w-[300px]",
                                  isLeft ? "left-0" : "right-0",
                                ),
                          ),
                      isFront
                        ? cn(
                            "border-[#C6E31A]/50 shadow-[0_18px_40px_-16px_rgba(27,58,34,0.34)]",
                            dragging ? "cursor-grabbing" : "cursor-grab",
                          )
                        : "cursor-pointer border-[#D4D8D0]/80 shadow-[0_12px_28px_-14px_rgba(27,58,34,0.28)]",
                      dragging && !isFront && "pointer-events-none",
                    )}
                    initial={false}
                    animate={{
                      opacity: isFront ? 1 : 0.78,
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0.12 }
                        : {
                            type: "tween",
                            duration: SNAP_MS,
                            ease: [0.25, 1, 0.5, 1],
                          }
                    }
                  >
                    <div
                      className={cn(
                        "relative w-full overflow-hidden bg-[#E8ECE4]",
                        compact ? "aspect-[630/440]" : "absolute inset-0",
                      )}
                    >
                      <GallerySlideImage
                        src={item.src}
                        alt={item.alt}
                        priority={isFront || Math.abs(offset) <= 1}
                        className="absolute inset-0 h-full w-full select-none object-cover object-center"
                      />
                    </div>
                    {isFront ? (
                      <div
                        className={cn(
                          "border-t border-[#D5E0C8] bg-[#E7F0D8] px-3.5 py-2",
                          !compact && "absolute inset-x-0 bottom-0",
                        )}
                      >
                        <p className="font-heading text-[12px] font-semibold tracking-[0.14em] uppercase text-[#1B3A22] sm:text-[13px]">
                          {String(active + 1).padStart(2, "0")} /{" "}
                          {String(TOTAL).padStart(2, "0")}
                          <span className="ml-2 tracking-[0.18em]">
                            {item.label}
                          </span>
                        </p>
                      </div>
                    ) : null}
                  </motion.button>
                );
              })}
            </motion.div>

            {!compact ? (
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-md transition active:scale-95 hover:bg-primary hover:text-white md:h-11 md:w-11"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            ) : null}
          </div>

          {/* Mobile: arrows below the card (outside the image) */}
          {compact ? (
            <div className="mt-3 flex items-center justify-between px-0.5">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-md transition active:scale-95 hover:bg-primary hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-md transition active:scale-95 hover:bg-primary hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
