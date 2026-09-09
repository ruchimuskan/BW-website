import type { Metadata } from "next";
import { CorporatePortalView } from "@/components/corporate/CorporatePortalView";

export const metadata: Metadata = {
  title: { absolute: "Company Portal | BW Rides" },
  description: "Manage corporate employees for BW Rides for Business.",
};

export default function CorporatePortalPage() {
  return <CorporatePortalView />;
}
