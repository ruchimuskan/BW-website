"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/** Ride-app section header — asphalt titles, lime taxi accent. */
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
        "relative z-20",
        centered && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#5A6158] sm:text-[11px] sm:tracking-[0.28em]">
        {eyebrow}
      </p>

      <div
        className={cn(
          "mt-2.5 h-1 w-10 rounded-full bg-[#C6E31A] sm:mt-3 sm:w-12",
          centered && "mx-auto",
        )}
      />

      <h2 className="mt-3 font-heading text-[1.45rem] font-semibold tracking-tight text-[#111411] sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "mt-2.5 text-[13px] font-normal leading-relaxed text-[#5A6158] sm:mt-3 sm:text-base lg:text-lg",
            centered ? "mx-auto max-w-lg" : "max-w-xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
