"use client";

import { Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RideCardProps {
  /** Primary line — usually dropoff / destination */
  title: string;
  /** Secondary line — usually pickup / origin */
  address: string;
  date: string;
  price: string;
  status?: string;
  vehicleType?: string;
  scheduledLabel?: string | null;
  onClick?: () => void;
}

export function RideCard({
  title,
  address,
  date,
  price,
  status,
  vehicleType,
  scheduledLabel,
  onClick,
}: RideCardProps) {
  const className = cn(
    "group flex w-full flex-col gap-2.5 rounded-2xl border border-[#eef5d4] bg-white p-4 text-left shadow-[0_10px_28px_-22px_rgba(40,54,20,0.35)] transition-all sm:p-5",
    "hover:border-primary/30 hover:shadow-[0_16px_36px_-24px_rgba(184,217,38,0.35)]",
    onClick && "cursor-pointer active:scale-[0.995]",
  );

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-heading text-[15px] font-semibold leading-snug text-[#B8D926] sm:text-base">
            {title}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm font-medium text-[#7a8448]">
            {address}
          </p>
          {vehicleType ? (
            <p className="mt-1.5 text-xs font-medium text-[#5a6330]/80">
              {vehicleType}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-start gap-0.5">
          <span className="font-heading text-base font-bold text-[#B8D926] sm:text-lg">
            {price}
          </span>
          {onClick ? (
            <ChevronRight className="mt-1 h-4 w-4 text-primary/40 transition group-hover:translate-x-0.5" />
          ) : null}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#5a6330]">
            <Clock className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{date}</span>
          </div>
          {scheduledLabel ? (
            <p className="mt-1 text-xs font-medium text-[#5a6330]">
              {scheduledLabel}
            </p>
          ) : null}
        </div>

        {status ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide",
              status === "Completed" && "bg-emerald-500/10 text-emerald-700",
              status === "Cancelled" && "bg-destructive/10 text-destructive",
              status === "Scheduled" && "bg-[#f4f9e4] text-[#B8D926]",
              status === "Upcoming" && "bg-secondary/15 text-primary",
              status === "Live" && "bg-secondary/20 text-secondary",
            )}
          >
            {status}
          </span>
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

  return <div className={className}>{body}</div>;
}
