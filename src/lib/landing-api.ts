import { shortenLandingFaqQuestion } from "@/constants/landing-faq";
import { type ServiceItem } from "@/constants/services";
import {
  getVehicleCategories,
  isAmbulanceVehicle,
  preferAmbulanceCategory,
  withSingleAmbulanceOption,
  type VehicleCategory,
} from "@/lib/home-api";
import { getFaqs, type FaqItem } from "@/lib/support-api";
import {
  displayVehicleName,
  homeRouteForCategory,
  vehicleImageForSlug,
} from "@/lib/vehicle-map";

export type LandingFaq = {
  id: string;
  question: string;
  answer: string;
};

/** Prefer fast local studio art — never block the landing grid on remote S3 icons. */
function landingImageForCategory(category: VehicleCategory): string {
  return vehicleImageForSlug(`${category.slug || ""} ${category.name || ""}`);
}

function slugKey(category: VehicleCategory): string {
  return `${category.slug ?? ""} ${category.name ?? ""}`.toLowerCase();
}

function mapCategoryToService(category: VehicleCategory): ServiceItem {
  return {
    name: displayVehicleName(category.name, category.slug),
    description: category.description?.trim() || "Book in the BW Rides app",
    image: landingImageForCategory(category),
    route: homeRouteForCategory(category),
  };
}

function pickLandingCategories(categories: VehicleCategory[]): VehicleCategory[] {
  const collapsed = withSingleAmbulanceOption(categories);
  const ride = collapsed.filter(
    (c) => !isAmbulanceVehicle(c) && (c.service_group ?? "ride") === "ride",
  );
  const ambulanceOne = preferAmbulanceCategory(collapsed);

  const pick = (
    list: VehicleCategory[],
    test: (key: string) => boolean,
  ): VehicleCategory | undefined => list.find((c) => test(slugKey(c)));

  const picks: VehicleCategory[] = [];
  const usedIds = new Set<string>();

  const add = (cat?: VehicleCategory) => {
    if (!cat?.id || usedIds.has(cat.id)) return;
    usedIds.add(cat.id);
    picks.push(cat);
  };

  const isCabLike = (k: string) =>
    k.includes("economy") ||
    k.includes("comfort") ||
    k.includes("sedan") ||
    k.includes("cab") ||
    k.includes("car") ||
    /\bxl\b/.test(k) ||
    k.includes("suv") ||
    k.includes("premium");

  // Curated landing set: Bike · Auto · E-Rickshaw · Cab · Ambulance
  add(pick(ride, (k) => k.includes("bike") && !k.includes("parcel")));
  add(
    pick(
      ride,
      (k) =>
        (k.includes("electric-auto") ||
          k.includes("e-auto") ||
          (k.includes("auto") && !k.includes("rickshaw"))) &&
        !isAmbulanceVehicle({ slug: k, name: k }),
    ),
  );
  add(pick(ride, (k) => k.includes("rickshaw") || k.includes("e-rick")));
  add(
    pick(
      ride,
      (k) =>
        (k.includes("economy") ||
          (k.includes("cab") && !/\bxl\b/.test(k) && !k.includes("premium")) ||
          k.includes("comfort") ||
          k.includes("sedan")) &&
        !k.includes("luxury"),
    ),
  );
  if (!picks.some((c) => isCabLike(slugKey(c)))) {
    add(pick(ride, isCabLike));
  }
  add(ambulanceOne ?? undefined);

  if (picks.length >= 5) return picks.slice(0, 5);

  for (const cat of ride) {
    if (picks.length >= 5) break;
    const key = slugKey(cat);
    const hasThreeWheeler = picks.some((c) =>
      /auto|rickshaw|e-rick/i.test(slugKey(c)),
    );
    const hasCab = picks.some((c) => isCabLike(slugKey(c)));
    if (hasThreeWheeler && /auto|rickshaw|e-rick/i.test(key)) continue;
    if (hasCab && isCabLike(key)) continue;
    add(cat);
  }

  if (ambulanceOne && !picks.some(isAmbulanceVehicle)) {
    add(ambulanceOne);
  }

  return picks;
}

function isAmbulanceItem(s: ServiceItem): boolean {
  const key = `${s.name} ${s.route}`.toLowerCase();
  return (
    key.includes("ambulance") ||
    key.includes("emergency") ||
    /\bbls\b/.test(key) ||
    /\bals\b/.test(key) ||
    key.includes("patient transport") ||
    key.includes("patient-transport")
  );
}

function isRickshawItem(s: ServiceItem): boolean {
  return /rickshaw|e-rick/i.test(s.name);
}

/**
 * Keep only vehicle types returned by the backend. Local studio art is branding,
 * not a substitute SKU.
 */
function finalizeLandingServices(mapped: ServiceItem[]): ServiceItem[] {
  const unique: ServiceItem[] = [];
  const seen = new Set<string>();
  for (const item of mapped) {
    const key = item.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const localImage = vehicleImageForSlug(`${item.name} ${item.image}`);
    unique.push({
      ...item,
      image: isRickshawItem(item)
        ? "/images/services/e-rickshaw.png"
        : localImage.startsWith("/images/")
          ? localImage
          : item.image.startsWith("/images/")
            ? item.image
            : localImage,
    });
  }
  const rides = unique.filter((s) => !isAmbulanceItem(s));
  const ambulance = unique.find(isAmbulanceItem);
  return ambulance ? [...rides, ambulance] : rides;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Vehicle tiles for the landing “Choose how you move” section — local art first, API names/routes when fast. */
export async function fetchLandingServices(): Promise<ServiceItem[]> {
  try {
    const [rideCategories, ambulanceCategories] = await withTimeout(
      Promise.all([
        getVehicleCategories("ride"),
        getVehicleCategories("ambulance").catch(() => [] as VehicleCategory[]),
      ]),
      2_800,
      "Landing vehicle types",
    );

    const merged = [...rideCategories, ...ambulanceCategories];
    const picked = pickLandingCategories(merged);
    if (picked.length > 0) {
      const mapped = picked.map((category) => mapCategoryToService(category));
      return finalizeLandingServices(mapped);
    }
  } catch {
    return [];
  }

  return [];
}

function mapFaqItem(item: FaqItem, index: number): LandingFaq {
  const question = shortenLandingFaqQuestion(item.question);
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return {
    id: item.id ?? (slug || `faq-${index + 1}`),
    question,
    answer: item.answer,
  };
}

/** Landing FAQ accordion — CMS only. Empty until the server publishes FAQs. */
export async function fetchLandingFaqs(): Promise<LandingFaq[]> {
  try {
    const items = await withTimeout(getFaqs(), 2_800, "Landing FAQs");
    if (items.length > 0) {
      return items.slice(0, 12).map(mapFaqItem);
    }
  } catch {
    return [];
  }

  return [];
}
