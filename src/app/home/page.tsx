import { Suspense } from "react";
import { HomeView } from "@/components/home";

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
      <link rel="preload" as="image" href="/images/services/auto.png" type="image/png" />
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
