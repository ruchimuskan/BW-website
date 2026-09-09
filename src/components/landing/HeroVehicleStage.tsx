"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import { motion, useReducedMotion } from "framer-motion";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import {
  landingBookImages,
  landingBookingTabs,
  type LandingBookingTab,
} from "@/constants/services";
import { cn } from "@/lib/utils";

interface HeroVehicleStageProps {
  activeTab: LandingBookingTab;
  onTabChange: (tab: LandingBookingTab) => void;
  className?: string;
}

const heroTabs = landingBookingTabs.map((t) => t.id);

/** Responsive stage — scales with viewport, capped to avoid overflow. */
const STAGE_FRAME = cn(
  "relative w-full overflow-hidden",
  "h-[clamp(13rem,44vw,17rem)]",
  "sm:h-[clamp(14.5rem,40vw,19rem)]",
  "md:h-[clamp(15.5rem,36vw,21rem)]",
  "lg:h-[clamp(17rem,30vw,23rem)]",
  "xl:h-[clamp(18rem,28vw,25rem)]",
);

const IMAGE_MAX_W =
  "max-w-[min(100%,26rem)] sm:max-w-[min(100%,30rem)] md:max-w-[min(100%,32rem)] lg:max-w-[min(100%,36rem)] xl:max-w-[min(100%,38rem)]";

function HeroStageSlide({
  tab,
  isActive,
  reduceMotion,
}: {
  tab: LandingBookingTab;
  isActive: boolean;
  reduceMotion: boolean | null;
}) {
  const item = landingBookImages[tab];

  return (
    <motion.div
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-in-out",
        isActive ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!isActive}
      animate={!reduceMotion && isActive ? { y: [0, -5, 0] } : { y: 0 }}
      transition={
        !reduceMotion && isActive
          ? { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    >
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex h-full w-full items-end justify-center pb-5 sm:pb-6",
          IMAGE_MAX_W,
        )}
      >
        <div
          className="relative h-[92%] w-full"
          style={{
            transform: `scale(${item.scale}) translateY(${item.offsetY})`,
            transformOrigin: "center bottom",
          }}
        >
          <ResilientImage
            src={item.src}
            alt={isActive ? item.alt : ""}
            fill
            quality={NEXT_IMAGE_QUALITY.high}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 48vw, 480px"
            className="object-contain contrast-[1.04] brightness-[1.03] drop-shadow-[0_22px_38px_rgba(0,0,0,0.58)] saturate-[1.08]"
            style={{ objectPosition: item.objectPosition }}
          fallbackSrc={item.fallback}
          {...(tab === "rides"
            ? { priority: true as const }
            : { loading: "lazy" as const })}
        />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Contained 3D vehicle stage — balanced height, no bleed into copy column.
 */
export function HeroVehicleStage({
  activeTab,
  onTabChange,
  className,
}: HeroVehicleStageProps) {
  const reduceMotion = useReducedMotion();
  const slide = landingBookImages[activeTab];
  const isEmergency = activeTab === "ambulance";
  const isParcel = activeTab === "parcel";

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <div className={STAGE_FRAME}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[6%] bottom-[4%] top-[10%] rounded-[50%] blur-2xl transition-[background] duration-700"
          style={{
            background: `radial-gradient(ellipse 78% 68% at 50% 62%, ${slide.glow}, transparent 74%)`,
          }}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-[6%] left-1/2 h-[14%] w-[68%] -translate-x-1/2 rounded-[100%] blur-xl",
            isEmergency ? "bg-[#C6E31A]/22" : "bg-[#C6E31A]/28",
          )}
        />

        {heroTabs.map((tab) => (
          <HeroStageSlide
            key={tab}
            tab={tab}
            isActive={tab === activeTab}
            reduceMotion={reduceMotion}
          />
        ))}

        {!isEmergency ? (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-md bg-[#C6E31A] px-2.5 py-0.5 text-[9px] font-extrabold tracking-[0.2em] text-[#111411] shadow-[0_6px_18px_-6px_rgba(198,227,26,0.75)] sm:px-3 sm:py-1 sm:text-[10px]",
              isParcel ? "bottom-[78%] sm:bottom-[80%]" : "top-[1%]",
            )}
          >
            {isParcel ? "PARCEL" : "RIDE"}
          </div>
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[78%] left-1/2 -translate-x-1/2 rounded-md bg-destructive px-2.5 py-0.5 text-[9px] font-extrabold tracking-[0.2em] text-white shadow-[0_6px_18px_-6px_rgba(220,38,38,0.5)] sm:bottom-[80%] sm:px-3 sm:py-1 sm:text-[10px]"
          >
            SOS
          </div>
        )}

        <div className="absolute bottom-1.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-2">
          {landingBookingTabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-label={`${tab.label} preview`}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  selected
                    ? tab.id === "ambulance"
                      ? "w-7 bg-destructive"
                      : "w-7 bg-[#C6E31A]"
                    : "w-2 bg-white/35 hover:bg-white/55",
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
