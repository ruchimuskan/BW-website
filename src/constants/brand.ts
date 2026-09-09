/**
 * BW Rides brand palette — single source of truth.
 * Keep in sync with `globals.css`.
 */
export const WAVEGO_BRAND = {
  primary: "#B8D926",
  primaryLight: "#C8E84A",
  primaryDark: "#9BB820",
  primaryDeep: "#6B7A14",
  /** Dark second shade — olive green (stats bars, dark sections, text on light) */
  primaryNight: "#38471B",
  /** Deepest olive for gradients and hero fades */
  primaryBlack: "#283614",
  /** Mid dark olive for gradient stops */
  primaryNightLight: "#4A5824",
  secondary: "#C8E84A",
  foreground: "#38471B",
  background: "#ffffff",
  muted: "#f7fbe8",
  mutedForeground: "#5a6330",
  success: "#5FA87A",
  warning: "#E8A95A",
  error: "#D66B6B",
  card: "#ffffff",
  primaryForeground: "#38471B",
} as const;

/** rgba overlays for images & hero sections */
export const WAVEGO_BRAND_RGB = {
  primary: "184, 217, 38",
  primaryLight: "200, 232, 74",
  primaryNight: "56, 71, 27",
  primaryBlack: "40, 54, 20",
  primaryNightLight: "74, 88, 36",
  primaryDeep: "107, 122, 20",
} as const;

export const WAVEGO_CONFETTI_COLORS = [
  WAVEGO_BRAND.secondary,
  WAVEGO_BRAND.primary,
  WAVEGO_BRAND.foreground,
  WAVEGO_BRAND.mutedForeground,
  WAVEGO_BRAND.success,
  WAVEGO_BRAND.warning,
] as const;
