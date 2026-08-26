"use client";

import { motion } from "framer-motion";
import { ServiceImage } from "@/components/home/ServiceImage";
import { brandPhotoBlend, brandPhotoFit } from "@/constants/brand-images";
import { cn } from "@/lib/utils";

interface AuthServiceImageProps {
  src: string;
  alt: string;
  variant?: "default" | "ambulance";
  className?: string;
  size?: "sm" | "md";
}

export function AuthServiceImage({
  src,
  alt,
  variant = "default",
  className,
  size = "md",
}: AuthServiceImageProps) {
  const isAmbulance = variant === "ambulance";
  const blend = brandPhotoBlend(src);
  const cover = brandPhotoFit(src) === "cover" && blend === "none";
  const compact = size === "sm";

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-md",
          compact ? "h-1.5 w-[70%]" : "h-2.5 w-[72%]",
          isAmbulance ? "bg-destructive/20" : "bg-primary/15",
        )}
        aria-hidden
      />
      <motion.div
        animate={{ y: compact ? [0, -2, 0] : [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "relative flex items-center justify-center overflow-hidden transition-transform",
          compact ? "h-10 w-10 rounded-xl" : "h-12 w-12 rounded-2xl sm:h-14 sm:w-14",
          isAmbulance ? "bg-destructive/10" : "bg-secondary/30",
        )}
      >
        <ServiceImage
          src={src}
          alt={alt}
          blend={blend}
          imageClassName={cn(
            "p-0",
            cover ? "object-cover scale-[1.05]" : compact ? "scale-[1.25]" : "scale-[1.35]",
          )}
        />
      </motion.div>
    </div>
  );
}
