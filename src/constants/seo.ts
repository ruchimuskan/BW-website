import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { getSiteUrl } from "@/constants/site";

/** Primary brand name used in titles, schema, and search snippets. */
export const SITE_BRAND = "BW Rides";

export const SITE_BRAND_ALTERNATES = [
  "Bull Wave Rides",
  "Bullwave Rides",
  "BW Ride",
  "Bull Wave",
] as const;

/**
 * Homepage / brand-search snippet — short brand + clear benefits (helps SERP + sitelinks).
 */
export const DEFAULT_SITE_DESCRIPTION =
  "Book BW Rides online — bike, auto, cab, parcel, and book ambulance for free. Live tracking, verified captains, and safer travel anytime across India.";

/** Official profiles / store pages for Organization.sameAs (helps knowledge panel trust). */
export function organizationSameAs(): string[] {
  const links = [
    APP_DOWNLOAD.androidPlayStoreUrl,
    APP_DOWNLOAD.captainAndroidPlayStoreUrl,
    APP_DOWNLOAD.iosAppStoreUrl,
    APP_DOWNLOAD.captainIosAppStoreUrl,
  ];
  return [...new Set(links.map((url) => url.trim()).filter(Boolean))];
}

/**
 * High-value public pages Google can surface as sitelinks (GitHub-style).
 * Keep crawlable via real <a href>, sitemap, footer, and homepage sitelinks section.
 */
export const SITE_LINK_PAGES = [
  {
    name: "Book a Ride",
    path: ROUTES.ride,
    title: "Book a Ride | Bike, Auto & Cab — BW Rides",
    description:
      "Book a ride anytime — bike taxi, auto, or cab with upfront fares, live tracking, and verified captains across India.",
    sitelinkDescription:
      "Bike, auto, or cab with upfront fares. Live tracking from pickup to drop.",
  },
  {
    name: "Download App",
    path: ROUTES.download,
    title: "Download BW Rides App | Android & iOS",
    description:
      "Download BW Rides for Android and iOS — book rides, send parcels, and book ambulance for free in one app.",
    sitelinkDescription:
      "Get the app for Android and iOS. Book rides, parcels, and ambulance in one place.",
  },
  {
    name: "Sign in",
    path: ROUTES.login,
    title: "Sign in | BW Rides",
    description:
      "Sign in to BW Rides to book rides, track trips, manage your wallet, and book ambulance for free.",
    sitelinkDescription:
      "Access your BW Rides account to book and manage trips.",
  },
  {
    name: "Sign up",
    path: ROUTES.signup,
    title: "Sign up | BW Rides",
    description:
      "Create your BW Rides account in minutes — book bike, auto, cab, parcels, and ambulance for free.",
    sitelinkDescription:
      "Create an account to start booking rides across India.",
  },
  {
    name: "Drive with BW Rides",
    path: ROUTES.captains,
    title: "Drive with BW Rides | Become a Captain",
    description:
      "Partner as a BW Rides captain — flexible hours, transparent payouts, safety tools, and 24×7 support. Sign up to earn on your terms.",
    sitelinkDescription:
      "Flexible hours and transparent payouts. Sign up to drive and earn.",
  },
  {
    name: "Business",
    path: ROUTES.corporateRegister,
    title: "BW Rides for Business | Corporate Travel",
    description:
      "Corporate employee travel billed to one company account — admin controls, trip visibility, and consolidated invoicing after approval.",
    sitelinkDescription:
      "Employee travel billed to your company with clear reporting.",
  },
  {
    name: "Book ambulance for free",
    path: ROUTES.sos,
    title: "Book Ambulance for Free | BW Rides",
    description:
      "Choose and book ambulance for free with BW Rides — verified medical transport, live tracking, and 24×7 emergency support.",
    sitelinkDescription:
      "Verified medical transport with live tracking and 24×7 support.",
  },
  {
    name: "Safety",
    path: ROUTES.safety,
    title: "Safety | BW Rides",
    description:
      "Safety tools for riders and captains — verified profiles, live tracking, trip share, SOS assistance, and 24×7 support on every trip.",
    sitelinkDescription:
      "Verified captains, live tracking, trip share, and SOS on every journey.",
  },
  {
    name: "About Us",
    path: ROUTES.about,
    title: "About Us | BW Rides",
    description:
      "We're building calm, confident mobility for India — premium rides, parcels, and book ambulance for free for millions of riders and captains.",
    sitelinkDescription:
      "Premium rides, parcels, and emergency care built for modern India.",
  },
  {
    name: "Blogs",
    path: ROUTES.blogs,
    title: "Blog | BW Rides",
    description:
      "Company news, product updates, safety guides, and captain stories from BW Rides.",
    sitelinkDescription:
      "Product updates, safety guides, and stories from across BW Rides.",
  },
] as const;

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
