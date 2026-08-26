"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingLuxuryHero } from "@/components/landing/LandingLuxuryHero";
import { LandingPremiumExperience } from "@/components/landing/LandingPremiumExperience";
import { LandingPremiumGallery } from "@/components/landing/LandingPremiumGallery";
import { LandingServicesSection } from "@/components/landing/LandingServicesSection";
import { ROUTES } from "@/constants/routes";
import {
  landingServices,
  type LandingBookingTab,
  type ServiceItem,
} from "@/constants/services";
import { buildLocationSearchUrl, isLandingBookingTab } from "@/lib/location-search";
import type { LocationFieldType } from "@/lib/location-search";
import { buildBookUrl } from "@/lib/ride-booking";
import { displayVehicleName, vehicleImageForSlug } from "@/lib/vehicle-map";
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
const WhyWaveGoSection = dynamic(
  () =>
    import("@/components/landing/WhyWaveGoSection").then((m) => m.WhyWaveGoSection),
  { ssr: false, loading: () => <SectionSkeleton className="min-h-[22rem]" /> },
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

  const dropoffCopy = getDropoffLocationCopy(activeTab);

  useEffect(() => {
    const urlPickup = searchParams.get("pickup");
    const urlDropoff = searchParams.get("dropoff");
    const urlTab = searchParams.get("tab");
    const fromLocationPicker = Boolean(urlPickup || urlDropoff || urlTab);

    if (urlPickup) setPickup(urlPickup);
    if (urlDropoff) setDropoff(urlDropoff);
    if (isLandingBookingTab(urlTab)) setActiveTab(urlTab);

    // Returning from location search should stay on the book widget, not jump to top.
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

  const services = useMemo<ServiceItem[]>(() => {
    return landingServices.map((service) => {
      const key = service.name.toLowerCase();
      const slugHint =
        key.includes("bike")
          ? "bike"
          : key.includes("auto")
            ? "auto"
            : key.includes("cab")
              ? "cab"
              : key.includes("parcel")
                ? "parcel"
                : key.includes("travel")
                  ? "travel"
                  : key.includes("ambulance")
                    ? "ambulance"
                    : key;
      return {
        ...service,
        name: displayVehicleName(service.name),
        image: service.image || vehicleImageForSlug(slugHint),
      };
    });
  }, []);

  const tripCoords = {
    pickupLat: Number(searchParams.get("plat")) || undefined,
    pickupLng: Number(searchParams.get("plng")) || undefined,
    dropoffLat: Number(searchParams.get("dlat")) || undefined,
    dropoffLng: Number(searchParams.get("dlng")) || undefined,
  };

  const openLocationSearch = (field: LocationFieldType) => {
    const locationUrl = buildLocationSearchUrl({
      field,
      // Return onto the book section so pickup/dropoff stay in context.
      returnTo: `${ROUTES.landing}#book`,
      pickup,
      dropoff,
      tab: activeTab,
      coords: tripCoords,
    });
    startTransition(() => {
      router.push(locationUrl);
    });
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff) {
      openLocationSearch(!pickup ? "pickup" : "dropoff");
      return;
    }
    void guardBooking(() => {
      startTransition(() => {
        router.push(
          buildBookUrl(pickup, dropoff, activeTab, undefined, {
            pickupLat: tripCoords.pickupLat,
            pickupLng: tripCoords.pickupLng,
            dropoffLat: tripCoords.dropoffLat,
            dropoffLng: tripCoords.dropoffLng,
          }),
        );
      });
    });
  };

  const ctaLabel =
    activeTab === "rides"
      ? "See prices"
      : activeTab === "parcel"
        ? "Send parcel"
        : "Request ambulance";

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
      />

      <LandingPremiumGallery />

      <LandingPremiumExperience />

      <LandingServicesSection services={services} />

      <LandingPillarsSection />

      <WhyWaveGoSection />

      {/* SOS kept — core feature */}
      <SosSection />

      <LandingCaptainsSection />

      <LandingFaqSection />

      <LandingFooter />

      {blockDialog}
    </MarketingPageShell>
  );
}
