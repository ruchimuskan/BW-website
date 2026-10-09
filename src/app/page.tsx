import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingView } from "@/components/landing";
import { LandingHeader } from "@/components/landing/LandingHeader";
import {
  absoluteUrl,
  DEFAULT_SITE_DESCRIPTION,
  SITE_BRAND,
} from "@/constants/seo";
import { pageMetadata } from "@/lib/page-metadata";
import { fetchLandingFaqs, fetchLandingServices } from "@/lib/landing-api";
import { curatedSeoSiteLinks } from "@/lib/seo-sitelinks";

export const revalidate = 60;

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${SITE_BRAND} · Book rides, parcels & ambulance for free`,
    description: DEFAULT_SITE_DESCRIPTION,
    path: "/",
    keywords: [
      "BW Rides",
      "Bull Wave Rides",
      "book a ride online",
      "bike taxi India",
      "auto rickshaw booking",
      "cab booking",
      "parcel delivery",
      "book ambulance for free",
      "live tracking rides",
      "verified captains",
    ],
  }),
};

function LandingFallback() {
  return (
    <>
      <LandingHeader variant="luxury" />
      <div className="flex min-h-[50vh] items-center justify-center bg-transparent px-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
          aria-label="Loading"
        />
      </div>
    </>
  );
}

export default function LandingPage() {
  const siteLinks = curatedSeoSiteLinks();
  const site = absoluteUrl("/");

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site}/#webpage`,
    url: site,
    name: `${SITE_BRAND} · Book rides, parcels & ambulance for free`,
    description: DEFAULT_SITE_DESCRIPTION,
    isPartOf: { "@id": `${site}/#website` },
    about: { "@id": `${site}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": `${site}/#logo`,
      url: absoluteUrl("/images/bwride.png"),
      contentUrl: absoluteUrl("/images/bwride.png"),
      caption: SITE_BRAND,
      width: 512,
      height: 512,
      encodingFormat: "image/png",
      representativeOfPage: true,
    },
    image: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/bwride.png"),
      contentUrl: absoluteUrl("/images/bwride.png"),
      caption: SITE_BRAND,
      width: 512,
      height: 512,
    },
    inLanguage: "en-IN",
    significantLink: siteLinks.map((page) => absoluteUrl(page.path)),
    relatedLink: siteLinks.map((page) => absoluteUrl(page.path)),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Suspense fallback={<LandingFallback />}>
        <LandingWithBackend />
      </Suspense>
    </>
  );
}

async function LandingWithBackend() {
  const [faqs, services] = await Promise.all([
    fetchLandingFaqs(),
    fetchLandingServices(),
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.slice(0, 8).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      {faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <LandingView faqs={faqs} initialServices={services} />
    </>
  );
}
