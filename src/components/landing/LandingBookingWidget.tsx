"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import {
  MapPin,
  Navigation2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import {
  landingBookingTabs,
  type LandingBookingTab,
} from "@/constants/services";
import { cn } from "@/lib/utils";
import type { LocationFieldType } from "@/lib/location-search";

const tabMeta: Record<
  LandingBookingTab,
  {
    photo: string;
    photoAlt: string;
    hint: string;
  }
> = {
  rides: {
    photo: BRAND_PHOTOS.streetCab,
    photoAlt: "Rides",
    hint: "Bike, auto & cab — matched in seconds",
  },
  parcel: {
    photo: BRAND_PHOTOS.parcelDelivery,
    photoAlt: "Parcel",
    hint: "Same-city deliveries with live tracking",
  },
  ambulance: {
    photo: BRAND_PHOTOS.ambulance,
    photoAlt: "Emergency",
    hint: "Verified medical transport, 24×7",
  },
};

function TabPhoto({
  src,
  alt,
  active,
  featured,
  className,
}: {
  src: string;
  alt: string;
  active: boolean;
  featured: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md ring-1",
        featured
          ? "h-8 w-8 sm:h-9 sm:w-9"
          : "h-7 w-7 sm:h-8 sm:w-8",
        active ? "ring-white/70" : "ring-black/10",
        className,
      )}
    >
      <ResilientImage
        src={src}
        alt=""
        fill
        sizes="36px"
        className="object-cover"
        aria-hidden
        fallbackSrc={BRAND_PHOTOS.streetCab}
      />
      <span className="sr-only">{alt}</span>
    </span>
  );
}

export interface LandingBookingWidgetProps {
  activeTab: LandingBookingTab;
  onTabChange: (tab: LandingBookingTab) => void;
  pickup: string;
  dropoff: string;
  dropoffEmptyLabel: string;
  ctaLabel: string;
  onOpenLocation: (field: LocationFieldType) => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  /**
   * `featured` = large hero booking panel
   * `default` = standard marketing card
   * `compact` = denser for tight layouts
   */
  size?: "featured" | "default" | "compact";
  /** @deprecated Use size="compact" */
  compact?: boolean;
  showTitle?: boolean;
}

/** Pickup / dropoff booking card — featured size is the hero conversion panel. */
export function LandingBookingWidget({
  activeTab,
  onTabChange,
  pickup,
  dropoff,
  dropoffEmptyLabel,
  ctaLabel,
  onOpenLocation,
  onSubmit,
  className,
  size,
  compact = false,
  showTitle = false,
}: LandingBookingWidgetProps) {
  const reduceMotion = useReducedMotion();
  const meta = tabMeta[activeTab];
  const isEmergency = activeTab === "ambulance";
  const resolvedSize = size ?? (compact ? "compact" : "default");
  const featured = resolvedSize === "featured";
  const dense = resolvedSize === "compact";

  return (
    <div
      id="book"
      className={cn(
        "scroll-mt-28 flex w-full min-w-0 max-w-full flex-col overflow-hidden border border-[#D4D8D0] bg-white",
        featured
          ? "rounded-2xl p-3 shadow-[0_28px_64px_-24px_rgba(17,20,17,0.28)] sm:rounded-[1.35rem] sm:p-4 md:p-5"
          : dense
            ? "rounded-xl p-2 shadow-[0_22px_48px_-24px_rgba(17,20,17,0.22)] sm:rounded-2xl sm:p-2.5"
            : "rounded-xl p-2.5 shadow-[0_22px_48px_-24px_rgba(17,20,17,0.22)] sm:rounded-2xl sm:p-3.5",
        className,
      )}
    >
      {showTitle ? (
        <div className={cn("min-w-0", featured ? "mb-3 sm:mb-4" : "mb-2.5")}>
          <p
            className={cn(
              "font-semibold tracking-[0.2em] text-[#5A6158] uppercase",
              featured ? "text-[11px] sm:text-xs" : "text-[10px]",
            )}
          >
            Book your journey
          </p>
          {featured ? (
            <p className="mt-1.5 text-sm leading-snug text-[#5A6158] sm:text-[15px]">
              Enter pickup & drop — see prices in seconds.
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "relative flex w-full min-w-0 shrink-0 gap-1 rounded-xl bg-[#111411] p-1",
          featured && "sm:gap-1.5 sm:p-1.5",
        )}
        role="tablist"
        aria-label="Booking type"
      >
        {landingBookingTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const emergency = tab.id === "ambulance";
          const photo = tabMeta[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative z-10 flex min-w-0 flex-1 items-center justify-center gap-1 px-1.5 font-semibold transition-all duration-200 sm:gap-2 sm:px-3",
                "rounded-lg",
                featured
                  ? "min-h-12 py-2.5 text-[11px] sm:min-h-[3.25rem] sm:text-xs md:text-sm"
                  : dense
                    ? "min-h-10 py-2 text-[10px] sm:py-2.5 sm:text-xs"
                    : "min-h-11 py-2.5 text-[10px] sm:text-sm",
                emergency
                  ? isActive
                    ? "bg-destructive text-white shadow-md shadow-destructive/25"
                    : "text-white/80 hover:bg-white/10"
                  : isActive
                    ? "bg-[#C6E31A] text-[#111411] shadow-md shadow-black/20"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <TabPhoto
                src={photo.photo}
                alt={photo.photoAlt}
                active={isActive}
                featured={featured}
                className="hidden min-[360px]:block"
              />
              <span className="truncate leading-tight">
                {tab.id === "ambulance" ? (
                  <>
                    <span className="min-[420px]:hidden">SOS</span>
                    <span className="hidden min-[420px]:inline">Emergency</span>
                  </>
                ) : (
                  tab.label
                )}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={activeTab}
          initial={reduceMotion ? false : { y: 4 }}
          animate={{ y: 0 }}
          exit={reduceMotion ? undefined : { y: -4 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "flex min-w-0 items-center justify-center gap-2 px-2 text-center font-medium text-[#5A6158]",
            featured
              ? "mt-2.5 text-xs sm:mt-3 sm:text-sm"
              : dense
                ? "mt-1.5 text-[10px] sm:mt-2 sm:text-[11px]"
                : "mt-2 text-[11px] sm:mt-2.5 sm:text-xs",
          )}
        >
          <TabPhoto
            src={meta.photo}
            alt=""
            active
            featured={featured}
          />
          <span className="min-w-0 truncate">{meta.hint}</span>
        </motion.p>
      </AnimatePresence>

      <form
        onSubmit={onSubmit}
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          featured
            ? "gap-2.5 p-1 pt-3 sm:gap-3 sm:p-1.5 sm:pt-4"
            : dense
              ? "gap-1.5 p-1 pt-1.5 sm:gap-2 sm:p-2 sm:pt-2"
              : "gap-2 p-1.5 pt-2 sm:gap-2.5 sm:p-3 sm:pt-3",
        )}
      >
        <button
          type="button"
          onClick={() => onOpenLocation("pickup")}
          className={cn(
            "group flex w-full min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-primary/15 bg-muted/40 text-left transition-all duration-200 hover:border-primary/45 hover:bg-primary/[0.04] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
            featured
              ? "min-h-[4.25rem] px-3.5 py-3.5 sm:min-h-[4.75rem] sm:px-4 sm:py-4"
              : dense
                ? "min-h-[3.25rem] gap-2.5 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3"
                : "min-h-[3.5rem] gap-2.5 rounded-xl px-3 py-3 sm:px-4 sm:py-3.5",
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-white text-primary transition-colors group-hover:bg-primary group-hover:text-white",
              featured ? "h-11 w-11 sm:h-12 sm:w-12" : dense ? "h-7 w-7 rounded-lg" : "h-8 w-8 rounded-lg",
            )}
          >
            <Navigation2 className={featured ? "h-5 w-5" : "h-3.5 w-3.5"} />
          </span>
          <span className="min-w-0 flex-1 overflow-hidden">
            <span
              className={cn(
                "block font-semibold tracking-[0.14em] uppercase text-primary",
                featured ? "text-[10px] sm:text-[11px]" : "text-[9px] sm:text-[10px]",
              )}
            >
              Pickup
            </span>
            <span
              className={cn(
                "mt-0.5 block break-words [overflow-wrap:anywhere] line-clamp-2",
                featured
                  ? "text-[15px] leading-snug sm:text-base"
                  : dense
                    ? "text-[13px] leading-snug sm:text-sm"
                    : "text-[13px] leading-snug sm:text-base",
                pickup ? "font-semibold text-primary" : "text-[#5a6330]",
              )}
              title={pickup || undefined}
            >
              {pickup || "Pickup location"}
            </span>
          </span>
          <MapPin
            className={cn(
              "shrink-0 text-primary/35 transition-colors group-hover:text-primary",
              featured ? "h-4 w-4" : "h-3.5 w-3.5",
            )}
          />
        </button>

        <div className="relative flex shrink-0 justify-center" aria-hidden>
          <span className="absolute top-1/2 left-10 right-10 -translate-y-1/2 border-t border-dashed border-primary/20 sm:left-12 sm:right-12" />
          <span
            className={cn(
              "relative z-[1] flex items-center justify-center rounded-lg border border-primary/15 bg-white font-semibold text-primary shadow-sm",
              featured ? "h-7 w-7 text-[11px]" : dense ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]",
            )}
          >
            ↓
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenLocation("dropoff")}
          className={cn(
            "group flex w-full min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-primary/15 bg-muted/40 text-left transition-all duration-200 hover:border-primary/45 hover:bg-primary/[0.04] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
            featured
              ? "min-h-[4.25rem] px-3.5 py-3.5 sm:min-h-[4.75rem] sm:px-4 sm:py-4"
              : dense
                ? "min-h-[3.25rem] gap-2.5 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3"
                : "min-h-[3.5rem] gap-2.5 rounded-xl px-3 py-3 sm:px-4 sm:py-3.5",
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl border bg-white transition-colors",
              isEmergency
                ? "border-destructive/20 text-destructive group-hover:bg-destructive group-hover:text-white"
                : "border-primary/15 text-primary group-hover:bg-primary group-hover:text-white",
              featured ? "h-11 w-11 sm:h-12 sm:w-12" : dense ? "h-7 w-7 rounded-lg" : "h-8 w-8 rounded-lg",
            )}
          >
            <MapPin className={featured ? "h-5 w-5" : "h-3.5 w-3.5"} />
          </span>
          <span className="min-w-0 flex-1 overflow-hidden">
            <span
              className={cn(
                "block font-semibold tracking-[0.14em] uppercase",
                featured ? "text-[10px] sm:text-[11px]" : "text-[9px] sm:text-[10px]",
                isEmergency ? "text-destructive" : "text-primary",
              )}
            >
              {activeTab === "parcel" ? "Delivery" : "Dropoff"}
            </span>
            <span
              className={cn(
                "mt-0.5 block break-words [overflow-wrap:anywhere] line-clamp-2",
                featured
                  ? "text-[15px] leading-snug sm:text-base"
                  : dense
                    ? "text-[13px] leading-snug sm:text-sm"
                    : "text-[13px] leading-snug sm:text-base",
                dropoff ? "font-semibold text-primary" : "text-[#5a6330]",
              )}
              title={dropoff || undefined}
            >
              {dropoff || dropoffEmptyLabel}
            </span>
          </span>
        </button>

        <span
          className={cn(
            "bw-cta-glow bw-cta-glow--block mt-auto w-full shrink-0",
            featured && "mt-1 sm:mt-2",
            isEmergency && "bw-cta-glow--outline",
          )}
        >
          {!isEmergency && !reduceMotion ? (
            <span aria-hidden className="bw-cta-glow__aura" />
          ) : null}
          <Button
            type="submit"
            className={cn(
              "bw-cta-glow__btn bw-cta-glow__btn--soft w-full font-semibold tracking-wide",
              featured
                ? "min-h-[3.25rem] rounded-2xl text-base sm:min-h-[3.5rem] sm:text-lg"
                : dense
                  ? "h-11 text-sm sm:h-11"
                  : "h-11 text-sm sm:h-12 sm:text-base",
              isEmergency
                ? "bg-destructive shadow-[0_10px_28px_-10px_rgba(220,38,38,0.55)] hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {!isEmergency && !reduceMotion ? (
              <span aria-hidden className="bw-cta-glow__shine" />
            ) : null}
            <span className="bw-cta-glow__label gap-2">
              {ctaLabel}
              <span aria-hidden>→</span>
            </span>
          </Button>
        </span>
      </form>
    </div>
  );
}
