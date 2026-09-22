import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/constants/site";
import { fetchBlogPosts } from "@/lib/blog-api";
import {
  curatedSeoSiteLinks,
  fetchSeoSiteLinks,
} from "@/lib/seo-sitelinks";

const siteUrl = getSiteUrl();

function url(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Higher priority = more likely to be considered for sitelinks / crawl focus */
const PRIORITY: Record<string, number> = {
  "/": 1,
  "/ride": 0.98,
  "/download": 0.97,
  "/login": 0.96,
  "/signup": 0.96,
  "/captains": 0.95,
  "/about": 0.94,
  "/sos": 0.93,
  "/safety": 0.92,
  "/corporate/register": 0.9,
  "/blogs": 0.85,
  "/site-map": 0.6,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const liveLinks = await fetchSeoSiteLinks().catch(() => curatedSeoSiteLinks());

  const staticRoutes = [
    "/",
    ...liveLinks.map((p) => p.path),
    "/site-map",
    "/corporate/login",
    "/legal/privacy",
    "/legal/terms",
  ];

  const uniqueRoutes = [...new Set(staticRoutes)];
  const liveBlogs = await fetchBlogPosts().catch(() => []);
  const blogRoutes = liveBlogs.map((post) => `/blogs/${post.slug}`);

  return [...uniqueRoutes, ...blogRoutes].map((path) => ({
    url: url(path),
    lastModified: now,
    changeFrequency: path.startsWith("/blogs/")
      ? "monthly"
      : path === "/" ||
          path === "/ride" ||
          path === "/download" ||
          path === "/login" ||
          path === "/signup"
        ? "daily"
        : "weekly",
    priority: PRIORITY[path] ?? (path.startsWith("/blogs/") ? 0.55 : 0.7),
  }));
}
