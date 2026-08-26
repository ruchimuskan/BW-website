"use client";

import { HelpLegalDocument } from "@/components/profile/help/HelpRemoteContent";
import { InfoPageLayout } from "@/components/layout";

export function PrivacyPolicyView() {
  return (
    <InfoPageLayout title="Privacy Policy">
      <div className="mx-auto w-full max-w-3xl">
        <HelpLegalDocument source="privacy" />
      </div>
    </InfoPageLayout>
  );
}
