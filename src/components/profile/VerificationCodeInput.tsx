"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VerificationCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function VerificationCodeInput({
  length = 6,
  value,
  onChange,
  error = false,
  autoFocus = true,
  disabled = false,
}: VerificationCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(() => new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const next = new Array(length).fill("");
    value.split("").forEach((char, index) => {
      if (index < length) next[index] = char;
    });
    setDigits(next);
  }, [value, length]);

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const updateDigits = (next: string[]) => {
    setDigits(next);
    onChange(next.join(""));
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    // Support paste-like multi-digit entry into one box
    if (val.length > 1) {
      const next = new Array(length).fill("");
      val.slice(0, length).split("").forEach((char, i) => {
        next[i] = char;
      });
      updateDigits(next);
      focusInput(Math.min(val.length, length) - 1);
      return;
    }

    const next = [...digits];
    next[index] = val.slice(-1);
    updateDigits(next);

    if (index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index] === "" && index > 0) {
        focusInput(index - 1);
        const next = [...digits];
        next[index - 1] = "";
        updateDigits(next);
      } else {
        const next = [...digits];
        next[index] = "";
        updateDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = new Array(length).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    updateDigits(next);
    focusInput(Math.min(pasted.length, length) - 1);
  };

  return (
    <div
      className="flex w-full max-w-md flex-wrap justify-center gap-2 sm:gap-3"
      role="group"
      aria-label={`${length}-digit verification code`}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "h-12 w-11 rounded-xl text-center text-lg font-semibold text-[#38471B] transition-all focus:outline-none focus:ring-2 sm:h-14 sm:w-12 md:w-14",
            error
              ? "border border-destructive bg-destructive/5 focus:ring-destructive/20"
              : digit
                ? "border border-primary bg-white focus:ring-primary/20"
                : "border border-[#eef5d4] bg-[#fcfef8] focus:border-primary focus:bg-white focus:ring-primary/20",
            disabled && "cursor-not-allowed opacity-60",
          )}
        />
      ))}
    </div>
  );
}
