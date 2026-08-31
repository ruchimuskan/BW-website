import { BRAND_PHOTOS, CAPTAIN_PARTNER_FALLBACKS } from "@/constants/brand-images";

/** Return src unchanged — do not auto-swap PNG→WebP (many assets are PNG-only in production). */
export function preferWebp(src: string): string {
  if (!src.startsWith("/images/")) return src;
  if (/captain-partner|captain_cta/i.test(src)) {
    return src.replace(/\.webp(\?.*)?$/i, ".png$1");
  }
  return src;
}

export function pngVariant(src: string): string | null {
  if (/\.webp(\?|$)/i.test(src)) return src.replace(/\.webp(\?.*)?$/i, ".png$1");
  if (/\.png(\?|$)/i.test(src)) return null;
  return null;
}

export function webpVariant(src: string): string | null {
  if (/\.png(\?|$)/i.test(src)) return src.replace(/\.png(\?.*)?$/i, ".webp$1");
  return null;
}

/** Ordered candidates: primary → png/webp twin → optional fallback. */
export function imageFallbackChain(
  src: string,
  fallbackSrc?: string,
): string[] {
  const preferred = preferWebp(src);
  const chain: string[] = [preferred];
  const png = pngVariant(preferred);
  if (png && png !== preferred) chain.push(png);
  const webp = webpVariant(preferred);
  if (webp && webp !== preferred && !chain.includes(webp)) chain.push(webp);
  if (src !== preferred && !chain.includes(src)) chain.push(src);
  const fallback = fallbackSrc ?? BRAND_PHOTOS.streetCab;
  if (!chain.includes(fallback)) chain.push(fallback);
  return chain;
}

export function captainImageFallbackChain(
  src: string = BRAND_PHOTOS.captain,
): string[] {
  const chain: string[] = [];
  for (const candidate of [src, ...CAPTAIN_PARTNER_FALLBACKS]) {
    if (candidate && !chain.includes(candidate)) chain.push(candidate);
  }
  return chain;
}

/** Local public assets skip the optimizer — faster and reliable on any host. */
export function shouldSkipImageOptimizer(src: string): boolean {
  return src.startsWith("/images/") || src.startsWith("/icon") || src.startsWith("/apple");
}

export function resolveBrandImageSrc(src: string): string {
  return preferWebp(src);
}
