"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { BRAND_IMAGE_SIZES } from "@/constants/brand-images";
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

const STAGE_FRAME = cn(
  "relative w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-[1.35rem] lg:rounded-[1.5rem]",
  "aspect-[16/11] sm:aspect-[16/10] lg:aspect-[5/4] xl:aspect-[16/11]",
  "max-h-[min(22rem,52vw)] sm:max-h-[min(24rem,48vw)] lg:max-h-[min(28rem,42vw)]",
  "ring-1 ring-white/12 shadow-[0_28px_60px_-28px_rgba(0,0,0,0.65)]",
);

function HeroStageSlide({ tab }: { tab: LandingBookingTab }) {
  const item = landingBookImages[tab];

  return (
    <div className="absolute inset-0">
      <ResilientImage
        src={item.src}
        alt={item.alt}
        fill
        quality={NEXT_IMAGE_QUALITY.high}
        sizes={BRAND_IMAGE_SIZES.hero}
        className="object-cover"
        style={{ objectPosition: item.objectPosition }}
        fallbackSrc={item.fallback}
        {...(tab === "rides"
          ? { priority: true as const }
          : { loading: "lazy" as const })}
      />
      <div
        aria-hidden
        className={cn("absolute inset-0 bg-gradient-to-t", item.accent)}
      />
    </div>
  );
}

/** Responsive lifestyle photo — only the active tab is in the DOM so crawlers
 *  do not treat the ambulance cutout as the homepage thumbnail. */
export function HeroVehicleStage({
  activeTab,
  onTabChange,
  className,
}: HeroVehicleStageProps) {
  return (
    <div className={cn("relative mx-auto w-full min-w-0 max-w-[40rem] lg:max-w-none", className)}>
      <div className={STAGE_FRAME}>
        <HeroStageSlide tab={activeTab} />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-4">
          <p className="min-w-0 truncate rounded-full border border-white/15 bg-[#111411]/55 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur-sm sm:text-[11px]">
            {landingBookingTabs.find((tab) => tab.id === activeTab)?.label}
          </p>
          <div className="flex shrink-0 gap-1.5">
            {landingBookingTabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-label={`${tab.label} photo`}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    selected ? "w-7 bg-[#C6E31A]" : "w-2 bg-white/40 hover:bg-white/65",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
