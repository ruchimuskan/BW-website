"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bike,
  Car,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GlowButton } from "@/components/landing/GlowButton";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { ROUTES } from "@/constants/routes";
import { useProtectedHref } from "@/hooks/useProtectedHref";
import { cn } from "@/lib/utils";

const options = [
  {
    icon: Bike,
    title: "Bike taxi",
    description:
      "Beat traffic for short city hops — fast, affordable, tracked live.",
    accent: "from-[#B8D926]/12 via-[#C8E84A]/8 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Auto",
    description:
      "Everyday auto rides with upfront fares and verified captains.",
    accent: "from-[#C8E84A]/15 via-[#B8D926]/8 to-transparent",
  },
  {
    icon: Car,
    title: "Cab",
    description:
      "Comfortable cabs for meetings, airport runs, and longer trips.",
    accent: "from-[#38471B]/10 via-[#B8D926]/12 to-transparent",
  },
] as const;

const assurances = [
  {
    icon: MapPinned,
    title: "Live trip tracking",
    description: "Follow every mile from request to drop-off.",
  },
  {
    icon: ShieldCheck,
    title: "Safety built in",
    description: "Verified captains, trip share, and SOS support.",
  },
] as const;

const alsoAvailable = [
  {
    href: ROUTES.sos,
    label: "Emergency SOS ambulance",
    detail: "Medical transport when seconds matter.",
  },
  {
    href: ROUTES.corporateRegister,
    label: "BW Rides for Business",
    detail: "Employee travel billed to your company.",
  },
  {
    href: ROUTES.safety,
    label: "Safety tools",
    detail: "How we protect riders and captains.",
  },
] as const;

export function RideView() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const bookPath = useProtectedHref(ROUTES.home);

  return (
    <MarketingPageShell>
      <LandingHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-primary/10 bg-[#12081c] px-4 pt-14 pb-12 text-white sm:px-6 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_10%_0%,rgba(200,232,74,0.32),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_100%,rgba(184,217,38,0.4),transparent_50%)]"
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#C8E84A]/20 blur-3xl"
            animate={
              reduceMotion ? undefined : { scale: [1, 1.15, 1], x: [0, 18, 0] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 9, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[#B8D926]/35 blur-3xl"
            animate={
              reduceMotion ? undefined : { opacity: [0.4, 0.75, 0.4] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 7, repeat: Infinity, ease: "easeInOut" }
            }
          />

          <div className="relative mx-auto max-w-6xl">
            <AnimateIn>
              <p className="text-[10px] font-semibold tracking-[0.24em] text-[#D4E88A] uppercase sm:text-[11px]">
                Book a ride
              </p>
              <div className="mt-3 h-px w-14 bg-gradient-to-r from-[#C8E84A] via-[#D4E88A] to-transparent" />
              <h1 className="mt-4 max-w-3xl font-heading text-[1.85rem] font-light leading-[1.12] tracking-tight min-[400px]:text-[2.2rem] sm:text-4xl lg:text-[2.75rem]">
                Request a ride anytime —
                <span className="mt-1 block font-semibold text-[#D4E88A] sm:mt-1.5">
                  bike, auto, or cab.
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-[14px] font-light leading-relaxed text-white/72 sm:mt-5 sm:text-base">
                Book BW Rides online or in the app. See upfront fares, get
                matched with verified captains, and track your trip live across
                India.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
                <GlowButton onClick={() => router.push(bookPath)}>
                  Book now
                  <span aria-hidden>→</span>
                </GlowButton>
                <GlowButton
                  tone="glass"
                  className="!normal-case !tracking-wide"
                  onClick={() => router.push(ROUTES.download)}
                >
                  Download the app
                </GlowButton>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* Travel options */}
        <section className="relative px-4 py-12 sm:px-6 sm:py-14 lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(200,232,74,0.1),transparent_55%)]"
          />

          <div className="relative mx-auto max-w-6xl">
            <AnimateIn>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#C8E84A] uppercase sm:text-[11px]">
                Mobility
              </p>
              <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-transparent" />
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#38471B] sm:text-3xl">
                Choose how you travel
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[#4a5228] sm:text-[15px]">
                One platform for everyday city mobility — with the same safety
                standards on every trip.
              </p>
            </AnimateIn>

            <Stagger className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {options.map((item, index) => {
                const Icon = item.icon;
                return (
                  <StaggerItem key={item.title} index={index}>
                    <motion.button
                      type="button"
                      onClick={() => router.push(bookPath)}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { y: -6, transition: { duration: 0.22 } }
                      }
                      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                      className={cn(
                        "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#dce8a8]/70 bg-white p-5 text-left shadow-[0_14px_36px_-28px_rgba(40,54,20,0.35)] transition-shadow duration-300 sm:p-6",
                        "hover:border-[#C8E84A]/45 hover:shadow-[0_24px_48px_-24px_rgba(184,217,38,0.45)]",
                      )}
                    >
                      <div
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-300 group-hover:opacity-100",
                          item.accent,
                        )}
                      />
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-transparent opacity-70 transition-opacity group-hover:opacity-100"
                      />

                      <div className="relative flex items-start justify-between gap-3">
                        <motion.div
                          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#dce8a8] bg-white text-[#B8D926] shadow-sm transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-[#B8D926] group-hover:to-[#C8E84A] group-hover:text-white"
                          whileHover={
                            reduceMotion
                              ? undefined
                              : { rotate: [-2, 2, 0], transition: { duration: 0.35 } }
                          }
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.7} />
                        </motion.div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eef5d4] text-[#B8D926]/50 transition-all duration-300 group-hover:border-transparent group-hover:bg-[#B8D926] group-hover:text-white">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>

                      <h3 className="relative mt-5 font-heading text-lg font-semibold text-[#38471B] transition-colors group-hover:text-[#B8D926]">
                        {item.title}
                      </h3>
                      <p className="relative mt-2 flex-1 text-sm font-light leading-relaxed text-[#4a5228]">
                        {item.description}
                      </p>
                      <span className="relative mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-[#B8D926] uppercase">
                        Book
                        <span
                          aria-hidden
                          className="h-px w-5 bg-current opacity-40 transition-all duration-300 group-hover:w-8 group-hover:opacity-90"
                        />
                      </span>
                    </motion.button>
                  </StaggerItem>
                );
              })}
            </Stagger>

            <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2">
              {assurances.map((item, index) => {
                const Icon = item.icon;
                return (
                  <StaggerItem key={item.title} index={index}>
                    <motion.div
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { y: -3, transition: { duration: 0.2 } }
                      }
                      className="group flex gap-3.5 rounded-2xl border border-[#eef5d4] bg-white/90 p-4 shadow-sm backdrop-blur-sm transition hover:border-[#C8E84A]/40 hover:shadow-[0_16px_36px_-22px_rgba(184,217,38,0.4)] sm:p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f9e4] text-[#B8D926] transition group-hover:bg-gradient-to-br group-hover:from-[#B8D926] group-hover:to-[#C8E84A] group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#B8D926]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm font-light text-[#4a5228]">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </Stagger>

            <AnimateIn className="relative mt-10 overflow-hidden rounded-2xl border border-[#dce8a8]/70 bg-gradient-to-br from-white via-[#ffffff] to-[#f4f9e4] p-5 shadow-[0_18px_40px_-28px_rgba(40,54,20,0.35)] sm:mt-12 sm:p-8">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#C8E84A]/15 blur-3xl"
                animate={
                  reduceMotion ? undefined : { scale: [1, 1.2, 1], opacity: [0.5, 0.85, 0.5] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }
              />
              <h2 className="relative font-heading text-xl font-semibold text-[#38471B] sm:text-2xl">
                Also available
              </h2>
              <ul className="relative mt-5 space-y-3">
                {alsoAvailable.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-start justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-[#eef5d4] hover:bg-white"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-[#B8D926] underline-offset-2 group-hover:underline">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-sm font-light text-[#4a5228]">
                          {item.detail}
                        </span>
                      </span>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#C8E84A]/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#B8D926]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </AnimateIn>
          </div>
        </section>
      </main>

      <LandingFooter />
    </MarketingPageShell>
  );
}
