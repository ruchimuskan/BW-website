import { ROUTES } from "@/constants/routes";

/**
 * Shared route access rules for middleware (edge) and client auth guards.
 * Cookie flag alone is not enough — client must also have a backend access token.
 */

/** Exact paths anyone can open without rider login. */
export const PUBLIC_PATHS = new Set<string>([
  ROUTES.landing,
  ROUTES.about,
  ROUTES.careers,
  ROUTES.blogs,
  ROUTES.safety,
  ROUTES.sos,
  ROUTES.captains,
  ROUTES.ride,
  ROUTES.download,
  ROUTES.terms,
  ROUTES.privacy,
  ROUTES.legalSafety,
  ROUTES.siteMap,
  ROUTES.login,
  ROUTES.signup,
  ROUTES.otp,
  ROUTES.createProfile,
  `${ROUTES.createProfile}/download`,
  ROUTES.location,
  ROUTES.book,
  ROUTES.corporateRegister,
  ROUTES.corporateLogin,
  ROUTES.corporatePortal,
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.png",
  "/icon.png",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
  "/app-release-driver.apk",
  "/app-release-user.apk",
]);

export const PUBLIC_PREFIXES = [
  `${ROUTES.blogs}/`,
  `${ROUTES.safety}/`,
  "/legal/",
  "/corporate/",
] as const;

export const PROTECTED_PATHS = new Set<string>([
  ROUTES.home,
  ROUTES.start,
  ROUTES.activity,
  ROUTES.bookings,
  ROUTES.bookingDetail,
  ROUTES.notifications,
  ROUTES.wallet,
  ROUTES.walletWithdraw,
  ROUTES.profile,
  ROUTES.profileAccountSettings,
  ROUTES.profileEmergencyContact,
  ROUTES.profilePhone,
  ROUTES.profilePhoneVerify,
  ROUTES.profileEmail,
  ROUTES.profileEmailVerify,
  ROUTES.profileSavedPlaces,
  ROUTES.profileHelp,
  ROUTES.profileHelpMessages,
  ROUTES.profileAbout,
  ROUTES.profileSubscription,
  ROUTES.profileStudentPass,
  ROUTES.profileReferEarn,
  ROUTES.bookSearching,
  ROUTES.bookTracking,
  ROUTES.ambulance,
  ROUTES.ambulanceHistory,
  ROUTES.rental,
  ROUTES.rentalSelfDrive,
  "/ambulance/type",
  "/ambulance/form",
  "/ambulance/hospitals",
  "/ambulance/request",
  "/ambulance/searching",
  "/ambulance/assigned",
  "/ambulance/tracking",
]);

export const PROTECTED_PREFIXES = [
  `${ROUTES.profile}/`,
  `${ROUTES.bookings}/`,
  `${ROUTES.wallet}/`,
  `${ROUTES.ambulance}/`,
  `${ROUTES.book}/`,
  `${ROUTES.rental}/`,
] as const;

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_PATHS.has(pathname)) return true;
  // /book itself is public for guest fare browse; only nested book/* is protected.
  if (pathname === ROUTES.book) return false;
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** True when the client must have a backend access token for this path. */
export function requiresRiderAuth(pathname: string): boolean {
  if (
    pathname === ROUTES.login ||
    pathname === ROUTES.signup ||
    pathname === ROUTES.otp
  ) {
    return false;
  }
  // After OTP, create-profile still needs the access token from signup/login.
  if (
    pathname === ROUTES.createProfile ||
    pathname.startsWith(`${ROUTES.createProfile}/`)
  ) {
    return true;
  }
  if (isPublicPath(pathname)) return false;
  return isProtectedPath(pathname) || !isPublicPath(pathname);
}
