"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";

/** Legacy mock ambulance steps now start a real backend booking. */
export default function AmbulanceBookingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ambulanceBook);
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <Loader2 className="h-7 w-7 animate-spin text-destructive" />
    </div>
  );
}
