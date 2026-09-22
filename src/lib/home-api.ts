import type { SelfDriveLocation } from "@/constants/home-booking";
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
  capacity?: number;
  seats?: number;
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

function mergeVehicleCategories(
  ...lists: VehicleCategory[][]
): VehicleCategory[] {
  const merged: VehicleCategory[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const category of list) {
      const id = String(category?.id ?? "").trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      merged.push(category);
    }
  }
  return merged;
}

export async function getHomeDashboard(): Promise<HomeDashboard> {
  // Authenticated dashboard first — never pretend a guest is logged in.
  const res = await authFetch<unknown>(
    "/dashboard",
    undefined,
    "Unable to load home data",
  );
  const data = unwrapApiData<HomeDashboard & Record<string, unknown>>(res);
  const active = data.active_ride as
    | (RideSummary & Record<string, unknown>)
    | null
    | undefined;
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
  if (typeof data.nearby_drivers_count !== "number") {
    data.nearby_drivers_count = 0;
  }

  // Enrich with live vehicle-types (public) after auth succeeds.
  const liveTypes = await Promise.all([
    getVehicleCategories("ride"),
    getVehicleCategories("ambulance").catch(() => [] as VehicleCategory[]),
  ])
    .then(([rideTypes, ambulanceTypes]) =>
      mergeVehicleCategories(rideTypes, ambulanceTypes),
    )
    .catch(() => [] as VehicleCategory[]);

  data.vehicle_categories = withSingleAmbulanceOption(
    mergeVehicleCategories(
      liveTypes,
      (data.vehicle_categories as VehicleCategory[]) ?? [],
    ),
  );

  return data as HomeDashboard;
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
    key.includes("patient-transport") ||
    key.includes("patient transport") ||
    (category.service_group ?? "").toLowerCase() === "ambulance"
  );
}

/** Prefer one backend ambulance type (keeps a real vehicle_type id for booking). */
export function preferAmbulanceCategory(
  categories: VehicleCategory[],
): VehicleCategory | null {
  const ambulances = categories.filter(isAmbulanceVehicle);
  if (ambulances.length === 0) return null;

  const rank = (category: VehicleCategory) => {
    const key = `${category.slug ?? ""} ${category.name ?? ""}`.toLowerCase();
    if (
      key === "ambulance" ||
      (key.includes("ambulance") &&
        !key.includes("bls") &&
        !key.includes("als") &&
        !key.includes("patient") &&
        !key.includes("other"))
    ) {
      return 0;
    }
    if (key.includes("bls")) return 1;
    if (key.includes("patient")) return 2;
    if (key.includes("als")) return 3;
    return 4;
  };

  const best = [...ambulances].sort((a, b) => rank(a) - rank(b))[0]!;
  return {
    ...best,
    name: "Ambulance",
    slug: best.slug?.includes("ambulance") ? best.slug : "ambulance",
    description:
      best.description?.trim() || "Emergency medical transport",
    service_group: "ambulance",
  };
}

/** Ride lists show at most one Ambulance tile — subtypes stay on the server. */
export function withSingleAmbulanceOption(
  categories: VehicleCategory[],
): VehicleCategory[] {
  const nonAmbulance = categories.filter((c) => !isAmbulanceVehicle(c));
  const one = preferAmbulanceCategory(categories);
  return one ? [...nonAmbulance, one] : nonAmbulance;
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
  const one = preferAmbulanceCategory(unique);
  return one ? [one] : [];
}

export function getVehicleCategories(
  serviceGroup?: "ride" | "rental" | "ambulance" | "self_drive",
): Promise<VehicleCategory[]> {
  const query = serviceGroup ? `?service_group=${serviceGroup}` : "";
  return apiFetch<unknown>(
    `/api/v1/common/vehicle-types${query}`,
    { skipAuth: true },
    "Unable to load vehicles"
  ).then((res) => {
    let rows: unknown[] = [];
    if (Array.isArray(res)) rows = res;
    else if (res && typeof res === "object") {
      const record = res as Record<string, unknown>;
      if (Array.isArray(record.data)) rows = record.data;
      else if (Array.isArray(record.items)) rows = record.items;
      else if (Array.isArray(record.vehicle_types)) rows = record.vehicle_types;
    }

    return rows
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const item = row as Record<string, unknown>;
        const id = String(item.id ?? item.vehicle_type_id ?? "").trim();
        if (!id) return null;
        const name = String(item.name ?? item.title ?? "").trim() || id;
        const slug =
          String(item.slug ?? item.code ?? "")
            .trim()
            .toLowerCase()
            .replace(/[\s_]+/g, "-") ||
          name.toLowerCase().replace(/[\s_]+/g, "-");
        return {
          id,
          slug,
          name,
          description:
            typeof item.description === "string" ? item.description : null,
          base_fare: Number(item.base_fare ?? item.baseFare ?? 0) || 0,
          per_km_rate: Number(item.per_km_rate ?? item.perKmRate ?? 0) || 0,
          included_distance_km:
            item.included_distance_km == null
              ? undefined
              : Number(item.included_distance_km),
          included_hours:
            item.included_hours == null ? undefined : Number(item.included_hours),
          per_hour_rate:
            item.per_hour_rate == null ? undefined : Number(item.per_hour_rate),
          icon_url:
            typeof item.icon_url === "string"
              ? item.icon_url
              : typeof item.image_url === "string"
                ? item.image_url
                : null,
          service_group:
            typeof item.service_group === "string"
              ? item.service_group
              : serviceGroup ?? "ride",
          capacity:
            item.capacity == null && item.seats == null
              ? undefined
              : Number(item.capacity ?? item.seats),
          seats: item.seats == null ? undefined : Number(item.seats),
        } as VehicleCategory;
      })
      .filter((row): row is VehicleCategory => row != null);
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

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const record = res as Record<string, unknown>;
    for (const key of ["data", "items", "locations", "hubs"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

function mapSelfDriveHub(row: Record<string, unknown>, index: number): SelfDriveLocation | null {
  const id = String(row.id ?? row.hub_id ?? "").trim();
  const name = String(row.name ?? row.title ?? "").trim();
  if (!id || !name) return null;

  const lat = Number(row.lat ?? row.latitude ?? row.pickup_lat);
  const lng = Number(row.lng ?? row.longitude ?? row.pickup_lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id,
    name,
    address: String(row.address ?? row.full_address ?? name).trim(),
    distanceKm: Number(row.distance_km ?? row.distanceKm ?? row.distance ?? 0) || 0,
    cars: Number(row.cars ?? row.cars_available ?? row.car_count ?? 0) || 0,
    bikes: Number(row.bikes ?? row.bikes_available ?? row.bike_count ?? 0) || 0,
    lat,
    lng,
    nearest: Boolean(row.is_nearest ?? row.nearest ?? index === 0),
  };
}

/** Self-drive pickup hubs from the vehicle panel API. */
export async function getSelfDriveLocations(): Promise<SelfDriveLocation[]> {
  const endpoints = [
    "/api/v1/common/self-drive-locations",
    "/api/v1/public/self-drive-locations",
  ];

  for (const path of endpoints) {
    try {
      const res = await apiFetch<unknown>(
        path,
        { skipAuth: true },
        "Unable to load self-drive locations",
      );
      const mapped = unwrapList<Record<string, unknown>>(res)
        .map((row, index) => mapSelfDriveHub(row, index))
        .filter((row): row is SelfDriveLocation => row != null);
      if (mapped.length > 0) return mapped;
    } catch {
      // Try next endpoint shape.
    }
  }

  return [];
}
