"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { AnimateIn } from "@/components/motion";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { type ServiceItem } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { getProtectedPath } from "@/lib/auth-session";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

/** One lime-on-white studio set so every card matches in quality and theme. */
const STUDIO = {
  bike: "/images/pic-14.png",
  auto: "/images/pic-5.png",
  rickshaw: "/images/services/e-rickshaw.png",
  cab: "/images/services/cab-lime.png",
  ambulance: "/images/services/ambulance-studio.png",
} as const;

function cardHref(route: string) {
  if (
    route.startsWith(ROUTES.start) ||
    route === ROUTES.ambulance ||
    route.includes("ambulance")
  ) {
    return getProtectedPath(route);
  }
  return route;
}

function isAmbulanceService(service: ServiceItem): boolean {
  const key = `${service.name} ${service.route}`.toLowerCase();
  return (
    key.includes("ambulance") ||
    key.includes("emergency") ||
    /\bbls\b/.test(key) ||
    /\bals\b/.test(key) ||
    key.includes("patient")
  );
}

function studioImage(service: ServiceItem): string {
  const key = `${service.name} ${service.route} ${service.image}`.toLowerCase();
  if (key.includes("ambulance") || key.includes("emergency")) return STUDIO.ambulance;
  if (key.includes("bike")) return STUDIO.bike;
  if (key.includes("rickshaw") || key.includes("e-rick")) return STUDIO.rickshaw;
  if (key.includes("auto")) return STUDIO.auto;
  return STUDIO.cab;
}

function shortLabel(name: string): string {
  const key = name.toLowerCase();
  if (key.includes("ambulance") || key.includes("emergency") || key.includes("patient")) {
    return "Ambulance";
  }
  if (key.includes("bike")) return "Bike";
  if (key.includes("rickshaw") || key.includes("e-rick")) return "E-Rickshaw";
  if (key.includes("auto")) return "Auto";
  if (key.includes("xl")) return "Cab XL";
  return "Cab";
}

function shortDescription(service: ServiceItem): string {
  const key = service.name.toLowerCase();
  if (key.includes("ambulance") || key.includes("emergency") || key.includes("patient")) {
    return "Emergency medical transport";
  }
  if (key.includes("bike")) return "Fast city hops";
  if (key.includes("rickshaw") || key.includes("e-rick")) return "Local electric hops";
  if (key.includes("auto")) return "Everyday rides";
  if (service.description?.trim()) return service.description.trim();
  return "Comfort on the go";
}

const WAVE_NODES = [
  { x: 100, y: 128 },
  { x: 300, y: 228 },
  { x: 500, y: 128 },
  { x: 700, y: 228 },
  { x: 900, y: 128 },
] as const;

const WAVE_PATH =
  "M100 128 C 180 128 220 228 300 228 C 380 228 420 128 500 128 C 580 128 620 228 700 228 C 780 228 820 128 900 128";

const RING = [
  "border-[#C6E31A] text-[#5a7a12]",
  "border-[#9BB820] text-[#4d6a10]",
  "border-[#111411] text-[#111411]",
  "border-[#C6E31A] text-[#5a7a12]",
  "border-[#c62828] text-[#c62828]",
] as const;

interface LandingServicesSectionProps {
  services: ServiceItem[];
  isLoading?: boolean;
}

export function LandingServicesSection({
  services,
  isLoading = false,
}: LandingServicesSectionProps) {
  const router = useRouter();

  const cards = useMemo(() => {
    if (services.length === 0) return [] as ServiceItem[];
    return services;
  }, [services]);

  const selectedKey = useMemo(() => cards.map((s) => s.name).join("|"), [cards]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedKey]);

  const goToService = (service: ServiceItem, index: number) => {
    setActiveIndex(index);
    const href = isAmbulanceService(service)
      ? getProtectedPath(ROUTES.ambulanceBook)
      : cardHref(service.route);
    startTransition(() => {
      router.push(href);
    });
  };

  const showSkeleton = isLoading && services.length === 0;

  return (
    <section
      id="services"
      className="relative z-10 isolate overflow-x-clip bg-[#f6f7f1] py-8 sm:py-12 md:py-16 lg:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(96%,48rem)] -translate-x-1/2 rounded-full bg-[#C6E31A]/18 blur-3xl"
      />

      <div className={landingShell("relative z-20")}>
        <AnimateIn>
          <header className="mx-auto max-w-2xl px-1 text-center">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#5a7a12] sm:text-xs sm:tracking-[0.28em]">
              Services
            </p>
            <div className="mx-auto mt-2.5 h-0.5 w-12 rounded-full bg-[#C6E31A] sm:mt-3 sm:w-14" />
            <h2 className="mt-3 font-heading text-[1.35rem] font-semibold tracking-tight text-[#111411] sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.4rem] lg:leading-[1.12]">
              Choose how you move
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#5a6330] sm:mt-3 sm:text-base lg:text-lg">
              Bike, auto, e-rickshaw, cab, and book{" "}
              <span className="font-semibold text-[#c62828]">Ambulance</span>{" "}
              free — same lime fleet, booked in moments.
            </p>
          </header>
        </AnimateIn>

        <div className="mt-6 sm:mt-8 lg:mt-10">
          {showSkeleton ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`service-skeleton-${index}`}
                  className="mx-auto aspect-square w-full max-w-[10rem] animate-pulse rounded-full bg-[#eef2e0] sm:max-w-[16rem]"
                  aria-hidden
                />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <p className="mx-auto max-w-md rounded-2xl border border-[#e8ecd8] bg-white px-4 py-8 text-center text-sm text-[#5A6158]">
              Ride types will appear here once they are published on the server.
            </p>
          ) : (
            <>
              <div className="relative mx-auto hidden aspect-[1000/360] w-full md:block">
                <ServiceWave
                  cards={cards}
                  activeIndex={activeIndex}
                  onHover={setActiveIndex}
                  onBook={goToService}
                />
              </div>

              <div className="md:hidden">
                <MobileRidePicker cards={cards} onBook={goToService} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function MobileRidePicker({
  cards,
  onBook,
}: {
  cards: ServiceItem[];
  onBook: (service: ServiceItem, index: number) => void;
}) {
  const [picked, setPicked] = useState(0);
  const current = cards[picked] ?? cards[0];
  if (!current) return null;
  const currentAmbulance = isAmbulanceService(current);

  return (
    <div className="mx-auto max-w-md">
      <ul className="overflow-hidden rounded-2xl border border-[#d7e3a4] bg-white">
        {cards.map((service, i) => {
          const ambulance = isAmbulanceService(service);
          const selected = i === picked;
          const title = shortLabel(service.name);
          return (
            <li key={`${service.name}-row`} className="border-b border-[#eef2e0] last:border-b-0">
              <button
                type="button"
                onClick={() => setPicked(i)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left",
                  selected && "bg-[#f4f8dc]",
                )}
              >
                <span
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                    RING[i] ?? RING[0],
                  )}
                >
                  <span className="relative h-8 w-8">
                    <ResilientImage
                      src={studioImage(service)}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain"
                      fallbackSrc={studioImage(service)}
                    />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block font-heading text-[15px] font-semibold text-[#111411]",
                      ambulance && "text-[#c62828]",
                    )}
                  >
                    {ambulance ? "Ambulance" : title}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-[#5a6330]">
                    {shortDescription(service)}
                  </span>
                </span>
                <span
                  className={cn(
                    "h-4 w-4 shrink-0 rounded-full border-2",
                    selected
                      ? ambulance
                        ? "border-[#c62828] bg-[#c62828]"
                        : "border-[#111411] bg-[#C6E31A]"
                      : "border-[#c5d0a8] bg-white",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => onBook(current, picked)}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-1.5 rounded-full py-3 text-[15px] font-semibold",
          currentAmbulance
            ? "bg-[#c62828] text-white"
            : "bg-[#C6E31A] text-[#111411]",
        )}
      >
        {currentAmbulance
          ? "Book Ambulance free"
          : `Book ${shortLabel(current.name)}`}
        <ArrowUpRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ServiceWave({
  cards,
  activeIndex,
  onHover,
  onBook,
  compact = false,
  orbWidth = "15.2%",
}: {
  cards: ServiceItem[];
  activeIndex: number;
  onHover: (index: number) => void;
  onBook: (service: ServiceItem, index: number) => void;
  compact?: boolean;
  orbWidth?: string;
}) {
  return (
    <>
      <svg
        viewBox="0 0 1000 360"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={WAVE_PATH}
          fill="none"
          stroke="#d7e3a4"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={WAVE_PATH}
          fill="none"
          stroke="#C6E31A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {WAVE_NODES.map((node, i) =>
          i < WAVE_NODES.length - 1 ? (
            <circle
              key={`dot-${i}`}
              cx={(node.x + WAVE_NODES[i + 1]!.x) / 2}
              cy={(node.y + WAVE_NODES[i + 1]!.y) / 2}
              r="7"
              fill="#C6E31A"
              stroke="#111411"
              strokeWidth="1.5"
            />
          ) : null,
        )}
      </svg>

      {cards.map((service, index) => {
        const node = WAVE_NODES[index];
        if (!node) return null;
        return (
          <div
            key={`${service.name}-${service.route}-wave`}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(node.x / 1000) * 100}%`,
              top: `${(node.y / 360) * 100}%`,
              width: orbWidth,
            }}
          >
            <ServiceOrb
              service={service}
              index={index}
              selected={activeIndex === index}
              onHover={() => onHover(index)}
              onBook={() => onBook(service, index)}
              compact={compact}
            />
          </div>
        );
      })}
    </>
  );
}

function ServiceOrb({
  service,
  index,
  selected,
  onHover,
  onBook,
  compact = false,
}: {
  service: ServiceItem;
  index: number;
  selected: boolean;
  onHover: () => void;
  onBook: () => void;
  compact?: boolean;
}) {
  const isAmbulance = isAmbulanceService(service);
  const imageSrc = studioImage(service);
  const title = shortLabel(service.name);
  const description = shortDescription(service);
  const order = String(index + 1).padStart(2, "0");
  const ring = RING[index] ?? RING[0];

  return (
    <button
      type="button"
      aria-label={isAmbulance ? "Book Ambulance free" : `Book ${title}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onBook}
      className={cn(
        "group relative aspect-square w-full cursor-pointer overflow-hidden rounded-full border-[3px] bg-white text-center",
        "shadow-[0_18px_40px_-22px_rgba(17,20,17,0.4)] transition-transform duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E31A] focus-visible:ring-offset-2",
        ring,
        selected ? "z-20 scale-[1.03] shadow-[0_22px_48px_-18px_rgba(198,227,26,0.55)]" : "hover:scale-[1.02]",
      )}
    >
      <span
        className={cn(
          "flex h-full flex-col items-center justify-center",
          compact ? "px-3 py-3" : "px-4 py-5 sm:px-5",
        )}
      >
        <span
          className={cn(
            "relative mb-1 w-[72%] shrink-0",
            compact ? "h-[30%]" : "h-[34%] sm:h-[36%]",
          )}
        >
          <ResilientImage
            src={imageSrc}
            alt={`BW Rides ${title}`}
            fill
            priority={!isAmbulance && index < 2}
            quality={NEXT_IMAGE_QUALITY.high}
            sizes="(max-width: 767px) 46vw, 16vw"
            className="object-contain object-center transition-transform duration-500 group-hover:scale-105"
            fallbackSrc={imageSrc}
          />
        </span>
        <span
          className={cn(
            "font-heading font-bold tracking-[0.08em] uppercase",
            compact ? "text-[10px]" : "text-[11px] sm:text-xs",
          )}
        >
          Step {order}
        </span>
        <span
          className={cn(
            "mt-0.5 font-heading font-semibold tracking-tight text-[#111411]",
            compact ? "text-[0.85rem]" : "text-[0.95rem] sm:text-[1.05rem]",
          )}
        >
          {compact || !isAmbulance ? (
            title
          ) : (
            <>
              Book <span className="text-[#c62828]">Ambulance</span>
            </>
          )}
        </span>
        {!compact ? (
          <span className="mt-1 line-clamp-2 max-w-[18ch] px-1 text-[10px] leading-snug text-[#5a6330] lg:text-[11px]">
            {description}
          </span>
        ) : null}
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-semibold",
            compact ? "mt-0.5 text-[10px]" : "mt-1.5 text-[11px] sm:text-xs",
            isAmbulance ? "text-[#c62828]" : "text-[#5a7a12]",
          )}
        >
          {isAmbulance ? "Book free" : "Book now"}
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </span>
    </button>
  );
}
