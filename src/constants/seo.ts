import { ROUTES } from "@/constants/routes";
import { getSiteUrl } from "@/constants/site";

/** Primary brand name used in titles, schema, and search snippets. */
export const SITE_BRAND = "BW Rides";

export const SITE_BRAND_ALTERNATES = [
  "Bullwave Rides",
  "BW Rides",
  "BW Ride",
  "Bull Wave",
] as const;

/**
 * Homepage / brand-search snippet (Uber-style: short brand + benefit hooks).
 */
export const DEFAULT_SITE_DESCRIPTION =
  "Book BW Rides online — bike, auto, cab, parcel & ambulance SOS. Live tracking, verified captains, and safer travel anytime across India. Download the app.";

/**
 * High-value public pages Google can surface as sitelinks
 * (similar to Uber / Rapido). Keep crawlable via real <a href> + sitemap + footer.
 *
 * `name` = nav / sitelink label
 * `sitelinkDescription` = short blurb like Uber’s sitelink subtitles
 */
export const SITE_LINK_PAGES = [
  {
    name: "Drive with BW Rides",
    path: ROUTES.captains,
    title: "Drive with BW Rides | Become a Captain",
    description:
      "Partner as a BW Rides captain — flexible hours, transparent payouts, safety tools, and 24×7 support. Sign up to earn on your terms.",
    sitelinkDescription:
      "Flexible hours and transparent payouts. Sign up to drive and earn on your terms.",
  },
  {
    name: "Book a Ride",
    path: ROUTES.ride,
    title: "Book a Ride | Bike, Auto & Cab — BW Rides",
    description:
      "Request a ride anytime — bike taxi, auto, or cab with upfront fares, live tracking, and verified captains across India.",
    sitelinkDescription:
      "Bike, auto, or cab with upfront fares. Live tracking from pickup to drop.",
  },
  {
    name: "Download the App",
    path: ROUTES.download,
    title: "Download BW Rides App | Android & iOS",
    description:
      "Download BW Rides for Android and iOS — book rides, send parcels, and book ambulance for free in one app.",
    sitelinkDescription:
      "Get the app for Android and iOS. Book rides, parcels, and SOS in one place.",
  },
  {
    name: "Business",
    path: ROUTES.corporateRegister,
    title: "BW Rides for Business | Corporate Travel",
    description:
      "Corporate employee travel billed to one company account — admin controls, trip visibility, and consolidated invoicing after approval.",
    sitelinkDescription:
      "Employee travel billed to your company. Admin controls and clear reporting.",
  },
  {
    name: "Emergency SOS",
    path: ROUTES.sos,
    title: "Emergency SOS Ambulance | BW Rides",
    description:
      "Book ambulance for free with BW Rides — verified medical transport, live tracking, and 24×7 emergency support when seconds matter.",
    sitelinkDescription:
      "Verified medical transport with live tracking and 24×7 emergency support.",
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
      "We're building calm, confident mobility for India — premium rides, parcels, and emergency SOS for millions of riders and captains.",
    sitelinkDescription:
      "Premium rides, parcels, and emergency SOS built for modern India.",
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
