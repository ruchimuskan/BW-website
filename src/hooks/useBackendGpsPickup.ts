"use client";

import { useEffect, useState } from "react";
import {
  resolveCurrentGpsPlace,
  type SelectedPlace,
} from "@/lib/places-api";

export type GpsPickupStatus =
  | "idle"
  | "locating"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

/**
 * Resolves pickup via device GPS + backend reverse-geocode (Flutter-aligned).
 * While `enabled`, fetches once per enable cycle.
 */
export function useBackendGpsPickup(enabled: boolean): {
  place: SelectedPlace | null;
  status: GpsPickupStatus;
  locating: boolean;
} {
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [status, setStatus] = useState<GpsPickupStatus>("idle");

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    let alive = true;
    setStatus("locating");
    const controller = new AbortController();

    void resolveCurrentGpsPlace({
      timeoutMs: 15_000,
      refineMs: 3_500,
      signal: controller.signal,
    })
      .then((resolved) => {
        if (!alive) return;
        setPlace(resolved);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (!alive || controller.signal.aborted) return;
        const code =
          err && typeof err === "object" && "code" in err
            ? Number((err as GeolocationPositionError).code)
            : NaN;
        if (code === 1) setStatus("denied");
        else setStatus("error");
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, [enabled]);

  return {
    place,
    status,
    locating: status === "locating",
  };
}
