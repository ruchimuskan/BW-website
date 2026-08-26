import Image from "next/image";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { cn } from "@/lib/utils";

/** User-provided BW Rides mark (transparent PNG). */
export const BW_RIDES_LOGO_SRC = "/images/bwride.png";

type WaveGoLogoSize = "sm" | "md" | "lg";

const sizeStyles: Record<WaveGoLogoSize, string> = {
  sm: "h-12 w-12 sm:h-14 sm:w-14",
  md: "h-16 w-16 sm:h-[4.75rem] sm:w-[4.75rem]",
  lg: "h-[5.5rem] w-[5.5rem] sm:h-28 sm:w-28",
};

interface WaveGoLogoProps {
  size?: WaveGoLogoSize;
  variant?: "default" | "light";
  className?: string;
  priority?: boolean;
}

export function WaveGoLogo({
  size = "md",
  variant = "default",
  className,
  priority = false,
}: WaveGoLogoProps) {
  const onDark = variant === "light";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        sizeStyles[size],
        className,
      )}
    >
      <Image
        src={BW_RIDES_LOGO_SRC}
        alt="BW Rides"
        fill
        priority={priority}
        quality={NEXT_IMAGE_QUALITY.high}
        sizes="(max-width: 640px) 96px, 160px"
        className={cn(
          "object-contain object-center",
          onDark ? "drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]" : "mix-blend-multiply",
        )}
      />
    </span>
  );
}
