"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import {
  Calendar,
  Clock3,
  MapPin,
  Navigation2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import {
  landingBookingTabs,
  type LandingBookingTab,
} from "@/constants/services";
import {
  combineDateAndTime,
  formatScheduleLabel,
} from "@/lib/schedule-api";
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
    photo: "/images/services/parcel.webp",
    photoAlt: "Parcel",
    hint: "Same-city deliveries with live tracking",
  },
  ambulance: {
    photo: "/images/services/ambulance.webp",
    photoAlt: "Emergency",
    hint: "Verified medical transport, 24×7",
  },
};

function TabPhoto({
  src,
  alt,
  active,
  className,
}: {
  src: string;
  alt: string;
  active: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative h-7 w-7 shrink-0 overflow-hidden rounded-md ring-1 sm:h-8 sm:w-8",
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

function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function defaultScheduleDate() {
  const next = new Date();
  next.setMinutes(next.getMinutes() + 20);
  return next;
}

function parseScheduledParts(iso: string | null | undefined) {
  const base = iso ? new Date(iso) : defaultScheduleDate();
  const safe = Number.isNaN(base.getTime()) ? defaultScheduleDate() : base;
  return {
    date: toDateInputValue(safe),
    time: toTimeInputValue(safe),
    iso: safe.toISOString(),
  };
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
  schedulePreviewLabel,
  isSubmitting = false,
}: LandingBookingWidgetProps) {
  const reduceMotion = useReducedMotion();
  const meta = tabMeta[activeTab];
  const isEmergency = activeTab === "ambulance";
  const isFloating = layout === "floating";
  const showSchedule = !isEmergency && Boolean(onScheduledAtChange);

  const initialParts = useMemo(
    () => parseScheduledParts(scheduledAt),
    [scheduledAt],
  );
  const [dateValue, setDateValue] = useState(initialParts.date);
  const [timeValue, setTimeValue] = useState(initialParts.time);

  useEffect(() => {
    const parts = parseScheduledParts(scheduledAt);
    setDateValue(parts.date);
    setTimeValue(parts.time);
  }, [scheduledAt]);

  const emitSchedule = (date: string, time: string) => {
    if (!onScheduledAtChange) return;
    const [y, mo, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    if (!y || !mo || !d || Number.isNaN(h) || Number.isNaN(mi)) return;
    const combined = combineDateAndTime(new Date(y, mo - 1, d), h, mi);
    onScheduledAtChange(combined.toISOString());
  };

  const handleDateChange = (value: string) => {
    setDateValue(value);
    emitSchedule(value, timeValue);
  };

  const handleTimeChange = (value: string) => {
    setTimeValue(value);
    emitSchedule(dateValue, value);
  };

  const scheduleSummary = scheduledAt
    ? formatScheduleLabel(scheduledAt, "Leave now")
    : "Leave now";

  return (
    <div
      id="book"
      className={cn(
        "scroll-mt-28 flex w-full min-w-0 max-w-full flex-col overflow-hidden bg-white",
        isFloating
          ? "rounded-2xl border border-[#e8eed8] p-3.5 shadow-[0_22px_56px_-24px_rgba(17,20,17,0.26)] sm:rounded-[1.25rem] sm:p-4 md:p-5 lg:mx-auto lg:max-w-4xl"
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
          <>
            <label className="flex w-full min-w-0 flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-[#5a7a12] uppercase sm:text-[11px]">
                Date
              </span>
              <span className="flex items-center gap-2.5 rounded-xl border border-[#e8eed8] bg-[#f8faf2] px-3 py-2.5 sm:px-3.5 sm:py-3">
                <Calendar className="h-4 w-4 shrink-0 text-[#5a7a12]" />
                <input
                  type="date"
                  value={dateValue}
                  min={toDateInputValue(new Date())}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111411] outline-none sm:text-[15px]"
                  aria-label="Ride date"
                />
              </span>
            </label>

            <label className="flex w-full min-w-0 flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-[#5a7a12] uppercase sm:text-[11px]">
                Time
              </span>
              <span className="flex items-center gap-2.5 rounded-xl border border-[#e8eed8] bg-[#f8faf2] px-3 py-2.5 sm:px-3.5 sm:py-3">
                <Clock3 className="h-4 w-4 shrink-0 text-[#5a7a12]" />
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111411] outline-none sm:text-[15px]"
                  aria-label="Ride time"
                />
              </span>
            </label>
          </>
        ) : null}

        {schedulePreviewLabel ? (
          <p className="text-center text-[11px] font-medium text-[#5a6330] sm:col-span-2 sm:text-xs">
            {schedulePreviewLabel}
          </p>
        ) : showSchedule ? (
          <p className="text-center text-[11px] font-medium text-[#5a6330] sm:col-span-2 sm:text-xs">
            {scheduleSummary}
          </p>
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
  );
}
