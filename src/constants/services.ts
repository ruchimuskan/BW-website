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
  { name: "Electric Auto", description: "No haggling, just easy rides", image: BRAND_IMAGES.cityAuto, route: `${ROUTES.start}?tab=rides&vehicle=auto` },
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
    image: BRAND_PHOTOS.eAuto,
    route: `${ROUTES.start}?tab=rides&vehicle=auto`,
  },
  {
    name: "Cab",
    description: "Comfort on the go",
    image: BRAND_PHOTOS.studioCab,
    route: `${ROUTES.start}?tab=rides&vehicle=cab`,
  },
  {
    name: "Ambulance",
    description: "Emergency SOS",
    image: BRAND_PHOTOS.ambulance,
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
  serviceAuto: "/images/services/auto.webp",
  serviceCab: "/images/services/car.webp",
  serviceParcel: "/images/services/parcel.webp",
  serviceAmbulance: "/images/services/ambulance.webp",
} as const;

export const landingHeroImage = landingAssets.cityCab;

/**
 * Hero only — 4 distinct premium photos (always stacked; never remounted away).
 * Intentionally excludes gallery / welcome / service product shots.
 */
export const landingHeroSlides = [
  {
    src: BRAND_PHOTOS.heroAnytime,
    alt: "Bull Wave Rides — rides anytime, anywhere",
  },
  {
    src: BRAND_PHOTOS.streetCab,
    alt: "Premium Bull Wave Rides lime cab on city streets",
  },
  {
    src: BRAND_PHOTOS.studioBike,
    alt: "Premium Bull Wave Rides bike",
  },
  {
    src: BRAND_PHOTOS.studioCab,
    alt: "Studio Bull Wave Rides lime sedan",
  },
] as const;

/** Welcome section side gallery */
/** Our story collage — one photo per vehicle type, no repeated cabs. */
export const landingWelcomeGallery = [
  {
    src: BRAND_PHOTOS.streetCab,
    alt: "Premium Bull Wave Rides lime cab on city streets",
    fit: "cover" as const,
    panel: "dark" as const,
  },
  {
    src: BRAND_PHOTOS.studioBike,
    alt: "Premium Bull Wave Rides lime motorcycle",
    fit: "cover" as const,
    panel: "lime" as const,
  },
  {
    src: BRAND_PHOTOS.eAuto,
    alt: "Bull Wave Rides electric auto",
    fit: "cover" as const,
    panel: "sage" as const,
  },
] as const;

/** Detail strip under welcome — real photos with value labels */
export const landingWelcomeDetails = [
  {
    src: landingAssets.quickPickup,
    alt: "Punctual Bull Wave Rides pickup",
    label: "Punctual",
    description: "Captains matched fast with live ETAs you can trust.",
  },
  {
    src: landingAssets.bestFares,
    alt: "Comfortable Bull Wave Rides journey",
    label: "Comfort",
    description: "Clean vehicles and calm journeys across every ride type.",
  },
  {
    src: BRAND_PHOTOS.ambulance,
    alt: "Reliable Bull Wave Rides emergency SOS",
    label: "Reliable",
    description: "Rides, parcels, and SOS — always available when you need them.",
  },
] as const;

/**
 * Cover-flow gallery — BW Rides journey (track1…track6).
 * WebP primary (small); PNG twins as fallback for production.
 */
export const landingPremiumGallery = [
  {
    src: BRAND_PHOTOS.journey1,
    alt: "Book a BW Rides trip from the app",
    label: "Book",
    position: "center",
    fit: "cover" as const,
  },
  {
    src: BRAND_PHOTOS.journey2,
    alt: "Track your BW Rides captain live on the map",
    label: "Track",
    position: "center",
    fit: "cover" as const,
  },
  {
    src: BRAND_PHOTOS.journey3,
    alt: "Ride with a verified BW Rides captain",
    label: "Ride",
    position: "center",
    fit: "cover" as const,
  },
  {
    src: BRAND_PHOTOS.journey4,
    alt: "Pay securely in the BW Rides app",
    label: "Pay",
    position: "center",
    fit: "cover" as const,
  },
  {
    src: BRAND_PHOTOS.journey5,
    alt: "Rate your BW Rides trip",
    label: "Rate",
    position: "center",
    fit: "cover" as const,
  },
  {
    src: BRAND_PHOTOS.journey6,
    alt: "24×7 BW Rides support and SOS help",
    label: "Support",
    position: "center",
    fit: "cover" as const,
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

/** Book section + luxury hero — tab-synced premium lime-theme photos */
export const landingBookImages = {
  rides: {
    src: landingAssets.heroPremiumRides,
    alt: "Premium Bull Wave Rides lime cab",
    objectPosition: "center center",
    accent: "from-transparent via-transparent to-transparent",
  },
  parcel: {
    src: landingAssets.heroPremiumParcel,
    alt: "Bull Wave Rides secure parcel delivery",
    objectPosition: "center center",
    accent: "from-transparent via-transparent to-transparent",
  },
  ambulance: {
    src: landingAssets.heroPremiumAmbulance,
    alt: "Bull Wave Rides emergency ambulance SOS",
    objectPosition: "center center",
    accent: "from-transparent via-transparent to-transparent",
  },
} as const;

export const landingCaptainImage = landingAssets.captain;

export const landingBookingTabs = [
  { id: "rides", label: "Rides" },
  { id: "parcel", label: "Parcel" },
  { id: "ambulance", label: "Emergency" },
] as const;

export type LandingBookingTab = (typeof landingBookingTabs)[number]["id"];

export const landingFeatures = [
  {
    title: "Quick Pickup",
    desc: "Captains nearby, matched in seconds — not minutes.",
    body: "Bull Wave Rides uses smart routing to connect you with the closest available captain the moment you confirm your ride. Whether you're heading to work, catching a flight, or rushing to an appointment, you spend less time waiting on the curb and more time moving.",
    points: [
      "Live captain matching across bike, auto, and cab",
      "Average pickup under 5 minutes in active zones",
      "Real-time ETA updates from booking to arrival",
    ],
    image: BRAND_IMAGES.featurePickup,
  },
  {
    title: "Best Fares",
    desc: "Upfront pricing with no surprises at the end of your trip.",
    body: "Know your fare before you ride. Bull Wave Rides shows a clear price estimate based on distance, time, and demand — so there are no awkward surprises when you reach your destination. What you see is what you pay.",
    points: [
      "Transparent fare breakdown before every trip",
      "No hidden charges or last-minute add-ons",
      "Wallet credits and offers applied automatically",
    ],
    image: BRAND_IMAGES.featureFares,
  },
  {
    title: "Never Too Far",
    desc: "Dense city coverage that keeps you connected wherever you go.",
    body: "From busy city centres to growing suburbs, Bull Wave Rides is built to keep you connected. Our captain network spans across neighbourhoods, highways, and key landmarks — so a reliable ride is never more than a few taps away.",
    points: [
      "Wide coverage across 50+ cities and counting",
      "Airport, hospital, and office routes supported",
      "24/7 availability including late-night safety rides",
    ],
    image: BRAND_IMAGES.featureCoverage,
  },
] as const;

export const landingNavLinks = [
  { label: "Home", shortLabel: "Home", href: ROUTES.landing },
  { label: "Book a Ride", shortLabel: "Book", href: ROUTES.ride },
  { label: "About Us", shortLabel: "About", href: ROUTES.about },
  { label: "Safety", shortLabel: "Safety", href: ROUTES.safety },
  { label: "Business", shortLabel: "Business", href: ROUTES.corporateRegister },
  { label: "SOS", shortLabel: "SOS", href: ROUTES.sos },
  { label: "Captains", shortLabel: "Captains", href: ROUTES.captains },
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
