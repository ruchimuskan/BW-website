import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  PROFILE_COMPLETE_COOKIE,
  RETURNING_VISITOR_COOKIE,
} from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { isProductionEnv } from "@/lib/app-env";

/**
 * Full route access map for the user panel.
 * Public = no rider login required. Protected = auth cookie + profile complete.
 * Corporate routes use their own session in the UI; they stay public at the edge.
 * Do not change API/data contracts here — access gating only.
 */

/** Exact paths anyone can open without rider login. */
const PUBLIC_PATHS = new Set<string>([
  // Marketing
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
  // Auth / onboarding
  ROUTES.login,
  ROUTES.signup,
  ROUTES.otp,
  ROUTES.createProfile,
  `${ROUTES.createProfile}/download`,
  // Guest fare browse (login only when booking)
  ROUTES.location,
  ROUTES.book,
  // Corporate / Business (separate company auth in the client)
  ROUTES.corporateRegister,
  ROUTES.corporateLogin,
  ROUTES.corporatePortal,
  // Site metadata / icons
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

/** Nested public sections. */
const PUBLIC_PREFIXES = [
  `${ROUTES.blogs}/`,
  `${ROUTES.safety}/`,
  "/legal/",
  "/corporate/",
] as const;

/**
 * Exact protected app routes (rider must be logged in).
 * Listed explicitly so every screen has a defined access rule.
 */
const PROTECTED_PATHS = new Set<string>([
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
  // Ambulance flow screens
  "/ambulance/type",
  "/ambulance/form",
  "/ambulance/hospitals",
  "/ambulance/request",
  "/ambulance/searching",
  "/ambulance/assigned",
  "/ambulance/tracking",
]);

/** Nested protected sections (profile help articles, etc.). */
const PROTECTED_PREFIXES = [
  `${ROUTES.profile}/`,
  `${ROUTES.bookings}/`,
  `${ROUTES.wallet}/`,
  `${ROUTES.ambulance}/`,
  `${ROUTES.book}/`,
  `${ROUTES.rental}/`,
] as const;

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedPath(pathname: string) {
  if (PROTECTED_PATHS.has(pathname)) return true;
  // /book itself is public for guest fare browse; only nested book/* is protected.
  if (pathname === ROUTES.book) return false;
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Static files must never hit auth redirects (images, fonts, Next internals). */
function isStaticAssetPath(pathname: string): boolean {
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/gallery/") ||
    pathname.startsWith("/landing/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/fonts/")
  ) {
    return true;
  }
  return /\.(?:svg|png|jpe?g|gif|webp|avif|ico|txt|xml|webmanifest|apk|woff2?|ttf|otf|mp4|webm)$/i.test(
    pathname,
  );
}

function postAuthDestination(request: NextRequest, profileComplete: boolean) {
  return new URL(profileComplete ? ROUTES.home : ROUTES.createProfile, request.url);
}

function markReturningVisitor(response: NextResponse) {
  response.cookies.set(RETURNING_VISITOR_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

/** Keep post-login return URLs same-origin relative only. */
function safeReturnPath(pathname: string, search: string): string {
  const raw = `${pathname}${search}`;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return ROUTES.home;
  }
  return raw;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAssetPath(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";
  const profileComplete = request.cookies.get(PROFILE_COMPLETE_COOKIE)?.value === "1";
  const isReturningVisitor =
    request.cookies.get(RETURNING_VISITOR_COOKIE)?.value === "1";

  // Production: always show landing. Staging/dev: first visit can funnel to signup.
  if (pathname === ROUTES.landing && !isAuthenticated && !isReturningVisitor) {
    if (isProductionEnv()) {
      return markReturningVisitor(NextResponse.next());
    }
    const signupUrl = new URL(ROUTES.signup, request.url);
    return markReturningVisitor(NextResponse.redirect(signupUrl));
  }

  if (isPublicPath(pathname)) {
    if (
      isAuthenticated &&
      (pathname === ROUTES.login || pathname === ROUTES.signup || pathname === ROUTES.otp)
    ) {
      return NextResponse.redirect(postAuthDestination(request, profileComplete));
    }
    if (isAuthenticated && pathname === ROUTES.createProfile && profileComplete) {
      return NextResponse.redirect(new URL(ROUTES.home, request.url));
    }

    // Visiting auth pages also marks the visitor as returning.
    if (
      !isReturningVisitor &&
      (pathname === ROUTES.signup || pathname === ROUTES.login || pathname === ROUTES.otp)
    ) {
      return markReturningVisitor(NextResponse.next());
    }

    return NextResponse.next();
  }

  // Known protected routes + any other non-public app path require login.
  const needsAuth = isProtectedPath(pathname) || !isPublicPath(pathname);
  if (needsAuth && !isAuthenticated) {
    const authUrl = new URL(
      isReturningVisitor ? ROUTES.login : ROUTES.signup,
      request.url,
    );
    const returnTo = safeReturnPath(pathname, request.nextUrl.search);
    authUrl.searchParams.set("redirect", returnTo);
    authUrl.searchParams.set("next", returnTo);
    const response = NextResponse.redirect(authUrl);
    if (!isReturningVisitor) markReturningVisitor(response);
    return response;
  }

  if (needsAuth && !profileComplete && pathname !== ROUTES.createProfile) {
    return NextResponse.redirect(new URL(ROUTES.createProfile, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * App routes only — skip Next internals, /images, /uploads, /api, and
     * any path with a static file extension (see isStaticAssetPath too).
     */
    "/((?!_next|images|gallery|landing|uploads|api|fonts|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|opengraph-image|twitter-image|icon|apple-icon|.*\\.(?:svg|png|jpe?g|gif|webp|avif|ico|txt|xml|webmanifest|apk|woff2?|ttf|otf|mp4|webm)$).*)",
  ],
};
