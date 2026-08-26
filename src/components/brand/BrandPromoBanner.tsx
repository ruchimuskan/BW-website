"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND_IMAGE_SIZES } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

type BrandPromoBannerProps = {
  src: string;
  alt: string;
  href?: string;
  className?: string;
  variant?: "home" | "landing";
};

/**
 * Full-width marketing plate — scales to viewport without cropping
 * baked-in headlines or causing horizontal overflow.
 */
export function BrandPromoBanner({
  src,
  alt,
  href,
  className,
  variant = "landing",
}: BrandPromoBannerProps) {
  const plate = (
    <div
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-xl bg-muted sm:rounded-2xl",
        "ring-1 ring-primary/15",
        // Keep tall marketing art readable without dominating phones
        "max-h-[min(72vw,420px)] sm:max-h-[min(58vw,560px)] md:max-h-none",
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={900}
        sizes={
          variant === "home" ? BRAND_IMAGE_SIZES.homeFull : BRAND_IMAGE_SIZES.full
        }
        quality={NEXT_IMAGE_QUALITY.medium}
        className="h-auto w-full max-w-full select-none object-contain object-center"
        priority={false}
      />
    </div>
  );

  const framed = href ? (
    <Link
      href={href}
      className="block w-full min-w-0 transition-transform duration-300 hover:-translate-y-0.5"
    >
      {plate}
    </Link>
  ) : (
    plate
  );

  return (
    <section
      className={cn(
        "relative w-full min-w-0 overflow-x-clip",
        variant === "home" ? "bg-card" : "bw-section-glow",
        className,
      )}
      aria-label={alt}
    >
      <div
        className={
          variant === "home"
            ? "mx-auto w-full min-w-0 max-w-6xl px-3 py-5 sm:px-6 sm:py-8 md:px-10 lg:px-12 lg:py-10"
            : landingShell("py-8 sm:py-10 lg:py-12")
        }
      >
        {framed}
      </div>
    </section>
  );
}
