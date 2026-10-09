"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { landingPillars } from "@/constants/services";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

const ICONS: LucideIcon[] = [
  Clock3,
  MapPinned,
  ShieldCheck,
  Wallet,
  Sparkles,
  Leaf,
];

const VB_W = 1200;
const VB_H = 400;
const ROTATE_MS = 4000;

const ROAD_D =
  "M 740 355 C 900 348, 1060 300, 1025 240 C 995 190, 800 208, 650 200 C 490 190, 380 150, 330 100 C 305 70, 298 52, 292 46";

const MARKERS: { x: number; y: number; pole: number; copy: "left" | "right" | "top" }[] = [
  { x: 750, y: 348, pole: 22, copy: "left" },
  { x: 990, y: 252, pole: 20, copy: "right" },
  { x: 900, y: 228, pole: 18, copy: "top" },
  { x: 640, y: 202, pole: 18, copy: "top" },
  { x: 430, y: 152, pole: 16, copy: "left" },
  { x: 305, y: 102, pole: 14, copy: "right" },
];

const COPY_POS: Record<"left" | "right" | "top", string> = {
  left: "right-[calc(100%+0.6rem)] top-1/2 -translate-y-1/2 text-right",
  right: "left-[calc(100%+0.6rem)] top-1/2 -translate-y-1/2 text-left",
  top: "bottom-[calc(100%+0.45rem)] left-1/2 -translate-x-1/2 text-center",
};

function Skyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 140"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id="pillar-sky-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b8614" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#C6E31A" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#C6E31A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="url(#pillar-sky-fade)">
        <rect x="24" y="88" width="42" height="132" />
        <rect x="74" y="48" width="28" height="172" />
        <rect x="110" y="72" width="56" height="148" />
        <rect x="166" y="28" width="36" height="192" />
        <rect x="222" y="64" width="22" height="156" />
        <rect x="254" y="40" width="48" height="180" />
        <rect x="312" y="86" width="30" height="134" />
        <rect x="354" y="18" width="40" height="202" />
        <rect x="404" y="58" width="64" height="162" />
        <rect x="478" y="36" width="26" height="184" />
        <rect x="514" y="70" width="50" height="150" />
        <rect x="574" y="22" width="38" height="198" />
        <rect x="622" y="80" width="28" height="140" />
        <rect x="660" y="44" width="54" height="176" />
        <rect x="724" y="60" width="24" height="160" />
        <rect x="758" y="14" width="42" height="206" />
        <rect x="810" y="52" width="70" height="168" />
        <rect x="890" y="30" width="32" height="190" />
        <rect x="932" y="76" width="48" height="144" />
        <rect x="990" y="40" width="36" height="180" />
        <rect x="1036" y="88" width="58" height="132" />
        <rect x="1102" y="56" width="28" height="164" />
        <rect x="1140" y="70" width="40" height="150" />
      </g>
    </svg>
  );
}

function RoadSvg({
  reduceMotion,
  active,
}: {
  reduceMotion: boolean | null;
  active: boolean;
}) {
  const drawn = reduceMotion || active;
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="none"
    >
      <motion.path
        d={ROAD_D}
        fill="none"
        stroke="#C6E31A"
        strokeWidth="46"
        strokeLinecap="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d={ROAD_D}
        fill="none"
        stroke="#1A1F16"
        strokeWidth="32"
        strokeLinecap="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d={ROAD_D}
        fill="none"
        stroke="#C6E31A"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="14 16"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={
          reduceMotion
            ? { pathLength: 1 }
            : drawn
              ? { pathLength: 1, strokeDashoffset: [0, -60] }
              : { pathLength: 0 }
        }
        transition={
          drawn && !reduceMotion
            ? {
                pathLength: { duration: 1.25, delay: 0.08, ease: [0.22, 1, 0.36, 1] },
                strokeDashoffset: {
                  delay: 1.3,
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "linear",
                },
              }
            : { duration: 0.2 }
        }
      />
    </svg>
  );
}

export function LandingPillarsSection() {
  const reduceMotion = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sceneRef, { once: true, amount: 0.08, margin: "80px 0px" });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);

  useEffect(() => {
    const boot = window.setTimeout(() => setArmed(true), 600);
    return () => window.clearTimeout(boot);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || !armed) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % landingPillars.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, armed, active]);

  const pillar = landingPillars[active] ?? landingPillars[0];
  const ActiveIcon = ICONS[active] ?? Sparkles;

  return (
    <section
      id="why-us"
      aria-labelledby="why-us-title"
      className="relative overflow-x-clip bg-gradient-to-b from-[#f7f8f3] via-[#eef6c4]/50 to-[#f7f8f3] py-6 sm:py-8 lg:py-10"
    >
      <div className={landingShell("relative z-10")}>
        <header className="relative z-30 mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#5a7a12]">
            Why riders choose us
          </p>
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#C6E31A]" />
          <h2
            id="why-us-title"
            className="mt-2 font-heading text-[1.35rem] font-semibold tracking-tight text-[#111411] sm:text-2xl lg:text-[1.75rem]"
          >
            Luxury in every detail
          </h2>
          <p className="mx-auto mt-1.5 max-w-lg text-[12.5px] leading-snug text-[#5a6330] sm:text-sm">
            Designed for calm, confident travel — from the first tap to the
            final drop.
          </p>
        </header>

        <div
          ref={sceneRef}
          className="relative z-0 mx-auto mt-6 w-full max-w-5xl sm:mt-7"
        >
          <div className="pointer-events-none absolute inset-x-0 top-[10%] h-[42%] overflow-hidden opacity-70">
            <Skyline className="h-full w-full" />
          </div>

          <div className="relative aspect-[1200/400] w-full max-h-[min(40vh,22rem)]">
            <RoadSvg reduceMotion={reduceMotion} active={inView} />

            <ol className="absolute inset-0 m-0 list-none p-0">
              {landingPillars.map((item, index) => {
                const mark = MARKERS[index];
                if (!mark) return null;
                const Icon = ICONS[index] ?? Sparkles;
                const selected = index === active;

                return (
                  <li
                    key={item.title}
                    className="absolute z-10"
                    style={{
                      left: `${(mark.x / VB_W) * 100}%`,
                      top: `${(mark.y / VB_H) * 100}%`,
                    }}
                  >
                    <button
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${item.title}: ${item.description}`}
                      onClick={() => setActive(index)}
                      onPointerEnter={() => setPaused(true)}
                      onPointerLeave={() => setPaused(false)}
                      className="flex -translate-x-1/2 -translate-y-full flex-col items-center focus-visible:outline-none"
                    >
                      <span className="relative">
                        {selected ? (
                          <span
                            aria-hidden
                            className="absolute -inset-1.5 animate-ping rounded-full bg-[#C6E31A]/35"
                          />
                        ) : null}
                        <span
                          className={cn(
                            "relative flex items-center justify-center rounded-full border-[3px] transition-all duration-300",
                            selected
                              ? "h-11 w-11 scale-110 border-[#111411] bg-[#C6E31A] text-[#111411] shadow-[0_0_0_4px_rgba(198,227,26,0.35)] sm:h-12 sm:w-12"
                              : "h-9 w-9 border-[#C6E31A] bg-[#111411] text-[#C6E31A] hover:bg-[#1A1F16] sm:h-10 sm:w-10",
                          )}
                        >
                          <Icon
                            className={selected ? "h-5 w-5" : "h-4 w-4"}
                            strokeWidth={2.2}
                          />
                        </span>
                        {selected ? (
                          <span
                            className={cn(
                              "pointer-events-none absolute z-20 hidden whitespace-nowrap lg:block",
                              COPY_POS[mark.copy],
                            )}
                          >
                            <span className="inline-flex rounded-md bg-[#C6E31A] px-2 py-0.5 font-heading text-[12px] font-extrabold tracking-tight text-[#111411] shadow-[0_6px_14px_-8px_rgba(17,20,17,0.4)] ring-1 ring-[#111411]/20">
                              {index + 1}. {item.title}
                            </span>
                          </span>
                        ) : null}
                      </span>
                      <span
                        aria-hidden
                        className="w-[3px] rounded-full bg-[#1A1F16] sm:w-[4px]"
                        style={{ height: mark.pole }}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2 lg:hidden">
          {landingPillars.map((item, index) => (
            <button
              key={`chip-${item.title}`}
              type="button"
              onClick={() => setActive(index)}
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
              className={cn(
                "rounded-full px-2.5 py-1 font-heading text-[11px] font-bold transition",
                index === active
                  ? "bg-[#C6E31A] text-[#111411]"
                  : "bg-white text-[#3a4030] ring-1 ring-[#d7e3a4]",
              )}
            >
              {index + 1}. {item.title}
            </button>
          ))}
        </div>

        {pillar ? (
          <motion.div
            key={pillar.title}
            initial={reduceMotion ? false : { opacity: 0.4, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            className="relative mx-auto mt-4 max-w-xl overflow-hidden rounded-2xl border border-[#C6E31A]/50 bg-white px-4 py-4 text-center shadow-[0_18px_36px_-24px_rgba(198,227,26,0.55)] sm:px-6"
            aria-live="polite"
          >
            {!paused && !reduceMotion ? (
              <span
                aria-hidden
                key={`progress-${pillar.title}`}
                className="absolute inset-x-0 top-0 h-[3px] origin-left bg-[#C6E31A]"
                style={{ animation: `pillar-progress ${ROTATE_MS}ms linear` }}
              />
            ) : null}
            <p className="inline-flex items-center gap-2 rounded-full bg-[#111411] px-3 py-1 font-heading text-[11px] font-bold tracking-[0.16em] text-[#C6E31A] uppercase">
              <ActiveIcon className="h-4 w-4" strokeWidth={2.2} />
              {String(active + 1).padStart(2, "0")} · {pillar.title}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#3a4030] sm:text-[15px]">
              {pillar.description}
            </p>
            <div className="mt-3 flex justify-center gap-1.5">
              {landingPillars.map((item, index) => (
                <button
                  key={`dot-${item.title}`}
                  type="button"
                  aria-label={item.title}
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === active ? "w-6 bg-[#C6E31A]" : "w-1.5 bg-[#c5d0a8]",
                  )}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
