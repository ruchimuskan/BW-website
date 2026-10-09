import { cn } from "@/lib/utils";

/** Ride-app canvas — cool asphalt white with a lime taxi highlight. */
export function PageBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F4F5F2]",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 58% 44% at 0% 0%, rgba(198,227,26,0.18), transparent 60%), radial-gradient(ellipse 42% 36% at 100% 0%, rgba(56,71,27,0.07), transparent 54%), linear-gradient(180deg, #F8F9F4 0%, #F4F5F2 48%, #EEF1E8 100%)",
      }}
    />
  );
}
