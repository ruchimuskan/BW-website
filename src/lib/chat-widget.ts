import { ROUTES } from "@/constants/routes";

/** Hide the assistant only on phone-auth screens so OTPs stay unobstructed. */
export function isChatHiddenPath(pathname: string): boolean {
  return (
    pathname === ROUTES.login ||
    pathname === ROUTES.signup ||
    pathname === ROUTES.otp
  );
}

export function isChatWidgetPath(pathname: string): boolean {
  return !isChatHiddenPath(pathname);
}

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

function pathHasStickyCta(pathname: string): boolean {
  return (
    pathname === ROUTES.book ||
    pathname === "/ambulance/type" ||
    pathname === "/ambulance/request" ||
    pathname === "/ambulance/assigned" ||
    pathname.startsWith("/ambulance/tracking")
  );
}

export function chatFabDockClass(pathname: string): string {
  if (pathHasStickyCta(pathname)) return "bw-chat-fab-dock bw-chat-fab-dock--cta";
  if (pathHasBottomNav(pathname)) return "bw-chat-fab-dock bw-chat-fab-dock--nav";
  return "bw-chat-fab-dock";
}
