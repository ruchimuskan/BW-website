"use client";

import { HelpLegalDocument } from "@/components/profile/help/HelpRemoteContent";
import { InfoPageLayout } from "@/components/layout";

export default function TermsPage() {
  return (
    <InfoPageLayout title="Terms of Service">
      <div className="mx-auto w-full max-w-3xl">
        <HelpLegalDocument source="terms" />
      </div>
    </InfoPageLayout>
  );
}
