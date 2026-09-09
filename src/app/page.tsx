import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingView } from "@/components/landing";
import { landingFaqItems } from "@/constants/landing-faq";
import {
  absoluteUrl,
  DEFAULT_SITE_DESCRIPTION,
  SITE_BRAND,
  SITE_LINK_PAGES,
} from "@/constants/seo";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = {
  ...pageMetadata({
    title: SITE_BRAND,
    description: DEFAULT_SITE_DESCRIPTION,
    path: "/",
    keywords: [
      "BW Rides",
      "book a ride online",
      "bike taxi India",
      "auto rickshaw booking",
      "cab booking",
      "parcel delivery",
      "ambulance SOS",
      "live tracking rides",
      "verified captains",
    ],
  }),
};

function LandingFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-transparent px-4">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
        aria-label="Loading"
      />
    </div>
  );
}

export default function LandingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landingFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const site = absoluteUrl("/");

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site}/#webpage`,
    url: site,
    name: SITE_BRAND,
    description: DEFAULT_SITE_DESCRIPTION,
    isPartOf: { "@id": `${site}/#website` },
    about: { "@id": `${site}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl("/opengraph-image"),
    },
    inLanguage: "en-IN",
    significantLink: SITE_LINK_PAGES.map((page) => absoluteUrl(page.path)),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Suspense fallback={<LandingFallback />}>
        <LandingView />
      </Suspense>
    </>
  );
}
