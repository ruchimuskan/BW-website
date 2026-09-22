"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { buttonVariants } from "@/components/ui/button";
import {
  landingFaqItems,
  shortenLandingFaqQuestion,
} from "@/constants/landing-faq";
import { ROUTES } from "@/constants/routes";
import { getProtectedPath } from "@/lib/auth-session";
import { fetchLandingFaqs, type LandingFaq } from "@/lib/landing-api";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

function toDisplayFaqs(items: LandingFaq[]): LandingFaq[] {
  return items.slice(0, 8).map((item) => ({
    ...item,
    question: shortenLandingFaqQuestion(item.question),
  }));
}

function bundledFaqs(): LandingFaq[] {
  return toDisplayFaqs(
    landingFaqItems.map(({ id, question, answer }) => ({
      id,
      question,
      answer,
    })),
  );
}

interface LandingFaqSectionProps {
  /** Server-fetched FAQs — must match FAQPage JSON-LD for Google rich results. */
  initialFaqs?: LandingFaq[];
}

export function LandingFaqSection({ initialFaqs }: LandingFaqSectionProps) {
  const reduceMotion = useReducedMotion();
  const headingId = useId();
  const seed = initialFaqs?.length ? toDisplayFaqs(initialFaqs) : bundledFaqs();
  const [faqItems, setFaqItems] = useState<LandingFaq[]>(seed);
  const [faqsLoaded, setFaqsLoaded] = useState(Boolean(initialFaqs?.length));
  const [openId, setOpenId] = useState<string | null>(null);
  const [helpHref, setHelpHref] = useState<string>(ROUTES.login);

  useEffect(() => {
    setHelpHref(getProtectedPath(ROUTES.profileHelp));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchLandingFaqs()
      .then((items) => {
        if (cancelled || items.length === 0) return;
        const next = toDisplayFaqs(items);
        setFaqItems(next);
        setOpenId((prev) =>
          prev && next.some((item) => item.id === prev) ? prev : null,
        );
      })
      .finally(() => {
        if (!cancelled) setFaqsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="faqs"
      aria-labelledby={headingId}
      className={cn(
        "relative scroll-mt-20 overflow-hidden bg-white",
        LANDING_SECTION_PY,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_0%_0%,rgba(198,227,26,0.12),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C6E31A]/40 to-transparent"
      />

      <div className={landingShell("relative z-10")}>
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <AnimateIn className="lg:sticky lg:top-24">
            <header className="max-w-sm">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-[#5a7a12] uppercase sm:text-[11px] sm:tracking-[0.28em]">
                FAQs
              </p>
              <div className="mt-2.5 h-1 w-10 rounded-full bg-[#C6E31A] sm:w-12" />
              <h2
                id={headingId}
                className="mt-3 font-heading text-[1.55rem] font-semibold tracking-tight text-[#111411] sm:mt-4 sm:text-3xl lg:text-[2.25rem] lg:leading-[1.15]"
              >
                Questions?
                <span className="mt-1 block text-[#7a9a0f]">
                  Short answers.
                </span>
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-[#5A6158] sm:mt-3.5 sm:text-[15px]">
                Rides, parcels, ambulance, payments — the essentials, fast.
              </p>
            </header>

            <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row">
              <Link
                href={helpHref}
                className={cn(
                  buttonVariants(),
                  "h-11 w-full justify-center rounded-xl px-5 font-semibold shadow-sm shadow-[#C6E31A]/20 sm:w-auto lg:w-full xl:w-auto",
                )}
              >
                Help center
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.safety}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 w-full justify-center rounded-xl border-[#C6E31A]/30 bg-[#fbfcf7] px-5 font-semibold text-[#5a7a12] hover:bg-[#C6E31A]/10 sm:w-auto lg:w-full xl:w-auto",
                )}
              >
                Safety
              </Link>
            </div>
          </AnimateIn>

          <Stagger className="flex min-w-0 flex-col gap-2 sm:gap-2.5">
            {faqsLoaded && faqItems.length === 0 ? (
              <p className="rounded-2xl border border-[#e8ecd8] bg-[#fbfcf7] px-4 py-6 text-sm text-[#5A6158]">
                FAQs will appear here once published on the server.
              </p>
            ) : null}
            {faqItems.map((item, index) => {
              const isOpen = openId === item.id;
              const panelId = `faq-panel-${item.id}`;
              const buttonId = `faq-button-${item.id}`;
              const number = String(index + 1).padStart(2, "0");

              return (
                <StaggerItem key={item.id} index={index}>
                  <article
                    className={cn(
                      "overflow-hidden rounded-xl border bg-[#fbfcf7] transition-[border-color,background-color,box-shadow] duration-300 sm:rounded-2xl",
                      isOpen
                        ? "border-[#C6E31A]/55 bg-white shadow-[0_14px_32px_-20px_rgba(27,58,34,0.4)]"
                        : "border-[#e8edd8] hover:border-[#C6E31A]/35 hover:bg-white",
                    )}
                  >
                    <h3 className="m-0">
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : item.id)}
                        className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-heading text-[11px] font-semibold tracking-wide sm:h-9 sm:w-9 sm:text-xs",
                            isOpen
                              ? "bg-[#C6E31A] text-[#111411]"
                              : "bg-white text-[#8a9184] ring-1 ring-[#e4e8da]",
                          )}
                        >
                          {number}
                        </span>
                        <span className="min-w-0 flex-1 font-heading text-[14px] font-semibold leading-snug tracking-tight text-[#111411] sm:text-[15px] md:text-base">
                          {item.question}
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                            isOpen
                              ? "bg-[#C6E31A] text-[#111411]"
                              : "bg-white text-[#5A6158] ring-1 ring-[#e4e8da]",
                          )}
                        >
                          {isOpen ? (
                            <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                          ) : (
                            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                          )}
                        </span>
                      </button>
                    </h3>

                    {/* Keep answers in the HTML for Google FAQ rich results (accordion only hides visually). */}
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={cn(
                        "overflow-hidden",
                        !isOpen && "sr-only",
                      )}
                    >
                      {isOpen ? (
                        <AnimatePresence initial={false}>
                          <motion.div
                            key="open"
                            initial={
                              reduceMotion ? false : { height: 0, opacity: 0.5 }
                            }
                            animate={{ height: "auto", opacity: 1 }}
                            exit={
                              reduceMotion
                                ? undefined
                                : { height: 0, opacity: 0.5 }
                            }
                            transition={{
                              duration: 0.26,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <p className="border-t border-[#eef2e0] px-3.5 pt-3 pb-4 pl-[3.35rem] text-[13px] leading-relaxed text-[#5A6158] sm:px-5 sm:pt-3.5 sm:pb-5 sm:pl-[4.25rem] sm:text-sm">
                              {item.answer}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <p className="px-3.5 pb-4 pl-[3.35rem] text-[13px] leading-relaxed text-[#5A6158] sm:px-5 sm:pl-[4.25rem] sm:text-sm">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
