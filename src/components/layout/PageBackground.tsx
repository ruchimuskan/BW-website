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
          "radial-gradient(ellipse 55% 42% at 0% 0%, rgba(198,227,26,0.16), transparent 58%), radial-gradient(ellipse 48% 38% at 100% 0%, rgba(17,20,17,0.05), transparent 52%), linear-gradient(180deg, #F7F8F5 0%, #F4F5F2 42%, #EEF0EC 100%)",
      }}
    />
  );
}
