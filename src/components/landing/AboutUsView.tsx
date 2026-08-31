"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import { useRouter } from "next/navigation";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  Ambulance,
  Gauge,
  Package,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { GlowButton } from "@/components/landing/GlowButton";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { ROUTES } from "@/constants/routes";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import {
  landingAssets,
  landingStats,
} from "@/constants/services";
import { getProtectedPath } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

const differentiators = [
  {
    icon: Gauge,
    title: "Faster through the city",
    description:
      "Captains who know peak-hour routes — so you reach on time, not eventually.",
  },
  {
    icon: Package,
    title: "Parcels, handled with care",
    description:
      "Same-city deliveries with live tracking and secure handoffs from pickup to door.",
  },
  {
    icon: Ambulance,
    title: "SOS when seconds matter",
    description:
      "Verified medical transport in one tap — ambulance support built into the same app.",
  },
  {
    icon: ShieldCheck,
    title: "Safety, by design",
    description:
      "Verified captains, trip sharing, and transparent fares you see before you ride.",
  },
] as const;

const missionPoints = [
  {
    title: "Rides for every moment",
    body: "Bike, auto, and cab options with live tracking and clear fares.",
  },
  {
    title: "Built for Indian cities",
    body: "Dense coverage, late-night reliability, and routes that match how people really move.",
  },
  {
    title: "One app, full care",
    body: "Parcels and emergency ambulance sit beside everyday rides — no switching apps.",
  },
] as const;

type ParsedStat =
  | { kind: "static"; text: string }
  | { kind: "count"; prefix: string; target: number; suffix: string };

function parseStatValue(value: string): ParsedStat {
  const match = value.match(/^([^0-9]*)(\d+)(.*)$/);
  if (!match) return { kind: "static", text: value };
  const [, prefix, digits, suffix] = match;
  if (suffix.includes("×") || suffix.includes("x") || prefix.includes("×")) {
    return { kind: "static", text: value };
  }
  return {
    kind: "count",
    prefix,
    target: Number(digits),
    suffix,
  };
}

function AboutStatCard({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px", amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;

    const parsed = parseStatValue(value);
    if (reduceMotion || parsed.kind !== "count") {
      setDisplay(value);
      return;
    }

    setDisplay(`${parsed.prefix}0${parsed.suffix}`);
    const target = parsed.target;
    const duration = 1200;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(
        `${parsed.prefix}${Math.round(target * eased)}${parsed.suffix}`,
      );
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value]);

  return (
    <div
      ref={ref}
      className="px-3 py-6 text-center sm:px-5 sm:py-8"
      style={{
        transitionDelay: reduceMotion ? "0ms" : `${index * 80}ms`,
      }}
    >
      <p
        className="font-heading text-[1.65rem] font-light tracking-tight text-white sm:text-3xl lg:text-4xl"
        aria-label={value}
      >
        <span className="bg-gradient-to-b from-[#eef5d4] via-[#C8E84A] to-[#D4E88A] bg-clip-text text-transparent">
          {display}
        </span>
      </p>
      <p className="mt-2 text-[10px] font-medium tracking-[0.22em] text-white/60 uppercase sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

export function AboutUsView() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  return (
    <MarketingPageShell>
      <LandingHeader />

      {/* Hero — one clear composition */}
      <section className="relative overflow-hidden bw-hero-atmosphere">

        <div className="relative z-10 mx-auto grid w-full min-w-0 max-w-[min(100%,76rem)] items-center gap-8 px-3 py-10 sm:gap-10 sm:px-4 sm:py-14 md:px-5 lg:grid-cols-2 lg:gap-12 lg:px-6 lg:py-16 xl:max-w-[min(100%,82rem)] xl:gap-16 xl:px-7 2xl:max-w-[min(100%,88rem)]">
          <div className="min-w-0 order-2 lg:order-1">
            <AnimateIn>
              <p className="font-heading text-3xl font-semibold tracking-tight text-[#38471B] sm:text-4xl lg:text-[2.75rem]">
                Bull Wave Rides
              </p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.24em] text-[#6B7344] uppercase sm:text-[11px]">
                About us
              </p>
              <div className="mt-3 h-px w-14 bg-gradient-to-r from-[#B8D926] to-transparent" />
            </AnimateIn>

            <AnimateIn delay={0.06}>
              <h1 className="mt-4 font-heading text-[1.55rem] font-light leading-snug tracking-tight text-[#283614] min-[400px]:text-[1.75rem] sm:text-3xl lg:text-[2.15rem]">
                India&apos;s trusted{" "}
                <span className="font-semibold text-[#B8D926]">
                  mobility platform
                </span>
              </h1>
            </AnimateIn>

            <AnimateIn delay={0.1}>
              <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-[#4a5228] sm:mt-4 sm:text-base">
                We are not an option — we are a choice. Millions of riders trust
                Bull Wave Rides for safe, transparently priced journeys from bike
                to emergency ambulance.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.14}>
              <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center">
                <GlowButton
                  className="w-full sm:w-auto"
                  onClick={() => router.push(`${ROUTES.landing}#book`)}
                >
                  Book a ride
                  <span aria-hidden>→</span>
                </GlowButton>
                <GlowButton
                  tone="outline"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    router.push(getProtectedPath(ROUTES.ambulanceBook))
                  }
                >
                  Ambulance SOS
                </GlowButton>
              </div>
            </AnimateIn>
          </div>

          {/* Hero visual — single stable card, inset caption (no floating overlap) */}
          <AnimateIn
            direction="right"
            delay={0.08}
            className="relative order-1 mx-auto w-full max-w-lg lg:order-2 lg:max-w-none"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#dce8a8]/60 bg-[#1a1f16] shadow-[0_28px_56px_-28px_rgba(40,54,20,0.5)] sm:rounded-3xl">
              <ResilientImage
                src={BRAND_PHOTOS.captainsHero}
                alt="Bull Wave Rides captain driving at night"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className={cn(
                  BRAND_PHOTO_CLASS,
                  "object-[center_42%]",
                )}
                fallbackSrc={BRAND_PHOTOS.captainsHeroPng}
              />
              <BrandImageOverlay variant="card" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-[#111411]/90 via-[#111411]/45 to-transparent px-3 pb-3 pt-12 sm:px-4 sm:pb-4 sm:pt-14">
                <span className="inline-flex max-w-[min(100%,14rem)] rounded-full border border-white/25 bg-[#38471B]/80 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-md sm:text-[11px]">
                  Premium · Safe · On time
                </span>

                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white/85 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.55)] sm:h-16 sm:w-16 sm:rounded-2xl">
                  <ResilientImage
                    src={landingAssets.cityBike}
                    alt="Bull Wave Rides bike taxi"
                    fill
                    sizes="64px"
                    className={cn(BRAND_PHOTO_CLASS, "object-center")}
                    fallbackSrc="/images/pic-14.png"
                  />
                  <BrandImageOverlay variant="subtle" />
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-[#eef5d4] bg-white px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <AnimateIn className="max-w-2xl">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-[#7a8450] uppercase sm:text-[11px]">
              Our mission
            </p>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#B8D926] to-transparent" />
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#38471B] sm:text-3xl">
              Calm, confident mobility for every rider
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
              Bull Wave Rides brings premium city travel, secure deliveries, and
              emergency care into one polished experience — designed for how
              India moves today.
            </p>
          </AnimateIn>

          <Stagger className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {missionPoints.map((point, index) => (
              <StaggerItem key={point.title} index={index}>
                <article className="h-full rounded-2xl border border-[#eef5d4] bg-gradient-to-b from-[#ffffff] to-white p-5 transition hover:border-[#dce8a8] hover:shadow-[0_16px_36px_-24px_rgba(56,71,27,0.18)] sm:p-6">
                  <span className="font-heading text-xs tracking-[0.16em] text-[#6B7344]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-heading text-lg font-semibold text-[#38471B]">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-[#4a5228]">
                    {point.body}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <AnimateIn className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#283614] via-[#38471B] to-[#4a5824] shadow-[0_28px_56px_-28px_rgba(32,42,16,0.65)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_15%_0%,rgba(200,232,74,0.28),transparent_55%)]"
            />
            <div className="relative grid grid-cols-2 lg:grid-cols-4">
              {landingStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    "relative",
                    index % 2 === 1 && "border-l border-white/10",
                    index >= 2 && "border-t border-white/10 lg:border-t-0",
                    index > 0 && "lg:border-l lg:border-white/10",
                  )}
                >
                  <AboutStatCard
                    value={stat.value}
                    label={stat.label}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* Difference */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <AnimateIn className="max-w-2xl">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-[#6B7344] uppercase sm:text-[11px]">
              What sets us apart
            </p>
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#B8D926] to-transparent" />
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#38471B] sm:text-3xl">
              What makes us different?
            </h2>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
              One platform for every city moment — polished rides, secure
              parcels, and emergency care without switching apps.
            </p>
          </AnimateIn>

          <Stagger className="mt-8 grid grid-cols-1 gap-3.5 min-[520px]:grid-cols-2 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {differentiators.map((item, index) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title} index={index}>
                  <motion.article
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -4, transition: { duration: 0.2 } }
                    }
                    className="group h-full rounded-2xl border border-[#eef5d4] bg-white p-5 shadow-sm transition hover:border-[#C8E84A]/40 hover:shadow-[0_18px_40px_-24px_rgba(184,217,38,0.4)] sm:p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dce8a8] bg-[#ffffff] text-[#38471B] transition group-hover:border-[#B8D926] group-hover:bg-[#B8D926] group-hover:text-[#1F2A10]">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <span className="mt-4 block font-heading text-xs tracking-[0.16em] text-[#6B7344]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1.5 font-heading text-base font-semibold tracking-tight text-[#38471B] sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-[#4a5228]">
                      {item.description}
                    </p>
                  </motion.article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ResilientImage
            src={landingAssets.slideFleet}
            alt=""
            fill
            className={BRAND_PHOTO_CLASS}
            sizes="100vw"
            aria-hidden
          />
          <BrandImageOverlay variant="premium" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#38471B]/92 via-[#38471B]/80 to-[#283614]/88" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-16 lg:py-20">
          <AnimateIn>
            <p className="text-[10px] font-semibold tracking-[0.24em] text-[#D4E88A]/90 uppercase sm:text-[11px]">
              Grow with us
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Partner with Bull Wave Rides
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-light leading-relaxed text-white/85 sm:mt-4 sm:text-base">
              Drive with us as a captain, or bring premium mobility to your
              workplace with Bull Wave Rides Business.
            </p>
            <div className="mt-7 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center">
              <GlowButton
                tone="light"
                className="px-8"
                onClick={() => router.push(ROUTES.captains)}
              >
                Become a captain
              </GlowButton>
              <GlowButton
                tone="glass"
                className="px-8"
                onClick={() => router.push(ROUTES.corporateRegister)}
              >
                Bull Wave Business
                <span aria-hidden>→</span>
              </GlowButton>
            </div>
          </AnimateIn>
        </div>
      </section>

      <LandingFooter />
    </MarketingPageShell>
  );
}
