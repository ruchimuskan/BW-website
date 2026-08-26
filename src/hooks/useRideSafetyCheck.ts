"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** First check-in after the trip enters an active drive state. */
const INITIAL_DELAY_MS = 2 * 60 * 1000;
/** Repeat interval when the rider confirms they are safe. */
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

interface UseRideSafetyCheckOptions {
  rideId: string | null;
  /** Ride is actively in progress (OTP verified / started / in progress). */
  enabled: boolean;
  /** Pause scheduling while another modal is open. */
  paused: boolean;
}

export function useRideSafetyCheck({
  rideId,
  enabled,
  paused,
}: UseRideSafetyCheckOptions) {
  const [promptOpen, setPromptOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const initialScheduledRef = useRef(false);
  const wasPausedRef = useRef(paused);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedulePrompt = useCallback(
    (delayMs: number) => {
      clearTimer();
      if (!rideId || !enabled || paused) return;
      timerRef.current = window.setTimeout(() => {
        setPromptOpen(true);
      }, delayMs);
    },
    [clearTimer, enabled, paused, rideId],
  );

  useEffect(() => {
    initialScheduledRef.current = false;
    clearTimer();
    setPromptOpen(false);
  }, [rideId, enabled, clearTimer]);

  useEffect(() => {
    if (!enabled || !rideId || paused || promptOpen) return;
    if (!initialScheduledRef.current) {
      initialScheduledRef.current = true;
      schedulePrompt(INITIAL_DELAY_MS);
    }
  }, [enabled, rideId, paused, promptOpen, schedulePrompt]);

  useEffect(() => {
    if (paused) {
      clearTimer();
    } else if (
      wasPausedRef.current &&
      enabled &&
      rideId &&
      !promptOpen &&
      initialScheduledRef.current
    ) {
      schedulePrompt(CHECK_INTERVAL_MS);
    }
    wasPausedRef.current = paused;
  }, [paused, enabled, rideId, promptOpen, clearTimer, schedulePrompt]);

  const acknowledgeSafe = useCallback(() => {
    setPromptOpen(false);
    schedulePrompt(CHECK_INTERVAL_MS);
  }, [schedulePrompt]);

  const closePrompt = useCallback(() => {
    setPromptOpen(false);
    schedulePrompt(CHECK_INTERVAL_MS);
  }, [schedulePrompt]);

  return {
    promptOpen,
    acknowledgeSafe,
    closePrompt,
  };
}
