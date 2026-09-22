"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { AuthUserDisplay } from "@/hooks/useAuthUser";
import { cn } from "@/lib/utils";

type UserProfileNameCardProps = {
  user: AuthUserDisplay;
  onNavigate?: () => void;
  variant?: "sidebar" | "compact" | "profile";
  href?: string;
  className?: string;
};

export function UserProfileNameCard({
  user,
  onNavigate,
  variant = "sidebar",
  href = ROUTES.profile,
  className,
}: UserProfileNameCardProps) {
  const compact = variant === "compact";
  const profile = variant === "profile";
  const showRating = !user.isLoading && user.rating > 0;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex w-full min-w-0 items-center gap-3 rounded-2xl border border-primary/12 bg-white/90 text-left shadow-[0_12px_32px_-24px_rgba(184,217,38,0.35)] backdrop-blur-sm transition-all duration-300",
        "hover:border-primary/25 hover:shadow-[0_18px_40px_-22px_rgba(184,217,38,0.42)] active:scale-[0.99]",
        compact ? "gap-2.5 p-2.5 sm:gap-3 sm:p-3" : profile ? "gap-4 p-4 sm:gap-5 sm:p-5" : "gap-3.5 p-3.5 sm:gap-4 sm:p-4",
        className,
      )}
    >
      <div className="relative shrink-0">
        <div
          aria-hidden
          className={cn(
            "absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary via-[#9BB820] to-secondary opacity-90 transition-opacity group-hover:opacity-100",
            compact ? "blur-[1px]" : "",
          )}
        />
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#8FA618] to-[#C8E84A] font-heading font-bold text-white shadow-md ring-2 ring-white",
            compact
              ? "h-11 w-11 text-base sm:h-12 sm:w-12 sm:text-lg"
              : profile
                ? "h-16 w-16 text-2xl sm:h-20 sm:w-20 sm:text-3xl"
                : "h-14 w-14 text-xl sm:h-16 sm:w-16 sm:text-2xl",
          )}
        >
          {user.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes={compact ? "48px" : "64px"}
            />
          ) : (
            <span aria-hidden>{user.initial}</span>
          )}
        </div>
        <span
          aria-hidden
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 shadow-sm sm:h-3.5 sm:w-3.5"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-semibold tracking-[0.18em] uppercase text-secondary",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-[11px]",
          )}
        >
          Your account
        </p>
        <p
          className={cn(
            "truncate font-heading font-semibold text-[#38471B]",
            compact
              ? "text-base sm:text-lg"
              : profile
                ? "text-xl sm:text-2xl"
                : "text-lg sm:text-xl",
          )}
          suppressHydrationWarning
        >
          {user.name?.trim() || (user.isLoading ? "…" : "Your profile")}
        </p>
        <p
          className={cn(
            "truncate text-[#4a5228]/85",
            compact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm",
          )}
          suppressHydrationWarning
        >
          {user.phone || "Add phone number"}
        </p>
        {showRating ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 font-semibold text-primary",
                compact ? "text-[10px]" : "text-[11px]",
              )}
            >
              <Star className="h-3 w-3 fill-secondary text-secondary" strokeWidth={1.5} />
              {user.rating} rating
            </span>
          </div>
        ) : null}
      </div>

      <ChevronRight
        className={cn(
          "shrink-0 text-primary/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/70",
          compact ? "h-4 w-4" : "h-5 w-5",
        )}
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  );
}
