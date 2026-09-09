"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sanitizeLegalHtml } from "@/lib/legal-html";
import {
  getPrivacyPolicy,
  getTermsAndConditions,
  type LegalDocument,
} from "@/lib/settings-api";
import { getFaqs, type FaqItem } from "@/lib/support-api";
import { cn } from "@/lib/utils";

export function HelpLegalDocument({
  source,
  variant = "default",
}: {
  source: "privacy" | "terms";
  /** Public marketing page — larger padding, no app-shell card chrome. */
  variant?: "default" | "public";
}) {
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isPublic = variant === "public";

  const load = () => {
    setLoading(true);
    setError(null);
    const req = source === "privacy" ? getPrivacyPolicy() : getTermsAndConditions();
    void req
      .then((data) => setDoc(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load this document"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const html = useMemo(
    () => sanitizeLegalHtml(doc?.content ?? ""),
    [doc?.content],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 border bg-white px-4 py-12 text-sm text-[#5a6330]",
          isPublic
            ? "rounded-xl border-[#E4E7E0] shadow-sm sm:py-14"
            : "rounded-2xl border-[#e5e7df]",
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin text-[#9BB820]" />
        Loading from BW Rides…
      </div>
    );
  }

  if (error || !html) {
    return (
      <div
        className={cn(
          "border border-dashed bg-white px-4 py-8 text-center",
          isPublic
            ? "rounded-xl border-[#D4D8D0] shadow-sm sm:px-6 sm:py-10"
            : "rounded-2xl border-[#d9dece]",
        )}
      >
        <p className="text-sm text-[#5a6330]">
          {error || "This document is not published on the server yet."}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-10 gap-1.5 rounded-lg border-[#d9dece]"
          onClick={load}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "help-legal-html overflow-hidden border bg-white",
        "text-sm leading-relaxed text-[#4a5228] sm:text-[15px]",
        "[&_h1]:mb-2.5 [&_h1]:font-heading [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#1f2912] sm:[&_h1]:text-[1.35rem]",
        "[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-heading [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:text-[#283614] sm:[&_h2]:text-base",
        "[&_h3]:mt-3.5 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[#283614]",
        "[&_p]:mt-2 [&_p]:leading-[1.7]",
        "[&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
        "[&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
        "[&_a]:font-semibold [&_a]:text-[#38471B] [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&_li]:break-words",
        isPublic
          ? "rounded-xl border-[#E4E7E0] px-4 py-5 shadow-[0_8px_24px_-16px_rgba(27,58,34,0.22)] sm:px-6 sm:py-6 md:px-8 md:py-7 lg:px-10 lg:py-8"
          : "rounded-2xl border-[#e5e7df] px-4 py-5 sm:px-6 sm:py-6",
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function HelpFaqList({
  category,
  match,
}: {
  category: string;
  match?: string;
}) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    void getFaqs()
      .then((rows) => {
        const key = category.trim().toLowerCase();
        let next =
          key === "all" || key === "*"
            ? rows
            : rows.filter((row) => row.category.toLowerCase() === key);
        const needles = (match ?? "")
          .split("|")
          .map((part) => part.trim().toLowerCase())
          .filter(Boolean);
        if (needles.length > 0) {
          const matched = next.filter((row) => {
            const hay = `${row.question} ${row.answer}`.toLowerCase();
            return needles.some((needle) => hay.includes(needle));
          });
          if (matched.length > 0) next = matched;
        }
        setItems(next);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load FAQs"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, match]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#e5e7df] bg-white px-4 py-12 text-sm text-[#5a6330]">
        <Loader2 className="h-4 w-4 animate-spin text-[#9BB820]" />
        Loading FAQs…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d9dece] bg-white px-4 py-8 text-center">
        <p className="text-sm text-[#5a6330]">{error}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-10 gap-1.5 rounded-xl border-[#d9dece]"
          onClick={load}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#d9dece] bg-white px-4 py-8 text-center text-sm text-[#5a6330]">
        No published FAQs for this topic yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[#e5e7df] overflow-hidden rounded-2xl border border-[#e5e7df] bg-white">
      {items.map((item, index) => {
        const id = item.id ?? `${item.question}-${index}`;
        const open = openId === id;
        return (
          <div key={id}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : id)}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4"
            >
              <span className="min-w-0 flex-1 text-sm font-semibold text-[#283614] sm:text-[15px]">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 text-[#8a9270] transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
            {open ? (
              <p className="px-4 pb-4 text-sm leading-relaxed text-[#5a6330] sm:px-5">
                {item.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
