"use client";

import { HelpLegalDocument } from "@/components/profile/help/HelpRemoteContent";
import { PublicLegalShell } from "@/components/legal/PublicLegalShell";
import { ROUTES } from "@/constants/routes";

export function PrivacyPolicyView() {
  return (
    <PublicLegalShell
      title="Privacy Policy"
      eyebrow="Legal · Privacy"
      description="How BW Rides collects, uses, and protects your information."
      relatedLinks={[
        { label: "Terms of Service", href: ROUTES.terms },
        { label: "Safety policy", href: ROUTES.safety },
      ]}
    >
      <HelpLegalDocument source="privacy" variant="public" />
    </PublicLegalShell>
  );
}
