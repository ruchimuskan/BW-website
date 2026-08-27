"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BrandImageOverlay } from "@/components/brand/BrandImageOverlay";
import { BRAND_IMAGE_SIZES } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { imageFallbackChain, resolveBrandImageSrc } from "@/lib/brand-image-src";
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
  const chain = useMemo(
    () => imageFallbackChain(src, fallbackSrc),
    [src, fallbackSrc],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src, fallbackSrc]);

  const current = chain[Math.min(index, chain.length - 1)] ?? resolveBrandImageSrc(src);

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
        loading={priority ? undefined : "lazy"}
        className={cn(
          "object-cover object-center will-change-transform",
          "transition-transform duration-700 ease-out group-hover/photo:scale-[1.045]",
          imageClassName,
        )}
        style={objectPosition ? { objectPosition } : undefined}
        {...imageProps}
        onError={() => {
          setIndex((i) => (i < chain.length - 1 ? i + 1 : i));
        }}
      />
      {overlay !== "none" ? <BrandImageOverlay variant={overlay} /> : null}
    </div>
  );
}
