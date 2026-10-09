import type { Metadata } from "next";
import { BackendWarmup } from "@/components/BackendWarmup";
import { AuthSessionGuard } from "@/components/auth/AuthSessionGuard";
import { FloatingChatLazy } from "@/components/chat/FloatingChatLazy";
import { ScrollToTopOnNavigate } from "@/components/layout/ScrollToTopOnNavigate";
import { PageBackground } from "@/components/layout/PageBackground";
import {
  DEFAULT_SITE_DESCRIPTION,
  SITE_BRAND,
  SITE_BRAND_ALTERNATES,
  SITE_LOGO_ALT,
  SITE_LOGO_PATH,
  SITE_SHARE_IMAGE_PATH,
  absoluteUrl,
  organizationSameAs,
} from "@/constants/seo";
import { getSiteUrl } from "@/constants/site";
import { inter, playwriteEnglandJoined } from "@/lib/fonts";
import { curatedSeoSiteLinks, type SeoSiteLink } from "@/lib/seo-sitelinks";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_BRAND} · Book rides, parcels & ambulance for free`,
    template: `%s | ${SITE_BRAND}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  applicationName: SITE_BRAND,
  keywords: [
    "BW Rides",
    "Bull Wave Rides",
    "Bullwave Rides",
    "bike taxi",
    "auto rickshaw booking",
    "cab booking India",
    "parcel delivery",
    "book ambulance for free",
    "ride hailing",
    "book a ride",
    "drive with BW Rides",
  ],
  authors: [{ name: SITE_BRAND, url: siteUrl }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: SITE_LOGO_PATH, type: "image/png", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_BRAND,
    title: SITE_BRAND,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [
      {
        url: SITE_SHARE_IMAGE_PATH,
        width: 512,
        height: 512,
        alt: SITE_LOGO_ALT,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_BRAND,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [SITE_SHARE_IMAGE_PATH],
  },
  other: {
    "og:logo": `${siteUrl}${SITE_LOGO_PATH}`,
    "og:image:alt": SITE_LOGO_ALT,
  },
  robots: {
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
  alternates: {
    canonical: "/",
  },
};

function buildSiteGraph(siteLinks: SeoSiteLink[]) {
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const sameAs = organizationSameAs();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_BRAND,
        alternateName: [...SITE_BRAND_ALTERNATES],
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#logo`,
          url: `${siteUrl}${SITE_LOGO_PATH}`,
          contentUrl: `${siteUrl}${SITE_LOGO_PATH}`,
          caption: SITE_BRAND,
          width: 512,
          height: 512,
          encodingFormat: "image/png",
        },
        image: {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#logo`,
          url: `${siteUrl}${SITE_LOGO_PATH}`,
          contentUrl: `${siteUrl}${SITE_LOGO_PATH}`,
          caption: SITE_BRAND,
          width: 512,
          height: 512,
        },
        description: DEFAULT_SITE_DESCRIPTION,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_BRAND,
        alternateName: [...SITE_BRAND_ALTERNATES],
        url: siteUrl,
        description: DEFAULT_SITE_DESCRIPTION,
        image: `${siteUrl}${SITE_LOGO_PATH}`,
        publisher: { "@id": organizationId },
        inLanguage: "en-IN",
        hasPart: { "@id": `${siteUrl}/#sitelinks` },
        mainEntity: { "@id": `${siteUrl}/#sitelinks` },
      },
      {
        "@type": "TaxiService",
        "@id": `${siteUrl}/#service`,
        name: SITE_BRAND,
        url: siteUrl,
        description: DEFAULT_SITE_DESCRIPTION,
        provider: { "@id": organizationId },
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        serviceType: [
          "Bike taxi",
          "Auto rickshaw",
          "Cab booking",
          "Parcel delivery",
          "Book ambulance for free",
        ],
      },
      ...siteLinks.map((page, index) => ({
        "@type": "SiteNavigationElement",
        "@id": `${siteUrl}/#nav-${index + 1}`,
        position: index + 1,
        name: page.name,
        description: page.sitelinkDescription,
        url: absoluteUrl(page.path),
      })),
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#sitelinks`,
        name: `${SITE_BRAND} popular pages`,
        numberOfItems: siteLinks.length,
        itemListElement: siteLinks.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: page.name,
          description: page.sitelinkDescription,
          url: absoluteUrl(page.path),
          item: {
            "@type": "WebPage",
            name: page.title,
            description: page.description,
            url: absoluteUrl(page.path),
          },
        })),
      },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildSiteGraph(curatedSeoSiteLinks());

  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://api.bullwaverides.com" />
        <link rel="dns-prefetch" href="https://api.bullwaverides.com" />
        <link rel="preload" as="image" href={SITE_LOGO_PATH} type="image/png" />
        <link rel="image_src" href={SITE_LOGO_PATH} />
      </head>
      <body
        className={`${inter.variable} ${playwriteEnglandJoined.variable} font-sans antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BackendWarmup />
        <AuthSessionGuard />
        <ScrollToTopOnNavigate />
        <PageBackground />
        <div className="bw-page-root relative z-10 flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip">
          {children}
        </div>
        <FloatingChatLazy />
      </body>
    </html>
  );
}
