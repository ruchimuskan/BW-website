import type { Metadata } from "next";
import { SosView } from "@/components/landing/SosView";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { pageMetadata } from "@/lib/page-metadata";

const page = SITE_LINK_PAGES.find((p) => p.path === "/sos")!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
});

export default function SosPage() {
  return <SosView />;
}
