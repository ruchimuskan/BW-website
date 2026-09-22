import { Suspense } from "react";
import { CreateProfileView } from "@/components/auth/CreateProfileView";
import { SITE_BRAND } from "@/constants/seo";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  title: `Complete your profile | ${SITE_BRAND}`,
  description: `Finish your ${SITE_BRAND} account with a verified name and email from your rider profile.`,
  path: "/create-profile",
  noIndex: true,
});

function CreateProfileFallback() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-background text-muted-foreground">
      Loading…
    </div>
  );
}

export default function CreateProfilePage() {
  return (
    <Suspense fallback={<CreateProfileFallback />}>
      <CreateProfileView />
    </Suspense>
  );
}
