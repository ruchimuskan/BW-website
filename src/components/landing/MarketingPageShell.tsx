import { cn } from "@/lib/utils";

type MarketingPageShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** Marketing pages — transparent over global PageBackground atmosphere. */
export function MarketingPageShell({
  children,
  className,
}: MarketingPageShellProps) {
  return (
    <div className={cn("bw-page-shell font-sans", className)}>{children}</div>
  );
}
