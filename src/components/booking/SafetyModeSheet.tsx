"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronRight,
  Crosshair,
  Loader2,
  Mic,
  MicOff,
  ShieldAlert,
  ShieldCheck,
  Siren,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { getProfile } from "@/lib/profile-api";
import {
  blobToDataUrl,
  buildLiveRideShareText,
  getCurrentCoords,
  triggerRideSos,
  uploadSafetyAudio,
  type Ride,
} from "@/lib/ride-api";
import { createSupportTicket } from "@/lib/support-api";
import { cn } from "@/lib/utils";

type SafetyPanel = "menu" | "report" | "contacts" | "audio";

interface SafetyModeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ride: Ride;
  etaMinutes?: number | null;
  onToast: (message: string) => void;
  onRefreshRide?: () => void;
}

export function SafetyModeSheet({
  open,
  onOpenChange,
  ride,
  etaMinutes,
  onToast,
  onRefreshRide,
}: SafetyModeSheetProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<SafetyPanel>("menu");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportText, setReportText] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shouldUploadRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setPanel("menu");
      setError(null);
      setReportText("");
      setRecordedBlob(null);
      stopRecordingInternal(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || panel !== "contacts") return;
    setContactsLoading(true);
    void getProfile()
      .then((profile) => {
        setContactName(profile.emergency_contact_name?.trim() ?? "");
        setContactPhone(profile.emergency_contact_phone?.trim() ?? "");
      })
      .catch(() => {
        setContactName("");
        setContactPhone("");
      })
      .finally(() => setContactsLoading(false));
  }, [open, panel]);

  useEffect(() => {
    return () => stopRecordingInternal(false);
  }, []);

  const stopRecordingInternal = (keepState: boolean) => {
    shouldUploadRef.current = false;
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (!keepState) {
      setRecording(false);
      setRecordingMs(0);
      chunksRef.current = [];
    }
  };

  const handleShareLiveLocation = async () => {
    setBusy(true);
    setError(null);
    try {
      const coords = await getCurrentCoords();
      const liveRide: Ride = {
        ...ride,
        driver_lat: coords.lat ?? ride.driver_lat,
        driver_lng: coords.lng ?? ride.driver_lng,
      };
      const text = buildLiveRideShareText(liveRide, etaMinutes);
      if (navigator.share) {
        await navigator.share({
          title: "Bull Wave Rides — Live location",
          text,
        });
        onToast("Live location shared");
      } else {
        await navigator.clipboard.writeText(text);
        onToast("Live location copied");
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to share location");
    } finally {
      setBusy(false);
    }
  };

  const handleSos = async () => {
    const confirmed = window.confirm(
      "Send SOS alert? We will notify your emergency contacts and support with your live location and captain details.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const coords = await getCurrentCoords();
      const result = await triggerRideSos(ride.id, {
        lat: coords.lat ?? ride.driver_lat ?? ride.pickup_lat ?? undefined,
        lng: coords.lng ?? ride.driver_lng ?? ride.pickup_lng ?? undefined,
        message: "Passenger triggered SOS from Safety Mode",
      });
      onToast(
        result.message ||
          (result.emergency_sms_sent
            ? "SOS sent. Emergency contacts and support notified."
            : "SOS sent to support."),
      );
      onRefreshRide?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send SOS");
    } finally {
      setBusy(false);
    }
  };

  const handleReportIncident = async () => {
    const message = reportText.trim();
    if (message.length < 5) {
      setError("Please describe what happened (at least a few words).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createSupportTicket({
        subject: `Safety incident · Ride ${ride.public_id || ride.id.slice(0, 8)}`,
        message: [
          message,
          "",
          `Ride ID: ${ride.id}`,
          `Status: ${ride.status}`,
          `Captain: ${ride.driver?.name || "—"}`,
          `Vehicle: ${ride.vehicle_number || ride.driver?.vehicle_number || "—"}`,
          `From: ${ride.pickup_address}`,
          `To: ${ride.dropoff_address}`,
        ].join("\n"),
        category: "safety",
        ride_id: ride.id,
        priority: "high",
      });
      onToast("Incident reported to support");
      setReportText("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to report incident");
    } finally {
      setBusy(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Audio recording is not supported on this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (!shouldUploadRef.current) {
          chunksRef.current = [];
          return;
        }
        shouldUploadRef.current = false;
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        if (blob.size > 0) {
          setRecordedBlob(blob);
        } else {
          setError("No audio captured. Try recording again.");
        }
      };
      mediaRecorderRef.current = recorder;
      shouldUploadRef.current = false;
      recorder.start(1000);
      setRecording(true);
      setRecordingMs(0);
      timerRef.current = window.setInterval(() => {
        setRecordingMs((ms) => {
          if (ms >= 60000) {
            stopRecording();
            return ms;
          }
          return ms + 1000;
        });
      }, 1000);
    } catch {
      setError("Microphone permission is required to record ride audio.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
    shouldUploadRef.current = true;
    if (recorder.state !== "inactive") recorder.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const uploadRecording = async () => {
    if (!recordedBlob) {
      setError("No audio captured. Try recording again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await blobToDataUrl(recordedBlob);
      const uploaded = await uploadSafetyAudio(dataUrl);
      const audioUrl = uploaded.url || uploaded.audio_url || "";
      await createSupportTicket({
        subject: `Safety audio · Ride ${ride.public_id || ride.id.slice(0, 8)}`,
        message: [
          "Passenger uploaded a safety audio recording during an active ride.",
          `Ride ID: ${ride.id}`,
          `Audio URL: ${audioUrl || "uploaded via /safety-audio"}`,
          `Captain: ${ride.driver?.name || "—"}`,
          `From: ${ride.pickup_address}`,
          `To: ${ride.dropoff_address}`,
        ].join("\n"),
        category: "safety",
        ride_id: ride.id,
        attachment: audioUrl ? undefined : dataUrl,
        priority: "high",
      });
      onToast(uploaded.message || "Safety audio uploaded and sent to support");
      setRecordedBlob(null);
      setPanel("menu");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload audio");
    } finally {
      setBusy(false);
      setRecordingMs(0);
    }
  };

  const actions = [
    {
      id: "audio" as const,
      title: "Record Audio",
      description: "Record your ride audio",
      icon: Mic,
      tone: "default" as const,
      onClick: () => setPanel("audio"),
    },
    {
      id: "report" as const,
      title: "Report Incident",
      description: "Send a report to support / admin",
      icon: ShieldAlert,
      tone: "warn" as const,
      onClick: () => setPanel("report"),
    },
    {
      id: "share" as const,
      title: "Share Live Location",
      description: "Share your current location",
      icon: Crosshair,
      tone: "default" as const,
      onClick: () => void handleShareLiveLocation(),
    },
    {
      id: "contacts" as const,
      title: "Emergency Contacts",
      description: "Manage emergency contacts",
      icon: UserRound,
      tone: "default" as const,
      onClick: () => setPanel("contacts"),
    },
    {
      id: "sos" as const,
      title: "Emergency / SOS",
      description: "Get immediate help",
      icon: Siren,
      tone: "danger" as const,
      onClick: () => void handleSos(),
    },
  ];

  const title =
    panel === "report"
      ? "Report incident"
      : panel === "contacts"
        ? "Emergency contacts"
        : panel === "audio"
          ? "Record audio"
          : "Safety Mode";

  const description =
    panel === "menu"
      ? "Tools to help you stay safe during this ride"
      : panel === "report"
        ? "Describe what happened. Support will review with your ride details."
        : panel === "contacts"
          ? "Used for SOS alerts during active rides."
          : "Recording is uploaded securely to Bull Wave Rides support.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-[28px] border-[#e8f0c8] bg-white px-0 pb-8"
      >
        <SheetHeader className="border-b border-[#eef5d4] px-5 pb-4 pt-2 text-left sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2563eb]">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <SheetTitle className="font-heading text-xl text-[#38471B]">
                {title}
              </SheetTitle>
              <SheetDescription className="text-sm text-[#5a6330]">
                {description}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-4 pt-3 sm:px-5">
          {panel !== "menu" ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setPanel("menu");
              }}
              className="mb-3 text-sm font-semibold text-[#B8D926]"
            >
              ← Back to Safety Mode
            </button>
          ) : null}

          {panel === "menu" ? (
            <ul className="space-y-1.5">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <li key={action.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={action.onClick}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition hover:bg-[#fcfef8] disabled:opacity-60"
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                          action.tone === "danger"
                            ? "bg-[#fff1f0] text-destructive"
                            : action.tone === "warn"
                              ? "bg-[#fff7ed] text-[#c45a00]"
                              : "bg-[#f4f9e4] text-[#B8D926]",
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-[15px] font-semibold",
                            action.tone === "danger"
                              ? "text-destructive"
                              : "text-[#38471B]",
                          )}
                        >
                          {action.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-[#5a6330]">
                          {action.description}
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-[#C8E84A]/70" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {panel === "report" ? (
            <div className="space-y-3">
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={5}
                placeholder="What happened? Include time, place, and any details that help support."
                className="w-full rounded-2xl border border-[#e8f0c8] bg-[#f7fbe8] px-4 py-3 text-sm text-[#38471B] outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                disabled={busy}
                onClick={() => void handleReportIncident()}
                className="h-12 w-full rounded-2xl bg-[#38471B] text-white hover:bg-[#2f3c17]"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit incident report"
                )}
              </Button>
            </div>
          ) : null}

          {panel === "contacts" ? (
            <div className="space-y-3">
              {contactsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#B8D926]" />
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-[#e8f0c8] bg-[#f7fbe8] p-4">
                    {contactName || contactPhone ? (
                      <>
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-[#B8D926] uppercase">
                          Saved contact
                        </p>
                        <p className="mt-1 font-heading text-base font-semibold text-[#38471B]">
                          {contactName || "Emergency contact"}
                        </p>
                        <p className="mt-0.5 text-sm text-[#5a6330]">
                          {contactPhone || "No phone saved"}
                        </p>
                      </>
                    ) : (
                      <div className="flex items-start gap-2 text-sm text-[#b45309]">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                          No emergency contact yet. Add one so SOS can reach
                          someone quickly.
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(ROUTES.profileEmergencyContact);
                    }}
                    className="h-12 w-full rounded-2xl bg-[#B8D926] font-semibold text-[#38471B] hover:bg-[#C8E84A]"
                  >
                    {contactName || contactPhone
                      ? "Update emergency contact"
                      : "Add emergency contact"}
                  </Button>
                </>
              )}
            </div>
          ) : null}

          {panel === "audio" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#e8f0c8] bg-[#f7fbe8] p-5 text-center">
                <p className="font-heading text-3xl font-semibold tabular-nums text-[#38471B]">
                  {String(Math.floor(recordingMs / 60000)).padStart(2, "0")}:
                  {String(Math.floor((recordingMs % 60000) / 1000)).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm text-[#5a6330]">
                  {recording
                    ? "Recording… tap stop when finished (max 60s)"
                    : busy
                      ? "Uploading to secure storage…"
                      : recordedBlob
                        ? "Recording complete. Report to support or discard."
                        : "Tap start to record ride audio"}
                </p>
              </div>

              {recordedBlob && !recording ? (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => void uploadRecording()}
                    className="h-12 w-full rounded-2xl bg-[#B8D926] font-semibold text-[#38471B] hover:bg-[#C8E84A]"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Report to support
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      setRecordedBlob(null);
                      setRecordingMs(0);
                      setError(null);
                    }}
                    className="h-11 w-full rounded-2xl border-[#dce8a8] font-semibold text-[#38471B]"
                  >
                    Discard recording
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (recording) stopRecording();
                    else void startRecording();
                  }}
                  className={cn(
                    "h-12 w-full rounded-2xl font-semibold",
                    recording
                      ? "bg-destructive text-white hover:bg-destructive/90"
                      : "bg-[#B8D926] text-[#38471B] hover:bg-[#C8E84A]",
                  )}
                >
                  {recording ? (
                    <span className="inline-flex items-center gap-2">
                      <MicOff className="h-4 w-4" />
                      Stop recording
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Start recording
                    </span>
                  )}
                </Button>
              )}
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
