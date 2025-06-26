/**
 * Pure utility functions for async tour operations
 * These functions are stateless and don't use Vue reactivity
 */

import type { CoachMarkStep } from '../../types'

/**
 * Utility function to check if a step has async navigation callbacks
 */
export const hasAsyncNavigationCallbacks = (step: CoachMarkStep): boolean => {
  return !!(
    step.popover?.onAsyncNextClick ||
    step.popover?.onAsyncPreviousClick ||
    step.popover?.onAsyncCloseClick
  )
}

/**
 * Utility function to check if a step has async lifecycle callbacks
 */
export const hasAsyncLifecycleCallbacks = (step: CoachMarkStep): boolean => {
  return !!(step.onAsyncDeselected)
}

/**
 * Utility function to check if a step has any async callbacks
 */
export const hasAsyncCallbacks = (step: CoachMarkStep): boolean => {
  return hasAsyncNavigationCallbacks(step) || hasAsyncLifecycleCallbacks(step)
}

/**
 * Get the appropriate async callback based on navigation direction
 */
export const getAsyncCallbackForDirection = (
  direction: 'next' | 'previous' | 'close' | 'skip',
  step: CoachMarkStep
) => {
  switch (direction) {
    case 'next':
      return step.popover?.onAsyncNextClick
    case 'previous':
      return step.popover?.onAsyncPreviousClick
    case 'close':
      return step.popover?.onAsyncCloseClick
    case 'skip':
      // For skip, we can use the same callback as close or define a new one
      return step.popover?.onAsyncCloseClick
    default:
      return undefined
  }
}
