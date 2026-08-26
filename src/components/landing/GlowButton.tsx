"use client";

import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GlowTone = "primary" | "outline" | "light" | "glass";

type GlowButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  tone?: GlowTone;
  disabled?: boolean;
};

/**
 * Marketing CTA with soft glow pulse + shine.
 * Fully keyboard accessible; animations off when reduced-motion is preferred.
 */
export function GlowButton({
  children,
  onClick,
  type = "button",
  className,
  tone = "primary",
  disabled,
}: GlowButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      className={cn(
        "bw-cta-glow",
        tone === "outline" && "bw-cta-glow--outline",
        tone === "light" && "bw-cta-glow--light",
        tone === "glass" && "bw-cta-glow--glass",
      )}
    >
      {!reduceMotion && !disabled ? (
        <span aria-hidden className="bw-cta-glow__aura" />
      ) : null}
      <Button
        type={type}
        disabled={disabled}
        onClick={onClick}
        size="lg"
        variant={tone === "outline" ? "outline" : "default"}
        className={cn(
          "bw-cta-glow__btn h-12 min-h-12 px-7 font-semibold tracking-wide sm:min-w-[10.5rem]",
          tone === "primary" &&
            "bg-primary text-primary-foreground hover:bg-primary/90",
          tone === "outline" &&
            "border-primary/35 bg-white text-primary hover:border-primary hover:bg-primary/5",
          tone === "light" &&
            "!bg-white !text-primary hover:!bg-white/90 hover:!text-primary",
          tone === "glass" &&
            "border border-white/45 bg-white/10 text-white tracking-[0.12em] uppercase hover:bg-white/20 hover:text-white",
          className,
        )}
      >
        {!reduceMotion && !disabled ? (
          <span aria-hidden className="bw-cta-glow__shine" />
        ) : null}
        <span className="bw-cta-glow__label">{children}</span>
      </Button>
    </span>
  );
}
