"use client";

import { cn } from "@/lib/utils";

interface CountryFlagProps {
  code: string;
  className?: string;
  title?: string;
}

/** Reliable flag image (Windows doesn't render emoji flags well). */
export function CountryFlag({ code, className, title }: CountryFlagProps) {
  const iso = code.trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(iso)) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- small CDN flag, no layout shift needed
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w40/${iso}.png 1x, https://flagcdn.com/w80/${iso}.png 2x`}
      alt=""
      title={title}
      width={20}
      height={15}
      loading="lazy"
      decoding="async"
      className={cn(
        "inline-block h-[14px] w-[20px] shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
        className,
      )}
    />
  );
}
