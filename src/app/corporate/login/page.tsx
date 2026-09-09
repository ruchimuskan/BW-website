import type { Metadata } from "next";
import { CorporateLoginView } from "@/components/corporate/CorporateLoginView";

export const metadata: Metadata = {
  title: { absolute: "Company Login | BW Rides" },
  description: "Login to manage corporate employees and rides.",
};

export default function CorporateLoginPage() {
  return <CorporateLoginView />;
}
