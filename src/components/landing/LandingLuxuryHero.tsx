"use client";

import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { HeroVehicleStage } from "@/components/landing/HeroVehicleStage";
import {
  LandingBookingWidget,
  type LandingBookingWidgetProps,
} from "@/components/landing/LandingBookingWidget";
import { landingShell } from "@/lib/landing-shell";
import { transitions } from "@/lib/motion";

type LandingLuxuryHeroProps = LandingBookingWidgetProps;

const trustLine = [
  { icon: Sparkles, label: "Upfront fares" },
  { icon: ShieldCheck, label: "Verified captains" },
  { icon: MapPin, label: "Live tracking" },
] as const;

/**
 * Marlin-style hero: dark brand band + floating vehicle cutout, booking card below.
 * Keeps Bull Wave lime theme (#C6E31A) — layout only, not palette swap.
 */
export function LandingLuxuryHero({
  activeTab,
  onTabChange,
  ...bookingProps
}: LandingLuxuryHeroProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBook = () => {
    document.getElementById("book")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      className="relative overflow-x-clip"
      aria-label="Book a premium ride with BW Rides"
    >
      <div className="relative overflow-hidden bg-[#111411] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_80%_at_100%_50%,rgba(198,227,26,0.22),transparent_58%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_0%_0%,rgba(198,227,26,0.12),transparent_50%)]"
        />

        <div
          className={landingShell(
            "relative z-10 pb-[5.25rem] pt-5 sm:pb-[5.75rem] sm:pt-7 md:pb-24 lg:pb-[6.25rem] lg:pt-8 xl:pt-9",
          )}
        >
          <div className="grid w-full min-w-0 grid-cols-1 items-center gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-9">
            <motion.div
              className="relative z-20 order-1 min-w-0 lg:py-1"
              initial={reduceMotion || !mounted ? false : { y: 16 }}
              animate={{ y: 0 }}
              transition={{ ...transitions.reveal, delay: 0.04 }}
            >
              <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-white/55 sm:text-[11px]">
                Ride · Parcel · SOS
              </p>

              <div className="mt-2 h-0.5 w-10 rounded-full bg-[#C6E31A] sm:mt-2.5 sm:w-12" aria-hidden />

              <h1 className="mt-2.5 max-w-xl font-heading text-[1.65rem] font-bold leading-[1.1] tracking-tight text-white sm:mt-3 sm:text-[2rem] lg:text-[2.35rem] xl:text-[2.65rem]">
                Comfortable rides, trusted service every time.
              </h1>

              <p className="mt-2.5 max-w-lg text-[13px] leading-relaxed text-white/72 sm:mt-3 sm:text-sm lg:text-[15px]">
                Bike, auto, cab, parcel, and ambulance SOS — live tracking, upfront
                fares, and verified captains across India.
              </p>

              <ul className="mt-3.5 flex flex-wrap gap-2 sm:mt-4 sm:gap-2">
                {trustLine.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.li
                      key={item.label}
                      initial={reduceMotion || !mounted ? false : { y: 10 }}
                      animate={{ y: 0 }}
                      transition={{
                        ...transitions.reveal,
                        delay: 0.1 + i * 0.05,
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-white uppercase backdrop-blur-sm sm:px-3 sm:text-[11px]"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C6E31A]">
                        <Icon
                          className="h-3 w-3 shrink-0 text-[#111411] sm:h-3.5 sm:w-3.5"
                          strokeWidth={2.4}
                        />
                      </span>
                      {item.label}
                    </motion.li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={scrollToBook}
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#C6E31A] px-6 text-sm font-bold tracking-wide text-[#111411] shadow-[0_12px_32px_-14px_rgba(198,227,26,0.65)] transition hover:bg-[#D4F04A] sm:mt-5 sm:min-h-11 sm:px-7"
              >
                Book now
              </button>
            </motion.div>

            <motion.div
              className="relative z-0 order-2 w-full min-w-0 overflow-hidden lg:order-2 lg:flex lg:items-center lg:justify-center"
              initial={reduceMotion || !mounted ? false : { y: 18, opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...transitions.reveal, delay: 0.1 }}
            >
              <HeroVehicleStage
                activeTab={activeTab}
                onTabChange={onTabChange}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div
        className={landingShell(
          "relative z-20 -mt-10 flex justify-center sm:-mt-11 md:-mt-12 lg:-mt-14",
        )}
      >
        <motion.div
          className="w-full max-w-3xl lg:max-w-4xl"
          initial={reduceMotion || !mounted ? false : { y: 20 }}
          animate={{ y: 0 }}
          transition={{ ...transitions.reveal, delay: 0.14 }}
        >
          <LandingBookingWidget
            activeTab={activeTab}
            onTabChange={onTabChange}
            layout="floating"
            {...bookingProps}
          />
        </motion.div>
      </div>

      <div className="h-3 sm:h-4" aria-hidden />
    </section>
  );
}
