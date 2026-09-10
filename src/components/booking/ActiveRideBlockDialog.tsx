"use client";

import { useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  MapPin,
  Navigation2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  activeRideBlockMessage,
  formatActiveRideStatus,
} from "@/lib/active-ride-guard";
import type { Ride } from "@/lib/ride-api";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";

interface ActiveRideBlockDialogProps {
  open: boolean;
  ride: Ride | null;
  errorMessage?: string;
  onClose: () => void;
  onViewBookings: () => void;
}

export function ActiveRideBlockDialog({
  open,
  ride,
  errorMessage,
  onClose,
  onViewBookings,
}: ActiveRideBlockDialogProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || (!ride && !errorMessage)) return null;

  const status = ride ? formatActiveRideStatus(ride) : "";
  const vehicle =
    ride?.vehicle_type_name?.trim() ||
    ride?.driver?.vehicle_number?.trim() ||
    null;
  const captain = ride?.driver?.name?.trim() || null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0b100b]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="active-ride-block-title"
        aria-describedby="active-ride-block-desc"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-t-[1.5rem] border border-[#e0e6d2] bg-white shadow-[0_28px_64px_-20px_rgba(17,20,17,0.55)] sm:rounded-[1.5rem]"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#111411] via-[#C6E31A] to-[#9BB820]"
          aria-hidden
        />

        <div className="bg-gradient-to-b from-[#f7f9f0] to-white px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111411] text-[#C6E31A] shadow-sm">
            <ShieldAlert className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>

          <p className="mt-4 text-center text-[10px] font-semibold tracking-[0.2em] text-[#5a7a12] uppercase">
            Trip in progress
          </p>
          <h2
            id="active-ride-block-title"
            className="mt-1.5 text-center font-heading text-xl font-bold tracking-tight text-[#111411] sm:text-[1.4rem]"
          >
            {ride ? "Finish your current ride first" : "Could not start a new booking"}
          </h2>
          <p
            id="active-ride-block-desc"
            className="mx-auto mt-2 max-w-[34ch] text-center text-sm leading-relaxed text-[#5A6158]"
          >
            {ride ? activeRideBlockMessage(ride) : errorMessage}
          </p>
        </div>

        {ride ? (
          <div className="mx-5 rounded-2xl border border-[#e4e8da] bg-[#fafbf7] p-4 sm:mx-6">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#5a7a12] uppercase">
                <CarFront className="h-3.5 w-3.5" aria-hidden />
                Live from server
              </span>
              <span className="rounded-full border border-[#C6E31A]/40 bg-[#C6E31A]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#111411]">
                {status}
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="flex gap-2.5">
                <Navigation2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C6E31A]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-wide text-[#8a9184] uppercase">
                    Pickup
                  </p>
                  <p className="line-clamp-2 text-sm font-medium text-[#111411]">
                    {ride.pickup_address || "Pickup location"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9BB820]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-wide text-[#8a9184] uppercase">
                    Drop-off
                  </p>
                  <p className="line-clamp-2 text-sm font-medium text-[#111411]">
                    {ride.dropoff_address || "Drop-off location"}
                  </p>
                </div>
              </div>
            </div>

            {(vehicle || captain) && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-[#e8ecd8] pt-3 text-xs text-[#5A6158]">
                {vehicle ? (
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium">
                    {vehicle}
                  </span>
                ) : null}
                {captain ? (
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium">
                    Captain {captain}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5 px-5 py-5 sm:px-6 sm:pb-6">
          <Button
            type="button"
            onClick={onViewBookings}
            className={cn(
              "h-12 w-full rounded-xl text-[15px] font-bold tracking-wide",
              BRAND_CTA_LIME,
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {ride ? "Open current trip" : "Open My Bookings"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl text-sm font-semibold text-[#5A6158] transition hover:bg-[#f5f7f0] hover:text-[#111411]"
          >
            Stay on this page
          </button>
        </div>
      </div>
    </div>
  );
}
