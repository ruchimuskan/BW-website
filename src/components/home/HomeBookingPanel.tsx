"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, ChevronLeft, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationCard } from "@/components/home/LocationCard";
import {
  buildRentalContinueUrl,
  type HomeBookingTab,
  type RentalStyle,
} from "@/constants/home-booking";
import { ROUTES } from "@/constants/routes";
import type { LocationCoords } from "@/lib/location-search";
import type { TripStop } from "@/lib/trip-stops";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";

const TABS: { id: HomeBookingTab; label: string }[] = [
  { id: "ride", label: "Ride" },
  { id: "rental", label: "Rental" },
  { id: "parcel", label: "Parcel" },
];

type HomeBookingPanelProps = {
  pickup: string;
  dropoff: string;
  onSwap: () => void;
  coords?: LocationCoords;
  stops?: TripStop[];
  onRemoveStop?: (index: number) => void;
  className?: string;
  scheduledAt?: string | null;
  onScheduledAtChange?: (iso: string | null) => void;
};

export function HomeBookingPanel({
  pickup,
  dropoff,
  onSwap,
  coords,
  stops,
  onRemoveStop,
  className,
  scheduledAt,
  onScheduledAtChange,
}: HomeBookingPanelProps) {
  const router = useRouter();
  const [tab, setTab] = useState<HomeBookingTab>("ride");
  const [rentalStyle, setRentalStyle] = useState<RentalStyle | null>(null);

  const goChauffeurRental = () => {
    router.push(
      buildRentalContinueUrl({
        pickup: pickup || undefined,
        pickupLat: coords?.pickupLat,
        pickupLng: coords?.pickupLng,
        mode: "chauffeur",
      }),
    );
  };

  const goSelfDrive = () => {
    const params = new URLSearchParams();
    if (pickup) params.set("pickup", pickup);
    if (coords?.pickupLat != null) params.set("plat", String(coords.pickupLat));
    if (coords?.pickupLng != null) params.set("plng", String(coords.pickupLng));
    const query = params.toString();
    router.push(
      query ? `${ROUTES.rentalSelfDrive}?${query}` : ROUTES.rentalSelfDrive,
    );
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-[0_28px_64px_-28px_rgba(32,42,16,0.55)] backdrop-blur-md sm:rounded-[1.5rem]",
        className,
      )}
    >
      <div className="border-b border-primary/10 bg-[#ffffff]/90 p-3 sm:p-3.5">
        <div
          role="tablist"
          aria-label="Booking mode"
          className="grid grid-cols-3 gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_rgba(184,217,38,0.12)]"
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setTab(item.id);
                  if (item.id !== "rental") setRentalStyle(null);
                }}
                className={cn(
                  "min-h-11 rounded-full px-2 py-2 text-[11px] font-semibold tracking-wide transition-all duration-200 sm:text-sm",
                  active
                    ? "bg-primary text-white shadow-[0_8px_18px_-10px_rgba(184,217,38,0.7)]"
                    : "text-primary/70 hover:bg-primary/5 hover:text-primary",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "rental" ? (
        <div className="p-4 sm:p-5">
          {rentalStyle ? (
            <button
              type="button"
              onClick={() => setRentalStyle(null)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Choose Your Rental Style
            </button>
          ) : (
            <p className="mb-4 font-heading text-base font-semibold text-[#B8D926] sm:text-lg">
              Choose Your Rental Style
            </p>
          )}

          <div className="space-y-3">
            <RentalStyleOption
              selected={rentalStyle === "self"}
              title="Drive Yourself"
              description="Rent and drive the vehicle on your own."
              icon={CarFront}
              onSelect={() => setRentalStyle("self")}
            />
            <RentalStyleOption
              selected={rentalStyle === "chauffeur"}
              title="Book with Driver"
              description="A professional driver will drive you."
              icon={UserRound}
              onSelect={() => setRentalStyle("chauffeur")}
            />
          </div>

          <div className="mt-5">
            <Button
              type="button"
              disabled={!rentalStyle}
              onClick={() => {
                if (rentalStyle === "self") goSelfDrive();
                else if (rentalStyle === "chauffeur") goChauffeurRental();
              }}
              className={cn(
                "h-12 w-full rounded-2xl text-sm sm:h-[3.25rem] sm:text-base",
                BRAND_CTA_LIME,
                !rentalStyle && "opacity-45",
              )}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <LocationCard
          pickup={pickup}
          dropoff={dropoff}
          onSwap={onSwap}
          coords={coords}
          stops={stops}
          onRemoveStop={onRemoveStop}
          mode={tab === "parcel" ? "parcel" : "ride"}
          scheduledAt={scheduledAt}
          onScheduledAtChange={onScheduledAtChange}
          compact
          className="rounded-none border-0 shadow-none"
        />
      )}
    </div>
  );
}

function RentalStyleOption({
  selected,
  title,
  description,
  icon: Icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: typeof CarFront;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-all duration-200 sm:px-4 sm:py-4",
        selected
          ? "border-primary bg-[#ffffff] shadow-[0_12px_28px_-20px_rgba(184,217,38,0.45)]"
          : "border-primary/12 bg-white hover:border-primary/30 hover:bg-[#ffffff]/70",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-primary bg-primary" : "border-primary/30 bg-white",
        )}
        aria-hidden
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
          selected
            ? "border-primary/25 bg-primary/10 text-primary"
            : "border-primary/12 bg-[#ffffff] text-primary/80",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-[15px] font-semibold text-[#B8D926] sm:text-base">
          {title}
        </span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-[#4a5228]">
          {description}
        </span>
      </span>
    </button>
  );
}
