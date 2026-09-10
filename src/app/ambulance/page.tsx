"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ambulance,
  Clock,
  HeartPulse,
  Loader2,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { AMBULANCE_PAGE_BG, AMBULANCE_CTA } from "@/lib/ambulance-theme";
import { getAmbulanceVehicleTypes, type VehicleCategory } from "@/lib/home-api";
import {
  displayVehicleName,
  vehicleImageForCategory,
} from "@/lib/vehicle-map";
import { SettingsHeader } from "@/components/layout/SettingsHeader";
import { cn } from "@/lib/utils";

export default function AmbulanceLandingPage() {
  const router = useRouter();
  const [types, setTypes] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getAmbulanceVehicleTypes()
      .then((categories) => {
        if (cancelled) return;
        setTypes(categories);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load ambulance types");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startBooking = (category?: VehicleCategory) => {
    const params = new URLSearchParams({
      tab: "ambulance",
      vehicle: "ambulance",
    });
    if (category?.id) params.set("category", category.id);
    router.push(`${ROUTES.start}?${params.toString()}`);
  };

  return (
    <div className={cn("flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip pb-10", AMBULANCE_PAGE_BG)}>
      <SettingsHeader title="Emergency services" backHref={ROUTES.home} />

      <div className="mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6">
        <section className="mb-6 overflow-hidden rounded-3xl border border-[#ffd8cc] bg-gradient-to-br from-[#fff6f4] via-white to-[#fff0ee] p-6 shadow-[0_20px_48px_-28px_rgba(180,50,40,0.28)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0ee] text-destructive">
            <Ambulance className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#4a1f1f] sm:text-2xl">
            Emergency ambulance
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#7a4545]">
            Book verified medical transport with live tracking. Types and prices
            come from BW Rides — no estimated dummy fares.
          </p>
          <button
            type="button"
            onClick={() => startBooking()}
            className={cn("mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl", AMBULANCE_CTA)}
          >
            <Ambulance className="h-5 w-5" />
            Book ambulance for free
          </button>
          <button
            type="button"
            onClick={() => router.push(ROUTES.ambulanceHistory)}
            className="mt-2 h-11 w-full rounded-2xl text-sm font-semibold text-[#4a1f1f] hover:bg-[#fff0ee]"
          >
            View emergency history
          </button>
        </section>

        <h3 className="mb-3 font-heading text-lg font-bold text-[#4a1f1f]">
          Available ambulance types
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-destructive" />
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-destructive/20 bg-[#fff6f4] px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : types.length === 0 ? (
          <p className="rounded-2xl border border-[#ffd4cc] bg-white px-4 py-6 text-center text-sm text-[#7a4545]">
            No ambulance vehicles are configured yet. You can still request
            emergency transport and we will match what is available.
          </p>
        ) : (
          <div className="space-y-3">
            {types.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => startBooking(type)}
                className="flex w-full items-center gap-4 rounded-2xl border border-[#ffd4cc] bg-white p-4 text-left shadow-sm transition hover:border-[#c45c5c]/40 hover:bg-[#fff8f5]"
              >
                {/* Dynamic vehicle assets from API — host varies. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vehicleImageForCategory(type)}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold text-[#4a1f1f]">
                    {displayVehicleName(type.name, type.slug)}
                  </p>
                  {type.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-[#7a4545]">
                      {type.description}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#4a1f1f]">
                  from ₹{Math.round(type.base_fare)}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          {[
            { icon: Clock, label: "24/7 availability" },
            { icon: MapPin, label: "Live GPS tracking" },
            { icon: ShieldCheck, label: "Verified captains" },
            { icon: HeartPulse, label: "Medical transport" },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-[#ffd4cc] bg-white p-4",
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0ee] text-destructive">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-[#4a1f1f]">{item.label}</span>
            </div>
          ))}
        </div>

        <a
          href="tel:112"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-destructive"
        >
          <PhoneCall className="h-4 w-4" />
          In immediate danger, call 112
        </a>
      </div>
    </div>
  );
}
