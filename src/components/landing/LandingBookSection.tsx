"use client";

import Image from "next/image";
import {
  Ambulance,
  Car,
  MapPin,
  Navigation2,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { BRAND_IMAGE_SIZES } from "@/constants/brand-images";
import { Button } from "@/components/ui/button";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import {
  landingBookImages,
  landingBookingTabs,
  type LandingBookingTab,
} from "@/constants/services";
import { cn } from "@/lib/utils";
import type { LocationFieldType } from "@/lib/location-search";

const tabMeta: Record<
  LandingBookingTab,
  {
    icon: typeof Car;
    hint: string;
    accent: string;
  }
> = {
  rides: {
    icon: Car,
    hint: "Bike, auto & cab — matched in seconds",
    accent: "from-primary to-secondary",
  },
  parcel: {
    icon: Package,
    hint: "Same-city deliveries with live tracking",
    accent: "from-primary to-[#9BB820]",
  },
  ambulance: {
    icon: Ambulance,
    hint: "Verified medical transport, 24×7",
    accent: "from-destructive to-[#f97316]",
  },
};

const trustChips = [
  { icon: Sparkles, label: "Upfront fares" },
  { icon: ShieldCheck, label: "Verified captains" },
  { icon: MapPin, label: "Live tracking" },
] as const;

interface LandingBookSectionProps {
  activeTab: LandingBookingTab;
  onTabChange: (tab: LandingBookingTab) => void;
  pickup: string;
  dropoff: string;
  dropoffEmptyLabel: string;
  ctaLabel: string;
  onOpenLocation: (field: LocationFieldType) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LandingBookSection({
  activeTab,
  onTabChange,
  pickup,
  dropoff,
  dropoffEmptyLabel,
  ctaLabel,
  onOpenLocation,
  onSubmit,
}: LandingBookSectionProps) {
  const meta = tabMeta[activeTab];
  const TabIcon = meta.icon;
  const isEmergency = activeTab === "ambulance";

  return (
    <section
      id="book"
      className="relative z-10 scroll-mt-24 px-4 py-10 sm:px-5 md:px-6 lg:px-8 sm:py-16 lg:py-24"
      style={{ backgroundColor: "#ffffff", color: "#B8D926" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(200,232,74,0.1),transparent_60%)]"
      />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-[90rem]">
        <div className="relative overflow-hidden border border-primary/12 bg-white shadow-[0_20px_40px_-28px_rgba(184,217,38,0.4)]">
          <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative z-10 flex min-w-0 flex-col justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
              <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#6B7344] sm:text-[11px] sm:tracking-[0.28em]">
                Book
              </p>
              <div className="mt-2.5 h-px w-12 bg-gradient-to-r from-[#B8D926] to-transparent sm:mt-3 sm:w-14" />
              <h2 className="mt-3 font-heading text-[1.4rem] font-semibold tracking-tight text-[#38471B] sm:mt-4 sm:text-3xl lg:text-[2.35rem] lg:leading-[1.15]">
                Book your elite transfer{" "}
                <span className="text-[#B8D926]">in minutes</span>
              </h2>
              <p className="mt-2.5 max-w-md text-[13px] font-light leading-relaxed text-[#4a5228] sm:mt-3 sm:text-base">
                Rides, parcels, or emergency SOS — set locations and move with confidence.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
                {trustChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-1.5 border border-primary/25 bg-white px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.12em] uppercase text-primary sm:px-3 sm:py-2 sm:text-[11px]"
                    >
                      <Icon className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5" strokeWidth={2} />
                      {chip.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* All tab images stay mounted — never blank on tab change */}
            <div className="relative min-h-[200px] min-w-0 bg-[#38471B] sm:min-h-[240px] lg:min-h-[320px]">
              {(Object.keys(landingBookImages) as LandingBookingTab[]).map((tab) => {
                const img = landingBookImages[tab];
                const active = tab === activeTab;
                return (
                  <div
                    key={tab}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500",
                      active ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden={!active}
                  >
                    <Image
                      src={img.src}
                      alt={active ? img.alt : ""}
                      fill
                      quality={NEXT_IMAGE_QUALITY.high}
                      sizes={BRAND_IMAGE_SIZES.bookPanel}
                      className={BRAND_PHOTO_CLASS}
                      style={{ objectPosition: img.objectPosition }}
                      priority={tab === "rides"}
                    />
                    <div
                      aria-hidden
                      className={cn(
                        "absolute inset-0 bg-gradient-to-tr",
                        img.accent,
                      )}
                    />
                  </div>
                );
              })}
              <BrandImageOverlay variant="card" />
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-4 w-full min-w-0 max-w-xl sm:-mt-7 sm:max-w-lg">
          <div className="overflow-hidden border border-primary/15 bg-white p-2 shadow-[0_20px_40px_-24px_rgba(184,217,38,0.45)] sm:p-2.5">
            <div
              aria-hidden
              className={cn("mb-2 h-1 w-full bg-gradient-to-r", meta.accent)}
            />

            <div
              className="relative flex gap-1 bg-muted/70 p-1"
              role="tablist"
              aria-label="Booking type"
            >
              {landingBookingTabs.map((tab) => {
                const emergency = tab.id === "ambulance";
                const isActive = activeTab === tab.id;
                const Icon = tabMeta[tab.id].icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "relative z-10 flex flex-1 items-center justify-center gap-1 px-1.5 py-2.5 text-[11px] font-semibold transition-colors duration-150 sm:gap-2 sm:px-3 sm:text-sm",
                      emergency
                        ? isActive
                          ? "bg-destructive text-white"
                          : "text-destructive hover:bg-destructive/10"
                        : isActive
                          ? "bg-primary text-white"
                          : "text-[#4a5228] hover:bg-white hover:text-primary",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-2.5 flex items-center justify-center gap-2 px-2 text-center text-[11px] font-medium text-[#4a5228] sm:mt-3 sm:text-xs">
              <TabIcon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isEmergency ? "text-destructive" : "text-primary",
                )}
              />
              {meta.hint}
            </p>

            <form onSubmit={onSubmit} className="space-y-2 p-2 pt-2.5 sm:space-y-2.5 sm:p-3 sm:pt-4">
              <button
                type="button"
                onClick={() => onOpenLocation("pickup")}
                className="group flex w-full min-w-0 items-center gap-2.5 overflow-hidden border border-primary/15 bg-muted/35 px-3 py-3 text-left transition-all duration-150 hover:border-primary/45 hover:bg-primary/[0.04] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 sm:gap-3 sm:px-4 sm:py-3.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-primary/15 bg-white text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Navigation2 className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block text-[9px] font-semibold tracking-[0.12em] uppercase text-primary sm:text-[10px]">
                    Pickup
                  </span>
                  <span
                    className={cn(
                      "block break-words [overflow-wrap:anywhere] line-clamp-2 text-[13px] leading-snug sm:text-base",
                      pickup ? "font-medium text-primary" : "text-[#5a6330]",
                    )}
                    title={pickup || undefined}
                  >
                    {pickup || "Pickup location"}
                  </span>
                </span>
              </button>

              <div className="relative flex justify-center" aria-hidden>
                <span className="absolute top-1/2 left-8 right-8 -translate-y-1/2 border-t border-dashed border-primary/15" />
                <span className="relative z-[1] flex h-6 w-6 items-center justify-center border border-primary/15 bg-white text-[10px] font-semibold text-primary">
                  ↓
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenLocation("dropoff")}
                className="group flex w-full min-w-0 items-center gap-2.5 overflow-hidden border border-primary/15 bg-muted/35 px-3 py-3 text-left transition-all duration-150 hover:border-primary/45 hover:bg-primary/[0.04] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 sm:gap-3 sm:px-4 sm:py-3.5"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center border bg-white transition-colors",
                    isEmergency
                      ? "border-destructive/20 text-destructive group-hover:bg-destructive group-hover:text-white"
                      : "border-primary/15 text-destructive group-hover:bg-primary group-hover:text-white",
                  )}
                >
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span
                    className={cn(
                      "block text-[9px] font-semibold tracking-[0.12em] uppercase sm:text-[10px]",
                      isEmergency ? "text-destructive" : "text-primary",
                    )}
                  >
                    {activeTab === "parcel" ? "Delivery" : "Dropoff"}
                  </span>
                  <span
                    className={cn(
                      "block break-words [overflow-wrap:anywhere] line-clamp-2 text-[13px] leading-snug sm:text-base",
                      dropoff ? "font-medium text-primary" : "text-[#5a6330]",
                    )}
                    title={dropoff || undefined}
                  >
                    {dropoff || dropoffEmptyLabel}
                  </span>
                </span>
              </button>

              <Button
                type="submit"
                className={cn(
                  "h-11 w-full text-sm font-semibold tracking-wide transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.99] sm:h-12 sm:text-base",
                  isEmergency && "bg-destructive hover:bg-destructive/90",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {ctaLabel}
                  <span aria-hidden>→</span>
                </span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
