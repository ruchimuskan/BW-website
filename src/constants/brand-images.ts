/**
 * Local brand photography from /public/images
 * img-1 cab · img-2 parcel · img-3 ambulance
 * img-7…img-13 gallery illustrations
 * pic-4 bike · pic-5 e-auto · pic-6 travel · pic-7 fares · pic-8 pickup · pic-9 coverage
 * pic-10 app promo · pic-11 street cab · pic-12 hero banner
 * pic-13 studio cab · pic-14 studio bike
 */

export const BRAND_PHOTOS = {
  limeCab: "/images/img-1.webp",
  parcelDelivery: "/images/img-2.webp",
  ambulance: "/images/img-3.webp",
  gallery7: "/images/img-7.png",
  gallery8: "/images/img-8.png",
  gallery9: "/images/img-9.png",
  gallery10: "/images/img-10.png",
  gallery11: "/images/img-11.png",
  gallery13: "/images/img-13.png",
  bike: "/images/pic-4.png",
  eAuto: "/images/pic-5.webp",
  travelStay: "/images/pic-6.webp",
  bestFares: "/images/pic-7.png",
  quickFare: "/images/pic-8.png",
  neverTooFar: "/images/pic-9.png",
  promoAnytime: "/images/pic-10.webp",
  streetCab: "/images/pic-11.webp",
  heroAnytime: "/images/pic-12.png",
  studioCab: "/images/pic-13.webp",
  studioBike: "/images/pic-14.webp",
  captain: "/images/landing/captain-partner.webp",
} as const;

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
    path.includes("pic-8") ||
    path.includes("pic-9") ||
    path.includes("pic-10") ||
    path.includes("pic-12") ||
    path.includes("pic-14") ||
    path.includes("img-7") ||
    path.includes("img-8") ||
    path.includes("img-9") ||
    path.includes("img-10") ||
    path.includes("img-11") ||
    path.includes("img-12") ||
    path.includes("img-13")
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
