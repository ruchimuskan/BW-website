"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, MapPin, ShieldCheck, Zap } from "lucide-react";
import { AuthServiceImage } from "@/components/auth/AuthServiceImage";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import { SITE_BRAND } from "@/constants/seo";
import { getVehicleCategories, type VehicleCategory } from "@/lib/home-api";
import {
  displayVehicleName,
  isListedRideCategory,
  uniqueVehicleCategories,
  vehicleImageForSlug,
} from "@/lib/vehicle-map";
import { staggerContainerVariants, staggerItemVariants, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ServiceCard {
  title: string;
  description: string;
  image: string;
  variant: "default" | "ambulance";
}

/** Correct art per type — never reassign uniqueness (that caused Bike/Auto mismatches). */
function authImageForCategory(category: VehicleCategory): string {
  const key = `${category.slug || ""} ${category.name || ""}`.toLowerCase();
  if (key.includes("ambulance") || key.includes("emergency")) {
    return BRAND_PHOTOS.ambulance;
  }
  if (key.includes("parcel") || key.includes("delivery")) {
    return BRAND_PHOTOS.parcelDelivery;
  }
  if (key.includes("bike")) return BRAND_PHOTOS.studioBike;
  if (key.includes("rickshaw") || key.includes("e-rick")) {
    return BRAND_PHOTOS.eAuto;
  }
  if (
    key.includes("electric-auto") ||
    key.includes("e-auto") ||
    /\bauto\b/.test(key)
  ) {
    return "/images/services/auto.png";
  }
  if (
    key.includes("cab") ||
    key.includes("car") ||
    key.includes("economy") ||
    key.includes("comfort") ||
    key.includes("sedan")
  ) {
    return BRAND_PHOTOS.studioCab;
  }
  return vehicleImageForSlug(category.slug || category.name || "");
}

function categoryPriority(category: VehicleCategory): number {
  const key = `${category.slug || ""} ${category.name || ""}`.toLowerCase();
  if (key.includes("bike")) return 0;
  if (/\bauto\b/.test(key) && !key.includes("rickshaw")) return 1;
  if (key.includes("cab") || key.includes("economy") || key.includes("car")) {
    return 2;
  }
  if (key.includes("parcel") || key.includes("delivery")) return 3;
  if (key.includes("ambulance")) return 4;
  if (key.includes("rickshaw")) return 5;
  return 10;
}

function toServiceCards(categories: VehicleCategory[]): ServiceCard[] {
  const unique = uniqueVehicleCategories(categories)
    .filter(isListedRideCategory)
    .sort((a, b) => categoryPriority(a) - categoryPriority(b));

  return unique.slice(0, 4).map((category) => {
    const title = displayVehicleName(category.name, category.slug);
    const key = `${category.slug} ${category.name}`.toLowerCase();
    const isAmbulance =
      key.includes("ambulance") || key.includes("emergency");
    return {
      title,
      description:
        category.description?.trim() ||
        (isAmbulance
          ? "24/7 emergency assistance"
          : `From ₹${Math.round(category.base_fare)} · live tracking`),
      image: authImageForCategory(category),
      variant: isAmbulance ? "ambulance" : "default",
    };
  });
}

const trustPoints = [
  { icon: ShieldCheck, label: "Verified captains" },
  { icon: MapPin, label: "Live tracking" },
  { icon: Zap, label: "Instant booking" },
] as const;

interface LoginServicesPanelProps {
  className?: string;
  /** Compact layout for single-viewport auth pages. */
  compact?: boolean;
}

export function LoginServicesPanel({
  className,
  compact = false,
}: LoginServicesPanelProps) {
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getVehicleCategories("ride")
      .then((categories) => {
        if (cancelled) return;
        setServices(toServiceCards(categories));
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setServices([]);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load services from server",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={transitions.reveal}
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/10 shadow-[0_28px_64px_-36px_rgba(8,12,8,0.65)]",
        className,
      )}
    >
      <Image
        src={BRAND_PHOTOS.streetCab}
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 0px, 52vw"
        className="object-cover object-[center_35%]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0b100b]/92 via-[#121812]/78 to-[#0b100b]/88"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_15%,rgba(198,227,26,0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#080c08] to-transparent"
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 flex-col justify-between",
          compact ? "p-5 xl:p-7" : "p-6 lg:p-8",
        )}
      >
        <div className={cn("shrink-0", compact ? "mb-4" : "mb-6")}>
          <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
            <WaveGoLogo size="sm" className="!h-7 !w-7" />
            <span className="font-heading text-xs font-bold tracking-wide text-white sm:text-sm">
              {SITE_BRAND}
            </span>
          </div>

          <h2
            className={cn(
              "font-heading font-bold leading-[1.05] tracking-tight text-white",
              compact
                ? "text-[1.65rem] xl:text-[2rem]"
                : "text-[2rem] sm:text-[2.35rem] lg:text-[2.6rem]",
            )}
          >
            Move the city
            <span className="mt-1 block bg-gradient-to-r from-[#C6E31A] via-[#D4F04A] to-[#9BB820] bg-clip-text text-transparent">
              your way.
            </span>
          </h2>
          <p
            className={cn(
              "max-w-sm text-white/70",
              compact
                ? "mt-2 text-xs leading-relaxed xl:text-[13px]"
                : "mt-3 text-[15px] leading-relaxed sm:text-base",
            )}
          >
            Rides, parcels, and emergency support — booked in seconds, tracked
            live.
          </p>

          <ul
            className={cn(
              "flex flex-wrap gap-1.5",
              compact ? "mt-3" : "mt-5 gap-2",
            )}
          >
            {trustPoints.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-white/85 backdrop-blur-sm sm:text-[11px]"
              >
                <Icon
                  className="h-3 w-3 text-[#C6E31A]"
                  strokeWidth={2.25}
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-3 py-4 text-xs text-white/70 backdrop-blur-md">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C6E31A]" />
            Loading services…
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-red-400/30 bg-red-950/40 px-3 py-2 text-xs text-red-200 backdrop-blur-md">
            {error}
          </p>
        ) : (
          <motion.ul
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "min-h-0",
              compact
                ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
                : "flex flex-col gap-2.5",
            )}
          >
            {services.map((service) => (
              <motion.li
                key={service.title}
                variants={staggerItemVariants}
                whileHover={{ y: -2, transition: transitions.fast }}
                className={cn(
                  "group relative flex items-center overflow-hidden border border-white/12 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-colors hover:border-[#C6E31A]/35 hover:bg-white/[0.12]",
                  compact
                    ? "gap-2.5 rounded-2xl px-2.5 py-2"
                    : "gap-3 rounded-[20px] px-3.5 py-3 sm:gap-3.5 sm:px-4 sm:py-3.5",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-2 left-0 w-0.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100",
                    service.variant === "ambulance"
                      ? "bg-red-400"
                      : "bg-[#C6E31A]",
                  )}
                  aria-hidden
                />
                <AuthServiceImage
                  src={service.image}
                  alt={service.title}
                  variant={service.variant}
                  size={compact ? "sm" : "md"}
                  tone="dark"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-heading font-bold leading-tight text-white",
                      compact ? "text-[13px]" : "text-[15px] sm:text-base",
                    )}
                  >
                    {service.title}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 leading-snug text-white/60",
                      compact
                        ? "line-clamp-1 text-[11px]"
                        : "text-xs sm:text-[13px]",
                    )}
                  >
                    {service.description}
                  </p>
                </div>
              </motion.li>
            ))}
            {services.length === 0 ? (
              <li className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 text-center text-xs text-white/60 sm:col-span-2">
                No services returned from the server yet.
              </li>
            ) : null}
          </motion.ul>
        )}
      </div>
    </motion.div>
  );
}
