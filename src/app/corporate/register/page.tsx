import type { Metadata } from "next";
import { CorporateRegisterView } from "@/components/corporate/CorporateRegisterView";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { pageMetadata } from "@/lib/page-metadata";

const page = SITE_LINK_PAGES.find((p) => p.path === "/corporate/register")!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
});

export default function CorporateRegisterPage() {
  return <CorporateRegisterView />;
}
