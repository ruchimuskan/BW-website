"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
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

      const width = 240;
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
      {/* Soft static glow — no continuous paint work */}
      {!reduceMotion && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-3px] -z-10 rounded-full bg-primary/25 blur-[10px]"
        />
      )}

      <motion.button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        whileHover={
          reduceMotion
            ? undefined
            : { y: compact ? 0 : -2, scale: 1.02, transition: { duration: 0.2 } }
        }
        whileTap={reduceMotion ? undefined : { scale: 0.97, y: 0 }}
        className={cn(
          buttonVariants({ variant, size: compact ? "icon-lg" : size }),
          "group relative isolate overflow-hidden rounded-full font-semibold tracking-wide",
          "shadow-[0_10px_26px_-12px_rgba(184,217,38,0.7)]",
          "transition-[box-shadow,background-color] duration-200",
          "hover:shadow-[0_18px_36px_-14px_rgba(184,217,38,0.8)]",
          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          compact ? "h-10 w-10 p-0" : "h-9 px-4 text-sm sm:px-5",
          open && "ring-2 ring-primary/30 ring-offset-2",
          buttonClassName,
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <span className="relative z-[1] inline-flex items-center justify-center gap-1.5">
          {compact ? (
            <Smartphone className="h-4 w-4" strokeWidth={2} />
          ) : (
            <>
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
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && menuPosition ? (
              <motion.div
                ref={menuRef}
                role="menu"
                initial={
                  reduceMotion ? false : { opacity: 0, y: -8, scale: 0.96 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, y: -6, scale: 0.97 }
                }
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="fixed z-[100] overflow-hidden rounded-2xl border border-primary/15 bg-white/95 py-1.5 shadow-[0_22px_48px_-18px_rgba(184,217,38,0.5)] backdrop-blur-md"
                style={{
                  top: menuPosition.top,
                  left: menuPosition.left,
                  width: menuPosition.width,
                }}
              >
                <motion.button
                  type="button"
                  role="menuitem"
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04, duration: 0.18 }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/8 hover:text-primary"
                  onClick={handleAndroidDownload}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Smartphone className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block leading-tight">
                      {androidOptionLabel}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      APK download
                    </span>
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  role="menuitem"
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08, duration: 0.18 }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/8 hover:text-primary"
                  onClick={handleIosDownload}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Apple className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block leading-tight">{iosOptionLabel}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      App Store
                    </span>
                  </span>
                </motion.button>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
