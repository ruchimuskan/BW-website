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
  "e-rickshaw": "auto",
  erickshaw: "auto",
  economy: "cab",
  comfort: "cab",
  premium: "cab",
  cab: "cab",
  xl: "cab",
  parcel: "parcel",
  travel: "travel",
  ambulance: "ambulance",
};

export const VEHICLE_TO_CATEGORY_SLUG: Partial<Record<RideVehicleId, string>> = {
  bike: "bike",
  auto: "auto",
  cab: "economy",
  ambulance: "ambulance",
};

export function vehicleImageForSlug(slug: string): string {
  const normalized = slug.toLowerCase();
  if (normalized.includes("ambulance")) return "/images/services/ambulance-cutout.png";
  if (normalized.includes("parcel")) return "/images/img-2.png";
  if (normalized.includes("travel") || normalized.includes("stay")) {
    return "/images/pic-6.png";
  }
  // E-rickshaw first (before generic "auto") — dedicated asset.
  if (normalized.includes("rickshaw") || normalized.includes("e-rick")) {
    return "/images/services/e-rickshaw.png";
  }
  // Classic Bajaj-style auto / electric-auto — different asset from e-rickshaw.
  if (
    normalized.includes("electric-auto") ||
    normalized.includes("e-auto") ||
    /\bauto\b/.test(normalized) ||
    normalized.includes("auto")
  ) {
    return "/images/services/auto.png";
  }
  if (normalized.includes("bike")) return "/images/pic-14.png";
  if (
    normalized.includes("xl") ||
    normalized.includes("suv") ||
    normalized.includes("innova") ||
    normalized.includes("premium") ||
    normalized.includes("luxury") ||
    normalized.includes("economy") ||
    normalized.includes("sedan") ||
    normalized.includes("cab") ||
    normalized.includes("comfort") ||
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
  if (key === "bike-taxi" || key === "biketaxi" || key === "bike") return "Bike";
  if (key === "electric-auto" || key === "e-auto") return "Electric Auto";
  if (key === "auto") return "Auto";
  if (key === "e-rickshaw" || key === "erickshaw") return "E-Rickshaw";
  // Strip trailing "-taxi" / " taxi" for bike-style names
  if (key.endsWith("-taxi") && key.includes("bike")) return "Bike";
  return raw.replace(/bike[\s-]?taxi/gi, "Bike");
}

const DISTINCT_VEHICLE_IMAGES = [
  "/images/pic-14.png",
  "/images/services/e-rickshaw.png",
  "/images/services/auto.png",
  "/images/services/cab-lime.png",
  "/images/services/car.webp",
  "/images/services/ambulance-cutout.png",
  "/images/services/ambulance-studio.png",
  "/images/services/ambulance.png",
  "/images/img-2.png",
  "/images/pic-6.png",
] as const;

function unusedVehicleImage(preferred: string, used?: Set<string>): string {
  if (!used?.has(preferred)) return preferred;
  return DISTINCT_VEHICLE_IMAGES.find((src) => !used.has(src)) ?? preferred;
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

/** Home and ride booking hide types the product does not offer as live services. */
export function isListedRideCategory(category: {
  slug?: string | null;
  name?: string | null;
  service_group?: string | null;
}): boolean {
  const group = (category.service_group ?? "ride").toLowerCase();
  if (group === "rental" || group === "self_drive") return false;
  const key = `${category.slug ?? ""} ${category.name ?? ""}`.toLowerCase();
  if (key.includes("rickshaw") || key.includes("e-rick")) return false;
  if (/\bxl\b/.test(key) || key.includes("cab xl") || key.includes("suv")) {
    return false;
  }
  if (key.includes("premium") || key.includes("luxury")) return false;
  return true;
}

/**
 * Home/booking cards use branded local art so types stay visually distinct
 * (admin S3 icons are often the same white cab for XL / Economy / Premium).
 */
export function vehicleImageForCategory(
  category: VehicleCategory,
  usedImages?: Set<string>,
): string {
  const slugKey = `${category.slug || ""} ${category.name || ""}`.toLowerCase();
  const hasTypedArt =
    /bike|auto|rickshaw|ambulance|parcel|travel|stay|xl|suv|innova|premium|luxury|economy|sedan|cab|comfort|car/.test(
      slugKey,
    );

  let src = hasTypedArt
    ? vehicleImageForSlug(category.slug || category.name || "")
    : "";

  if (!src) {
    const raw = (category.icon_url || (category as { image_url?: string | null }).image_url)?.trim();
    if (raw) {
      const resolved = resolveMediaUrl(raw);
      if (resolved) src = resolved;
    }
  }
  if (!src) {
    src = vehicleImageForSlug(category.slug || category.name || "");
  }
  src = unusedVehicleImage(src, usedImages);
  usedImages?.add(src);
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
  const serviceGroup = category.service_group ?? "ride";
  if (serviceGroup === "rental" || slug.startsWith("rental")) return ROUTES.rental;
  if (slug.includes("ambulance") || slug.includes("emergency")) {
    return `${ROUTES.start}?tab=ambulance&vehicle=ambulance&category=${encodeURIComponent(category.id)}`;
  }
  if (slug.includes("parcel") || slug.includes("delivery")) {
    return `${ROUTES.start}?tab=parcel&vehicle=parcel&category=${encodeURIComponent(category.id)}`;
  }
  const vehicleId = CATEGORY_SLUG_TO_VEHICLE[slug];
  if (vehicleId) return `${ROUTES.start}?tab=rides&vehicle=${vehicleId}`;
  return `${ROUTES.start}?tab=rides&category=${category.id}`;
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
  return 4;
}

export function categoryVehicleId(category: VehicleCategory): RideVehicleId | string {
  return CATEGORY_SLUG_TO_VEHICLE[category.slug] ?? category.id;
}

