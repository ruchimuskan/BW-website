"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation2,
  Phone,
  Share2,
  ShieldCheck,
  Siren,
  Star,
  XCircle,
} from "lucide-react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { CancelRideSheet } from "@/components/booking/CancelRideSheet";
import { RateRideDialog } from "@/components/booking/RateRideDialog";
import { RideChatSheet } from "@/components/booking/RideChatSheet";
import { RideTrackingMap } from "@/components/booking/RideTrackingMap";
import { SafetyModeSheet } from "@/components/booking/SafetyModeSheet";
import { RideSafetyCheckDialog } from "@/components/booking/RideSafetyCheckDialog";
import { BRAND_PHOTOS, brandPhotoFit } from "@/constants/brand-images";
import { ROUTES } from "@/constants/routes";
import { RIDE_VEHICLE_OPTIONS } from "@/data/ride-options";
import {
  buildLiveRideShareText,
  cancelRide,
  getActiveRide,
  getCurrentCoords,
  getRide,
  getRideDriver,
  isDriverAssigned,
  isRideTerminal,
  isUsableAddress,
  resolveRideAddress,
  triggerRideSos,
  type Ride,
} from "@/lib/ride-api";
import { getRideRealtimeClient } from "@/lib/ride-realtime";
import {
  buildBookingDetailUrl,
  formatFare,
  isRideVehicleId,
} from "@/lib/ride-booking";
import { displayVehicleName } from "@/lib/vehicle-map";
import { cn } from "@/lib/utils";
import { useRideSafetyCheck } from "@/hooks/useRideSafetyCheck";

function isSearchingStatus(status: string): boolean {
  return ["", "SEARCHING", "SEARCHING_DRIVER", "REQUESTED", "PENDING"].includes(
    status.toUpperCase(),
  );
}

function statusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case "SEARCHING":
    case "SEARCHING_DRIVER":
    case "REQUESTED":
    case "PENDING":
    case "":
      return "Looking for a nearby captain";
    case "DRIVER_ASSIGNED":
      return "Captain assigned · heading to pickup";
    case "DRIVER_ARRIVED":
      return "Captain has arrived";
    case "OTP_VERIFIED":
    case "STARTED":
    case "IN_PROGRESS":
      return "Trip in progress";
    case "COMPLETED":
      return "Trip completed";
    case "CANCELLED":
    case "CANCELED":
      return "Trip cancelled";
    default:
      return status.replace(/_/g, " ").toLowerCase();
  }
}

function tripHeadline(status: string, etaMinutes: number | null): string {
  const upper = status.toUpperCase();
  if (isSearchingStatus(upper)) return "Finding captain";
  if (upper === "DRIVER_ASSIGNED") {
    return etaMinutes != null ? `${etaMinutes} min away` : "Captain assigned";
  }
  if (upper === "DRIVER_ARRIVED") return "Captain arrived";
  if (["OTP_VERIFIED", "STARTED", "IN_PROGRESS"].includes(upper)) {
    return etaMinutes != null ? `${etaMinutes} min` : "On trip";
  }
  if (upper === "COMPLETED") return "Trip completed";
  if (upper === "CANCELLED" || upper === "CANCELED") return "Trip cancelled";
  return etaMinutes != null ? `${etaMinutes} min` : "Live trip";
}

function vehiclePhoto(vehicleId: string): string {
  if (vehicleId === "bike") return BRAND_PHOTOS.studioBike;
  if (vehicleId === "auto") return BRAND_PHOTOS.eAuto;
  if (vehicleId === "cab") return BRAND_PHOTOS.streetCab;
  if (vehicleId === "ambulance") return BRAND_PHOTOS.ambulance;
  if (vehicleId === "parcel") return BRAND_PHOTOS.parcelDelivery;
  return BRAND_PHOTOS.streetCab;
}

const cardShadow =
  "border border-[#dce8a8]/80 bg-white shadow-[0_14px_28px_rgba(40,54,20,0.12),0_4px_10px_rgba(40,54,20,0.06)]";


export function RideTrackingView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pickupParam = searchParams.get("pickup") || "";
  const dropoffParam = searchParams.get("dropoff") || "";
  const vehicleParam = searchParams.get("vehicle");
  const rideId = searchParams.get("rideId");
  const vehicle = isRideVehicleId(vehicleParam) ? vehicleParam : "bike";

  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(rideId));
  const [cancelOpen, setCancelOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const vehicleOption = RIDE_VEHICLE_OPTIONS.find((v) => v.id === vehicle);
  const pickup = resolveRideAddress(ride?.pickup_address, pickupParam);
  const dropoff = resolveRideAddress(ride?.dropoff_address, dropoffParam);
  const status = ride?.status ?? "";
  const canCancel =
    Boolean(rideId) &&
    !isRideTerminal(status) &&
    !["STARTED", "IN_PROGRESS", "OTP_VERIFIED"].includes(status.toUpperCase());
  const canSos = Boolean(rideId) && !isRideTerminal(status);
  const etaMinutes = ride?.estimated_duration_min
    ? Math.max(1, Math.round(ride.estimated_duration_min))
    : null;
  const distanceKm =
    ride?.estimated_distance_km != null && Number.isFinite(ride.estimated_distance_km)
      ? Math.max(0.1, Math.round(ride.estimated_distance_km * 10) / 10)
      : null;
  const fare = ride?.fare_final ?? ride?.fare_estimate ?? null;
  const driverName = ride?.driver?.name || "Captain";
  const driverPhone = ride?.driver?.phone || "";
  const driverRating = ride?.driver?.rating ?? 0;
  const vehicleNumber =
    ride?.vehicle_number || ride?.driver?.vehicle_number || vehicleOption?.name || "Ride";
  const startCode = ride?.start_code;
  const captainAssigned = isDriverAssigned(status) || Boolean(ride?.driver?.name);
  const searching = isSearchingStatus(status) && !captainAssigned;
  const safetyEnabled =
    captainAssigned &&
    !isRideTerminal(status) &&
    Boolean(rideId);
  const tripInProgress = ["OTP_VERIFIED", "STARTED", "IN_PROGRESS"].includes(
    status.toUpperCase(),
  );
  const safetyCheckPaused =
    safetyOpen || cancelOpen || chatOpen || rateOpen || sosLoading;
  const { promptOpen, acknowledgeSafe, closePrompt } = useRideSafetyCheck({
    rideId,
    enabled: tripInProgress,
    paused: safetyCheckPaused,
  });
  const driverPhoto = ride?.driver?.photo_url?.trim() || "";
  const vehicleThumb = vehiclePhoto(vehicle);
  const vehicleLabel = displayVehicleName(
    ride?.vehicle_type_name || vehicleOption?.name || vehicle,
  );


  const refreshRide = useCallback(async () => {
    if (!rideId) return;
    try {
      const [detail, active] = await Promise.all([
        getRide(rideId).catch(() => null),
        getActiveRide().catch(() => null),
      ]);

      // Prefer full ride detail for addresses; overlay live fields from dashboard active ride.
      let next: Ride | null = detail;
      if (active && active.id === rideId) {
        next = detail
          ? {
              ...detail,
              ...active,
              pickup_address: isUsableAddress(active.pickup_address)
                ? active.pickup_address
                : detail.pickup_address,
              dropoff_address: isUsableAddress(active.dropoff_address)
                ? active.dropoff_address
                : detail.dropoff_address,
              pickup_lat: active.pickup_lat ?? detail.pickup_lat,
              pickup_lng: active.pickup_lng ?? detail.pickup_lng,
              dropoff_lat: active.dropoff_lat ?? detail.dropoff_lat,
              dropoff_lng: active.dropoff_lng ?? detail.dropoff_lng,
              driver: active.driver ?? detail.driver,
              vehicle_number: active.vehicle_number || detail.vehicle_number,
              fare_estimate: active.fare_estimate ?? detail.fare_estimate,
              fare_final: active.fare_final ?? detail.fare_final,
              estimated_duration_min:
                active.estimated_duration_min ?? detail.estimated_duration_min,
              estimated_distance_km:
                active.estimated_distance_km ?? detail.estimated_distance_km,
            }
          : active;
      }

      if (next && isDriverAssigned(next.status)) {
        try {
          const driver = await getRideDriver(rideId);
          next = {
            ...next,
            driver: {
              id: driver.id,
              name: driver.name,
              phone: driver.phone,
              rating: driver.rating,
              photo_url: driver.photo_url,
              vehicle_number: driver.vehicle_number,
            },
            vehicle_number: driver.vehicle_number || next.vehicle_number,
          };
        } catch {
          // Driver endpoint 404 while still searching is fine.
        }
      }

      if (next) {
        setRide(next);
        if (next.status.toUpperCase() === "COMPLETED") {
          setRateOpen(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    if (!rideId && (!pickupParam || !dropoffParam)) {
      router.replace(ROUTES.home);
    }
  }, [rideId, pickupParam, dropoffParam, router]);

  useEffect(() => {
    if (!rideId) {
      setIsLoading(false);
      return;
    }

    void refreshRide();
    const poll = window.setInterval(() => {
      void refreshRide();
    }, 2000);

    const client = getRideRealtimeClient();
    client.connect();
    client.subscribeRide(rideId);
    const unsub = client.onMessage((msg) => {
      const event = String(msg.event ?? "");
      if (
        event === "ride_accepted" ||
        event === "ride_status" ||
        event === "driver_location" ||
        event === "ride_completed" ||
        event === "ride_cancelled" ||
        event === "ride_sos"
      ) {
        void refreshRide();
      }
    });

    return () => {
      window.clearInterval(poll);
      unsub();
      client.unsubscribeRide(rideId);
    };
  }, [rideId, refreshRide]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleCancelRide = async (reason: string) => {
    if (!rideId) return;
    await cancelRide(rideId, reason);
    router.push(ROUTES.home);
  };

  const handleShare = async () => {
    if (!ride) return;
    const text = buildLiveRideShareText(ride, etaMinutes);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Live ride tracking", text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast("Trip details copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Trip details copied");
      } catch {
        showToast("Unable to share trip");
      }
    }
  };

  const handleSos = async (options?: { skipConfirm?: boolean }) => {
    if (!rideId || sosLoading) return false;
    if (!options?.skipConfirm) {
      const confirmed = window.confirm(
        "Send SOS alert? We will notify your emergency contacts and support with your live location and captain details."
      );
      if (!confirmed) return false;
    }

    setSosLoading(true);
    try {
      const coords = await getCurrentCoords();
      const lat =
        coords.lat ?? ride?.driver_lat ?? ride?.pickup_lat ?? undefined;
      const lng =
        coords.lng ?? ride?.driver_lng ?? ride?.pickup_lng ?? undefined;
      const result = await triggerRideSos(rideId, {
        lat,
        lng,
        message: options?.skipConfirm
          ? "Passenger needs help — SOS from safety check-in"
          : undefined,
      });
      showToast(
        result.message ||
          (result.emergency_sms_sent
            ? "SOS sent. Emergency contacts and support notified."
            : "SOS sent to support.")
      );
      void refreshRide();
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to send SOS");
      return false;
    } finally {
      setSosLoading(false);
    }
  };

  if (!rideId && (!pickupParam || !dropoffParam)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7fbe8] px-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#B8D926]" />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-dvh w-full flex-col bg-[#f7fbe8] font-sans lg:flex-row">
        <div className="relative lg:min-h-dvh lg:flex-1">
          <RideTrackingMap
            pickupLat={ride?.pickup_lat}
            pickupLng={ride?.pickup_lng}
            dropoffLat={ride?.dropoff_lat}
            dropoffLng={ride?.dropoff_lng}
            driverLat={ride?.driver_lat}
            driverLng={ride?.driver_lng}
            vehicleImage={vehicleOption?.image}
            vehicleName={vehicleOption?.name}
          />

          <div className="absolute top-0 right-0 left-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-xl items-center justify-between lg:mx-0 lg:max-w-none">
              <button
                type="button"
                onClick={() => router.push(ROUTES.home)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dce8a8]/80 bg-white text-[#38471B] shadow-[0_10px_22px_rgba(40,54,20,0.16)] transition hover:bg-[#f7fbe8]"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-2 rounded-full border border-[#dce8a8]/80 bg-white px-3.5 py-2 shadow-[0_10px_22px_rgba(40,54,20,0.16)] sm:px-4">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[12px] font-semibold tracking-wide text-[#38471B] sm:text-sm">
                  Live tracking
                </span>
              </div>

              <button
                type="button"
                onClick={() => void handleShare()}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dce8a8]/80 bg-white text-[#38471B] shadow-[0_10px_22px_rgba(40,54,20,0.16)] transition hover:bg-[#f7fbe8]"
                aria-label="Share ride"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <aside className="relative z-10 -mt-6 flex w-full flex-col rounded-t-[28px] bg-[#f7fbe8] pb-10 pt-3 shadow-[0_-16px_40px_rgba(40,54,20,0.12)] sm:-mt-8 lg:mt-0 lg:h-dvh lg:w-[min(26.5rem,42vw)] lg:overflow-y-auto lg:rounded-none lg:border-l lg:border-[#dce8a8]/80 lg:shadow-[-18px_0_40px_rgba(40,54,20,0.08)]">
          <div className="mx-auto w-full max-w-xl px-4 sm:px-6 lg:max-w-none lg:px-6 lg:pt-6">
            <AnimateIn>
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#dce8a8] lg:hidden" />
            </AnimateIn>

            <AnimateIn delay={0.04}>
              <div className="mb-5">
                {safetyEnabled ? (
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f4f9e4] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#38471B]">
                      {tripInProgress ? "Ride in progress" : statusLabel(status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSafetyOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#2563eb]/25 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-[#2563eb] shadow-sm transition hover:bg-[#eff6ff]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
                      Safety
                    </button>
                  </div>
                ) : null}

                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#B8D926] uppercase">
                      {searching ? "Matching" : "Status"}
                    </p>
                    <h2 className="mt-1 font-heading text-[1.7rem] font-semibold tracking-tight text-[#38471B] sm:text-[1.9rem]">
                      {captainAssigned && etaMinutes != null
                        ? `Reach in ${etaMinutes} min`
                        : tripHeadline(status, etaMinutes)}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-[#5a6330]">
                      {distanceKm != null
                        ? `${distanceKm} km away`
                        : statusLabel(status)}
                    </p>
                  </div>
                  <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f4f9e4] sm:h-16 sm:w-20">
                    <Image
                      src={vehicleThumb}
                      alt=""
                      fill
                      className={cn(
                        "object-center",
                        brandPhotoFit(vehicleThumb) === "contain"
                          ? "object-contain p-1"
                          : "object-cover",
                      )}
                      sizes="80px"
                    />
                  </div>
                </div>
              </div>
            </AnimateIn>

            {startCode ? (
              <AnimateIn delay={0.06}>
                <div className={cn("mb-4 rounded-2xl px-4 py-3.5", cardShadow, "border-[#C8E84A]/50 bg-[#f4f9e4]")}>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#B8D926] uppercase">
                    Start code
                  </p>
                  <p className="mt-1 font-heading text-2xl font-semibold tracking-[0.22em] text-[#38471B]">
                    {startCode}
                  </p>
                </div>
              </AnimateIn>
            ) : null}

            <AnimateIn delay={0.08}>
              {searching ? (
                <div className={cn("mb-4 flex items-center gap-4 rounded-2xl p-4", cardShadow)}>
                  <div className="relative h-14 w-14 shrink-0">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#C8E84A]/35" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#38471B] text-[#C8E84A]">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-base font-semibold text-[#38471B]">
                      Matching a captain
                    </p>
                    <p className="mt-0.5 text-sm text-[#5a6330]">
                      Nearby {vehicleLabel.toLowerCase()} captains are being notified.
                    </p>
                  </div>
                  <div className="relative hidden h-12 w-16 overflow-hidden rounded-xl bg-[#f4f9e4] sm:block">
                    <Image
                      src={vehicleThumb}
                      alt=""
                      fill
                      className={cn(
                        "object-center",
                        brandPhotoFit(vehicleThumb) === "contain"
                          ? "object-contain p-1"
                          : "object-cover",
                      )}
                      sizes="64px"
                    />
                  </div>
                </div>
              ) : (
                <div className={cn("mb-4 flex items-center gap-3.5 rounded-2xl p-4", cardShadow)}>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#B8D926] text-lg font-semibold text-[#38471B]">
                    {driverPhoto ? (
                      <Image
                        src={driverPhoto}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        {driverName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-base font-semibold uppercase tracking-wide text-[#38471B]">
                      {driverName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#5a6330]">
                      {driverRating > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#38471B]">
                          <Star className="h-3.5 w-3.5 fill-[#B8D926] text-[#B8D926]" />
                          {Number(driverRating).toFixed(1)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#c45a00]">
                          <Star className="h-3 w-3 fill-[#c45a00] text-[#c45a00]" />
                          New
                        </span>
                      )}
                      <span className="rounded-full bg-[#f4f9e4] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#38471B]">
                        {vehicleLabel}
                      </span>
                      {vehicleNumber && vehicleNumber !== vehicleOption?.name ? (
                        <span>{vehicleNumber}</span>
                      ) : null}
                    </div>
                    {fare != null ? (
                      <p className="mt-1 text-xs font-semibold text-[#5a6330]">
                        Fare · {formatFare(fare)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChatOpen(true)}
                      disabled={!rideId}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dce8a8] bg-white text-[#B8D926] transition hover:bg-[#f7fbe8] disabled:opacity-50"
                      aria-label="Chat with captain"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </button>
                    {driverPhone ? (
                      <a
                        href={`tel:${driverPhone.replace(/\s/g, "")}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#B8D926] to-[#C8E84A] text-[#38471B] shadow-[0_10px_20px_rgba(184,217,38,0.45)]"
                        aria-label="Call captain"
                      >
                        <Phone className="h-5 w-5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              )}
            </AnimateIn>

            <AnimateIn delay={0.1}>
              <div className="mb-5 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-3">
                {safetyEnabled ? (
                  <button
                    type="button"
                    onClick={() => setSafetyOpen(true)}
                    className={cn(
                      "flex h-12 items-center justify-center gap-1.5 rounded-2xl text-[13px] font-semibold text-[#2563eb]",
                      cardShadow,
                      "hover:border-[#2563eb]/30 hover:bg-[#eff6ff]",
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Safety
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    disabled={!rideId}
                    className={cn(
                      "flex h-12 items-center justify-center gap-1.5 rounded-2xl text-[13px] font-semibold text-[#38471B] disabled:opacity-50",
                      cardShadow,
                      "hover:border-[#C8E84A]/50 hover:shadow-[0_16px_32px_rgba(40,54,20,0.14)]",
                    )}
                  >
                    <MessageCircle className="h-4 w-4 text-[#B8D926]" />
                    Chat
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className={cn(
                    "flex h-12 items-center justify-center gap-1.5 rounded-2xl text-[13px] font-semibold text-[#38471B]",
                    cardShadow,
                    "hover:border-[#C8E84A]/50 hover:shadow-[0_16px_32px_rgba(40,54,20,0.14)]",
                  )}
                >
                  <Share2 className="h-4 w-4 text-[#B8D926]" />
                  Share
                </button>
                <button
                  type="button"
                  disabled={!canSos || sosLoading}
                  onClick={() => void handleSos()}
                  className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-destructive/20 bg-[#fff6f4] text-[13px] font-semibold text-destructive shadow-[0_12px_24px_rgba(180,50,40,0.12)] hover:bg-[#ffece8] disabled:opacity-50"
                >
                  {sosLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Siren className="h-4 w-4" />
                  )}
                  SOS
                </button>
              </div>
            </AnimateIn>

            <AnimateIn delay={0.11}>
              <div className={cn("mb-5 flex items-center gap-3 rounded-2xl p-4", cardShadow)}>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-[#5a6330] uppercase">
                    Drop at
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-[#38471B]">
                    {dropoff || "Loading drop location…"}
                  </p>
                </div>
                {rideId ? (
                  <button
                    type="button"
                    onClick={() => router.push(buildBookingDetailUrl(rideId))}
                    className="shrink-0 rounded-xl border border-[#B8D926]/35 bg-white px-3 py-2 text-xs font-semibold text-[#38471B] transition hover:bg-[#f7fbe8]"
                  >
                    Trip Details
                  </button>
                ) : null}
              </div>
            </AnimateIn>

            <Stagger className="relative space-y-3">
              <span
                aria-hidden
                className="absolute top-8 bottom-8 left-[1.85rem] w-px bg-gradient-to-b from-[#B8D926] to-destructive/70"
              />
              <StaggerItem index={0}>
                <div className={cn("relative flex items-start gap-3 rounded-2xl p-4", cardShadow)}>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f9e4] text-[#B8D926]">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#B8D926] uppercase">
                      Pickup
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#38471B]">
                      {pickup || "Loading pickup…"}
                    </p>
                  </div>
                </div>
              </StaggerItem>
              <StaggerItem index={1}>
                <div className={cn("relative flex items-start gap-3 rounded-2xl p-4", cardShadow)}>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff6f4] text-destructive">
                    <Navigation2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-destructive uppercase">
                      Drop
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#38471B]">
                      {dropoff || "Loading drop…"}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            </Stagger>

            {canCancel ? (
              <AnimateIn delay={0.14}>
                <button
                  type="button"
                  className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-white text-base font-semibold text-destructive shadow-[0_12px_24px_rgba(180,50,40,0.1)] hover:bg-[#fff6f4]"
                  onClick={() => setCancelOpen(true)}
                >
                  <XCircle className="h-5 w-5" />
                  Cancel ride
                </button>
              </AnimateIn>
            ) : null}
          </div>
        </aside>

        {toast ? (
          <div className="fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-full bg-[#38471B] px-4 py-2 text-center text-sm text-white shadow-lg">
            {toast}
          </div>
        ) : null}
      </div>

      <CancelRideSheet
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelRide}
      />

      {rideId ? (
        <RideChatSheet
          open={chatOpen}
          rideId={rideId}
          onClose={() => setChatOpen(false)}
        />
      ) : null}

      {rideId ? (
        <RateRideDialog
          open={rateOpen}
          rideId={rideId}
          driverName={driverName}
          onDone={() => {
            setRateOpen(false);
            router.push(ROUTES.home);
          }}
        />
      ) : null}

      {ride && safetyEnabled ? (
        <SafetyModeSheet
          open={safetyOpen}
          onOpenChange={setSafetyOpen}
          ride={ride}
          etaMinutes={etaMinutes}
          onToast={showToast}
          onRefreshRide={() => void refreshRide()}
        />
      ) : null}

      <RideSafetyCheckDialog
        open={promptOpen}
        driverName={driverName}
        sosLoading={sosLoading}
        onSafe={acknowledgeSafe}
        onNeedHelp={() => {}}
        onSendSos={async () => {
          const ok = await handleSos({ skipConfirm: true });
          if (ok) acknowledgeSafe();
        }}
        onOpenSafetyTools={() => {
          closePrompt();
          setSafetyOpen(true);
        }}
      />
    </>
  );
}
