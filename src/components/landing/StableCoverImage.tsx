"use client";

import { useEffect, useState } from "react";
import { PremiumImage } from "@/components/brand/PremiumImage";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import { resolveBrandImageSrc } from "@/lib/brand-image-src";
import { cn } from "@/lib/utils";

interface StableCoverImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackSrc?: string;
  quality?: number;
}

/**
 * Cover image that never blanks — premium photos with subtle brand overlay.
 */
export function StableCoverImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 960px",
  fallbackSrc = BRAND_PHOTOS.limeCab,
  quality = 90,
}: StableCoverImageProps) {
  const [current, setCurrent] = useState(resolveBrandImageSrc(src || fallbackSrc));

  useEffect(() => {
    setCurrent(resolveBrandImageSrc(src || fallbackSrc));
  }, [src, fallbackSrc]);

  return (
    <PremiumImage
      src={current}
      alt={alt}
      className={cn("absolute inset-0", className)}
      priority={priority}
      quality={quality}
      sizes={sizes}
      fallbackSrc={fallbackSrc}
      overlay={priority ? "premium" : "default"}
    />
  );
}
