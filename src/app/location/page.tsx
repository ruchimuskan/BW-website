import { Suspense } from "react";
import { LocationSearchView } from "@/components/location";

function LocationSearchFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-[#38471B] via-[#4A5824] to-[#B8D926] font-sans text-white/80">
      Loading map…
    </div>
  );
}

export default function LocationPage() {
  return (
    <Suspense fallback={<LocationSearchFallback />}>
      <LocationSearchView />
    </Suspense>
  );
}
