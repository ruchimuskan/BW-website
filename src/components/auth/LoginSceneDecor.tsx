"use client";

import { WAVEGO_BRAND, WAVEGO_BRAND_RGB } from "@/constants/brand";

/** Soft brand atmosphere behind login / signup. */
export function LoginSceneDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#fbfcf6]" />

      <div
        className="absolute -left-[18%] -top-[22%] h-[58vmin] w-[58vmin] rounded-full opacity-90 blur-3xl"
        style={{
          background: `radial-gradient(circle, rgba(${WAVEGO_BRAND_RGB.primaryLight},0.55) 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute -right-[12%] top-[8%] h-[48vmin] w-[48vmin] rounded-full opacity-80 blur-3xl"
        style={{
          background: `radial-gradient(circle, rgba(${WAVEGO_BRAND_RGB.primary},0.28) 0%, transparent 68%)`,
        }}
      />
      <div
        className="absolute bottom-[-20%] left-[28%] h-[42vmin] w-[70vmin] rounded-full opacity-70 blur-3xl"
        style={{
          background: `radial-gradient(ellipse, rgba(${WAVEGO_BRAND_RGB.primaryNight},0.08) 0%, transparent 70%)`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 78% 42%, rgba(${WAVEGO_BRAND_RGB.primaryNight},0.04), transparent 58%), radial-gradient(ellipse 55% 45% at 18% 70%, rgba(${WAVEGO_BRAND_RGB.primary},0.12), transparent 55%)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(${WAVEGO_BRAND.primary}14 1px, transparent 1px), linear-gradient(90deg, ${WAVEGO_BRAND.primary}14 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      <div className="wavego-dot-grid absolute inset-0 opacity-[0.08]" />
    </div>
  );
}
