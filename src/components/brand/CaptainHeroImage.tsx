"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import { captainImageFallbackChain } from "@/lib/brand-image-src";

type CaptainHeroImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string;
};

/** Captain / partner hero — real BW photo, no illustration fallbacks. */
export function CaptainHeroImage({
  src = BRAND_PHOTOS.captain,
  alt,
  priority,
  loading,
  className,
  ...rest
}: CaptainHeroImageProps) {
  const chain = useMemo(() => captainImageFallbackChain(src), [src]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  const current = chain[Math.min(index, chain.length - 1)] ?? BRAND_PHOTOS.captainPng;

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      className={className}
      priority={priority}
      loading={priority ? undefined : loading ?? "lazy"}
      fetchPriority={priority ? "high" : undefined}
      unoptimized
      onError={() => {
        setIndex((i) => (i < chain.length - 1 ? i + 1 : i));
      }}
    />
  );
}
