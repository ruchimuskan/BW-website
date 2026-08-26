"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  ChevronRight,
  Clock3,
  Crown,
  Accessibility,
  Headset,
  List,
  Loader2,
  Mail,
  MapPinned,
  Search,
  ShieldCheck,
  Siren,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { helpTopics, supportTrips, type HelpTopic } from "@/data/mock/support";
import { ROUTES } from "@/constants/routes";
import { helpSectionPath } from "@/lib/help-routes";
import { helpShell } from "@/lib/help-shell";
import { getRideHistory, type Ride } from "@/lib/ride-api";
import { formatFare } from "@/lib/ride-booking";
import { displayVehicleName, vehicleImageForSlug } from "@/lib/vehicle-map";
import { ServiceImage } from "@/components/home/ServiceImage";
import { cn } from "@/lib/utils";

type HelpTripRow = {
  id: string;
  title: string;
  address: string;
  date: string;
  status: string;
  price: string;
  href: string;
  imageSrc: string;
};

const topicMeta: Record<string, { icon: LucideIcon; blurb: string }> = {
  safety: { icon: ShieldCheck, blurb: "SOS, trip share, and emergency tools" },
  trip: { icon: Car, blurb: "Fares, cancellations, and trip issues" },
  account: { icon: List, blurb: "Profile, login, and payment settings" },
  membership: { icon: Crown, blurb: "Plans, benefits, and ride passes" },
  accessibility: { icon: Accessibility, blurb: "Support for every rider" },
  grievance: { icon: Headset, blurb: "Escalate a concern to our team" },
  guides: { icon: Smartphone, blurb: "How-to guides for the app" },
  transit: { icon: MapPinned, blurb: "Bus, metro, and train help" },
  cancellation: { icon: Clock3, blurb: "Fees, windows, and refunds" },
  map: { icon: MapPinned, blurb: "Location, GPS, and routing" },
  passes: { icon: Crown, blurb: "Ride passes and credits" },
};

function topicIcon(topic: HelpTopic): LucideIcon {
  return topicMeta[topic.id]?.icon ?? List;
}

function formatTripDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatTripStatus(status: string) {
  const key = status.trim().toUpperCase();
  if (key.includes("CANCEL")) return "Canceled";
  if (key.includes("COMPLETE") || key === "DONE" || key === "ENDED") {
    return "Completed";
  }
  if (key.includes("ACTIVE") || key.includes("ONGOING") || key.includes("START")) {
    return "In progress";
  }
  return status
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isCanceledStatus(status: string) {
  return status.toUpperCase().includes("CANCEL");
}

function tripHelpHref(rideId?: string, rideCode?: string | null) {
  const params = new URLSearchParams();
  if (rideId) params.set("rideId", rideId);
  if (rideCode) params.set("rideCode", rideCode);
  const qs = params.toString();
  return qs ? `${helpSectionPath("trip")}?${qs}` : helpSectionPath("trip");
}

function mapRideToRow(ride: Ride): HelpTripRow {
  const fare = ride.fare_final ?? ride.fare_estimate ?? 0;
  const title = displayVehicleName(ride.vehicle_type_name);
  const hint = `${ride.vehicle_type_name ?? ""} ${ride.ride_type ?? ""} ${ride.booking_purpose ?? ""}`;
  return {
    id: ride.id,
    title,
    address:
      ride.pickup_address?.trim() ||
      ride.dropoff_address?.trim() ||
      "Trip location",
    date: formatTripDate(ride.created_at),
    status: formatTripStatus(ride.status),
    price: formatFare(fare),
    href: tripHelpHref(ride.id, ride.public_id),
    imageSrc: vehicleImageForSlug(hint || title),
  };
}

function mapMockToRow(trip: (typeof supportTrips)[number]): HelpTripRow {
  return {
    id: `mock-${trip.id}`,
    title: trip.service,
    address: trip.address,
    date: trip.date,
    status: trip.status,
    price: trip.price,
    href: tripHelpHref(`mock-${trip.id}`),
    imageSrc: vehicleImageForSlug(trip.service),
  };
}

interface HelpViewProps {
  onBack?: () => void;
}

export function HelpView({ onBack }: HelpViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentTrips, setRecentTrips] = useState<HelpTripRow[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return helpTopics;
    return helpTopics.filter((topic) => {
      const meta = topicMeta[topic.id];
      return (
        topic.label.toLowerCase().includes(q) ||
        meta?.blurb.toLowerCase().includes(q)
      );
    });
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setTripsLoading(true);
    void getRideHistory(1, 8)
      .then((res) => {
        if (cancelled) return;
        const rows = res.items.slice(0, 5).map(mapRideToRow);
        setRecentTrips(
          rows.length > 0 ? rows : supportTrips.map(mapMockToRow),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setRecentTrips(supportTrips.map(mapMockToRow));
      })
      .finally(() => {
        if (!cancelled) setTripsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredTopics.length === 1) {
      router.push(filteredTopics[0].route);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f7fbe8] text-[#38471B]">
      <header className="sticky top-0 z-40 border-b border-[#e8f0c8] bg-white/95 backdrop-blur-xl">
        <div className="h-0.5 w-full bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-transparent" />
        <div className={helpShell("flex h-16 items-center gap-3 sm:h-[4.25rem] sm:gap-4")}>
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8f0c8] bg-white text-[#38471B] transition-colors hover:border-[#B8D926]/50 hover:bg-[#f7fbe8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D926]/40"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <WaveGoLogo size="sm" className="h-10 w-10 sm:h-11 sm:w-11" />
          <p className="ml-auto hidden text-xs font-semibold tracking-[0.16em] text-[#5a6330] uppercase sm:block">
            Help Center
          </p>
        </div>
      </header>

      {/* Compact hero */}
      <section className="relative overflow-hidden bg-[#38471B]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_0%_0%,rgba(200,232,74,0.18),transparent_55%),radial-gradient(ellipse_50%_60%_at_100%_100%,rgba(184,217,38,0.12),transparent_50%)]"
        />
        <div className={helpShell("relative pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-[4.5rem] lg:pt-14")}>
          <p className="text-[10px] font-semibold tracking-[0.24em] text-[#C8E84A] uppercase sm:text-[11px]">
            Rider support
          </p>
          <h1 className="mt-3 max-w-2xl font-heading text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.4rem]">
            How can we help you today?
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-[15px]">
            Search articles, browse topics, or get help with a recent trip.
          </p>
        </div>
      </section>

      {/* Search overlaps hero → content */}
      <div className={helpShell("relative z-20 -mt-8 sm:-mt-10")}>
        <form
          onSubmit={handleSearch}
          role="search"
          className="flex overflow-hidden rounded-2xl border border-[#e8f0c8] bg-white shadow-[0_18px_40px_-24px_rgba(56,71,27,0.35)] ring-1 ring-[#B8D926]/10 focus-within:ring-[#B8D926]/30"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 px-4 sm:px-5">
            <Search className="h-4 w-4 shrink-0 text-[#B8D926]" aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions, keywords, or topics"
              aria-label="Search support resources"
              className="h-12 min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-[#38471B] shadow-none placeholder:text-[#5a6330]/60 focus-visible:ring-0 sm:h-14 sm:text-[15px]"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 bg-[#B8D926] px-5 text-sm font-semibold text-[#38471B] transition-colors hover:bg-[#C8E84A] sm:px-7"
          >
            Search
          </button>
        </form>
      </div>

      <main className="relative flex-1 pb-16 pt-10 sm:pt-12">
        <div className={helpShell("space-y-12 sm:space-y-14")}>
          {/* Emergency strip */}
          <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-[#38471B]/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#38471B] text-[#C8E84A]">
                <Siren className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-sm font-semibold sm:text-base">
                  Need help in an emergency?
                </p>
                <p className="mt-0.5 text-xs text-[#5a6330] sm:text-sm">
                  Request ambulance SOS and share your trip with family.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push(ROUTES.sos)}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#38471B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4A5824]"
            >
              Open SOS
            </button>
          </div>

          {/* Topics */}
          <section>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                  Browse topics
                </h2>
                <p className="mt-1 text-sm text-[#5a6330]">
                  Choose a category to find the right article
                </p>
              </div>
              <p className="hidden text-xs font-medium text-[#5a6330] sm:block">
                {filteredTopics.length}{" "}
                {filteredTopics.length === 1 ? "topic" : "topics"}
              </p>
            </div>

            {filteredTopics.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTopics.map((topic) => {
                  const Icon = topicIcon(topic);
                  const meta = topicMeta[topic.id];
                  const isSafety = topic.id === "safety";
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => router.push(topic.route)}
                      className={cn(
                        "group flex h-full min-w-0 items-start gap-3.5 rounded-2xl border bg-white p-4 text-left transition-all sm:p-5",
                        isSafety
                          ? "border-[#B8D926]/35 shadow-[0_14px_32px_-22px_rgba(184,217,38,0.45)] hover:border-[#B8D926]/55"
                          : "border-[#e8f0c8] hover:border-[#B8D926]/40 hover:shadow-[0_16px_36px_-24px_rgba(56,71,27,0.2)]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                          isSafety
                            ? "bg-[#B8D926] text-[#38471B]"
                            : "bg-[#f7fbe8] text-[#B8D926] group-hover:bg-[#B8D926] group-hover:text-[#38471B]",
                        )}
                      >
                        <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.85} />
                      </span>
                      <span className="min-w-0 flex-1 pt-0.5">
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-heading text-[15px] font-semibold leading-snug">
                            {topic.label}
                          </span>
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#C8E84A] transition-transform group-hover:translate-x-0.5 group-hover:text-[#B8D926]" />
                        </span>
                        {meta?.blurb ? (
                          <span className="mt-1 block text-xs leading-relaxed text-[#5a6330] sm:text-[13px]">
                            {meta.blurb}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e8f0c8] bg-white px-4 py-10 text-center">
                <p className="text-sm text-[#5a6330]">
                  No topics match “{query.trim()}”.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-3 text-sm font-semibold text-[#38471B] underline-offset-2 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </section>

          {/* Recent trips */}
          <section>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                  Recent trips
                </h2>
                <p className="mt-1 text-sm text-[#5a6330]">
                  Tap a booking to get trip-specific help
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push(ROUTES.activity)}
                className="self-start text-sm font-semibold text-[#38471B] underline-offset-2 hover:underline sm:self-auto"
              >
                View all
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e8f0c8] bg-white">
              {tripsLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-[#5a6330]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#9BB820]" />
                  Loading recent trips…
                </div>
              ) : (
                recentTrips.map((trip, index) => {
                  const canceled = isCanceledStatus(trip.status);
                  return (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() => router.push(trip.href)}
                      className={cn(
                        "group flex w-full min-w-0 items-start gap-3 px-3.5 py-3.5 text-left transition-colors",
                        "hover:bg-[#f7fbe8] active:bg-[#f0f5dc]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8D926]/45",
                        "sm:items-center sm:gap-4 sm:px-5 sm:py-4",
                        index > 0 && "border-t border-[#e8f0c8]",
                      )}
                    >
                      <span className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f7fbe8] sm:mt-0 sm:h-12 sm:w-12">
                        <ServiceImage
                          src={trip.imageSrc}
                          alt={trip.title}
                          blend="multiply"
                          className="h-full w-full p-1.5"
                          imageClassName="object-contain"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="max-w-full break-words text-sm font-semibold text-[#283614]">
                            {trip.title}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              canceled
                                ? "bg-[#d66b6b]/12 text-[#c45c5c]"
                                : "bg-[#B8D926]/20 text-[#38471B]",
                            )}
                          >
                            {trip.status}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-[#5a6330] sm:line-clamp-1 sm:text-[13px]">
                          <span className="line-clamp-2 break-words sm:line-clamp-1">
                            {trip.address}
                          </span>
                          <span className="text-[#5a6330]/70"> · {trip.date}</span>
                        </span>
                        <span className="mt-1.5 block text-sm font-semibold tabular-nums text-[#283614] sm:hidden">
                          {trip.price}
                        </span>
                      </span>

                      <span className="hidden shrink-0 text-sm font-semibold tabular-nums text-[#283614] sm:inline">
                        {trip.price}
                      </span>
                      <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-[#C8E84A] transition-transform group-hover:translate-x-0.5 group-hover:text-[#9BB820] sm:mt-0" />
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Messages + contact */}
          <section className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push(ROUTES.profileHelpMessages)}
              className="group flex items-center gap-3.5 rounded-2xl border border-[#e8f0c8] bg-white p-4 text-left transition-all hover:border-[#B8D926]/40 sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7fbe8] text-[#B8D926] transition-colors group-hover:bg-[#B8D926] group-hover:text-[#38471B]">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[15px] font-semibold">
                  Support messages
                </span>
                <span className="mt-0.5 block text-xs text-[#5a6330] sm:text-[13px]">
                  Continue an open conversation
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-[#C8E84A] transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => router.push(ROUTES.safety)}
              className="group flex items-center gap-3.5 rounded-2xl border border-[#e8f0c8] bg-white p-4 text-left transition-all hover:border-[#B8D926]/40 sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7fbe8] text-[#B8D926] transition-colors group-hover:bg-[#B8D926] group-hover:text-[#38471B]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[15px] font-semibold">
                  Safety tools
                </span>
                <span className="mt-0.5 block text-xs text-[#5a6330] sm:text-[13px]">
                  Policies, trip share, and SOS
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-[#C8E84A] transition-transform group-hover:translate-x-0.5" />
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
