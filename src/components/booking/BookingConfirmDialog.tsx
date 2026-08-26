"use client";

import { useEffect } from "react";
import { Clock3, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";

interface BookingConfirmDialogProps {
  open: boolean;
  isLoading?: boolean;
  pickup: string;
  dropoff: string;
  vehicleName: string;
  fareLabel: string;
  paymentLabel: string;
  scheduleLabel?: string | null;
  womenSafetyEnabled?: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function BookingConfirmDialog({
  open,
  isLoading = false,
  pickup,
  dropoff,
  vehicleName,
  fareLabel,
  paymentLabel,
  scheduleLabel,
  womenSafetyEnabled = false,
  onConfirm,
  onBack,
}: BookingConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onBack}
        disabled={isLoading}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-confirm-title"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-[28px] border border-primary/12 bg-white shadow-[0_28px_64px_-24px_rgba(40,54,20,0.55)]"
      >
        <div className="border-b border-[#eef5d4] bg-[#ffffff] px-6 py-5">
          <h2
            id="booking-confirm-title"
            className="font-heading text-xl font-bold tracking-tight text-[#B8D926]"
          >
            Confirm your booking
          </h2>
          <p className="mt-1 text-sm text-[#5a6330]">
            Review your trip details before we save it to your account.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-2xl border border-[#eef5d4] bg-[#ffffff] p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B8D926]" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8448]">
                  Pickup
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-[#38471B]">
                  {pickup}
                </p>
              </div>
            </div>
            <div className="my-3 ml-2 h-5 border-l-2 border-dashed border-[#dce8a8]" />
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B8D926]" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8448]">
                  Drop
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-[#38471B]">
                  {dropoff}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-[#eef5d4] bg-white px-3 py-2.5">
              <p className="text-xs text-[#7a8448]">Vehicle</p>
              <p className="mt-0.5 font-semibold text-[#38471B]">{vehicleName}</p>
            </div>
            <div className="rounded-xl border border-[#eef5d4] bg-white px-3 py-2.5">
              <p className="text-xs text-[#7a8448]">Fare</p>
              <p className="mt-0.5 font-semibold text-[#38471B]">{fareLabel}</p>
            </div>
            <div className="rounded-xl border border-[#eef5d4] bg-white px-3 py-2.5">
              <p className="text-xs text-[#7a8448]">Payment</p>
              <p className="mt-0.5 font-semibold text-[#38471B]">{paymentLabel}</p>
            </div>
            <div className="rounded-xl border border-[#eef5d4] bg-white px-3 py-2.5">
              <p className="text-xs text-[#7a8448]">When</p>
              <p className="mt-0.5 flex items-center gap-1 font-semibold text-[#38471B]">
                {scheduleLabel ? (
                  <>
                    <Clock3 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{scheduleLabel}</span>
                  </>
                ) : (
                  "Leave now"
                )}
              </p>
            </div>
          </div>

          {womenSafetyEnabled ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#f7fbe8] px-3 py-2.5 text-sm font-medium text-[#38471B]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Women captains preferred for this ride
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-[#e8f0c8] bg-[#f7fbe8]/50 px-5 py-4 sm:px-6 sm:py-5">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn("h-12 w-full rounded-2xl text-base", BRAND_CTA_LIME)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Confirming booking…
              </>
            ) : (
              "Confirm booking"
            )}
          </Button>
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="h-11 w-full rounded-2xl text-sm font-semibold text-[#38471B] transition hover:bg-white disabled:opacity-50"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
