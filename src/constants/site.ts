/** Public user website — matches Flutter `AppConfig.websiteBaseUrl`. */
export const PRODUCTION_SITE_URL = "https://bullwaverides.com";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL)
    .trim()
    .replace(/\/+$/, "");
}
