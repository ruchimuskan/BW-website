"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type ViewBookingsButtonVariant = "default" | "compact" | "soft";

interface ViewBookingsButtonProps {
  label?: string;
  variant?: ViewBookingsButtonVariant;
  className?: string;
  onClick?: () => void;
  href?: string;
}

const variantStyles: Record<ViewBookingsButtonVariant, string> = {
  default:
    "w-full min-h-12 rounded-2xl px-3.5 py-2.5 text-sm sm:min-h-[3.25rem] sm:px-4 sm:text-[15px]",
  compact:
    "w-full min-h-11 rounded-2xl px-3.5 py-2.5 text-xs sm:w-auto sm:min-h-11 sm:rounded-full sm:px-4 sm:text-sm",
  soft:
    "w-full min-h-12 rounded-2xl px-3.5 py-2.5 text-sm sm:min-h-[3.25rem] sm:px-4 sm:text-[15px]",
};

const toneStyles: Record<ViewBookingsButtonVariant, string> = {
  default:
    "bg-[#38471B] text-white shadow-[0_14px_32px_-16px_rgba(40,54,20,0.55)] hover:bg-[#4A5824] hover:shadow-[0_18px_40px_-16px_rgba(40,54,20,0.62)] hover:-translate-y-0.5",
  compact:
    "bg-[#38471B] text-white shadow-[0_10px_24px_-14px_rgba(40,54,20,0.5)] hover:bg-[#4A5824] hover:-translate-y-px",
  soft:
    "border border-[#e8f0c8] bg-white text-[#38471B] shadow-[0_8px_24px_-18px_rgba(56,71,27,0.28)] hover:border-[#B8D926]/50 hover:bg-[#f7fbe8]",
};

export function ViewBookingsButton({
  label = "View all bookings",
  variant = "default",
  className,
  onClick,
  href = ROUTES.bookings,
}: ViewBookingsButtonProps) {
  const isSoft = variant === "soft";
  const isCompact = variant === "compact";

  const content = (
    <>
      {!isSoft ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(200,232,74,0.14)_50%,transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      ) : null}

      <span
        className={cn(
          "relative flex w-full items-center gap-2.5 sm:gap-3",
          isCompact ? "justify-center sm:justify-start" : "justify-between",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9",
            isSoft
              ? "bg-[#f7fbe8] text-[#38471B] ring-1 ring-[#e8f0c8]"
              : "bg-[#B8D926] text-[#38471B] shadow-sm",
          )}
        >
          <CalendarCheck className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <span
          className={cn(
            "min-w-0 font-semibold tracking-wide",
            isCompact ? "truncate" : "flex-1 truncate text-left",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9",
            isSoft ? "bg-[#f7fbe8] text-[#38471B]" : "bg-white/10 text-[#C8E84A]",
          )}
        >
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </span>
    </>
  );

  const sharedClassName = cn(
    "group relative inline-flex items-center overflow-hidden font-heading transition-all duration-300 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D926]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbe8]",
    variantStyles[variant],
    toneStyles[variant],
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClassName}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={sharedClassName}>
      {content}
    </Link>
  );
}
