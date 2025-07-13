/**
 * Coach Mark event handlers composable
 * 
 * Manages event handling logic including button clicks, tooltip events,
 * and async navigation extracted from QuasarCoachMark component.
 */

import type { ComputedRef, Ref, SetupContext } from 'vue';
import type {
  CoachMarkStep,
  PopoverCommunication,
  UseStepNavigationReturn,
  CoachMarkInstance,
  MintCoachMarkEmits
} from '../types';

/**
 * Parameters for useCoachMarkEventHandlers
 */
export type UseCoachMarkEventHandlersParams = {
  readonly currentStep: ComputedRef<CoachMarkStep | undefined>;
  readonly currentStepIndex: ComputedRef<number | undefined> | Ref<number | undefined>;
  readonly popoverState: ComputedRef<PopoverCommunication>;
  readonly isActive: { readonly value: boolean };
  readonly emit: SetupContext<MintCoachMarkEmits>['emit'];
  readonly emitStepInteractionEvent: (...args: unknown[]) => void;
  readonly handleAsyncNavigation: (
    direction: 'next' | 'previous' | 'close' | 'skip',
    element: Element,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance,
    defaultAction: () => void
  ) => Promise<void>;
  readonly moveNext: UseStepNavigationReturn['moveNext'];
  readonly movePrevious: UseStepNavigationReturn['movePrevious'];
  readonly hidePopoverCommunication: () => void;
  readonly stopTour: () => void;
  readonly skipTour: () => void;
  readonly createCoachMarkInterface: () => CoachMarkInstance;
};

/**
 * Return type for useCoachMarkEventHandlers
 */
export type UseCoachMarkEventHandlersReturn = {
  readonly handleNext: () => Promise<void>;
  readonly handlePrevious: () => Promise<void>;
  readonly handleClose: () => void;
  readonly handleSkip: () => Promise<void>;
  readonly handleTooltipShow: () => void;
  readonly handleTooltipHide: () => void;
};

/**
 * Create event handling logic
 * 
 * @param params - Event handler parameters
 * @returns Event handler functions
 */
export const useCoachMarkEventHandlers = (params: UseCoachMarkEventHandlersParams): UseCoachMarkEventHandlersReturn => {
  const {
    currentStep,
    currentStepIndex,
    popoverState,
    isActive,
    emit,
    emitStepInteractionEvent,
    handleAsyncNavigation,
    moveNext,
    movePrevious,
    hidePopoverCommunication,
    stopTour,
    skipTour,
    createCoachMarkInterface
  } = params;

  /**
   * Handle next button click with async support
   */
  const handleNext = async (): Promise<void> => {
    const element = popoverState.value.targetElement;
    // Use popoverState.step as primary source since it's more reliable than currentStep computed
    const step = popoverState.value.step || currentStep.value;

    // Emit step-next-clicked event
    if (step) {
      emitStepInteractionEvent('step-next-clicked', step);
    }

    if (element && step) {
      await handleAsyncNavigation('next', element, step, createCoachMarkInterface(), moveNext);
    } else {
      // Fallback to direct navigation if no element/step
      await moveNext();
    }
  };

  /**
   * Handle previous button click with async support
   */
  const handlePrevious = async (): Promise<void> => {
    const element = popoverState.value.targetElement;
    // Use popoverState.step as primary source since it's more reliable than currentStep computed
    const step = popoverState.value.step || currentStep.value;

    // Emit step-previous-clicked event
    if (step) {
      emitStepInteractionEvent('step-previous-clicked', step);
    }

    if (element && step) {
      await handleAsyncNavigation('previous', element, step, createCoachMarkInterface(), movePrevious);
    } else {
      // Fallback to direct navigation if no element/step
      await movePrevious();
    }
  };

  /**
   * Handle close button click
   */
  const handleClose = (): void => {
    // Use popoverState.step as primary source since it's more reliable than currentStep computed
    const step = popoverState.value.step || currentStep.value;

    // Emit step-close-clicked event
    if (step) {
      emitStepInteractionEvent('step-close-clicked', step);
    }

    // Close the tour (no specific emit needed - tour just stops)
    stopTour();
  };

  /**
   * Handle skip button click with async support
   */
  const handleSkip = async (): Promise<void> => {
    const element = popoverState.value.targetElement;
    // Use popoverState.step as primary source since it's more reliable than currentStep computed
    const step = popoverState.value.step || currentStep.value;

    if (element && step) {
      // Emit skip event before handling async navigation
      emit('tour-skipped', step, currentStepIndex.value || 0);

      await handleAsyncNavigation('skip', element, step, createCoachMarkInterface(), skipTour);
    } else {
      // Emit skip event even if no element/step
      if (step) {
        emit('tour-skipped', step, currentStepIndex.value || 0);
      }

      skipTour();
    }
  };

  /**
   * Handle tooltip show event
   */
  const handleTooltipShow = (): void => {
    // Tooltip is now visible
  };

  /**
   * Handle tooltip hide event
   */
  const handleTooltipHide = (): void => {
    // Tooltip is now hidden
    if (isActive.value) {
      hidePopoverCommunication();
    }
  };

  return {
    handleNext,
    handlePrevious,
    handleClose,
    handleSkip,
    handleTooltipShow,
    handleTooltipHide
  } as const;
};
