"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { brandPhotoFit } from "@/constants/brand-images";
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
  if (key.includes("bike")) return "/images/pic-14.png";
  if (key.includes("rickshaw") || key.includes("e-rick")) {
    return "/images/services/e-rickshaw.png";
  }
  if (key.includes("auto")) return "/images/services/auto.png";
  if (key.includes("ambulance")) return "/images/services/ambulance-cutout.png";
  return "/images/services/cab-lime.png";
}

/** Prefer studio cutouts so all four cards share the same white-background look. */
function serviceDisplayImage(service: ServiceItem): string {
  const key = `${service.name} ${service.image}`.toLowerCase();
  if (key.includes("ambulance")) return "/images/services/ambulance-cutout.png";
  if (key.includes("bike")) {
    return service.image.includes("pic-14") || service.image.includes("bike")
      ? service.image
      : "/images/pic-14.png";
  }
  if (key.includes("rickshaw") || key.includes("e-rick")) {
    return "/images/services/e-rickshaw.png";
  }
  if (key.includes("auto")) return "/images/services/auto.png";
  if (
    key.includes("cab") ||
    key.includes("economy") ||
    key.includes("car") ||
    key.includes("sedan")
  ) {
    return service.image.includes("cab-lime") || service.image.includes("services/")
      ? service.image
      : "/images/services/cab-lime.png";
  }
  return service.image;
}

function shortLabel(name: string): string {
  const key = name.toLowerCase();
  if (key.includes("bike")) return "Bike";
  if (key.includes("rickshaw") || key.includes("e-rick")) return "E-Rickshaw";
  if (key.includes("auto")) return "Auto";
  if (key.includes("ambulance")) return "Ambulance";
  if (
    key.includes("economy") ||
    key.includes("cab") ||
    key.includes("car") ||
    key.includes("sedan")
  ) {
    return key.includes("xl") ? "Cab XL" : "Cab";
  }
  return name;
}

function shortDescription(service: ServiceItem): string {
  const key = service.name.toLowerCase();
  if (key.includes("ambulance")) return "Book for free";
  if (service.description?.trim()) return service.description.trim();
  if (key.includes("bike")) return "Fast city hops";
  if (key.includes("auto")) return "Everyday rides";
  return "Comfort on the go";
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
  const cards = services.slice(0, 4);
  const selectedKey = useMemo(
    () => cards.map((s) => s.name).join("|"),
    [cards],
  );
  const [activeIndex, setActiveIndex] = useState(() =>
    defaultSelectedIndex(cards),
  );

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
              Bike, auto, cab, and book ambulance for free — book in moments.
            </p>
          </header>
        </AnimateIn>

        <div className="mt-9 sm:mt-11 lg:mt-12">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`service-skeleton-${index}`}
                  className="w-full overflow-hidden rounded-[1.35rem] border border-[#e4e9d8] bg-white sm:rounded-[1.5rem]"
                  aria-hidden
                >
                  <div className="aspect-[4/3] animate-pulse bg-[#eef2e0]" />
                  <div className="space-y-2 px-3 py-3 sm:px-4 sm:py-4">
                    <div className="h-4 w-2/5 animate-pulse rounded bg-[#dce8a8]/70" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-[#dce8a8]/45" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {cards.map((service, index) => {
                const isAmbulance = service.name
                  .toLowerCase()
                  .includes("ambulance");
                const selected = activeIndex === index;
                const imageSrc = serviceDisplayImage(service);
                const fit = brandPhotoFit(imageSrc);
                const title = shortLabel(service.name);
                const description = shortDescription(service);

                return (
                  <StaggerItem
                    key={`${service.name}-${service.route}`}
                    index={index}
                    className="min-w-0"
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
                        "group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] text-left sm:rounded-[1.5rem]",
                        "border bg-white transition-[transform,box-shadow,background-color,border-color] duration-300",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f3]",
                        "active:scale-[0.99]",
                        isAmbulance
                          ? selected
                            ? "border-[#ef4444]/55 shadow-[0_18px_40px_-22px_rgba(185,28,28,0.4)] focus-visible:ring-[#ef4444]/45"
                            : "border-[#f0c7c2] shadow-[0_14px_32px_-20px_rgba(17,20,17,0.35)] hover:-translate-y-0.5 hover:border-[#ef4444]/45 focus-visible:ring-[#ef4444]/40"
                          : selected
                            ? "border-[#C6E31A] shadow-[0_18px_40px_-22px_rgba(198,227,26,0.55)] ring-1 ring-[#C6E31A]/35 focus-visible:ring-[#C6E31A]"
                            : "border-[#e4e9d8] shadow-[0_14px_32px_-20px_rgba(17,20,17,0.35)] hover:-translate-y-0.5 hover:border-[#C6E31A]/60 focus-visible:ring-[#C6E31A]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute right-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors sm:right-3 sm:top-3 sm:h-7 sm:w-7",
                          selected
                            ? isAmbulance
                              ? "bg-[#b91c1c] text-white"
                              : "bg-[#111411] text-white"
                            : "border border-[#d5dcc0] bg-white text-transparent",
                        )}
                        aria-hidden
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>

                      <div className="relative isolate aspect-[4/3] w-full shrink-0 overflow-hidden bg-transparent">
                        <ResilientImage
                          src={imageSrc}
                          alt={title}
                          fill
                          quality={NEXT_IMAGE_QUALITY.high}
                          sizes="(max-width: 1023px) 45vw, 22vw"
                          className={cn(
                            "select-none transition-transform duration-500 group-hover:scale-[1.03]",
                            fit === "contain"
                              ? "object-contain object-center p-3.5 sm:p-5 lg:p-6"
                              : "object-cover object-center",
                          )}
                          fallbackSrc={serviceFallback(service.name)}
                        />
                      </div>

                      <div className="flex flex-1 flex-col px-3 pb-3.5 pt-0.5 sm:px-4 sm:pb-4">
                        <h3
                          className={cn(
                            "font-heading text-[0.98rem] font-semibold tracking-tight sm:text-[1.05rem] lg:text-lg",
                            isAmbulance ? "text-[#b91c1c]" : "text-[#111411]",
                          )}
                        >
                          {title}
                        </h3>
                        <p
                          className={cn(
                            "mt-1 line-clamp-2 min-h-[2.4em] text-[11.5px] leading-relaxed sm:text-[13px]",
                            isAmbulance ? "text-[#dc2626]/85" : "text-[#5a6330]",
                          )}
                        >
                          {description}
                        </p>
                        <p
                          className={cn(
                            "mt-2.5 text-[13px] font-semibold tracking-tight sm:mt-3 sm:text-sm lg:text-[15px]",
                            isAmbulance ? "text-[#dc2626]" : "text-[#5a7a12]",
                          )}
                        >
                          {isAmbulance ? "Book free" : "Book now"}
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
      </div>
    </section>
  );
}
