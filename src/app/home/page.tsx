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
      <link rel="preload" as="image" href="/images/pic-14.webp" type="image/webp" />
      <link rel="preload" as="image" href="/images/services/auto.webp" type="image/webp" />
      <Suspense fallback={<HomeFallback />}>
        <HomeView />
      </Suspense>
    </>
  );
}
