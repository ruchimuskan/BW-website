"use client";

import Link from "next/link";
import { ResilientImage } from "@/components/brand/ResilientImage";
import { BRAND_IMAGE_SIZES, BRAND_PHOTOS } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

type BrandPromoBannerProps = {
  src: string;
  alt: string;
  href?: string;
  className?: string;
  variant?: "home" | "landing";
  fallbackSrc?: string;
};

/** Marketing plate aspect — matches pic-12 hero banner (1536×1024). */
const PROMO_ASPECT = "aspect-[3/2]";

/**
 * Full-width marketing plate — edge-to-edge artwork without letterboxing.
 * Uses a fixed 3:2 frame so API banners with mismatched metadata still fill cleanly.
 */
export function BrandPromoBanner({
  src,
  alt,
  href,
  className,
  variant = "landing",
  fallbackSrc = BRAND_PHOTOS.promoAnytime,
}: BrandPromoBannerProps) {
  const plate = (
    <div
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-xl sm:rounded-2xl",
        PROMO_ASPECT,
        "shadow-[0_18px_44px_-28px_rgba(12,24,41,0.38)] ring-1 ring-primary/15",
      )}
    >
      <ResilientImage
        src={src}
        alt={alt}
        fill
        sizes={
          variant === "home" ? BRAND_IMAGE_SIZES.homeFull : BRAND_IMAGE_SIZES.full
        }
        quality={NEXT_IMAGE_QUALITY.high}
        className="object-cover object-center select-none"
        fallbackSrc={fallbackSrc}
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
        variant === "home" ? "bg-white" : "bw-section-glow",
        className,
      )}
      aria-label={alt}
    >
      <div
        className={
          variant === "home"
            ? "mx-auto w-full min-w-0 max-w-6xl px-3 py-5 sm:px-6 sm:py-7 md:px-10 lg:px-12"
            : landingShell("py-8 sm:py-10 lg:py-12")
        }
      >
        {framed}
      </div>
    </section>
  );
}
