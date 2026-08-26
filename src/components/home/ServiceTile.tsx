"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BrandImageOverlay } from "@/components/brand/BrandImageOverlay";
import { ServiceImage } from "@/components/home/ServiceImage";
import { brandPhotoBlend, brandPhotoFit } from "@/constants/brand-images";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ServiceTileProps = {
  name: string;
  description: string;
  image: string;
  index?: number;
  isAmbulance?: boolean;
  onClick: () => void;
  ctaLabel?: string;
  /** Eager-load image for above-the-fold tiles. */
  priority?: boolean;
};

/** Soft-blend strategy: white studio → multiply; dark studio → lighten; lifestyle → none. */
function imageBlendForSrc(src: string): "multiply" | "lighten" | "none" {
  return brandPhotoBlend(src);
}

/** Premium service / rental tile — elegant vehicle stage, responsive. */
export function ServiceTile({
  name,
  description,
  image,
  index = 0,
  isAmbulance = false,
  onClick,
  ctaLabel = "Book",
  priority = false,
}: ServiceTileProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const remoteCatalog =
    /^https?:\/\//i.test(image) || image.includes("/uploads/");
  const blend = remoteCatalog ? "none" : imageBlendForSrc(image);
  const fit = remoteCatalog ? "contain" : brandPhotoFit(image);
  const lifestyle = !remoteCatalog && blend === "none" && fit === "cover";
  const darkStage = blend === "lighten";
  const motionEnabled = mounted && !reduceMotion;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.button
      type="button"
      initial={motionEnabled ? { y: 12 } : false}
      animate={{ y: 0 }}
      transition={{
        ...transitions.reveal,
        delay: motionEnabled ? Math.min(index * 0.035, 0.28) : 0,
      }}
      whileHover={
        motionEnabled ? { y: -3, transition: { duration: 0.2 } } : undefined
      }
      whileTap={motionEnabled ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl text-left",
        "border shadow-[0_18px_40px_-30px_rgba(40,54,20,0.55)] transition-all duration-300",
        "hover:shadow-[0_26px_52px_-26px_rgba(184,217,38,0.5)]",
        isAmbulance
          ? "border-destructive/25 bg-gradient-to-b from-[#fff8f6] to-white hover:border-destructive/40"
          : "border-[#dce8a8]/70 bg-gradient-to-b from-[#faf6fc] via-white to-[#f4f9e4] hover:border-[#C8E84A]/45",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 z-10 h-[2.5px]",
          isAmbulance
            ? "bg-gradient-to-r from-destructive via-[#f97316] to-transparent"
            : "bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-[#D4E88A]",
        )}
      />

      {/* Mobile: compact row · sm+: stacked portrait card */}
      <div className="flex flex-1 items-stretch gap-0 sm:flex-col">
        {/* Vehicle stage — fluid on every breakpoint */}
        <div
          className={cn(
            "relative isolate flex shrink-0 items-center justify-center overflow-hidden",
            "h-24 w-24 min-[380px]:h-[6.5rem] min-[380px]:w-[6.5rem]",
            "sm:h-auto sm:w-full sm:aspect-[16/10] md:aspect-[16/11]",
            isAmbulance
              ? "bg-gradient-to-b from-[#fff0ec] to-[#fff8f6]"
              : lifestyle
                ? "bg-[#283614]"
                : darkStage
                  ? "bg-gradient-to-b from-[#38471B] via-[#4A5824] to-[#283614]"
                  : "bg-gradient-to-b from-[#eef5d4] to-[#f7fbe8]",
          )}
        >
          {lifestyle ? null : (
            <>
              {/* Soft spotlight — hides rectangular studio edges */}
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0",
                  isAmbulance
                    ? "bg-[radial-gradient(ellipse_68%_62%_at_50%_48%,rgba(255,255,255,0.95)_0%,rgba(255,247,244,0.55)_45%,transparent_72%)]"
                    : darkStage
                      ? "bg-[radial-gradient(ellipse_70%_65%_at_50%_45%,rgba(200,232,74,0.28)_0%,transparent_68%)]"
                      : "bg-[radial-gradient(ellipse_68%_62%_at_50%_48%,rgba(255,255,255,0.92)_0%,rgba(232,245,196,0.55)_45%,transparent_72%)]",
                )}
              />
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-[12%] left-1/2 h-3 w-[55%] -translate-x-1/2 rounded-[100%] blur-md",
                  isAmbulance
                    ? "bg-destructive/20"
                    : darkStage
                      ? "bg-[#C8E84A]/35"
                      : "bg-[#B8D926]/18",
                )}
              />
            </>
          )}

          <span
            className={cn(
              "absolute left-2.5 top-2.5 z-[2] hidden rounded-full px-2 py-0.5 font-heading text-[10px] font-semibold tracking-[0.16em] backdrop-blur-sm sm:inline-flex",
              isAmbulance
                ? "bg-white/80 text-destructive"
                : lifestyle || darkStage
                  ? "bg-white/15 text-[#D4E88A]"
                  : "bg-white/80 text-[#B8D926]",
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div
            className={cn(
              "relative z-[1] h-full w-full",
              lifestyle
                ? ""
                : cn(
                    "[mask-image:radial-gradient(ellipse_78%_72%_at_50%_52%,#000_58%,transparent_88%)]",
                    "[-webkit-mask-image:radial-gradient(ellipse_78%_72%_at_50%_52%,#000_58%,transparent_88%)]",
                    "p-2 sm:p-4 md:p-5",
                  ),
            )}
          >
            <ServiceImage
              src={image}
              alt={name}
              blend={blend}
              priority={priority || index < 6}
              imageClassName={cn(
                "transition-transform duration-500 ease-out will-change-transform",
                "group-hover:scale-[1.07]",
                lifestyle && "object-cover",
                darkStage
                  ? "drop-shadow-[0_12px_22px_rgba(0,0,0,0.45)]"
                  : lifestyle
                    ? ""
                    : "drop-shadow-[0_10px_18px_rgba(40,54,20,0.18)]",
              )}
            />
            {lifestyle ? <BrandImageOverlay variant="card" /> : null}
          </div>
        </div>

        {/* Copy */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-3.5 sm:px-4 sm:pb-4 sm:pt-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-heading text-[0.95rem] font-semibold tracking-tight sm:text-[1.05rem]",
                  isAmbulance
                    ? "text-destructive"
                    : "text-[#38471B] group-hover:text-[#B8D926]",
                )}
              >
                {name}
              </h3>
              <p className="mt-1 line-clamp-2 text-[12px] font-light leading-relaxed text-[#5a6330] sm:text-[13px]">
                {description}
              </p>
            </div>

            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                isAmbulance
                  ? "border-destructive/20 text-destructive/55 group-hover:border-destructive group-hover:bg-destructive group-hover:text-white"
                  : "border-[#dce8a8] text-[#B8D926]/55 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-[#B8D926] group-hover:to-[#C8E84A] group-hover:text-white",
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </span>
          </div>

          <span
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase",
              isAmbulance ? "text-destructive" : "text-[#B8D926]",
            )}
          >
            {ctaLabel}
            <span
              aria-hidden
              className="h-px w-5 bg-current opacity-35 transition-all duration-300 group-hover:w-8 group-hover:opacity-90"
            />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
