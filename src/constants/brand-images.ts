/**
 * Local brand photography from /public/images
 * img-1 cab · img-2 parcel · img-3 ambulance
 * pic-4 bike · pic-5 e-auto · pic-6 travel · pic-7 fares · pic-8 pickup · pic-9 coverage
 * pic-10 app promo · pic-11 street cab · pic-12 hero banner
 * pic-14 studio bike · img15 captains hero
 *
 * Paths must match files shipped in /public/images (PNG when no WebP twin exists).
 */

export const BRAND_PHOTOS = {
  limeCab: "/images/img-1.png",
  parcelDelivery: "/images/img-2.png",
  ambulance: "/images/img-3.png",
  gallery7: "/images/pic-7.webp",
  gallery8: "/images/pic-8.webp",
  gallery9: "/images/pic-9.webp",
  gallery10: "/images/gallery/track4.webp",
  gallery11: "/images/pic-11.webp",
  gallery13: "/images/services/car.webp",
  /** Visual journey carousel — track1…track6 (Book → Support). */
  journey1: "/images/gallery/track1.webp",
  journey2: "/images/gallery/track2.webp",
  journey3: "/images/gallery/track3.webp",
  journey4: "/images/gallery/track4.webp",
  journey5: "/images/gallery/track5.webp",
  journey6: "/images/gallery/track6.webp",
  bike: "/images/pic-4.png",
  eAuto: "/images/pic-5.png",
  travelStay: "/images/pic-6.png",
  bestFares: "/images/pic-best-fare.webp",
  quickFare: "/images/pic-8.webp",
  neverTooFar: "/images/pic-9.webp",
  promoAnytime: "/images/pic-12.png",
  streetCab: "/images/pic-11.webp",
  heroAnytime: "/images/pic-12.png",
  studioCab: "/images/services/car.webp",
  studioBike: "/images/pic-14.png",
  /** Captains section — driver at night (public/images/img15). */
  captainsHero: "/images/img15.png",
  captainsHeroPng: "/images/img15.png",
  captainsHero2x: "/images/img15-2x.webp",
  /** Legacy captain partner assets (other pages). */
  captain: "/images/landing/captain-partner.png",
  captainWebp: "/images/landing/captain-partner.webp",
  captainPng: "/images/landing/captain-partner.png",
  captainHires: "/images/landing/captain-partner-hires.webp",
  captain2x: "/images/landing/captain-partner-2x.webp",
  captainLandscape: "/images/landing/captain-partner-landscape.webp",
} as const;

/** Captains hero fallback — img15 webp/png twins. */
export const CAPTAINS_HERO_FALLBACKS = [
  BRAND_PHOTOS.captainsHeroPng,
  BRAND_PHOTOS.captainsHero2x,
  BRAND_PHOTOS.streetCab,
] as const;

/** Captain hero fallback chain — partner photo only (PNG first, then webp twins). */
export const CAPTAIN_PARTNER_FALLBACKS = [
  BRAND_PHOTOS.captainPng,
  BRAND_PHOTOS.captainHires,
  BRAND_PHOTOS.captain2x,
  BRAND_PHOTOS.captainWebp,
  "/images/captain_cta.png",
  "/images/captain_cta.webp",
] as const;

export const BRAND_IMAGES = {
  heroRides: BRAND_PHOTOS.streetCab,
  heroParcel: BRAND_PHOTOS.parcelDelivery,
  heroAmbulance: BRAND_PHOTOS.ambulance,

  cityCab: BRAND_PHOTOS.streetCab,
  cityCabAlt: BRAND_PHOTOS.studioCab,
  limeCab: BRAND_PHOTOS.streetCab,
  cabDusk: BRAND_PHOTOS.studioCab,

  slideParcel: BRAND_PHOTOS.parcelDelivery,
  parcelDelivery: BRAND_PHOTOS.parcelDelivery,
  galleryParcel: BRAND_PHOTOS.parcelDelivery,

  slideAmbulance: BRAND_PHOTOS.ambulance,
  ambulanceBrand: BRAND_PHOTOS.ambulance,
  gallerySos: BRAND_PHOTOS.ambulance,

  galleryCab: BRAND_PHOTOS.streetCab,
  galleryCity: BRAND_PHOTOS.studioCab,

  cityAuto: BRAND_PHOTOS.eAuto,
  cityBike: BRAND_PHOTOS.studioBike,
  mobility: BRAND_PHOTOS.travelStay,
  captain: BRAND_PHOTOS.captain,
  slideFleet: BRAND_PHOTOS.quickFare,
  slideBike: BRAND_PHOTOS.studioBike,
  slideEAuto: BRAND_PHOTOS.eAuto,
  galleryBike: BRAND_PHOTOS.studioBike,
  galleryFleet: BRAND_PHOTOS.quickFare,
  galleryEAuto: BRAND_PHOTOS.eAuto,

  featurePickup: BRAND_PHOTOS.quickFare,
  featureFares: BRAND_PHOTOS.bestFares,
  featureCoverage: BRAND_PHOTOS.neverTooFar,

  welcomeCaptain: BRAND_PHOTOS.captain,
  welcomeBike: BRAND_PHOTOS.studioBike,
  welcomeAuto: BRAND_PHOTOS.eAuto,

  promoAnytime: BRAND_PHOTOS.promoAnytime,
  heroAnytime: BRAND_PHOTOS.heroAnytime,
  studioCab: BRAND_PHOTOS.studioCab,
  studioBike: BRAND_PHOTOS.studioBike,

  blogSafety: BRAND_PHOTOS.ambulance,
  blogCommunity: BRAND_PHOTOS.parcelDelivery,
} as const;

export const BRAND_IMAGE_SIZES = {
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 92vw, (max-width: 1536px) 52vw, 900px",
  bookPanel: "(max-width: 1024px) 100vw, 50vw",
  gallery: "(max-width: 400px) 80vw, (max-width: 640px) 300px, (max-width: 1024px) 44vw, 420px",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px",
  feature: "(max-width: 1024px) 100vw, 70vw",
  /** Full-bleed marketing pages (no persistent sidebar). */
  full: "100vw",
  /** Home / app shell content width (accounts for lg sidebar). */
  homeFull:
    "(max-width: 1023px) 100vw, (max-width: 1280px) calc(100vw - 280px), 1152px",
  half: "(max-width: 1024px) 100vw, 50vw",
  tab: "48px",
  serviceTile:
    "(max-width: 419px) 96px, (max-width: 639px) 42vw, (max-width: 1023px) 46vw, 360px",
} as const;

/** Baked-in headlines and white-studio cutouts must stay fully visible. */
export function brandPhotoFit(src: string): "contain" | "cover" {
  const path = src.toLowerCase();
  if (
    path.includes("pic-4") ||
    path.includes("pic-5") ||
    path.includes("pic-6") ||
    path.includes("pic-7") ||
    path.includes("pic-best-fare") ||
    path.includes("best-fare") ||
    path.includes("pic-8") ||
    path.includes("pic-9") ||
    path.includes("pic-10") ||
    path.includes("pic-12") ||
    path.includes("pic-14") ||
    path.includes("/services/")
  ) {
    return "contain";
  }
  return "cover";
}

/** Soft-blend studio plates; lifestyle and marketing banners stay unblended. */
export function brandPhotoBlend(src: string): "multiply" | "lighten" | "none" {
  const path = src.toLowerCase();
  if (
    path.includes("pic-14") ||
    path.includes("/auto.webp") ||
    path.includes("/auto.png") ||
    path.includes("pic-5")
  ) {
    return "none";
  }
  if (
    path.includes("pic-10") ||
    path.includes("pic-11") ||
    path.includes("pic-12")
  ) {
    return "none";
  }
  if (
    path.includes("pic-13") ||
    path.includes("img-1") ||
    path.includes("img-2") ||
    path.includes("img-3") ||
    path.includes("pic-4")
  ) {
    return "lighten";
  }
  return "none";
}
