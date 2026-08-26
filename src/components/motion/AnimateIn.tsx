"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  fadeInVariants,
  fadeLeftVariants,
  fadeRightVariants,
  fadeUpVariants,
  revealViewport,
  scaleInVariants,
  transitions,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

const directionVariants = {
  up: fadeUpVariants,
  in: fadeInVariants,
  left: fadeLeftVariants,
  right: fadeRightVariants,
  scale: scaleInVariants,
} as const;

type AnimateInProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
  delay?: number;
  direction?: keyof typeof directionVariants;
};

export function AnimateIn({
  children,
  className,
  delay = 0,
  direction = "up",
  ...props
}: AnimateInProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={directionVariants[direction]}
      transition={{ ...transitions.reveal, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
