import type { MetadataRoute } from "next";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { getSiteUrl } from "@/constants/site";
import { blogPosts } from "@/data/blogs";

const siteUrl = getSiteUrl();

function url(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Higher priority = more likely to be considered for sitelinks / crawl focus */
const PRIORITY: Record<string, number> = {
  "/": 1,
  "/ride": 0.98,
  "/captains": 0.97,
  "/download": 0.96,
  "/about": 0.95,
  "/safety": 0.92,
  "/sos": 0.92,
  "/corporate/register": 0.9,
  "/blogs": 0.85,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "/",
    ...SITE_LINK_PAGES.map((p) => p.path),
    "/corporate/login",
    "/legal/privacy",
    "/legal/terms",
  ];

  const uniqueRoutes = [...new Set(staticRoutes)];
  const blogRoutes = blogPosts.map((post) => `/blogs/${post.slug}`);

  return [...uniqueRoutes, ...blogRoutes].map((path) => ({
    url: url(path),
    lastModified: now,
    changeFrequency: path.startsWith("/blogs/")
      ? "monthly"
      : path === "/" ||
          path === "/ride" ||
          path === "/captains" ||
          path === "/download"
        ? "daily"
        : "weekly",
    priority: PRIORITY[path] ?? (path.startsWith("/blogs/") ? 0.55 : 0.7),
  }));
}
