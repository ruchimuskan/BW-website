import type { Metadata } from "next";
import { SITE_BRAND, SITE_SHARE_IMAGE_PATH } from "@/constants/seo";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** When true, title is used as-is (already includes brand). */
  absoluteTitle?: boolean;
  keywords?: string[];
  noIndex?: boolean;
};

/** Consistent metadata + canonicals for public marketing pages. */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = true,
  keywords,
  noIndex = false,
}: PageMetaInput): Metadata {
  const resolvedTitle = absoluteTitle ? title : `${title} | ${SITE_BRAND}`;

  return {
    title: { absolute: resolvedTitle },
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: SITE_BRAND,
      title: resolvedTitle,
      description,
      images: [
        {
          url: SITE_SHARE_IMAGE_PATH,
          width: 512,
          height: 512,
          alt: `${SITE_BRAND} logo`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: resolvedTitle,
      description,
      images: [SITE_SHARE_IMAGE_PATH],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
