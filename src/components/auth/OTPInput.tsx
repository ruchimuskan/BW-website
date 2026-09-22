"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function OTPInput({ length = 6, value, onChange, error }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const onChangeRef = useRef(onChange);
  const lastEmitted = useRef("");
  onChangeRef.current = onChange;

  useEffect(() => {
    if (value.length <= length) {
      const next = new Array(length).fill("");
      value.split("").forEach((char, index) => {
        next[index] = char;
      });
      setOtp(next);
    }
    // Parent-filled dummy/backend OTP never fires input onChange — emit once when complete.
    if (value.length === length && lastEmitted.current !== value) {
      lastEmitted.current = value;
      onChangeRef.current(value);
    }
    if (value.length < length) lastEmitted.current = "";
  }, [value, length]);

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    // Take the last character if user pastes or types multiple
    newOtp[index] = val.substring(val.length - 1);
    
    const combinedValue = newOtp.join("");
    setOtp(newOtp);
    onChange(combinedValue);

    // Move focus to next input
    if (val !== "" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Move focus to previous input on backspace if current is empty
        focusInput(index - 1);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    onChange(newOtp.join(""));
    
    // Focus next empty or last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    focusInput(nextIndex);
  };

  return (
    <div className="flex w-full min-w-0 justify-between gap-1.5 sm:gap-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-xl border bg-background text-center text-base font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 sm:h-14 sm:rounded-[16px] sm:text-lg",
            "max-w-12 sm:max-w-none",
            error
              ? "border-destructive focus:ring-destructive/30"
              : "border-input focus:border-primary focus:ring-primary/20",
            digit ? "border-primary" : ""
          )}
        />
      ))}
    </div>
  );
}
