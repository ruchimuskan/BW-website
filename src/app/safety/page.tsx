import type { Metadata } from "next";
import { SafetyPolicyView } from "@/components/landing/SafetyPolicyView";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/page-metadata";

const page =
  SITE_LINK_PAGES.find((p) => p.path === ROUTES.safety) ??
  SITE_LINK_PAGES.find((p) => p.path === "/safety");

export const metadata: Metadata = pageMetadata({
  title: page?.title ?? "Safety | BW Rides",
  description:
    page?.description ??
    "Safety tools for riders and captains — verified profiles, live tracking, trip share, and SOS assistance.",
  path: ROUTES.safety,
});

export default function SafetyPage() {
  return <SafetyPolicyView />;
}
