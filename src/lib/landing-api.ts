import { landingFaqItems, shortenLandingFaqQuestion } from "@/constants/landing-faq";
import { landingServices, type ServiceItem } from "@/constants/services";
import { allowDemoDataFallbacks } from "@/lib/app-env";
import {
  getVehicleCategories,
  isAmbulanceVehicle,
  type VehicleCategory,
} from "@/lib/home-api";
import { getFaqs, type FaqItem } from "@/lib/support-api";
import {
  displayVehicleName,
  homeRouteForCategory,
  vehicleImageForCategory,
} from "@/lib/vehicle-map";

export type LandingFaq = {
  id: string;
  question: string;
  answer: string;
};

function slugKey(category: VehicleCategory): string {
  return `${category.slug ?? ""} ${category.name ?? ""}`.toLowerCase();
}

function mapCategoryToService(
  category: VehicleCategory,
  usedImages: Set<string>,
): ServiceItem {
  return {
    name: displayVehicleName(category.name, category.slug),
    description: category.description?.trim() || "Book in the BW Rides app",
    image: vehicleImageForCategory(category, usedImages),
    route: homeRouteForCategory(category),
  };
}

function pickLandingCategories(categories: VehicleCategory[]): VehicleCategory[] {
  const ride = categories.filter(
    (c) => !isAmbulanceVehicle(c) && (c.service_group ?? "ride") === "ride",
  );
  const ambulance = categories.filter(isAmbulanceVehicle);

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

  // Curated landing set: Bike · Auto · Cab · Ambulance
  add(pick(ride, (k) => k.includes("bike") && !k.includes("parcel")));
  add(
    pick(
      ride,
      (k) =>
        (k.includes("electric-auto") ||
          k.includes("e-auto") ||
          (k.includes("auto") && !k.includes("rickshaw"))) &&
        !k.includes("ambulance"),
    ),
  );
  if (!picks.some((c) => /auto|rickshaw|e-rick/i.test(slugKey(c)))) {
    add(pick(ride, (k) => k.includes("rickshaw") || k.includes("e-rick")));
  }
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
  add(pick(ambulance.length ? ambulance : ride, (k) => k.includes("ambulance")));

  if (picks.length >= 4) return picks.slice(0, 4);

  for (const cat of [...ride, ...ambulance]) {
    if (picks.length >= 4) break;
    const key = slugKey(cat);
    const hasThreeWheeler = picks.some((c) =>
      /auto|rickshaw|e-rick/i.test(slugKey(c)),
    );
    const hasCab = picks.some((c) => isCabLike(slugKey(c)));
    if (hasThreeWheeler && /auto|rickshaw|e-rick/i.test(key)) continue;
    if (hasCab && isCabLike(key)) continue;
    add(cat);
  }

  return picks;
}

/** Vehicle tiles for the landing “Choose how you move” section — live API first. */
export async function fetchLandingServices(): Promise<ServiceItem[]> {
  try {
    const [rideCategories, ambulanceCategories] = await Promise.all([
      getVehicleCategories("ride"),
      getVehicleCategories("ambulance").catch(() => [] as VehicleCategory[]),
    ]);

    const merged = [...rideCategories, ...ambulanceCategories];
    const picked = pickLandingCategories(merged);
    if (picked.length > 0) {
      const usedImages = new Set<string>();
      return picked.map((category) => mapCategoryToService(category, usedImages));
    }
  } catch {
    // Fall through to static only in non-production dev.
  }

  return allowDemoDataFallbacks() ? landingServices : [];
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

/** Landing FAQ accordion — live CMS first; bundled copy only outside production. */
export async function fetchLandingFaqs(): Promise<LandingFaq[]> {
  try {
    const items = await getFaqs();
    if (items.length > 0) {
      return items.slice(0, 12).map(mapFaqItem);
    }
  } catch {
    // Fall through only when demo fallbacks are allowed.
  }

  if (!allowDemoDataFallbacks()) return [];

  return landingFaqItems.map(({ id, question, answer }) => ({
    id,
    question,
    answer,
  }));
}
