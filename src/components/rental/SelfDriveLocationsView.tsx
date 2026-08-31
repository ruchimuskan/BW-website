"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bike,
  Car,
  Check,
  ChevronLeft,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppFooter } from "@/components/layout/AppFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  buildRentalContinueUrl,
  SELF_DRIVE_LOCATIONS,
  type SelfDriveLocation,
} from "@/constants/home-booking";
import { ROUTES } from "@/constants/routes";
import { allowDemoDataFallbacks } from "@/lib/app-env";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { getSelfDriveLocations } from "@/lib/home-api";
import { cn } from "@/lib/utils";

export function SelfDriveLocationsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nearbyLabel = searchParams.get("pickup");

  const [locations, setLocations] = useState<SelfDriveLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const hubs = await getSelfDriveLocations();
        if (cancelled) return;

        if (hubs.length > 0) {
          setLocations(hubs);
          const nearest = hubs.find((l) => l.nearest) ?? hubs[0];
          setSelectedId(nearest.id);
          return;
        }

        if (allowDemoDataFallbacks()) {
          setLocations([...SELF_DRIVE_LOCATIONS]);
          const nearest =
            SELF_DRIVE_LOCATIONS.find((l) => l.nearest) ?? SELF_DRIVE_LOCATIONS[0];
          setSelectedId(nearest.id);
        } else {
          setLocations([]);
          setLoadError("No self-drive pickup hubs are available right now.");
        }
      } catch (err) {
        if (cancelled) return;
        if (allowDemoDataFallbacks()) {
          setLocations([...SELF_DRIVE_LOCATIONS]);
          const nearest =
            SELF_DRIVE_LOCATIONS.find((l) => l.nearest) ?? SELF_DRIVE_LOCATIONS[0];
          setSelectedId(nearest.id);
        } else {
          setLocations([]);
          setLoadError(
            err instanceof Error ? err.message : "Unable to load pickup hubs",
          );
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

  const nearest = useMemo(
    () => locations.find((l) => l.nearest) ?? locations[0],
    [locations],
  );

  const selected = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? nearest,
    [locations, selectedId, nearest],
  );

  const continueWith = (location: SelfDriveLocation) => {
    router.push(
      buildRentalContinueUrl({
        pickup: location.name,
        pickupLat: location.lat,
        pickupLng: location.lng,
        mode: "self",
        hub: location.id,
      }),
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#f7fbe8] pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#e8f0c8] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push(ROUTES.home)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8f0c8] bg-white text-[#38471B] transition-colors hover:border-[#B8D926]/50 hover:bg-[#f7fbe8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D926]/40"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#B8D926] uppercase">
              Self drive
            </p>
            <h1 className="font-heading text-lg font-semibold tracking-tight text-[#38471B] sm:text-xl">
              Pickup locations
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="rounded-2xl border border-[#e8f0c8] bg-white px-4 py-4 shadow-[0_12px_32px_-24px_rgba(56,71,27,0.22)] sm:px-5 sm:py-5">
          <h2 className="font-heading text-base font-semibold text-[#38471B] sm:text-lg">
            Choose a pickup hub
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#5a6330]">
            Select the nearest self-drive point. Cars and bikes shown are synced
            from the vehicle panel.
          </p>
          {nearbyLabel ? (
            <p className="mt-3 inline-flex max-w-full items-start gap-2 rounded-full bg-[#f7fbe8] px-3 py-1.5 text-xs text-[#4a5228] ring-1 ring-[#e8f0c8]">
              <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B8D926]" />
              <span className="min-w-0">
                Near your current area · {nearbyLabel}
              </span>
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 py-16 text-sm text-[#5a6330]">
            <Loader2 className="h-5 w-5 animate-spin text-[#B8D926]" />
            Loading pickup hubs…
          </div>
        ) : locations.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#e8f0c8] bg-white px-4 py-10 text-center sm:px-6">
            <p className="text-sm text-[#5a6330]">
              {loadError ?? "No pickup hubs available at the moment."}
            </p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-3 text-sm font-semibold text-[#38471B] underline-offset-2 hover:underline"
            >
              Refresh
            </button>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:gap-4 md:grid-cols-2">
            {locations.map((location) => {
              const active = selectedId === location.id;
              const stock = location.cars + location.bikes;
              return (
                <li key={location.id} className={cn(active && "md:col-span-2")}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(location.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(location.id);
                      }
                    }}
                    className={cn(
                      "relative w-full cursor-pointer overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all duration-200 sm:p-5",
                      active
                        ? "border-[#B8D926]/45 shadow-[0_18px_40px_-22px_rgba(56,71,27,0.35)] ring-1 ring-[#B8D926]/20"
                        : "border-[#e8f0c8] hover:-translate-y-0.5 hover:border-[#B8D926]/35 hover:shadow-[0_16px_36px_-22px_rgba(56,71,27,0.22)]",
                    )}
                  >
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-1 bg-[#B8D926]"
                      />
                    ) : null}

                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-[#B8D926] text-[#38471B]"
                            : "bg-[#f7fbe8] text-[#38471B] ring-1 ring-[#e8f0c8]",
                        )}
                      >
                        {active ? (
                          <Check className="h-5 w-5" strokeWidth={2.4} />
                        ) : (
                          <MapPin className="h-5 w-5" strokeWidth={2.1} />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-heading text-[15px] font-semibold text-[#38471B] sm:text-base">
                            {location.name}
                          </h2>
                          {location.nearest ? (
                            <span className="rounded-full bg-[#B8D926] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#38471B] uppercase">
                              Nearest
                            </span>
                          ) : null}
                          {stock === 0 ? (
                            <span className="rounded-full bg-[#f4f1ee] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#7a6a5a] uppercase">
                              Low stock
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-[#5a6330]">
                          {location.address}
                        </p>
                      </div>

                      {location.distanceKm > 0 ? (
                        <span className="shrink-0 rounded-full bg-[#f7fbe8] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#38471B] ring-1 ring-[#e8f0c8]">
                          {location.distanceKm.toFixed(1)} km
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-2">
                      <FleetPill
                        icon={Car}
                        count={location.cars}
                        label="Cars"
                        active={active}
                      />
                      <FleetPill
                        icon={Bike}
                        count={location.bikes}
                        label="Bikes"
                        active={active}
                      />
                    </div>

                    {active ? (
                      <div className="mt-4">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            continueWith(location);
                          }}
                          className={cn(
                            "h-12 w-full rounded-2xl text-sm sm:h-[3.15rem] sm:text-[15px]",
                            BRAND_CTA_LIME,
                          )}
                        >
                          <span className="flex w-full items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#38471B]/12">
                              <MapPin className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-left font-semibold tracking-wide">
                              {location.nearest
                                ? "Continue with nearest pickup"
                                : `Continue with ${location.name}`}
                            </span>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#38471B]/10">
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </span>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[#e8f0c8] bg-white px-4 py-3.5 text-xs leading-relaxed text-[#5a6330] sm:text-[13px]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B8D926]" />
          Hub availability updates in real time. Choose a location with cars or
          bikes in stock for the smoothest pickup.
        </div>

        {selected ? (
          <p className="sr-only">Selected hub: {selected.name}</p>
        ) : null}
      </main>

      <AppFooter className="mb-2 lg:mb-0" />
      <BottomNav />
    </div>
  );
}

function FleetPill({
  icon: Icon,
  count,
  label,
  active,
}: {
  icon: typeof Car;
  count: number;
  label: string;
  active: boolean;
}) {
  const empty = count === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        empty
          ? "bg-[#f7f6f3] text-[#7a8448] ring-[#ece8dc]"
          : active
            ? "bg-[#f7fbe8] text-[#38471B] ring-[#e8f0c8]"
            : "bg-white text-[#38471B] ring-[#e8f0c8]",
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5 shrink-0", empty ? "text-[#b8b48a]" : "text-[#B8D926]")}
        strokeWidth={1.85}
      />
      {count} {label}
    </span>
  );
}
