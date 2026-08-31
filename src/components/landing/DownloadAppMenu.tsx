"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Apple, ChevronDown, Smartphone } from "lucide-react";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

type DownloadAppMenuProps = {
  className?: string;
  buttonClassName?: string;
  label?: string;
  /** Icon-only trigger for tight headers (phone). */
  compact?: boolean;
  align?: "left" | "right";
  androidApkUrl?: string;
  iosUrl?: string;
  iosUnavailableMessage?: string;
  androidOptionLabel?: string;
  iosOptionLabel?: string;
} & Pick<VariantProps<typeof buttonVariants>, "variant" | "size">;

export function DownloadAppMenu({
  className,
  buttonClassName,
  label = "Download App",
  compact = false,
  variant = "default",
  size = "default",
  align = "right",
  androidApkUrl = APP_DOWNLOAD.androidApkUrl,
  iosUrl = APP_DOWNLOAD.iosAppStoreUrl,
  iosUnavailableMessage = "iOS app link will be available soon.",
  androidOptionLabel = "Get it on Google Play",
  iosOptionLabel = "Download for iOS",
}: DownloadAppMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (containerRef.current && containerRef.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target))
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const btn =
        buttonRef.current ?? containerRef.current?.querySelector("button");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();

      const width = 248;
      const margin = 8;
      const preferLeft = align === "left";
      const left = preferLeft
        ? Math.max(margin, rect.left)
        : Math.min(window.innerWidth - width - margin, rect.right - width);

      const estimatedMenuHeight = 128;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < estimatedMenuHeight + margin;
      const top = openUpwards
        ? Math.max(margin, rect.top - estimatedMenuHeight - margin)
        : rect.bottom + margin;

      setMenuPosition({ top, left, width });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align]);

  const handleAndroidDownload = () => {
    window.open(androidApkUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleIosDownload = () => {
    if (iosUrl) {
      window.open(iosUrl, "_blank", "noopener,noreferrer");
    } else {
      window.alert(iosUnavailableMessage);
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-flex", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          buttonVariants({ variant, size: compact ? "icon-lg" : size }),
          "group relative isolate overflow-hidden rounded-full font-semibold tracking-wide text-[#14301A]",
          "bg-[#C6E31A] hover:bg-[#D4F04A]",
          "shadow-[0_8px_22px_-10px_rgba(27,58,34,0.4)]",
          "transition-[box-shadow,background-color,transform] duration-200",
          "hover:shadow-[0_12px_28px_-12px_rgba(27,58,34,0.45)]",
          "focus-visible:ring-2 focus-visible:ring-[#C6E31A]/50 focus-visible:ring-offset-2",
          "active:scale-[0.98]",
          compact ? "h-9 w-9 p-0 sm:h-10 sm:w-10" : "h-9 gap-1.5 px-3.5 text-[12px] sm:h-10 sm:px-5 sm:text-[13px]",
          open && "ring-2 ring-[#1B3A22]/15 ring-offset-2",
          buttonClassName,
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="relative z-[1] inline-flex items-center justify-center gap-1.5">
          {compact ? (
            <Smartphone className="h-4 w-4" strokeWidth={2.25} />
          ) : (
            <>
              <Smartphone className="hidden h-4 w-4 sm:inline" strokeWidth={2.25} />
              <span>{label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200 ease-out",
                  open && "rotate-180",
                )}
              />
            </>
          )}
        </span>
      </button>

      {mounted &&
        createPortal(
          open && menuPosition ? (
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[100] overflow-hidden rounded-2xl border border-[#E4E7E0] bg-white py-1.5 shadow-[0_18px_40px_-16px_rgba(17,20,17,0.35)]"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
              }}
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#111411] transition-colors hover:bg-[#C6E31A]/15"
                onClick={handleAndroidDownload}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C6E31A] text-[#111411]">
                  <Smartphone className="h-4 w-4" />
                </span>
                <span>
                  <span className="block leading-tight">{androidOptionLabel}</span>
                  <span className="mt-0.5 block text-[11px] font-normal text-[#5A6158]">
                    APK download
                  </span>
                </span>
              </button>

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#111411] transition-colors hover:bg-[#C6E31A]/15"
                onClick={handleIosDownload}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111411] text-[#C6E31A]">
                  <Apple className="h-4 w-4" />
                </span>
                <span>
                  <span className="block leading-tight">{iosOptionLabel}</span>
                  <span className="mt-0.5 block text-[11px] font-normal text-[#5A6158]">
                    App Store
                  </span>
                </span>
              </button>
            </div>
          ) : null,
          document.body,
        )}
    </div>
  );
}
