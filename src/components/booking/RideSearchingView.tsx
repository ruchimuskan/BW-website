"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { AnimateIn } from "@/components/motion";
import { CancelRideSheet } from "@/components/booking/CancelRideSheet";
import { CaptainNotAssignedDialog } from "@/components/booking/CaptainNotAssignedDialog";
import { WomenRidersUnavailableDialog } from "@/components/booking/WomenRidersUnavailableDialog";
import { ServiceImage } from "@/components/home/ServiceImage";
import { Button } from "@/components/ui/button";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { ROUTES } from "@/constants/routes";
import { RIDE_VEHICLE_OPTIONS } from "@/data/ride-options";
import { getBlockingActiveRide } from "@/lib/active-ride-guard";
import { useActiveRideGuard } from "@/hooks/useActiveRideGuard";
import { useNoCaptainAssignedPrompt } from "@/hooks/useNoCaptainAssignedPrompt";
import { ackNoCaptainPrompt } from "@/lib/no-captain-assigned";
import { saveLastBookedRide } from "@/lib/last-booked-ride";
import {
  bookRide,
  cancelRide,
  continueWithAllRiders,
  getActiveRide,
  getRide,
  isActiveRideBlockingError,
  isDriverAssigned,
  type PaymentMethod,
  type Ride,
} from "@/lib/ride-api";
import { getRideRealtimeClient } from "@/lib/ride-realtime";
import {
  buildBookUrl,
  buildBookingsListUrl,
  buildTrackingUrl,
  isRideVehicleId,
  parseTripCoords,
} from "@/lib/ride-booking";
import { getProtectedPath, isAuthenticated } from "@/lib/auth-session";
import { VEHICLE_TO_CATEGORY_SLUG } from "@/lib/vehicle-map";
import { getVehicleCategories } from "@/lib/home-api";

export function RideSearchingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { blockDialog, showBlockedRide, showBlockedNotice } = useActiveRideGuard();

  const pickup = searchParams.get("pickup") || "";
  const dropoff = searchParams.get("dropoff") || "";
  const tab = searchParams.get("tab") || "rides";
  const vehicleParam = searchParams.get("vehicle");
  const categoryIdParam = searchParams.get("categoryId");
  const preferWomenRiders = searchParams.get("preferWomen") === "1";
  const existingRideId = searchParams.get("rideId");
  const promoCode = searchParams.get("promo") || undefined;
  const scheduledAt = searchParams.get("scheduled_at") || undefined;
  const notes = searchParams.get("notes") || undefined;
  const tripCoords = parseTripCoords(searchParams);
  const vehicle = isRideVehicleId(vehicleParam) ? vehicleParam : "bike";
  const payment = (tripCoords.payment ?? "CASH") as PaymentMethod;

  const [progress, setProgress] = useState(10);
  const [status, setStatus] = useState(
    preferWomenRiders
      ? "Finding women captains nearby..."
      : "Finding nearby captains...",
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [preferenceLoading, setPreferenceLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [watchRides, setWatchRides] = useState<Ride[]>([]);
  const rideIdRef = useRef<string | null>(existingRideId);
  const bookingStarted = useRef(false);
  const pollTimer = useRef<number | null>(null);

  const vehicleOption = RIDE_VEHICLE_OPTIONS.find((v) => v.id === vehicle);
  const vehicleName = vehicleOption?.name ?? "Ride";
  const bookReturnUrl = buildBookUrl(pickup, dropoff, tab, vehicle, {
    pickupLat: tripCoords.pickupLat,
    pickupLng: tripCoords.pickupLng,
    dropoffLat: tripCoords.dropoffLat,
    dropoffLng: tripCoords.dropoffLng,
    distanceKm: tripCoords.distanceKm,
    durationMin: tripCoords.durationMin,
    payment,
    stops: tripCoords.stops,
    categoryId: categoryIdParam ?? undefined,
    promoCode,
    scheduledAt,
    notes,
  });

  const clearPoll = () => {
    if (pollTimer.current != null) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  const goToTracking = (rideId: string) => {
    clearPoll();
    setProgress(100);
    setStatus("Captain found!");
    router.push(buildTrackingUrl(pickup, dropoff, vehicle, tab, rideId));
  };

  const checkRideStatus = async () => {
    try {
      const id = rideIdRef.current;
      const live = id ? await getRide(id) : await getActiveRide();
      if (!live) return;
      if (rideIdRef.current && live.id !== rideIdRef.current) return;
      rideIdRef.current = live.id;
      saveLastBookedRide(live);
      setWatchRides([live]);
      if (isDriverAssigned(live.status)) {
        goToTracking(live.id);
      }
    } catch {
      // Keep polling; transient network errors are fine.
    }
  };

  const startPolling = (rideId?: string) => {
    clearPoll();
    pollTimer.current = window.setInterval(() => {
      void checkRideStatus();
    }, 2000);

    const id = rideId || rideIdRef.current;
    if (!id) return;
    const client = getRideRealtimeClient();
    client.connect();
    client.subscribeRide(id);
  };

  const { promptRide, dismissNoCaptainPrompt } = useNoCaptainAssignedPrompt(
    watchRides,
    (live) => {
      setWatchRides([live]);
      rideIdRef.current = live.id;
      if (isDriverAssigned(live.status)) {
        goToTracking(live.id);
      }
    },
  );

  useEffect(() => {
    if (!promptRide) return;
    clearPoll();
    setStatus("Captain is not assigned");
  }, [promptRide]);

  useEffect(() => {
    if (!isAuthenticated()) {
      const returnTo = scheduledAt
        ? bookReturnUrl
        : searchParams.toString()
          ? `${ROUTES.bookSearching}?${searchParams.toString()}`
          : ROUTES.bookSearching;
      router.replace(getProtectedPath(returnTo));
      return;
    }

    if (!pickup || !dropoff) {
      if (!existingRideId) {
        router.replace(ROUTES.home);
        return;
      }
    }

    if (bookingStarted.current) return;
    bookingStarted.current = true;

    async function startBooking() {
      try {
        if (existingRideId && !scheduledAt) {
          rideIdRef.current = existingRideId;
          setStatus("Searching for nearby captains...");
          setProgress(45);
          startPolling();
          await checkRideStatus();
          return;
        }

        if (
          tripCoords.pickupLat == null ||
          tripCoords.pickupLng == null ||
          tripCoords.dropoffLat == null ||
          tripCoords.dropoffLng == null
        ) {
          const missing = "Missing route details. Please go back and try again.";
          if (scheduledAt) {
            setScheduleError(missing);
          } else {
            setStatus(missing);
          }
          bookingStarted.current = false;
          return;
        }

        let categoryId = categoryIdParam ?? undefined;
        if (!categoryId) {
          const slug = VEHICLE_TO_CATEGORY_SLUG[vehicle];
          if (slug) {
            const categories = await getVehicleCategories("ride");
            categoryId = categories.find((c) => c.slug === slug)?.id;
          }
        }

        if (!scheduledAt) {
          setProgress(35);
          setStatus(
            preferWomenRiders
              ? "Matching a women captain..."
              : "Matching your ride...",
          );
        }

        let blockingRide: Awaited<ReturnType<typeof getBlockingActiveRide>> = null;
        try {
          blockingRide = await getBlockingActiveRide(existingRideId ?? undefined);
        } catch {
          setStatus("Could not verify current trips. Please try again.");
          bookingStarted.current = false;
          return;
        }
        if (blockingRide) {
          showBlockedRide(blockingRide);
          setStatus("You already have an active ride. Finish or cancel it first.");
          bookingStarted.current = false;
          return;
        }

        const ride = await bookRide({
          pickup_address: pickup,
          dropoff_address: dropoff,
          pickup_lat: tripCoords.pickupLat,
          pickup_lng: tripCoords.pickupLng,
          dropoff_lat: tripCoords.dropoffLat,
          dropoff_lng: tripCoords.dropoffLng,
          vehicle_category_id: categoryId,
          prefer_women_riders: preferWomenRiders,
          women_safety_enabled: preferWomenRiders,
          payment_method: payment,
          distance_km: tripCoords.distanceKm,
          duration_min: tripCoords.durationMin,
          stops: tripCoords.stops,
          promo_code: promoCode,
          scheduled_at: scheduledAt,
          notes,
        });
        rideIdRef.current = ride.id;
        saveLastBookedRide(ride);
        setWatchRides([ride]);

        if (scheduledAt) {
          window.location.assign(buildBookingsListUrl("scheduled"));
          return;
        }

        if (ride.requires_rider_preference_choice) {
          setStatus("Waiting for your confirmation...");
          setPreferenceOpen(true);
          return;
        }

        if (isDriverAssigned(ride.status)) {
          goToTracking(ride.id);
          return;
        }

        setProgress(60);
        setStatus(
          preferWomenRiders
            ? "Searching for nearby women captains..."
            : "Searching for nearby captains...",
        );
        startPolling(ride.id);
        await checkRideStatus();
        return;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to book ride. Please try again.";
        if (/session expired|sign in again|invalid or expired token/i.test(message)) {
          router.replace(
            getProtectedPath(scheduledAt ? bookReturnUrl : (
              searchParams.toString()
                ? `${ROUTES.bookSearching}?${searchParams.toString()}`
                : ROUTES.bookSearching
            )),
          );
          return;
        }
        if (isActiveRideBlockingError(message)) {
          const active = await getBlockingActiveRide(existingRideId ?? undefined);
          if (active) {
            showBlockedNotice({ ride: active });
          } else {
            showBlockedNotice({ message });
          }
          bookingStarted.current = false;
          return;
        }
        if (scheduledAt) {
          setScheduleError(message);
        } else {
          setBookError(message);
          setStatus(message);
        }
        bookingStarted.current = false;
      }
    }

    void startBooking();

    if (scheduledAt) {
      return () => {
        clearPoll();
      };
    }

    const client = getRideRealtimeClient();
    const unsub = client.onMessage((msg) => {
      const event = String(msg.event ?? "").toLowerCase();
      const msgRideId = String(msg.ride_id ?? "");
      if (rideIdRef.current && msgRideId && msgRideId !== rideIdRef.current) return;
      if (event === "ride_accepted") {
        const id = rideIdRef.current || msgRideId;
        if (id) goToTracking(id);
        return;
      }
      if (
        event.includes("cancel") ||
        event.includes("expire") ||
        event.includes("timeout") ||
        event.includes("failed")
      ) {
        void checkRideStatus();
      }
    });

    return () => {
      clearPoll();
      unsub();
      if (rideIdRef.current) {
        client.unsubscribeRide(rideIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelRide = async (reason: string) => {
    clearPoll();
    const rideId = rideIdRef.current;
    if (!rideId) {
      router.push(bookReturnUrl);
      return;
    }
    ackNoCaptainPrompt(rideId);
    await cancelRide(rideId, reason);
    router.push(bookReturnUrl);
  };

  const handlePreferenceContinue = async () => {
    const rideId = rideIdRef.current;
    if (!rideId) return;
    setPreferenceLoading(true);
    try {
      await continueWithAllRiders(rideId);
      setPreferenceOpen(false);
      setStatus("Searching for nearby captains...");
      startPolling(rideId);
    } catch {
      setStatus("Unable to continue search. Please try again.");
    } finally {
      setPreferenceLoading(false);
    }
  };

  const handlePreferenceKeepSearching = () => {
    setPreferenceOpen(false);
    setStatus(
      preferWomenRiders
        ? "Searching for nearby women captains..."
        : "Searching for nearby captains...",
    );
    startPolling(rideIdRef.current ?? undefined);
  };

  if (scheduledAt) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#ffffff] px-4 font-sans">
        <div className="w-full max-w-sm rounded-2xl bg-white px-6 py-8 text-center shadow-xl">
          {scheduleError ? (
            <>
              <p className="font-heading text-base font-semibold text-[#B8D926]">
                Couldn’t schedule ride
              </p>
              <p className="mt-2 text-sm text-[#4a5228]">{scheduleError}</p>
              <Button
                type="button"
                className="mt-5 h-11 w-full rounded-2xl font-semibold"
                onClick={() => router.replace(bookReturnUrl)}
              >
                Back to choose a ride
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 font-heading text-base font-semibold text-[#B8D926]">
                Scheduling your ride
              </p>
              <p className="mt-1 text-sm text-[#4a5228]">
                Taking you to Bookings…
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-white px-4 font-sans sm:px-6">
        <div className="mx-auto flex w-full max-w-md flex-col items-center py-10">
          <AnimateIn>
            <WaveGoLogo size="md" className="mb-10" />
          </AnimateIn>

          <AnimateIn delay={0.05}>
            <div className="relative mb-10 flex h-36 w-36 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_12px_32px_-12px_rgba(184,217,38,0.55)]">
                {vehicleOption && (
                  <ServiceImage
                    src={vehicleOption.image}
                    alt={vehicleOption.name}
                    imageClassName="object-contain p-2.5"
                  />
                )}
              </div>
            </div>
          </AnimateIn>

          <AnimateIn delay={0.1}>
            <h1 className="mb-2 text-center font-heading text-2xl font-bold text-[#B8D926] sm:text-3xl">
              {bookError || promptRide
                ? "Captain search paused"
                : `Finding your ${vehicleName}`}
            </h1>
            <p className="mb-8 max-w-xs text-center text-sm font-medium text-[#5a6330]">
              <span
                className={
                  !bookError && !promptRide && progress < 100 ? "animate-pulse" : undefined
                }
              >
                {status}
              </span>
            </p>
          </AnimateIn>

          <AnimateIn delay={0.15} className="w-full">
            {!bookError && !promptRide ? (
              <>
                <div className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[#eef5d4]">
                  <div
                    className="h-full bg-[#B8D926] transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-8 text-center text-xs text-[#7a8448]">
                  Estimated matching time: &lt; 1 min
                </p>
              </>
            ) : null}
          </AnimateIn>

          <AnimateIn delay={0.2}>
            {bookError ? (
              <div className="mt-10 flex w-full max-w-xs flex-col gap-2.5">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full rounded-2xl text-base font-semibold"
                  onClick={() => {
                    setBookError(null);
                    bookingStarted.current = false;
                    window.location.reload();
                  }}
                >
                  Try again
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 w-full rounded-2xl"
                  onClick={() => router.push(bookReturnUrl)}
                >
                  Back to booking
                </Button>
              </div>
            ) : progress < 100 && !promptRide && (watchRides[0]?.id || existingRideId) ? (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                className="mt-12 h-12 w-full rounded-2xl border border-destructive/20 bg-destructive/10 px-8 text-base font-semibold text-destructive hover:bg-destructive/15 sm:w-auto"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="h-5 w-5" />
                Cancel ride
              </Button>
            ) : null}
          </AnimateIn>
        </div>
      </div>

      <WomenRidersUnavailableDialog
        open={preferenceOpen}
        isLoading={preferenceLoading}
        onContinue={handlePreferenceContinue}
        onKeepSearching={handlePreferenceKeepSearching}
      />

      <CancelRideSheet
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelRide}
        title="Cancel request?"
        description="Your captain search will stop. You can book again anytime."
      />

      <CaptainNotAssignedDialog
        open={Boolean(promptRide)}
        ride={promptRide}
        onClose={() => {
          dismissNoCaptainPrompt();
          router.push(ROUTES.bookings);
        }}
        onBookAgain={() => {
          dismissNoCaptainPrompt();
          router.push(bookReturnUrl);
        }}
      />

      {blockDialog}
    </>
  );
}
