/**
 * Type-safe state management utility functions
 * These functions provide type-safe alternatives to any-typed state operations
 */

import type { CoachMarkState } from '../../types';

/**
 * Type guard to check if a value is a valid state key
 */
export const isValidStateKey = (key: unknown): key is keyof CoachMarkState => {
  return typeof key === 'string' && key in {
    isInitialized: true,
    activeIndex: true,
    activeElement: true,
    activeStep: true,
    previousElement: true,
    previousStep: true,
    popover: true,
    internalPreviousElement: true,
    currentActiveElement: true,
    internalPreviousStep: true,
    currentActiveStep: true,
    internalActiveOnDestroyed: true,
    internalResizeTimeout: true,
    internalTransitionCallback: true,
    currentActiveStagePosition: true,
    internalOverlaySvg: true,
    shouldRenderPopover: true
  };
};
