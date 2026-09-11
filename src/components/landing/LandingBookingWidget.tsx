"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import {
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  Navigation2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WhenToGoDialog } from "@/components/home/WhenToGoDialog";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import {
  landingBookingTabs,
  type LandingBookingTab,
} from "@/constants/services";
import { formatScheduleLabel } from "@/lib/schedule-api";
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
    photo: "/images/services/car.webp",
    photoAlt: "Rides",
    hint: "Bike, auto & cab — matched in seconds",
  },
  parcel: {
    photo: "/images/services/parcel.png",
    photoAlt: "Parcel",
    hint: "Same-city deliveries with live tracking",
  },
  ambulance: {
    photo: "/images/services/ambulance-cutout.png",
    photoAlt: "Emergency",
    hint: "Verified medical transport, 24×7",
  },
};

function TabPhoto({
  src,
  alt,
  active,
  emergency = false,
  className,
}: {
  src: string;
  alt: string;
  active: boolean;
  emergency?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md sm:h-8 sm:w-8",
        emergency
          ? "bg-transparent ring-0"
          : cn("ring-1", active ? "ring-white/70 bg-white/10" : "ring-black/10 bg-white/5"),
        className,
      )}
    >
      <ResilientImage
        src={src}
        alt=""
        fill
        sizes="36px"
        className={cn(
          emergency ? "object-contain p-0.5" : "object-cover",
        )}
        aria-hidden
        fallbackSrc={
          emergency
            ? "/images/services/ambulance-cutout.png"
            : BRAND_PHOTOS.streetCab
        }
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
  /** Marlin-style floating card with 2×2 fields */
  layout?: "floating" | "stacked";
  scheduledAt?: string | null;
  onScheduledAtChange?: (iso: string | null) => void;
  /** Called after user picks a schedule — parent fetches backend preview. */
  onScheduleConfirm?: (iso: string) => void | Promise<void>;
  schedulePreviewLabel?: string | null;
  isSubmitting?: boolean;
}

function LocationFieldButton({
  label,
  value,
  placeholder,
  icon: Icon,
  onClick,
  emergency = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: typeof MapPin;
  onClick: () => void;
  emergency?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full min-w-0 items-start gap-2.5 rounded-xl border border-[#e8eed8] bg-[#f8faf2] px-3 py-2.5 text-left transition-colors hover:border-[#C6E31A]/55 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E31A]/30 sm:gap-3 sm:px-3.5 sm:py-3"
    >
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white",
          emergency
            ? "border-destructive/20 text-destructive"
            : "border-[#dce8a8] text-[#5a7a12]",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[10px] font-semibold tracking-[0.14em] uppercase sm:text-[11px]",
            emergency ? "text-destructive" : "text-[#5a7a12]",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "mt-0.5 block line-clamp-2 break-words text-sm leading-snug sm:text-[15px]",
            value ? "font-semibold text-[#111411]" : "text-[#5a6330]",
          )}
          title={value || undefined}
        >
          {value || placeholder}
        </span>
      </span>
    </button>
  );
}

/** Pickup / dropoff booking card — floating layout matches Marlin overlap hero. */
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
  layout = "floating",
  scheduledAt,
  onScheduledAtChange,
  onScheduleConfirm,
  schedulePreviewLabel,
  isSubmitting = false,
}: LandingBookingWidgetProps) {
  const reduceMotion = useReducedMotion();
  const meta = tabMeta[activeTab];
  const isEmergency = activeTab === "ambulance";
  const isFloating = layout === "floating";
  const showSchedule = !isEmergency && Boolean(onScheduledAtChange);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [confirmingSchedule, setConfirmingSchedule] = useState(false);

  const hasSchedule = Boolean(scheduledAt);
  const scheduleSummary = formatScheduleLabel(scheduledAt, "Leave now");

  const handleScheduleConfirm = async (iso: string) => {
    setConfirmingSchedule(true);
    try {
      onScheduledAtChange?.(iso);
      if (onScheduleConfirm) {
        await onScheduleConfirm(iso);
      }
      setScheduleOpen(false);
    } finally {
      setConfirmingSchedule(false);
    }
  };

  const handleLeaveNow = () => {
    onScheduledAtChange?.(null);
    setScheduleOpen(false);
  };

  return (
    <>
      <div
        id="book"
        className={cn(
          "scroll-mt-28 flex w-full min-w-0 max-w-full flex-col overflow-hidden bg-white",
          isFloating
            ? "mx-auto rounded-2xl border border-[#e8eed8] p-3.5 shadow-[0_22px_56px_-24px_rgba(17,20,17,0.26)] sm:rounded-[1.25rem] sm:p-4 md:p-5"
            : "rounded-2xl border border-[#D4D8D0] p-3 shadow-[0_28px_64px_-24px_rgba(17,20,17,0.28)] sm:p-4",
          className,
        )}
      >
        {isFloating ? (
          <div className="mb-3 min-w-0 sm:mb-3.5">
            <h2 className="font-heading text-lg font-bold tracking-tight text-[#111411] sm:text-xl md:text-2xl">
              Book your ride
            </h2>
            <p className="mt-1 text-sm text-[#5A6158] sm:text-[15px]">
              Enter pickup & drop — see prices in seconds.
            </p>
          </div>
        ) : null}

        <div
          className="relative flex w-full min-w-0 shrink-0 gap-1 rounded-xl bg-[#111411] p-1 sm:gap-1.5 sm:p-1.5"
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
                  "relative z-10 flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-2.5 text-[11px] font-semibold transition-all duration-200 sm:gap-2 sm:px-3 sm:py-3 sm:text-xs md:text-sm",
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
                  emergency={emergency}
                  className="hidden min-[360px]:block"
                />
                <span
                  className={cn(
                    "truncate leading-tight",
                    emergency && !isActive && "text-[#fca5a5]",
                    emergency && isActive && "text-white",
                  )}
                >
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
            className="mt-2.5 flex min-w-0 items-center justify-center gap-2 px-2 text-center text-xs font-medium text-[#5A6158] sm:mt-3 sm:text-sm"
          >
            <TabPhoto src={meta.photo} alt="" active />
            <span className="min-w-0 truncate">{meta.hint}</span>
          </motion.p>
        </AnimatePresence>

        <form
          onSubmit={onSubmit}
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-3 pt-3 sm:gap-4 sm:pt-4",
            isFloating && "sm:grid sm:grid-cols-2",
          )}
        >
          <LocationFieldButton
            label="Pickup"
            value={pickup}
            placeholder="Enter your location"
            icon={Navigation2}
            onClick={() => onOpenLocation("pickup")}
          />

          <LocationFieldButton
            label={activeTab === "parcel" ? "Delivery" : "Drop-off"}
            value={dropoff}
            placeholder={dropoffEmptyLabel || "Enter your location"}
            icon={MapPin}
            onClick={() => onOpenLocation("dropoff")}
            emergency={isEmergency}
          />

          {showSchedule ? (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="flex w-full min-w-0 items-center gap-2.5 rounded-xl border border-[#e8eed8] bg-[#f8faf2] px-3 py-2.5 text-left transition-colors hover:border-[#C6E31A]/55 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E31A]/30 active:scale-[0.99] sm:col-span-2 sm:gap-3 sm:px-3.5 sm:py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C6E31A] text-[#111411] sm:h-10 sm:w-10">
                {confirmingSchedule ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock3 className="h-4 w-4" strokeWidth={1.85} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#5a7a12] sm:text-[11px]">
                  {hasSchedule ? "Reschedule" : "When to go"}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-[#111411] sm:text-[15px]">
                  {scheduleSummary}
                </span>
                {schedulePreviewLabel ? (
                  <span className="mt-1 block text-[11px] font-medium text-[#5a6330] sm:text-xs">
                    {schedulePreviewLabel}
                  </span>
                ) : null}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[#5a7a12]/55"
                aria-hidden
              />
            </button>
          ) : null}

          <span
            className={cn(
              "bw-cta-glow bw-cta-glow--block w-full shrink-0 sm:col-span-2",
              isEmergency && "bw-cta-glow--outline",
            )}
          >
            {!isEmergency && !reduceMotion ? (
              <span aria-hidden className="bw-cta-glow__aura" />
            ) : null}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "bw-cta-glow__btn bw-cta-glow__btn--soft w-full font-semibold tracking-wide",
                "min-h-[3.25rem] rounded-2xl text-base sm:min-h-[3.5rem] sm:text-lg",
                isEmergency
                  ? "bg-destructive shadow-[0_10px_28px_-10px_rgba(220,38,38,0.55)] hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {!isEmergency && !reduceMotion ? (
                <span aria-hidden className="bw-cta-glow__shine" />
              ) : null}
              <span className="bw-cta-glow__label gap-2">
                {isSubmitting ? "Loading…" : ctaLabel}
                {!isSubmitting ? <span aria-hidden>→</span> : null}
              </span>
            </Button>
          </span>
        </form>
      </div>

      {showSchedule ? (
        <WhenToGoDialog
          open={scheduleOpen}
          initialIso={scheduledAt}
          confirming={confirmingSchedule}
          onCancel={() => setScheduleOpen(false)}
          onConfirm={(iso) => {
            void handleScheduleConfirm(iso);
          }}
          onLeaveNow={handleLeaveNow}
        />
      ) : null}
    </>
  );
}
