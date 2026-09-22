import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeView } from "@/components/home";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Home | BW Rides",
  description:
    "Book rides, parcels, and ambulance with live tracking from your BW Rides home.",
  path: "/home",
  noIndex: true,
});

function HomeFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted text-muted-foreground">
      Loading…
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/images/pic-14.png" type="image/png" />
      <link rel="preload" as="image" href="/images/gallery/shoot-auto.png" type="image/png" />
      <link rel="preload" as="image" href="/images/services/e-rickshaw.png" type="image/png" />
      <link rel="preload" as="image" href="/images/services/cab-lime.png" type="image/png" />
      <link
        rel="preload"
        as="image"
        href="/images/services/ambulance-cutout.png"
        type="image/png"
      />
      <Suspense fallback={<HomeFallback />}>
        <HomeView />
      </Suspense>
    </>
  );
}
