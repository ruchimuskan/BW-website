"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Clock3,
  Leaf,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { PremiumSectionBackdrop } from "@/components/landing/PremiumSectionBackdrop";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { landingPillars } from "@/constants/services";
import { transitions } from "@/lib/motion";

const icons = [Clock3, MapPinned, ShieldCheck, Wallet, Sparkles, Leaf] as const;

export function LandingPillarsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-5 md:px-6 lg:px-8 sm:py-20 lg:py-24">
      <PremiumSectionBackdrop opacity={0.09} side="center" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-[10%] bottom-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-[90rem]">
        <SectionHeading
          align="center"
          eyebrow="Why riders choose us"
          title="Luxury in every detail"
          description="Designed for calm, confident travel — from the first tap to the final drop."
        />

        <Stagger className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {landingPillars.map((pillar, index) => {
            const Icon = icons[index] ?? Sparkles;
            return (
              <StaggerItem key={pillar.title} index={index}>
                <motion.article
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -8, transition: transitions.hover }
                  }
                  className="bw-pro-card group relative h-full overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-white via-white to-muted/60 p-6 shadow-[0_18px_40px_-28px_rgba(184,217,38,0.35)] sm:rounded-2xl sm:p-7"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-secondary/15 blur-2xl opacity-70 transition-opacity group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="wavego-luxury-shine absolute inset-y-0 w-1/3" />
                  </div>
                  <motion.div
                    whileHover={reduceMotion ? undefined : { rotate: [0, -6, 0] }}
                    transition={{ duration: 0.45 }}
                    className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </motion.div>
                  <h3 className="relative mt-5 font-heading text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {pillar.title}
                  </h3>
                  <p className="relative mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                  <span className="relative mt-5 block h-px w-10 origin-left bg-gradient-to-r from-secondary to-primary transition-all duration-300 group-hover:w-20" />
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
