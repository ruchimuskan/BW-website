"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import {
  BrandImageOverlay,
  BRAND_PHOTO_CLASS,
} from "@/components/brand/BrandImageOverlay";
import { BRAND_IMAGE_SIZES, BRAND_PHOTOS } from "@/constants/brand-images";
import { cn } from "@/lib/utils";

type CaptainsShowcaseGalleryProps = {
  className?: string;
  priority?: boolean;
};

/** Captains hero — img15 from /public/images, HQ webp with png fallback. */
export function CaptainsShowcaseGallery({
  className,
  priority = false,
}: CaptainsShowcaseGalleryProps) {
  return (
    <figure
      className={cn(
        "relative mx-auto w-full max-w-[min(100%,520px)] lg:max-w-none",
        className,
      )}
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-[#1a1f16] sm:rounded-3xl">
        <ResilientImage
          src={BRAND_PHOTOS.captainsHero}
          alt="Bull Wave Rides captain driving at night"
          fill
          priority={priority}
          sizes={BRAND_IMAGE_SIZES.half}
          className={cn(
            BRAND_PHOTO_CLASS,
            "object-[center_42%] transition-transform duration-700 hover:scale-[1.02]",
          )}
          fallbackSrc={BRAND_PHOTOS.captainsHeroPng}
        />
        <BrandImageOverlay variant="card" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        <figcaption className="absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4">
          <span className="inline-flex rounded-full border border-white/20 bg-[#111411]/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-md sm:px-3 sm:py-1.5 sm:text-[11px]">
            Partner · Earn · Grow
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
