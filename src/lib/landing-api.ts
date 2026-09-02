import { landingFaqItems } from "@/constants/landing-faq";
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

function mapCategoryToService(category: VehicleCategory): ServiceItem {
  const used = new Set<string>();
  return {
    name: displayVehicleName(category.name, category.slug),
    description: category.description?.trim() || "Book in the Bull Wave Rides app",
    image: vehicleImageForCategory(category, used),
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

  add(pick(ride, (k) => k.includes("bike") && !k.includes("parcel")));
  add(pick(ride, (k) => k.includes("auto") || k.includes("rickshaw")));
  add(
    pick(
      ride,
      (k) =>
        k.includes("cab") ||
        k.includes("economy") ||
        k.includes("comfort") ||
        k.includes("sedan") ||
        k.includes("car"),
    ),
  );
  add(pick(ambulance.length ? ambulance : ride, (k) => k.includes("ambulance")));

  if (picks.length >= 4) return picks.slice(0, 4);

  for (const cat of [...ride, ...ambulance]) {
    if (picks.length >= 4) break;
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
      return picked.map(mapCategoryToService);
    }
  } catch {
    // Fall through to static only in non-production dev.
  }

  return allowDemoDataFallbacks() ? landingServices : [];
}

function mapFaqItem(item: FaqItem, index: number): LandingFaq {
  const slug = item.question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return {
    id: item.id ?? (slug || `faq-${index + 1}`),
    question: item.question,
    answer: item.answer,
  };
}

/** Landing FAQ accordion — live API first, static copy if CMS returns empty. */
export async function fetchLandingFaqs(): Promise<LandingFaq[]> {
  try {
    const items = await getFaqs();
    if (items.length > 0) {
      return items.slice(0, 12).map(mapFaqItem);
    }
  } catch {
    // Fall through to bundled FAQ copy.
  }

  return landingFaqItems.map(({ id, question, answer }) => ({
    id,
    question,
    answer,
  }));
}
