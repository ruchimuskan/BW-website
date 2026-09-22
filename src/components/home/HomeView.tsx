"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, MapPinned, Menu, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { HomeBookingPanel } from "@/components/home/HomeBookingPanel";
import { ServiceTile } from "@/components/home/ServiceTile";
import { AppFooter } from "@/components/layout/AppFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useBackendGpsPickup } from "@/hooks/useBackendGpsPickup";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import { fetchFreeRideEligibility } from "@/lib/free-rides";
import {
  normalizeScheduledAt,
  patchLandingBookingSchedule,
  syncScheduledAtQuery,
} from "@/lib/landing-booking-draft";
import { syncCurrentLocationPlace } from "@/lib/profile-api";
import {
  formatActiveRideStatus,
  buildActiveRideViewUrl,
} from "@/lib/active-ride-guard";
import { isRideInProgress, isRideTerminal, isSearchingForCaptain, resolveRideAddress } from "@/lib/ride-api";
import { parseStopsFromParams, type TripStop } from "@/lib/trip-stops";
import { transitions } from "@/lib/motion";
import {
  displayVehicleName,
  homeRouteForCategory,
  isListedRideCategory,
  uniqueVehicleCategories,
  vehicleImageForCategory,
} from "@/lib/vehicle-map";
import { isAmbulanceVehicle, withSingleAmbulanceOption } from "@/lib/home-api";
import { isPlaceholderDisplayName } from "@/lib/auth-session";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { BrandPromoBanner } from "@/components/brand/BrandPromoBanner";
import { ViewBookingsButton } from "@/components/bookings/ViewBookingsButton";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import { resolveMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export function HomeView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [dropoffLat, setDropoffLat] = useState<number | undefined>();
  const [dropoffLng, setDropoffLng] = useState<number | undefined>();
  const [stops, setStops] = useState<TripStop[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [freeRideMessage, setFreeRideMessage] = useState<string | null>(null);
  const user = useAuthUser();
  const { data: dashboard, unreadCount, isLoading: dashboardLoading, error: dashboardError } =
    useHomeDashboard();
  const greeting = dashboard?.greeting_name?.trim() || "";
  const displayName =
    (!isPlaceholderDisplayName(greeting) ? greeting : "") ||
    user.name?.trim() ||
    (user.isLoading ? "…" : "");
  const hasUrlPickup = Boolean(searchParams.get("pickup")?.trim());
  const gpsPickup = useBackendGpsPickup(!hasUrlPickup);
  const locationSynced = useRef(false);

  const rideCategories = withSingleAmbulanceOption(
    uniqueVehicleCategories(
      (dashboard?.vehicle_categories ?? []).filter(
        (category) =>
          (category.service_group ?? "ride") !== "rental" &&
          isListedRideCategory(category),
      ),
    ),
  );

  const rideImages = new Set<string>();
  const services = rideCategories.map((category) => ({
    key: category.id,
    name: displayVehicleName(category.name, category.slug),
    description:
      category.description ??
      `Book ${displayVehicleName(category.name, category.slug)} instantly`,
    image: vehicleImageForCategory(category, rideImages),
    route: homeRouteForCategory(category),
    isAmbulance: isAmbulanceVehicle(category),
  }));

  const rentalImages = new Set<string>();
  const rentalServices = uniqueVehicleCategories(
    dashboard?.rental_categories ?? [],
  ).map((category) => ({
    key: category.id,
    name: category.name,
    description: category.description ?? "Daily rental package",
    image: vehicleImageForCategory(category, rentalImages),
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchFreeRideEligibility()
      .then((eligibility) => {
        if (cancelled || !eligibility.enabled) return;
        setFreeRideMessage(
          eligibility.message || "First 5 rides free (up to 5 km)",
        );
      })
      .catch(() => {
        if (!cancelled) setFreeRideMessage(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const urlPickup = searchParams.get("pickup");
    const urlDropoff = searchParams.get("dropoff");
    const plat = searchParams.get("plat");
    const plng = searchParams.get("plng");
    const dlat = searchParams.get("dlat");
    const dlng = searchParams.get("dlng");

    if (urlPickup) setPickup(urlPickup);
    if (urlDropoff) setDropoff(urlDropoff);
    if (plat != null && plat !== "") setPickupLat(Number(plat));
    if (plng != null && plng !== "") setPickupLng(Number(plng));
    if (dlat != null && dlat !== "") setDropoffLat(Number(dlat));
    if (dlng != null && dlng !== "") setDropoffLng(Number(dlng));
    setStops(parseStopsFromParams(searchParams));
    const scheduled = normalizeScheduledAt(searchParams.get("scheduled_at"));
    // Home only shows a schedule when the book URL explicitly carries one the user chose.
    setScheduledAt(scheduled);
    patchLandingBookingSchedule(null);
  }, [searchParams]);

  useEffect(() => {
    if (!gpsPickup.place) return;
    const label = gpsPickup.place.label?.trim() || "Current location";
    setPickup((current) => current || label);
    setPickupLat((current) => current ?? gpsPickup.place?.latitude);
    setPickupLng((current) => current ?? gpsPickup.place?.longitude);

    if (locationSynced.current) return;
    locationSynced.current = true;
    void syncCurrentLocationPlace({
      label,
      latitude: gpsPickup.place.latitude,
      longitude: gpsPickup.place.longitude,
    });
  }, [gpsPickup.place]);

  const handleSwap = () => {
    setPickup(dropoff);
    setDropoff(pickup);
    setPickupLat(dropoffLat);
    setPickupLng(dropoffLng);
    setDropoffLat(pickupLat);
    setDropoffLng(pickupLng);
  };

  const motionEnabled = mounted && !reduceMotion;

  return (
    <div className="flex min-h-[100dvh] w-full min-w-0 overflow-x-clip bg-muted">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-h-[100dvh] w-full min-w-0 flex-1 flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-[280px]">
        {/* Hero — welcome + trip planner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#1f2a10] via-[#38471B] to-[#C4E832]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_90%_0%,rgba(212,240,90,0.42),transparent_55%),radial-gradient(ellipse_50%_50%_at_0%_80%,rgba(255,255,255,0.06),transparent_50%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#C4E832] to-transparent"
          />

          <header className="relative text-white">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-5 pb-3 sm:gap-4 sm:px-6 sm:pt-8 md:px-10 lg:px-12 lg:pt-10">
              <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-150 hover:bg-white/20 active:scale-95 sm:h-11 sm:w-11 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="relative hidden shrink-0 sm:block">
                  <div
                    aria-hidden
                    className="absolute -inset-1 rounded-full bg-[#C8E84A]/40 blur-md"
                  />
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/35 bg-white/15 font-heading text-lg font-bold text-white shadow-lg ring-2 ring-white/20 backdrop-blur-sm lg:h-14 lg:w-14 lg:text-xl">
                    {user.profileImageUrl ? (
                      <Image
                        src={user.profileImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <span suppressHydrationWarning>{user.initial}</span>
                    )}
                  </div>
                </div>

                <motion.div
                  initial={motionEnabled ? { y: 8 } : false}
                  animate={{ y: 0 }}
                  transition={transitions.fast}
                  className="min-w-0 flex-1"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-[#D4E88A]/90 uppercase sm:text-[11px]">
                      Welcome back
                    </p>
                    {!user.isLoading && user.rating > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/12 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-secondary text-secondary" strokeWidth={1.5} />
                        {user.rating}
                      </span>
                    ) : null}
                  </div>
                  <h1
                    suppressHydrationWarning
                    className="mt-0.5 break-words font-heading text-[1.35rem] font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:mt-1 sm:truncate sm:text-3xl lg:text-[2.15rem]"
                  >
                    {displayName || (user.isLoading ? "…" : "Welcome")}
                  </h1>
                  <p className="mt-1 line-clamp-2 text-xs font-light leading-snug text-white/78 sm:text-sm">
                    Ready for your next premium journey?
                  </p>
                </motion.div>
              </div>
              <Link
                href={ROUTES.notifications}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-150 hover:bg-white/20 active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full border-2 border-[#4a5824] bg-warning" />
                ) : null}
              </Link>
            </div>
          </header>

          <div className="relative mx-auto w-full min-w-0 max-w-6xl px-3 pb-7 sm:px-6 sm:pb-10 md:px-10 lg:px-12 lg:pb-12">
            <div className="grid w-full min-w-0 gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-stretch lg:gap-6">
              <motion.div
                initial={motionEnabled ? { y: 12 } : false}
                animate={{ y: 0 }}
                transition={{ ...transitions.fast, delay: motionEnabled ? 0.04 : 0 }}
                className="order-1 min-w-0 lg:order-1"
              >
                <HomeBookingPanel
                  pickup={pickup}
                  dropoff={dropoff}
                  pickupLocating={gpsPickup.locating}
                  onSwap={handleSwap}
                  coords={{
                    pickupLat,
                    pickupLng,
                    dropoffLat,
                    dropoffLng,
                  }}
                  stops={stops}
                  onRemoveStop={(index) =>
                    setStops((prev) => prev.filter((_, i) => i !== index))
                  }
                  scheduledAt={scheduledAt}
                  onScheduledAtChange={(iso) => {
                    const next = normalizeScheduledAt(iso);
                    setScheduledAt(next);
                    patchLandingBookingSchedule(next);
                    syncScheduledAtQuery(next, "");
                  }}
                />
              </motion.div>

              <motion.aside
                initial={motionEnabled ? { y: 14 } : false}
                animate={{ y: 0 }}
                transition={{ ...transitions.fast, delay: motionEnabled ? 0.08 : 0 }}
                className="order-2 flex min-w-0 flex-col gap-4 lg:order-2"
              >
                {dashboard?.active_ride &&
                !isRideTerminal(dashboard.active_ride.status) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const ride = dashboard.active_ride!;
                      router.push(buildActiveRideViewUrl(ride));
                    }}
                    className="w-full rounded-2xl border border-white/25 bg-white/95 p-4 text-left shadow-[0_16px_36px_-24px_rgba(32,42,16,0.5)] transition-all duration-150 hover:bg-white sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                        Active ride
                      </p>
                      <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        {formatActiveRideStatus(dashboard.active_ride)}
                      </span>
                    </div>
                    <p className="mt-1.5 font-heading text-base font-bold text-foreground capitalize">
                      Finish or cancel before booking another trip
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {[
                        resolveRideAddress(dashboard.active_ride.pickup_address),
                        resolveRideAddress(dashboard.active_ride.dropoff_address),
                      ]
                        .filter(Boolean)
                        .join(" → ") || "Open live tracking for trip details"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {isSearchingForCaptain(dashboard.active_ride.status)
                        ? "Tap to continue searching →"
                        : isRideInProgress(dashboard.active_ride.status)
                          ? "Tap to track live →"
                          : "Tap to view booking →"}
                    </p>
                  </button>
                ) : null}

                {dashboardError ? (
                  <div className="rounded-2xl border border-destructive/25 bg-[#fff8f8] p-4 text-left shadow-sm">
                    <p className="text-sm font-medium text-destructive">
                      Could not load home data from the server.
                    </p>
                    <p className="mt-1 text-xs text-[#5a6330]">{dashboardError}</p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-3 rounded-full border border-[#e8f0c8] bg-white px-4 py-2 text-xs font-semibold text-[#38471B] transition hover:border-[#B8D926]/50"
                    >
                      Retry
                    </button>
                  </div>
                ) : null}

                {dashboardLoading && !dashboard ? (
                  <div className="animate-pulse rounded-2xl border border-white/25 bg-white/80 p-5">
                    <div className="h-3 w-24 rounded bg-[#e8f0c8]" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-[#f7fbe8]" />
                    <div className="mt-2 h-3 w-full rounded bg-[#f7fbe8]" />
                  </div>
                ) : null}

                <div className="group/promo relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-[#283614] p-5 text-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.45)] sm:rounded-[1.35rem] sm:p-6 lg:min-h-[260px]">
                  <Image
                    src={BRAND_PHOTOS.streetCab}
                    alt=""
                    fill
                    sizes="(max-width: 1023px) 100vw, 420px"
                    className={cn(
                      BRAND_PHOTO_CLASS,
                      "pointer-events-none select-none",
                    )}
                    aria-hidden
                  />
                  <BrandImageOverlay variant="hero" />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#283614]/55 via-[#38471B]/20 to-transparent"
                  />

                  <div className="relative z-10">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur-sm sm:h-12 sm:w-12">
                        <Sparkles className="h-5 w-5 text-white" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-base font-semibold tracking-tight sm:text-lg">
                          {dashboard?.banners[0]?.title ??
                            freeRideMessage ??
                            "Ride smarter with BW Rides"}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-white/80">
                          {dashboard?.banners[0]?.subtitle ? (
                            dashboard.banners[0].subtitle
                          ) : freeRideMessage ? (
                            <>
                              Your first 5 rides can be{" "}
                              <span className="font-semibold text-[#C6E31A]">
                                FREE
                              </span>{" "}
                              under 5 km. Emergency{" "}
                              <span className="font-semibold text-[#ffb4a8]">
                                Ambulance
                              </span>{" "}
                              booking stays free.
                            </>
                          ) : (
                            <>
                              Book rides, send parcels, or request emergency{" "}
                              <span className="font-semibold text-[#ffb4a8]">
                                Ambulance
                              </span>{" "}
                              — all in one app.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[
                        { icon: Zap, label: "Fast" },
                        { icon: ShieldCheck, label: "Safe" },
                        { icon: MapPinned, label: "Live" },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="flex flex-col items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2 py-2.5 text-center backdrop-blur-sm transition-colors duration-200 hover:border-white/30 hover:bg-white/18"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                              <Icon
                                className="h-3.5 w-3.5 text-[#C8E84A]"
                                strokeWidth={2}
                              />
                            </span>
                            <span className="text-[10px] font-semibold tracking-wide text-white uppercase">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {dashboard?.nearby_drivers_count ? (
                    <p className="relative z-10 mt-5 inline-flex self-start items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full bg-emerald-400",
                          motionEnabled && "animate-pulse",
                        )}
                      />
                      {dashboard.nearby_drivers_count} captains nearby
                    </p>
                  ) : (
                    <p className="relative z-10 mt-5 text-[10px] font-semibold tracking-[0.18em] text-white/80 uppercase">
                      Premium · Safe · On time
                    </p>
                  )}
                </div>
              </motion.aside>
            </div>
          </div>
        </section>

        <main className="relative z-20 flex-1">
          {/* Choose service — lime section */}
          <section className="relative overflow-hidden bg-white">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(200,232,74,0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(184,217,38,0.08),transparent_50%)]"
            />
            <div className="relative mx-auto w-full min-w-0 max-w-6xl px-3 py-7 sm:px-6 sm:py-10 md:px-10 lg:px-12 lg:py-12">
              <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-secondary uppercase">
                    Mobility
                  </p>
                  <div className="mt-2 h-px w-14 bg-gradient-to-r from-primary via-secondary to-transparent" />
                  <h2 className="mt-2.5 font-heading text-[1.4rem] font-semibold tracking-tight text-foreground sm:text-2xl">
                    Choose service
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Select how you want to travel — each option is ready when you
                    are.
                  </p>
                </div>
                <ViewBookingsButton
                  label="My bookings"
                  variant="compact"
                  onClick={() => router.push(ROUTES.bookings)}
                />
              </div>

              <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
                {services.map((service, index) => (
                  <ServiceTile
                    key={service.key}
                    name={service.name}
                    description={service.description}
                    image={service.image}
                    index={index}
                    priority={index < 4}
                    isAmbulance={service.isAmbulance}
                    onClick={() => router.push(service.route)}
                  />
                ))}
              </div>
            </div>
          </section>

          <BrandPromoBanner
            variant="home"
            src={
              resolveMediaUrl(dashboard?.banners[0]?.image_url) ??
              BRAND_PHOTOS.promoAnytime
            }
            alt={
              dashboard?.banners[0]?.title ??
              "Ride anytime, anywhere with the BW Rides app"
            }
            href={dashboard?.banners[0]?.cta_url ?? ROUTES.start}
            fallbackSrc={BRAND_PHOTOS.promoAnytime}
          />

          {rentalServices.length > 0 ? (
          <section className="relative overflow-hidden bg-gradient-to-b from-[#f7fbe8] via-[#ffffff] to-[#f7fbe8]">
            <div className="relative mx-auto w-full min-w-0 max-w-6xl px-3 py-7 sm:px-6 sm:py-10 md:px-10 lg:px-12 lg:pb-14">
              <div className="mb-6 sm:mb-8">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-secondary uppercase">
                  Flex hire
                </p>
                <div className="mt-2 h-px w-14 bg-gradient-to-r from-primary via-secondary to-transparent" />
                <h2 className="mt-2.5 font-heading text-[1.4rem] font-semibold tracking-tight text-foreground sm:text-2xl">
                  Vehicle rental
                </h2>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Self-drive hubs or chauffeur packages — start from the Rental
                  tab above, or pick a vehicle here.
                </p>
              </div>

              <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
                {rentalServices.map((service, index) => (
                  <ServiceTile
                    key={service.key}
                    name={service.name}
                    description={service.description}
                    image={service.image}
                    index={index}
                    ctaLabel="Rent"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (pickup) params.set("pickup", pickup);
                      if (pickupLat != null)
                        params.set("plat", String(pickupLat));
                      if (pickupLng != null)
                        params.set("plng", String(pickupLng));
                      const query = params.toString();
                      router.push(
                        query ? `${ROUTES.rental}?${query}` : ROUTES.rental,
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
          ) : null}
        </main>

        <AppFooter className="mb-2 lg:mb-0" />
        <BottomNav />
      </div>
    </div>
  );
}
