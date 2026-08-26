"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PhoneLogin } from "@/components/PhoneLogin";
import { LoginView } from "@/components/auth";

function LoginFallback() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-background text-muted-foreground">
      Loading…
    </div>
  );
}

function LoginSwitcher() {
  const searchParams = useSearchParams();
  const usePassword = searchParams.get("mode") === "password";
  return usePassword ? <LoginView /> : <PhoneLogin />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginSwitcher />
    </Suspense>
  );
}
