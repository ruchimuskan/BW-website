"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ambulance, Car, Menu, Package, RefreshCw } from "lucide-react";
import { AppShell, useAppShellSidebar } from "@/components/layout";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import {
  BookingListCard,
  type BookingCardStatus,
} from "@/components/bookings/BookingListCard";
import { CaptainNotAssignedDialog } from "@/components/booking/CaptainNotAssignedDialog";
import { WomenRidersUnavailableDialog } from "@/components/booking/WomenRidersUnavailableDialog";
import { useNoCaptainAssignedPrompt } from "@/hooks/useNoCaptainAssignedPrompt";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ensureValidSession, isAuthErrorMessage } from "@/lib/api";
import {
  readLastBookedRide,
} from "@/lib/last-booked-ride";
import {
  continueWithAllRiders,
  getRideHistory,
  isDeliveryRide,
  isEmergencyRide,
  sortRidesByBookedAt,
  type Ride,
} from "@/lib/ride-api";
import { formatFare } from "@/lib/ride-booking";
import { buildActiveRideViewUrl } from "@/lib/active-ride-guard";
import { displayVehicleName } from "@/lib/vehicle-map";
import type { ActivityTab } from "@/types/activity";
import { brandTheme } from "@/lib/brand-theme";
import { cn } from "@/lib/utils";
import {
  getProtectedPath,
  isAuthenticated,
  setPostLoginRedirect,
} from "@/lib/auth-session";

const tabs: { id: ActivityTab; icon: typeof Car; hint: string }[] = [
  { id: "Rides", icon: Car, hint: "Your bike, auto, and cab trips" },
  {
    id: "Deliveries",
    icon: Package,
    hint: "Parcel deliveries booked from your account",
  },
  {
    id: "Emergency",
    icon: Ambulance,
    hint: "Ambulance requests booked from your account",
  },
];

function formatScheduledWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
  const date = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
  return { date, time };
}

function formatBookedWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBookedLabel(iso: string) {
  return `Booked · ${formatBookedWhen(iso)}`;
}

function mapStatus(
  status: string,
  scheduledAt?: string | null,
): BookingCardStatus {
  const upper = status.toUpperCase().replace(/[\s-]+/g, "_");
  if (upper === "COMPLETED" || upper === "COMPLETE") return "Completed";
  if (upper === "CANCELLED" || upper === "CANCELED") return "Cancelled";
  if (
    upper === "SCHEDULED" ||
    upper === "SCHEDULED_PENDING" ||
    (scheduledAt &&
      ![
        "COMPLETED",
        "COMPLETE",
        "CANCELLED",
        "CANCELED",
        "IN_PROGRESS",
        "STARTED",
        "ARRIVED",
        "DRIVER_ARRIVED",
        "ACCEPTED",
        "DRIVER_ASSIGNED",
        "OTP_VERIFIED",
        "EN_ROUTE",
        "SEARCHING",
        "SEARCHING_DRIVER",
        "REQUESTED",
        "PENDING",
      ].includes(upper))
  ) {
    return "Scheduled";
  }
  if (
    [
      "SEARCHING",
      "SEARCHING_DRIVER",
      "REQUESTED",
      "PENDING",
      "ACCEPTED",
      "DRIVER_ASSIGNED",
      "ARRIVED",
      "DRIVER_ARRIVED",
      "OTP_VERIFIED",
      "STARTED",
      "IN_PROGRESS",
      "EN_ROUTE",
    ].includes(upper)
  ) {
    return "Live";
  }
  return "Upcoming";
}

function rideSortKey(ride: Ride) {
  const parsed = new Date(ride.created_at).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toastMessage(toast: "scheduled" | "booked") {
  return toast === "scheduled"
    ? "Ride scheduled successfully. A driver will be assigned before your trip."
    : "Ride booked successfully. A driver will be assigned before your trip.";
}

export function ActivityView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sidebar = useAppShellSidebar();
  const [activeTab, setActiveTab] = useState<ActivityTab>("Rides");
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [preferenceLoading, setPreferenceLoading] = useState(false);
  const [pinnedHighlight, setPinnedHighlight] = useState<string | null>(null);
  const pendingRideIdRef = useRef<string | null>(null);
  const pendingToastRef = useRef<"scheduled" | "booked">("booked");

  const bookingsReturnPath = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${ROUTES.bookings}?${qs}` : ROUTES.bookings;
  }, [searchParams]);

  const redirectToLogin = useCallback(
    (returnPath = bookingsReturnPath) => {
      setPostLoginRedirect(returnPath);
      router.replace(getProtectedPath(returnPath));
    },
    [bookingsReturnPath, router],
  );

  const loadRides = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setIsRefreshing(true);
      else setIsLoading(true);
      setLoadError(null);
      try {
        if (!isAuthenticated()) {
          redirectToLogin();
          return;
        }
        await ensureValidSession();
        const data = await getRideHistory(1, 50);
        let items = data.items;

        const cached = readLastBookedRide();
        if (cached && !items.some((ride) => ride.id === cached.id)) {
          items = sortRidesByBookedAt([cached, ...items]);
        }

        setRides(sortRidesByBookedAt(items));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load bookings";
        if (isAuthErrorMessage(message)) {
          redirectToLogin();
          return;
        }
        setLoadError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [redirectToLogin],
  );

  const mergeLiveRide = useCallback((live: Ride) => {
    setRides((current) => {
      const index = current.findIndex((ride) => ride.id === live.id);
      if (index === -1) return sortRidesByBookedAt([live, ...current]);
      const next = [...current];
      next[index] = live;
      return sortRidesByBookedAt(next);
    });
  }, []);

  const { promptRide, dismissNoCaptainPrompt } = useNoCaptainAssignedPrompt(
    rides,
    mergeLiveRide,
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!isAuthenticated()) {
        redirectToLogin();
        return;
      }

      await ensureValidSession();

      const toastFlag = searchParams.get("toast");
      const preferenceRideId = searchParams.get("preference");
      const highlightId = searchParams.get("highlight");

      if (highlightId && !cancelled) {
        setPinnedHighlight(highlightId);
      }

      if (toastFlag === "scheduled" || toastFlag === "booked") {
        pendingToastRef.current = toastFlag;
        if (!cancelled) {
          setToast(toastMessage(toastFlag));
          window.setTimeout(() => setToast(null), 4500);
        }
      }

      if (preferenceRideId) {
        pendingRideIdRef.current = preferenceRideId;
        if (!cancelled) setPreferenceOpen(true);
      }

      if (toastFlag || preferenceRideId || highlightId) {
        router.replace(ROUTES.bookings, { scroll: false });
      }

      if (!cancelled) await loadRides();
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [loadRides, redirectToLogin, reloadToken, router, searchParams]);

  const handlePreferenceContinue = async () => {
    const rideId = pendingRideIdRef.current;
    if (!rideId) return;
    setPreferenceLoading(true);
    try {
      await continueWithAllRiders(rideId);
      setPreferenceOpen(false);
      setToast(toastMessage(pendingToastRef.current));
      window.setTimeout(() => setToast(null), 4500);
      await loadRides({ silent: true });
    } catch {
      setLoadError("Unable to continue search. Please try again.");
      setPreferenceOpen(false);
    } finally {
      setPreferenceLoading(false);
    }
  };

  const handlePreferenceKeepSearching = () => {
    const rideId = pendingRideIdRef.current;
    pendingRideIdRef.current = null;
    setPreferenceOpen(false);
    if (rideId) {
      router.push(
        `${ROUTES.bookSearching}?rideId=${encodeURIComponent(rideId)}`,
      );
    }
  };

  const filteredRides = useMemo(() => {
    return rides
      .filter((ride) => {
        if (activeTab === "Emergency") return isEmergencyRide(ride);
        if (activeTab === "Deliveries") return isDeliveryRide(ride);
        return !isEmergencyRide(ride) && !isDeliveryRide(ride);
      })
      .sort((a, b) => rideSortKey(b) - rideSortKey(a));
  }, [rides, activeTab]);

  const currentActivities = useMemo(
    () =>
      filteredRides.map((ride) => {
        const status = mapStatus(ride.status, ride.scheduled_at);
        const isScheduledTrip =
          Boolean(ride.scheduled_at) &&
          status !== "Cancelled" &&
          status !== "Completed";
        const isScheduled =
          status === "Scheduled" || isScheduledTrip;
        const schedule =
          isScheduledTrip && ride.scheduled_at
            ? formatScheduledWhen(ride.scheduled_at)
            : null;
        return {
          id: ride.id,
          destination: ride.dropoff_address || "Destination",
          pickup: ride.pickup_address || "Pickup",
          dateLabel: isScheduledTrip
            ? null
            : formatBookedWhen(ride.created_at),
          scheduledDate: schedule?.date ?? null,
          scheduledTime: schedule?.time ?? null,
          bookedLabel: isScheduledTrip
            ? formatBookedLabel(ride.created_at)
            : null,
          price: ride.fare_final ?? ride.fare_estimate ?? 0,
          status,
          vehicleType: displayVehicleName(ride.vehicle_type_name),
          isScheduledTrip,
          scheduledLabel: isScheduled ? "Scheduled ride" : null,
        };
      }),
    [filteredRides],
  );

  const tabCounts = useMemo(() => {
    let ridesCount = 0;
    let deliveriesCount = 0;
    let emergencyCount = 0;
    for (const ride of rides) {
      if (isEmergencyRide(ride)) emergencyCount += 1;
      else if (isDeliveryRide(ride)) deliveriesCount += 1;
      else ridesCount += 1;
    }
    return { Rides: ridesCount, Deliveries: deliveriesCount, Emergency: emergencyCount };
  }, [rides]);

  const scheduledCount = useMemo(
    () => currentActivities.filter((a) => a.isScheduledTrip).length,
    [currentActivities],
  );

  const activeMeta = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const EmptyIcon = activeMeta.icon;

  return (
    <AppShell>
      <div className={cn(brandTheme.page, "min-w-0 overflow-x-clip")}>
        <header className={brandTheme.stickyHeader}>
          <div className={cn(brandTheme.contentShell, "pb-0 pt-4 sm:pt-5")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                {sidebar ? (
                  <button
                    type="button"
                    onClick={sidebar.openSidebar}
                    className={cn("mt-0.5 lg:hidden", brandTheme.iconButton)}
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                ) : null}
                <div className="min-w-0">
                  <p className={brandTheme.eyebrow}>Your trips</p>
                  <h1 className={brandTheme.pageTitle}>Bookings</h1>
                  {!isLoading && activeTab === "Rides" && filteredRides.length > 0 ? (
                    <p className={brandTheme.pageSubtitle}>
                      {filteredRides.length}{" "}
                      {filteredRides.length === 1 ? "trip" : "trips"}
                      {scheduledCount > 0
                        ? ` · ${scheduledCount} scheduled`
                        : " from your account"}
                    </p>
                  ) : (
                    <p className={brandTheme.pageSubtitle}>{activeMeta.hint}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void loadRides({ silent: true })}
                disabled={isLoading || isRefreshing}
                className={cn(brandTheme.iconButton, "disabled:opacity-50")}
                aria-label="Refresh bookings"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isRefreshing && "animate-spin")}
                />
              </button>
            </div>

            <div
              role="tablist"
              aria-label="Booking categories"
              className="mt-4 flex gap-2 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                const count = tabCounts[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      brandTheme.tabPill,
                      isActive ? brandTheme.tabPillActive : brandTheme.tabPillInactive,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    {tab.id}
                    {!isLoading ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                          isActive ? "bg-primary-foreground/10" : "bg-muted",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main
          className={cn(
            brandTheme.contentShell,
            "flex-1 py-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:py-6",
          )}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-[#e8f0c8] bg-white p-4 sm:p-5"
                >
                  <div className="h-4 w-3/4 rounded bg-[#e8f0c8]" />
                  <div className="mt-3 h-3 w-full rounded bg-[#f7fbe8]" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-[#f7fbe8]" />
                  <div className="mt-5 flex justify-between">
                    <div className="h-3 w-24 rounded bg-[#f7fbe8]" />
                    <div className="h-5 w-16 rounded-full bg-[#e8f0c8]" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <AnimateIn className="mx-auto mt-6 flex max-w-md flex-col items-center rounded-2xl border border-destructive/20 bg-[#fff8f8] px-6 py-10 text-center">
              <p className="text-sm font-medium text-destructive">{loadError}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {isAuthErrorMessage(loadError) ? (
                  <Button
                    type="button"
                    className="rounded-full px-6"
                    onClick={() => redirectToLogin()}
                  >
                    Sign in again
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-[#eef5d4]"
                    onClick={() => setReloadToken((t) => t + 1)}
                  >
                    Try again
                  </Button>
                )}
              </div>
            </AnimateIn>
          ) : currentActivities.length > 0 ? (
            <Stagger className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentActivities.map((activity, index) => (
                <StaggerItem key={activity.id} index={index}>
                  <BookingListCard
                    destination={activity.destination}
                    pickup={activity.pickup}
                    dateLabel={activity.dateLabel ?? ""}
                    scheduledDate={activity.scheduledDate}
                    scheduledTime={activity.scheduledTime}
                    bookedLabel={activity.bookedLabel}
                    price={formatFare(activity.price)}
                    status={activity.status}
                    vehicleType={activity.vehicleType}
                    isScheduledTrip={activity.isScheduledTrip}
                    scheduledLabel={activity.scheduledLabel}
                    highlighted={activity.id === pinnedHighlight}
                    onClick={() => {
                      const ride = filteredRides.find((r) => r.id === activity.id);
                      if (ride && activity.status === "Live") {
                        router.push(buildActiveRideViewUrl(ride));
                        return;
                      }
                      router.push(
                        `${ROUTES.bookingDetail}?id=${encodeURIComponent(activity.id)}`,
                      );
                    }}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <AnimateIn className="mx-auto mt-4 flex max-w-lg flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-[0_12px_32px_-22px_rgba(56,71,27,0.2)] sm:mt-6 sm:py-14">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-primary ring-1 ring-border">
                <EmptyIcon className="h-6 w-6" />
              </div>
              <h3 className={cn("font-heading text-xl font-semibold tracking-tight", "text-foreground")}>
                {activeTab === "Rides"
                  ? "No bookings yet"
                  : activeTab === "Deliveries"
                    ? "No deliveries yet"
                    : "No emergency trips yet"}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {activeTab === "Rides"
                  ? "Book a ride and your trips will appear here automatically from your account."
                  : activeMeta.hint}
              </p>
              {activeTab === "Rides" ? (
                <Button
                  className="mt-6 h-11 rounded-full px-6 font-semibold shadow-[0_12px_28px_-14px_rgba(184,217,38,0.55)]"
                  onClick={() => router.push(ROUTES.home)}
                >
                  Book a ride
                </Button>
              ) : activeTab === "Emergency" ? (
                <Button
                  className="mt-6 h-11 rounded-full px-6 font-semibold"
                  onClick={() =>
                    router.push(ROUTES.ambulanceBook)
                  }
                >
                  Book ambulance for free
                </Button>
              ) : (
                <Button
                  className="mt-6 h-11 rounded-full px-6 font-semibold"
                  onClick={() =>
                    router.push(`${ROUTES.start}?tab=parcel&vehicle=parcel`)
                  }
                >
                  Send a parcel
                </Button>
              )}
            </AnimateIn>
          )}
        </main>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 lg:bottom-8">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-[#38471B] px-4 py-3.5 text-center text-sm font-medium leading-snug text-white shadow-[0_18px_40px_-16px_rgba(40,54,20,0.65)]">
            {toast}
          </div>
        </div>
      ) : null}

      <WomenRidersUnavailableDialog
        open={preferenceOpen}
        isLoading={preferenceLoading}
        onContinue={handlePreferenceContinue}
        onKeepSearching={handlePreferenceKeepSearching}
      />

      <CaptainNotAssignedDialog
        open={Boolean(promptRide)}
        ride={promptRide}
        onClose={dismissNoCaptainPrompt}
        onBookAgain={() => {
          dismissNoCaptainPrompt();
          router.push(ROUTES.home);
        }}
      />
    </AppShell>
  );
}
