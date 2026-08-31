import { cn } from "@/lib/utils";

/**
 * Marketing layout — scales up on xl/2xl so content is not boxed in with huge gutters.
 */
export const LANDING_SHELL_MAX =
  "mx-auto w-full min-w-0 max-w-[min(100%,76rem)] xl:max-w-[min(100%,82rem)] 2xl:max-w-[min(100%,88rem)]";

/** Tight but safe horizontal inset — grows slightly on very large screens */
export const LANDING_SHELL_PAD = "px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7";

export function landingShell(...extra: Array<string | false | null | undefined>) {
  return cn(LANDING_SHELL_MAX, LANDING_SHELL_PAD, ...extra);
}

/** Standard vertical rhythm for marketing sections */
export const LANDING_SECTION_PY = "py-10 sm:py-14 lg:py-16 xl:py-20";
