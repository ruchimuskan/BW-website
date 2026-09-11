import type { Metadata } from "next";
import { CorporateLoginView } from "@/components/corporate/CorporateLoginView";
import { SITE_BRAND } from "@/constants/seo";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: `Company Login | ${SITE_BRAND}`,
  description:
    "Sign in to the BW Rides corporate portal to manage employee travel, approvals, and company rides.",
  path: "/corporate/login",
  keywords: [
    "BW Rides corporate login",
    "company travel portal",
    "business ride account",
  ],
});

export default function CorporateLoginPage() {
  return <CorporateLoginView />;
}
