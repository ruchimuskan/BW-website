import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/constants/site";

const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
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
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/images/", "/gallery/", "/landing/", "/uploads/", "/brand/", "/icons/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
