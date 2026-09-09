"use client";

import { HelpLegalDocument } from "@/components/profile/help/HelpRemoteContent";
import { PublicLegalShell } from "@/components/legal/PublicLegalShell";
import { ROUTES } from "@/constants/routes";

export default function TermsPage() {
  return (
    <PublicLegalShell
      title="Terms of Service"
      eyebrow="Legal · Terms"
      description="The rules that apply when you use BW Rides."
      relatedLinks={[
        { label: "Privacy Policy", href: ROUTES.privacy },
        { label: "Safety policy", href: ROUTES.safety },
      ]}
    >
      <HelpLegalDocument source="terms" variant="public" />
    </PublicLegalShell>
  );
}
