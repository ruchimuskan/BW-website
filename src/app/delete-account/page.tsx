import type { Metadata } from "next";
import { DeleteAccountView } from "@/components/legal/DeleteAccountView";
import { getSiteUrl } from "@/constants/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: { absolute: "Delete Account | BW Rides" },
  description: "Request permanent deletion of your BW Rides account.",
  alternates: {
    canonical: `${siteUrl}/delete-account`,
  },
  openGraph: {
    title: "Delete Account | BW Rides",
    description: "Request permanent deletion of your BW Rides account.",
    url: `${siteUrl}/delete-account`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Delete Account | BW Rides",
    description: "Request permanent deletion of your BW Rides account.",
  },
};

export default function DeleteAccountPage() {
  return <DeleteAccountView />;
}
