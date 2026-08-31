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
  SITE_LINK_PAGES,
  absoluteUrl,
} from "@/constants/seo";
import { getSiteUrl } from "@/constants/site";
import { inter, playwriteEnglandJoined } from "@/lib/fonts";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_BRAND,
    template: `%s | ${SITE_BRAND}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  applicationName: SITE_BRAND,
  keywords: [
    "Bull Wave Rides",
    "Bullwave Rides",
    "BW Rides",
    "bike taxi",
    "auto rickshaw booking",
    "cab booking India",
    "parcel delivery",
    "ambulance SOS",
    "ride hailing",
    "book a ride",
    "drive with Bull Wave Rides",
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
      { url: "/images/bwride.png", type: "image/png", sizes: "any" },
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
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_BRAND,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_BRAND,
    description: DEFAULT_SITE_DESCRIPTION,
    images: ["/twitter-image"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  const jsonLd = {
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
          url: `${siteUrl}/images/bwride.png`,
        },
        description: DEFAULT_SITE_DESCRIPTION,
        sameAs: [] as string[],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_BRAND,
        alternateName: [...SITE_BRAND_ALTERNATES],
        url: siteUrl,
        description: DEFAULT_SITE_DESCRIPTION,
        publisher: { "@id": organizationId },
        inLanguage: "en-IN",
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
          "Ambulance SOS",
        ],
      },
      ...SITE_LINK_PAGES.map((page, index) => ({
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
        numberOfItems: SITE_LINK_PAGES.length,
        itemListElement: SITE_LINK_PAGES.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: page.name,
          description: page.sitelinkDescription,
          url: absoluteUrl(page.path),
          item: absoluteUrl(page.path),
        })),
      },
    ],
  };

  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://api.bullwaverides.com" />
        <link rel="dns-prefetch" href="https://api.bullwaverides.com" />
        <link rel="preload" as="image" href="/images/bwride.png" />
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
        <div className="bw-page-root relative z-10 min-h-dvh w-full min-w-0">
          {children}
        </div>
        <FloatingChatLazy />
      </body>
    </html>
  );
}
