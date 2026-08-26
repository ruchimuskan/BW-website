"use client";

import { useEffect, useId, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

/** Custom image picker — avoids buggy default file-input chrome. */
export function ImageUploadField({
  label,
  hint = "JPG, PNG or WEBP · max 8 MB",
  file,
  onChange,
  error,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (next: File | null) => {
    if (!next) {
      onChange(null);
      return;
    }
    if (!next.type.startsWith("image/")) return;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-semibold text-[#38471B]">
          {label}
        </label>
        {file ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#B8D926] hover:text-[#C8E84A]"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pick(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "group relative flex min-h-[9.5rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-4 py-5 text-center transition-all",
          dragOver
            ? "border-[#C8E84A] bg-[#f4f9e4]"
            : error
              ? "border-destructive/40 bg-destructive/5"
              : file
                ? "border-[#C8E84A]/45 bg-white"
                : "border-[#dce8a8] bg-[#ffffff] hover:border-[#C8E84A]/50 hover:bg-white",
        )}
      >
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />

        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={`${label} preview`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#B8D926]/15 to-[#C8E84A]/20 text-[#B8D926] transition group-hover:scale-105">
              <ImagePlus className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[#38471B]">
              Tap to upload or drag & drop
            </p>
            <p className="mt-1 text-xs text-[#5a6330]">{hint}</p>
          </>
        )}

        {preview ? (
          <span className="absolute inset-0 bg-gradient-to-t from-[#38471B]/55 via-transparent to-transparent" />
        ) : null}
        {file ? (
          <span className="absolute bottom-3 left-3 right-3 flex items-center gap-2 truncate rounded-full border border-white/25 bg-[#38471B]/80 px-3 py-1.5 text-left text-[11px] font-medium text-white backdrop-blur-sm">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#C8E84A]" />
            <span className="truncate">{file.name}</span>
          </span>
        ) : null}
      </label>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function FormFieldShell({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-[#38471B]">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-[#5a6330]">{hint}</p> : null}
    </div>
  );
}

export function SoftSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-[#5a6330]">
      <Loader2 className="h-7 w-7 animate-spin text-[#B8D926]" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
