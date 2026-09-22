import { authFetch, isAuthErrorMessage } from "@/lib/api";
import {
  getSavedPlaceSubmitError,
  sanitizeSavedPlaceText,
  SAVED_PLACE_LIMITS,
} from "@/lib/saved-place-validation";

export interface ProfileAddress {
  id: string;
  label: string;
  address_line: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

export interface Profile {
  id: string;
  phone: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  gender: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  default_pickup_address: string | null;
  referral_code: string | null;
  rating_avg: number;
  addresses: ProfileAddress[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapApiData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    const data = (res as { data?: T }).data;
    if (data !== undefined && data !== null) return data;
  }
  return res as T;
}

function parseAddress(value: unknown): ProfileAddress | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = String(row.id ?? row.address_id ?? "");
  const label = String(row.label ?? row.name ?? "").trim();
  const addressLine = String(
    row.address_line ?? row.address ?? row.formatted_address ?? "",
  ).trim();
  if (!label && !addressLine) return null;
  const lat = row.latitude ?? row.lat;
  const lng = row.longitude ?? row.lng ?? row.lon;
  return {
    id: id || `${label}-${addressLine}`,
    label: label || "Saved place",
    address_line: addressLine,
    latitude: typeof lat === "number" ? lat : Number(lat) || null,
    longitude: typeof lng === "number" ? lng : Number(lng) || null,
    is_default: Boolean(row.is_default ?? row.default),
  };
}

function parseAddressList(res: unknown): ProfileAddress[] {
  const body = unwrapApiData<unknown>(res);
  const inner = unwrapApiData<unknown>(body);
  if (Array.isArray(inner)) {
    return inner.map(parseAddress).filter((row): row is ProfileAddress => Boolean(row));
  }
  const record = asRecord(inner) ?? asRecord(body) ?? asRecord(res) ?? {};
  const nested =
    record.addresses ??
    record.items ??
    record.results ??
    record.saved_addresses ??
    record.saved_places;
  if (!Array.isArray(nested)) return [];
  return nested.map(parseAddress).filter((row): row is ProfileAddress => Boolean(row));
}

export function getProfile(): Promise<Profile> {
  return authFetch<unknown>("/profile", undefined, "Unable to load profile").then(
    parseProfile,
  );
}

function parseProfile(res: unknown): Profile {
  const body = unwrapApiData<unknown>(res);
  const row =
    asRecord(unwrapApiData(body)) ?? asRecord(body) ?? asRecord(res) ?? {};
  const first = String(row.first_name ?? "").trim();
  const last = String(row.last_name ?? "").trim();
  const fullName = String(
    row.full_name ?? row.name ?? `${first} ${last}`.trim(),
  ).trim();
  const emailRaw = String(row.email ?? "").trim();
  const addresses = parseAddressList(row.addresses ?? res);
  return {
    id: String(row.id ?? ""),
    phone: String(row.phone ?? ""),
    full_name: fullName || null,
    email: emailRaw || null,
    profile_image_url: String(
      row.profile_image_url ?? row.profile_photo ?? "",
    ).trim() || null,
    gender: String(row.gender ?? "").trim() || null,
    emergency_contact_name:
      String(row.emergency_contact_name ?? "").trim() || null,
    emergency_contact_phone:
      String(row.emergency_contact_phone ?? "").trim() || null,
    default_pickup_address:
      String(row.default_pickup_address ?? "").trim() || null,
    referral_code: String(row.referral_code ?? "").trim() || null,
    rating_avg:
      typeof row.rating_avg === "number"
        ? row.rating_avg
        : Number(row.rating_avg) || 0,
    addresses,
  };
}

export async function updateProfile(payload: {
  full_name?: string;
  email?: string;
  gender?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  default_pickup_address?: string;
  referral_code?: string;
}): Promise<Profile> {
  const body = JSON.stringify(payload);
  try {
    await authFetch<unknown>(
      "/profile",
      { method: "PATCH", body },
      "Unable to update profile",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/405|method not allowed/i.test(message)) throw error;
    await authFetch<unknown>(
      "/profile",
      { method: "PUT", body },
      "Unable to update profile",
    );
  }
  return getProfile();
}

export async function listAddresses(): Promise<ProfileAddress[]> {
  const responses = await Promise.allSettled([
    authFetch<unknown>("/saved-address", undefined, "Unable to load saved places"),
    authFetch<unknown>("/profile/addresses", undefined, "Unable to load saved places"),
  ]);

  const merged: ProfileAddress[] = [];
  const seen = new Set<string>();
  let authFailed = false;
  let lastError: Error | null = null;

  for (const result of responses) {
    if (result.status === "rejected") {
      const message = result.reason instanceof Error ? result.reason.message : "";
      lastError = result.reason instanceof Error ? result.reason : new Error(message || "Unable to load saved places");
      if (isAuthErrorMessage(message) || /invalid|expired|token|unauthorized|401/i.test(message)) {
        authFailed = true;
      }
      continue;
    }
    for (const row of parseAddressList(result.value)) {
      const key = row.id || `${row.label}|${row.address_line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(row);
    }
  }

  if (merged.length === 0 && authFailed && lastError) throw lastError;
  if (
    merged.length === 0 &&
    responses.every((result) => result.status === "rejected") &&
    lastError
  ) {
    const message = lastError.message;
    if (!/not found|404/i.test(message)) throw lastError;
  }
  return merged;
}

export async function createAddress(payload: {
  label: string;
  address_line: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  verified?: boolean;
}): Promise<ProfileAddress> {
  const label = sanitizeSavedPlaceText(payload.label, SAVED_PLACE_LIMITS.LABEL_MAX);
  const address_line = sanitizeSavedPlaceText(
    payload.address_line,
    SAVED_PLACE_LIMITS.ADDRESS_MAX,
  );
  const latitude = payload.latitude ?? null;
  const longitude = payload.longitude ?? null;
  const invalid = getSavedPlaceSubmitError({
    label,
    address: address_line,
    latitude,
    longitude,
    verified: payload.verified ?? Boolean(latitude != null && longitude != null),
  });
  if (invalid) throw new Error(invalid);

  const body = JSON.stringify({
    label,
    address_line,
    latitude,
    longitude,
    is_default: payload.is_default ?? false,
  });

  let res: unknown;
  try {
    res = await authFetch<unknown>(
      "/profile/addresses",
      { method: "POST", body },
      "Unable to save place",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/not found|404|405|method not allowed/i.test(message)) throw error;
    res = await authFetch<unknown>(
      "/saved-address",
      { method: "POST", body },
      "Unable to save place",
    );
  }
  const parsed =
    parseAddress(unwrapApiData(res)) ??
    parseAddress(asRecord(res)) ??
    parseAddressList(res)[0];
  if (!parsed) {
    throw new Error("Place was saved but the server response could not be read. Please refresh and try again.");
  }
  return parsed;
}

export function deleteAddress(addressId: string): Promise<{ message: string }> {
  return authFetch<{ message: string }>(
    `/saved-address/${addressId}`,
    { method: "DELETE" },
    "Unable to delete place",
  );
}

/**
 * Upsert the rider's live GPS place as a saved "Current location" on the backend
 * (same profile addresses API used by Flutter for saved places).
 */
export async function syncCurrentLocationPlace(place: {
  label: string;
  latitude?: number;
  longitude?: number;
}): Promise<void> {
  const latitude = place.latitude;
  const longitude = place.longitude;
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  const address_line = (place.label || "Current location").trim() || "Current location";

  try {
    const existing = await listAddresses();
    const match = existing.find((row) =>
      /current\s*location/i.test(row.label),
    );

    if (match) {
      const sameSpot =
        match.latitude != null &&
        match.longitude != null &&
        Math.abs(match.latitude - latitude) < 0.0008 &&
        Math.abs(match.longitude - longitude) < 0.0008 &&
        match.address_line.trim() === address_line;
      if (sameSpot) return;
      if (match.id) {
        await deleteAddress(match.id).catch(() => undefined);
      }
    }

    await createAddress({
      label: "Current location",
      address_line,
      latitude,
      longitude,
      is_default: true,
      verified: true,
    });

    await updateProfile({ default_pickup_address: address_line }).catch(
      () => undefined,
    );
  } catch {
    // Auth / network failures must not block booking — GPS coords stay on the client.
  }
}

/**
 * Upsert the latest pickup/dropoff selection on the backend as a saved place
 * so the location search screen can reload it next time.
 */
export async function rememberTripPlace(
  place: {
    label: string;
    latitude?: number;
    longitude?: number;
  },
  kind: "pickup" | "dropoff" | "stop",
): Promise<void> {
  const latitude = place.latitude;
  const longitude = place.longitude;
  const address_line = (place.label || "").trim();
  if (
    !address_line ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  const label =
    kind === "pickup"
      ? "Recent pickup"
      : kind === "dropoff"
        ? "Recent dropoff"
        : "Recent stop";

  try {
    const existing = await listAddresses();
    const match = existing.find((row) =>
      new RegExp(`^${label}$`, "i").test(row.label.trim()),
    );
    if (match?.id) {
      await deleteAddress(match.id).catch(() => undefined);
    }

    // Also skip creating a duplicate of an already-saved exact address.
    const duplicate = existing.find(
      (row) =>
        row.address_line.trim().toLowerCase() === address_line.toLowerCase() &&
        !new RegExp(`^${label}$`, "i").test(row.label.trim()),
    );
    if (duplicate) return;

    await createAddress({
      label,
      address_line,
      latitude,
      longitude,
      is_default: kind === "pickup",
      verified: true,
    });

    if (kind === "pickup") {
      await updateProfile({ default_pickup_address: address_line }).catch(
        () => undefined,
      );
    }
  } catch {
    // Guest / auth failures — keep trip coords on the client URL only.
  }
}

export async function logoutAccount(): Promise<{ message: string }> {
  const { logoutCurrentUser } = await import("@/lib/logout");
  await logoutCurrentUser();
  return { message: "Logged out" };
}
