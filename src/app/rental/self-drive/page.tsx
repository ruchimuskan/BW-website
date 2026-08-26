"use client";

import { Suspense } from "react";
import { SelfDriveLocationsView } from "@/components/rental/SelfDriveLocationsView";

export default function SelfDriveLocationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#f7fbe8] text-sm font-medium text-[#38471B]">
          <span
            aria-hidden
            className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8f0c8] border-t-[#B8D926]"
          />
          Loading locations…
        </div>
      }
    >
      <SelfDriveLocationsView />
    </Suspense>
  );
}
