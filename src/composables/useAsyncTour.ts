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
  AsyncTourHook,
  UseAsyncTourOptions,
  UseAsyncTourReturn
} from '../types'
import { getAsyncCallbackForDirection, isError } from './utils'

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
      if (isError(error)) {
        onAsyncOperationError?.(error)
      } else {
        // Create a proper Error object for non-Error exceptions
        const errorObj = new Error(
          typeof error === 'string' ? error : 'Unknown error occurred during async callback execution'
        )
        onAsyncOperationError?.(errorObj)
      }
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
    const callback = getAsyncCallbackForDirection(direction, step)

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


