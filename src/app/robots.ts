import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/constants/site";

const siteUrl = getSiteUrl();

const PRIVATE_PATHS = [
  "/otp",
  "/start",
  "/create-profile",
  "/home",
  "/notifications",
  "/wallet",
  "/activity",
  "/book",
  "/bookings",
  "/profile",
  "/location",
  "/ambulance",
  "/rental",
  "/corporate/portal",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/images/bwride.png",
          "/opengraph-image",
          "/twitter-image",
          "/favicon.png",
          "/icon.png",
          "/apple-touch-icon.png",
          "/gallery/",
          "/landing/",
          "/uploads/",
          "/brand/",
          "/icons/",
        ],
        disallow: [
          ...PRIVATE_PATHS,
          "/images/services/",
          "/images/img-1.png",
          "/images/img-2.png",
          "/images/img-3.png",
          "/images/landing/brand/ambulance.png",
          "/images/blogs/ambulance.jpg",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/images/bwride.png",
          "/favicon.png",
          "/icon.png",
          "/icon-192.png",
          "/icon-512.png",
          "/apple-touch-icon.png",
          "/opengraph-image",
          "/twitter-image",
        ],
        disallow: [
          "/images/services/",
          "/images/img-1.png",
          "/images/img-2.png",
          "/images/img-3.png",
          "/images/landing/brand/ambulance.png",
          "/images/blogs/ambulance.jpg",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
