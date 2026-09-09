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
