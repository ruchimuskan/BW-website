import { authFetch, apiFetch } from "@/lib/api";

export interface VehicleCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  base_fare: number;
  per_km_rate: number;
  included_distance_km?: number;
  included_hours?: number;
  per_hour_rate?: number;
  icon_url: string | null;
  service_group?: string;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  discount_percent: number | null;
}

export interface HomeOffer {
  code: string;
  title: string;
  description: string | null;
  discount_percent: number | null;
}

export interface RideSummary {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  fare_estimate: number | null;
  created_at: string;
}

export interface HomeDashboard {
  greeting_name: string;
  vehicle_categories: VehicleCategory[];
  rental_categories?: VehicleCategory[];
  offers: HomeOffer[];
  banners: HomeBanner[];
  nearby_drivers_count: number;
  recent_rides: RideSummary[];
  active_ride: RideSummary | null;
}

function unwrapApiData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    const data = (res as { data?: T }).data;
    if (data !== undefined && data !== null) return data;
  }
  return res as T;
}

export function getHomeDashboard(): Promise<HomeDashboard> {
  return authFetch<unknown>("/dashboard", undefined, "Unable to load home data").then(
    (res) => {
      const data = unwrapApiData<HomeDashboard & Record<string, unknown>>(res);
      const active = data.active_ride as (RideSummary & Record<string, unknown>) | null | undefined;
      if (active && typeof active === "object") {
        const pickup =
          String(active.pickup_address ?? "").trim() ||
          String(active.pickup ?? "").trim() ||
          "";
        const dropoff =
          String(active.dropoff_address ?? "").trim() ||
          String(active.dropoff ?? "").trim() ||
          "";
        data.active_ride = {
          id: String(active.id ?? ""),
          pickup_address: pickup,
          dropoff_address: dropoff,
          status: String(active.status ?? "REQUESTED"),
          fare_estimate:
            typeof active.fare_estimate === "number"
              ? active.fare_estimate
              : typeof active.estimated_fare === "number"
                ? active.estimated_fare
                : null,
          created_at: String(active.created_at ?? new Date().toISOString()),
        };
      }
      if (!Array.isArray(data.vehicle_categories)) data.vehicle_categories = [];
      if (!Array.isArray(data.offers)) data.offers = [];
      if (!Array.isArray(data.banners)) data.banners = [];
      if (!Array.isArray(data.recent_rides)) data.recent_rides = [];
      if (typeof data.greeting_name !== "string") data.greeting_name = "";
      if (typeof data.nearby_drivers_count !== "number") data.nearby_drivers_count = 0;
      return data as HomeDashboard;
    },
  );
}

export function isAmbulanceVehicle(category: {
  slug?: string | null;
  name?: string | null;
  service_group?: string | null;
}): boolean {
  const key = `${category.slug ?? ""} ${category.name ?? ""} ${category.service_group ?? ""}`.toLowerCase();
  return (
    key.includes("ambulance") ||
    key.includes("emergency") ||
    key.includes("bls") ||
    key.includes("als") ||
    (category.service_group ?? "").toLowerCase() === "ambulance"
  );
}

export async function getAmbulanceVehicleTypes(): Promise<VehicleCategory[]> {
  const [all, ambulanceGroup] = await Promise.all([
    getVehicleCategories(),
    getVehicleCategories("ambulance").catch(() => [] as VehicleCategory[]),
  ]);
  const merged = [...ambulanceGroup, ...all];
  const seen = new Set<string>();
  const unique: VehicleCategory[] = [];
  for (const row of merged) {
    if (!row?.id || seen.has(row.id)) continue;
    seen.add(row.id);
    unique.push(row);
  }
  return unique.filter(isAmbulanceVehicle);
}

export function getVehicleCategories(
  serviceGroup?: "ride" | "rental" | "ambulance" | "self_drive",
): Promise<VehicleCategory[]> {
  const query = serviceGroup ? `?service_group=${serviceGroup}` : "";
  return apiFetch<unknown>(
    `/api/v1/common/vehicle-types${query}`,
    undefined,
    "Unable to load vehicles"
  ).then((res) => {
    if (Array.isArray(res)) return res as VehicleCategory[];
    if (res && typeof res === "object") {
      const record = res as Record<string, unknown>;
      if (Array.isArray(record.data)) return record.data as VehicleCategory[];
      if (Array.isArray(record.items)) return record.items as VehicleCategory[];
      if (Array.isArray(record.vehicle_types)) {
        return record.vehicle_types as VehicleCategory[];
      }
    }
    return [];
  });
}

export function getRentalCategories(): Promise<VehicleCategory[]> {
  return apiFetch<VehicleCategory[]>(
    "/api/v1/common/rental-categories",
    undefined,
    "Unable to load rental vehicles"
  );
}

export function getBanners(): Promise<HomeBanner[]> {
  return apiFetch<HomeBanner[]>("/api/v1/common/banners", undefined, "Unable to load banners");
}
