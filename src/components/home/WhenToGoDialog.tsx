"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Loader2,
  Pencil,
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
      // bump to now+15m if somehow in the past
      const soon = new Date();
      soon.setMinutes(soon.getMinutes() + 15);
      onConfirm(soon.toISOString());
      return;
    }
    onConfirm(combined.toISOString());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-3 sm:items-center sm:p-4">
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
        className="relative z-[1] w-full max-w-sm overflow-hidden rounded-2xl border border-primary/12 bg-white shadow-[0_28px_64px_-24px_rgba(40,54,20,0.55)] sm:rounded-[1.35rem]"
      >
        <div className="border-b border-primary/8 px-5 pt-5 pb-3">
          <h2
            id="when-to-go-title"
            className="font-heading text-lg font-semibold text-[#B8D926]"
          >
            {step === "date" ? "Select ride date" : "Select ride time"}
          </h2>

          {step === "date" ? (
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="font-heading text-2xl font-semibold tracking-tight text-[#B8D926] sm:text-[1.65rem]">
                {selectedSummary}
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-primary/70">
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </div>
          ) : (
            <div className="mt-4 flex items-stretch justify-center gap-3">
              {editingTime ? (
                <input
                  autoFocus
                  value={timeDraft}
                  onChange={(e) => setTimeDraft(e.target.value)}
                  onBlur={commitTimeDraft}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTimeDraft();
                  }}
                  className="w-36 rounded-xl border border-primary/25 bg-[#ffffff] px-3 py-2 text-center font-heading text-2xl font-semibold text-[#B8D926] outline-none focus:ring-2 focus:ring-primary/30"
                  inputMode="numeric"
                  aria-label="Type time"
                />
              ) : (
                <div className="flex items-center gap-1.5 font-heading text-[2.35rem] font-semibold leading-none tracking-tight text-[#B8D926]">
                  <button
                    type="button"
                    onClick={() => setEditingTime(true)}
                    className="rounded-lg bg-primary px-2.5 py-1.5 text-white shadow-sm"
                  >
                    {String(hours12).padStart(2, "0")}
                  </button>
                  <span>:</span>
                  <button
                    type="button"
                    onClick={() => setEditingTime(true)}
                    className="rounded-lg px-2.5 py-1.5 hover:bg-primary/8"
                  >
                    {String(minutes).padStart(2, "0")}
                  </button>
                </div>
              )}
              <div className="flex flex-col overflow-hidden rounded-lg border border-primary/25">
                <button
                  type="button"
                  onClick={() => setIsPm(false)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold tracking-wide",
                    !isPm
                      ? "bg-primary text-white"
                      : "bg-white text-primary hover:bg-primary/5",
                  )}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setIsPm(true)}
                  className={cn(
                    "border-t border-primary/20 px-3 py-1.5 text-xs font-bold tracking-wide",
                    isPm
                      ? "bg-primary text-white"
                      : "bg-white text-primary hover:bg-primary/5",
                  )}
                >
                  PM
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-4 sm:px-5">
          {step === "date" ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#B8D926]"
                >
                  {monthLabel}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setViewMonth((m) => addMonths(m, -1))}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-primary hover:bg-primary/8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-primary hover:bg-primary/8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((d, i) => (
                  <span
                    key={`${d}-${i}`}
                    className="py-1 text-[11px] font-semibold text-[#4a5228]/70"
                  >
                    {d}
                  </span>
                ))}
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <span key={`empty-${index}`} className="h-10 sm:h-11" />;
                  }
                  const past = day.getTime() < today.getTime();
                  const selected = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={past}
                      onClick={() => setSelectedDate(startOfDay(day))}
                      className={cn(
                        "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors sm:h-11 sm:w-11",
                        past && "cursor-not-allowed text-[#b9a4c6]",
                        !past && !selected && "text-[#B8D926] hover:bg-primary/10",
                        selected && "bg-primary text-white shadow-sm",
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="relative mx-auto aspect-square w-[min(100%,16.5rem)]">
              <div className="absolute inset-0 rounded-full border border-primary/10 bg-[#ffffff]" />
              {/* clock hand */}
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 h-[38%] w-0.5 origin-bottom rounded-full bg-primary"
                style={{
                  transform: `translate(-50%, -100%) rotate(${(hours12 % 12) * 30}deg)`,
                }}
              />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
              {clockHours.map((h) => {
                const angle = (h % 12) * 30;
                const rad = ((angle - 90) * Math.PI) / 180;
                const r = 42;
                const x = 50 + r * Math.cos(rad);
                const y = 50 + r * Math.sin(rad);
                const active = hours12 === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours12(h)}
                    className={cn(
                      "absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      active
                        ? "bg-primary text-white shadow-md"
                        : "text-[#B8D926] hover:bg-primary/10",
                    )}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-primary/8 px-3 py-3 sm:px-4">
          {step === "time" ? (
            <button
              type="button"
              aria-label="Type time with keyboard"
              onClick={() => {
                setTimeDraft(
                  `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
                );
                setEditingTime(true);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-primary/8"
            >
              <Keyboard className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onLeaveNow?.() ?? onCancel()}
              className="rounded-lg px-3 py-2 text-xs font-semibold tracking-wide text-primary uppercase hover:bg-primary/5"
            >
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
              className="h-10 rounded-lg px-4 text-xs font-bold tracking-wide text-primary uppercase hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={confirming}
              onClick={handleOk}
              className="h-10 rounded-lg px-4 text-xs font-bold tracking-wide text-primary uppercase hover:bg-primary/5"
            >
              {confirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
