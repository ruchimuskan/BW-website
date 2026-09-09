"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { cn } from "@/lib/utils";

type Step = "ask" | "help";

interface RideSafetyCheckDialogProps {
  open: boolean;
  driverName?: string;
  sosLoading?: boolean;
  onSafe: () => void;
  onNeedHelp: () => void;
  onSendSos: () => void | Promise<void>;
  onOpenSafetyTools?: () => void;
}

export function RideSafetyCheckDialog({
  open,
  driverName,
  sosLoading = false,
  onSafe,
  onNeedHelp,
  onSendSos,
  onOpenSafetyTools,
}: RideSafetyCheckDialogProps) {
  const [step, setStep] = useState<Step>("ask");

  useEffect(() => {
    if (!open) setStep("ask");
  }, [open]);

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
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss safety check"
        onClick={() => {
          if (step === "ask") onSafe();
          else setStep("ask");
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ride-safety-check-title"
        aria-describedby="ride-safety-check-desc"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-[28px] border border-primary/12 bg-white p-6 shadow-[0_28px_64px_-24px_rgba(40,54,20,0.55)] sm:p-7"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#eef5ff] text-[#2563eb]">
          {step === "ask" ? (
            <ShieldCheck className="h-8 w-8" strokeWidth={2} />
          ) : (
            <Siren className="h-8 w-8 text-destructive" strokeWidth={2} />
          )}
        </div>

        {step === "ask" ? (
          <>
            <h2
              id="ride-safety-check-title"
              className="text-center font-heading text-xl font-bold tracking-tight text-[#38471B] sm:text-[1.35rem]"
            >
              Are you safe?
            </h2>
            <p
              id="ride-safety-check-desc"
              className="mt-2 text-center text-sm leading-relaxed text-[#4a5228]"
            >
              {driverName
                ? `We’re checking in during your trip with ${driverName}. Let us know if everything is okay.`
                : "We’re checking in during your trip. Let us know if everything is okay."}
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                onClick={onSafe}
                className={cn("h-12 w-full rounded-2xl text-base", BRAND_CTA_LIME)}
              >
                Yes, I&apos;m safe
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("help");
                  onNeedHelp();
                }}
                className="h-12 w-full rounded-2xl border border-destructive/25 bg-[#fff6f4] text-sm font-semibold text-destructive transition hover:bg-[#ffece8]"
              >
                I need help
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              id="ride-safety-check-title"
              className="text-center font-heading text-xl font-bold tracking-tight text-[#38471B] sm:text-[1.35rem]"
            >
              Do you want to send SOS?
            </h2>
            <p
              id="ride-safety-check-desc"
              className="mt-2 text-center text-sm leading-relaxed text-[#4a5228]"
            >
              We can alert your emergency contacts and BW Rides support with
              your live location and captain details right away.
            </p>

            <div className="mt-4 rounded-2xl border border-[#ffd8cc] bg-[#fff8f5] p-4 text-sm leading-relaxed text-[#5a6330]">
              Sending SOS is for emergencies. If you are in immediate danger, send
              SOS now or call emergency services.
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                disabled={sosLoading}
                onClick={() => void onSendSos()}
                variant="destructive"
                className="h-12 w-full rounded-2xl text-base"
              >
                {sosLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Yes, send SOS"
                )}
              </Button>
              {onOpenSafetyTools ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={sosLoading}
                  onClick={onOpenSafetyTools}
                  className="h-11 w-full rounded-2xl border-[#dce8a8] text-[#38471B]"
                >
                  Open Safety tools
                </Button>
              ) : null}
              <button
                type="button"
                disabled={sosLoading}
                onClick={() => setStep("ask")}
                className="h-11 w-full rounded-2xl text-sm font-semibold text-[#38471B] transition hover:bg-[#f7fbe8]"
              >
                No, go back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
