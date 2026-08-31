"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { VehicleOptionImage } from "@/components/booking/VehicleOptionImage";
import { ROUTES } from "@/constants/routes";
import { getProtectedPath, isAuthenticated } from "@/lib/auth-session";
import { getRentalCategories, type VehicleCategory } from "@/lib/home-api";
import { allowDemoDataFallbacks } from "@/lib/app-env";
import {
  ActiveRideBlockError,
  assertNoBlockingActiveRide,
} from "@/lib/active-ride-guard";
import { bookRide } from "@/lib/ride-api";
import { vehicleImageForCategory } from "@/lib/vehicle-map";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";
import { useActiveRideGuard } from "@/hooks/useActiveRideGuard";

const FALLBACK_RENTALS: VehicleCategory[] = [
  {
    id: "rental-bike",
    slug: "rental-bike",
    name: "Rental Bike",
    description: "Rent a bike by the day",
    base_fare: 199,
    per_km_rate: 8,
    icon_url: null,
    service_group: "rental",
  },
  {
    id: "rental-car",
    slug: "rental-car",
    name: "Rental Car",
    description: "Flexible car rental packages",
    base_fare: 999,
    per_km_rate: 12,
    icon_url: null,
    service_group: "rental",
  },
];

export function RentalView() {
  const router = useRouter();
  const { blockDialog, showBlockedRide } = useActiveRideGuard();
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rentalHours, setRentalHours] = useState(4);
  const [pickup, setPickup] = useState("");
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hourOptions = [2, 4, 6, 8, 12];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPickup(params.get("pickup") || "");
    const plat = params.get("plat");
    const plng = params.get("plng");
    if (plat != null && plat !== "") setPickupLat(Number(plat));
    if (plng != null && plng !== "") setPickupLng(Number(plng));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getRentalCategories();
        if (!cancelled) {
          if (items.length > 0) {
            setCategories(items);
          } else if (allowDemoDataFallbacks()) {
            setCategories(FALLBACK_RENTALS);
          } else {
            setCategories([]);
            setError("No rental vehicles are available right now. Please try again later.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          if (allowDemoDataFallbacks()) {
            setCategories(FALLBACK_RENTALS);
          } else {
            setCategories([]);
          }
          setError(err instanceof Error ? err.message : "Unable to load rental options");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const reloadCategories = () => {
    setIsLoading(true);
    setError(null);
    void getRentalCategories()
      .then((items) => {
        if (items.length > 0) {
          setCategories(items);
          return;
        }
        if (allowDemoDataFallbacks()) {
          setCategories(FALLBACK_RENTALS);
        } else {
          setCategories([]);
          setError("No rental vehicles are available right now.");
        }
      })
      .catch((err) => {
        if (allowDemoDataFallbacks()) {
          setCategories(FALLBACK_RENTALS);
        } else {
          setCategories([]);
        }
        setError(err instanceof Error ? err.message : "Unable to load rental options");
      })
      .finally(() => setIsLoading(false));
  };

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  async function handleConfirm() {
    if (!selected) return;
    if (!isAuthenticated()) {
      router.replace(getProtectedPath(ROUTES.rental));
      return;
    }
    if (!pickup.trim()) {
      setError("Please set a pickup location from the home screen first.");
      return;
    }
    if (pickupLat == null || pickupLng == null) {
      setError("Pickup coordinates missing. Set pickup from home using current location or search.");
      return;
    }

    setIsBooking(true);
    setError(null);
    try {
      await assertNoBlockingActiveRide();

      const ride = await bookRide({
        pickup_address: pickup,
        dropoff_address: pickup,
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        dropoff_lat: pickupLat,
        dropoff_lng: pickupLng,
        vehicle_category_id: selected.id,
        payment_method: "CASH",
        rental_hours: rentalHours,
      });
      const params = new URLSearchParams({
        rideId: ride.id,
        pickup,
        dropoff: pickup,
        plat: String(pickupLat),
        plng: String(pickupLng),
        dlat: String(pickupLat),
        dlng: String(pickupLng),
        tab: "rides",
        vehicle: "cab",
      });
      router.push(`${ROUTES.bookSearching}?${params.toString()}`);
    } catch (err) {
      if (err instanceof ActiveRideBlockError) {
        showBlockedRide(err.ride);
        return;
      }
      setError(err instanceof Error ? err.message : "Unable to confirm rental");
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full min-w-0 flex-col overflow-x-clip bg-[#f7fbe8] pb-8">
      <header className="sticky top-0 z-40 border-b border-[#e8f0c8] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8f0c8] bg-white text-[#38471B] transition hover:border-[#B8D926]/50 hover:bg-[#f7fbe8] active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#B8D926] uppercase">
              Self drive
            </p>
            <h1 className="font-heading text-lg font-semibold tracking-tight text-[#38471B] sm:text-xl">
              Vehicle rental
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-4 rounded-2xl border border-[#e8f0c8] bg-white p-4 shadow-[0_12px_32px_-24px_rgba(56,71,27,0.22)] sm:mb-5 sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#B8D926] uppercase">
            Pickup location
          </p>
          <p className="mt-1 font-heading text-base font-semibold text-[#38471B]">
            {pickup || "Set pickup on home screen"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#5a6330]">
            Choose hours and a vehicle. Packages are synced from the vehicle panel.
          </p>
        </div>

        <div className="mb-4 rounded-2xl border border-[#e8f0c8] bg-white p-4 sm:mb-5 sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#B8D926] uppercase">
            Rental hours
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {hourOptions.map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => setRentalHours(hours)}
                className={cn(
                  "min-h-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  rentalHours === hours
                    ? "bg-[#B8D926] text-[#38471B] shadow-sm"
                    : "bg-[#f7fbe8] text-[#5a6330] ring-1 ring-[#e8f0c8] hover:border-[#B8D926]/40 hover:text-[#38471B]"
                )}
              >
                {hours} hrs
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#B8D926]" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e8f0c8] bg-white px-4 py-10 text-center sm:px-6">
            <p className="text-sm text-[#5a6330]">
              {error ?? "Rental vehicles are not available at the moment."}
            </p>
            <button
              type="button"
              onClick={reloadCategories}
              className="mt-3 text-sm font-semibold text-[#38471B] underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const isSelected = selectedId === category.id;
              const image = vehicleImageForCategory(category);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedId(category.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border bg-white p-3.5 text-left transition-all sm:gap-4 sm:p-4",
                    isSelected
                      ? "border-[#B8D926]/45 shadow-[0_12px_28px_-18px_rgba(56,71,27,0.28)] ring-1 ring-[#B8D926]/25"
                      : "border-[#e8f0c8] hover:border-[#B8D926]/35"
                  )}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f7fbe8] sm:h-16 sm:w-16">
                    <VehicleOptionImage
                      src={image}
                      alt={category.name}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-[15px] font-semibold text-[#38471B] sm:text-base">{category.name}</h3>
                    <p className="mt-0.5 text-sm text-[#5a6330]">
                      {category.description ?? "Daily rental package"}
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-[#38471B]">
                      ₹{Math.round(category.base_fare)}/day
                    </p>
                    <p className="text-xs text-[#7a8448]">
                      Minimum {Math.round(category.included_hours ?? 4)} hrs · ₹
                      {Math.round(category.per_hour_rate ?? 0)}/extra hr
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {error && categories.length > 0 ? (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        ) : null}

        <button
          type="button"
          disabled={!selected || isBooking}
          onClick={() => void handleConfirm()}
          className={cn(
            "mt-6 h-12 w-full rounded-2xl text-sm sm:mt-8 sm:h-[3.15rem] sm:text-base",
            selected && !isBooking ? BRAND_CTA_LIME : "bg-[#e8f0c8] font-semibold text-[#5a6330]/70",
          )}
        >
          {isBooking ? "Booking..." : "Confirm rental"}
        </button>
      </div>

      {blockDialog}
    </div>
  );
}
