"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
} from "lucide-react";
import {
  buildReturnUrlWithLocations,
  getLocationSearchCopy,
  type LocationFieldType,
} from "@/lib/location-search";
import {
  DEFAULT_PLACE_BIAS,
  formatDistanceKm,
  resolvePlaceDetails,
  reverseGeocode,
  searchPlaces,
  type PlaceSearchBias,
  type PlaceSuggestion,
  type SelectedPlace,
} from "@/lib/places-api";
import { MAX_STOPS, parseStopsFromParams, type TripStop } from "@/lib/trip-stops";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { ambulanceLocationTheme, rideLocationTheme } from "@/lib/ambulance-theme";
import { LocationPickerMap } from "@/components/location/LocationPickerMap";

function SuggestionList({
  title,
  items,
  isLoading,
  onSelect,
  theme,
}: {
  title: string;
  items: PlaceSuggestion[];
  isLoading?: boolean;
  onSelect: (place: PlaceSuggestion) => void;
  theme: typeof rideLocationTheme | typeof ambulanceLocationTheme;
}) {
  if (!isLoading && items.length === 0) return null;

  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2 px-0.5">
        <MapPin className={cn("h-3.5 w-3.5", theme.sectionIcon)} />
        <h2 className={cn("text-[11px] font-semibold tracking-[0.14em] uppercase", theme.sectionTitle)}>
          {title}
        </h2>
      </div>
      {isLoading ? (
        <div className={cn("flex justify-center rounded-2xl border py-10 shadow-sm", theme.card)}>
          <Loader2 className={cn("h-5 w-5 animate-spin", theme.spinner)} />
        </div>
      ) : (
        <ul className={cn("divide-y overflow-hidden rounded-2xl border shadow-[0_12px_32px_-24px_rgba(40,54,20,0.35)]", theme.card, theme.rowDivider)}>
          {items.map((item) => {
            const distanceLabel = formatDistanceKm(item.distanceKm);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn("flex w-full items-start gap-3 px-3.5 py-3.5 text-left transition-colors sm:px-4", theme.rowHover)}
                >
                  <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", theme.iconBox)}>
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className={cn("block text-sm font-semibold", theme.ink)}>
                        {item.name}
                      </span>
                      {distanceLabel ? (
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", theme.distance)}>
                          {distanceLabel}
                        </span>
                      ) : null}
                    </span>
                    <span className={cn("mt-0.5 block text-[13px] font-normal leading-snug", theme.muted)}>
                      {item.address}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function parseField(raw: string | null): LocationFieldType {
  if (raw === "dropoff") return "dropoff";
  if (raw === "stop") return "stop";
  return "pickup";
}

function parseCoord(raw: string | null): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** `/start` without pickup/dropoff immediately re-opens location — avoid that loop. */
function resolveCancelDestination(returnTo: string): string {
  const raw = (returnTo || ROUTES.home).trim() || ROUTES.home;
  try {
    const url = new URL(raw, "http://local.invalid");
    const path = url.pathname;
    if (path === ROUTES.start || path === "/start") {
      const hasPickup = Boolean(url.searchParams.get("pickup")?.trim());
      const hasDropoff = Boolean(url.searchParams.get("dropoff")?.trim());
      if (!hasPickup || !hasDropoff) {
        return ROUTES.home;
      }
    }
    if (!path.startsWith("/")) return ROUTES.home;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return raw.startsWith("/") ? raw : ROUTES.home;
  }
}

export function LocationSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const field = parseField(searchParams.get("field"));
  const returnTo = searchParams.get("return") || ROUTES.home;
  const tab = searchParams.get("tab");
  const savedPickup = searchParams.get("pickup") || "";
  const savedDropoff = searchParams.get("dropoff") || "";
  const savedPlat = parseCoord(searchParams.get("plat"));
  const savedPlng = parseCoord(searchParams.get("plng"));
  const savedDlat = parseCoord(searchParams.get("dlat"));
  const savedDlng = parseCoord(searchParams.get("dlng"));
  const existingStops = parseStopsFromParams(searchParams);
  const stopIndexRaw = searchParams.get("stopIndex");
  const stopIndex =
    stopIndexRaw != null && stopIndexRaw !== ""
      ? Math.min(Math.max(Number(stopIndexRaw) || 0, 0), MAX_STOPS - 1)
      : existingStops.length;

  const initialQuery =
    searchParams.get("q") ||
    (field === "pickup"
      ? savedPickup
      : field === "dropoff"
        ? savedDropoff
        : existingStops[stopIndex]?.label) ||
    "";

  const initialMapLat =
    field === "pickup"
      ? savedPlat
      : field === "dropoff"
        ? savedDlat
        : existingStops[stopIndex]?.latitude ?? savedPlat;
  const initialMapLng =
    field === "pickup"
      ? savedPlng
      : field === "dropoff"
        ? savedDlng
        : existingStops[stopIndex]?.longitude ?? savedPlng;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [mapLat, setMapLat] = useState<number | undefined>(initialMapLat);
  const [mapLng, setMapLng] = useState<number | undefined>(initialMapLng);
  const [searchBias, setSearchBias] = useState<PlaceSearchBias>(() => {
    if (initialMapLat != null && initialMapLng != null) {
      return {
        latitude: initialMapLat,
        longitude: initialMapLng,
        radiusMeters: 45_000,
      };
    }
    return DEFAULT_PLACE_BIAS;
  });
  const [biasLabel, setBiasLabel] = useState(
    initialMapLat != null ? "Near your pin" : "Near Delhi",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const copy = getLocationSearchCopy(field, tab, stopIndex);

  useEffect(() => {
    setQuery(initialQuery);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [initialQuery]);

  // Prefer live GPS so autocomplete stays local (e.g. Delhi places, not Nagpur).
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSearchBias({
          latitude,
          longitude,
          radiusMeters: 40_000,
        });
        setBiasLabel("Near your GPS");
        if (mapLat == null || mapLng == null) {
          setMapLat(latitude);
          setMapLng(longitude);
        }
      },
      () => {
        // Keep map pin / Delhi bias when permission is denied.
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120_000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);

  useEffect(() => {
    if (mapLat == null || mapLng == null) return;
    setSearchBias((prev) => {
      // Don't override a fresher GPS fix with a weaker map default.
      if (biasLabel === "Near your GPS") return prev;
      return {
        latitude: mapLat,
        longitude: mapLng,
        radiusMeters: 45_000,
      };
    });
  }, [mapLat, mapLng, biasLabel]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const places = await searchPlaces(trimmed, {
          limit: 10,
          bias: searchBias,
        });
        if (!cancelled) setResults(places);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, searchBias]);

  const baseCoords = {
    pickupLat: savedPlat,
    pickupLng: savedPlng,
    dropoffLat: savedDlat,
    dropoffLng: savedDlng,
  };

  const navigateWithPlace = (place: SelectedPlace) => {
    let nextPickup = savedPickup;
    let nextDropoff = savedDropoff;
    const nextStops = [...existingStops];
    const coords = { ...baseCoords };

    if (field === "pickup") {
      nextPickup = place.label;
      coords.pickupLat = place.latitude;
      coords.pickupLng = place.longitude;
    } else if (field === "dropoff") {
      nextDropoff = place.label;
      coords.dropoffLat = place.latitude;
      coords.dropoffLng = place.longitude;
    } else {
      const stop: TripStop = {
        label: place.label,
        latitude: place.latitude,
        longitude: place.longitude,
      };
      if (stopIndex < nextStops.length) {
        nextStops[stopIndex] = stop;
      } else if (nextStops.length < MAX_STOPS) {
        nextStops.push(stop);
      } else {
        nextStops[MAX_STOPS - 1] = stop;
      }
    }

    router.replace(
      buildReturnUrlWithLocations(
        returnTo,
        nextPickup,
        nextDropoff,
        tab,
        coords,
        nextStops,
      ),
      { scroll: false },
    );
  };

  const handleBack = () => {
    const destination = resolveCancelDestination(
      buildReturnUrlWithLocations(
        returnTo,
        savedPickup,
        savedDropoff,
        tab,
        baseCoords,
        existingStops,
      ),
    );
    router.replace(destination, { scroll: false });
  };

  const handleSelect = async (suggestion: PlaceSuggestion) => {
    setIsResolving(true);
    setLocateError(null);
    try {
      const place = await resolvePlaceDetails(suggestion);
      if (place.latitude != null && place.longitude != null) {
        setMapLat(place.latitude);
        setMapLng(place.longitude);
      }
      navigateWithPlace(place);
    } catch {
      setLocateError("Unable to resolve this location. Try another place.");
      setIsResolving(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Location is not supported on this device.");
      return;
    }

    setIsResolving(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setMapLat(latitude);
          setMapLng(longitude);
          setSearchBias({
            latitude,
            longitude,
            radiusMeters: 40_000,
          });
          setBiasLabel("Near your GPS");
          const place = await reverseGeocode(latitude, longitude);
          navigateWithPlace(place);
        } catch {
          setLocateError("Unable to fetch current location.");
          setIsResolving(false);
        }
      },
      () => {
        setLocateError("Location permission denied. Enable GPS and try again.");
        setIsResolving(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const showSearchResults = query.trim().length >= 2;
  const showCurrentLocation = field === "pickup" || field === "stop";
  const isAmbulanceTab = tab === "ambulance";
  const theme = isAmbulanceTab ? ambulanceLocationTheme : rideLocationTheme;

  const fieldDot = isAmbulanceTab
    ? field === "pickup"
      ? "bg-[#ffb8ae]"
      : field === "stop"
        ? "bg-[#E8A95A]"
        : "bg-[#c45c5c]"
    : field === "pickup"
      ? "bg-[#C8E84A]"
      : field === "stop"
        ? "bg-[#E8A95A]"
        : "bg-[#9BB820]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "relative flex h-[100dvh] flex-col overflow-hidden font-sans lg:flex-row",
        theme.pageBg,
      )}
    >
      <div className="relative z-10 min-h-[38dvh] flex-1 order-1 lg:order-2 lg:min-h-0">
        <LocationPickerMap
          latitude={mapLat}
          longitude={mapLng}
          label={copy.title}
          emergency={isAmbulanceTab}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <div
        className={cn(
          "relative z-20 flex shrink-0 flex-col overflow-hidden",
          "max-h-[min(62dvh,34rem)] rounded-t-[1.75rem] border-t bg-white",
          "order-2 sm:max-h-[min(58dvh,36rem)]",
          "lg:order-1 lg:max-h-none lg:h-full lg:w-[min(26.5rem,38%)] lg:rounded-none lg:border-t-0 lg:border-r",
          theme.panelBorder,
          theme.panelShadow,
          theme.desktopShadow,
        )}
      >
        <div
          aria-hidden
          className={cn("mx-auto mt-2 h-1 w-10 shrink-0 rounded-full lg:hidden", theme.grabber)}
        />

        <header className={cn("shrink-0 border-b px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4 lg:pt-5", theme.headerBg, theme.headerBorder)}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                "transition active:scale-[0.96]",
                "focus-visible:outline-none focus-visible:ring-2",
                theme.backBtn,
              )}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn("text-[10px] font-semibold tracking-[0.18em] uppercase", theme.eyebrow)}>
                {isAmbulanceTab ? "Emergency" : "Set location"}
              </p>
              <h1 className={cn("truncate font-heading text-lg font-semibold tracking-tight sm:text-xl", theme.title)}>
                {copy.title}
              </h1>
            </div>
          </div>

          <div className={cn("mt-4 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white px-3.5 py-3 shadow-sm focus-within:ring-2 sm:px-4 sm:py-3.5", theme.inputRing)}>
            <span
              className={cn("h-2.5 w-2.5 shrink-0 rounded-full", fieldDot)}
              aria-hidden
            />
            <Search className={cn("h-4 w-4 shrink-0", theme.searchIcon)} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.placeholder}
              className={cn("w-full bg-transparent text-[15px] font-medium outline-none placeholder:font-normal sm:text-base", theme.inputText)}
              autoComplete="off"
              spellCheck={false}
              disabled={isResolving}
            />
          </div>
          <p className={cn("mt-2.5 text-xs font-normal sm:text-sm", theme.hint)}>
            {showSearchResults
              ? `Showing matches ${biasLabel.toLowerCase()}`
              : `Search nearby places · ${biasLabel}`}
          </p>
          {locateError ? (
            <p className="mt-1.5 text-sm text-[#ffb4b4]">{locateError}</p>
          ) : null}
        </header>

        <div className={cn("relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5", theme.bodyBg)}>
          {isResolving ? (
            <div className={cn("flex flex-col items-center gap-3 rounded-2xl border py-12 shadow-sm", theme.card, theme.muted)}>
              <Loader2 className={cn("h-6 w-6 animate-spin", theme.spinner)} />
              <p className="text-sm">Resolving location…</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="space-y-3.5"
            >
              {showCurrentLocation && !showSearchResults && (
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left shadow-[0_10px_28px_-22px_rgba(40,54,20,0.4)] transition active:scale-[0.995] sm:px-4",
                    theme.card,
                    theme.cardHover,
                  )}
                >
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", theme.iconBox)}>
                    <LocateFixed className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-sm font-semibold", theme.ink)}>
                      Use current location
                    </span>
                    <span className={cn("mt-0.5 block text-[13px]", theme.muted)}>
                      Detect from GPS and pin on map
                    </span>
                  </span>
                </button>
              )}

              {showSearchResults && (
                <SuggestionList
                  title="Search results"
                  items={results}
                  isLoading={isSearching}
                  onSelect={handleSelect}
                  theme={theme}
                />
              )}

              {showSearchResults && !isSearching && results.length === 0 && (
                <p className={cn("rounded-2xl border px-4 py-5 text-center text-sm", theme.card, theme.muted)}>
                  No locations found — try a different search.
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
