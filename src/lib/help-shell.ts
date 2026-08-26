import { cn } from "@/lib/utils";

/** Shared width for help / support pages so header, hero, and lists align. */
export const HELP_SHELL_MAX = "mx-auto w-full min-w-0 max-w-5xl xl:max-w-6xl";

export const HELP_SHELL_PAD = "px-4 sm:px-6 lg:px-8";

export function helpShell(...extra: Array<string | false | null | undefined>) {
  return cn(HELP_SHELL_MAX, HELP_SHELL_PAD, ...extra);
}
