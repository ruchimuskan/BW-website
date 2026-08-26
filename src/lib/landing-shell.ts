import { cn } from "@/lib/utils";

/**
 * Shared marketing layout width — fills large desktops without huge side gutters.
 * Use on header, hero, and section inner wrappers.
 */
export const LANDING_SHELL_MAX =
  "mx-auto w-full min-w-0 max-w-[90rem]"; /* 1440px */

/** Horizontal padding that stays tight from phone → ultrawide */
export const LANDING_SHELL_PAD = "px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8";

export function landingShell(...extra: Array<string | false | null | undefined>) {
  return cn(LANDING_SHELL_MAX, LANDING_SHELL_PAD, ...extra);
}
