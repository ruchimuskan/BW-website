/** Shared media allowlist — middleware, route access, and image loading. */

export const MEDIA_PATH_PREFIXES = [
  "/_next/image",
  "/_next/static/media",
  "/images/",
  "/images/pages/",
  "/images/blogs/",
  "/images/gallery/",
  "/images/services/",
  "/images/features/",
  "/images/landing/",
  "/images/chat/",
  "/gallery/",
  "/landing/",
  "/uploads/",
  "/brand/",
  "/icons/",
  "/media/",
  "/assets/",
  "/static/",
  "/files/",
  "/photos/",
  "/photo/",
  "/img/",
  "/imgs/",
  "/pics/",
  "/pictures/",
  "/covers/",
  "/cover/",
  "/cdn/",
  "/services/",
  "/fonts/",
  "/chat/",
] as const;

export const MEDIA_EXT =
  /\.(?:svg|png|jpe?g|jfif|gif|webp|avif|ico|bmp|tiff?|heic|heif)$/i;

export const STATIC_ASSET_EXT =
  /\.(?:svg|png|jpe?g|jfif|gif|webp|avif|ico|bmp|tiff?|heic|heif|txt|xml|webmanifest|apk|woff2?|ttf|otf|mp4|webm|css|js|map)$/i;

function matchesPrefix(pathname: string, prefix: string) {
  if (prefix.endsWith("/")) {
    return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix);
  }
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isMediaPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || pathname;
  if (MEDIA_EXT.test(path)) return true;
  return MEDIA_PATH_PREFIXES.some((prefix) => matchesPrefix(path, prefix));
}

export function isStaticAssetPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || pathname;
  if (isMediaPath(path)) return true;
  if (STATIC_ASSET_EXT.test(path)) return true;
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/opengraph-image") ||
    path.startsWith("/twitter-image") ||
    path.startsWith("/icon") ||
    path.startsWith("/apple-icon") ||
    path.startsWith("/apple-touch-icon") ||
    path.startsWith("/favicon") ||
    path.startsWith("/chat/")
  ) {
    return true;
  }
  return false;
}

export function isCacheableMediaPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || pathname;
  return isMediaPath(path) || MEDIA_EXT.test(path);
}
