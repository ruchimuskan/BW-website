"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { SettingsHeader } from "@/components/layout/SettingsHeader";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  getRideHistory,
  isEmergencyRide,
  type Ride,
} from "@/lib/ride-api";
import { buildBookingDetailUrl, formatFare } from "@/lib/ride-booking";
import { displayVehicleName } from "@/lib/vehicle-map";

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: string) {
  const upper = status.toUpperCase();
  if (upper === "COMPLETED") return "Completed";
  if (upper === "CANCELLED" || upper === "CANCELED") return "Cancelled";
  return status.replace(/_/g, " ");
}

export default function EmergencyHistoryPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getRideHistory(1, 50)
      .then((res) => {
        if (cancelled) return;
        setRides(res.items.filter(isEmergencyRide));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load emergency history");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () =>
      [...rides].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [rides],
  );

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#fff6f4] pb-12">
      <SettingsHeader title="Emergency history" backHref={ROUTES.ambulance} />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-destructive" />
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-destructive/20 bg-[#fff6f4] px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-heading text-lg font-bold text-[#4a1f1f]">
              No emergency bookings yet
            </p>
            <p className="mt-2 text-sm text-[#7a4545]">
              Ambulance trips from your account will show up here.
            </p>
            <Button
              className="mt-6 h-11 rounded-2xl bg-destructive font-semibold text-white hover:bg-destructive/90"
              onClick={() => router.push(ROUTES.ambulanceBook)}
            >
              Request ambulance
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((ride) => (
              <button
                key={ride.id}
                type="button"
                onClick={() => router.push(buildBookingDetailUrl(ride.id))}
                className="flex flex-col gap-3 rounded-[20px] border border-[#ffd4cc] bg-white p-5 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#ffd4cc] pb-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-heading text-sm font-bold text-[#4a1f1f]">
                      {ride.dropoff_address || "Emergency trip"}
                    </h3>
                    <p className="text-[10px] text-[#7a4545]">{formatWhen(ride.created_at)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#fff0ee] px-2 py-1 text-[10px] font-bold text-[#4a1f1f]">
                    {statusLabel(ride.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[#7a4545]">Booking ID</p>
                    <p className="font-mono text-xs font-bold">
                      {ride.public_id || ride.id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#7a4545]">Fare</p>
                    <p className="text-xs font-bold">
                      {ride.fare_final != null || ride.fare_estimate != null
                        ? formatFare(ride.fare_final ?? ride.fare_estimate ?? 0)
                        : "—"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-[#7a4545]">Ambulance</p>
                    <p className="text-xs font-semibold text-destructive">
                      {displayVehicleName(ride.vehicle_type_name) || "Ambulance"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-[#7a4545]">Pickup</p>
                    <p className="text-xs font-semibold">{ride.pickup_address || "—"}</p>
                  </div>
                </div>
                <span className="mt-1 flex items-center justify-center gap-2 rounded-[12px] bg-[#fff0ee] py-2.5 text-xs font-bold text-[#4a1f1f]">
                  <FileText className="h-4 w-4" /> Trip details
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
