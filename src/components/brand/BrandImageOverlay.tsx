import { cn } from "@/lib/utils";

type BrandImageOverlayProps = {
  className?: string;
  variant?: "default" | "hero" | "card" | "subtle" | "premium";
};

/** Clean cover photo class — no color filters. */
export const BRAND_PHOTO_CLASS =
  "object-cover object-center transition-transform duration-700 ease-out";

/**
 * Light premium fade for text contrast — does not recolor the photo.
 */
export function BrandImageOverlay({
  className,
  variant = "default",
}: BrandImageOverlayProps) {
  const isHero = variant === "hero" || variant === "premium";
  const isCard = variant === "card";
  const isSubtle = variant === "subtle";

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        isHero
          ? "bg-gradient-to-t from-[#283614]/70 via-[#38471B]/18 to-transparent"
          : isCard
            ? "bg-gradient-to-t from-[#38471B]/42 via-transparent to-transparent"
            : isSubtle
              ? "bg-gradient-to-t from-[#38471B]/28 via-transparent to-transparent"
              : "bg-gradient-to-t from-[#38471B]/38 via-transparent to-transparent",
        className,
      )}
    />
  );
}
