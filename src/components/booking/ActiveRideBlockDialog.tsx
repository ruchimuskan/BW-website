"use client";

import { useEffect } from "react";
import { MapPin } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 sm:items-center">
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
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-[28px] border border-primary/12 bg-white p-6 shadow-[0_28px_64px_-24px_rgba(40,54,20,0.55)] sm:p-7"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4e8] text-[#c45a00]">
          <MapPin className="h-7 w-7" aria-hidden />
        </div>

        <h2
          id="active-ride-block-title"
          className="text-center font-heading text-xl font-bold tracking-tight text-[#38471B] sm:text-[1.35rem]"
        >
          {ride ? "Finish your current ride first" : "Could not start a new booking"}
        </h2>
        <p
          id="active-ride-block-desc"
          className="mt-2 text-center text-sm leading-relaxed text-[#4a5228]"
        >
          {ride
            ? activeRideBlockMessage(ride)
            : errorMessage}
        </p>

        {ride ? (
          <div className="mt-4 rounded-2xl border border-[#e8f0c8] bg-[#f7fbe8] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[#B8D926] uppercase">
                Current booking
              </p>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#38471B]">
                {status}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-[#38471B]">
              {ride.pickup_address}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-[#5a6330]">
              → {ride.dropoff_address}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            type="button"
            onClick={onViewBookings}
            className={cn("h-12 w-full rounded-2xl text-base", BRAND_CTA_LIME)}
          >
            View my booking
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-2xl text-sm font-semibold text-[#38471B] transition hover:bg-[#f7fbe8]"
          >
            OK, got it
          </button>
        </div>
      </div>
    </div>
  );
}
