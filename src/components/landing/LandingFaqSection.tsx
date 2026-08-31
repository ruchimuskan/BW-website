"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, HelpCircle, Minus, Plus } from "lucide-react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { PremiumSectionBackdrop } from "@/components/landing/PremiumSectionBackdrop";
import { buttonVariants } from "@/components/ui/button";
import { landingFaqItems } from "@/constants/landing-faq";
import { ROUTES } from "@/constants/routes";
import { getProtectedPath } from "@/lib/auth-session";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

export function LandingFaqSection() {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(landingFaqItems[0]?.id ?? null);
  const [helpHref, setHelpHref] = useState<string>(ROUTES.login);

  useEffect(() => {
    setHelpHref(getProtectedPath(ROUTES.profileHelp));
  }, []);

  return (
    <section
      id="faqs"
      className={cn("relative scroll-mt-20 overflow-hidden", LANDING_SECTION_PY)}
    >
      <PremiumSectionBackdrop opacity={0.12} side="left" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className={landingShell("relative z-10")}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary sm:text-xs sm:tracking-[0.28em]">
          FAQs
        </p>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-primary/25 via-border to-transparent" />
      </div>

      <div className={landingShell("relative z-10 mt-8 grid gap-10 sm:mt-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-16")}>
        <AnimateIn className="lg:sticky lg:top-24">
          <h2 className="mt-2 font-heading text-[1.45rem] font-medium tracking-tight text-foreground sm:mt-3 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Questions?
            <span className="block text-primary">We&apos;ve got answers.</span>
          </h2>
          <p className="mt-3 max-w-md text-[13px] font-light leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
            Everything you need to know about booking rides, parcels, ambulance SOS,
            payments, and driving with Bull Wave Rides.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link
              href={helpHref}
              className={cn(
                buttonVariants(),
                "h-11 rounded-xl px-6 font-semibold shadow-sm shadow-primary/10"
              )}
            >
              Help center
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.safety}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl border-primary/20 bg-card px-6 font-semibold text-primary hover:bg-primary/5"
              )}
            >
              Safety policy
            </Link>
          </div>

          <div className="mt-10 hidden items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm lg:flex">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/50 text-primary">
              <HelpCircle className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Our support team is available{" "}
              <span className="font-semibold text-foreground">24×7</span> in the app.
            </p>
          </div>
        </AnimateIn>

        <Stagger className="flex flex-col gap-3">
          {landingFaqItems.map((item, index) => {
            const isOpen = openId === item.id;

            return (
              <StaggerItem key={item.id} index={index}>
                <div
                  className={cn(
                    "overflow-hidden rounded-[20px] border transition-all duration-300",
                    isOpen
                      ? "border-primary/20 bg-card shadow-lg shadow-primary/5"
                      : "border-border bg-card/70 hover:border-primary/15 hover:bg-card"
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="relative flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
                  >
                    <span
                      className={cn(
                        "absolute top-5 bottom-5 left-0 w-1 rounded-full transition-all duration-300 sm:top-6 sm:bottom-6",
                        isOpen ? "bg-primary" : "bg-transparent"
                      )}
                    />
                    <span className="pl-3 font-heading text-base font-bold leading-snug text-foreground sm:text-lg">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                        isOpen
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-muted-foreground"
                      )}
                    >
                      {isOpen ? (
                        <Minus className="h-4 w-4" strokeWidth={2.5} />
                      ) : (
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${item.id}`}
                        initial={
                          reduceMotion
                            ? false
                            : { height: 0 }
                        }
                        animate={{ height: "auto" }}
                        exit={reduceMotion ? undefined : { height: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 pl-8 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 sm:text-base">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>

      <AnimateIn delay={0.1} className={landingShell("relative mt-10 lg:hidden")}>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50 text-primary">
            <HelpCircle className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Need more help?{" "}
            <Link
              href={helpHref}
              className="font-semibold text-primary hover:underline"
            >
              Visit Help center
            </Link>
          </p>
        </div>
      </AnimateIn>
    </section>
  );
}
