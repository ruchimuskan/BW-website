"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useCallback, useState } from "react";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { easeOut, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

type AppFooterProps = {
  className?: string;
};

const exploreLinks = [
  { label: "My bookings", href: ROUTES.bookings, icon: CalendarCheck },
  { label: "Wallet", href: ROUTES.wallet, icon: Wallet },
  { label: "Safety", href: ROUTES.safety, icon: ShieldCheck },
  { label: "Support", href: ROUTES.profileHelp, icon: HelpCircle },
] as const;

const legalLinks = [
  { label: "Terms of service", href: ROUTES.terms },
  { label: "Privacy policy", href: ROUTES.privacy },
  { label: "Safety policy", href: ROUTES.safety },
] as const;

const fastReveal = { duration: 0.24, ease: easeOut } as const;
const accordionTransition = { duration: 0.26, ease: easeOut } as const;

/** Elegant footer for authenticated app screens (home, etc.). */
export function AppFooter({ className }: AppFooterProps) {
  const reduceMotion = useReducedMotion();
  const year = new Date().getFullYear();
  const [openSection, setOpenSection] = useState<"explore" | "download" | null>(
    "explore",
  );

  const toggle = useCallback((section: "explore" | "download") => {
    setOpenSection((prev) => (prev === section ? null : section));
  }, []);

  return (
    <footer
      className={cn(
        "relative mt-auto overflow-x-clip border-t border-primary/10 bg-gradient-to-b from-white via-[#ffffff] to-[#f4f9e4]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_15%_0%,rgba(200,232,74,0.14),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10">
        <motion.div
          initial={reduceMotion ? false : { y: 12 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={fastReveal}
          className="grid gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10 xl:gap-12"
        >
          {/* Brand */}
          <div className="min-w-0">
            <Link
              href={ROUTES.home}
              className="inline-flex transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              aria-label="BW Rides home"
            >
              <WaveGoLogo
                size="sm"
                className="h-12 w-12 sm:h-14 sm:w-14"
              />
            </Link>
            <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-[#4a5228]">
              Premium rides, parcels, and emergency SOS — built for calm,
              confident city travel.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Live tracking", "Verified captains"].map((chip) => (
                <motion.span
                  key={chip}
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className="inline-flex items-center rounded-full border border-primary/15 bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-primary uppercase"
                >
                  {chip}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Explore — accordion on mobile */}
          <div
            className={cn(
              "min-w-0 overflow-hidden rounded-2xl border border-primary/10 bg-white/80 backdrop-blur-sm lg:rounded-none lg:border-0 lg:bg-transparent lg:backdrop-blur-none",
              openSection === "explore" && "border-primary/20 bg-white lg:bg-transparent",
            )}
          >
            <motion.button
              type="button"
              onClick={() => toggle("explore")}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              transition={transitions.fast}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left lg:pointer-events-none lg:cursor-default lg:px-0 lg:py-0"
              aria-expanded={openSection === "explore"}
              aria-controls="app-footer-explore"
            >
              <p className="text-[10px] font-semibold tracking-[0.2em] text-secondary uppercase">
                Explore
              </p>
              <motion.span
                aria-hidden
                animate={{ rotate: openSection === "explore" ? 180 : 0 }}
                transition={accordionTransition}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary lg:hidden"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </motion.button>

            <div id="app-footer-explore" className="hidden lg:block">
              <ExploreList />
            </div>
            <div className="lg:hidden">
              <AnimatePresence initial={false}>
                {openSection === "explore" ? (
                  <motion.div
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={accordionTransition}
                    className="overflow-hidden px-2 pb-2"
                  >
                    <ExploreList />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Download + legal — accordion on mobile */}
          <div
            className={cn(
              "min-w-0 overflow-hidden rounded-2xl border border-primary/10 bg-white/80 backdrop-blur-sm lg:rounded-none lg:border-0 lg:bg-transparent lg:backdrop-blur-none",
              openSection === "download" && "border-primary/20 bg-white lg:bg-transparent",
            )}
          >
            <motion.button
              type="button"
              onClick={() => toggle("download")}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              transition={transitions.fast}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left lg:pointer-events-none lg:cursor-default lg:px-0 lg:py-0"
              aria-expanded={openSection === "download"}
              aria-controls="app-footer-download"
            >
              <p className="text-[10px] font-semibold tracking-[0.2em] text-secondary uppercase">
                Download
              </p>
              <motion.span
                aria-hidden
                animate={{ rotate: openSection === "download" ? 180 : 0 }}
                transition={accordionTransition}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary lg:hidden"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </motion.button>

            <div id="app-footer-download" className="hidden lg:block">
              <DownloadBlock reduceMotion={!!reduceMotion} />
            </div>
            <div className="lg:hidden">
              <AnimatePresence initial={false}>
                {openSection === "download" ? (
                  <motion.div
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={accordionTransition}
                    className="overflow-hidden px-3 pb-3"
                  >
                    <DownloadBlock reduceMotion={!!reduceMotion} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { y: 8 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={fastReveal}
          className="mt-7 flex flex-col items-center justify-between gap-2 border-t border-primary/10 pt-5 text-center text-xs text-[#4a5228] sm:mt-9 sm:flex-row sm:text-left"
        >
          <p>© {year} BW Rides Technologies. All rights reserved.</p>
          <p className="font-light tracking-wide">
            Made for riders &amp; captains across India.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

function ExploreList() {
  const reduceMotion = useReducedMotion();

  return (
    <ul className="space-y-1 lg:mt-3.5">
      {exploreLinks.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <motion.div
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={transitions.fast}
            >
              <Link
                href={item.href}
                className="group flex min-h-11 items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm text-[#4a5228] transition-colors duration-200 hover:bg-primary/[0.05] hover:text-primary active:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                </span>
                <span className="relative min-w-0 flex-1">
                  {item.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100 group-active:scale-x-100"
                  />
                </span>
                <ArrowRight
                  aria-hidden
                  className={cn(
                    "bw-link-arrow h-3.5 w-3.5 shrink-0 text-primary",
                    "opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 ease-out",
                    "group-hover:translate-x-0 group-hover:opacity-100",
                    "group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                    "group-active:translate-x-0.5 group-active:opacity-100",
                    reduceMotion && "transition-none group-hover:opacity-100",
                  )}
                  strokeWidth={2.2}
                />
              </Link>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}

function DownloadBlock({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="lg:mt-3.5">
      <div className="flex flex-col gap-2.5">
        {(
          [
            {
              href: APP_DOWNLOAD.androidPlayStoreUrl,
              title: "Rider app",
              sub: "Google Play",
            },
            {
              href: APP_DOWNLOAD.captainAndroidPlayStoreUrl,
              title: "Captain app",
              sub: "Google Play",
            },
          ] as const
        ).map((app) => (
          <motion.a
            key={app.title}
            href={app.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={transitions.spring}
            className="group flex min-h-12 items-center gap-3 rounded-xl border border-primary/12 bg-white px-3.5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
              <Smartphone className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block leading-tight">{app.title}</span>
              <span className="block text-[11px] font-medium text-[#4a5228]">
                {app.sub}
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="bw-link-arrow h-4 w-4 shrink-0 text-primary opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              strokeWidth={2.2}
            />
          </motion.a>
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-1 gap-y-1.5 text-xs text-[#4a5228]">
        {legalLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors duration-200 hover:text-primary active:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            >
              <span>{link.label}</span>
              <ArrowRight
                aria-hidden
                className="bw-link-arrow h-3 w-3 opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                strokeWidth={2.2}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
