import { SITE_LINK_PAGES } from "@/constants/seo";
import { getVehicleCategories } from "@/lib/home-api";

export type SeoSiteLink = {
  name: string;
  path: string;
  title: string;
  description: string;
  sitelinkDescription: string;
};

export function curatedSeoSiteLinks(): SeoSiteLink[] {
  return SITE_LINK_PAGES.map((page) => ({
    name: page.name,
    path: page.path,
    title: page.title,
    description: page.description,
    sitelinkDescription: page.sitelinkDescription,
  }));
}

/**
 * Public sitelink catalog for Google-style multi-page links.
 * Enriches descriptions from live vehicle categories when the API is available.
 */
export async function fetchSeoSiteLinks(): Promise<SeoSiteLink[]> {
  const base = curatedSeoSiteLinks();

  try {
    const vehicles = await getVehicleCategories("ride").catch(() => []);
    if (vehicles.length === 0) return base;

    return base.map((page) => {
      if (page.path === "/ride") {
        const names = vehicles
          .slice(0, 4)
          .map((v) => v.name)
          .filter(Boolean)
          .join(", ");
        if (names) {
          return {
            ...page,
            sitelinkDescription: `Live options include ${names}. Upfront fares and tracking.`,
          };
        }
      }
      if (page.path === "/sos") {
        return {
          ...page,
          sitelinkDescription:
            "Choose & book ambulance for free — verified medical transport with live tracking.",
        };
      }
      return page;
    });
  } catch {
    return base;
  }
}
