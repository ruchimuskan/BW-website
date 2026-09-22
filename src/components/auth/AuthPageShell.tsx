"use client";

import type { ReactNode } from "react";
import { LoginSceneDecor } from "@/components/auth/LoginSceneDecor";
import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
};

/** Full-viewport auth layout that actually fills 100dvh on phones. */
export function AuthPageShell({ children, aside, className }: AuthPageShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto font-sans",
        className,
      )}
    >
      <LoginSceneDecor />
      <div
        className={cn(
          "relative z-10 mx-auto grid min-h-[100dvh] w-full min-w-0 max-w-6xl place-items-center",
          "px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          "sm:px-6 sm:py-8",
          aside &&
            "lg:flex lg:min-h-[100dvh] lg:flex-row lg:items-center lg:justify-center lg:gap-8 lg:px-8 lg:py-6 xl:gap-10",
        )}
      >
        {aside ? (
          <aside className="hidden min-h-0 w-full flex-1 lg:flex lg:max-h-[calc(100dvh-3.5rem)] lg:max-w-[52%]">
            {aside}
          </aside>
        ) : null}
        <div
          className={cn(
            "mx-auto w-full min-w-0 max-w-[26.5rem] sm:max-w-[28rem]",
            aside ? "lg:mx-0 lg:flex-none" : "lg:max-w-[32rem]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
