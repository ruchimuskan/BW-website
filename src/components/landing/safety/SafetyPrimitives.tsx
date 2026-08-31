"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Minus, Plus, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ResilientImage } from "@/components/brand/ResilientImage";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import { ROUTES } from "@/constants/routes";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { getProtectedPath } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

export const SAFETY_BRAND = "#B8D926";
export const SAFETY_OLIVE = "#38471B";
export const SAFETY_MUTED = "#4a5228";
export const SAFETY_SAGE = "#6B7344";

export function SafetyAtmosphere({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_8%_0%,rgba(184,217,38,0.08),transparent_58%),radial-gradient(ellipse_55%_45%_at_92%_75%,rgba(56,71,27,0.05),transparent_52%)]" />
      <div className="wavego-luxury-grid absolute inset-0 opacity-[0.22]" />
      <div className="safety-orb safety-orb-a absolute -left-16 top-[12%] h-56 w-56 rounded-full bg-[#B8D926]/10 blur-3xl" />
      <div className="safety-orb safety-orb-b absolute -right-12 bottom-[8%] h-64 w-64 rounded-full bg-[#38471B]/08 blur-3xl" />
    </div>
  );
}

export function SafetyEyebrow({ children }: { children: ReactNode }) {
  return (
  <div className="flex items-center gap-3">
    <span className="inline-flex items-center rounded-full border border-[#e8eed8] bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] uppercase text-[#6B7344] shadow-sm backdrop-blur-sm sm:text-xs">
      {children}
    </span>
    <span className="h-px w-10 bg-gradient-to-r from-[#B8D926] to-transparent sm:w-14" />
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
  label?: string;
  featured?: boolean;
  imageClassName?: string;
  fallbackSrc?: string;
};

export function SafetyImageCollage({
  images,
  className,
}: {
  images: readonly CollageImage[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[min(100%,22rem)] sm:max-w-md md:max-w-lg lg:mx-0 lg:max-w-none",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/18 via-primary/6 to-transparent blur-3xl sm:-inset-6 sm:rounded-[2.5rem]"
      />

      <div className="relative rounded-[1.5rem] border border-primary/10 bg-white/50 p-2.5 shadow-[0_28px_60px_-34px_rgba(184,217,38,0.45)] backdrop-blur-sm sm:rounded-[1.75rem] sm:p-3.5 md:p-4 lg:rounded-[2rem] lg:p-5">
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
          {images.map((img, i) => {
            const isFeatured = img.featured ?? i === 1;

            return (
              <figure
                key={`${img.src}-${i}`}
                className={cn(
                  "safety-float min-w-0",
                  isFeatured && "relative z-10",
                  i === 1 ? "safety-float-delay" : "",
                )}
              >
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-xl border border-white/70 shadow-[0_18px_44px_-26px_rgba(184,217,38,0.5)] ring-1 ring-primary/10 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-24px_rgba(184,217,38,0.55)] sm:rounded-2xl",
                    isFeatured
                      ? "aspect-[3/4] origin-bottom scale-[1.05] sm:aspect-[4/5] sm:scale-[1.07] lg:scale-[1.08]"
                      : "aspect-[3/4] sm:aspect-[4/5]",
                    isFeatured && "ring-2 ring-primary/25",
                  )}
                >
                  <ResilientImage
                    src={img.src}
                    alt={img.alt}
                    fill
                    priority={isFeatured}
                    quality={NEXT_IMAGE_QUALITY.medium}
                    className={cn(
                      BRAND_PHOTO_CLASS,
                      "transition-transform duration-700 group-hover:scale-[1.03]",
                      img.imageClassName,
                    )}
                    sizes="(max-width: 640px) 28vw, (max-width: 1024px) 22vw, 200px"
                    fallbackSrc={img.fallbackSrc}
                  />
                  <BrandImageOverlay variant="card" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

                  {img.label ? (
                    <figcaption className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#111411]/80 via-[#111411]/35 to-transparent px-2 pb-2 pt-8 sm:px-2.5 sm:pb-2.5 sm:pt-10">
                      <span className="block truncate text-center text-[9px] font-semibold tracking-[0.14em] text-white uppercase sm:text-[10px]">
                        {img.label}
                      </span>
                    </figcaption>
                  ) : null}
                </div>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SafetyOffsetImage({
  src,
  alt,
  align = "left",
  imageClassName,
  fallbackSrc,
  aspectClassName = "aspect-[4/3]",
  className,
}: {
  src: string;
  alt: string;
  align?: "left" | "right";
  imageClassName?: string;
  fallbackSrc?: string;
  aspectClassName?: string;
  className?: string;
}) {
  return (
    <figure className={cn("relative mx-auto w-full max-w-sm lg:max-w-none", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/18 via-primary/5 to-transparent blur-2xl",
          align === "right" ? "translate-x-3" : "-translate-x-3",
        )}
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/60 shadow-[0_24px_56px_-30px_rgba(184,217,38,0.45)] ring-1 ring-primary/10 sm:rounded-3xl",
          aspectClassName,
        )}
      >
        <ResilientImage
          src={src}
          alt={alt}
          fill
          priority
          quality={NEXT_IMAGE_QUALITY.high}
          className={cn(BRAND_PHOTO_CLASS, imageClassName)}
          sizes="(max-width: 1024px) 100vw, 480px"
          fallbackSrc={fallbackSrc ?? BRAND_PHOTOS.streetCab}
        />
        <BrandImageOverlay variant="card" />
      </div>
    </figure>
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
        className="mt-4 font-heading text-lg font-semibold tracking-tight text-[#38471B] sm:text-xl"
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
                className="font-heading text-base font-semibold tracking-tight text-[#38471B] sm:text-lg"
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
  accent = false,
  id,
  "aria-labelledby": ariaLabelledBy,
}: {
  children: ReactNode;
  className?: string;
  tinted?: boolean;
  /** Soft lime wash — for feature grids and secondary bands */
  accent?: boolean;
  id?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "relative scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:py-20",
        tinted &&
          "border-t border-primary/10 bg-gradient-to-b from-[#f6f9ec] via-white to-white",
        accent &&
          "border-y border-primary/8 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(198,227,26,0.09),transparent_62%),linear-gradient(180deg,#fafdf4_0%,#ffffff_100%)]",
        className,
      )}
    >
      {accent ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(56,71,27,0.06)_1px,transparent_0)] [background-size:24px_24px]"
        />
      ) : null}
      <div className="relative">{children}</div>
    </section>
  );
}

export function SafetyFeatureCard({
  icon: Icon,
  title,
  description,
  index,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  bullets?: readonly string[];
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#dce8a8]/55 bg-gradient-to-br from-white via-white to-[#f4f8e6]/90 p-4 shadow-[0_14px_40px_-26px_rgba(56,71,27,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_52px_-26px_rgba(184,217,38,0.38)] sm:rounded-3xl sm:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="absolute right-4 top-3 font-heading text-4xl font-light leading-none text-primary/[0.12] sm:right-5 sm:top-4 sm:text-5xl"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#dce8a8]/80 bg-gradient-to-br from-[#eef5d4] to-[#e2edb8] text-[#38471B] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-all duration-300 group-hover:border-primary/40 group-hover:from-primary group-hover:to-[#9BB820] group-hover:text-white sm:h-12 sm:w-12">
        <Icon
          className="h-5 w-5 shrink-0 transition-colors duration-300"
          strokeWidth={1.75}
        />
      </span>

      <h3 className="relative mt-3 font-heading text-base font-semibold tracking-tight text-[#283614] sm:mt-4 sm:text-lg bw-title">
        {title}
      </h3>
      <p className="relative mt-1.5 text-[13px] font-light leading-relaxed text-[#4a5228] sm:text-sm">
        {description}
      </p>

      {bullets && bullets.length > 0 ? (
        <ul className="relative mt-2.5 space-y-1 border-t border-[#dce8a8]/50 pt-2.5 text-[12px] font-light text-[#4a5228] sm:text-[13px]">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <div
        aria-hidden
        className="relative mt-3 h-0.5 w-10 rounded-full bg-gradient-to-r from-primary/70 to-primary/10 transition-all duration-300 group-hover:w-14"
      />
    </article>
  );
}
