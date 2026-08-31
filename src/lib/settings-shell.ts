import { cn } from "@/lib/utils";

/** Shared width for account / settings subpages. */
export const SETTINGS_SHELL_MAX =
  "mx-auto w-full min-w-0 max-w-3xl xl:max-w-5xl";

export const SETTINGS_SHELL_PAD = "px-4 sm:px-6 lg:px-8";

export function settingsShell(
  ...extra: Array<string | false | null | undefined>
) {
  return cn(SETTINGS_SHELL_MAX, SETTINGS_SHELL_PAD, ...extra);
}

export const SETTINGS_PAGE_BG = "min-h-[100dvh] bg-muted bw-hero-atmosphere";
