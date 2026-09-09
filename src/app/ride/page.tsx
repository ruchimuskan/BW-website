import type { Metadata } from "next";
import { RideView } from "@/components/landing/RideView";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { pageMetadata } from "@/lib/page-metadata";

const page = SITE_LINK_PAGES.find((p) => p.path === "/ride")!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  keywords: [
    "book ride India",
    "bike taxi",
    "auto booking",
    "cab booking",
    "BW Rides",
  ],
});

export default function RidePage() {
  return <RideView />;
}
