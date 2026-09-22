import { ROUTES } from "./routes";
import { BRAND_IMAGES, BRAND_PHOTOS } from "./brand-images";

export interface ServiceItem {
  name: string;
  description: string;
  image: string;
  route: string;
}

export const homeServices: ServiceItem[] = [
  { name: "Bike", description: "Beat the traffic, save money", image: BRAND_PHOTOS.studioBike, route: `${ROUTES.start}?tab=rides&vehicle=bike` },
  { name: "Electric Auto", description: "No haggling, just easy rides",     image: "/images/gallery/shoot-auto.png",
    route: `${ROUTES.start}?tab=rides&vehicle=auto`,
  },
  { name: "Cab", description: "Comfortable rides for you", image: BRAND_PHOTOS.studioCab, route: `${ROUTES.start}?tab=rides&vehicle=cab` },
  { name: "Parcel", description: "Quick, secure & insured deliveries", image: BRAND_IMAGES.slideParcel, route: `${ROUTES.start}?tab=parcel&vehicle=parcel` },
  { name: "Travel and Stay", description: "One app, all solutions", image: BRAND_IMAGES.mobility, route: `${ROUTES.start}?tab=rides&vehicle=travel` },
  { name: "Ambulance", description: "Emergency medical transport", image: BRAND_IMAGES.slideAmbulance, route: `${ROUTES.start}?tab=ambulance&vehicle=ambulance` },
];

/** Auth login/signup left panel — real lifestyle photography */
export const loginAuthServices = [
  {
    title: "Ride Booking",
    description: "Book bike, auto, cab and e-rickshaw instantly.",
    image: BRAND_PHOTOS.streetCab,
    variant: "default" as const,
  },
  {
    title: "Parcel Delivery",
    description: "Fast and secure package delivery.",
    image: BRAND_IMAGES.slideParcel,
    variant: "default" as const,
  },
  {
    title: "Emergency Ambulance",
    description: "24/7 emergency medical assistance.",
    image: BRAND_IMAGES.slideAmbulance,
    variant: "ambulance" as const,
  },
  {
    title: "Live Tracking",
    description: "Track every ride in real-time with live updates.",
    image: BRAND_IMAGES.featurePickup,
    variant: "default" as const,
  },
] as const;

export const landingServices: ServiceItem[] = [
  {
    name: "Bike",
    description: "Fast city hops",
    image: BRAND_PHOTOS.studioBike,
    route: `${ROUTES.start}?tab=rides&vehicle=bike`,
  },
  {
    name: "Auto",
    description: "Everyday rides",
    image: "/images/gallery/shoot-auto.png",
    route: `${ROUTES.start}?tab=rides&vehicle=auto`,
  },
  {
    name: "E-Rickshaw",
    description: "Local electric hops",
    image: "/images/services/e-rickshaw.png",
    route: `${ROUTES.start}?tab=rides&vehicle=e-rickshaw`,
  },
  {
    name: "Cab",
    description: "Comfort on the go",
    image: "/images/services/cab-lime.png",
    route: `${ROUTES.start}?tab=rides&vehicle=cab`,
  },
  {
    name: "Ambulance",
    description: "Book Ambulance free",
    image: "/images/services/ambulance-studio.png",
    route: `${ROUTES.start}?tab=ambulance&vehicle=ambulance`,
  },
];

/**
 * Named high-quality photo library — use these instead of reusing the same
 * slide across hero / gallery / services / experience.
 */
export const landingAssets = {
  cityCab: BRAND_IMAGES.cityCab,
  cityAuto: BRAND_IMAGES.cityAuto,
  cityBike: BRAND_IMAGES.cityBike,
  mobility: BRAND_IMAGES.mobility,
  atmosphere: BRAND_IMAGES.mobility,
  captain: BRAND_IMAGES.captain,
  captainCta: BRAND_IMAGES.captain,
  featurePickup: BRAND_IMAGES.featurePickup,
  slideEAuto: BRAND_IMAGES.slideEAuto,
  slideBike: BRAND_IMAGES.slideBike,
  slideParcel: BRAND_IMAGES.slideParcel,
  slideAmbulance: BRAND_IMAGES.slideAmbulance,
  slideFleet: BRAND_IMAGES.slideFleet,
  galleryBike: BRAND_IMAGES.galleryBike,
  galleryParcel: BRAND_IMAGES.galleryParcel,
  gallerySos: BRAND_IMAGES.gallerySos,
  galleryFleet: BRAND_IMAGES.galleryFleet,
  galleryCab: BRAND_IMAGES.galleryCab,
  galleryCity: BRAND_IMAGES.galleryCity,
  heroPremiumRides: BRAND_IMAGES.heroRides,
  heroPremiumParcel: BRAND_IMAGES.heroParcel,
  heroPremiumAmbulance: BRAND_IMAGES.heroAmbulance,
  galleryPremiumEAuto: BRAND_IMAGES.galleryEAuto,
  galleryPremiumBike: BRAND_IMAGES.galleryBike,
  galleryPremiumParcel: BRAND_IMAGES.galleryParcel,
  galleryPremiumSos: BRAND_IMAGES.gallerySos,
  galleryPremiumCity: BRAND_IMAGES.galleryCity,
  galleryPremiumFleet: BRAND_IMAGES.galleryFleet,
  quickPickup: BRAND_IMAGES.featurePickup,
  bestFares: BRAND_IMAGES.featureFares,
  neverTooFar: BRAND_IMAGES.featureCoverage,
  serviceBike: "/images/services/bike.webp",
  serviceAuto: "/images/gallery/shoot-auto.png",
  serviceERickshaw: "/images/services/e-rickshaw.png",
  serviceCab: "/images/services/car.webp",
  serviceParcel: "/images/services/parcel.png",
  serviceAmbulance: "/images/services/ambulance-cutout.png",
} as const;

export const landingHeroImage = landingAssets.cityCab;

/**
 * Hero only — 4 distinct premium photos (always stacked; never remounted away).
 * Intentionally excludes gallery / welcome / service product shots.
 */
export const landingHeroSlides = [
  {
    src: BRAND_PHOTOS.heroAnytime,
    alt: "BW Rides — rides anytime, anywhere",
  },
  {
    src: BRAND_PHOTOS.streetCab,
    alt: "Premium BW Rides lime cab on city streets",
  },
  {
    src: BRAND_PHOTOS.studioBike,
    alt: "Premium BW Rides bike",
  },
  {
    src: BRAND_PHOTOS.studioCab,
    alt: "Studio BW Rides lime sedan",
  },
] as const;

/** Welcome section side gallery */
/** Our story collage — one photo per vehicle type, no repeated cabs. */
export const landingWelcomeGallery = [
  {
    src: BRAND_PHOTOS.streetCab,
    alt: "Premium BW Rides lime cab on city streets",
    fit: "cover" as const,
    panel: "dark" as const,
  },
  {
    src: BRAND_PHOTOS.studioBike,
    alt: "Premium BW Rides lime motorcycle",
    fit: "cover" as const,
    panel: "lime" as const,
  },
  {
    src: BRAND_PHOTOS.eAuto,
    alt: "BW Rides electric auto",
    fit: "cover" as const,
    panel: "sage" as const,
  },
] as const;

/** Detail strip under welcome — real photos with value labels */
export const landingWelcomeDetails = [
  {
    src: landingAssets.quickPickup,
    alt: "Punctual BW Rides pickup",
    label: "Punctual",
    description: "Captains matched fast with live ETAs you can trust.",
  },
  {
    src: landingAssets.bestFares,
    alt: "Comfortable BW Rides journey",
    label: "Comfort",
    description: "Clean vehicles and calm journeys across every ride type.",
  },
  {
    src: BRAND_PHOTOS.ambulance,
    alt: "Reliable BW Rides emergency SOS",
    label: "Reliable",
    description: "Rides, parcels, and SOS — always available when you need them.",
  },
] as const;

/**
 * Visual journey stills — Book → Support (cab trip + parcel + SOS).
 */
export const landingPremiumGallery = [
  {
    src: BRAND_PHOTOS.shootBook,
    fallback: BRAND_PHOTOS.journey1,
    alt: "Booking a BW Rides trip from home",
    label: "Book",
    line: "One tap. Your captain is already on the way.",
    position: "center center",
  },
  {
    src: BRAND_PHOTOS.shootTrack,
    fallback: BRAND_PHOTOS.journey2,
    alt: "Lime BW Rides cab arriving on a city street",
    label: "Track",
    line: "Watch the car come to you — live, street-level.",
    position: "center center",
  },
  {
    src: BRAND_PHOTOS.shootRide,
    fallback: BRAND_PHOTOS.journey3,
    alt: "Verified BW Rides captain beside a lime sedan",
    label: "Ride",
    line: "A verified captain. A quiet, lime cab. Your city.",
    position: "center center",
  },
  {
    src: BRAND_PHOTOS.shootPay,
    fallback: BRAND_PHOTOS.journey4,
    alt: "Paying for a BW Rides trip from the back seat",
    label: "Pay",
    line: "Settle in the back seat. No cash scramble.",
    position: "center center",
  },
  {
    src: BRAND_PHOTOS.shootRate,
    fallback: BRAND_PHOTOS.journey5,
    alt: "Passenger after a BW Rides trip",
    label: "Rate",
    line: "A good trip should be easy to say so.",
    position: "center center",
  },
  {
    src: BRAND_PHOTOS.shootParcel,
    fallback: BRAND_PHOTOS.journeyParcel,
    alt: "Parcel handed over at the door with BW Rides",
    label: "Parcel",
    line: "Door to door, still in the same lime.",
    position: "center center",
  },
  {
    src: BRAND_PHOTOS.shootSos,
    fallback: BRAND_PHOTOS.journeySos,
    alt: "BW Rides emergency medical transport",
    label: "SOS",
    line: "When it matters, the fleet is already dressed for it.",
    position: "center center",
  },
  {
    src: BRAND_PHOTOS.shootSupport,
    fallback: BRAND_PHOTOS.journey6,
    alt: "BW Rides support specialist ready to help",
    label: "Support",
    line: "A real person. Any hour. Any trip.",
    position: "center center",
  },
] as const;

/**
 * Service tiles — real lifestyle photography (no 3D/cartoon product shots).
 */
export const landingServiceLifestyle: Record<string, string> = {
  bike: BRAND_PHOTOS.studioBike,
  "electric auto": BRAND_PHOTOS.eAuto,
  cab: BRAND_PHOTOS.streetCab,
  parcel: BRAND_PHOTOS.parcelDelivery,
  "travel and stay": BRAND_PHOTOS.travelStay,
  ambulance: BRAND_PHOTOS.ambulance,
};

/** Book section + luxury hero — 3D service cutouts (contained, same style as ride cab). */
export const landingBookImages = {
  rides: {
    src: "/images/services/car.webp",
    fallback: "/images/landing/brand/lime-cab.png",
    alt: "BW Rides premium cab",
    objectPosition: "50% 100%",
    offsetY: "0%",
    accent: "from-transparent via-transparent to-transparent",
    glow: "rgba(198,227,26,0.42)",
    scale: 1.26,
  },
  parcel: {
    src: landingAssets.serviceParcel,
    fallback: "/images/services/parcel.png",
    alt: "BW Rides secure parcel delivery",
    objectPosition: "50% 88%",
    offsetY: "16%",
    accent: "from-transparent via-transparent to-transparent",
    glow: "rgba(198,227,26,0.36)",
    scale: 1.34,
  },
  ambulance: {
    src: "/images/services/ambulance-cutout.png",
    fallback: "/images/services/ambulance.png",
    alt: "BW Rides emergency ambulance",
    objectPosition: "50% 90%",
    offsetY: "12%",
    accent: "from-transparent via-transparent to-transparent",
    glow: "rgba(220,38,38,0.28)",
    scale: 1.28,
  },
} as const;

export const landingCaptainImage = landingAssets.captain;

export const landingBookingTabs = [
  { id: "rides", label: "Rides" },
  { id: "parcel", label: "Parcel" },
  { id: "ambulance", label: "Emergency" },
] as const;

export type LandingBookingTab = (typeof landingBookingTabs)[number]["id"];

export const landingNavLinks = [
  { label: "Home", shortLabel: "Home", href: ROUTES.landing },
  { label: "Book a Ride", shortLabel: "Book", href: ROUTES.ride },
  { label: "About Us", shortLabel: "About", href: ROUTES.about },
  { label: "Safety", shortLabel: "Safety", href: ROUTES.safety },
  { label: "Business", shortLabel: "Biz", href: ROUTES.corporateRegister },
  { label: "SOS", shortLabel: "SOS", href: ROUTES.sos },
  { label: "Captains", shortLabel: "Drive", href: ROUTES.captains },
  { label: "Blogs", shortLabel: "Blogs", href: ROUTES.blogs },
] as const;

export const landingHeroCtas = [
  { id: "rides" as const, label: "Rides" },
  { id: "parcel" as const, label: "Parcel" },
  { id: "ambulance" as const, label: "Emergency" },
] as const;

export const landingStats = [
  { value: "50+", label: "Cities" },
  { value: "24×7", label: "Availability" },
  { value: "<5 min", label: "Avg. pickup" },
  { value: "100%", label: "Live tracking" },
] as const;

export const landingPillars = [
  {
    title: "Fast",
    description: "Captains matched in seconds with live ETAs from booking to arrival.",
  },
  {
    title: "Convenient",
    description: "Door-to-door service around the clock — rides, parcels, and SOS.",
  },
  {
    title: "Safe",
    description: "Verified captains, trip sharing, and safety tools built into every ride.",
  },
  {
    title: "Transparent",
    description: "Upfront fares with no surprises — know what you pay before you go.",
  },
  {
    title: "Connected",
    description: "Real-time tracking and digital receipts for a seamless experience.",
  },
  {
    title: "Comfortable",
    description: "Clean vehicles and courteous captains for a calm, premium journey.",
  },
] as const;
