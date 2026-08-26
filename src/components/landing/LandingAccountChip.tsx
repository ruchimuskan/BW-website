"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, User } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthUser, getDisplayName } from "@/hooks/useAuthUser";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";
import { cn } from "@/lib/utils";

type LandingAccountChipProps = {
  luxury?: boolean;
  className?: string;
  onNavigate?: () => void;
  layout?: "chip" | "card" | "icon";
};

export function LandingAccountChip({
  luxury = false,
  className,
  onNavigate,
  layout = "chip",
}: LandingAccountChipProps) {
  const { loggedIn } = useIsAuthenticated();
  const user = useAuthUser();

  if (!loggedIn) {
    if (layout === "icon") {
      return (
        <Link
          href={ROUTES.login}
          onClick={onNavigate}
          aria-label="Sign in"
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors active:scale-95",
            luxury
              ? "border-white/25 bg-white/10 text-white hover:border-[#C8E84A] hover:bg-white/15"
              : "border-primary/25 bg-white text-primary shadow-[0_6px_16px_-10px_rgba(184,217,38,0.55)] hover:border-primary hover:bg-primary hover:text-white",
            className,
          )}
        >
          <User className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
      );
    }

    return (
      <Link
        href={ROUTES.login}
        onClick={onNavigate}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
          luxury
            ? "text-white hover:bg-white/10 hover:text-[#C8E84A]"
            : "text-foreground hover:bg-primary/10 hover:text-primary",
          className,
        )}
      >
        <User className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        Sign in
      </Link>
    );
  }

  const displayName = getDisplayName({ name: user.name });
  const firstName =
    displayName === "Bull Wave Rides User"
      ? "My account"
      : displayName.split(/\s+/).filter(Boolean)[0] || "My account";

  if (layout === "icon") {
    return (
      <Link
        href={ROUTES.home}
        onClick={onNavigate}
        aria-label={`${user.name}, go to dashboard`}
        className={cn(
          "inline-flex shrink-0 rounded-full transition-transform active:scale-95",
          className,
        )}
      >
        <AvatarBubble user={user} size="sm" />
      </Link>
    );
  }

  if (layout === "card") {
    return (
      <Link
        href={ROUTES.home}
        onClick={onNavigate}
        className={cn(
          "flex w-full min-w-0 items-center gap-3 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99]",
          luxury
            ? "border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15"
            : "border-primary/12 bg-white shadow-sm hover:border-primary/25 hover:shadow-md",
          className,
        )}
      >
        <AvatarBubble user={user} size="md" />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[10px] font-semibold tracking-[0.16em] uppercase",
              luxury ? "text-[#D4E88A]/90" : "text-secondary",
            )}
          >
            Signed in
          </p>
          <p
            className={cn(
              "truncate font-heading text-base font-semibold",
              luxury ? "text-white" : "text-[#38471B]",
            )}
            suppressHydrationWarning
          >
            {user.name}
          </p>
          <p
            className={cn(
              "truncate text-xs",
              luxury ? "text-white/75" : "text-[#4a5228]/85",
            )}
            suppressHydrationWarning
          >
            Go to dashboard
          </p>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0",
            luxury ? "text-white/60" : "text-primary/45",
          )}
          aria-hidden
        />
      </Link>
    );
  }

  return (
    <Link
      href={ROUTES.home}
      onClick={onNavigate}
      className={cn(
        "group flex min-w-0 max-w-[10.5rem] items-center gap-2 rounded-full border px-2 py-1.5 shadow-sm transition-all duration-300 sm:max-w-[12.5rem] sm:gap-2.5 sm:px-2.5 sm:py-2",
        "hover:shadow-[0_10px_28px_-18px_rgba(184,217,38,0.45)] active:scale-[0.98]",
        luxury
          ? "border-white/20 bg-white/10 hover:border-white/35 hover:bg-white/15"
          : "border-primary/15 bg-gradient-to-r from-[#ffffff] via-white to-[#f7fbe8] hover:border-primary/30",
        className,
      )}
      aria-label={`${user.name}, go to dashboard`}
    >
      <AvatarBubble user={user} size="sm" />
      <div className="min-w-0 flex-1 leading-tight">
        <p
          className={cn(
            "truncate text-xs font-semibold sm:text-sm",
            luxury ? "text-white" : "text-[#38471B]",
          )}
          suppressHydrationWarning
        >
          {firstName}
        </p>
        <p
          className={cn(
            "hidden truncate text-[10px] font-medium sm:block",
            luxury ? "text-white/70" : "text-[#4a5228]/75",
          )}
        >
          Dashboard
        </p>
      </div>
      {!user.isLoading && user.rating > 0 ? (
        <span
          className={cn(
            "hidden shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold sm:inline-flex",
            luxury ? "bg-white/15 text-white" : "bg-primary/10 text-primary",
          )}
        >
          <Star className="h-3 w-3 fill-secondary text-secondary" strokeWidth={1.5} />
          {user.rating}
        </span>
      ) : null}
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5",
          luxury ? "text-white/50 group-hover:text-white/80" : "text-primary/40 group-hover:text-primary/70",
        )}
        aria-hidden
      />
    </Link>
  );
}

function AvatarBubble({
  user,
  size,
}: {
  user: ReturnType<typeof useAuthUser>;
  size: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  return (
    <div className="relative shrink-0">
      <div
        aria-hidden
        className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-secondary opacity-90"
      />
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#8FA618] to-[#C8E84A] font-heading font-bold text-white ring-2 ring-white/90",
          dim,
        )}
      >
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes={size === "sm" ? "32px" : "40px"}
          />
        ) : (
          <span suppressHydrationWarning>{user.initial}</span>
        )}
      </div>
    </div>
  );
}
