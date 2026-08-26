import type { Metadata } from "next";
import { DownloadView } from "@/components/landing/DownloadView";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { pageMetadata } from "@/lib/page-metadata";

const page = SITE_LINK_PAGES.find((p) => p.path === "/download")!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  keywords: [
    "download Bull Wave Rides",
    "ride app India",
    "bike taxi app",
    "ambulance SOS app",
  ],
});

export default function DownloadPage() {
  return <DownloadView />;
}
