import { ROUTES } from "@/constants/routes";

/** Hide the assistant on auth, corporate, and full-screen flows. */
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
  if (pathname === ROUTES.location || pathname.startsWith(`${ROUTES.location}/`)) {
    return true;
  }
  return false;
}

export function isChatWidgetPath(pathname: string): boolean {
  return !isChatHiddenPath(pathname);
}

/** Profile / info screens that hide the bottom nav bar. */
const NO_BOTTOM_NAV_PREFIXES = [
  ROUTES.notifications,
  ROUTES.profileSavedPlaces,
  ROUTES.profileReferEarn,
  ROUTES.profileAbout,
  ROUTES.profileHelp,
  ROUTES.profileHelpMessages,
  "/profile/help/",
  "/legal/",
  ROUTES.about,
  ROUTES.terms,
  ROUTES.privacy,
] as const;

function pathHasBottomNav(pathname: string): boolean {
  if (
    NO_BOTTOM_NAV_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix),
    )
  ) {
    return false;
  }

  return (
    pathname === ROUTES.home ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/activity") ||
    pathname.startsWith("/rental")
  );
}

/** Extra bottom offset so the FAB does not cover nav or sticky CTAs. */
export function chatFabOffsetClass(pathname: string): string {
  const safe = "env(safe-area-inset-bottom)";

  // Sticky book/ambulance footers — keep elevation on desktop too.
  const stickyCta =
    pathname === ROUTES.book ||
    pathname === "/ambulance/type" ||
    pathname === "/ambulance/request" ||
    pathname === "/ambulance/assigned" ||
    pathname.startsWith("/ambulance/tracking");

  if (stickyCta) {
    return `bottom-[calc(11.75rem+${safe})] lg:bottom-[calc(8.5rem+${safe})]`;
  }

  if (pathHasBottomNav(pathname)) {
    return `bottom-[calc(5.75rem+${safe})] lg:bottom-7`;
  }

  return `bottom-[calc(1.5rem+${safe})] sm:bottom-[calc(1.75rem+${safe})]`;
}

/** Same as {@link chatFabOffsetClass} but scoped to `lg+` (mobile sheet uses `bottom-0`). */
export function chatFabLgOffsetClass(pathname: string): string {
  return chatFabOffsetClass(pathname)
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `lg:${token}`)
    .join(" ");
}
