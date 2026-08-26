"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Home,
  Loader2,
  Map,
  MapPin,
  Plane,
  Plus,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  clearAuthSession,
  requireAuthRedirect,
  setPostLoginRedirect,
} from "@/lib/auth-session";
import {
  createAddress,
  listAddresses,
  type ProfileAddress,
} from "@/lib/profile-api";
import {
  reverseGeocode,
  resolvePlaceDetails,
  searchPlaces,
  type PlaceSuggestion,
} from "@/lib/places-api";
import { SETTINGS_PAGE_BG, settingsShell } from "@/lib/settings-shell";
import { cn } from "@/lib/utils";
import {
  getSavedPlaceSubmitError,
  SAVED_PLACE_LIMITS,
} from "@/lib/saved-place-validation";

const iconForLabel = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes("home")) return Home;
  if (lower.includes("office") || lower.includes("work")) return Briefcase;
  if (lower.includes("airport")) return Plane;
  return MapPin;
};

function isAuthError(message: string) {
  return /invalid|expired|token|unauthorized|unauthenticated|401/i.test(message);
}

export function SavedPlacesView() {
  const router = useRouter();
  const [places, setPlaces] = useState<ProfileAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setPlaces(await listAddresses());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load saved places";
      if (isAuthError(message)) {
        clearAuthSession();
        setPostLoginRedirect(ROUTES.profileSavedPlaces);
        router.replace(requireAuthRedirect(ROUTES.profileSavedPlaces));
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell showBottomNav={false} className="pb-0">
      <div className={cn(SETTINGS_PAGE_BG, "relative flex min-h-[100dvh] flex-col")}>
        <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/95 backdrop-blur-xl">
          <div className={settingsShell("flex items-center gap-2 py-3 sm:gap-4 sm:py-4")}>
            <button
              type="button"
              onClick={() => router.push(ROUTES.profile)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dce8a8]/90 bg-gradient-to-br from-[#f7fbe8] via-white to-[#f0f7d8] text-[#38471B] shadow-[0_10px_24px_-14px_rgba(56,71,27,0.38)] sm:h-11 sm:w-11"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
            </button>
            <h1 className="min-w-0 flex-1 truncate font-heading text-lg font-semibold tracking-tight text-[#38471B] sm:text-2xl">
              Saved Places
            </h1>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B8D926] text-white shadow-sm transition hover:bg-[#a8c922] active:scale-[0.96] sm:h-11 sm:w-11"
              aria-label="Add saved place"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <div className={settingsShell("relative flex flex-1 flex-col pb-8 pt-6")}>
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-20 text-[#5a6330]">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#B8D926]" />
              Loading…
            </div>
          ) : error && places.length === 0 ? (
            <div className="mx-auto w-full max-w-md rounded-2xl border border-destructive/20 bg-white p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                type="button"
                className="mt-4 rounded-full bg-[#B8D926] text-[#38471B]"
                onClick={() => {
                  setLoading(true);
                  void load();
                }}
              >
                Retry
              </Button>
            </div>
          ) : places.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <p className="text-sm text-[#8a9170]">No saved places yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {places.map((place) => {
                const Icon = iconForLabel(place.label);
                return (
                  <div
                    key={place.id}
                    className="flex items-start gap-3 rounded-2xl border border-[#ece7d8] bg-white p-3.5 shadow-sm sm:items-center sm:gap-4 sm:p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f9e4] text-[#B8D926] sm:h-12 sm:w-12">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold text-[#38471B]">{place.label}</p>
                      <p className="mt-0.5 break-words text-sm leading-5 text-[#5a6330]">
                        {place.address_line}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {sheetOpen ? (
          <AddPlaceSheet
            onClose={() => setSheetOpen(false)}
            onSaved={async () => {
              setSheetOpen(false);
              setLoading(true);
              await load();
            }}
          />
        ) : null}
      </div>
    </AppShell>
  );
}

function AddPlaceSheet({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  const runSearch = (query: string) => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          setSuggestions(await searchPlaces(query.trim(), { limit: 6 }));
        } catch {
          setSuggestions([]);
        } finally {
          setSearching(false);
        }
      })();
    }, 280);
  };

  const pickSuggestion = async (place: PlaceSuggestion) => {
    setFormError("");
    setResolving(true);
    try {
      const resolved = await resolvePlaceDetails(place);
      const nextLat = resolved.latitude ?? null;
      const nextLng = resolved.longitude ?? null;
      if (nextLat == null || nextLng == null) {
        setFormError("Could not load this location. Pick another address.");
        return;
      }
      setAddress(resolved.label);
      setLat(nextLat);
      setLng(nextLng);
      setVerified(true);
      setSuggestions([]);
    } catch {
      setFormError("Could not load this location. Pick another address.");
    } finally {
      setResolving(false);
    }
  };

  const applyCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setFormError("Location is not available on this device.");
      return;
    }
    setLocating(true);
    setFormError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resolved = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setAddress(resolved.label);
          setLat(resolved.latitude ?? pos.coords.latitude);
          setLng(resolved.longitude ?? pos.coords.longitude);
          setVerified(true);
          setSuggestions([]);
        } catch {
          setFormError("Unable to read this location. Type the address instead.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setFormError("Allow location access or type the address.");
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextLabel = label.trim();
    const nextAddress = address.trim();
    const invalid = getSavedPlaceSubmitError({
      label: nextLabel,
      address: nextAddress,
      latitude: lat,
      longitude: lng,
      verified,
    });
    if (invalid) {
      setFormError(invalid);
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createAddress({
        label: nextLabel,
        address_line: nextAddress,
        latitude: lat ?? undefined,
        longitude: lng ?? undefined,
        verified: true,
      });
      await onSaved();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save place.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-11 w-full min-w-0 rounded-xl border border-[#ece7d8] bg-[#fbf8f1] px-3.5 text-base text-[#38471B] outline-none placeholder:text-[#8a9170] focus:border-[#C8E84A] focus:bg-white focus:ring-2 focus:ring-[#C8E84A]/20 sm:h-12 sm:rounded-2xl sm:px-4 sm:text-sm";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 flex w-full max-w-[min(28rem,100%)] max-h-[min(88dvh,36rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
          <h2 className="min-w-0 truncate font-heading text-base font-bold text-[#38471B] sm:text-xl">
            Add saved place
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#8a9170] hover:bg-[#f7f7f2]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => void save(e)}
          className="flex min-h-0 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-3 sm:gap-5 sm:px-6 sm:pb-6 sm:pt-4"
        >
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value.slice(0, SAVED_PLACE_LIMITS.LABEL_MAX))}
            placeholder="Label (e.g. Home)"
            autoComplete="off"
            maxLength={SAVED_PLACE_LIMITS.LABEL_MAX}
            className={inputClass}
          />

          <div className="min-w-0">
            <div className="relative">
              <input
                value={address}
                onChange={(e) => {
                  const value = e.target.value.slice(0, SAVED_PLACE_LIMITS.ADDRESS_MAX);
                  setAddress(value);
                  setLat(null);
                  setLng(null);
                  setVerified(false);
                  runSearch(value);
                }}
                placeholder="Search address"
                autoComplete="off"
                maxLength={SAVED_PLACE_LIMITS.ADDRESS_MAX}
                className={cn(inputClass, "pr-12")}
              />
              <button
                type="button"
                onClick={() => void applyCurrentLocation()}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#5a6330] hover:bg-white"
                aria-label="Use current location"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Map className="h-4 w-4" />
                )}
              </button>
            </div>

            {resolving ? (
              <p className="mt-2 text-xs text-[#8a9170]">Loading location…</p>
            ) : suggestions.length > 0 ? (
              <ul className="mt-2 max-h-[min(28vh,12rem)] overflow-y-auto rounded-xl border border-[#ece7d8] bg-white py-1 sm:max-h-52 sm:rounded-2xl">
                {suggestions.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      className="flex w-full min-w-0 flex-col px-3 py-2.5 text-left hover:bg-[#f7fbe8]"
                      onClick={() => void pickSuggestion(place)}
                    >
                      <span className="break-words text-sm font-medium text-[#38471B]">
                        {place.name}
                      </span>
                      <span className="mt-0.5 line-clamp-2 break-words text-xs text-[#8a9170]">
                        {place.address}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : searching ? (
              <p className="mt-2 text-xs text-[#8a9170]">Searching places…</p>
            ) : (
              <p className="mt-2 text-xs leading-5 text-[#8a9170]">
                Choose a suggestion or use current location.
              </p>
            )}
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <Button
            type="submit"
            disabled={saving || resolving}
            className="h-11 w-full shrink-0 rounded-xl bg-[#B8D926] text-base font-semibold text-white hover:bg-[#a8c922] sm:h-12 sm:rounded-2xl"
          >
            {saving ? "Saving…" : "Save place"}
          </Button>
        </form>
      </div>
    </div>
  );
}
