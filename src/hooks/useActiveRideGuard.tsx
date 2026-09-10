"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ActiveRideBlockDialog } from "@/components/booking/ActiveRideBlockDialog";
import {
  buildActiveRideViewUrl,
  getBlockingActiveRide,
} from "@/lib/active-ride-guard";
import { isAuthenticated } from "@/lib/auth-session";
import { ROUTES } from "@/constants/routes";
import type { Ride } from "@/lib/ride-api";

interface GuardOptions {
  ignoreRideId?: string;
}

export function useActiveRideGuard() {
  const router = useRouter();
  const [blockedRide, setBlockedRide] = useState<Ride | null>(null);
  const [guardError, setGuardError] = useState("");

  const close = useCallback(() => {
    setBlockedRide(null);
    setGuardError("");
  }, []);

  const showBlockedRide = useCallback((ride: Ride) => {
    setGuardError("");
    setBlockedRide(ride);
  }, []);

  const showBlockedNotice = useCallback(
    (options: { ride?: Ride | null; message?: string }) => {
      if (options.ride) {
        setGuardError("");
        setBlockedRide(options.ride);
        return;
      }
      setBlockedRide(null);
      setGuardError(
        options.message ||
          "You already have an active ride on the server. Open Bookings to view or cancel it, then try again.",
      );
    },
    [],
  );

  const guardBooking = useCallback(
    async (onAllowed: () => void, options?: GuardOptions): Promise<boolean> => {
      if (!isAuthenticated()) {
        onAllowed();
        return true;
      }

      try {
        const active = await getBlockingActiveRide(options?.ignoreRideId);
        if (active) {
          setGuardError("");
          setBlockedRide(active);
          return false;
        }
      } catch {
        setBlockedRide(null);
        setGuardError(
          "We could not load your current trips from the server. Check your connection and try again.",
        );
        return false;
      }

      onAllowed();
      return true;
    },
    [],
  );

  const blockDialog = (
    <ActiveRideBlockDialog
      open={blockedRide != null || Boolean(guardError)}
      ride={blockedRide}
      errorMessage={guardError || undefined}
      onClose={close}
      onViewBookings={() => {
        if (blockedRide) {
          router.push(buildActiveRideViewUrl(blockedRide));
        } else {
          router.push(ROUTES.bookings);
        }
        close();
      }}
    />
  );

  return {
    guardBooking,
    blockDialog,
    blockedRide,
    clearBlockedRide: close,
    showBlockedRide,
    showBlockedNotice,
  };
}
