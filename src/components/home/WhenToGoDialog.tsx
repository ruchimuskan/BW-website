"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Keyboard,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addMonths,
  combineDateAndTime,
  hours12To24,
  isSameDay,
  startOfDay,
  toLocalInputParts,
} from "@/lib/schedule-api";
import { cn } from "@/lib/utils";

type Step = "date" | "time";

type WhenToGoDialogProps = {
  open: boolean;
  initialIso?: string | null;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: (iso: string) => void;
  onLeaveNow?: () => void;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const MINUTE_CHIPS = [0, 15, 30, 45] as const;

const INK = "#111411";
const MUTED = "#5a6330";
const LIME = "#C6E31A";
const SURFACE = "#f7f9f0";

export function WhenToGoDialog({
  open,
  initialIso,
  confirming = false,
  onCancel,
  onConfirm,
  onLeaveNow,
}: WhenToGoDialogProps) {
  const [step, setStep] = useState<Step>("date");
  const [viewMonth, setViewMonth] = useState(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [hours12, setHours12] = useState(11);
  const [minutes, setMinutes] = useState(0);
  const [isPm, setIsPm] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [timeDraft, setTimeDraft] = useState("11:00");

  useEffect(() => {
    if (!open) return;
    const base = initialIso ? new Date(initialIso) : new Date();
    const safe = Number.isNaN(base.getTime()) ? new Date() : base;
    if (!initialIso) {
      safe.setMinutes(safe.getMinutes() + 20);
    }
    setStep("date");
    setSelectedDate(startOfDay(safe));
    setViewMonth(startOfDay(new Date(safe.getFullYear(), safe.getMonth(), 1)));
    const parts = toLocalInputParts(safe);
    setHours12(parts.hours12);
    setMinutes(parts.minutes);
    setIsPm(parts.isPm);
    setEditingTime(false);
    setTimeDraft(
      `${String(parts.hours12).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}`,
    );
  }, [open, initialIso]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const selectedSummary = selectedDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const monthLabel = viewMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const clockHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const previewLabel = useMemo(() => {
    const hours24 = hours12To24(hours12, isPm);
    const combined = combineDateAndTime(selectedDate, hours24, minutes);
    const time = combined.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    const isToday = isSameDay(selectedDate, today);
    return isToday ? `Today · ${time}` : `${selectedSummary} · ${time}`;
  }, [hours12, isPm, minutes, selectedDate, selectedSummary, today]);

  if (!open) return null;

  const commitTimeDraft = () => {
    const match = timeDraft.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h < 1 || h > 12 || m < 0 || m > 59) return;
    setHours12(h);
    setMinutes(m);
    setEditingTime(false);
  };

  const handleOk = () => {
    if (step === "date") {
      setStep("time");
      return;
    }
    const hours24 = hours12To24(hours12, isPm);
    const combined = combineDateAndTime(selectedDate, hours24, minutes);
    if (combined.getTime() < Date.now() - 60_000) {
      const soon = new Date();
      soon.setMinutes(soon.getMinutes() + 15);
      onConfirm(soon.toISOString());
      return;
    }
    onConfirm(combined.toISOString());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#111411]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="when-to-go-title"
        className={cn(
          "relative z-[1] flex w-full max-h-[min(92dvh,40rem)] flex-col overflow-hidden",
          "rounded-t-[1.5rem] border border-[#dce8a8]/80 bg-white shadow-[0_28px_64px_-20px_rgba(17,20,17,0.55)]",
          "sm:max-w-[22.5rem] sm:rounded-[1.35rem] md:max-w-md",
          "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[#d5dcc0] sm:hidden" aria-hidden />

        <div
          className="shrink-0 border-b border-[#e8eed8] px-4 pt-3 pb-3 sm:px-5 sm:pt-5 sm:pb-3.5"
          style={{ background: `linear-gradient(180deg, ${SURFACE} 0%, #ffffff 100%)` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#5a7a12] sm:text-[11px]">
                Schedule pickup
              </p>
              <h2
                id="when-to-go-title"
                className="mt-1 font-heading text-lg font-semibold tracking-tight sm:text-xl"
                style={{ color: INK }}
              >
                {step === "date" ? "Select ride date" : "Select ride time"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e0e6d0] bg-white text-[#5a6330] transition hover:border-[#C6E31A]/60 hover:bg-[#C6E31A]/15"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          {step === "date" ? (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-[#e0e8c8] bg-white px-3 py-2.5 sm:mt-3.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: LIME }}
              >
                <CalendarDays className="h-4 w-4" style={{ color: INK }} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#5a7a12]">
                  Pickup day
                </p>
                <p
                  className="truncate font-heading text-xl font-semibold tracking-tight sm:text-[1.35rem]"
                  style={{ color: INK }}
                >
                  {selectedSummary}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3 sm:mt-3.5">
              <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                {editingTime ? (
                  <input
                    autoFocus
                    value={timeDraft}
                    onChange={(e) => setTimeDraft(e.target.value)}
                    onBlur={commitTimeDraft}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitTimeDraft();
                    }}
                    className="w-[8.5rem] rounded-xl border border-[#C6E31A]/55 bg-white px-3 py-2 text-center font-heading text-2xl font-semibold outline-none focus:ring-2 focus:ring-[#C6E31A]/35 sm:w-40 sm:text-[1.75rem]"
                    style={{ color: INK }}
                    inputMode="numeric"
                    aria-label="Type time"
                  />
                ) : (
                  <div
                    className="flex items-center gap-1 font-heading text-[2.1rem] font-semibold leading-none tracking-tight sm:text-[2.45rem]"
                    style={{ color: INK }}
                  >
                    <button
                      type="button"
                      onClick={() => setEditingTime(true)}
                      className="rounded-xl px-2.5 py-1.5 shadow-sm sm:px-3"
                      style={{ backgroundColor: LIME, color: INK }}
                    >
                      {String(hours12).padStart(2, "0")}
                    </button>
                    <span className="px-0.5 text-[#7a8448]">:</span>
                    <button
                      type="button"
                      onClick={() => setEditingTime(true)}
                      className="rounded-xl border border-[#e0e6d0] bg-white px-2.5 py-1.5 hover:border-[#C6E31A]/50 hover:bg-[#C6E31A]/12 sm:px-3"
                    >
                      {String(minutes).padStart(2, "0")}
                    </button>
                  </div>
                )}
                <div className="flex flex-col overflow-hidden rounded-xl border border-[#dce8a8]">
                  <button
                    type="button"
                    onClick={() => setIsPm(false)}
                    className={cn(
                      "min-w-[3.25rem] px-3 py-1.5 text-xs font-bold tracking-wide transition",
                      !isPm
                        ? "bg-[#C6E31A] text-[#111411]"
                        : "bg-white text-[#5a6330] hover:bg-[#C6E31A]/12",
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPm(true)}
                    className={cn(
                      "min-w-[3.25rem] border-t border-[#dce8a8] px-3 py-1.5 text-xs font-bold tracking-wide transition",
                      isPm
                        ? "bg-[#C6E31A] text-[#111411]"
                        : "bg-white text-[#5a6330] hover:bg-[#C6E31A]/12",
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>
              <p className="text-center text-xs font-medium sm:text-[13px]" style={{ color: MUTED }}>
                {previewLabel}
              </p>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 py-3.5 sm:px-5 sm:py-4">
          {step === "date" ? (
            <>
              <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3">
                <p
                  className="font-heading text-[15px] font-semibold tracking-tight sm:text-base"
                  style={{ color: INK }}
                >
                  {monthLabel}
                </p>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setViewMonth((m) => addMonths(m, -1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#1B3A22] transition hover:bg-[#C6E31A]/18 sm:h-11 sm:w-11"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#1B3A22] transition hover:bg-[#C6E31A]/18 sm:h-11 sm:w-11"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center sm:gap-1">
                {WEEKDAYS.map((d, i) => (
                  <span
                    key={`${d}-${i}`}
                    className="py-1 text-[10px] font-semibold tracking-wide text-[#7a8448] sm:text-[11px]"
                  >
                    {d}
                  </span>
                ))}
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <span key={`empty-${index}`} className="h-9 sm:h-11" />;
                  }
                  const past = day.getTime() < today.getTime();
                  const selected = isSameDay(day, selectedDate);
                  const isTodayCell = isSameDay(day, today);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={past}
                      onClick={() => setSelectedDate(startOfDay(day))}
                      className={cn(
                        "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-colors sm:h-11 sm:w-11 sm:text-sm",
                        past && "cursor-not-allowed text-[#c5cbb4]",
                        !past && !selected && "text-[#111411] hover:bg-[#C6E31A]/20",
                        !past && !selected && isTodayCell && "ring-1 ring-[#C6E31A]/55",
                        selected && "bg-[#C6E31A] text-[#111411] shadow-sm",
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative mx-auto aspect-square w-[min(100%,15.5rem)] sm:w-[min(100%,17rem)]">
                <div
                  className="absolute inset-0 rounded-full border border-[#e0e8c8]"
                  style={{ background: `radial-gradient(circle at 50% 42%, #ffffff 0%, ${SURFACE} 72%, #eef2e0 100%)` }}
                />
                <div
                  aria-hidden
                  className="absolute left-1/2 top-1/2 h-[36%] w-[3px] origin-bottom rounded-full"
                  style={{
                    backgroundColor: LIME,
                    transform: `translate(-50%, -100%) rotate(${(hours12 % 12) * 30}deg)`,
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: INK }}
                />
                {clockHours.map((h) => {
                  const angle = (h % 12) * 30;
                  const rad = ((angle - 90) * Math.PI) / 180;
                  const r = 40;
                  const x = 50 + r * Math.cos(rad);
                  const y = 50 + r * Math.sin(rad);
                  const active = hours12 === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours12(h)}
                      className={cn(
                        "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[13px] font-semibold transition-colors sm:h-9 sm:w-9 sm:text-sm",
                        active
                          ? "bg-[#C6E31A] text-[#111411] shadow-md"
                          : "text-[#111411] hover:bg-[#C6E31A]/22",
                      )}
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>

              <div>
                <p className="mb-2 text-center text-[10px] font-semibold tracking-[0.14em] uppercase text-[#5a7a12]">
                  Minutes
                </p>
                <div className="mx-auto flex max-w-[17rem] flex-wrap justify-center gap-1.5 sm:gap-2">
                  {MINUTE_CHIPS.map((m) => {
                    const active = minutes === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMinutes(m)}
                        className={cn(
                          "min-h-9 min-w-[3.25rem] rounded-full border px-3 text-sm font-semibold transition",
                          active
                            ? "border-[#C6E31A] bg-[#C6E31A] text-[#111411]"
                            : "border-[#e0e6d0] bg-white text-[#111411] hover:border-[#C6E31A]/55 hover:bg-[#C6E31A]/12",
                        )}
                      >
                        :{String(m).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#e8eed8] bg-[#fbfcf7] px-3 py-2.5 sm:px-4 sm:py-3">
          {step === "time" ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Back to date"
                onClick={() => setStep("date")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#1B3A22] transition hover:bg-[#C6E31A]/18"
              >
                <CalendarDays className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Type time with keyboard"
                onClick={() => {
                  setTimeDraft(
                    `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
                  );
                  setEditingTime(true);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#1B3A22] transition hover:bg-[#C6E31A]/18"
              >
                <Keyboard className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onLeaveNow?.() ?? onCancel()}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold tracking-wide text-[#1B3A22] uppercase transition hover:bg-[#C6E31A]/18"
            >
              <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
              Leave now
            </button>
          )}

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (step === "time") setStep("date");
                else onCancel();
              }}
              className="h-10 rounded-xl px-3.5 text-xs font-bold tracking-wide text-[#5a6330] uppercase hover:bg-[#e8eed8]/70 hover:text-[#111411]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={confirming}
              onClick={handleOk}
              className="h-10 min-w-[4.5rem] rounded-xl bg-[#C6E31A] px-4 text-xs font-bold tracking-wide text-[#111411] uppercase hover:bg-[#D4F04A]"
            >
              {confirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === "date" ? (
                "Next"
              ) : (
                "OK"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
