import { ROUTES } from "@/constants/routes";

export type HomeBookingTab = "ride" | "rental" | "parcel";
export type RentalStyle = "self" | "chauffeur";

export type SelfDriveLocation = {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  cars: number;
  bikes: number;
  lat: number;
  lng: number;
  nearest?: boolean;
};

/** Demo hubs until a self-drive locations API is available. */
export const SELF_DRIVE_LOCATIONS: SelfDriveLocation[] = [
  {
    id: "pitampura-metro",
    name: "Pitampura Metro",
    address: "Near Pitampura Metro Station, Outer Ring Road, Delhi 110034.",
    distanceKm: 2.0,
    cars: 0,
    bikes: 0,
    lat: 28.7031,
    lng: 77.1325,
    nearest: true,
  },
  {
    id: "rohini-sec-9",
    name: "Rohini Sector 9",
    address: "Near Rohini Sector 9 Metro, Madhuban Chowk, Delhi 110085.",
    distanceKm: 4.7,
    cars: 1,
    bikes: 2,
    lat: 28.7183,
    lng: 77.1165,
  },
  {
    id: "connaught-place",
    name: "Connaught Place",
    address: "Block A, Connaught Place, New Delhi 110001.",
    distanceKm: 9.5,
    cars: 3,
    bikes: 1,
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    id: "dwarka-sec-21",
    name: "Dwarka Sector 21",
    address: "Near Dwarka Sector 21 Metro Station, New Delhi 110077.",
    distanceKm: 18.0,
    cars: 2,
    bikes: 4,
    lat: 28.5524,
    lng: 77.0585,
  },
];

export function buildSelfDriveUrl(location?: SelfDriveLocation) {
  if (!location) return ROUTES.rentalSelfDrive;
  const params = new URLSearchParams({
    pickup: location.name,
    plat: String(location.lat),
    plng: String(location.lng),
    hub: location.id,
  });
  return `${ROUTES.rentalSelfDrive}?${params.toString()}`;
}

export function buildRentalContinueUrl(opts: {
  pickup?: string;
  pickupLat?: number;
  pickupLng?: number;
  mode?: RentalStyle;
  hub?: string;
}) {
  const params = new URLSearchParams();
  if (opts.pickup) params.set("pickup", opts.pickup);
  if (opts.pickupLat != null) params.set("plat", String(opts.pickupLat));
  if (opts.pickupLng != null) params.set("plng", String(opts.pickupLng));
  if (opts.mode) params.set("mode", opts.mode);
  if (opts.hub) params.set("hub", opts.hub);
  const query = params.toString();
  return query ? `${ROUTES.rental}?${query}` : ROUTES.rental;
}
