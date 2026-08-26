import { Suspense } from "react";
import { RideTrackingView } from "@/components/booking";

function TrackingFallback() {
  return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbe8] text-[#5a6330]">
      Loading tracking…
    </div>
  );
}

export default function RideTrackingPage() {
  return (
    <Suspense fallback={<TrackingFallback />}>
      <RideTrackingView />
    </Suspense>
  );
}
