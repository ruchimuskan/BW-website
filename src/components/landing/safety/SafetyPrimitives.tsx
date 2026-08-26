"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Minus, Plus, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { getProtectedPath } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

export const SAFETY_BRAND = "#B8D926";
export const SAFETY_MUTED = "#4a5228";

export function SafetyAtmosphere({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_8%_0%,rgba(200,232,74,0.16),transparent_58%),radial-gradient(ellipse_55%_45%_at_92%_75%,rgba(184,217,38,0.12),transparent_52%)]" />
      <div className="wavego-luxury-grid absolute inset-0 opacity-[0.35]" />
      <div className="safety-orb safety-orb-a absolute -left-16 top-[12%] h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
      <div className="safety-orb safety-orb-b absolute -right-12 bottom-[8%] h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
    </div>
  );
}

export function SafetyEyebrow({ children }: { children: ReactNode }) {
  return (
  <div className="flex items-center gap-3">
    <span className="inline-flex items-center rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] uppercase text-secondary shadow-sm backdrop-blur-sm sm:text-xs">
      {children}
    </span>
    <span className="h-px w-10 bg-gradient-to-r from-secondary via-primary to-transparent sm:w-14" />
  </div>
  );
}

export function SafetyHeroStats() {
  const stats = [
    { label: "24×7", sub: "Safety support" },
    { label: "Verified", sub: "Captain checks" },
    { label: "Live", sub: "Trip tracking" },
  ];

  return (
    <div className="mt-8 flex flex-wrap gap-2 sm:mt-9 sm:gap-3">
      {stats.map((stat) => (
        <div
          key={stat.sub}
          className="rounded-2xl border border-primary/12 bg-white/75 px-4 py-2.5 shadow-[0_12px_32px_-22px_rgba(184,217,38,0.35)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5"
        >
          <p className="font-heading text-sm font-semibold tracking-tight text-primary sm:text-base">
            {stat.label}
          </p>
          <p className="text-[11px] font-light text-[#4a5228] sm:text-xs">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}

type CollageImage = {
  src: string;
  alt: string;
  className: string;
};

export function SafetyImageCollage({ images }: { images: readonly CollageImage[] }) {
  return (
    <div className="relative mx-auto h-56 w-full max-w-md sm:h-64 lg:max-w-none lg:h-[18rem]">
      <div
        aria-hidden
        className="absolute inset-x-[8%] bottom-2 top-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent blur-2xl"
      />
      {images.map((img, i) => (
        <div
          key={`${img.src}-${i}`}
          className={cn(
            "safety-float absolute",
            img.className,
            i === 1 ? "safety-float-delay" : "",
          )}
        >
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/60 bg-[#f7fbe8] shadow-[0_22px_50px_-28px_rgba(184,217,38,0.55)] ring-1 ring-primary/10 transition-transform duration-500 hover:scale-[1.03]">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 1}
              quality={NEXT_IMAGE_QUALITY.medium}
              className={BRAND_PHOTO_CLASS}
              sizes="(max-width: 640px) 144px, 180px"
            />
            <BrandImageOverlay variant="card" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SafetyOffsetImage({
  src,
  alt,
  align = "left",
}: {
  src: string;
  alt: string;
  align?: "left" | "right";
}) {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <span
        aria-hidden
        className={cn(
          "absolute h-[calc(100%-0.75rem)] w-[calc(100%-0.75rem)] rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/15",
          align === "left"
            ? "left-3 top-3 sm:left-5 sm:top-5"
            : "bottom-0 right-0 translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4",
        )}
      />
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-primary/15 bg-[#f7fbe8] shadow-[0_24px_56px_-30px_rgba(184,217,38,0.5)] ring-1 ring-white/50">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          quality={NEXT_IMAGE_QUALITY.high}
          className={BRAND_PHOTO_CLASS}
          sizes="(max-width: 1024px) 100vw, 480px"
        />
        <BrandImageOverlay variant="default" />
      </div>
    </div>
  );
}

export function SafetyMeasureCell({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex h-full flex-col p-5 sm:p-7 lg:p-8">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-[#ffffff] text-primary shadow-sm transition-all duration-300 group-hover:border-primary/35 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_12px_28px_-16px_rgba(184,217,38,0.55)] sm:h-12 sm:w-12">
        <Icon
          className="h-5 w-5 shrink-0 text-primary transition-colors duration-300 group-hover:text-white"
          strokeWidth={1.7}
        />
      </span>
      <h3
        className="mt-4 font-heading text-lg font-semibold tracking-tight sm:text-xl"
        style={{ color: SAFETY_BRAND }}
      >
        {title}
      </h3>
      <p className="mt-2 text-[13px] font-light leading-relaxed text-[#4a5228] sm:text-sm">
        {description}
      </p>
    </div>
  );
}

export function SafetyWayForward({
  title,
  description,
  linkLabel,
  href = ROUTES.profileHelp,
}: {
  title: string;
  description: string;
  linkLabel: string;
  href?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-[#38471B] px-6 py-10 sm:rounded-3xl sm:px-10 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_100%_0%,rgba(200,232,74,0.32),transparent_55%),radial-gradient(ellipse_50%_60%_at_0%_100%,rgba(184,217,38,0.25),transparent_50%)]"
      />
      <div className="wavego-luxury-grid absolute inset-0 opacity-20" aria-hidden />
      <div className="relative">
        <ShieldCheck className="h-9 w-9 text-secondary" strokeWidth={1.5} />
        <h2 className="mt-4 font-heading text-2xl font-light tracking-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-white/82 sm:text-base">
          {description}
        </p>
        <Link
          href={getProtectedPath(href)}
          className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-white backdrop-blur-sm transition-all hover:border-white/35 hover:bg-white/15 sm:text-sm"
        >
          {linkLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

type FaqItem = { id: string; question: string; answer: string };

export function SafetyFaqAccordion({
  items,
  limit,
}: {
  items: readonly FaqItem[];
  limit?: number;
}) {
  const list = limit ? items.slice(0, limit) : items;
  const [openId, setOpenId] = useState<string | null>(list[0]?.id ?? null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-3">
      {list.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-2xl border transition-all duration-300",
              isOpen
                ? "border-primary/25 bg-white shadow-[0_18px_48px_-28px_rgba(184,217,38,0.35)]"
                : "border-primary/12 bg-white/90 hover:border-primary/20 hover:bg-white",
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`safety-faq-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
            >
              <span
                className="font-heading text-base font-semibold tracking-tight sm:text-lg"
                style={{ color: SAFETY_BRAND }}
              >
                {item.question}
              </span>
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isOpen
                    ? "border-primary/30 bg-primary text-white"
                    : "border-primary/15 bg-[#ffffff] text-primary",
                )}
              >
                {isOpen ? (
                  <Minus className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2} />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`safety-faq-${item.id}`}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[13px] font-light leading-relaxed text-[#4a5228] sm:px-6 sm:pb-6 sm:text-sm">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function SafetySectionBand({
  children,
  className,
  tinted = false,
  id,
  "aria-labelledby": ariaLabelledBy,
}: {
  children: ReactNode;
  className?: string;
  tinted?: boolean;
  id?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "relative scroll-mt-28 px-4 py-14 sm:px-6 sm:py-20 lg:py-24",
        tinted && "border-t border-primary/10 bg-white",
        className,
      )}
    >
      {children}
    </section>
  );
}
