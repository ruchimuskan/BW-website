"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingLuxuryHero } from "@/components/landing/LandingLuxuryHero";
import { LandingPremiumExperience } from "@/components/landing/LandingPremiumExperience";
import { LandingPremiumGallery } from "@/components/landing/LandingPremiumGallery";
import { LandingServicesSection } from "@/components/landing/LandingServicesSection";
import { ROUTES } from "@/constants/routes";
import {
  type LandingBookingTab,
  type ServiceItem,
} from "@/constants/services";
import { fetchLandingServices } from "@/lib/landing-api";
import { warmBackend } from "@/lib/api";
import {
  normalizeScheduledAt,
  patchLandingBookingSchedule,
  readLandingBookingDraft,
  saveLandingBookingDraft,
  syncScheduledAtQuery,
} from "@/lib/landing-booking-draft";
import { buildLocationSearchUrl, isLandingBookingTab } from "@/lib/location-search";
import type { LocationFieldType } from "@/lib/location-search";
import { buildBookUrl } from "@/lib/ride-booking";
import { fetchSchedulePreview } from "@/lib/schedule-api";
import { cn } from "@/lib/utils";
import { useActiveRideGuard } from "@/hooks/useActiveRideGuard";

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
const LandingFaqSection = dynamic(
  () =>
    import("@/components/landing/LandingFaqSection").then((m) => m.LandingFaqSection),
  { ssr: false, loading: () => <SectionSkeleton className="min-h-[20rem]" /> },
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

export function LandingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { guardBooking, blockDialog } = useActiveRideGuard();
  const [activeTab, setActiveTab] = useState<LandingBookingTab>("rides");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [schedulePreviewLabel, setSchedulePreviewLabel] = useState<string | null>(
    null,
  );
  const [isBooking, setIsBooking] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const hydratedOnce = useRef(false);

  const dropoffCopy = getDropoffLocationCopy(activeTab);

  const tripCoords = {
    pickupLat: Number(searchParams.get("plat")) || undefined,
    pickupLng: Number(searchParams.get("plng")) || undefined,
    dropoffLat: Number(searchParams.get("dlat")) || undefined,
    dropoffLng: Number(searchParams.get("dlng")) || undefined,
  };

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
    [
      tripCoords.pickupLat,
      tripCoords.pickupLng,
      tripCoords.dropoffLat,
      tripCoords.dropoffLng,
    ],
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
    void fetchLandingServices()
      .then((items) => {
        if (!cancelled) setServices(items);
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const urlPickup = searchParams.get("pickup");
    const urlDropoff = searchParams.get("dropoff");
    const urlTab = searchParams.get("tab");
    const urlScheduled = normalizeScheduledAt(searchParams.get("scheduled_at"));
    const fromLocationPicker = Boolean(urlPickup || urlDropoff || urlTab);
    const draft = readLandingBookingDraft();

    if (urlPickup) setPickup(urlPickup);
    else if (!hydratedOnce.current && draft?.pickup) setPickup(draft.pickup);

    if (urlDropoff) setDropoff(urlDropoff);
    else if (!hydratedOnce.current && draft?.dropoff) setDropoff(draft.dropoff);

    if (isLandingBookingTab(urlTab)) setActiveTab(urlTab);
    else if (!hydratedOnce.current && draft?.tab) setActiveTab(draft.tab);

    // Default is always "When to go". Schedule only if the user already chose one
    // in this flow (returning from location search with their selection).
    if (fromLocationPicker && urlScheduled) {
      setScheduledAt(urlScheduled);
    } else if (!hydratedOnce.current) {
      setScheduledAt(null);
      setSchedulePreviewLabel(null);
      patchLandingBookingSchedule(null);
    }

    // Strip sticky ?scheduled_at= from the address bar so refresh doesn't look pre-scheduled.
    if (searchParams.has("scheduled_at")) {
      syncScheduledAtQuery(null, window.location.hash || "#book");
    }

    hydratedOnce.current = true;
    setDraftHydrated(true);

    if (fromLocationPicker || window.location.hash === "#book") {
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
    saveLandingBookingDraft({
      pickup,
      dropoff,
      tab: activeTab,
      // Landing draft never stores a default schedule — only pickup/drop/tab.
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
        if (scheduleIso) {
          await applySchedulePreview(scheduleIso);
        }
      } catch {
        // Fare preview is best-effort before navigation.
      } finally {
        setIsBooking(false);
      }

      startTransition(() => {
        router.push(
          buildBookUrl(pickup, dropoff, activeTab, undefined, {
            pickupLat: tripCoords.pickupLat,
            pickupLng: tripCoords.pickupLng,
            dropoffLat: tripCoords.dropoffLat,
            dropoffLng: tripCoords.dropoffLng,
            scheduledAt: scheduleIso,
          }),
        );
      });
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

      <LandingServicesSection services={services} isLoading={servicesLoading} />

      <LandingPremiumGallery />

      <LandingPremiumExperience />

      <LandingPillarsSection />

      {/* SOS kept — core feature */}
      <SosSection />

      <LandingCaptainsSection />

      <LandingFaqSection />

      <LandingFooter />

      {blockDialog}
    </MarketingPageShell>
  );
}
