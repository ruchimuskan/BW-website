"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ackNoCaptainPrompt,
  hasAckedNoCaptainPrompt,
  isNoCaptainAssignmentCancel,
  shouldWatchForCaptain,
} from "@/lib/no-captain-assigned";
import {
  clearLastBookedRide,
  readLastBookedRide,
} from "@/lib/last-booked-ride";
import { getRide, isDriverAssigned, type Ride } from "@/lib/ride-api";

const POLL_MS = 4000;

export function useNoCaptainAssignedPrompt(
  rides: Ride[],
  onRideUpdated?: (ride: Ride) => void,
) {
  const [promptRide, setPromptRide] = useState<Ride | null>(null);
  const onRideUpdatedRef = useRef(onRideUpdated);
  onRideUpdatedRef.current = onRideUpdated;

  const watchKey = useMemo(() => {
    const ids = new Set<string>();
    for (const ride of rides) {
      if (shouldWatchForCaptain(ride) && !hasAckedNoCaptainPrompt(ride.id)) {
        ids.add(ride.id);
      }
    }
    const last = readLastBookedRide();
    if (last && shouldWatchForCaptain(last) && !hasAckedNoCaptainPrompt(last.id)) {
      ids.add(last.id);
    }
    return [...ids].sort().join(",");
  }, [rides]);

  const openPrompt = useCallback((ride: Ride) => {
    if (hasAckedNoCaptainPrompt(ride.id)) return;
    if (!isNoCaptainAssignmentCancel(ride)) return;
    setPromptRide(ride);
  }, []);

  useEffect(() => {
    if (promptRide) return;

    for (const ride of rides) {
      if (isNoCaptainAssignmentCancel(ride) && !hasAckedNoCaptainPrompt(ride.id)) {
        const last = readLastBookedRide();
        if (last?.id === ride.id) {
          openPrompt(ride);
          return;
        }
      }
    }

    const last = readLastBookedRide();
    if (last && isNoCaptainAssignmentCancel(last) && !hasAckedNoCaptainPrompt(last.id)) {
      openPrompt(last);
    }
  }, [openPrompt, promptRide, rides]);

  useEffect(() => {
    if (promptRide || !watchKey) return;
    const ids = watchKey.split(",");

    let stopped = false;

    const tick = async () => {
      for (const id of ids) {
        if (stopped) return;
        try {
          const live = await getRide(id);
          if (stopped) return;
          onRideUpdatedRef.current?.(live);
          if (isDriverAssigned(live.status)) {
            const last = readLastBookedRide();
            if (last?.id === live.id) clearLastBookedRide();
            continue;
          }
          if (isNoCaptainAssignmentCancel(live)) {
            openPrompt(live);
            return;
          }
        } catch {
          // Keep polling through transient API errors.
        }
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, POLL_MS);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [openPrompt, promptRide, watchKey]);

  const dismiss = useCallback(() => {
    if (promptRide) ackNoCaptainPrompt(promptRide.id);
    const last = readLastBookedRide();
    if (promptRide && last?.id === promptRide.id) clearLastBookedRide();
    setPromptRide(null);
  }, [promptRide]);

  return { promptRide, dismissNoCaptainPrompt: dismiss };
}
