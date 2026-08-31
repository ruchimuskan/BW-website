"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { BRAND_IMAGE_SIZES, BRAND_PHOTOS } from "@/constants/brand-images";
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

interface LandingServicesSectionProps {
  services: ServiceItem[];
}

/**
 * Services + former Explore links in one grid. Dark olive band kept.
 */
export function LandingServicesSection({ services }: LandingServicesSectionProps) {
  const router = useRouter();
  const cards = services;

  return (
    <section
      id="services"
      className="relative z-10 isolate bw-dark-band bw-dark-band-glow py-12 sm:py-16 lg:py-20"
      style={{ color: "#ffffff" }}
    >
      <div className={landingShell("relative z-20")}>
        <AnimateIn>
          <header className="max-w-2xl">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#D4E88A] sm:text-xs sm:tracking-[0.28em]">
              Services
            </p>
            <div className="mt-2.5 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#C8E84A] to-transparent sm:mt-3 sm:w-14" />
            <h2 className="mt-3 font-heading text-[1.45rem] font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
              Choose how you move
            </h2>
            <p className="mt-2.5 max-w-xl text-[13px] font-normal leading-relaxed text-white/75 sm:mt-3 sm:text-base lg:text-lg">
              Bike, auto, cab, and ambulance SOS — book in moments.
            </p>
          </header>
        </AnimateIn>

        <Stagger className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 min-[480px]:grid-cols-2 sm:gap-5 lg:mt-12 lg:grid-cols-4 lg:gap-5">
          {cards.map((service, index) => {
            const isSos = service.name.toLowerCase().includes("ambulance");
            const number = String(index + 1).padStart(2, "0");

            return (
              <StaggerItem key={service.name} index={index}>
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      router.push(cardHref(service.route));
                    })
                  }
                  className={cn(
                    "group relative flex h-full w-full rounded-2xl bg-white text-left",
                    "border border-[#dce8a8]/90",
                    "shadow-[0_14px_28px_rgba(0,0,0,0.28),0_4px_10px_rgba(0,0,0,0.12)]",
                    "transition-[transform,box-shadow,border-color] duration-300",
                    "hover:-translate-y-1.5 hover:border-[#C8E84A]/55",
                    "hover:shadow-[0_22px_40px_rgba(0,0,0,0.32),0_24px_48px_-8px_rgba(184,217,38,0.35)]",
                    "active:scale-[0.99]",
                    isSos && "hover:border-destructive/35",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 top-0 z-10 h-[2.5px] rounded-t-2xl",
                      isSos
                        ? "bg-gradient-to-r from-destructive via-[#f97316] to-transparent"
                        : "bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-transparent",
                    )}
                  />

                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl">
                    <div className="relative isolate aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#283614] sm:aspect-[16/10]">
                      <ResilientImage
                        src={service.image}
                        alt={service.name}
                        fill
                        quality={NEXT_IMAGE_QUALITY.high}
                        sizes={BRAND_IMAGE_SIZES.card}
                        className="select-none object-cover object-center"
                        fallbackSrc={BRAND_PHOTOS.streetCab}
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-white/80 px-2 py-0.5 font-heading text-[10px] font-semibold tracking-[0.16em] text-[#38471B] backdrop-blur-sm">
                        {number}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-3.5 sm:px-4 sm:pb-4 sm:pt-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={cn(
                            "min-w-0 font-heading text-[0.95rem] font-semibold tracking-tight sm:text-[1.05rem]",
                            isSos
                              ? "text-destructive"
                              : "text-[#38471B] group-hover:text-[#B8D926]",
                          )}
                        >
                          {service.name}
                        </h3>
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                            isSos
                              ? "border-destructive/20 text-destructive/55 group-hover:border-destructive group-hover:bg-destructive group-hover:text-white"
                              : "border-[#dce8a8] text-[#B8D926]/70 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-[#B8D926] group-hover:to-[#C8E84A] group-hover:text-[#38471B]",
                          )}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12px] font-light leading-relaxed text-[#5a6330] sm:text-[13px]">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
