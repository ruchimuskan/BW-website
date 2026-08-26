"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MapPin, ShieldCheck, Zap } from "lucide-react";
import { AuthServiceImage } from "@/components/auth/AuthServiceImage";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { SITE_BRAND } from "@/constants/seo";
import { getVehicleCategories, type VehicleCategory } from "@/lib/home-api";
import {
  displayVehicleName,
  uniqueVehicleCategories,
  vehicleImageForCategory,
} from "@/lib/vehicle-map";
import { staggerContainerVariants, staggerItemVariants, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ServiceCard {
  title: string;
  description: string;
  image: string;
  variant: "default" | "ambulance";
}

function toServiceCards(categories: VehicleCategory[]): ServiceCard[] {
  const unique = uniqueVehicleCategories(categories);
  const usedImages = new Set<string>();
  const cards: ServiceCard[] = [];

  const pick = (predicate: (c: VehicleCategory) => boolean) =>
    unique.find(
      (c) =>
        predicate(c) &&
        !cards.some((card) => card.title === displayVehicleName(c.name, c.slug)),
    );

  const ride =
    pick((c) => {
      const key = `${c.slug} ${c.name}`.toLowerCase();
      return (
        key.includes("bike") ||
        key.includes("auto") ||
        key.includes("cab") ||
        key.includes("car")
      );
    }) ?? unique[0];
  if (ride) {
    cards.push({
      title: "Ride Booking",
      description:
        ride.description?.trim() ||
        `Book ${displayVehicleName(ride.name, ride.slug)} and more instantly.`,
      image: vehicleImageForCategory(ride, usedImages),
      variant: "default",
    });
  }

  const parcel = pick((c) => {
    const key = `${c.slug} ${c.name}`.toLowerCase();
    return key.includes("parcel") || key.includes("delivery");
  });
  if (parcel) {
    cards.push({
      title: displayVehicleName(parcel.name, parcel.slug),
      description: parcel.description?.trim() || "Fast and secure package delivery.",
      image: vehicleImageForCategory(parcel, usedImages),
      variant: "default",
    });
  }

  const ambulance = pick((c) => {
    const key = `${c.slug} ${c.name}`.toLowerCase();
    return key.includes("ambulance") || key.includes("emergency");
  });
  if (ambulance) {
    cards.push({
      title: displayVehicleName(ambulance.name, ambulance.slug),
      description:
        ambulance.description?.trim() || "24/7 emergency medical assistance.",
      image: vehicleImageForCategory(ambulance, usedImages),
      variant: "ambulance",
    });
  }

  for (const category of unique) {
    if (cards.length >= 4) break;
    const title = displayVehicleName(category.name, category.slug);
    if (cards.some((card) => card.title === title)) continue;
    cards.push({
      title,
      description:
        category.description?.trim() ||
        `From ₹${Math.round(category.base_fare)} · live tracking`,
      image: vehicleImageForCategory(category, usedImages),
      variant: `${category.slug} ${category.name}`.toLowerCase().includes("ambulance")
        ? "ambulance"
        : "default",
    });
  }

  return cards.slice(0, 4);
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
          err instanceof Error ? err.message : "Unable to load services from server",
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
        "flex h-full min-h-0 flex-col justify-center",
        compact && "lg:justify-center",
        className,
      )}
    >
      <div className={cn("shrink-0", compact ? "mb-3 xl:mb-4" : "mb-5 lg:mb-6")}>
        <div
          className={cn(
            "mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#d7e5a8]/80 bg-white/70 px-2.5 py-1 shadow-sm backdrop-blur-sm",
            compact && "mb-2",
          )}
        >
          <WaveGoLogo size="sm" className="!h-7 !w-7" />
          <span className="font-heading text-xs font-bold tracking-tight text-[#38471B] sm:text-sm">
            {SITE_BRAND}
          </span>
        </div>

        <h2
          className={cn(
            "font-heading font-bold leading-[1.08] tracking-tight text-[#38471B]",
            compact
              ? "text-[1.55rem] xl:text-[1.85rem]"
              : "text-[2rem] sm:text-[2.25rem] lg:text-[2.55rem]",
          )}
        >
          One App.{" "}
          <span className="bg-gradient-to-r from-[#6B7A14] via-[#9BB820] to-[#B8D926] bg-clip-text text-transparent">
            Many Services.
          </span>
        </h2>
        <p
          className={cn(
            "max-w-md text-[#5a6330]/90",
            compact
              ? "mt-1.5 text-xs leading-snug xl:text-sm"
              : "mt-3 text-[15px] leading-relaxed sm:text-base",
          )}
        >
          Ride, send, or request — we&apos;ve got you covered across the city.
        </p>

        <ul
          className={cn(
            "flex flex-wrap gap-1.5",
            compact ? "mt-2.5" : "mt-4 gap-2",
          )}
        >
          {trustPoints.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1 rounded-full border border-[#dfe8c4] bg-white/75 px-2 py-0.5 text-[10px] font-semibold text-[#38471B]/85 shadow-sm backdrop-blur-sm sm:text-[11px]"
            >
              <Icon className="h-3 w-3 text-[#9BB820]" strokeWidth={2.25} />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-[#dfe8c4]/80 bg-white/70 px-3 py-4 text-xs text-muted-foreground shadow-sm">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          Loading services…
        </div>
      ) : error ? (
        <p className="rounded-2xl border border-destructive/20 bg-[#fff6f4] px-3 py-2 text-xs text-destructive">
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
              whileHover={{ y: -1, transition: transitions.fast }}
              className={cn(
                "group relative flex items-center overflow-hidden border border-white/90 bg-white/90 shadow-[0_8px_24px_-16px_rgba(40,54,20,0.32)] backdrop-blur-sm",
                compact
                  ? "gap-2.5 rounded-2xl px-2.5 py-2"
                  : "gap-3 rounded-[22px] px-3.5 py-3 sm:gap-3.5 sm:px-4 sm:py-3.5",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-2 left-0 w-0.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100",
                  service.variant === "ambulance" ? "bg-destructive" : "bg-[#B8D926]",
                )}
                aria-hidden
              />
              <AuthServiceImage
                src={service.image}
                alt={service.title}
                variant={service.variant}
                size={compact ? "sm" : "md"}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-heading font-bold leading-tight text-[#38471B]",
                    compact ? "text-[13px]" : "text-[15px] sm:text-base",
                  )}
                >
                  {service.title}
                </p>
                <p
                  className={cn(
                    "mt-0.5 leading-snug text-[#5a6330]/85",
                    compact ? "line-clamp-1 text-[11px]" : "text-xs sm:text-[13px]",
                  )}
                >
                  {service.description}
                </p>
              </div>
            </motion.li>
          ))}
          {services.length === 0 ? (
            <li className="rounded-2xl border border-border/60 bg-card px-4 py-4 text-center text-xs text-muted-foreground sm:col-span-2">
              No services returned from the server yet.
            </li>
          ) : null}
        </motion.ul>
      )}
    </motion.div>
  );
}
