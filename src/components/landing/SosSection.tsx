"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Ambulance, PhoneCall, Share2, ShieldCheck } from "lucide-react";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { buttonVariants } from "@/components/ui/button";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import { ROUTES } from "@/constants/routes";
import { landingAssets } from "@/constants/services";
import { getProtectedPath } from "@/lib/auth-session";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Verified medical transport",
    description: "Clear trip details before you confirm.",
  },
  {
    icon: Share2,
    title: "Live trip sharing",
    description: "Keep family informed in real time.",
  },
  {
    icon: PhoneCall,
    title: "24×7 support",
    description: "Dedicated emergency workflows anytime.",
  },
] as const;

/** Landing teaser — full experience lives on /sos */
export function SosSection() {
  const reduceMotion = useReducedMotion();
  const [ambulanceHref, setAmbulanceHref] = useState<string>(ROUTES.login);

  useEffect(() => {
    setAmbulanceHref(getProtectedPath(ROUTES.ambulanceBook));
  }, []);

  return (
    <section
      id="sos"
      className={cn("scroll-mt-20 bw-section-glow border-y border-primary/10", LANDING_SECTION_PY)}
    >
      <div className={landingShell("relative z-10 bw-frosted-panel overflow-hidden sm:rounded-2xl")}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-destructive/10 blur-3xl"
        />
        {!reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-1/3 right-1/4 h-28 w-28 rounded-full bg-destructive/10 blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:p-10">
          <AnimateIn>
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] uppercase text-destructive sm:text-xs">
              <Ambulance className="h-3.5 w-3.5" />
              Emergency SOS
            </p>
            <h2
              className="mt-3 font-heading text-[1.55rem] font-light leading-tight tracking-tight sm:text-3xl lg:text-4xl bw-title"
            >
              Need help fast?
              <span className="mt-1 block font-semibold text-[#111411]">
                Choose & book{" "}
                <span className="text-destructive">Ambulance</span> for free.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
              Verified medical transport, live ETA, and family trip sharing when
              every second counts.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={ambulanceHref}
                prefetch
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 w-full bg-destructive px-7 font-semibold text-white hover:bg-destructive/90 sm:w-auto",
                )}
              >
                Book Ambulance for free
              </Link>
              <Link
                href={ROUTES.sos}
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 w-full border-primary/30 px-7 font-semibold text-primary hover:bg-primary/5 sm:w-auto",
                )}
              >
                Learn more
              </Link>
            </div>

            <Stagger className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description }, index) => (
                <StaggerItem key={title} index={index}>
                  <div className="rounded-xl border border-primary/10 bg-[#ffffff] px-3 py-3.5">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
                    <p
                      className="mt-2 font-heading text-sm font-semibold bw-title"
                    >
                      {title}
                    </p>
                    <p className="mt-1 text-[12px] font-light leading-relaxed text-[#4a5228]">
                      {description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </AnimateIn>

          <AnimateIn direction="right" delay={0.08}>
            <div className="relative mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-xl border border-primary/12 bg-[#f7fbe8] sm:rounded-2xl lg:max-w-none">
              <ResilientImage
                src={landingAssets.slideAmbulance}
                alt="BW Rides emergency ambulance"
                fill
                quality={85}
                className={BRAND_PHOTO_CLASS}
                sizes="(max-width: 1024px) 100vw, 40vw"
                fallbackSrc={BRAND_PHOTOS.ambulance}
              />
              <BrandImageOverlay variant="default" />
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
