import type { Metadata } from "next";
import { SafetyPolicyView } from "@/components/landing/SafetyPolicyView";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/page-metadata";
import type { SafetyAudience } from "@/constants/safety-content";

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

function parseTab(raw: string | undefined): SafetyAudience {
  if (raw === "customer" || raw === "captain" || raw === "all") return raw;
  return "all";
}

export default async function SafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  return <SafetyPolicyView initialTab={parseTab(raw)} />;
}
