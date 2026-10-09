import { Transition } from 'motion/react';

/**
 * Emil Kowalski-inspired motion physics & transitions
 * Restrained, buttery, and mathematically calibrated
 */

// Deceleration curve: fast start, gradual settling
export const EMIL_EASE = [0.16, 1, 0.3, 1] as const;
export const EMIL_EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Snappy spring for micro-interactions (buttons, pills, tabs)
export const SNAPPY_SPRING: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 36,
  mass: 0.8,
};

export const SPRING_TIGHT: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 32,
  mass: 0.7,
};

// Fluid spring for layout animations (sliding cards, drawers)
export const FLUID_SPRING: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
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
