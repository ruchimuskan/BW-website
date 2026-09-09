"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { BRAND_PHOTOS, brandPhotoFit } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { type ServiceItem } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { getProtectedPath } from "@/lib/auth-session";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

function cardHref(route: string) {
  if (route.startsWith(ROUTES.start) || route === ROUTES.ambulance) {
    return getProtectedPath(route);
  }
  return route;
}

function serviceFallback(name: string): string {
  const key = name.toLowerCase();
  if (key.includes("bike")) return BRAND_PHOTOS.studioBike;
  if (key.includes("rickshaw") || key.includes("e-rick")) {
    return "/images/services/e-rickshaw.png";
  }
  if (key.includes("auto")) return "/images/services/auto.png";
  if (key.includes("ambulance")) return BRAND_PHOTOS.ambulance;
  return "/images/services/cab-lime.png";
}

function shortLabel(name: string): string {
  const key = name.toLowerCase();
  if (key.includes("bike")) return "Bike";
  if (key.includes("rickshaw") || key.includes("e-rick")) return "E-Rickshaw";
  if (key.includes("auto")) return "Auto";
  if (key.includes("ambulance")) return "Ambulance";
  if (key.includes("economy") || key.includes("cab") || key.includes("car") || key.includes("sedan")) {
    return key.includes("xl") ? "Cab XL" : "Cab";
  }
  return name;
}

function defaultSelectedIndex(cards: ServiceItem[]): number {
  const cab = cards.findIndex((s) => {
    const k = s.name.toLowerCase();
    return k.includes("cab") || k.includes("economy") || k.includes("car");
  });
  return cab >= 0 ? cab : 0;
}

interface LandingServicesSectionProps {
  services: ServiceItem[];
  isLoading?: boolean;
}

export function LandingServicesSection({
  services,
  isLoading = false,
}: LandingServicesSectionProps) {
  const router = useRouter();
  const cards = services;
  const selectedKey = useMemo(
    () => cards.map((s) => s.name).join("|"),
    [cards],
  );
  const [activeIndex, setActiveIndex] = useState(() => defaultSelectedIndex(cards));

  useEffect(() => {
    setActiveIndex(defaultSelectedIndex(cards));
  }, [selectedKey, cards]);

  return (
    <section
      id="services"
      className="relative z-10 isolate overflow-hidden bg-[#f7f8f3] py-12 sm:py-16 lg:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-[min(90%,42rem)] -translate-x-1/2 rounded-full bg-[#C6E31A]/16 blur-3xl"
      />

      <div className={landingShell("relative z-20")}>
        <AnimateIn>
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#5a7a12] sm:text-xs sm:tracking-[0.28em]">
              Services
            </p>
            <div className="mx-auto mt-2.5 h-0.5 w-12 rounded-full bg-[#C6E31A] sm:mt-3 sm:w-14" />
            <h2 className="mt-3 font-heading text-[1.55rem] font-semibold tracking-tight text-[#111411] sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
              Choose how you move
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#5a6330] sm:mt-3 sm:text-base lg:text-lg">
              Bike, auto, cab, and ambulance SOS — book in moments.
            </p>
          </header>
        </AnimateIn>

        <div className="mt-9 sm:mt-11 lg:mt-12">
          {isLoading ? (
            <div className="mx-auto grid max-w-5xl grid-cols-1 justify-items-center gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`service-skeleton-${index}`}
                  className="w-full max-w-[17.5rem] overflow-hidden rounded-[1.5rem] border border-[#e4e9d8] bg-white"
                  aria-hidden
                >
                  <div className="aspect-[4/3] animate-pulse bg-[#eef2e0]" />
                  <div className="space-y-2 px-4 py-4">
                    <div className="h-4 w-2/5 animate-pulse rounded bg-[#dce8a8]/70" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-[#dce8a8]/45" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Stagger
              className={cn(
                "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pt-1",
                "px-[max(1rem,calc(50%-8.5rem))]",
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                "sm:mx-auto sm:max-w-5xl sm:flex-wrap sm:justify-center sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0",
              )}
            >
              {cards.map((service, index) => {
                const isSos = service.name.toLowerCase().includes("ambulance");
                const selected = activeIndex === index;
                const fit = brandPhotoFit(service.image);
                const title = shortLabel(service.name);

                return (
                  <StaggerItem
                    key={`${service.name}-${service.route}`}
                    index={index}
                    className="w-[min(78vw,17.25rem)] shrink-0 snap-center sm:w-[min(100%,16.75rem)] sm:max-w-[16.75rem]"
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => {
                        setActiveIndex(index);
                        startTransition(() => {
                          router.push(cardHref(service.route));
                        });
                      }}
                      className={cn(
                        "group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] text-left",
                        "border transition-[transform,box-shadow,background-color,border-color] duration-300",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6E31A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f3]",
                        "active:scale-[0.99]",
                        selected
                          ? "border-[#C6E31A] bg-[#C6E31A] shadow-[0_20px_44px_-18px_rgba(198,227,26,0.9)]"
                          : "border-[#e4e9d8] bg-white shadow-[0_14px_32px_-20px_rgba(17,20,17,0.35)] hover:border-[#C6E31A]/60 hover:-translate-y-0.5",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                          selected
                            ? "bg-[#111411] text-white"
                            : "border border-[#d5dcc0] bg-white text-transparent",
                        )}
                        aria-hidden
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>

                      <div
                        className={cn(
                          "relative isolate aspect-[4/3] w-full shrink-0 overflow-hidden",
                          selected ? "bg-[#C6E31A]" : "bg-white",
                        )}
                      >
                        <ResilientImage
                          src={service.image}
                          alt={title}
                          fill
                          quality={NEXT_IMAGE_QUALITY.high}
                          sizes="(max-width: 639px) 78vw, 268px"
                          className={cn(
                            "select-none transition-transform duration-500 group-hover:scale-[1.03]",
                            fit === "contain"
                              ? "object-contain object-center p-5 sm:p-6"
                              : "object-cover object-center",
                          )}
                          fallbackSrc={serviceFallback(service.name)}
                        />
                      </div>

                      <div className="flex flex-1 flex-col px-4 pb-4 pt-0.5">
                        <h3 className="font-heading text-[1.05rem] font-semibold tracking-tight text-[#111411] sm:text-lg">
                          {title}
                        </h3>
                        <p
                          className={cn(
                            "mt-1 line-clamp-2 min-h-[2.4em] text-[12px] leading-relaxed sm:text-[13px]",
                            selected ? "text-[#1B3A22]/80" : "text-[#5a6330]",
                          )}
                        >
                          {service.description}
                        </p>
                        <p
                          className={cn(
                            "mt-3 text-sm font-semibold tracking-tight sm:text-[15px]",
                            selected ? "text-[#111411]" : "text-[#5a7a12]",
                          )}
                        >
                          {isSos ? "SOS ready" : "Book now"}
                          <span aria-hidden className="ml-1">
                            →
                          </span>
                        </p>
                      </div>
                    </button>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </div>

        {!isLoading && cards.length > 1 ? (
          <div className="mt-4 flex justify-center gap-1.5 sm:hidden" aria-hidden>
            {cards.map((service, index) => (
              <span
                key={`dot-${service.name}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  activeIndex === index ? "w-5 bg-[#C6E31A]" : "w-1.5 bg-[#c5ccb4]",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
