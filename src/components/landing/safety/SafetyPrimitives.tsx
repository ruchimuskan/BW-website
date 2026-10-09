"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronRight, ShieldCheck, Siren } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ResilientImage } from "@/components/brand/ResilientImage";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import { ROUTES } from "@/constants/routes";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { getProtectedPath } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { landingShell } from "@/lib/landing-shell";

export const SAFETY_BRAND = "#C6E31A";
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_8%_0%,rgba(198,227,26,0.12),transparent_58%),radial-gradient(ellipse_55%_45%_at_92%_75%,rgba(56,71,27,0.06),transparent_52%)]" />
      <div className="wavego-luxury-grid absolute inset-0 opacity-[0.22]" />
      <div className="safety-orb safety-orb-a absolute -left-16 top-[12%] h-56 w-56 rounded-full bg-[#C6E31A]/14 blur-3xl" />
      <div className="safety-orb safety-orb-b absolute -right-12 bottom-[8%] h-64 w-64 rounded-full bg-[#38471B]/10 blur-3xl" />
    </div>
  );
}

export function SafetyEyebrow({ children }: { children: ReactNode }) {
  return (
  <div className="flex items-center gap-3">
    <span className="inline-flex items-center rounded-full border border-[#e8eed8] bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] uppercase text-[#6B7344] shadow-sm backdrop-blur-sm sm:text-xs">
      {children}
    </span>
    <span className="h-px w-10 bg-gradient-to-r from-[#C6E31A] to-transparent sm:w-14" />
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
    <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3">
      {stats.map((stat) => (
        <div
          key={stat.sub}
          className="min-w-0 rounded-2xl border border-[#e8edd8] bg-white px-1.5 py-2.5 text-center shadow-[0_10px_24px_-20px_rgba(56,71,27,0.35)] sm:px-4 sm:py-3 sm:text-left"
        >
          <p className="font-heading text-[12px] font-semibold tracking-tight text-[#38471B] sm:text-sm md:text-base">
            {stat.label}
          </p>
          <p className="mt-0.5 text-[9px] leading-tight text-[#5A6158] sm:text-[11px]">
            {stat.sub}
          </p>
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
  /** When set, the tile navigates on click (e.g. ambulance booking). */
  href?: string;
};

const SNAKE_BLURB: Record<string, string> = {
  "Street Cab": "Verified captains and live tracking on every city trip.",
  Ambulance: "Medical transport you can choose and book for free.",
  "Bike Taxi": "Quick hops with the same safety tools on every ride.",
  Captain: "Trained partners with checks before they take a trip.",
};

const SNAKE_VB = { w: 1000, h: 820 } as const;
/** One continuous rail through the three circle centres. */
const SNAKE_PATH =
  "M 145 155 H 855 C 940 155 940 410 855 410 H 145 C 60 410 60 665 145 665 H 710";
const SNAKE_NODES = [
  { x: 145, y: 155, pocket: "below-right" as const },
  { x: 855, y: 410, pocket: "above-left" as const },
  { x: 145, y: 665, pocket: "above-right" as const },
];

function SnakeVehicleFrame({
  ambulance,
  children,
}: {
  ambulance: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "relative flex h-full w-full items-center justify-center rounded-full bg-white p-[3px] shadow-[0_18px_36px_-16px_rgba(17,20,17,0.42)] ring-[4px]",
        ambulance ? "ring-[#c62828]" : "ring-[#C6E31A]",
      )}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-full bg-white">
        {children}
      </span>
    </span>
  );
}

function SnakeVehicle({
  img,
  index,
  onOpen,
  sizeClassName,
}: {
  img: CollageImage;
  index: number;
  onOpen: (img: CollageImage) => void;
  sizeClassName: string;
}) {
  const ambulance = /ambulance/i.test(`${img.label} ${img.alt}`);
  const photo = (
    <SnakeVehicleFrame ambulance={ambulance}>
      <ResilientImage
        src={img.src}
        alt={img.alt}
        fill
        priority={index < 2}
        quality={NEXT_IMAGE_QUALITY.high}
        className={cn(
          "object-contain object-center p-2 drop-shadow-[0_8px_14px_rgba(17,20,17,0.2)]",
          img.imageClassName,
        )}
        sizes="(min-width: 1024px) 148px, 112px"
        fallbackSrc={img.fallbackSrc ?? BRAND_PHOTOS.streetCab}
      />
    </SnakeVehicleFrame>
  );

  if (!img.href) {
    return <span className={cn("relative block overflow-visible", sizeClassName)}>{photo}</span>;
  }
  return (
    <button
      type="button"
      aria-label={img.alt}
      className={cn("relative block overflow-visible", sizeClassName)}
      onClick={() => onOpen(img)}
    >
      {photo}
    </button>
  );
}

function SnakeCopy({
  img,
  pocket,
}: {
  img: CollageImage;
  pocket: (typeof SNAKE_NODES)[number]["pocket"];
}) {
  const ambulance = /ambulance/i.test(`${img.label} ${img.alt}`);
  const title = img.label ?? img.alt;
  const blurb = SNAKE_BLURB[title] ?? img.alt;
  return (
    <div
      className={cn(
        "absolute w-[8.75rem] rounded-xl bg-[#f7f8f3] px-2 py-1.5 shadow-sm lg:w-[10.5rem]",
        pocket === "below-right" && "left-[calc(100%+0.5rem)] top-full mt-1 text-left",
        pocket === "above-left" &&
          "right-[calc(100%+0.5rem)] bottom-full mb-1 text-right",
        pocket === "above-right" &&
          "left-[calc(100%+0.5rem)] bottom-full mb-1 text-left",
      )}
    >
      <p
        className={cn(
          "font-heading text-[12.5px] font-extrabold tracking-tight uppercase lg:text-[15px]",
          ambulance ? "text-[#c62828]" : "text-[#111411]",
        )}
      >
        {title}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-[#5a6330] lg:text-[12.5px]">
        {blurb}
      </p>
    </div>
  );
}

export function SafetyImageCollage({
  images,
  className,
}: {
  images: readonly CollageImage[];
  className?: string;
}) {
  const router = useRouter();
  const items = images.slice(0, 3);

  const open = (img: CollageImage) => {
    if (img.href) router.push(getProtectedPath(img.href));
  };

  return (
    <div className={cn("relative mx-auto w-full min-w-0 overflow-visible", className)}>
      <div className="relative mx-auto hidden aspect-[1000/820] w-full max-w-[40rem] overflow-visible md:block lg:max-w-none">
        <svg
          viewBox={`0 0 ${SNAKE_VB.w} ${SNAKE_VB.h}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={SNAKE_PATH}
            fill="none"
            stroke="#C6E31A"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={SNAKE_PATH}
            fill="none"
            stroke="#1A1F16"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {items.map((img, index) => {
          const node = SNAKE_NODES[index];
          if (!node) return null;
          return (
            <div
              key={`${img.src}-snake`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(node.x / SNAKE_VB.w) * 100}%`,
                top: `${(node.y / SNAKE_VB.h) * 100}%`,
              }}
            >
              <SnakeVehicle
                img={img}
                index={index}
                onOpen={open}
                sizeClassName="h-[4.85rem] w-[4.85rem] lg:h-[5.65rem] lg:w-[5.65rem]"
              />
              <SnakeCopy img={img} pocket={node.pocket} />
            </div>
          );
        })}
      </div>

      <ol className="relative mx-auto max-w-sm overflow-visible px-1 py-2 md:hidden">
        <span
          aria-hidden
          className="absolute top-12 bottom-12 left-[calc(2.65rem-3.5px)] w-[7px] rounded-full bg-[#C6E31A]"
        />
        <span
          aria-hidden
          className="absolute top-12 bottom-12 left-[calc(2.65rem-1.25px)] w-[2.5px] rounded-full bg-[#1A1F16]"
        />
        {items.map((img, index) => {
          const ambulance = /ambulance/i.test(`${img.label} ${img.alt}`);
          const title = img.label ?? `Option ${index + 1}`;
          const blurb = SNAKE_BLURB[title] ?? img.alt;
          const vehicle = (
            <SnakeVehicleFrame ambulance={ambulance}>
              <ResilientImage
                src={img.src}
                alt=""
                fill
                sizes="88px"
                quality={NEXT_IMAGE_QUALITY.high}
                className="object-contain object-center p-2 drop-shadow-[0_6px_8px_rgba(17,20,17,0.16)]"
                fallbackSrc={
                  img.fallbackSrc ??
                  (ambulance ? BRAND_PHOTOS.ambulance : BRAND_PHOTOS.streetCab)
                }
              />
            </SnakeVehicleFrame>
          );
          return (
            <li
              key={`${img.src}-m`}
              className="relative mb-6 flex items-center gap-3 overflow-visible last:mb-0"
            >
              {img.href ? (
                <button
                  type="button"
                  aria-label={img.alt}
                  onClick={() => open(img)}
                  className="relative z-10 h-[5.25rem] w-[5.25rem] shrink-0 overflow-visible"
                >
                  {vehicle}
                </button>
              ) : (
                <span className="relative z-10 h-[5.25rem] w-[5.25rem] shrink-0 overflow-visible">
                  {vehicle}
                </span>
              )}
              <div className="min-w-0 flex-1 rounded-xl bg-[#f7f8f3]/95 px-1 py-0.5">
                <p
                  className={cn(
                    "font-heading text-[14px] font-extrabold tracking-tight uppercase",
                    ambulance ? "text-[#c62828]" : "text-[#111411]",
                  )}
                >
                  {title}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-[#5a6330]">
                  {blurb}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
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
    <figure className={cn("relative mx-auto w-full min-w-0 max-w-none sm:max-w-lg lg:max-w-none", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#C6E31A]/25 via-[#38471B]/5 to-transparent blur-2xl",
          align === "right" ? "translate-x-3" : "-translate-x-3",
        )}
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[#e8edd8] shadow-[0_24px_56px_-30px_rgba(56,71,27,0.4)] ring-1 ring-[#C6E31A]/25 sm:rounded-3xl",
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
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e8edd8] bg-[#f7f8f3] text-[#38471B] shadow-sm transition-all duration-300 group-hover:border-[#C6E31A] group-hover:bg-[#C6E31A] group-hover:text-[#111411] sm:h-12 sm:w-12">
        <Icon
          className="h-5 w-5 shrink-0 text-[#38471B] transition-colors duration-300 group-hover:text-[#111411]"
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
        <ShieldCheck className="h-9 w-9 text-white" strokeWidth={1.5} />
        <h2 className="mt-4 font-heading text-2xl font-light tracking-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-white/82 sm:text-base">
          {description}
        </p>
        <Link
          href={getProtectedPath(href)}
          className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/15 px-5 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-white shadow-[0_10px_24px_-16px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all hover:border-white/55 hover:bg-white/25 hover:text-white sm:text-sm"
        >
          {linkLabel}
          <ChevronRight className="h-4 w-4 text-white" />
        </Link>
      </div>
    </div>
  );
}

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  tag?: string;
};

const FAQ_FILTERS = ["All", "Ride", "Emergency", "Privacy", "Support"] as const;

export function SafetyFaqAccordion({
  items,
  limit,
}: {
  items: readonly FaqItem[];
  limit?: number;
}) {
  const source = useMemo(
    () => (limit ? items.slice(0, limit) : Array.from(items)),
    [items, limit],
  );
  const [filter, setFilter] = useState<(typeof FAQ_FILTERS)[number]>("All");
  const list = useMemo(
    () =>
      filter === "All"
        ? source
        : source.filter((item) => item.tag === filter),
    [filter, source],
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const applyFilter = (chip: (typeof FAQ_FILTERS)[number]) => {
    setFilter(chip);
    setOpenId(null);
  };

  return (
    <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:gap-14">
      <div className="lg:sticky lg:top-28">
        <p className="text-[10px] font-semibold tracking-[0.24em] text-[#5a7a12] uppercase sm:text-[11px]">
          Safety FAQ
        </p>
        <div className="mt-2.5 h-1 w-11 rounded-full bg-primary" />
        <h2
          id="safety-faq-heading"
          className="mt-3 font-heading text-[1.5rem] font-semibold tracking-tight text-[#111411] sm:text-3xl lg:text-[2.15rem] lg:leading-[1.15] bw-title"
        >
          Common safety
          <span className="mt-1 block text-primary">questions.</span>
        </h2>
        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#4a5228] sm:text-[15px]">
          Verification, trip share, SOS, and privacy — short answers before you ride.
        </p>

        <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {FAQ_FILTERS.map((chip) => {
            const active = filter === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => applyFilter(chip)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors sm:text-xs",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(198,227,26,0.9)]"
                    : "border border-primary/25 bg-white text-[#38471B] hover:border-primary/50 hover:bg-primary/10",
                )}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2.5 min-[420px]:flex-row lg:flex-col xl:flex-row">
          <Link
            href={getProtectedPath(ROUTES.sos)}
            className="inline-flex h-11 min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#38471B] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(56,71,27,0.5)] transition-colors hover:bg-[#2f3c17] hover:text-white"
          >
            <Siren className="h-4 w-4" strokeWidth={2} />
            Open SOS
          </Link>
          <Link
            href={getProtectedPath(ROUTES.profileHelp)}
            className="inline-flex h-11 min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-white px-4 text-sm font-semibold text-[#38471B] hover:bg-primary/15"
          >
            Help center
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:gap-2.5">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-primary/20 bg-white px-4 py-6 text-sm text-[#4a5228]">
            No questions in this topic yet.
          </p>
        ) : null}
        {list.map((item, index) => {
          const isOpen = openId === item.id;
          const number = String(index + 1).padStart(2, "0");
          const panelId = `safety-faq-${item.id}`;
          const buttonId = `safety-faq-btn-${item.id}`;
          return (
            <article
              key={item.id}
              className={cn(
                "overflow-hidden rounded-2xl border transition-all duration-300",
                isOpen
                  ? "border-primary bg-gradient-to-br from-[#f4f9dc] via-white to-white shadow-[0_16px_36px_-20px_rgba(198,227,26,0.55)]"
                  : "border-primary/18 bg-white hover:border-primary/45 hover:bg-[#fafdf4]",
              )}
            >
              <h3 className="m-0">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-2.5 px-3 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-heading text-[11px] font-bold tracking-wide sm:h-9 sm:w-9 sm:text-xs",
                      isOpen
                        ? "bg-primary text-primary-foreground"
                        : "bg-[#f4f8e6] text-[#38471B] ring-1 ring-primary/25",
                    )}
                  >
                    {number}
                  </span>
                  <span className="min-w-0 flex-1">
                    {item.tag ? (
                      <span className="mb-0.5 block text-[10px] font-semibold tracking-[0.16em] text-[#5a7a12] uppercase">
                        {item.tag}
                      </span>
                    ) : null}
                    <span className="font-heading text-[13.5px] font-semibold leading-snug tracking-tight text-[#111411] sm:text-[15px] md:text-base">
                      {item.question}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                      isOpen
                        ? "bg-primary text-primary-foreground"
                        : "bg-[#f4f8e6] text-[#38471B] ring-1 ring-primary/20",
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        isOpen && "rotate-180",
                      )}
                      strokeWidth={2.25}
                    />
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={reduceMotion ? false : { height: 0, opacity: 0.4 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0.4 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-primary/20 bg-[#f7fae8]/70 px-3 py-3 pl-[3.15rem] text-[13px] leading-relaxed text-[#38471B] sm:px-5 sm:py-4 sm:pl-[4.35rem] sm:text-sm">
                      {item.answer}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
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
        "relative scroll-mt-28 py-10 sm:py-14 lg:py-16 xl:py-20",
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
      <div className={landingShell("relative")}>{children}</div>
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

      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#dce8a8]/80 bg-gradient-to-br from-[#eef5d4] to-[#e2edb8] text-[#38471B] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-all duration-300 group-hover:border-[#C6E31A] group-hover:from-[#C6E31A] group-hover:to-[#D4F04A] group-hover:text-[#111411] sm:h-12 sm:w-12">
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
