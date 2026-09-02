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
import { PremiumSectionBackdrop } from "@/components/landing/PremiumSectionBackdrop";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { landingPremiumGallery } from "@/constants/services";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

const items = landingPremiumGallery;
const AUTO_MS = 3800;
const TOTAL = items.length;
const SNAP_MS = 0.22;
const STACK_MQ = "(max-width: 1023px)";

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
  style,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
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
      style={style}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      sizes="(max-width: 639px) 92vw, (max-width: 1023px) min(520px, 88vw), 480px"
      onError={() => {
        setIndex((i) => (i < chain.length - 1 ? i + 1 : i));
      }}
    />
  );
}

const navBtnClass =
  "flex shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-[0_8px_24px_-8px_rgba(27,58,34,0.28)] transition hover:bg-primary hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

/**
 * Overlapping cover-flow gallery — responsive stack on mobile/tablet, 3-card flow on desktop.
 */
export function LandingPremiumGallery() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.18 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [stacked, setStacked] = useState(true);
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
    for (const slide of items) {
      const href = gallerySrcChain(slide.src)[0];
      if (!href) continue;
      const img = new window.Image();
      img.decoding = "async";
      img.src = href;
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(STACK_MQ);
    const sync = () => setStacked(mq.matches);
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
    if (info.offset.x < -28 || info.velocity.x < -280) go(1);
    else if (info.offset.x > 28 || info.velocity.x > 280) go(-1);
  };

  const slots = useMemo(() => {
    return items
      .map((item, i) => {
        const offset = circularOffset(i, active, TOTAL);
        const abs = Math.abs(offset);
        if (stacked && offset !== 0) return null;
        if (!stacked && abs > 1) return null;
        return { item, i, offset };
      })
      .filter(
        (s): s is { item: (typeof items)[number]; i: number; offset: number } =>
          Boolean(s),
      );
  }, [active, stacked]);

  const autoplayActive =
    hasEntered && inView && !reduceMotion && !paused && pageVisible;

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative overflow-x-clip border-y border-primary/10",
        LANDING_SECTION_PY,
      )}
      aria-label="Visual journey gallery"
    >
      <PremiumSectionBackdrop side="center" opacity={0.85} showOrbs={false} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_100%,rgba(200,232,74,0.11),transparent_62%)]"
      />

      <div className={landingShell("relative z-10")}>
        <motion.div
          initial={reduceMotion ? false : { y: 14, opacity: 0.96 }}
          animate={hasEntered ? { y: 0, opacity: 1 } : undefined}
          transition={transitions.reveal}
        >
          <SectionHeading
            align="center"
            eyebrow="Visual journey"
            title="From book to support"
            description="Book, track, ride, pay, rate, and get help — every step designed for a calm BW Rides trip."
          />
        </motion.div>

        <div
          className="mx-auto mt-6 flex w-full max-w-md items-center gap-1.5 sm:mt-8 sm:max-w-lg sm:gap-2 lg:max-w-xl"
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
                  "relative h-1.5 flex-1 overflow-hidden rounded-full transition-colors sm:h-[7px]",
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
          className="relative mx-auto mt-6 w-full max-w-[min(100%,920px)] sm:mt-8"
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
              stacked
                ? "mx-auto w-full max-w-[min(100%,520px)]"
                : "flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-5",
            )}
          >
            {!stacked ? (
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(-1)}
                className={cn(navBtnClass, "h-10 w-10 md:h-11 md:w-11")}
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            ) : null}

            <motion.div
              className={cn(
                "relative min-w-0 touch-pan-y select-none",
                stacked
                  ? "w-full overflow-hidden"
                  : "h-[clamp(240px,30vw,360px)] flex-1 overflow-visible [perspective:1200px]",
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
                      "overflow-hidden border bg-[#EEF4E8] text-left will-change-transform",
                      stacked
                        ? "relative flex w-full flex-col rounded-2xl sm:rounded-[1.15rem]"
                        : cn(
                            "absolute top-[4%] bottom-[4%] rounded-[1.15rem] sm:rounded-2xl",
                            isFront
                              ? "left-0 right-0 z-40 mx-auto w-[min(72%,480px)]"
                              : cn(
                                  "z-20 w-[42%] max-w-[320px]",
                                  isLeft ? "left-0" : "right-0",
                                ),
                          ),
                      isFront
                        ? cn(
                            "border-[#C6E31A]/55 shadow-[0_22px_48px_-18px_rgba(27,58,34,0.38)]",
                            dragging ? "cursor-grabbing" : "cursor-grab",
                          )
                        : "cursor-pointer border-[#D4D8D0]/85 shadow-[0_14px_32px_-16px_rgba(27,58,34,0.3)]",
                      dragging && !isFront && "pointer-events-none",
                    )}
                    style={
                      stacked
                        ? undefined
                        : {
                            transformOrigin: isFront
                              ? "center center"
                              : isLeft
                                ? "right center"
                                : "left center",
                          }
                    }
                    initial={false}
                    animate={{
                      opacity: isFront ? 1 : 0.68,
                      scale: stacked ? 1 : isFront ? 1 : 0.84,
                      y: stacked ? 0 : isFront ? 0 : 6,
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
                        stacked
                          ? "aspect-[1260/978]"
                          : "absolute inset-0",
                      )}
                    >
                      <GallerySlideImage
                        src={item.src}
                        alt={item.alt}
                        priority={isFront || Math.abs(offset) <= 1}
                        className={cn(
                          "absolute inset-0 h-full w-full select-none",
                          item.fit === "cover" ? "object-cover" : "object-contain",
                        )}
                        style={{ objectPosition: item.position }}
                      />
                      {!stacked && !isFront ? (
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-white/10 backdrop-blur-[0.5px]"
                        />
                      ) : null}
                    </div>
                    {isFront ? (
                      <div
                        className={cn(
                          "border-t border-[#C6E31A]/35 bg-[#E7F0D8] px-3.5 py-2.5 sm:px-4 sm:py-3",
                          !stacked && "absolute inset-x-0 bottom-0",
                        )}
                      >
                        <p className="font-heading text-[11px] font-semibold tracking-[0.14em] uppercase text-[#1B3A22] sm:text-[13px]">
                          {String(active + 1).padStart(2, "0")} /{" "}
                          {String(TOTAL).padStart(2, "0")}
                          <span className="ml-2 tracking-[0.18em] text-[#2D4A32]">
                            {item.label}
                          </span>
                        </p>
                      </div>
                    ) : null}
                  </motion.button>
                );
              })}
            </motion.div>

            {!stacked ? (
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(1)}
                className={cn(navBtnClass, "h-10 w-10 md:h-11 md:w-11")}
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            ) : null}
          </div>

          {stacked ? (
            <div className="mt-4 flex items-center justify-between sm:mt-5">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(-1)}
                className={cn(navBtnClass, "h-10 w-10 sm:h-11 sm:w-11")}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#5A6158] sm:text-xs">
                Swipe or tap arrows
              </p>

              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(1)}
                className={cn(navBtnClass, "h-10 w-10 sm:h-11 sm:w-11")}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
