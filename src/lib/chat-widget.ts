import { ROUTES } from "@/constants/routes";

/** Hide the assistant on auth and corporate screens. */
export function isChatHiddenPath(pathname: string): boolean {
  if (
    pathname === ROUTES.login ||
    pathname === ROUTES.signup ||
    pathname === ROUTES.otp ||
    pathname === ROUTES.createProfile ||
    pathname.startsWith(`${ROUTES.createProfile}/`)
  ) {
    return true;
  }
  if (pathname.startsWith("/corporate/")) return true;
  return false;
}

export function isChatWidgetPath(pathname: string): boolean {
  return !isChatHiddenPath(pathname);
}

/** Extra bottom offset so the FAB does not cover nav or sticky CTAs. */
export function chatFabOffsetClass(pathname: string): string {
  // Sticky book/ambulance footers — keep elevation on desktop too.
  const stickyCta =
    pathname === ROUTES.book ||
    pathname === "/ambulance/type" ||
    pathname === "/ambulance/request" ||
    pathname === "/ambulance/assigned" ||
    pathname.startsWith("/ambulance/tracking");

  if (stickyCta) {
    return "bottom-[calc(11.75rem+env(safe-area-inset-bottom))] lg:bottom-[calc(8.5rem+env(safe-area-inset-bottom))]";
  }

  if (pathname.startsWith("/profile/refer-earn") || pathname === ROUTES.profileReferEarn) {
    return "bottom-[calc(6.5rem+env(safe-area-inset-bottom))] lg:bottom-7";
  }

  const hasBottomNav =
    pathname === ROUTES.home ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/activity") ||
    pathname.startsWith("/rental");

  if (hasBottomNav) {
    return "bottom-[calc(5.75rem+env(safe-area-inset-bottom))] lg:bottom-7";
  }

  return "bottom-6 sm:bottom-7";
}
