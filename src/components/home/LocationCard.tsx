"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  ChevronRight,
  Clock3,
  MapPin,
  Navigation2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhenToGoDialog } from "@/components/home/WhenToGoDialog";
import {
  buildLocationSearchUrl,
  type LocationCoords,
  type LocationFieldType,
} from "@/lib/location-search";
import { buildBookUrl } from "@/lib/ride-booking";
import {
  normalizeScheduledAt,
  patchLandingBookingSchedule,
} from "@/lib/landing-booking-draft";
import {
  fetchSchedulePreview,
  formatScheduleLabel,
  type SchedulePreview,
} from "@/lib/schedule-api";
import { canAddStop, MAX_STOPS, type TripStop } from "@/lib/trip-stops";
import { ROUTES } from "@/constants/routes";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";
import { useActiveRideGuard } from "@/hooks/useActiveRideGuard";

export type LocationCardMode = "ride" | "parcel" | "ambulance";

interface LocationCardProps {
  pickup: string;
  dropoff: string;
  onSwap: () => void;
  returnTo?: string;
  coords?: LocationCoords;
  stops?: TripStop[];
  onRemoveStop?: (index: number) => void;
  mode?: LocationCardMode;
  showSchedule?: boolean;
  compact?: boolean;
  className?: string;
  scheduledAt?: string | null;
  onScheduledAtChange?: (iso: string | null) => void;
}

export function LocationCard({
  pickup,
  dropoff,
  onSwap,
  returnTo = ROUTES.home,
  coords,
  stops = [],
  onRemoveStop,
  mode = "ride",
  showSchedule = true,
  compact = false,
  className,
  scheduledAt: scheduledAtProp,
  onScheduledAtChange,
}: LocationCardProps) {
  const router = useRouter();
  const { guardBooking, blockDialog } = useActiveRideGuard();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [localScheduledAt, setLocalScheduledAt] = useState<string | null>(
    scheduledAtProp ?? null,
  );
  const [preview, setPreview] = useState<SchedulePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (scheduledAtProp !== undefined) {
      setLocalScheduledAt(scheduledAtProp);
    }
  }, [scheduledAtProp]);

  const scheduledAt = localScheduledAt;
  const filled = stops.filter((s) => s.label.trim());
  const ready = Boolean(pickup && dropoff);
  const isParcel = mode === "parcel";
  const isAmbulance = mode === "ambulance";
  const bookTab = isAmbulance ? "ambulance" : isParcel ? "parcel" : "rides";

  const setScheduledAt = (iso: string | null) => {
    const next = normalizeScheduledAt(iso);
    setLocalScheduledAt(next);
    patchLandingBookingSchedule(next);
    onScheduledAtChange?.(next);
  };

  const withScheduleReturnTo = () => {
    try {
      const url = new URL(returnTo, "http://local.invalid");
      if (scheduledAt) url.searchParams.set("scheduled_at", scheduledAt);
      else url.searchParams.delete("scheduled_at");
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return returnTo;
    }
  };

  const openLocationSearch = (field: LocationFieldType, stopIndex?: number) => {
    router.push(
      buildLocationSearchUrl({
        field,
        returnTo: withScheduleReturnTo(),
        pickup,
        dropoff,
        coords,
        stops,
        stopIndex,
        tab: bookTab,
      }),
    );
  };

  const navigateToBook = (scheduledAtValue?: string) => {
    router.push(
      buildBookUrl(pickup, dropoff, bookTab, undefined, {
        pickupLat: coords?.pickupLat,
        pickupLng: coords?.pickupLng,
        dropoffLat: coords?.dropoffLat,
        dropoffLng: coords?.dropoffLng,
        stops: isParcel || isAmbulance ? undefined : filled,
        scheduledAt: scheduledAtValue || scheduledAt || undefined,
      }),
    );
  };

  const handleFindRide = () => {
    if (!pickup || !dropoff) {
      openLocationSearch(!pickup ? "pickup" : "dropoff");
      return;
    }
    void guardBooking(() => navigateToBook());
  };

  const handleScheduleConfirm = async (iso: string) => {
    setConfirming(true);
    setPreviewError(null);
    try {
      const result = await fetchSchedulePreview({
        scheduledAt: iso,
        coords,
        stops: isParcel || isAmbulance ? undefined : filled,
        serviceGroup: "ride",
      });
      setPreview(result);
      setScheduledAt(iso);
      setScheduleOpen(false);

      if (pickup && dropoff) {
        void guardBooking(() => navigateToBook(iso));
        return;
      }

      if (!dropoff) {
        router.push(
          buildLocationSearchUrl({
            field: "dropoff",
            returnTo: (() => {
              try {
                const url = new URL(returnTo, "http://local.invalid");
                url.searchParams.set("scheduled_at", iso);
                return `${url.pathname}${url.search}${url.hash}`;
              } catch {
                return returnTo;
              }
            })(),
            pickup,
            dropoff,
            coords,
            stops,
            tab: bookTab,
          }),
        );
        return;
      }
      if (!pickup) {
        openLocationSearch("pickup");
      }
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Could not load schedule options",
      );
      setScheduledAt(iso);
      setScheduleOpen(false);
      if (pickup && dropoff) {
        void guardBooking(() => navigateToBook(iso));
        return;
      }
      if (!dropoff) {
        router.push(
          buildLocationSearchUrl({
            field: "dropoff",
            returnTo: `${ROUTES.home}?scheduled_at=${encodeURIComponent(iso)}`,
            pickup,
            dropoff,
            coords,
            stops,
            tab: bookTab,
          }),
        );
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-[0_28px_64px_-28px_rgba(32,42,16,0.55)] backdrop-blur-md sm:rounded-[1.5rem]",
          className,
        )}
      >
        {!compact ? (
          <div className="relative overflow-hidden border-b border-white/20 bg-gradient-to-r from-[#38471B] via-[#B8D926] to-[#C8E84A] px-4 py-4 sm:px-5 sm:py-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_100%_0%,rgba(255,255,255,0.18),transparent_55%)]"
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-white/75 uppercase">
                  {isAmbulance
                    ? "Emergency transport"
                    : isParcel
                      ? "Send a parcel"
                      : "Plan your trip"}
                </p>
                <p className="mt-1 font-heading text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {isAmbulance
                    ? "Where should we take the patient?"
                    : isParcel
                      ? "Where should we deliver?"
                      : "Where shall we take you?"}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
                  ready
                    ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                    : "border-white/25 bg-white/10 text-white/80",
                )}
              >
                {ready ? "Ready" : "Set route"}
              </span>
            </div>
          </div>
        ) : null}

        <div className="p-4 sm:p-5">
          <div className="relative flex flex-col gap-2.5 sm:gap-3">
            <div
              aria-hidden
              className="absolute top-12 bottom-12 left-[1.35rem] w-px border-l border-dashed border-primary/25"
            />

            <LocationField
              tone="pickup"
              label="Pickup"
              value={pickup}
              placeholder="Current location"
              icon={
                <Navigation2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              }
              onClick={() => openLocationSearch("pickup")}
            />

            {!isParcel && !isAmbulance
              ? filled.map((stop, index) => (
                  <div
                    key={`stop-${index}-${stop.label}`}
                    className="relative flex items-stretch gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => openLocationSearch("stop", index)}
                      className="flex min-w-0 flex-1 items-start gap-3 rounded-2xl border border-border/80 bg-muted/30 px-3.5 py-3 text-left transition-all duration-150 hover:border-primary/35 hover:bg-white sm:px-4 sm:py-3.5"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
                          Stop {index + 1}
                        </span>
                        <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                          {stop.label}
                        </span>
                      </span>
                    </button>
                    {onRemoveStop ? (
                      <button
                        type="button"
                        onClick={() => onRemoveStop(index)}
                        className="flex h-auto w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 text-primary transition-colors duration-150 hover:border-primary/35 hover:bg-primary/5"
                        aria-label={`Remove stop ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))
              : null}

            <LocationField
              tone="drop"
              label={isAmbulance ? "Hospital" : isParcel ? "Delivery" : "Drop"}
              value={dropoff}
              placeholder={
                isAmbulance
                  ? "Hospital or destination"
                  : isParcel
                    ? "Delivery address"
                    : "Where are you going?"
              }
              icon={<MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
              onClick={() => openLocationSearch("dropoff")}
              className="pr-12"
            />

            <button
              type="button"
              onClick={onSwap}
              className="absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-all duration-150 hover:brightness-110 active:scale-95 sm:right-3"
              aria-label="Swap pickup and drop"
            >
              <ArrowDownUp className="h-4 w-4" />
            </button>
          </div>

          {!isParcel && !isAmbulance ? (
            canAddStop(filled) ? (
              <button
                type="button"
                onClick={() => openLocationSearch("stop", filled.length)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] px-3 py-2.5 text-sm font-semibold text-primary transition-colors duration-150 hover:border-primary/50 hover:bg-primary/[0.06]"
              >
                <Plus className="h-4 w-4" />
                Add stop ({filled.length}/{MAX_STOPS})
              </button>
            ) : (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Maximum {MAX_STOPS} stops added
              </p>
            )
          ) : null}

          {showSchedule && !isAmbulance ? (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-[#e8eed8] bg-[#f8faf2] px-3.5 py-3 text-left transition-colors hover:border-[#C6E31A]/55 hover:bg-white active:scale-[0.99] sm:px-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C6E31A] text-[#111411]">
                <Clock3 className="h-4 w-4" strokeWidth={1.85} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold tracking-[0.14em] text-[#5a7a12] uppercase">
                  {scheduledAt ? "Reschedule" : "When to go"}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-[#111411]">
                  {formatScheduleLabel(scheduledAt)}
                </span>
                {preview && scheduledAt ? (
                  <span className="mt-1 block text-[11px] font-medium text-[#5a6330]">
                    {preview.nearbyDriversCount != null
                      ? `${preview.nearbyDriversCount} captains nearby`
                      : preview.vehicleCount != null
                        ? `${preview.vehicleCount} vehicle options`
                        : "Schedule ready"}
                    {preview.sampleFareMin != null
                      ? ` · from ₹${Math.round(preview.sampleFareMin)}`
                      : ""}
                  </span>
                ) : null}
                {previewError ? (
                  <span className="mt-1 block text-[11px] text-amber-700">
                    {previewError}
                  </span>
                ) : null}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-primary/45"
                aria-hidden
              />
            </button>
          ) : null}

          <div className="mt-4">
            <span className="bw-cta-glow bw-cta-glow--block block w-full">
              <span aria-hidden className="bw-cta-glow__aura" />
              <Button
                type="button"
                onClick={handleFindRide}
                className={cn(
                  "bw-cta-glow__btn bw-cta-glow__btn--soft h-12 w-full rounded-2xl text-sm tracking-wide sm:h-[3.25rem] sm:text-base",
                  BRAND_CTA_LIME,
                )}
              >
                <span aria-hidden className="bw-cta-glow__shine" />
                <span className="bw-cta-glow__label gap-2">
                  {ready
                    ? isAmbulance
                      ? "Book ambulance for free"
                      : isParcel
                        ? "Send parcel"
                        : scheduledAt
                          ? "Schedule ride"
                          : "Find a ride"
                    : "Set locations"}
                  <span aria-hidden>→</span>
                </span>
              </Button>
            </span>
          </div>
        </div>
      </div>

      <WhenToGoDialog
        open={scheduleOpen}
        initialIso={scheduledAt}
        confirming={confirming}
        onCancel={() => setScheduleOpen(false)}
        onLeaveNow={() => {
          setScheduledAt(null);
          setPreview(null);
          setPreviewError(null);
          setScheduleOpen(false);
        }}
        onConfirm={handleScheduleConfirm}
      />

      {blockDialog}
    </>
  );
}

function LocationField({
  tone,
  label,
  value,
  placeholder,
  icon,
  onClick,
  className,
}: {
  tone: "pickup" | "drop";
  label: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  const isPickup = tone === "pickup";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-all duration-150 sm:px-4 sm:py-4",
        "border-border/80 bg-white hover:border-primary/35 hover:shadow-[0_12px_28px_-18px_rgba(184,217,38,0.35)]",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors duration-150",
          isPickup
            ? "border-secondary/30 bg-secondary/10 text-secondary group-hover:border-secondary group-hover:bg-secondary group-hover:text-white"
            : "border-primary/30 bg-primary/10 text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-white",
        )}
      >
        <span className="transition-colors duration-150 group-hover:text-white [&>svg]:text-current">
          {icon}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[10px] font-semibold tracking-[0.14em] uppercase",
            isPickup ? "text-secondary" : "text-primary",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-sm leading-snug sm:text-[15px]",
            value ? "font-semibold text-foreground" : "text-muted-foreground",
          )}
        >
          {value || placeholder}
        </span>
      </span>
    </button>
  );
}
