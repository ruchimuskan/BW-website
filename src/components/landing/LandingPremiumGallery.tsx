"use client";

import Image from "next/image";
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
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { landingPremiumGallery } from "@/constants/services";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

const items = landingPremiumGallery;
const AUTO_MS = 4200;
const TOTAL = items.length;

type SlotStyle = {
  x: string;
  scale: number;
  opacity: number;
  zIndex: number;
  rotateY: number;
};

function reduceAngle(offset: number, deg: number) {
  return offset < 0 ? deg : -deg;
}

/** Shortest circular offset in (-half, half]. */
function circularOffset(index: number, active: number, length: number) {
  let offset = index - active;
  const half = length / 2;
  if (offset > half) offset -= length;
  if (offset <= -half) offset += length;
  return offset;
}

function slotFor(offset: number, compact: boolean): SlotStyle | null {
  const abs = Math.abs(offset);

  if (compact) {
    if (offset !== 0) return null;
    return {
      x: "0%",
      scale: 1,
      opacity: 1,
      zIndex: 40,
      rotateY: 0,
    };
  }

  if (abs > 2) return null;

  const x = `${offset * 36}%`;

  if (offset === 0) {
    return {
      x: "0%",
      scale: 1.08,
      opacity: 1,
      zIndex: 40,
      rotateY: 0,
    };
  }

  if (abs === 1) {
    return {
      x,
      scale: 0.86,
      opacity: 0.9,
      zIndex: 20,
      rotateY: reduceAngle(offset, 9),
    };
  }

  return {
    x,
    scale: 0.74,
    opacity: 0.72,
    zIndex: 10,
    rotateY: reduceAngle(offset, 12),
  };
}

function objectPosition(position: string | undefined) {
  if (position === "left") return "object-left";
  if (position === "right") return "object-right";
  return "object-center";
}

/**
 * Cover-flow gallery with reliable interval autoplay + responsive stacking.
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

  // One timeout per slide — restarts on manual nav / pause / visibility
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
    if (info.offset.x < -48 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 48 || info.velocity.x > 400) go(-1);
  };

  const slots = useMemo(() => {
    return items.map((item, i) => {
      const offset = circularOffset(i, active, TOTAL);
      return { item, i, offset, style: slotFor(offset, compact) };
    });
  }, [active, compact]);

  const autoplayActive =
    hasEntered && inView && !reduceMotion && !paused && pageVisible;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip bw-section-band border-y border-primary/10 py-10 sm:py-14 lg:py-20"
      aria-label="Visual journey gallery"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_80%,rgba(200,232,74,0.12),transparent_60%)]"
      />

      <div className={landingShell("relative z-10")}>
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { y: 16 }}
          animate={hasEntered ? { y: 0 } : undefined}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-[10px] font-semibold tracking-[0.24em] uppercase sm:text-xs sm:tracking-[0.28em]"
            style={{ color: "#B8D926" }}
          >
            Visual journey
          </p>
          <h2
            className="mt-2.5 font-heading text-[1.45rem] font-semibold tracking-tight sm:mt-3 sm:text-3xl md:text-4xl"
            style={{ color: "#B8D926" }}
          >
            Crafted for every mile
          </h2>
          <p
            className="mt-2.5 text-[13px] font-normal sm:mt-3 sm:text-base"
            style={{ color: "#4a5228" }}
          >
            Premium rides, polished vehicles, and moments designed to feel
            effortless.
          </p>
        </motion.div>

        {/* Segmented progress — fills each autoplay interval */}
        <div
          className="mx-auto mt-6 flex w-full max-w-md items-center gap-1.5 sm:mt-8 sm:max-w-lg sm:gap-2"
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
                  "relative h-1.5 flex-1 overflow-hidden rounded-full transition-colors",
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
          className="relative mx-auto mt-6 w-full max-w-[960px] overflow-x-clip sm:mt-10"
          style={{ perspective: compact ? undefined : "1200px" }}
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
          <motion.div
            className={cn(
              "relative mx-auto w-full touch-pan-y",
              compact
                ? "overflow-hidden"
                : "h-[300px] overflow-visible md:h-[340px] lg:h-[380px]",
            )}
            drag={reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            aria-roledescription="carousel"
            aria-label={`${items[active].label}, ${active + 1} of ${TOTAL}`}
            aria-live="polite"
          >
            {slots.map(({ item, i, offset, style }) => {
              if (!style) return null;
              const isFront = offset === 0;

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
                    "overflow-hidden border bg-[#f7fbe8] text-left will-change-transform",
                    compact
                      ? "relative flex w-full flex-col rounded-2xl"
                      : cn(
                          "absolute top-1/2 left-1/2 origin-center rounded-[1.35rem]",
                          "w-[min(70vw,460px)] md:w-[min(58vw,520px)] lg:w-[min(50vw,560px)]",
                        ),
                    isFront
                      ? "cursor-grab border-[#C8E84A]/35 shadow-[0_28px_56px_-16px_rgba(184,217,38,0.55)] ring-1 ring-[#C8E84A]/20 active:cursor-grabbing"
                      : "cursor-pointer border-primary/20 shadow-[0_16px_32px_-14px_rgba(40,54,20,0.4)]",
                    dragging && "pointer-events-none",
                  )}
                  style={
                    compact
                      ? undefined
                      : {
                          aspectRatio: "16 / 10",
                          transformStyle: "preserve-3d",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }
                  }
                  initial={false}
                  animate={
                    compact
                      ? {
                          scale: hasEntered || reduceMotion ? 1 : 0.97,
                          opacity: 1,
                        }
                      : {
                          x: `calc(-50% + ${style.x})`,
                          y: "-50%",
                          scale:
                            hasEntered || reduceMotion
                              ? style.scale
                              : style.scale * 0.94,
                          opacity:
                            hasEntered || reduceMotion
                              ? style.opacity
                              : Math.max(0.55, style.opacity * 0.8),
                          zIndex: style.zIndex,
                          rotateY: reduceMotion ? 0 : style.rotateY,
                        }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0.2 }
                      : {
                          type: "tween",
                          duration: 0.38,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  <div
                    className={cn(
                      "relative w-full overflow-hidden bg-[#f7fbe8]",
                      compact ? "aspect-[4/3] sm:aspect-[16/10]" : "absolute inset-0",
                    )}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      quality={NEXT_IMAGE_QUALITY.high}
                      sizes="(max-width: 767px) 100vw, (max-width: 1024px) 58vw, 560px"
                      className={cn(
                        "select-none object-contain object-center",
                        compact ? "p-2.5" : "p-4",
                        objectPosition(item.position),
                      )}
                      draggable={false}
                      {...(isFront && i <= 1
                        ? { priority: true as const }
                        : { loading: "lazy" as const })}
                    />
                  </div>
                  <div
                    className={cn(
                      compact
                        ? "border-t border-[#e8f0c8] px-4 py-3"
                        : "absolute inset-x-0 bottom-0 p-4 sm:p-5",
                    )}
                  >
                    <div
                      className={cn(
                        compact
                          ? "flex items-end justify-between gap-3"
                          : "w-fit rounded-xl bg-[#f7fbe8]/92 px-3 py-2 backdrop-blur-[2px]",
                      )}
                    >
                      <div className="min-w-0">
                        {isFront ? (
                          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#4A5824]/70 uppercase">
                            {String(active + 1).padStart(2, "0")} /{" "}
                            {String(TOTAL).padStart(2, "0")}
                          </p>
                        ) : null}
                        <p
                          className={cn(
                            "font-heading font-semibold tracking-[0.08em] text-[#38471B] uppercase",
                            isFront
                              ? "mt-1 text-lg sm:text-xl"
                              : "text-sm sm:text-base",
                          )}
                        >
                          {item.label}
                        </p>
                        {isFront && !compact ? (
                          <span className="mt-2 block h-0.5 w-9 rounded-full bg-[#C8E84A] sm:mt-2.5 sm:w-10" />
                        ) : null}
                      </div>
                      {compact && isFront ? (
                        <span className="mb-1 h-0.5 w-8 shrink-0 rounded-full bg-[#C8E84A]" />
                      ) : null}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <div
            className={cn(
              "z-50 flex items-center justify-between",
              compact
                ? "relative mt-3 px-0"
                : "pointer-events-none absolute inset-y-0 left-0 right-0 px-1",
            )}
          >
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-md transition hover:bg-primary hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-md transition hover:bg-primary hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
