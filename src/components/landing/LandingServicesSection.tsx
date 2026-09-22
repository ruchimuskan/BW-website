"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { brandPhotoFit } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { landingServices, type ServiceItem } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { getProtectedPath } from "@/lib/auth-session";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

const AMBULANCE_IMAGE = "/images/services/ambulance-studio.png";

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
    key.includes("patient transport") ||
    key.includes("patient-transport")
  );
}

function serviceFallback(name: string): string {
  const key = name.toLowerCase();
  if (key.includes("bike")) return "/images/pic-14.png";
  if (key.includes("rickshaw") || key.includes("e-rick")) {
    return "/images/services/e-rickshaw.png";
  }
  if (key.includes("auto")) return "/images/gallery/shoot-auto.png";
  if (key.includes("ambulance")) return AMBULANCE_IMAGE;
  if (key.includes("premium") || key.includes("luxury")) {
    return "/images/landing/brand/lime-cab.png";
  }
  if (key.includes("xl") || key.includes("suv")) {
    return "/images/services/car.webp";
  }
  return "/images/services/cab-lime.png";
}

/** Studio cutouts — same white-background look for every card including ambulance. */
function serviceDisplayImage(service: ServiceItem): string {
  const key = `${service.name} ${service.image}`.toLowerCase();
  if (key.includes("ambulance")) return AMBULANCE_IMAGE;
  if (key.includes("bike")) {
    return service.image.includes("pic-14") || service.image.includes("bike")
      ? service.image
      : "/images/pic-14.png";
  }
  if (key.includes("rickshaw") || key.includes("e-rick")) {
    return "/images/services/e-rickshaw.png";
  }
  if (/(^|[\s_-])auto([\s_-]|$)/.test(key) || key === "auto") {
    return service.image.includes("shoot-auto") || service.image.includes("gallery/")
      ? service.image
      : "/images/gallery/shoot-auto.png";
  }
  if (key.includes("premium") || key.includes("luxury")) {
    return service.image.includes("lime-cab")
      ? service.image
      : "/images/landing/brand/lime-cab.png";
  }
  if (key.includes("xl") || key.includes("suv")) {
    return service.image.includes("car.webp") || service.image.includes("car.")
      ? service.image
      : "/images/services/car.webp";
  }
  if (
    key.includes("cab") ||
    key.includes("economy") ||
    key.includes("car") ||
    key.includes("sedan")
  ) {
    return service.image.includes("cab-lime") ||
      service.image.includes("services/") ||
      service.image.startsWith("http")
      ? service.image
      : "/images/services/cab-lime.png";
  }
  return service.image;
}

function shortLabel(name: string): string {
  const key = name.toLowerCase();
  if (
    key.includes("ambulance") ||
    key.includes("emergency") ||
    /\bbls\b/.test(key) ||
    /\bals\b/.test(key) ||
    key.includes("patient")
  ) {
    return "Ambulance";
  }
  if (key.includes("bike")) return "Bike";
  if (key.includes("rickshaw") || key.includes("e-rick")) return "E-Rickshaw";
  if (key.includes("auto")) return "Auto";
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
  if (
    key.includes("ambulance") ||
    key.includes("emergency") ||
    /\bbls\b/.test(key) ||
    /\bals\b/.test(key) ||
    key.includes("patient")
  ) {
    return "Emergency medical transport";
  }
  if (service.description?.trim()) return service.description.trim();
  if (key.includes("bike")) return "Fast city hops";
  if (key.includes("rickshaw") || key.includes("e-rick")) {
    return "Local electric hops";
  }
  if (key.includes("auto")) return "Everyday rides";
  return "Comfort on the go";
}

function ServiceTitle({
  title,
  isAmbulance,
}: {
  title: string;
  isAmbulance: boolean;
}) {
  if (!isAmbulance) {
    return (
      <h3 className="min-w-0 truncate font-heading text-[0.95rem] font-semibold tracking-tight text-[#111411] sm:text-[1.05rem] lg:text-lg">
        {title}
      </h3>
    );
  }

  return (
    <h3 className="min-w-0 font-heading text-[0.92rem] font-semibold leading-snug tracking-tight text-[#111411] sm:text-[1.05rem] lg:text-lg">
      Book <span className="text-[#c62828]">Ambulance</span> free
    </h3>
  );
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

  /** Always keep Ambulance as the last card with studio art. */
  const cards = useMemo(() => {
    const source = services.length > 0 ? services : landingServices;
    const list = [...source];
    const withoutAmbulance = list.filter((s) => !isAmbulanceService(s));
    const ambulance =
      list.find(isAmbulanceService) ??
      ({
        name: "Ambulance",
        description: "Book Ambulance free",
        image: AMBULANCE_IMAGE,
        route: ROUTES.ambulanceBook,
      } satisfies ServiceItem);

    return [
      ...withoutAmbulance.slice(0, 4),
      {
        ...ambulance,
        name: "Ambulance",
        image: AMBULANCE_IMAGE,
        route:
          ambulance.route.includes("ambulance")
            ? ambulance.route
            : ROUTES.ambulanceBook,
      },
    ];
  }, [services]);

  const selectedKey = useMemo(
    () => cards.map((s) => s.name).join("|"),
    [cards],
  );
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(-1);
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
      className="relative z-10 isolate overflow-hidden bg-[#f7f8f3] py-11 sm:py-14 md:py-16 lg:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-[min(92%,42rem)] -translate-x-1/2 rounded-full bg-[#C6E31A]/16 blur-3xl"
      />

      <div className={landingShell("relative z-20")}>
        <AnimateIn>
          <header className="mx-auto max-w-2xl px-1 text-center">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#5a7a12] sm:text-xs sm:tracking-[0.28em]">
              Services
            </p>
            <div className="mx-auto mt-2.5 h-0.5 w-12 rounded-full bg-[#C6E31A] sm:mt-3 sm:w-14" />
            <h2 className="mt-3 font-heading text-[1.45rem] font-semibold tracking-tight text-[#111411] sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
              Choose how you move
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#5a6330] sm:mt-3 sm:text-base lg:text-lg">
              Bike, auto, e-rickshaw, cab, and book{" "}
              <span className="font-semibold text-[#c62828]">Ambulance</span>{" "}
              free — book in moments.
            </p>
          </header>
        </AnimateIn>

        <div className="mt-8 sm:mt-10 lg:mt-12">
          {showSkeleton ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`service-skeleton-${index}`}
                  className="w-full overflow-hidden rounded-[1.25rem] border border-[#e4e9d8] bg-white sm:rounded-[1.5rem]"
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
            <Stagger className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-4">
              {cards.map((service, index) => {
                const isAmbulance = isAmbulanceService(service);
                const selected = activeIndex === index;
                const imageSrc = serviceDisplayImage(service);
                const fit = brandPhotoFit(imageSrc);
                const title = shortLabel(service.name);
                const description = shortDescription(service);

                return (
                  <StaggerItem
                    key={`${service.name}-${service.route}-${index}`}
                    index={index}
                    className="min-w-0"
                  >
                    <button
                      type="button"
                      aria-label={
                        isAmbulance
                          ? "Book Ambulance free"
                          : `Book ${title}`
                      }
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => goToService(service, index)}
                      className={cn(
                        "group relative flex h-full w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[1.25rem] text-left sm:rounded-[1.5rem]",
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
                          "absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors sm:right-3 sm:top-3 sm:h-7 sm:w-7",
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

                      <div className="relative isolate aspect-[4/3] w-full shrink-0 overflow-hidden bg-white">
                        <ResilientImage
                          src={imageSrc}
                          alt={
                            isAmbulance
                              ? "BW Rides ambulance"
                              : title
                          }
                          fill
                          priority={index < 5}
                          quality={NEXT_IMAGE_QUALITY.high}
                          sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 18vw"
                          className={cn(
                            "select-none transition-transform duration-500 group-hover:scale-[1.03]",
                            fit === "contain"
                              ? "object-contain object-center p-3 sm:p-4 lg:p-5"
                              : "object-cover object-center",
                          )}
                          fallbackSrc={serviceFallback(service.name)}
                        />
                      </div>

                      <div className="flex flex-1 flex-col px-3 pb-3.5 pt-0.5 sm:px-4 sm:pb-4">
                        <ServiceTitle
                          title={title}
                          isAmbulance={isAmbulance}
                        />
                        <p className="mt-1 line-clamp-2 min-h-[2.2em] text-[11.5px] leading-relaxed text-[#5a6330] sm:text-[13px]">
                          {description}
                        </p>
                        <p className="mt-2 text-[13px] font-semibold tracking-tight text-[#5a7a12] sm:mt-2.5 sm:text-sm lg:text-[15px]">
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
