import type { Metadata } from "next";
import { SiteMapView } from "@/components/landing/SiteMapView";
import { SITE_BRAND } from "@/constants/seo";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/page-metadata";
import {
  curatedSeoSiteLinks,
  fetchSeoSiteLinks,
} from "@/lib/seo-sitelinks";

export const metadata: Metadata = pageMetadata({
  title: `Sitemap | ${SITE_BRAND}`,
  description: `Browse all public ${SITE_BRAND} pages — book a ride, download the app, safety, captains, business, blogs, and more.`,
  path: ROUTES.siteMap,
  keywords: [
    "BW Rides sitemap",
    "BW Rides pages",
    "book a ride",
    "download BW Rides",
  ],
});

export default async function SiteMapPage() {
  const links = await fetchSeoSiteLinks().catch(() => curatedSeoSiteLinks());
  return <SiteMapView links={links} />;
}
