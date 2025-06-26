/**
 * Async Tour Composable
 *
 * Provides async tour functionality for coach marks, allowing steps to:
 * - Load data asynchronously before proceeding
 * - Override default navigation behavior with custom callbacks
 * - Handle step lifecycle events with async operations
 */

import { ref, type Ref } from 'vue'
import type {
  CoachMarkStep,
  CoachMarkInstance,
  AsyncTourHook
} from '../types'

export interface UseAsyncTourOptions {
  onAsyncOperationStart?: () => void
  onAsyncOperationComplete?: () => void
  onAsyncOperationError?: (error: Error) => void
}

export interface UseAsyncTourReturn {
  isAsyncOperationInProgress: Ref<boolean>
  executeAsyncCallback: (
    callback: AsyncTourHook,
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ) => Promise<boolean>
  handleAsyncNavigation: (
    direction: 'next' | 'previous' | 'close' | 'skip',
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance,
    defaultAction: () => void
  ) => Promise<void>
  handleStepDeselection: (
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ) => Promise<void>
}

/**
 * Composable for handling async tour operations
 */
export const useAsyncTour = (options: UseAsyncTourOptions = {}): UseAsyncTourReturn => {
  const {
    onAsyncOperationStart,
    onAsyncOperationComplete,
    onAsyncOperationError
  } = options

  // Track async operation state
  const isAsyncOperationInProgress: Ref<boolean> = ref(false)

  /**
   * Execute an async callback with proper error handling and state management
   */
  const executeAsyncCallback = async (
    callback: AsyncTourHook,
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ): Promise<boolean> => {
    try {
      isAsyncOperationInProgress.value = true
      onAsyncOperationStart?.()

      // Execute the callback (may be sync or async)
      const result = callback({ element, step, coachMark })

      // If it's a Promise, wait for it to complete
      if (result instanceof Promise) {
        await result
        // Async callback completed successfully
      } else {
        // Sync callback completed successfully
      }

      return true

    } catch (error) {
      console.error('❌ Error executing async callback:', error)
      onAsyncOperationError?.(error as Error)
      return false

    } finally {
      isAsyncOperationInProgress.value = false
      onAsyncOperationComplete?.()
    }
  }

  /**
   * Handle async navigation with custom callbacks
   */
  const handleAsyncNavigation = async (
    direction: 'next' | 'previous' | 'close' | 'skip',
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance,
    defaultAction: () => void
  ): Promise<void> => {
    // Get the appropriate async callback based on direction
    let callback: AsyncTourHook | undefined

    switch (direction) {
      case 'next':
        callback = step.popover?.onAsyncNextClick
        break
      case 'previous':
        callback = step.popover?.onAsyncPreviousClick
        break
      case 'close':
        callback = step.popover?.onAsyncCloseClick
        break
      case 'skip':
        // For skip, we can use the same callback as close or define a new one
        callback = step.popover?.onAsyncCloseClick
        break
    }

    // If there's a custom callback, execute it instead of default action
    if (callback) {


      const success = await executeAsyncCallback(callback, element, step, coachMark);

      if (!success) {
        console.warn(`⚠️ Async ${direction} callback failed, falling back to default action`)
        defaultAction()
      }
      // Note: If callback succeeds, it's responsible for calling the appropriate coach mark method
      // (e.g., coachMark.moveNext(), coachMark.movePrevious(), coachMark.destroy())

    } else {
      // No custom callback, execute default action

      defaultAction()
    }
  }

  /**
   * Handle step deselection with async cleanup
   */
  const handleStepDeselection = async (
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ): Promise<void> => {
    const callback = step.onAsyncDeselected

    if (callback) {


      await executeAsyncCallback(callback, element, step, coachMark)
    }
  }

  return {
    isAsyncOperationInProgress,
    executeAsyncCallback,
    handleAsyncNavigation,
    handleStepDeselection
  }
}

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
