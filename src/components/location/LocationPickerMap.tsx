"use client";

import { ambulanceLocationTheme, rideLocationTheme } from "@/lib/ambulance-theme";
import { isValidLatLng, singlePointMapEmbedUrl } from "@/lib/ride-booking";
import { cn } from "@/lib/utils";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";

type LocationPickerMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
  className?: string;
  emergency?: boolean;
};

/** Fixed Google Maps embed for the location picker. */
export function LocationPickerMap({
  latitude,
  longitude,
  label = "Selected location",
  className,
  emergency = false,
}: LocationPickerMapProps) {
  const hasPin = isValidLatLng(latitude, longitude);
  const embedSrc = singlePointMapEmbedUrl(
    latitude,
    longitude,
    hasPin ? 16 : 13,
  );
  const theme = emergency ? ambulanceLocationTheme : rideLocationTheme;

  return (
    <div
      className={cn(
        "relative h-full min-h-[220px] w-full overflow-hidden",
        theme.mapFallback,
        className,
      )}
    >
      <iframe
        key={embedSrc}
        src={embedSrc}
        title={label}
        className="absolute inset-0 h-full w-full border-0"
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />

      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent", theme.mapOverlay)}
      />
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent", theme.mapOverlayBottom)}
      />

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1] flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
        <span className={cn("inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-white shadow-lg backdrop-blur-md", theme.mapBadge)}>
          <span className={cn("h-2 w-2 rounded-full", theme.mapDot)} />
          {hasPin ? "Pinned on map" : "Explore the map"}
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-3 z-[1] hidden sm:block sm:bottom-5 sm:right-4">
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/95 shadow-lg">
          <WaveGoLogo size="sm" className="!h-8 !w-8" />
        </span>
      </div>
    </div>
  );
}
