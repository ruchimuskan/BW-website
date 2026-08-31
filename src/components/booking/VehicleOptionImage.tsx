"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { resolveBrandImageSrc } from "@/lib/brand-image-src";
import { cn } from "@/lib/utils";

interface VehicleOptionImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

function shouldSkipOptimize(src: string) {
  return (
    src.startsWith("/images/") ||
    src.includes("X-Amz-Signature=") ||
    src.includes("X-Amz-Credential=") ||
    src.startsWith("data:")
  );
}

/** Loads admin vehicle icons; falls back to local service art if remote fails. */
export function VehicleOptionImage({
  src,
  alt,
  fallbackSrc = "/images/services/car.webp",
  className,
}: VehicleOptionImageProps) {
  const [current, setCurrent] = useState(resolveBrandImageSrc(src || fallbackSrc));

  useEffect(() => {
    setCurrent(resolveBrandImageSrc(src || fallbackSrc));
  }, [src, fallbackSrc]);

  return (
    <div className={cn("relative h-10 w-10 shrink-0", className)}>
      <Image
        src={current}
        alt={alt}
        fill
        sizes="40px"
        quality={NEXT_IMAGE_QUALITY.low}
        unoptimized={shouldSkipOptimize(current)}
        className="object-contain"
        onError={() => {
          if (current !== fallbackSrc) setCurrent(fallbackSrc);
        }}
      />
    </div>
  );
}
