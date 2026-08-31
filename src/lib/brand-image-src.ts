import { BRAND_PHOTOS, CAPTAIN_PARTNER_FALLBACKS } from "@/constants/brand-images";

/** Prefer WebP for local /images assets (smaller, faster). */
export function preferWebp(src: string): string {
  if (!src.startsWith("/images/")) return src;
  // Cover-flow illustrations + captain partner: PNG is the reliable source.
  // Journey tracks: keep webp (sharp-encoded) for speed; PNG fallback still exists.
  if (
    /\/img-(7|8|9|10|11|13)\.(png|webp)(\?|$)/i.test(src) ||
    /captain-partner|captain_cta/i.test(src)
  ) {
    return src.replace(/\.webp(\?.*)?$/i, ".png$1");
  }
  if (/\.webp(\?|$)/i.test(src)) return src;
  if (/\.png(\?|$)/i.test(src)) return src.replace(/\.png(\?.*)?$/i, ".webp$1");
  return src;
}

export function pngVariant(src: string): string | null {
  if (/\.webp(\?|$)/i.test(src)) return src.replace(/\.webp(\?.*)?$/i, ".png$1");
  return null;
}

/** Ordered candidates: webp → png → original → optional fallback. */
export function imageFallbackChain(
  src: string,
  fallbackSrc?: string,
): string[] {
  const preferred = preferWebp(src);
  const chain: string[] = [preferred];
  const png = pngVariant(preferred);
  if (png && png !== preferred) chain.push(png);
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
