import Image from "next/image";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { cn } from "@/lib/utils";

/** Official BW Rides mark (`bwride.png`). */
export const BW_RIDES_LOGO_SRC = "/images/bwride.png";

type WaveGoLogoSize = "sm" | "md" | "lg";

const sizeStyles: Record<WaveGoLogoSize, string> = {
  sm: "h-10 w-10 rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl",
  md: "h-14 w-14 rounded-2xl sm:h-16 sm:w-16",
  lg: "h-[5.5rem] w-[5.5rem] rounded-2xl sm:h-28 sm:w-28 sm:rounded-3xl",
};

interface WaveGoLogoProps {
  size?: WaveGoLogoSize;
  variant?: "default" | "light";
  className?: string;
  priority?: boolean;
  /** Show “BW RIDES” wordmark beside the mark (header / sheets). */
  withWordmark?: boolean;
}

function BrandWordmark({
  onDark,
  compact = false,
}: {
  onDark: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "hidden min-w-0 flex-col justify-center leading-none min-[320px]:flex",
        compact ? "gap-0.5" : "gap-1",
      )}
    >
      <span className="flex items-baseline gap-1 sm:gap-1.5">
        <span
          className={cn(
            "font-heading font-extrabold tracking-[-0.03em]",
            compact
              ? "text-[1rem] sm:text-[1.05rem]"
              : "text-[1.05rem] sm:text-lg md:text-[1.15rem]",
            onDark
              ? "bg-gradient-to-br from-[#eef5d4] via-[#C6E31A] to-[#9BB820] bg-clip-text text-transparent"
              : "bg-gradient-to-br from-[#5a7210] via-[#9BB820] to-[#283614] bg-clip-text text-transparent",
          )}
        >
          BW
        </span>
        <span
          className={cn(
            "font-heading font-bold uppercase",
            compact
              ? "text-[10px] tracking-[0.22em] sm:text-[11px]"
              : "text-[11px] tracking-[0.24em] sm:text-xs sm:tracking-[0.26em]",
            onDark ? "text-white/95" : "text-[#283614]",
          )}
        >
          Rides
        </span>
      </span>

      <span
        aria-hidden
        className={cn(
          "mt-1 h-[2px] rounded-full",
          compact ? "w-8 sm:w-9" : "w-9 sm:w-10",
          onDark
            ? "bg-gradient-to-r from-[#C6E31A] via-[#C6E31A]/70 to-transparent"
            : "bg-gradient-to-r from-[#C6E31A] via-[#b8d926]/80 to-[#dce8a8]/40",
        )}
      />
    </span>
  );
}

export function WaveGoLogo({
  size = "md",
  variant = "default",
  className,
  priority = false,
  withWordmark = false,
}: WaveGoLogoProps) {
  const onDark = variant === "light";

  const mark = (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden shadow-[0_8px_20px_-14px_rgba(40,54,20,0.35)]",
        onDark
          ? "bg-[#14301A] ring-1 ring-[#C6E31A]/45"
          : "bg-[#FAFBF8] ring-1 ring-[#D4D8D0]/90",
        sizeStyles[size],
        !withWordmark && className,
      )}
    >
      <Image
        src={BW_RIDES_LOGO_SRC}
        alt="BW Rides"
        fill
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        unoptimized
        quality={NEXT_IMAGE_QUALITY.high}
        sizes="(max-width: 640px) 48px, 64px"
        className={cn(
          "object-contain object-center p-[6%]",
          !onDark && "mix-blend-multiply",
        )}
      />
    </span>
  );

  if (!withWordmark) return mark;

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2.5 sm:gap-3",
        className,
      )}
    >
      {mark}
      <BrandWordmark onDark={onDark} compact={size === "sm"} />
    </span>
  );
}
