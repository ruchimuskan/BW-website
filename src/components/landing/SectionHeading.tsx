"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/** Section header — compact on mobile, brand lime always readable */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "relative z-20 bw-heading-glow",
        centered && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      <p
        className="text-[10px] font-semibold tracking-[0.24em] uppercase sm:text-xs sm:tracking-[0.28em]"
        style={{ color: "#B8D926" }}
      >
        {eyebrow}
      </p>

      <div
        className={cn(
          "mt-2.5 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-transparent sm:mt-3 sm:w-14",
          centered && "mx-auto",
        )}
      />

      <h2
        className="mt-3 font-heading text-[1.45rem] font-semibold tracking-tight sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-[1.15]"
        style={{ color: "#B8D926" }}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "mt-2.5 text-[13px] font-normal leading-relaxed sm:mt-3 sm:text-base lg:text-lg",
            centered ? "mx-auto max-w-lg" : "max-w-xl",
          )}
          style={{ color: "#4a5228" }}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
