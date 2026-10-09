"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import {
  imageFallbackChain,
  resolveBrandImageSrc,
  shouldSkipImageOptimizer,
} from "@/lib/brand-image-src";

type ResilientImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc?: string;
};

/**
 * next/image with automatic png / brand fallback on error.
 * Local files skip the optimizer so production hosts load photos immediately.
 */
export function ResilientImage({
  src,
  fallbackSrc = BRAND_PHOTOS.streetCab,
  alt,
  priority,
  loading,
  decoding,
  sizes,
  ...rest
}: ResilientImageProps) {
  const chain = useMemo(
    () => imageFallbackChain(src, fallbackSrc),
    [src, fallbackSrc],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src, fallbackSrc]);

  const current = chain[Math.min(index, chain.length - 1)] ?? resolveBrandImageSrc(src);

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      priority={priority}
      fetchPriority={priority ? "high" : rest.fetchPriority}
      loading={priority ? undefined : loading ?? "lazy"}
      decoding={decoding ?? "async"}
      sizes={
        sizes ??
        (rest.fill
          ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 720px"
          : undefined)
      }
      unoptimized={shouldSkipImageOptimizer(current)}
      onError={() => {
        setIndex((i) => (i < chain.length - 1 ? i + 1 : i));
      }}
    />
  );
}
