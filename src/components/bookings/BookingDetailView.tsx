"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CalendarClock,
  Clock3,
  Loader2,
  MapPin,
  Navigation2,
} from "lucide-react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  buildBookingDetailUrl,
  buildTrackingUrl,
  formatFare,
  isRideVehicleId,
  mapEmbedUrl,
} from "@/lib/ride-booking";
import {
  getRide,
  isDriverAssigned,
  isRideInProgress,
  type Ride,
} from "@/lib/ride-api";
import { formatScheduleLabel } from "@/lib/schedule-api";
import { displayVehicleName } from "@/lib/vehicle-map";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";
import { ViewBookingsButton } from "@/components/bookings/ViewBookingsButton";

function formatDetailStatus(ride: Ride) {
  const upper = ride.status.toUpperCase();
  if (upper === "CANCELLED" || upper === "CANCELED") return "Cancelled";
  if (upper === "COMPLETED") return "Completed";
  if (ride.scheduled_at || upper.includes("SCHEDULE")) return "Scheduled";
  if (
    ["SEARCHING", "REQUESTED", "PENDING"].includes(upper)
  ) {
    return "Finding captain";
  }
  if (isDriverAssigned(ride.status)) return "Captain assigned";
  if (isRideInProgress(ride.status)) return "In progress";
  return ride.status.replace(/_/g, " ");
}

function statusTone(status: string) {
  if (status === "Cancelled") return "bg-destructive/10 text-destructive";
  if (status === "Completed") return "bg-emerald-500/10 text-emerald-700";
  if (status === "Scheduled") return "bg-[#f4f9e4] text-[#B8D926]";
  if (status === "Finding captain") return "bg-secondary/15 text-primary";
  if (status === "Captain assigned" || status === "In progress") {
    return "bg-secondary/20 text-secondary";
  }
  return "bg-muted text-muted-foreground";
}

export function BookingDetailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rideId = searchParams.get("id") || "";
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const flag = searchParams.get("toast");
    if (flag === "scheduled") {
      setToast(
        "Ride scheduled successfully. A driver will be assigned before your trip.",
      );
      const t = window.setTimeout(() => setToast(null), 4500);
      if (rideId) {
        router.replace(buildBookingDetailUrl(rideId), { scroll: false });
      }
      return () => window.clearTimeout(t);
    }
    if (flag === "booked") {
      setToast(
        "Ride booked successfully. A driver will be assigned before your trip.",
      );
      const t = window.setTimeout(() => setToast(null), 4500);
      if (rideId) {
        router.replace(buildBookingDetailUrl(rideId), { scroll: false });
      }
      return () => window.clearTimeout(t);
    }
  }, [searchParams, router, rideId]);

  useEffect(() => {
    if (!rideId) {
      router.replace(ROUTES.bookings);
      return;
    }
    let cancelled = false;
    void getRide(rideId)
      .then((data) => {
        if (!cancelled) setRide(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load booking");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rideId, router]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[60dvh] items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#B8D926]" />
        </div>
      </AppShell>
    );
  }

  if (!ride) {
    return (
      <AppShell>
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-4">
          <p className="text-sm text-destructive">{error || "Booking not found"}</p>
          <ViewBookingsButton label="Back to bookings" onClick={() => router.push(ROUTES.bookings)} />
        </div>
      </AppShell>
    );
  }

  const statusLabel = formatDetailStatus(ride);
  const isScheduled = Boolean(ride.scheduled_at) || statusLabel === "Scheduled";
  const whenLabel = ride.scheduled_at
    ? formatScheduleLabel(ride.scheduled_at, "")
    : new Date(ride.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
  const vehicleName = displayVehicleName(ride.vehicle_type_name);
  const canTrack =
    isRideInProgress(ride.status) || isDriverAssigned(ride.status);
  const mapSrc = mapEmbedUrl(
    ride.pickup_lat ?? undefined,
    ride.pickup_lng ?? undefined,
    ride.dropoff_lat ?? undefined,
    ride.dropoff_lng ?? undefined,
  );

  return (
    <AppShell>
      <header className="sticky top-0 z-40 border-b border-[#e8f0c8] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.push(ROUTES.bookings)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8f0c8] bg-white text-[#38471B] transition hover:border-[#B8D926]/50 hover:bg-[#f7fbe8]"
            aria-label="Back to bookings"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#B8D926] uppercase">
              Trip
            </p>
            <h1 className="font-heading text-lg font-semibold tracking-tight text-[#38471B] sm:text-xl">
              Booking details
            </h1>
            {isScheduled ? (
              <p className="text-xs font-medium text-[#7a8448]">
                Scheduled ride
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
        <Stagger className="space-y-4">
          <StaggerItem index={0}>
            <div className="rounded-2xl border border-[#eef5d4] bg-white p-4 shadow-[0_10px_28px_-22px_rgba(40,54,20,0.35)] sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8448]">
                    Status
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide",
                      statusTone(statusLabel),
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="font-heading text-2xl font-bold text-[#38471B]">
                  {formatFare(ride.fare_final ?? ride.fare_estimate ?? 0)}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#5a6330]">
                <span className="inline-flex items-center gap-1.5">
                  {isScheduled ? (
                    <CalendarClock className="h-4 w-4 text-primary/80" />
                  ) : (
                    <Clock3 className="h-4 w-4 text-primary/80" />
                  )}
                  {whenLabel}
                </span>
                {vehicleName ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Bike className="h-4 w-4 text-primary/80" />
                    {vehicleName}
                  </span>
                ) : null}
              </div>

              {isScheduled ? (
                <p className="mt-3 text-sm leading-relaxed text-[#4a5228]">
                  Your ride is scheduled. A driver will be assigned before your
                  trip starts.
                </p>
              ) : null}

              {ride.public_id ? (
                <p className="mt-2 text-xs text-[#7a8448]">
                  Booking ID: {ride.public_id}
                </p>
              ) : null}
            </div>
          </StaggerItem>

          <StaggerItem index={1}>
            <div className="overflow-hidden rounded-2xl border border-[#eef5d4] bg-white shadow-[0_10px_28px_-22px_rgba(40,54,20,0.35)]">
              <div className="border-b border-[#eef5d4] px-4 py-3 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8448]">
                  Route
                </p>
              </div>
              <div className="space-y-4 px-4 py-4 sm:px-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-700">
                      Pickup
                    </p>
                    <p className="text-sm leading-relaxed text-[#38471B]">
                      {ride.pickup_address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Navigation2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B8D926]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#B8D926]">
                      Drop-off
                    </p>
                    <p className="text-sm leading-relaxed text-[#38471B]">
                      {ride.dropoff_address}
                    </p>
                  </div>
                </div>
              </div>
              {mapSrc ? (
                <iframe
                  key={mapSrc}
                  src={mapSrc}
                  className="h-[180px] w-full border-0 sm:h-[220px]"
                  allowFullScreen={false}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Booking route map"
                />
              ) : null}
            </div>
          </StaggerItem>

          <StaggerItem index={2}>
            <div className="rounded-2xl border border-[#eef5d4] bg-[#ffffff] p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ride.payment_method ? (
                  <div>
                    <p className="text-xs font-semibold text-[#7a8448]">
                      Payment
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#38471B]">
                      {ride.payment_method}
                    </p>
                  </div>
                ) : null}
                {ride.estimated_duration_min != null ? (
                  <div>
                    <p className="text-xs font-semibold text-[#7a8448]">
                      Estimated duration
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#38471B]">
                      {ride.estimated_duration_min} min
                    </p>
                  </div>
                ) : null}
                {ride.driver?.name ? (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-[#7a8448]">
                      Captain
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#38471B]">
                      {ride.driver.name}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </StaggerItem>
        </Stagger>

        <AnimateIn delay={0.12} className="mt-5">
          <div className="space-y-2.5 rounded-2xl border border-[#e8f0c8] bg-white p-3 shadow-[0_12px_32px_-22px_rgba(56,71,27,0.22)] sm:p-3.5">
            {canTrack ? (
              <Button
                className={cn(
                  "h-12 w-full rounded-2xl text-sm sm:h-[3.25rem] sm:text-[15px]",
                  BRAND_CTA_LIME,
                )}
                onClick={() =>
                  router.push(
                    buildTrackingUrl(
                      ride.pickup_address,
                      ride.dropoff_address,
                      isRideVehicleId(null) ? "bike" : "bike",
                      "rides",
                      ride.id,
                    ),
                  )
                }
              >
                <span className="flex w-full items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#38471B]/12 sm:h-9 sm:w-9">
                    <Navigation2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left font-semibold tracking-wide">
                    Open live tracking
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#38471B]/10 sm:h-9 sm:w-9">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </Button>
            ) : null}
            <ViewBookingsButton
              variant={canTrack ? "soft" : "default"}
              onClick={() => router.push(ROUTES.bookings)}
            />
          </div>
        </AnimateIn>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 lg:bottom-8">
          <div className="pointer-events-auto max-w-md rounded-2xl bg-[#8FA618] px-4 py-3 text-center text-sm font-medium leading-snug text-white shadow-[0_18px_40px_-16px_rgba(40,54,20,0.65)]">
            {toast}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
