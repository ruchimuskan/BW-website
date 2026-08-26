"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BrandImageOverlay } from "@/components/brand/BrandImageOverlay";
import { BRAND_IMAGE_SIZES } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { cn } from "@/lib/utils";

type PremiumImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  overlay?: "default" | "hero" | "card" | "subtle" | "premium" | "none";
  objectPosition?: string;
};

/**
 * Responsive premium photo — sharp source, light brand fade, hover lift.
 */
export function PremiumImage({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  quality = NEXT_IMAGE_QUALITY.high,
  sizes = BRAND_IMAGE_SIZES.hero,
  fill = true,
  width,
  height,
  fallbackSrc,
  overlay = "default",
  objectPosition,
}: PremiumImageProps) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  const imageProps = fill
    ? { fill: true as const, sizes }
    : { width: width ?? 1600, height: height ?? 900, sizes };

  return (
    <div className={cn("group/photo relative overflow-hidden bg-[#38471B]", className)}>
      <Image
        src={current}
        alt={alt}
        priority={priority}
        quality={quality}
        className={cn(
          "object-cover object-center will-change-transform",
          "transition-transform duration-700 ease-out group-hover/photo:scale-[1.045]",
          imageClassName,
        )}
        style={objectPosition ? { objectPosition } : undefined}
        {...imageProps}
        onError={() => {
          if (fallbackSrc && current !== fallbackSrc) setCurrent(fallbackSrc);
        }}
      />
      {overlay !== "none" ? <BrandImageOverlay variant={overlay} /> : null}
    </div>
  );
}
