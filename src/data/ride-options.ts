export type RideVehicleId =
  | "bike"
  | "auto"
  | "e-rickshaw"
  | "cab"
  | "cab-xl"
  | "cab-premium"
  | "parcel"
  | "travel"
  | "ambulance";

/** Display metadata only — fares and ETAs always come from ride estimate APIs. */
export interface RideVehicleOption {
  id: RideVehicleId;
  name: string;
  tagline: string;
  image: string;
}

export const RIDE_VEHICLE_OPTIONS: RideVehicleOption[] = [
  {
    id: "bike",
    name: "Bike",
    tagline: "Beat the traffic, save money",
    image: "/images/pic-14.png",
  },
  {
    id: "auto",
    name: "Electric Auto",
    tagline: "No haggling, just easy rides",
    image: "/images/gallery/shoot-auto.png",
  },
  {
    id: "e-rickshaw",
    name: "E-Rickshaw",
    tagline: "Local electric hops",
    image: "/images/services/e-rickshaw.png",
  },
  {
    id: "cab",
    name: "Cab",
    tagline: "Comfortable rides for you",
    image: "/images/services/cab-lime.png",
  },
  {
    id: "cab-xl",
    name: "Cab XL",
    tagline: "Extra space for groups",
    image: "/images/services/car.webp",
  },
  {
    id: "cab-premium",
    name: "Cab Premium",
    tagline: "Premium comfort rides",
    image: "/images/landing/brand/lime-cab.png",
  },
  {
    id: "parcel",
    name: "Parcel",
    tagline: "Quick, secure & insured deliveries",
    image: "/images/services/parcel.png",
  },
  {
    id: "travel",
    name: "Travel and Stay",
    tagline: "One app, all solutions",
    image: "/images/services/travel.webp",
  },
  {
    id: "ambulance",
    name: "Ambulance",
    tagline: "Emergency medical transport",
    image: "/images/services/ambulance.png",
  },
];

/** Supported checkout methods accepted by the booking API. */
export const PAYMENT_METHODS = [
  { id: "CASH", label: "Cash" },
  { id: "UPI", label: "UPI" },
  { id: "WALLET", label: "Wallet" },
] as const;

export const RIDE_VEHICLE_IDS: RideVehicleId[] = RIDE_VEHICLE_OPTIONS.map((v) => v.id);
