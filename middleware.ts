import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  PROFILE_COMPLETE_COOKIE,
  RETURNING_VISITOR_COOKIE,
} from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { isProductionEnv } from "@/lib/app-env";
import { isProtectedPath, isPublicPath } from "@/lib/route-access";

/**
 * Edge gate: auth cookie flag + profile-complete cookie.
 * Real JWT lives in sessionStorage — AuthSessionGuard clears stale cookies
 * and redirects when the backend token is missing.
 * Static images, uploads, and media proxies must never be gated.
 */

const IMAGE_EXT =
  /\.(?:svg|png|jpe?g|gif|webp|avif|ico|txt|xml|webmanifest|apk|woff2?|ttf|otf|mp4|webm|css|js|map)$/i;

function isStaticAssetPath(pathname: string): boolean {
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/gallery/") ||
    pathname.startsWith("/landing/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/services/") ||
    pathname.startsWith("/chat/") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname.startsWith("/favicon")
  ) {
    return true;
  }
  return IMAGE_EXT.test(pathname);
}

function isCacheableMediaPath(pathname: string): boolean {
  return (
    pathname.startsWith("/images/") ||
    pathname.startsWith("/gallery/") ||
    pathname.startsWith("/landing/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/services/") ||
    IMAGE_EXT.test(pathname)
  );
}

function passthrough(pathname: string) {
  const response = NextResponse.next();
  if (isCacheableMediaPath(pathname)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
  }
  return response;
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
    return passthrough(pathname);
  }

  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";
  const profileComplete = request.cookies.get(PROFILE_COMPLETE_COOKIE)?.value === "1";
  const isReturningVisitor =
    request.cookies.get(RETURNING_VISITOR_COOKIE)?.value === "1";

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

    if (
      !isReturningVisitor &&
      (pathname === ROUTES.signup || pathname === ROUTES.login || pathname === ROUTES.otp)
    ) {
      return markReturningVisitor(NextResponse.next());
    }

    return NextResponse.next();
  }

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
    "/((?!_next/static|_next/image|_next/data|images|gallery|landing|uploads|api|fonts|brand|icons|media|assets|static|services|chat|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|opengraph-image|twitter-image|icon|apple-icon|apple-touch-icon|.*\\.(?:svg|png|jpe?g|gif|webp|avif|ico|txt|xml|webmanifest|apk|woff2?|ttf|otf|mp4|webm|css|js|map)$).*)",
  ],
};
