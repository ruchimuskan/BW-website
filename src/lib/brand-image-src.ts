import { BRAND_PHOTOS } from "@/constants/brand-images";

/** Prefer WebP for local /images assets (smaller, faster). */
export function preferWebp(src: string): string {
  if (!src.startsWith("/images/")) return src;
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

export function resolveBrandImageSrc(src: string): string {
  return preferWebp(src);
}
