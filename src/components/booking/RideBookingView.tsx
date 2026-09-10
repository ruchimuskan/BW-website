"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  Percent,
  UserRound,
} from "lucide-react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { PAYMENT_METHODS } from "@/data/ride-options";
import {
  getAmbulanceVehicleTypes,
  getVehicleCategories,
  isAmbulanceVehicle,
  type VehicleCategory,
} from "@/lib/home-api";
import { ambulanceBookTheme, rideBookTheme } from "@/lib/ambulance-theme";
import { warmBackend, ensureValidSession, isAuthErrorMessage } from "@/lib/api";
import {
  ActiveRideBlockError,
  assertNoBlockingActiveRide,
  getBlockingActiveRide,
} from "@/lib/active-ride-guard";
import {
  bookRideWithRetry,
  estimateRideFares,
  getRideDirections,
  isActiveRideBlockingError,
  type PaymentMethod,
} from "@/lib/ride-api";
import { useActiveRideGuard } from "@/hooks/useActiveRideGuard";
import type { AppliedCoupon } from "@/lib/coupons-api";
import { couponFinalAmount } from "@/lib/coupons-api";
import { getProtectedPath, isAuthenticated, setPostLoginRedirect } from "@/lib/auth-session";
import { buildLocationSearchUrl } from "@/lib/location-search";
import {
  buildBookUrl,
  formatFare,
  mapEmbedUrl,
  parseTripCoords,
  isValidLatLng,
} from "@/lib/ride-booking";
import { formatScheduleLabel } from "@/lib/schedule-api";
import { WhenToGoDialog } from "@/components/home/WhenToGoDialog";
import {
  normalizeScheduledAt,
  syncScheduledAtQuery,
} from "@/lib/landing-booking-draft";
import { saveLastBookedRide } from "@/lib/last-booked-ride";
import {
  categoryVehicleId,
  displayVehicleName,
  isListedRideCategory,
  vehicleCapacityForCategory,
  vehicleImageForCategory,
} from "@/lib/vehicle-map";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";
import { BookingConfirmDialog } from "@/components/booking/BookingConfirmDialog";
import { BookingOffersSheet } from "@/components/booking/BookingOffersSheet";
import { PreferWomenCaptainsDialog } from "@/components/booking/PreferWomenCaptainsDialog";
import { VehicleOptionImage } from "@/components/booking/VehicleOptionImage";

interface BookableOption {
  /** Unique backend category id — used for selection to avoid slug collisions */
  categoryId: string;
  vehicleId: string;
  name: string;
  capacity: number;
  /** Trip duration from directions / fare estimate — not a fabricated captain ETA. */
  durationMin: number;
  distanceKm: number;
  price: number;
  originalPrice?: number | null;
  image: string;
}

function filterCategoriesForTab(categories: VehicleCategory[], tab: string) {
  return categories.filter((category) => {
    const slug = `${category.slug} ${category.name}`.toLowerCase();
    const group = (category.service_group ?? "ride").toLowerCase();
    if (group === "rental" || group === "self_drive") return false;
    if (tab === "ambulance") {
      return isAmbulanceVehicle(category);
    }
    if (tab === "parcel") {
      return slug.includes("parcel") || slug.includes("delivery");
    }
    return (
      isListedRideCategory(category) &&
      !slug.includes("ambulance") &&
      !slug.includes("parcel") &&
      !slug.includes("delivery")
    );
  });
}

function findQuote(
  quotes: Record<
    string,
    {
      vehicle_type_id: string;
      name?: string;
      estimated_fare: number;
      original_fare?: number | null;
    }
  >,
  category: VehicleCategory,
) {
  const idKey = category.id.toLowerCase();
  const slugKey = category.slug.toLowerCase();
  return (
    quotes[idKey] ??
    quotes[slugKey] ??
    quotes[category.name.toLowerCase()] ??
    Object.values(quotes).find(
      (q) =>
        q.vehicle_type_id.toLowerCase() === idKey ||
        q.vehicle_type_id.toLowerCase() === slugKey ||
        (q.name && q.name.toLowerCase() === category.name.toLowerCase()),
    ) ??
    null
  );
}

export function RideBookingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { guardBooking, blockDialog, showBlockedRide, showBlockedNotice } =
    useActiveRideGuard();

  const pickup = searchParams.get("pickup") || "";
  const dropoff = searchParams.get("dropoff") || "";
  const tab = searchParams.get("tab") || "rides";
  const vehicleParam = searchParams.get("vehicle");
  const categoryParam = searchParams.get("category");
  const scheduledParam = searchParams.get("scheduled_at") || "";
  const notesParam = searchParams.get("notes") || "";
  const tripCoords = parseTripCoords(searchParams);
  const stops = tripCoords.stops;
  const stopsSignature = stops
    .map((s) => `${s.label}|${s.latitude ?? ""}|${s.longitude ?? ""}`)
    .join(";");

  const [options, setOptions] = useState<BookableOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [paymentIndex, setPaymentIndex] = useState(0);
  const [memberDiscountPercent, setMemberDiscountPercent] = useState(0);
  const [preferWomenOpen, setPreferWomenOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preferWomenRiders, setPreferWomenRiders] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [scheduledAt, setScheduledAt] = useState(
    () => normalizeScheduledAt(scheduledParam) ?? "",
  );
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [confirmingSchedule, setConfirmingSchedule] = useState(false);
  const [notes, setNotes] = useState(notesParam);
  const [reloadKey, setReloadKey] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [routeMeta, setRouteMeta] = useState({
    pickupLat: tripCoords.pickupLat,
    pickupLng: tripCoords.pickupLng,
    dropoffLat: tripCoords.dropoffLat,
    dropoffLng: tripCoords.dropoffLng,
    distanceKm: tripCoords.distanceKm,
    durationMin: tripCoords.durationMin,
  });

  const payment = PAYMENT_METHODS[paymentIndex] ?? PAYMENT_METHODS[0];
  const mapSrc = mapEmbedUrl(
    routeMeta.pickupLat,
    routeMeta.pickupLng,
    routeMeta.dropoffLat,
    routeMeta.dropoffLng,
  );

  const renderMap = (className: string) => (
    <iframe
      key={mapSrc}
      src={mapSrc}
      className={className}
      allowFullScreen={false}
      loading="eager"
      referrerPolicy="no-referrer-when-downgrade"
      title="Ride route map"
    />
  );

  useEffect(() => {
    setScheduledAt(normalizeScheduledAt(scheduledParam) ?? "");
  }, [scheduledParam]);

  const applyBookSchedule = (iso: string | null) => {
    const next = normalizeScheduledAt(iso) ?? "";
    setScheduledAt(next);
    // Keep schedule on the book URL only while the user is on the booking step.
    syncScheduledAtQuery(next || null, "");
  };

  useEffect(() => {
    setNotes(notesParam);
  }, [notesParam]);

  useEffect(() => {
    if (tripCoords.payment) {
      const idx = PAYMENT_METHODS.findIndex((m) => m.id === tripCoords.payment);
      if (idx >= 0) setPaymentIndex(idx);
    }
  }, [tripCoords.payment]);

  useEffect(() => {
    if (!pickup || !dropoff) {
      router.replace(ROUTES.home);
    }
  }, [pickup, dropoff, router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!pickup || !dropoff) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const [allCategories, directions] = await Promise.all([
          tab === "ambulance"
            ? getAmbulanceVehicleTypes()
            : getVehicleCategories(),
          getRideDirections(
            {
              label: pickup,
              latitude: tripCoords.pickupLat,
              longitude: tripCoords.pickupLng,
            },
            {
              label: dropoff,
              latitude: tripCoords.dropoffLat,
              longitude: tripCoords.dropoffLng,
            },
            tripCoords.stops,
          ),
        ]);

        if (cancelled) return;

        const pickupLat = isValidLatLng(directions.pickup_lat, directions.pickup_lng)
          ? directions.pickup_lat
          : tripCoords.pickupLat;
        const pickupLng = isValidLatLng(directions.pickup_lat, directions.pickup_lng)
          ? directions.pickup_lng
          : tripCoords.pickupLng;
        const dropoffLat = isValidLatLng(directions.dropoff_lat, directions.dropoff_lng)
          ? directions.dropoff_lat
          : tripCoords.dropoffLat;
        const dropoffLng = isValidLatLng(directions.dropoff_lat, directions.dropoff_lng)
          ? directions.dropoff_lng
          : tripCoords.dropoffLng;

        if (
          pickupLat == null ||
          pickupLng == null ||
          dropoffLat == null ||
          dropoffLng == null
        ) {
          throw new Error("Route coordinates missing. Reselect pickup and drop.");
        }

        const fareResult = await estimateRideFares({
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          dropoff_lat: dropoffLat,
          dropoff_lng: dropoffLng,
          distance_km: directions.distance_km,
          duration_min: directions.duration_min,
          service_group: tab === "ambulance" ? "ambulance" : "ride",
          stops: tripCoords.stops,
          ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
        });

        if (cancelled) return;

        const distanceKm =
          fareResult.distance_km ?? directions.distance_km ?? 0;
        const durationMin =
          fareResult.duration_min ?? directions.duration_min ?? 0;

        setRouteMeta({
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          distanceKm,
          durationMin,
        });
        setMemberDiscountPercent(fareResult.discount_percent ?? 0);

        const categories = filterCategoriesForTab(allCategories, tab);

        const apiOptions: BookableOption[] = [];
        const seen = new Set<string>();

        const pushOption = (
          category: VehicleCategory,
          quote: { estimated_fare: number; original_fare?: number | null },
        ) => {
          if (seen.has(category.id)) return;
          seen.add(category.id);
          apiOptions.push({
            categoryId: category.id,
            vehicleId: String(categoryVehicleId(category)),
            name: displayVehicleName(category.name, category.slug),
            capacity: vehicleCapacityForCategory(category),
            durationMin: Math.max(1, Math.round(durationMin || 1)),
            distanceKm,
            price: quote.estimated_fare,
            originalPrice: quote.original_fare ?? null,
            image: vehicleImageForCategory(category),
          });
        };

        for (const category of categories) {
          const quote = findQuote(fareResult.quotes, category);
          if (!quote) continue;
          pushOption(category, quote);
        }

        if (apiOptions.length === 0) {
          const uniqueQuotes = new Map<
            string,
            (typeof fareResult.quotes)[string]
          >();
          for (const quote of Object.values(fareResult.quotes)) {
            uniqueQuotes.set(quote.vehicle_type_id.toLowerCase(), quote);
          }
          for (const quote of uniqueQuotes.values()) {
            const match =
              allCategories.find(
                (c) =>
                  c.id.toLowerCase() === quote.vehicle_type_id.toLowerCase() ||
                  c.slug.toLowerCase() === quote.vehicle_type_id.toLowerCase() ||
                  c.name.toLowerCase() === (quote.name ?? "").toLowerCase(),
              ) ?? null;
            if (tab === "ambulance" && match && !isAmbulanceVehicle(match)) {
              continue;
            }
            if (tab === "parcel" && match) {
              const slug = `${match.slug} ${match.name}`.toLowerCase();
              if (!slug.includes("parcel") && !slug.includes("delivery")) continue;
            }
            const category: VehicleCategory = match ?? {
              id: quote.vehicle_type_id,
              slug: quote.vehicle_type_id,
              name: quote.name ?? quote.vehicle_type_id,
              description: null,
              base_fare: quote.estimated_fare,
              per_km_rate: 0,
              icon_url: null,
              service_group: "ride",
            };
            if (tab === "ambulance" && !match) {
              const fake = {
                slug: quote.name ?? quote.vehicle_type_id,
                name: quote.name ?? quote.vehicle_type_id,
              };
              if (!isAmbulanceVehicle(fake)) continue;
            }
            if (tab !== "ambulance" && tab !== "parcel" && !isListedRideCategory(category)) {
              continue;
            }
            pushOption(category, quote);
          }
        }

        if (apiOptions.length === 0 && tab !== "ambulance") {
          throw new Error("No fare quotes available for this route");
        }

        setOptions(apiOptions);
        const preferred =
          (categoryParam &&
            apiOptions.find((o) => o.categoryId === categoryParam)
              ?.categoryId) ||
          (vehicleParam &&
            apiOptions.find((o) => o.vehicleId === vehicleParam)?.categoryId) ||
          "";
        setSelectedCategoryId(preferred);
      } catch (err) {
        if (cancelled) return;
        setOptions([]);
        setSelectedCategoryId("");
        setLoadError(
          err instanceof Error
            ? err.message
            : "Unable to load fares for this route",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickup,
    dropoff,
    categoryParam,
    vehicleParam,
    tab,
    reloadKey,
    stopsSignature,
    scheduledAt,
  ]);

  const rideOptions = useMemo(() => {
    if (!appliedCoupon?.coupon) return options;
    return options.map((option) => {
      const base = option.price;
      const discounted = couponFinalAmount(
        appliedCoupon.coupon,
        base,
        option.categoryId,
      );
      const priorOriginal =
        option.originalPrice != null && option.originalPrice > base
          ? option.originalPrice
          : base;
      return {
        ...option,
        price: discounted,
        originalPrice:
          discounted < priorOriginal ? priorOriginal : option.originalPrice,
      };
    });
  }, [options, appliedCoupon]);

  if (!pickup || !dropoff) {
    return null;
  }

  const selectedOption =
    rideOptions.find((v) => v.categoryId === selectedCategoryId) ?? null;
  const selectedBaseOption =
    options.find((v) => v.categoryId === selectedCategoryId) ?? null;

  const tripExtras = {
    pickupLat: routeMeta.pickupLat,
    pickupLng: routeMeta.pickupLng,
    dropoffLat: routeMeta.dropoffLat,
    dropoffLng: routeMeta.dropoffLng,
    distanceKm: routeMeta.distanceKm,
    durationMin: routeMeta.durationMin,
    payment: payment.id as PaymentMethod,
    stops,
    promoCode: appliedCoupon?.coupon.code,
    scheduledAt: scheduledAt || undefined,
    notes: notes.trim() || undefined,
  };

  const bookReturnPath = selectedOption
    ? buildBookUrl(pickup, dropoff, tab, selectedOption.vehicleId, {
        ...tripExtras,
        categoryId: selectedOption.categoryId,
      })
    : (() => {
        const qs = searchParams.toString();
        return qs ? `${ROUTES.book}?${qs}` : ROUTES.book;
      })();

  const displayFare = selectedOption?.price ?? 0;
  const isAmbulanceTab = tab === "ambulance";
  const theme = isAmbulanceTab ? ambulanceBookTheme : rideBookTheme;
  const canBookAmbulanceWithoutQuote =
    isAmbulanceTab &&
    !isLoading &&
    !loadError &&
    rideOptions.length === 0 &&
    routeMeta.pickupLat != null &&
    routeMeta.dropoffLat != null;
  const canBook =
    !isLoading &&
    !loadError &&
    !isBooking &&
    (Boolean(selectedOption) || canBookAmbulanceWithoutQuote);

  const openLocation = (
    field: "pickup" | "dropoff" | "stop",
    stopIndex?: number,
  ) => {
    router.push(
      buildLocationSearchUrl({
        field,
        returnTo: buildBookUrl(
          pickup,
          dropoff,
          tab,
          selectedOption?.vehicleId,
          tripExtras,
        ),
        pickup,
        dropoff,
        tab,
        coords: {
          pickupLat: routeMeta.pickupLat,
          pickupLng: routeMeta.pickupLng,
          dropoffLat: routeMeta.dropoffLat,
          dropoffLng: routeMeta.dropoffLng,
        },
        stops,
        stopIndex,
      }),
    );
  };

  const cyclePayment = () => {
    setPaymentIndex((prev) => (prev + 1) % PAYMENT_METHODS.length);
  };

  const handleWomenSafetyChoice = (enabled: boolean) => {
    setPreferWomenRiders(enabled);
    setPreferWomenOpen(false);
    setConfirmOpen(true);
    setBookingError(null);
  };

  const confirmBooking = async () => {
    if ((!selectedOption && !canBookAmbulanceWithoutQuote) || isBooking) return;
    if (!isAuthenticated()) {
      router.replace(getProtectedPath(bookReturnPath));
      return;
    }
    if (
      routeMeta.pickupLat == null ||
      routeMeta.pickupLng == null ||
      routeMeta.dropoffLat == null ||
      routeMeta.dropoffLng == null
    ) {
      setLoadError("Route coordinates missing. Please reselect pickup and drop.");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      await warmBackend();
      const sessionOk = await ensureValidSession();
      if (!sessionOk) {
        setPostLoginRedirect(bookReturnPath);
        router.replace(getProtectedPath(bookReturnPath));
        return;
      }

      await assertNoBlockingActiveRide();

      const ride = await bookRideWithRetry({
        pickup_address: pickup,
        dropoff_address: dropoff,
        pickup_lat: routeMeta.pickupLat,
        pickup_lng: routeMeta.pickupLng,
        dropoff_lat: routeMeta.dropoffLat,
        dropoff_lng: routeMeta.dropoffLng,
        vehicle_category_id: selectedOption?.categoryId,
        ride_type: isAmbulanceTab ? "EMERGENCY" : "NORMAL",
        prefer_women_riders: preferWomenRiders,
        women_safety_enabled: preferWomenRiders,
        payment_method: payment.id as PaymentMethod,
        distance_km: routeMeta.distanceKm,
        duration_min: routeMeta.durationMin,
        stops,
        promo_code: appliedCoupon?.coupon.code,
        scheduled_at: scheduledAt || undefined,
        notes:
          notes.trim() ||
          (isAmbulanceTab ? "Emergency medical transport" : undefined),
        booking_purpose: tab === "parcel" ? "PARCEL" : "RIDE",
        is_emergency: isAmbulanceTab,
      });

      setConfirmOpen(false);
      const toast = scheduledAt ? "scheduled" : "booked";
      saveLastBookedRide(ride);
      if (ride.requires_rider_preference_choice) {
        router.push(
          `${ROUTES.bookings}?preference=${encodeURIComponent(ride.id)}&toast=${toast}`,
        );
        return;
      }

      router.push(`${ROUTES.bookings}?toast=${toast}&highlight=${encodeURIComponent(ride.id)}`);
    } catch (err) {
      if (err instanceof ActiveRideBlockError) {
        showBlockedRide(err.ride);
        setConfirmOpen(false);
        setBookingError(null);
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Unable to complete booking. Please try again.";
      if (isAuthErrorMessage(message)) {
        setPostLoginRedirect(bookReturnPath);
        router.replace(getProtectedPath(bookReturnPath));
        return;
      }
      if (isActiveRideBlockingError(message)) {
        setConfirmOpen(false);
        setBookingError(null);
        try {
          const active = await getBlockingActiveRide();
          if (active) {
            showBlockedNotice({ ride: active });
            return;
          }
        } catch {
          // Fall through to message-only notice.
        }
        showBlockedNotice({ message });
        return;
      }
      setBookingError(message);
    } finally {
      setIsBooking(false);
    }
  };

  const handleBook = () => {
    if (!selectedOption && !canBookAmbulanceWithoutQuote) return;
    if (!isAuthenticated()) {
      router.replace(getProtectedPath(bookReturnPath));
      return;
    }
    void guardBooking(() => {
      if (tab === "ambulance" || tab === "parcel") {
        setPreferWomenRiders(false);
        setConfirmOpen(true);
        return;
      }
      setPreferWomenOpen(true);
    });
  };

  const scheduleLabel = scheduledAt
    ? formatScheduleLabel(scheduledAt, "")
    : "Leave now";

  return (
    <div className={cn("flex min-h-[100dvh] w-full min-w-0 flex-col overflow-x-clip font-sans", theme.pageBg)}>
      <header className={cn("sticky top-0 z-40 border-b backdrop-blur-md", theme.headerBorder, theme.headerBg)}>
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-3 py-3 min-[400px]:px-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.push(ROUTES.home)}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition active:scale-95",
              theme.backBtn,
            )}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className={cn("text-[10px] font-semibold tracking-[0.2em] uppercase", theme.eyebrow)}>
              {tab === "ambulance"
                ? "Emergency"
                : tab === "parcel"
                  ? "Delivery"
                  : "Book ride"}
            </p>
            <h1 className={cn("min-w-0 truncate font-heading text-lg font-semibold tracking-tight sm:text-xl", theme.title)}>
              {tab === "ambulance"
                ? "Choose ambulance"
                : tab === "parcel"
                  ? "Choose delivery vehicle"
                  : "Choose a ride"}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full min-w-0 max-w-6xl flex-1 grid-cols-1 gap-4 px-3 pb-[calc(14.5rem+env(safe-area-inset-bottom))] pt-3 min-[400px]:px-4 sm:gap-6 sm:px-6 sm:pb-[calc(15rem+env(safe-area-inset-bottom))] sm:pt-5 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] md:items-start md:pb-[calc(15.5rem+env(safe-area-inset-bottom))] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:gap-8 lg:px-10 lg:pb-[calc(16rem+env(safe-area-inset-bottom))] lg:pt-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]">
        <div className="flex min-w-0 flex-col">
          <AnimateIn>
            <section className={cn("rounded-2xl border bg-white p-3.5 shadow-[0_12px_32px_-24px_rgba(40,54,20,0.35)] min-[400px]:p-4 sm:p-5", theme.card)}>
              <button
                type="button"
                onClick={() => openLocation("pickup")}
                className="flex w-full min-w-0 items-start gap-2.5 text-left"
              >
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                <span className={cn("min-w-0 flex-1 truncate text-[14px] font-semibold leading-snug sm:text-[15px]", theme.ink)}>
                  {pickup}
                </span>
              </button>
              <button
                type="button"
                onClick={() => openLocation("dropoff")}
                className="mt-2 flex w-full min-w-0 items-start gap-2.5 text-left"
              >
                <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2", theme.dropDot)} />
                <span className={cn("min-w-0 flex-1 truncate text-[13px] font-medium leading-snug sm:text-[14px]", theme.muted)}>
                  {dropoff}
                </span>
              </button>

              <div className={cn("mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-semibold", theme.ink)}>
                {tab !== "ambulance" ? (
                  <button
                    type="button"
                    onClick={() => setScheduleOpen(true)}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#e8eed8] bg-[#f8faf2] px-2.5 py-1.5 text-left transition hover:border-[#C6E31A]/55 hover:bg-white"
                  >
                    <Clock3 className="h-4 w-4 shrink-0 text-[#5a7a12]" strokeWidth={1.85} />
                    <span className="min-w-0 truncate">
                      {scheduledAt ? scheduleLabel : "When to go"}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#5a7a12]/60" />
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 shrink-0" strokeWidth={1.85} />
                    Leave now
                  </span>
                )}
                {routeMeta.distanceKm != null ? (
                  <span className={theme.ink}>
                    {routeMeta.distanceKm.toFixed(1)} km
                    {routeMeta.durationMin != null
                      ? ` · ${Math.round(routeMeta.durationMin)} min`
                      : ""}
                  </span>
                ) : null}
              </div>

              <label className="mt-3 block">
                <span className="sr-only">Special notes for driver</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                  placeholder={isAmbulanceTab ? "Patient notes for crew (optional)" : "Special notes for driver (optional)"}
                  maxLength={200}
                  className={cn("h-11 w-full rounded-xl border px-3.5 text-sm outline-none focus:ring-2", theme.input)}
                />
              </label>

              {memberDiscountPercent > 0 ? (
                <p className="mt-2 text-xs font-semibold text-secondary">
                  {Math.round(memberDiscountPercent)}% member discount applied
                </p>
              ) : null}
            </section>
          </AnimateIn>

          <AnimateIn delay={0.04}>
            <div className={cn("mt-4 overflow-hidden rounded-2xl border shadow-[0_16px_36px_-28px_rgba(40,54,20,0.4)] md:hidden", theme.card, theme.mapShell)}>
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-white/80 uppercase">
                  Route map
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/70">
                  <MapPin className="h-3 w-3" />
                  Live preview
                </span>
              </div>
              <div className="h-[180px] w-full min-[400px]:h-[200px] sm:h-[240px]">
                {renderMap("h-full w-full border-0")}
              </div>
            </div>
          </AnimateIn>

          <div className="mt-4 flex-1 space-y-2.5 sm:mt-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/10 bg-white py-14">
                <Loader2 className={cn("h-8 w-8 animate-spin", isAmbulanceTab ? "text-[#c45c5c]" : "text-primary")} />
                <p className={cn("text-sm", theme.muted)}>
                  {isAmbulanceTab
                    ? "Loading ambulance types and live fares…"
                    : "Fetching live fares for your route…"}
                </p>
              </div>
            ) : loadError ? (
              <AnimateIn>
                <div className="rounded-2xl border border-destructive/30 bg-white px-4 py-6 text-center">
                  <p className="text-sm font-medium text-destructive">
                    {loadError}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 border-primary/30 text-primary"
                    onClick={() => setReloadKey((k) => k + 1)}
                  >
                    Retry
                  </Button>
                </div>
              </AnimateIn>
            ) : rideOptions.length === 0 && isAmbulanceTab ? (
              <AnimateIn>
                <div className={cn("rounded-2xl border bg-white px-4 py-6 text-center", theme.card)}>
                  <p className={cn("text-sm font-medium", theme.ink)}>
                    No ambulance vehicle types are configured on the server yet.
                    You can still request emergency medical transport. Call 112
                    if you are in immediate danger.
                  </p>
                  <a
                    href="tel:112"
                    className="mt-3 inline-block text-sm font-semibold text-[#c45c5c]"
                  >
                    Call 112
                  </a>
                </div>
              </AnimateIn>
            ) : (
              <Stagger className="space-y-2.5">
                {rideOptions.map((option, index) => {
                  const isSelected = selectedCategoryId === option.categoryId;
                  return (
                    <StaggerItem key={option.categoryId} index={index}>
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryId(option.categoryId)}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-2xl border bg-white px-3 py-3 text-left transition-all min-[400px]:gap-3 min-[400px]:px-3.5 sm:px-4 sm:py-3.5",
                          isSelected ? theme.selected : theme.idle,
                        )}
                      >
                        <VehicleOptionImage
                          src={option.image}
                          alt={option.name}
                          className="h-12 w-12 sm:h-14 sm:w-14"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p className={cn("text-[15px] font-semibold sm:text-base", theme.ink)}>
                              {option.name}
                            </p>
                            <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", theme.muted)}>
                              <UserRound className="h-3 w-3" strokeWidth={2} />
                              {option.capacity}
                            </span>
                          </div>
                          <p className={cn("mt-0.5 text-[12px] font-medium sm:text-[13px]", theme.muted)}>
                            {option.distanceKm.toFixed(1)} km ·{" "}
                            {option.durationMin} min trip
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <div className="text-right">
                            {option.originalPrice != null &&
                            option.originalPrice > option.price ? (
                              <p className="text-xs text-[#5a6330]/70 line-through">
                                {formatFare(option.originalPrice)}
                              </p>
                            ) : null}
                            <p className={cn("text-base font-bold sm:text-lg", theme.ink)}>
                              {option.price <= 0
                                ? "FREE"
                                : formatFare(option.price)}
                            </p>
                          </div>
                          {isSelected ? (
                            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", theme.check)}>
                              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </div>
        </div>

        <aside className="relative hidden min-w-0 md:block">
          <div className={cn("sticky top-[4.75rem] overflow-hidden rounded-2xl border shadow-[0_24px_56px_-28px_rgba(40,54,20,0.55)]", theme.card, theme.mapShell)}>
            <div className="border-b border-white/10 px-4 py-3 sm:px-5 sm:py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#D4E88A]/80 uppercase">
                Route map
              </p>
              <p className="mt-0.5 font-heading text-sm font-semibold text-white">
                Live preview
              </p>
            </div>
            <div className="relative h-[min(48vh,360px)] w-full lg:h-[min(56vh,480px)]">
              {renderMap("absolute inset-0 h-full w-full border-0")}
            </div>
          </div>
        </aside>
      </div>

      <div className={cn("fixed inset-x-0 bottom-0 z-30 border-t bg-white/98 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-18px_rgba(40,54,20,0.28)] backdrop-blur-md", theme.footerBorder)}>
        <div className="mx-auto w-full max-w-6xl px-3 pt-2.5 min-[400px]:px-4 sm:px-6 sm:pt-3 lg:px-10">
          <div className="mb-2 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
            <button
              type="button"
              onClick={cyclePayment}
              className={cn("flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition", theme.footerBtn)}
            >
              <Banknote className={cn("h-4 w-4 shrink-0", isAmbulanceTab ? "text-[#c45c5c]" : "text-[#B8D926]")} />
              <span className="truncate">Pay · {payment.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
            </button>
            <button
              type="button"
              onClick={() => setOffersOpen(true)}
              className={cn("flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition", theme.footerBtn)}
            >
              <Percent className={cn("h-4 w-4 shrink-0", isAmbulanceTab ? "text-[#c45c5c]" : "text-[#B8D926]")} />
              <span className="truncate">
                {appliedCoupon ? appliedCoupon.coupon.code : "Offers"}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#7a8448]" />
            </button>
          </div>

          {tab !== "ambulance" ? (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="mb-2 flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#e8eed8] bg-[#f8faf2] px-3 py-2.5 text-left transition hover:border-[#C6E31A]/55 hover:bg-white"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <Clock3 className="h-4 w-4 shrink-0 text-[#5a7a12]" strokeWidth={1.85} />
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[#5a7a12]">
                    {scheduledAt ? "Reschedule" : "When to go"}
                  </span>
                  <span className="block truncate text-sm font-semibold text-[#111411]">
                    {scheduledAt ? scheduleLabel || "Scheduled" : "Leave now"}
                  </span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#5a7a12]/55" />
            </button>
          ) : null}

          <Button
            type="button"
            onClick={handleBook}
            disabled={!canBook || isBooking}
            className={cn(
              "h-12 w-full rounded-2xl text-sm tracking-wide sm:h-[3.15rem] sm:text-base",
              canBook && !isBooking
                ? isAmbulanceTab
                  ? theme.cta
                  : BRAND_CTA_LIME
                : theme.ctaDisabled,
            )}
          >
            {isBooking ? (
              <>
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                {isAmbulanceTab ? "Booking ambulance…" : "Booking your ride…"}
              </>
            ) : canBookAmbulanceWithoutQuote ? (
              "Book ambulance for free"
            ) : !selectedOption ? (
              isAmbulanceTab ? "Select ambulance" : "Select a ride"
            ) : scheduledAt ? (
              `Schedule ${selectedOption.name} · ${displayFare <= 0 ? "FREE" : formatFare(displayFare)}`
            ) : isAmbulanceTab ? (
              `Book ambulance for free · ${displayFare <= 0 ? "FREE" : formatFare(displayFare)}`
            ) : (
              `Book ${selectedOption.name} · ${displayFare <= 0 ? "FREE" : formatFare(displayFare)}`
            )}
          </Button>
          {bookingError ? (
            <p className="mt-2 text-center text-xs font-medium text-destructive">
              {bookingError}
            </p>
          ) : null}
        </div>
      </div>

      <PreferWomenCaptainsDialog
        open={preferWomenOpen}
        onEnable={() => handleWomenSafetyChoice(true)}
        onSkip={() => handleWomenSafetyChoice(false)}
      />

      {tab !== "ambulance" ? (
        <WhenToGoDialog
          open={scheduleOpen}
          initialIso={scheduledAt || null}
          confirming={confirmingSchedule}
          onCancel={() => setScheduleOpen(false)}
          onConfirm={(iso) => {
            setConfirmingSchedule(true);
            try {
              applyBookSchedule(iso);
              setScheduleOpen(false);
            } finally {
              setConfirmingSchedule(false);
            }
          }}
          onLeaveNow={() => {
            applyBookSchedule(null);
            setScheduleOpen(false);
          }}
        />
      ) : null}

      {blockDialog}

      <BookingConfirmDialog
        open={confirmOpen}
        isLoading={isBooking}
        pickup={pickup}
        dropoff={dropoff}
        vehicleName={
          selectedOption?.name ?? (isAmbulanceTab ? "Ambulance" : "Ride")
        }
        fareLabel={
          selectedOption
            ? displayFare <= 0
              ? "FREE"
              : formatFare(displayFare)
            : isAmbulanceTab
              ? "To be confirmed"
              : "FREE"
        }
        paymentLabel={payment.label}
        scheduleLabel={scheduledAt ? scheduleLabel : null}
        womenSafetyEnabled={preferWomenRiders}
        onConfirm={() => void confirmBooking()}
        onBack={() => {
          if (isBooking) return;
          setConfirmOpen(false);
        }}
      />

      <BookingOffersSheet
        open={offersOpen}
        orderAmount={selectedBaseOption?.price ?? 0}
        vehicleTypeId={selectedBaseOption?.categoryId}
        appliedCode={appliedCoupon?.coupon.code}
        onClose={() => setOffersOpen(false)}
        onApply={setAppliedCoupon}
        onClear={() => setAppliedCoupon(null)}
      />

    </div>
  );
}
