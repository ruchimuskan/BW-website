import { Suspense } from "react";
import { ActivityView } from "@/components/activity";

function BookingsFallback() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center text-sm text-[#4a5228]">
      Loading bookings…
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsFallback />}>
      <ActivityView />
    </Suspense>
  );
}
