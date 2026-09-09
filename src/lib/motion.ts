/** Shared BW Rides motion tokens — professional, snappy, ease-out */

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeSoft = [0.16, 1, 0.3, 1] as const;

export const transitions = {
  page: { duration: 0.12, ease: easeOut },
  reveal: { duration: 0.55, ease: easeSoft },
  fast: { duration: 0.22, ease: easeOut },
  hover: { duration: 0.28, ease: easeOut },
  spring: { type: "spring" as const, stiffness: 340, damping: 30 },
  softSpring: { type: "spring" as const, stiffness: 220, damping: 26 },
};

export const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeUpVariants = {
  hidden: { opacity: 1, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

export const slideDownVariants = {
  hidden: { opacity: 1, y: -8 },
  visible: { opacity: 1, y: 0 },
};

export const scaleInVariants = {
  hidden: { opacity: 1, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

export const fadeLeftVariants = {
  hidden: { opacity: 1, x: -16 },
  visible: { opacity: 1, x: 0 },
};

export const fadeRightVariants = {
  hidden: { opacity: 1, x: 16 },
  visible: { opacity: 1, x: 0 },
};

export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 1, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.reveal,
  },
};

export const revealViewport = {
  once: true,
  margin: "0px 0px -10% 0px" as const,
  amount: 0.01 as const,
};
