"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { getActiveRide, isEmergencyRide } from "@/lib/ride-api";
import { buildTrackingUrl } from "@/lib/ride-booking";

/** Open live tracking for the current emergency ride, or start a new booking. */
export default function AmbulanceLiveRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    void getActiveRide()
      .then((ride) => {
        if (cancelled) return;
        if (ride && isEmergencyRide(ride)) {
          router.replace(
            buildTrackingUrl(
              ride.pickup_address || "",
              ride.dropoff_address || "",
              "ambulance",
              "ambulance",
              ride.id,
            ),
          );
          return;
        }
        router.replace(ROUTES.ambulanceBook);
      })
      .catch(() => {
        if (!cancelled) router.replace(ROUTES.ambulanceBook);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <Loader2 className="h-7 w-7 animate-spin text-destructive" />
    </div>
  );
}
