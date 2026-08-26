"use client";

import { CalendarClock, ChevronRight, Clock, MapPin, Navigation } from "lucide-react";
import { brandTheme } from "@/lib/brand-theme";
import { cn } from "@/lib/utils";

export type BookingCardStatus =
  | "Completed"
  | "Cancelled"
  | "Scheduled"
  | "Upcoming"
  | "Live";

interface BookingListCardProps {
  destination: string;
  pickup: string;
  price: string;
  vehicleType?: string;
  dateLabel: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  bookedLabel?: string | null;
  isScheduledTrip?: boolean;
  scheduledLabel?: string | null;
  status?: BookingCardStatus;
  highlighted?: boolean;
  onClick?: () => void;
}

const statusStyles: Record<BookingCardStatus, string> = {
  Completed: "bg-[#eef5d4] text-[#38471B]",
  Cancelled: "bg-[#fce8ea] text-[#b42318]",
  Scheduled: "bg-[#B8D926]/18 text-[#38471B]",
  Upcoming: "bg-[#f7fbe8] text-[#38471B]",
  Live: "bg-[#38471B] text-[#C8E84A]",
};

export function BookingListCard({
  destination,
  pickup,
  price,
  vehicleType,
  dateLabel,
  scheduledDate,
  scheduledTime,
  bookedLabel,
  isScheduledTrip = false,
  scheduledLabel,
  status,
  highlighted = false,
  onClick,
}: BookingListCardProps) {
  const className = cn(
    brandTheme.surfaceCard,
    "group flex h-full w-full flex-col p-4 sm:p-5",
    highlighted && "border-primary/40 shadow-[0_16px_36px_-20px_rgba(184,217,38,0.45)] ring-1 ring-primary/20",
    isScheduledTrip && !highlighted && "border-secondary/30 bg-[#fcfef8]",
    onClick && brandTheme.surfaceCardInteractive,
  );

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0">
            <span className="relative flex flex-col items-center pt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#B8D926] ring-4 ring-[#B8D926]/20" />
              <span className="my-1 w-px flex-1 min-h-[18px] bg-gradient-to-b from-[#B8D926] to-[#38471B]/40" />
              <MapPin className="h-3.5 w-3.5 text-[#38471B]" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 pb-3">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-[#5a6330] uppercase">
                Pickup
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-[#38471B] sm:text-[15px]">
                {pickup}
              </p>
            </div>
            <div className="col-start-2 min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-[#5a6330] uppercase">
                Drop-off
              </p>
              <p className="mt-0.5 line-clamp-2 font-heading text-[15px] font-semibold leading-snug text-[#38471B] sm:text-base">
                {destination}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="font-heading text-base font-bold tabular-nums text-[#38471B] sm:text-lg">
            {price}
          </span>
          {status ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                statusStyles[status],
              )}
            >
              {status}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#e8f0c8] pt-3">
        {isScheduledTrip && scheduledDate ? (
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f7fbe8] px-2.5 py-1 text-xs font-semibold text-[#38471B] ring-1 ring-[#e8f0c8]">
            <CalendarClock className="h-3.5 w-3.5 text-[#B8D926]" aria-hidden />
            {scheduledDate}
            {scheduledTime ? (
              <>
                <span className="text-[#C8E84A]" aria-hidden>
                  ·
                </span>
                <Clock className="h-3.5 w-3.5 text-[#B8D926]" aria-hidden />
                {scheduledTime}
              </>
            ) : null}
          </span>
        ) : dateLabel ? (
          <span className="text-xs font-medium text-[#5a6330]">{dateLabel}</span>
        ) : null}

        {vehicleType ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f7fbe8] px-2 py-1 text-[10px] font-semibold tracking-wide text-[#38471B] uppercase">
            <Navigation className="h-3 w-3 text-[#B8D926]" />
            {vehicleType}
          </span>
        ) : null}

        {scheduledLabel ? (
          <span className="text-[10px] font-semibold tracking-[0.12em] text-[#B8D926] uppercase">
            {scheduledLabel}
          </span>
        ) : null}

        {bookedLabel ? (
          <span className="min-w-0 truncate text-[11px] text-[#5a6330]">
            {bookedLabel}
          </span>
        ) : null}

        {onClick ? (
          <ChevronRight
            className="ml-auto h-4 w-4 shrink-0 text-[#C8E84A] transition-transform group-hover:translate-x-0.5 group-hover:text-[#B8D926]"
            aria-hidden
          />
        ) : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }

  return <article className={className}>{body}</article>;
}
