"use client";

import { useReducedMotion } from "framer-motion";

interface PremiumSectionBackdropProps {
  /** Kept for API compatibility — photo backdrops removed for performance. */
  src?: string;
  opacity?: number;
  side?: "left" | "right" | "center" | "full";
  showOrbs?: boolean;
}

const sideGlow: Record<
  NonNullable<PremiumSectionBackdropProps["side"]>,
  string
> = {
  left: "radial-gradient(ellipse 65% 55% at 0% 35%, rgba(200,232,74,0.14), transparent 62%)",
  right:
    "radial-gradient(ellipse 65% 55% at 100% 35%, rgba(184,217,38,0.12), transparent 62%)",
  center:
    "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(200,232,74,0.13), transparent 65%)",
  full:
    "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(200,232,74,0.11), transparent 68%)",
};

/** Lightweight CSS-only section atmosphere (no multi-MB photo fetch). */
export function PremiumSectionBackdrop({
  side = "center",
  showOrbs = true,
  opacity = 1,
}: PremiumSectionBackdropProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
      style={{ opacity }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/98 via-white/94 to-white" />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: sideGlow[side] }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_100%_100%,rgba(184,217,38,0.08),transparent_58%)]" />
      <div className="wavego-luxury-grid absolute inset-0 opacity-35" />

      {showOrbs && !reduceMotion ? (
        <>
          <div className="absolute top-[18%] left-[6%] h-44 w-44 rounded-full bg-secondary/14 opacity-45 blur-3xl" />
          <div className="absolute right-[8%] bottom-[12%] h-52 w-52 rounded-full bg-primary/10 opacity-40 blur-3xl" />
        </>
      ) : null}
    </div>
  );
}
