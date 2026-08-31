"use client";

import Image from "next/image";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LandingBookingWidget,
  type LandingBookingWidgetProps,
} from "@/components/landing/LandingBookingWidget";
import { BRAND_IMAGE_SIZES } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import {
  landingBookImages,
  landingBookingTabs,
} from "@/constants/services";
import { landingShell } from "@/lib/landing-shell";
import { transitions } from "@/lib/motion";
import { BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { cn } from "@/lib/utils";

type LandingLuxuryHeroProps = LandingBookingWidgetProps;

const trustLine = [
  { icon: Sparkles, label: "Upfront fares" },
  { icon: ShieldCheck, label: "Verified captains" },
  { icon: MapPin, label: "Live tracking" },
] as const;

const heroTabs = landingBookingTabs.map((t) => t.id);

/**
 * Brand-led hero with a large, conversion-focused Book Your Journey panel.
 * Mobile: brand → booking → image. Desktop: brand+image | booking.
 * Hero image stays in sync with Rides / Parcel / Emergency tabs.
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

  return (
    <section
      className="relative overflow-x-clip bw-hero-atmosphere"
      aria-label="Book a premium ride with Bull Wave Rides"
    >
      <div
        className={landingShell(
          "relative z-10 py-5 sm:py-7 md:py-9 lg:py-10 xl:py-12",
        )}
      >
        <div className="grid w-full min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(26rem,36rem)] xl:gap-10 2xl:gap-12">
          {/* Brand copy — top on all screens */}
          <motion.div
            className="relative z-10 order-1 min-w-0 lg:col-start-1 lg:row-start-1"
            initial={reduceMotion || !mounted ? false : { y: 16 }}
            animate={{ y: 0 }}
            transition={{ ...transitions.reveal, delay: 0.04 }}
          >
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-[#5A6158] sm:text-[11px]">
              Ride · Parcel · SOS
            </p>
            <h1
              className="mt-2 text-[1.85rem] leading-none tracking-tight text-[#111411] sm:text-[2.2rem] lg:text-[2.55rem] xl:text-[2.85rem]"
              style={{ fontFamily: "var(--font-playwrite-gb-j), cursive" }}
            >
              Bull Wave Rides
            </h1>

            <div className="mt-3 h-1 w-12 rounded-full bg-[#C6E31A] sm:mt-3.5 sm:w-14" />

            <p className="mt-3 max-w-2xl font-heading text-[1.4rem] font-semibold leading-[1.12] tracking-tight text-[#111411] sm:mt-3.5 sm:text-[1.75rem] lg:text-[2rem]">
              Book a ride in seconds.
              <span className="mt-1 block font-semibold text-[#C6E31A]">
                Go anywhere in the city.
              </span>
            </p>

            <p className="mt-2.5 max-w-xl text-[13px] leading-relaxed text-[#5A6158] sm:mt-3 sm:text-[15px] lg:text-base">
              Bike, auto, cab, parcel, and ambulance SOS — live tracking, upfront
              fares, and verified captains across India.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5">
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#D4D8D0] bg-white px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#111411] uppercase shadow-[0_8px_18px_-14px_rgba(17,20,17,0.2)] sm:px-3 sm:text-[11px]"
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
          </motion.div>

          {/* Booking — directly under brand on mobile; sticky right column on desktop */}
          <motion.div
            className="relative z-10 order-2 w-full min-w-0 max-w-full sm:mx-auto sm:max-w-xl lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none lg:sticky lg:top-24"
            initial={reduceMotion || !mounted ? false : { y: 18 }}
            animate={{ y: 0 }}
            transition={{ ...transitions.reveal, delay: 0.08 }}
          >
            <LandingBookingWidget
              activeTab={activeTab}
              onTabChange={onTabChange}
              {...bookingProps}
              size="featured"
              showTitle
              className="w-full max-w-full"
            />
          </motion.div>

          {/* Hero image — below booking on mobile; under brand on desktop */}
          <motion.div
            className="group relative z-10 order-3 aspect-[16/10] w-full min-w-0 overflow-hidden rounded-2xl border border-[#D4D8D0] bg-[#111411] shadow-[0_22px_48px_-24px_rgba(17,20,17,0.45)] sm:aspect-[16/9] lg:col-start-1 lg:row-start-2 lg:mt-1 lg:min-h-[280px] xl:min-h-[340px] 2xl:min-h-[360px]"
            initial={reduceMotion || !mounted ? false : { y: 18 }}
            animate={{ y: 0 }}
            transition={{ ...transitions.reveal, delay: 0.12 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#C8E84A]/20 via-transparent to-[#B8D926]/15 opacity-80 blur-xl transition-opacity duration-700 group-hover:opacity-100"
            />

            {heroTabs.map((tab) => {
              const slide = landingBookImages[tab];
              const isActive = tab === activeTab;
              return (
                <div
                  key={tab}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 ease-in-out",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden={!isActive}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={
                      !reduceMotion && isActive
                        ? { scale: [1, 1.045] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 5.5, ease: "easeOut" }}
                  >
                    <Image
                      src={slide.src}
                      alt={isActive ? slide.alt : ""}
                      fill
                      quality={NEXT_IMAGE_QUALITY.high}
                      sizes={BRAND_IMAGE_SIZES.hero}
                      className={BRAND_PHOTO_CLASS}
                      style={{ objectPosition: slide.objectPosition }}
                      {...(tab === "rides"
                        ? { priority: true as const }
                        : { loading: "lazy" as const })}
                    />
                  </motion.div>
                  <div
                    aria-hidden
                    className={cn(
                      "absolute inset-0 bg-gradient-to-tr transition-opacity duration-700",
                      slide.accent,
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </div>
              );
            })}

            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
              <div
                className="flex gap-1.5"
                role="tablist"
                aria-label="Service preview"
              >
                {landingBookingTabs.map((tab) => {
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-label={`${tab.label} preview`}
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        selected
                          ? tab.id === "ambulance"
                            ? "w-8 bg-destructive"
                            : "w-8 bg-[#C8E84A]"
                          : "w-2.5 bg-white/45 hover:bg-white/75",
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
