"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingLuxuryHero } from "@/components/landing/LandingLuxuryHero";
import { LandingPremiumExperience } from "@/components/landing/LandingPremiumExperience";
import { LandingPremiumGallery } from "@/components/landing/LandingPremiumGallery";
import { LandingServicesSection } from "@/components/landing/LandingServicesSection";
import { LandingFaqSection } from "@/components/landing/LandingFaqSection";
import { ROUTES } from "@/constants/routes";
import {
  landingServices,
  type LandingBookingTab,
  type ServiceItem,
} from "@/constants/services";
import { fetchLandingServices } from "@/lib/landing-api";
import type { LandingFaq } from "@/lib/landing-api";
import { warmBackend } from "@/lib/api";
import {
  clearLandingBookingDraft,
  normalizeScheduledAt,
  patchLandingBookingSchedule,
  saveLandingBookingDraft,
  syncScheduledAtQuery,
} from "@/lib/landing-booking-draft";
import { buildLocationSearchUrl, isLandingBookingTab } from "@/lib/location-search";
import type { LocationFieldType } from "@/lib/location-search";
import { buildBookUrl } from "@/lib/ride-booking";
import { resolveAddressCoords } from "@/lib/places-api";
import { fetchSchedulePreview } from "@/lib/schedule-api";
import { cn } from "@/lib/utils";
import { useActiveRideGuard } from "@/hooks/useActiveRideGuard";
import { useBackendGpsPickup } from "@/hooks/useBackendGpsPickup";

const SectionSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "mx-4 my-6 animate-pulse rounded-2xl bg-white sm:mx-6",
      className,
    )}
    aria-hidden
  />
);

const LandingPillarsSection = dynamic(
  () =>
    import("@/components/landing/LandingPillarsSection").then(
      (m) => m.LandingPillarsSection,
    ),
  { ssr: false, loading: () => <SectionSkeleton className="min-h-[14rem]" /> },
);
const SosSection = dynamic(
  () => import("@/components/landing/SosSection").then((m) => m.SosSection),
  { ssr: false, loading: () => <SectionSkeleton className="min-h-[18rem]" /> },
);
const LandingCaptainsSection = dynamic(
  () =>
    import("@/components/landing/LandingCaptainsSection").then(
      (m) => m.LandingCaptainsSection,
    ),
  { ssr: false, loading: () => <SectionSkeleton className="min-h-[18rem]" /> },
);

function getDropoffLocationCopy(tab: LandingBookingTab) {
  if (tab === "parcel") {
    return {
      title: "Enter delivery address",
      placeholder: "Enter delivery address",
      emptyLabel: "Delivery address",
    };
  }
  if (tab === "ambulance") {
    return {
      title: "Enter hospital or destination",
      placeholder: "Hospital or destination",
      emptyLabel: "Hospital or destination",
    };
  }
  return {
    title: "Enter dropoff location",
    placeholder: "Enter dropoff location",
    emptyLabel: "Dropoff location",
  };
}

export function LandingView({
  faqs,
}: {
  faqs?: LandingFaq[];
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { guardBooking, blockDialog } = useActiveRideGuard();
  const [activeTab, setActiveTab] = useState<LandingBookingTab>("rides");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [dropoffLat, setDropoffLat] = useState<number | undefined>();
  const [dropoffLng, setDropoffLng] = useState<number | undefined>();
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [schedulePreviewLabel, setSchedulePreviewLabel] = useState<string | null>(
    null,
  );
  const [isBooking, setIsBooking] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(landingServices);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const hydratedOnce = useRef(false);

  const dropoffCopy = getDropoffLocationCopy(activeTab);

  const tripCoords = useMemo(
    () => ({
      pickupLat:
        pickupLat ??
        (Number(searchParams.get("plat")) || undefined),
      pickupLng:
        pickupLng ??
        (Number(searchParams.get("plng")) || undefined),
      dropoffLat:
        dropoffLat ??
        (Number(searchParams.get("dlat")) || undefined),
      dropoffLng:
        dropoffLng ??
        (Number(searchParams.get("dlng")) || undefined),
    }),
    [pickupLat, pickupLng, dropoffLat, dropoffLng, searchParams],
  );

  const gpsPickup = useBackendGpsPickup(gpsEnabled);

  const applySchedulePreview = useCallback(
    async (iso: string) => {
      setSchedulePreviewLabel(null);
      try {
        const preview = await fetchSchedulePreview({
          scheduledAt: iso,
          coords: tripCoords,
          serviceGroup: "ride",
        });
        if (preview.sampleFareMin != null && preview.sampleFareMax != null) {
          setSchedulePreviewLabel(
            `Est. ₹${Math.round(preview.sampleFareMin)}–₹${Math.round(preview.sampleFareMax)} · ${preview.vehicleCount ?? "—"} options`,
          );
        } else if (preview.nearbyDriversCount != null) {
          setSchedulePreviewLabel(
            `${preview.nearbyDriversCount} captains nearby · scheduled pickup`,
          );
        } else if (preview.vehicleCount != null) {
          setSchedulePreviewLabel(
            `${preview.vehicleCount} vehicle options · scheduled pickup`,
          );
        } else {
          setSchedulePreviewLabel("Schedule confirmed with server · continue to prices");
        }
      } catch {
        setSchedulePreviewLabel("Schedule saved · fares load on next step");
      }
    },
    [tripCoords],
  );

  const applyScheduledAt = useCallback(
    (iso: string | null, opts?: { preview?: boolean }) => {
      const next = normalizeScheduledAt(iso);
      setScheduledAt(next);
      if (!next) setSchedulePreviewLabel(null);
      // Never write schedule into the landing URL — that made "Reschedule" look like a default.
      if (next && opts?.preview !== false) {
        void applySchedulePreview(next);
      }
    },
    [applySchedulePreview],
  );

  useEffect(() => {
    void warmBackend();
    let cancelled = false;
    // Soft refresh only — curated local tiles already render instantly.
    void fetchLandingServices()
      .then((items) => {
        if (!cancelled && items.length > 0) setServices(items);
      })
      .catch(() => {
        if (!cancelled) setServices(landingServices);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const urlPickup = searchParams.get("pickup")?.trim() || "";
    const urlDropoff = searchParams.get("dropoff")?.trim() || "";
    const urlTab = searchParams.get("tab");
    const urlScheduled = normalizeScheduledAt(searchParams.get("scheduled_at"));
    const hashIsBook =
      typeof window !== "undefined" && window.location.hash === "#book";
    const fromLocationRoute =
      typeof document !== "undefined" &&
      /\/location(\?|$|#)/.test(document.referrer || "");
    // Addresses only when mid-booking (location return / #book). Fresh `/`
    // uses GPS + backend reverse-geocode for pickup — not sticky URL leftovers.
    const restorePlaces = hashIsBook || fromLocationRoute;

    if (restorePlaces && urlPickup) {
      setPickup(urlPickup);
      const plat = Number(searchParams.get("plat"));
      const plng = Number(searchParams.get("plng"));
      if (Number.isFinite(plat) && Number.isFinite(plng)) {
        setPickupLat(plat);
        setPickupLng(plng);
      }
    } else if (!hydratedOnce.current) {
      setPickup("");
      setPickupLat(undefined);
      setPickupLng(undefined);
    }

    if (restorePlaces && urlDropoff) {
      setDropoff(urlDropoff);
      const dlat = Number(searchParams.get("dlat"));
      const dlng = Number(searchParams.get("dlng"));
      if (Number.isFinite(dlat) && Number.isFinite(dlng)) {
        setDropoffLat(dlat);
        setDropoffLng(dlng);
      }
    } else if (!hydratedOnce.current) {
      setDropoff("");
      setDropoffLat(undefined);
      setDropoffLng(undefined);
    }

    if (isLandingBookingTab(urlTab)) setActiveTab(urlTab);
    else if (!hydratedOnce.current) setActiveTab("rides");

    if (restorePlaces && urlScheduled) {
      setScheduledAt(urlScheduled);
    } else if (!hydratedOnce.current) {
      setScheduledAt(null);
      setSchedulePreviewLabel(null);
      patchLandingBookingSchedule(null);
    }

    if (!hydratedOnce.current && !restorePlaces) {
      clearLandingBookingDraft();
      // Drop sticky place leftovers so a refresh of `/` uses live GPS pickup.
      try {
        const url = new URL(window.location.href);
        let dirty = false;
        for (const key of [
          "pickup",
          "dropoff",
          "plat",
          "plng",
          "dlat",
          "dlng",
          "scheduled_at",
        ]) {
          if (url.searchParams.has(key)) {
            url.searchParams.delete(key);
            dirty = true;
          }
        }
        if (dirty) {
          window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}${url.hash}`,
          );
        }
      } catch {
        // ignore
      }
    }

    if (searchParams.has("scheduled_at") && restorePlaces) {
      syncScheduledAtQuery(null, window.location.hash || "#book");
    }

    hydratedOnce.current = true;
    setDraftHydrated(true);
    // Fresh visit: track pickup via GPS + backend reverse (app-style).
    // Mid-flow restore keeps the user-chosen pickup and skips GPS.
    setGpsEnabled(!(restorePlaces && Boolean(urlPickup)));

    if (restorePlaces || hashIsBook) {
      const scrollToBookWidget = () => {
        document.getElementById("book")?.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      };
      requestAnimationFrame(scrollToBookWidget);
      const timer = window.setTimeout(scrollToBookWidget, 80);
      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  /** Apply backend-resolved GPS place into pickup (never overwrite user choice). */
  useEffect(() => {
    if (!gpsPickup.place) return;
    const label = gpsPickup.place.label?.trim() || "Current location";
    setPickup((current) => current || label);
    setPickupLat((current) => current ?? gpsPickup.place?.latitude);
    setPickupLng((current) => current ?? gpsPickup.place?.longitude);
  }, [gpsPickup.place]);

  useEffect(() => {
    const routes = [
      ROUTES.login,
      ROUTES.location,
      ROUTES.about,
      ROUTES.ride,
      ROUTES.download,
    ] as const;
    const prefetch = () => {
      for (const route of routes) {
        try {
          router.prefetch(route);
        } catch {
          // Prefetch is best-effort.
        }
      }
    };
    const idle = window.requestIdleCallback?.(prefetch, { timeout: 3000 });
    const timer = idle == null ? window.setTimeout(prefetch, 800) : undefined;
    return () => {
      if (idle != null) window.cancelIdleCallback?.(idle);
      if (timer != null) window.clearTimeout(timer);
    };
  }, [router]);

  useEffect(() => {
    if (!draftHydrated) return;
    // Only persist mid-flow state when the user actually chose locations
    // (or returned from the location picker via URL). Never invent defaults.
    if (!pickup && !dropoff) {
      clearLandingBookingDraft();
      return;
    }
    saveLandingBookingDraft({
      pickup,
      dropoff,
      tab: activeTab,
      scheduledAt: null,
      pickupLat: tripCoords.pickupLat,
      pickupLng: tripCoords.pickupLng,
      dropoffLat: tripCoords.dropoffLat,
      dropoffLng: tripCoords.dropoffLng,
    });
  }, [
    draftHydrated,
    pickup,
    dropoff,
    activeTab,
    tripCoords.pickupLat,
    tripCoords.pickupLng,
    tripCoords.dropoffLat,
    tripCoords.dropoffLng,
  ]);

  const bookingReturnTo = () => {
    const params = new URLSearchParams();
    if (pickup) params.set("pickup", pickup);
    if (dropoff) params.set("dropoff", dropoff);
    params.set("tab", activeTab);
    if (tripCoords.pickupLat != null) params.set("plat", String(tripCoords.pickupLat));
    if (tripCoords.pickupLng != null) params.set("plng", String(tripCoords.pickupLng));
    if (tripCoords.dropoffLat != null) params.set("dlat", String(tripCoords.dropoffLat));
    if (tripCoords.dropoffLng != null) params.set("dlng", String(tripCoords.dropoffLng));
    if (scheduledAt && activeTab !== "ambulance") {
      params.set("scheduled_at", scheduledAt);
    }
    const query = params.toString();
    return `${ROUTES.landing}${query ? `?${query}` : ""}#book`;
  };

  const openLocationSearch = (field: LocationFieldType) => {
    const locationUrl = buildLocationSearchUrl({
      field,
      returnTo: bookingReturnTo(),
      pickup,
      dropoff,
      tab: activeTab,
      coords: tripCoords,
    });
    startTransition(() => {
      router.push(locationUrl);
    });
  };

  const handleScheduleConfirm = async (iso: string) => {
    await applySchedulePreview(iso);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff) {
      openLocationSearch(!pickup ? "pickup" : "dropoff");
      return;
    }

    const scheduleIso =
      activeTab !== "ambulance" && scheduledAt ? scheduledAt : undefined;

    const proceedToBook = async () => {
      setIsBooking(true);
      try {
        let nextCoords = { ...tripCoords };

        const needsPickup =
          nextCoords.pickupLat == null || nextCoords.pickupLng == null;
        const needsDropoff =
          nextCoords.dropoffLat == null || nextCoords.dropoffLng == null;

        if (needsPickup || needsDropoff) {
          const [pickupResolved, dropoffResolved] = await Promise.all([
            needsPickup
              ? resolveAddressCoords(pickup)
              : Promise.resolve(null),
            needsDropoff
              ? resolveAddressCoords(dropoff)
              : Promise.resolve(null),
          ]);

          if (needsPickup && pickupResolved) {
            nextCoords = {
              ...nextCoords,
              pickupLat: pickupResolved.latitude,
              pickupLng: pickupResolved.longitude,
            };
          }
          if (needsDropoff && dropoffResolved) {
            nextCoords = {
              ...nextCoords,
              dropoffLat: dropoffResolved.latitude,
              dropoffLng: dropoffResolved.longitude,
            };
          }

          if (
            nextCoords.pickupLat == null ||
            nextCoords.pickupLng == null ||
            nextCoords.dropoffLat == null ||
            nextCoords.dropoffLng == null
          ) {
            openLocationSearch(
              nextCoords.pickupLat == null || nextCoords.pickupLng == null
                ? "pickup"
                : "dropoff",
            );
            return;
          }
        }

        if (scheduleIso) {
          await applySchedulePreview(scheduleIso);
        }

        startTransition(() => {
          router.push(
            buildBookUrl(pickup, dropoff, activeTab, undefined, {
              pickupLat: nextCoords.pickupLat,
              pickupLng: nextCoords.pickupLng,
              dropoffLat: nextCoords.dropoffLat,
              dropoffLng: nextCoords.dropoffLng,
              scheduledAt: scheduleIso,
            }),
          );
        });
      } catch {
        openLocationSearch("pickup");
      } finally {
        setIsBooking(false);
      }
    };

    void guardBooking(() => {
      void proceedToBook();
    });
  };

  const ctaLabel =
    activeTab === "rides"
      ? "See prices"
      : activeTab === "parcel"
        ? "Send parcel"
        : "Book ambulance for free";

  return (
    <MarketingPageShell>
      <LandingHeader />

      <LandingLuxuryHero
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pickup={pickup}
        dropoff={dropoff}
        dropoffEmptyLabel={dropoffCopy.emptyLabel}
        pickupEmptyLabel={
          gpsPickup.locating ? "Detecting current location…" : "Current location"
        }
        ctaLabel={ctaLabel}
        onOpenLocation={openLocationSearch}
        onSubmit={handleBook}
        scheduledAt={scheduledAt}
        onScheduledAtChange={(iso) => {
          // Confirm path runs preview via onScheduleConfirm; Leave now clears here.
          applyScheduledAt(iso, { preview: false });
        }}
        onScheduleConfirm={handleScheduleConfirm}
        schedulePreviewLabel={schedulePreviewLabel}
        isSubmitting={isBooking}
      />

      <LandingServicesSection services={services} />

      <LandingPremiumGallery />

      <LandingPremiumExperience />

      <LandingPillarsSection />

      {/* SOS kept — core feature */}
      <SosSection />

      <LandingCaptainsSection />

      <LandingFaqSection initialFaqs={faqs} />

      <LandingFooter />

      {blockDialog}
    </MarketingPageShell>
  );
}
