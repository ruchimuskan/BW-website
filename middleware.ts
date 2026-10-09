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
import {
  isCacheableMediaPath,
  isStaticAssetPath,
} from "@/lib/static-media";

/**
 * Edge gate: auth cookie flag + profile-complete cookie.
 * Images, fonts, and media always pass — never send photos through login.
 */

function passthrough(pathname: string) {
  const response = NextResponse.next();
  if (isCacheableMediaPath(pathname)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Timing-Allow-Origin", "*");
    response.headers.set("Accept-Ranges", "bytes");
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

  if (isStaticAssetPath(pathname) || isCacheableMediaPath(pathname)) {
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
    /*
     * Run on pages AND public media so photos get an explicit allow + cache
     * headers. Skip only Next internals and App Router API routes.
     */
    "/((?!_next/static|_next/data|_next/image|api/).*)",
  ],
};
