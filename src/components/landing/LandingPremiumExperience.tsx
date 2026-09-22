"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { ResilientImage } from "@/components/brand/ResilientImage";
import { BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { BRAND_IMAGES } from "@/constants/brand-images";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { ROUTES } from "@/constants/routes";
import { getProtectedPath } from "@/lib/auth-session";
import { landingShell, LANDING_SECTION_PY } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";

type ExperienceItem = {
  src: string;
  alt: string;
  title: string;
  tagline: string;
  description: string;
  objectPosition?: string;
  href: string;
  /** Renders title with “Ambulance” in red when set. */
  ambulanceTitle?: boolean;
};

const experiences: ExperienceItem[] = [
  {
    src: BRAND_IMAGES.limeCab,
    alt: "BW Rides premium cab",
    title: "Polished rides",
    tagline: "Cab & city travel",
    description:
      "Well-kept vehicles and verified captains for everyday trips across the city.",
    objectPosition: "center center",
    href: `${ROUTES.start}?tab=rides&vehicle=cab`,
  },
  {
    src: BRAND_IMAGES.parcelDelivery,
    alt: "BW Rides parcel delivery at the door",
    title: "Parcels, door to door",
    tagline: "Secure handoff",
    description:
      "Send packages with live tracking and confirmation when they reach the recipient.",
    objectPosition: "62% center",
    href: `${ROUTES.start}?tab=parcel&vehicle=parcel`,
  },
  {
    src: "/images/services/ambulance-studio.png",
    alt: "BW Rides ambulance",
    title: "Book Ambulance free",
    tagline: "Emergency support",
    description:
      "Request medical transport when you need it — booking is free, with priority support on the way.",
    objectPosition: "center center",
    href: ROUTES.ambulanceBook,
    ambulanceTitle: true,
  },
  {
    src: BRAND_IMAGES.cityBike,
    alt: "BW Rides bike with live tracking",
    title: "Live tracking",
    tagline: "Every mile, visible",
    description:
      "Follow your captain on the map with clear ETAs from pickup through drop-off.",
    objectPosition: "center center",
    href: `${ROUTES.start}?tab=rides&vehicle=bike`,
  },
];

function ExperienceTitle({ item }: { item: ExperienceItem }) {
  if (!item.ambulanceTitle) {
    return (
      <h3 className="font-heading text-lg font-semibold tracking-tight text-[#111411] sm:text-xl">
        {item.title}
      </h3>
    );
  }

  return (
    <h3 className="font-heading text-lg font-semibold tracking-tight text-[#111411] sm:text-xl">
      Book <span className="text-[#c62828]">Ambulance</span> free
    </h3>
  );
}

export function LandingPremiumExperience() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const open = (href: string) => {
    startTransition(() => {
      router.push(getProtectedPath(href));
    });
  };

  return (
    <section
      id="experience"
      className={cn(
        "relative scroll-mt-20 overflow-hidden bg-[#f7f8f3]",
        LANDING_SECTION_PY,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_15%_0%,rgba(198,227,26,0.14),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-[#ef4444]/6 blur-3xl"
      />

      <div className={landingShell("relative z-10")}>
        <AnimateIn>
          <SectionHeading
            eyebrow="Experience"
            title="Designed like a premium service"
            description="From booking to arrival — clear fares, live tracking, and support you can trust."
            className="mx-auto max-w-2xl text-center"
          />
        </AnimateIn>

        <Stagger className="mt-8 grid grid-cols-1 gap-3.5 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:mt-12 lg:grid-cols-4 lg:gap-5">
          {experiences.map((item, index) => {
            const isAmbulance = Boolean(item.ambulanceTitle);
            const number = String(index + 1).padStart(2, "0");

            return (
              <StaggerItem key={item.title} index={index} className="min-w-0">
                <motion.button
                  type="button"
                  initial={false}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => open(item.href)}
                  aria-label={item.title}
                  className={cn(
                    "group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[1.35rem] border bg-white text-left sm:rounded-[1.5rem]",
                    "shadow-[0_14px_32px_-22px_rgba(17,20,17,0.35)] transition-[border-color,box-shadow] duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f8f3]",
                    isAmbulance
                      ? "border-[#f0c7c2] hover:border-[#ef4444]/50 focus-visible:ring-[#ef4444]/40"
                      : "border-[#e4e9d8] hover:border-[#C6E31A]/65 focus-visible:ring-[#C6E31A]",
                  )}
                >
                  <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-[#eef2e0] sm:aspect-[4/3]">
                    <ResilientImage
                      src={item.src}
                      alt={item.alt}
                      fill
                      quality={NEXT_IMAGE_QUALITY.high}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                      className={cn(
                        BRAND_PHOTO_CLASS,
                        "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]",
                      )}
                      style={{ objectPosition: item.objectPosition }}
                      priority={index === 0}
                      fallbackSrc={BRAND_IMAGES.cityCab}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase backdrop-blur-sm sm:left-3.5 sm:top-3.5",
                        isAmbulance
                          ? "bg-white/90 text-[#c62828]"
                          : "bg-white/90 text-[#5a7a12]",
                      )}
                    >
                      {number}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
                    <p
                      className={cn(
                        "text-[10px] font-semibold tracking-[0.2em] uppercase",
                        isAmbulance ? "text-[#c62828]/80" : "text-[#5a7a12]",
                      )}
                    >
                      {item.tagline}
                    </p>
                    <div className="mt-1.5 flex items-start justify-between gap-2">
                      <ExperienceTitle item={item} />
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                          isAmbulance
                            ? "border-[#f0c7c2] text-[#c62828] group-hover:bg-[#c62828] group-hover:text-white"
                            : "border-[#dce8a8] text-[#5a7a12] group-hover:bg-[#111411] group-hover:text-white group-hover:border-[#111411]",
                        )}
                        aria-hidden
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#5a6330] sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </motion.button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
