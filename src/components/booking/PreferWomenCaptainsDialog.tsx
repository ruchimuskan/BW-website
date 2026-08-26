"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";

interface PreferWomenCaptainsDialogProps {
  open: boolean;
  onEnable: () => void;
  onSkip: () => void;
}

export function PreferWomenCaptainsDialog({
  open,
  onEnable,
  onSkip,
}: PreferWomenCaptainsDialogProps) {
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
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss"
        onClick={onSkip}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prefer-women-captains-title"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-[28px] border border-primary/12 bg-white p-6 shadow-[0_28px_64px_-24px_rgba(40,54,20,0.55)] sm:p-7"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f9e4] text-[#B8D926]">
          <span className="text-3xl font-semibold leading-none" aria-hidden>
            ♀
          </span>
        </div>

        <h2
          id="prefer-women-captains-title"
          className="text-center font-heading text-xl font-bold tracking-tight text-[#B8D926] sm:text-[1.35rem]"
        >
          Prefer women captains?
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#4a5228]">
          Enable this to request women captains only for this ride. If disabled,
          your request will go to all nearby captains.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            type="button"
            onClick={onEnable}
            className={cn("h-12 w-full rounded-2xl text-base", BRAND_CTA_LIME)}
          >
            Enable women captains
          </Button>
          <button
            type="button"
            onClick={onSkip}
            className="h-11 w-full rounded-2xl text-sm font-semibold text-[#38471B] transition hover:bg-[#f7fbe8]"
          >
            Continue with any captain
          </button>
        </div>
      </div>
    </div>
  );
}
