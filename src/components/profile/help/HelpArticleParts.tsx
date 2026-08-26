"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { HelpArticleLink } from "@/data/help-center";
import { helpArticlePath } from "@/lib/help-routes";
import { ROUTES } from "@/constants/routes";
import { getRideHistory, type Ride } from "@/lib/ride-api";
import { createSupportTicket } from "@/lib/support-api";
import { displayVehicleName } from "@/lib/vehicle-map";
import { formatFare } from "@/lib/ride-booking";

export function HelpTripSelector({
  submitLabel = "Next",
  showDate = false,
  topic = "Trip help",
}: {
  submitLabel?: string;
  showDate?: boolean;
  topic?: string;
}) {
  const router = useRouter();
  const [trips, setTrips] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getRideHistory(1, 12)
      .then((res) => {
        if (!cancelled) setTrips(res.items);
      })
      .catch(() => {
        if (!cancelled) setTrips([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedId) {
      setError("Select a trip first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createSupportTicket({
        subject: topic,
        message: [
          `Help topic: ${topic}`,
          `Trip ID: ${selectedId}`,
          date ? `Date noted: ${date}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        category: "trip",
        ride_id: selectedId,
      });
      router.push(ROUTES.profileHelpMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {showDate ? (
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#283614]">
            Date of your trip
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 rounded-xl border-[#d9dece] bg-white"
          />
        </div>
      ) : null}

      <p className="text-sm font-medium text-[#5a6330]">Select a trip</p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#e5e7df] bg-white px-4 py-8 text-sm text-[#5a6330]">
          <Loader2 className="h-4 w-4 animate-spin text-[#9BB820]" />
          Loading trips…
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d9dece] bg-white px-4 py-8 text-center">
          <p className="text-sm text-[#5a6330]">No trips on this account yet.</p>
          <Link
            href={ROUTES.activity}
            className="mt-3 inline-block text-sm font-semibold text-[#38471B] underline-offset-2 hover:underline"
          >
            Open bookings
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#e5e7df] overflow-hidden rounded-2xl border border-[#e5e7df] bg-white">
          {trips.map((trip) => {
            const active = selectedId === trip.id;
            const fare = trip.fare_final ?? trip.fare_estimate ?? 0;
            return (
              <button
                key={trip.id}
                type="button"
                onClick={() => setSelectedId(trip.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 px-4 py-3.5 text-left sm:flex-row sm:items-center sm:justify-between",
                  active ? "bg-[#f7fbe8]" : "hover:bg-[#fafaf7]",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#283614]">
                    {displayVehicleName(trip.vehicle_type_name)} · {trip.status}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#5a6330]">
                    {trip.pickup_address || "Trip"}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums text-[#283614]">
                  {formatFare(fare)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        disabled={submitting || trips.length === 0}
        onClick={() => void handleSubmit()}
        className="h-12 w-full rounded-xl font-semibold sm:w-auto sm:min-w-[160px]"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}

export function HelpIssueForm({
  topic,
  category = "map",
  placeLabel = "Place, road, or landmark",
}: {
  topic: string;
  category?: string;
  placeLabel?: string;
}) {
  const router = useRouter();
  const [details, setDetails] = useState("");
  const [place, setPlace] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (details.trim().length < 12) {
      setError("Please describe the issue in a bit more detail.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createSupportTicket({
        subject: topic,
        message: [
          `Help topic: ${topic}`,
          place.trim() ? `Place / road: ${place.trim()}` : null,
          details.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
        category,
      });
      router.push(ROUTES.profileHelpMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#283614]">
          {placeLabel}
        </label>
        <Input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder={
            category === "safety"
              ? "Trip ID or area (optional)"
              : "e.g. Okhla Estate Marg, New Delhi"
          }
          className="h-12 rounded-xl border-[#d9dece] bg-white"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#283614]">
          What needs to be fixed?
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          placeholder={
            category === "safety"
              ? "What happened, and when?"
              : "Closed road, wrong pin, missing street…"
          }
          className="w-full resize-y rounded-xl border border-[#d9dece] bg-white px-3 py-3 text-sm text-[#283614] outline-none focus-visible:ring-2 focus-visible:ring-[#B8D926]/40"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-xl font-semibold sm:w-auto sm:min-w-[180px]"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Submit report"
        )}
      </Button>
    </form>
  );
}

export function HelpToggleList({ toggles }: { toggles: string[] }) {
  const [states, setStates] = useState<Record<number, boolean>>({});

  return (
    <div className="mt-6 space-y-1 divide-y divide-border rounded-[16px] border border-border bg-card">
      {toggles.map((label, index) => (
        <div key={label} className="flex items-center justify-between gap-4 px-4 py-4">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={states[index] ?? false}
            onClick={() => setStates((s) => ({ ...s, [index]: !s[index] }))}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
              states[index] ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
                states[index] ? "left-6" : "left-1",
              )}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

export function HelpArticleLinkButton({
  link,
  sectionId,
}: {
  link: HelpArticleLink;
  sectionId: string;
}) {
  const href = link.href ?? (link.articleId ? helpArticlePath(sectionId, link.articleId) : "#");

  return (
    <Link
      href={href}
        className="inline-flex min-h-11 items-center rounded-xl border border-[#d9dece] bg-white px-4 text-sm font-semibold text-[#38471B] transition-colors hover:border-[#B8D926]/50 hover:bg-[#f7fbe8]"
    >
      {link.label}
    </Link>
  );
}

export function HelpContentBlocks({
  paragraphs,
  numberedList,
}: {
  paragraphs?: string[];
  numberedList?: string[];
}) {
  return (
    <>
      {paragraphs?.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-relaxed text-[#5a6330] sm:text-[15px]">
          {paragraph}
        </p>
      ))}
      {numberedList && numberedList.length > 0 ? (
        <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-[#5a6330] sm:text-[15px]">
          {numberedList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : null}
    </>
  );
}
