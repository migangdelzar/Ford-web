import { Transition } from 'motion/react';

/**
 * Emil Kowalski & Apple HIG-inspired motion physics & transitions
 * Restrained, buttery, and mathematically calibrated with zero-overshoot spring curves.
 */

// Custom cubic-bezier deceleration curves: fast initial velocity, smooth gradual settling
export const EMIL_EASE = [0.16, 1, 0.3, 1] as const;
export const EMIL_EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const APPLE_FLUID_EASE = [0.32, 0.72, 0, 1] as const;

// Snappy spring for micro-interactions (buttons, active pills, segmented tabs, sidebar highlights)
export const SNAPPY_SPRING: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 38,
  mass: 0.75,
};

export const SPRING_TIGHT: Transition = {
  type: 'spring',
  stiffness: 460,
  damping: 34,
  mass: 0.7,
};

// Fluid spring for layout & container animations (drawers, collapsible sidebars, floating sheets)
export const FLUID_SPRING: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
  mass: 0.85,
};

// Page & view switch transition (subtle vertical lift + crisp opacity)
export const PAGE_TRANSITION: Transition = {
  duration: 0.22,
  ease: EMIL_EASE,
};

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 6, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: EMIL_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.995,
    transition: {
      duration: 0.14,
      ease: EMIL_EASE_OUT,
    },
  },
};

// Gentle fade-scale entry (0.97 -> 1.0, never 0)
export const bubbleEntryVariant = {
  initial: { opacity: 0, y: 6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.12 } },
  transition: { duration: 0.18, ease: EMIL_EASE },
};

// List item stagger container
export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: EMIL_EASE },
  },
};
