import type { RideVehicleId } from "@/data/ride-options";
import type { VehicleCategory } from "@/lib/home-api";
import { getApiBaseUrl, resolveMediaUrl } from "@/lib/api";
import { ROUTES } from "@/constants/routes";

/** Maps backend vehicle category slugs to frontend ride vehicle ids when available. */
export const CATEGORY_SLUG_TO_VEHICLE: Record<string, RideVehicleId> = {
  bike: "bike",
  "bike-taxi": "bike",
  auto: "auto",
  "electric-auto": "auto",
  "e-auto": "auto",
  "e-rickshaw": "e-rickshaw",
  erickshaw: "e-rickshaw",
  rickshaw: "e-rickshaw",
  economy: "cab",
  comfort: "cab",
  cab: "cab",
  sedan: "cab",
  premium: "cab-premium",
  "cab-premium": "cab-premium",
  luxury: "cab-premium",
  xl: "cab-xl",
  "cab-xl": "cab-xl",
  suv: "cab-xl",
  innova: "cab-xl",
  parcel: "parcel",
  travel: "travel",
  ambulance: "ambulance",
};

export const VEHICLE_TO_CATEGORY_SLUG: Partial<Record<RideVehicleId, string>> = {
  bike: "bike",
  auto: "auto",
  "e-rickshaw": "e-rickshaw",
  cab: "economy",
  "cab-xl": "xl",
  "cab-premium": "premium",
  ambulance: "ambulance",
};

/** Resolve a backend slug/name to a frontend ride vehicle id. */
export function resolveRideVehicleId(slugOrName: string): RideVehicleId | null {
  const raw = slugOrName.toLowerCase().trim();
  if (!raw) return null;
  const key = raw.replace(/[\s_]+/g, "-");
  if (CATEGORY_SLUG_TO_VEHICLE[key]) return CATEGORY_SLUG_TO_VEHICLE[key];

  if (key.includes("ambulance") || key.includes("emergency")) return "ambulance";
  if (key.includes("parcel") || key.includes("delivery")) return "parcel";
  if (key.includes("travel") || key.includes("stay")) return "travel";
  if (key.includes("rickshaw") || key.includes("e-rick")) return "e-rickshaw";
  if (key.includes("bike")) return "bike";
  if (
    /\bxl\b/.test(key) ||
    key.includes("cab-xl") ||
    key.includes("suv") ||
    key.includes("innova")
  ) {
    return "cab-xl";
  }
  if (key.includes("premium") || key.includes("luxury")) return "cab-premium";
  if (
    key.includes("electric-auto") ||
    key.includes("e-auto") ||
    /\bauto\b/.test(key) ||
    key.includes("auto")
  ) {
    return "auto";
  }
  if (
    key.includes("economy") ||
    key.includes("comfort") ||
    key.includes("sedan") ||
    key.includes("cab") ||
    key.includes("car")
  ) {
    return "cab";
  }
  return null;
}

export function vehicleImageForSlug(slug: string): string {
  const normalized = slug.toLowerCase();
  if (
    normalized.includes("ambulance") ||
    normalized.includes("emergency") ||
    /\bbls\b/.test(normalized) ||
    /\bals\b/.test(normalized) ||
    normalized.includes("patient-transport") ||
    normalized.includes("patient transport")
  ) {
    return "/images/services/ambulance-studio.png";
  }
  if (normalized.includes("parcel")) return "/images/services/parcel-lime.png";
  if (normalized.includes("travel") || normalized.includes("stay")) {
    return "/images/services/travel.png";
  }
  // E-rickshaw before generic "auto" — dedicated asset.
  if (normalized.includes("rickshaw") || normalized.includes("e-rick")) {
    return "/images/services/e-rickshaw.png";
  }
  // Classic auto / electric-auto — distinct from e-rickshaw (shoot-auto, not duplicate auto.png).
  if (
    normalized.includes("electric-auto") ||
    normalized.includes("e-auto") ||
    /(^|[\s_-])auto([\s_-]|$)/.test(normalized) ||
    normalized === "auto"
  ) {
    return "/images/gallery/shoot-auto.png";
  }
  if (normalized.includes("bike")) return "/images/pic-14.png";
  if (
    /\bxl\b/.test(normalized) ||
    normalized.includes("cab-xl") ||
    normalized.includes("suv") ||
    normalized.includes("innova")
  ) {
    return "/images/services/car.webp";
  }
  if (normalized.includes("premium") || normalized.includes("luxury")) {
    return "/images/landing/brand/lime-cab.png";
  }
  if (
    normalized.includes("economy") ||
    normalized.includes("sedan") ||
    normalized.includes("comfort") ||
    normalized.includes("cab") ||
    normalized.includes("car")
  ) {
    return "/images/services/cab-lime.png";
  }
  return "/images/services/cab-lime.png";
}

/** Normalize admin / legacy labels (e.g. Bike-Taxi → Bike). */
export function displayVehicleName(name: string | null | undefined, slug?: string | null): string {
  const raw = (name || slug || "").trim();
  if (!raw) return "Ride";
  const key = raw.toLowerCase().replace(/[\s_]+/g, "-");
  if (
    key.includes("ambulance") ||
    key.includes("emergency") ||
    key === "bls" ||
    key.startsWith("bls-") ||
    key === "als" ||
    key.startsWith("als-") ||
    key.includes("patient-transport")
  ) {
    return "Ambulance";
  }
  if (key === "bike-taxi" || key === "biketaxi" || key === "bike") return "Bike";
  if (key === "electric-auto" || key === "e-auto") return "Electric Auto";
  if (key === "auto") return "Auto";
  if (key === "e-rickshaw" || key === "erickshaw" || key.includes("rickshaw")) {
    return "E-Rickshaw";
  }
  if (
    key === "xl" ||
    key === "cab-xl" ||
    key.includes("cab-xl") ||
    /\bxl\b/.test(key) ||
    key.includes("suv")
  ) {
    return "Cab XL";
  }
  if (
    key === "premium" ||
    key === "cab-premium" ||
    key.includes("premium") ||
    key.includes("luxury")
  ) {
    return "Cab Premium";
  }
  if (key === "cab-economy" || key.includes("economy")) return "Cab Economy";
  if (key === "cab" || key === "sedan" || key === "comfort") return "Cab";
  // Strip trailing "-taxi" / " taxi" for bike-style names
  if (key.endsWith("-taxi") && key.includes("bike")) return "Bike";
  return raw.replace(/bike[\s-]?taxi/gi, "Bike");
}

const DISTINCT_VEHICLE_IMAGES = [
  "/images/pic-14.png",
  "/images/services/e-rickshaw.png",
  "/images/gallery/shoot-auto.png",
  "/images/services/cab-lime.png",
  "/images/services/car.webp",
  "/images/landing/brand/lime-cab.png",
  "/images/services/ambulance-studio.png",
  "/images/services/ambulance-cutout.png",
  "/images/services/parcel-lime.png",
  "/images/services/travel.png",
  "/images/pic-6.png",
] as const;

/** Stable identity for remote assets (ignore signed query params). */
function mediaIdentity(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const u = new URL(trimmed);
      return `${u.origin}${u.pathname}`.toLowerCase();
    }
  } catch {
    // Fall through to raw path.
  }
  return trimmed.split("?")[0]?.toLowerCase() ?? trimmed.toLowerCase();
}

function unusedVehicleImage(preferred: string, used?: Set<string>): string {
  if (!used) return preferred;
  const preferredId = mediaIdentity(preferred);
  if (preferredId && !used.has(preferredId) && !used.has(preferred)) {
    return preferred;
  }
  const next =
    DISTINCT_VEHICLE_IMAGES.find(
      (src) => !used.has(src) && !used.has(mediaIdentity(src)),
    ) ?? preferred;
  return next;
}

export function uniqueVehicleCategories(
  categories: VehicleCategory[],
): VehicleCategory[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const unique: VehicleCategory[] = [];

  for (const category of categories) {
    const id = String(category.id ?? "").trim();
    const slug = (category.slug || category.name || "").toLowerCase().trim();
    if (id && seenIds.has(id)) continue;
    if (slug && seenSlugs.has(slug)) continue;
    if (id) seenIds.add(id);
    if (slug) seenSlugs.add(slug);
    unique.push(category);
  }

  return unique;
}

/** Hide rental / self-drive from ride booking; show all live ride types from backend. */
export function isListedRideCategory(category: {
  slug?: string | null;
  name?: string | null;
  service_group?: string | null;
}): boolean {
  const group = (category.service_group ?? "ride").toLowerCase();
  if (group === "rental" || group === "self_drive") return false;
  return true;
}

/**
 * Prefer live backend icons (unique per vehicle_type). Fall back to distinct
 * local studio art when the API omits icons or reuses the same S3 file.
 */
export function vehicleImageForCategory(
  category: VehicleCategory,
  usedImages?: Set<string>,
): string {
  const slugKey = `${category.slug || ""} ${category.name || ""}`.toLowerCase();
  const localFallback = vehicleImageForSlug(slugKey);

  const rawIcon = (
    category.icon_url ||
    (category as { image_url?: string | null }).image_url
  )?.trim();
  const backendSrc = rawIcon ? resolveMediaUrl(rawIcon) : null;

  let src = "";
  if (backendSrc) {
    const backendId = mediaIdentity(backendSrc);
    const alreadyUsed =
      usedImages &&
      (usedImages.has(backendSrc) ||
        (backendId ? usedImages.has(backendId) : false));
    if (!alreadyUsed) {
      src = backendSrc;
    }
  }

  if (!src) {
    src = localFallback;
  }

  src = unusedVehicleImage(src, usedImages);
  const id = mediaIdentity(src);
  if (usedImages) {
    usedImages.add(src);
    if (id) usedImages.add(id);
  }
  return src;
}

/** Absolute URL helper when an <img> must hit Backend directly. */
export function absoluteVehicleImageUrl(category: VehicleCategory): string {
  const src = vehicleImageForCategory(category);
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  if (src.startsWith("/uploads/")) {
    return `${getApiBaseUrl().replace(/\/$/, "")}${src}`;
  }
  return src;
}

export function homeRouteForCategory(category: VehicleCategory): string {
  const slug = category.slug.toLowerCase();
  const name = (category.name || "").toLowerCase();
  const serviceGroup = category.service_group ?? "ride";
  const key = `${slug} ${name} ${serviceGroup}`;
  if (serviceGroup === "rental" || slug.startsWith("rental")) return ROUTES.rental;
  if (
    serviceGroup === "ambulance" ||
    key.includes("ambulance") ||
    key.includes("emergency") ||
    key.includes("bls") ||
    key.includes("als") ||
    key.includes("patient")
  ) {
    return `${ROUTES.start}?tab=ambulance&vehicle=ambulance&category=${encodeURIComponent(category.id)}`;
  }
  if (slug.includes("parcel") || slug.includes("delivery")) {
    return `${ROUTES.start}?tab=parcel&vehicle=parcel&category=${encodeURIComponent(category.id)}`;
  }
  const vehicleId = resolveRideVehicleId(`${category.slug} ${category.name}`);
  if (vehicleId) {
    return `${ROUTES.start}?tab=rides&vehicle=${vehicleId}&category=${encodeURIComponent(category.id)}`;
  }
  return `${ROUTES.start}?tab=rides&category=${encodeURIComponent(category.id)}`;
}

export function estimateDistanceKm(): number {
  return 5.2;
}

export function estimateDurationMin(): number {
  return 18;
}

export function vehicleCapacityForCategory(category: {
  slug?: string | null;
  name?: string | null;
  capacity?: number | null;
  seats?: number | null;
}): number {
  if (typeof category.capacity === "number" && category.capacity > 0) {
    return category.capacity;
  }
  if (typeof category.seats === "number" && category.seats > 0) {
    return category.seats;
  }
  const key = `${category.slug ?? ""} ${category.name ?? ""}`.toLowerCase();
  if (key.includes("bike")) return 1;
  if (key.includes("rickshaw")) return 4;
  if (key.includes("auto")) return 3;
  if (key.includes("ambulance")) return 2;
  if (key.includes("xl") || key.includes("suv")) return 6;
  if (key.includes("premium") || key.includes("luxury")) return 4;
  return 4;
}

export function categoryVehicleId(category: VehicleCategory): RideVehicleId | string {
  return (
    resolveRideVehicleId(category.slug) ??
    resolveRideVehicleId(category.name) ??
    resolveRideVehicleId(`${category.slug} ${category.name}`) ??
    category.id
  );
}
