import { cn } from "@/lib/utils";

/** Single-layer brand canvas — lighter than stacked overlays. */
export function PageBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-muted",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 50% at 0% 0%, rgba(196,232,50,0.18), transparent 58%), radial-gradient(ellipse 55% 45% at 100% 8%, rgba(155,184,32,0.12), transparent 52%), linear-gradient(180deg, #eef6d4 0%, #f7fbe8 48%, #eef6d4 100%)",
      }}
    />
  );
}
