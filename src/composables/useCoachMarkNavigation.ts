import type { CoachMarkStep, CoachMarkInstance } from '../types';

/**
 * Configuration object for navigation wrapper functions
 */
export type NavigationWrapperParams = {
  handleStepDeselection: (element: Element | undefined, step: CoachMarkStep, coachMark: CoachMarkInstance) => Promise<void>
  handleAsyncNavigation: (direction: 'next' | 'previous' | 'close' | 'skip', element: Element, step: CoachMarkStep, coachMark: CoachMarkInstance, callback: () => void) => Promise<void>
  emitAsyncDeselectedEvent: (step: CoachMarkStep) => void
  emitAsyncInteractionEvent: (eventName: 'step-async-next-clicked' | 'step-async-previous-clicked', step: CoachMarkStep, stepIndex?: number) => void
};

/**
 * Pure function to create navigation wrapper functions
 * Returns plain functions without Vue reactivity dependencies
 */
export const createNavigationWrappers = ({
  handleStepDeselection,
  handleAsyncNavigation,
  emitAsyncDeselectedEvent,
  emitAsyncInteractionEvent
}: NavigationWrapperParams) => {
  /**
   * Wrapped handle step deselection that emits Vue events
   */
  const wrappedHandleStepDeselection = async (
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ): Promise<void> => {
    // Call original async deselection handling
    await handleStepDeselection(element, step, coachMark);

    // Emit Vue event for async deselection if the step has onAsyncDeselected
    emitAsyncDeselectedEvent(step);
  };

  /**
   * Wrapped handle async navigation that emits Vue events
   */
  const wrappedHandleAsyncNavigation = async (
    direction: 'next' | 'previous' | 'close' | 'skip',
    element: Element,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance,
    callback: () => void
  ): Promise<void> => {
    // Emit interaction events before async operation
    if (direction === 'next' && step.popover?.onAsyncNextClick) {
      emitAsyncInteractionEvent('step-async-next-clicked', step);
    } else if (direction === 'previous' && step.popover?.onAsyncPreviousClick) {
      emitAsyncInteractionEvent('step-async-previous-clicked', step);
    }

    // Call original async navigation handling
    await handleAsyncNavigation(direction, element, step, coachMark, callback);
  };

  return {
    wrappedHandleStepDeselection,
    wrappedHandleAsyncNavigation
  };
};
