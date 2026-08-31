"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { BRAND_IMAGE_SIZES } from "@/constants/brand-images";
import { resolveBrandImageSrc } from "@/lib/brand-image-src";
import { cn } from "@/lib/utils";

interface ServiceImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackSrc?: string;
  /** Soft-blend studio white/black backgrounds into the card stage. */
  blend?: "multiply" | "lighten" | "none";
  /** Prefer for first visible tiles on the home grid. */
  priority?: boolean;
}

function shouldSkipOptimize(src: string) {
  // Signed S3 URLs break if Next rewrites the query string for the optimizer.
  // Local public files should also skip /_next/image (404s on many hosts).
  return (
    src.startsWith("/images/") ||
    src.includes("X-Amz-Signature=") ||
    src.includes("X-Amz-Credential=") ||
    src.startsWith("data:")
  );
}

export function ServiceImage({
  src,
  alt,
  className,
  imageClassName,
  fallbackSrc = "/images/services/car.webp",
  blend = "multiply",
  priority = false,
}: ServiceImageProps) {
  const [current, setCurrent] = useState(resolveBrandImageSrc(src || fallbackSrc));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrent(resolveBrandImageSrc(src || fallbackSrc));
    setLoaded(false);
  }, [src, fallbackSrc]);

  const unoptimized = shouldSkipOptimize(current);

  return (
    <div className={cn("relative h-full w-full", className)}>
      {!loaded ? (
        <div
          aria-hidden
          className="absolute inset-[12%] animate-pulse rounded-full bg-[#dce8a8]/35"
        />
      ) : null}
      <Image
        src={current}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={NEXT_IMAGE_QUALITY.medium}
        unoptimized={unoptimized}
        sizes={BRAND_IMAGE_SIZES.serviceTile}
        className={cn(
          "object-contain object-center select-none",
          blend === "multiply" && "mix-blend-multiply",
          blend === "lighten" && "mix-blend-lighten",
          imageClassName,
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (current !== fallbackSrc) {
            setLoaded(false);
            setCurrent(fallbackSrc);
          } else {
            setLoaded(true);
          }
        }}
      />
    </div>
  );
}
