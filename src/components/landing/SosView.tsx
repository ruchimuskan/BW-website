"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Ambulance, PhoneCall, Share2, ShieldCheck } from "lucide-react";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { landingAssets } from "@/constants/services";
import { getProtectedPath } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Verified medical transport",
    description:
      "Matched with verified partners and clear trip details before you confirm.",
  },
  {
    icon: Share2,
    title: "Live trip sharing",
    description:
      "Share your route with family for peace of mind during urgent travel.",
  },
  {
    icon: PhoneCall,
    title: "24×7 emergency support",
    description:
      "Get help any time with in-app SOS and dedicated support workflows.",
  },
] as const;

const steps = [
  {
    title: "Tap Ambulance SOS",
    description: "Open emergency mode and confirm your pickup location.",
  },
  {
    title: "Choose hospital",
    description: "Select a nearby hospital or enter a destination.",
  },
  {
    title: "Track live ETA",
    description: "Follow medical transport in real time and share the trip.",
  },
] as const;

export function SosView() {
  const reduceMotion = useReducedMotion();
  const [ambulanceHref, setAmbulanceHref] = useState<string>(ROUTES.login);

  useEffect(() => {
    setAmbulanceHref(getProtectedPath(ROUTES.ambulanceBook));
  }, []);

  return (
    <MarketingPageShell>
      <LandingHeader />

      <section className="relative overflow-hidden bw-hero-atmosphere px-4 py-14 sm:px-6 sm:py-20 lg:py-24">

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <AnimateIn>
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] uppercase text-destructive sm:text-xs">
                <Ambulance className="h-3.5 w-3.5" />
                Emergency SOS
              </p>
              <div className="mt-3 h-px w-14 bg-gradient-to-r from-destructive via-primary to-transparent" />
            </AnimateIn>
            <AnimateIn delay={0.06}>
              <h1
                className="mt-4 font-heading text-[2rem] font-light leading-[1.15] tracking-tight sm:text-5xl"
                style={{ color: "#B8D926" }}
              >
                Need help fast?
                <span className="mt-1 block font-semibold text-destructive">
                  Request an ambulance in one tap.
                </span>
              </h1>
            </AnimateIn>
            <AnimateIn delay={0.12}>
              <p className="mt-5 max-w-lg text-sm font-light leading-relaxed text-[#4a5228] sm:text-lg">
                When every second counts, Bull Wave Rides helps you request verified
                medical transport, track live ETA, and keep your family informed.
              </p>
            </AnimateIn>
            <AnimateIn delay={0.18}>
              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          boxShadow: [
                            "0 0 0 0 rgba(220,38,38,0.25)",
                            "0 0 0 12px rgba(220,38,38,0)",
                            "0 0 0 0 rgba(220,38,38,0)",
                          ],
                        }
                  }
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    href={ambulanceHref}
                    prefetch
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-12 w-full bg-destructive px-8 font-semibold text-white hover:bg-destructive/90 sm:w-auto",
                    )}
                  >
                    Request Ambulance SOS
                  </Link>
                </motion.div>
                <Link
                  href={ROUTES.safety}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "h-12 w-full border-primary/30 px-8 font-semibold text-primary hover:bg-primary/5 sm:w-auto",
                  )}
                >
                  Safety policy
                </Link>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn direction="right" delay={0.1}>
            <div className="relative aspect-[5/4] overflow-hidden rounded-xl border border-primary/15 bg-[#f7fbe8] shadow-[0_24px_48px_-28px_rgba(184,217,38,0.45)] sm:rounded-2xl">
              <Image
                src={landingAssets.slideAmbulance}
                alt="Bull Wave Rides emergency ambulance"
                fill
                priority
                quality={90}
                className={BRAND_PHOTO_CLASS}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <BrandImageOverlay variant="default" />
            </div>
          </AnimateIn>
        </div>
      </section>

      <section className="border-y border-primary/10 bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <AnimateIn>
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-secondary sm:text-xs">
              Why SOS
            </p>
            <h2
              className="mt-3 font-heading text-[1.55rem] font-light tracking-tight sm:text-3xl"
              style={{ color: "#B8D926" }}
            >
              Built for critical moments
            </h2>
          </AnimateIn>
          <Stagger className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }, index) => (
              <StaggerItem key={title} index={index}>
                <article className="group h-full overflow-hidden rounded-xl border border-primary/12 bg-white px-5 py-6 shadow-[0_14px_36px_-28px_rgba(184,217,38,0.35)] transition-transform duration-200 hover:-translate-y-1 sm:rounded-2xl">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-[#ffffff] text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <span className="mt-4 block font-heading text-xs tracking-[0.18em] text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="mt-2 font-heading text-lg font-semibold"
                    style={{ color: "#B8D926" }}
                  >
                    {title}
                  </h3>
                  <p className="mt-2 text-[13px] font-light leading-relaxed text-[#4a5228]">
                    {description}
                  </p>
                  <span className="mt-5 block h-px w-8 bg-gradient-to-r from-secondary to-primary transition-all duration-300 group-hover:w-14" />
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <AnimateIn>
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-secondary sm:text-xs">
              How it works
            </p>
            <h2
              className="mt-3 font-heading text-[1.55rem] font-light tracking-tight sm:text-3xl"
              style={{ color: "#B8D926" }}
            >
              Three steps to help
            </h2>
          </AnimateIn>
          <Stagger className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <StaggerItem key={step.title} index={index}>
                <article className="group h-full overflow-hidden rounded-xl border border-primary/12 bg-white px-5 py-6 shadow-[0_14px_36px_-28px_rgba(184,217,38,0.35)] transition-transform duration-200 hover:-translate-y-1 sm:rounded-2xl sm:px-6 sm:py-8">
                  <span className="font-heading text-xs tracking-[0.2em] text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="mt-3 font-heading text-lg font-semibold"
                    style={{ color: "#B8D926" }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] font-light leading-relaxed text-[#4a5228]">
                    {step.description}
                  </p>
                  <span className="mt-5 block h-px w-8 bg-gradient-to-r from-secondary to-primary transition-all duration-300 group-hover:w-14" />
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-20">
        <AnimateIn className="relative mx-auto max-w-6xl overflow-hidden rounded-xl border border-primary/12 bg-[#38471B] sm:rounded-2xl px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="font-heading text-2xl font-light text-white sm:text-3xl">
            Every second matters
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-light text-white/75">
            Request medical transport now, or learn how Bull Wave Rides protects every trip.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={ambulanceHref}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-destructive px-6 text-sm font-semibold text-white hover:bg-destructive/90"
            >
              Request SOS
            </Link>
            <Link
              href={ROUTES.safety}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 px-6 text-sm font-semibold text-white hover:bg-white/10"
            >
              Safety
            </Link>
          </div>
        </AnimateIn>
      </section>

      <LandingFooter />
    </MarketingPageShell>
  );
}
