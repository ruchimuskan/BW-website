"use client";

import { useEffect } from "react";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";
import type { Ride } from "@/lib/ride-api";

interface CaptainNotAssignedDialogProps {
  open: boolean;
  ride: Ride | null;
  onClose: () => void;
  onBookAgain: () => void;
}

export function CaptainNotAssignedDialog({
  open,
  ride,
  onClose,
  onBookAgain,
}: CaptainNotAssignedDialogProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !ride) return null;

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
        aria-labelledby="captain-not-assigned-title"
        aria-describedby="captain-not-assigned-desc"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-[28px] border border-primary/12 bg-white p-6 shadow-[0_28px_64px_-24px_rgba(40,54,20,0.55)] sm:p-7"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4e8] text-[#c45a00]">
          <UserX className="h-7 w-7" aria-hidden />
        </div>
        <h2
          id="captain-not-assigned-title"
          className="text-center font-heading text-xl font-bold tracking-tight text-[#38471B]"
        >
          Captain is not assigned
        </h2>
        <p
          id="captain-not-assigned-desc"
          className="mt-2 text-center text-sm leading-relaxed text-[#4a5228]"
        >
          No captain was assigned for this trip, so the booking was closed. You can book again
          whenever you are ready.
        </p>
        <div className="mt-4 rounded-2xl border border-[#e8f0c8] bg-[#f7fbe8] p-4">
          <p className="line-clamp-2 text-sm font-medium text-[#38471B]">{ride.pickup_address}</p>
          <p className="mt-1 line-clamp-2 text-sm text-[#5a6330]">→ {ride.dropoff_address}</p>
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            type="button"
            onClick={onBookAgain}
            className={cn("h-12 w-full rounded-2xl text-base", BRAND_CTA_LIME)}
          >
            Book again
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
