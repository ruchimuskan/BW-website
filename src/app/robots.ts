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
          "/login",
          "/signup",
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
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
