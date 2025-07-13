/**
 * Step navigation composable
 * 
 * Manages step navigation logic including transitions, state management,
 * and async operations extracted from QuasarCoachMark component.
 */

import type { Ref, ComputedRef, SetupContext } from 'vue';
import type {
  CoachMarkStep,
  NavigationOptions,
  PopoverCommunication,
  CoachMarkInstance,
  MintCoachMarkEmits,
  CoachMarkConfig
} from '../types';

/**
 * Parameters for useStepNavigation
 */
export type UseStepNavigationParams = {
  readonly currentStep: ComputedRef<CoachMarkStep | undefined>;
  readonly currentStepIndex: ComputedRef<number | undefined> | Ref<number | undefined>;
  readonly isTransitioning: Ref<boolean>;
  readonly popoverState: ComputedRef<PopoverCommunication>;
  readonly steps: readonly CoachMarkStep[];
  readonly start: (stepIndex?: number, options?: NavigationOptions) => void | Promise<void>;
  readonly emit: SetupContext<MintCoachMarkEmits>['emit'];
  readonly emitStepInteractionEvent: (
    eventName: 'step-next-clicked' | 'step-previous-clicked' | 'step-changed' | 'step-closed',
    step: CoachMarkStep,
    stepIndex?: number
  ) => void;
  readonly handleStepDeselection: (
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ) => Promise<void>;
  readonly blockScrolling: () => void;
  readonly unblockScrolling: () => void;
  readonly setStepTransitioning: (value: boolean) => void;
  readonly hidePopoverCommunication: () => void;
  readonly ensureTooltipHidden: () => Promise<void>;
  readonly ensureStepProcessingComplete: () => Promise<void>;
  readonly showTooltipIfReady: (context?: string) => Promise<void>;
  readonly stopTour: () => void;
  readonly createCoachMarkInterface: () => CoachMarkInstance;
};

/**
 * Parameters for moveNext function
 */
export type MoveNextParams = {
  readonly currentStepIndex: number | undefined;
  readonly totalSteps: number;
  readonly options?: NavigationOptions;
};

/**
 * Parameters for movePrevious function
 */
export type MovePreviousParams = {
  readonly currentStepIndex: number | undefined;
  readonly options?: NavigationOptions;
};

/**
 * Parameters for moveTo function
 */
export type MoveToParams = {
  readonly stepIndex: number;
  readonly currentStepIndex: number | undefined;
  readonly totalSteps: number;
  readonly options?: NavigationOptions;
};

/**
 * Return type for useStepNavigation pure function composable
 */
export type UseStepNavigationReturn = {
  readonly moveNext: (params: MoveNextParams, config?: CoachMarkConfig) => Promise<void>;
  readonly movePrevious: (params: MovePreviousParams, config?: CoachMarkConfig) => Promise<void>;
  readonly moveTo: (params: MoveToParams, config?: CoachMarkConfig) => Promise<void>;
};

/**
 * Create step navigation pure functions
 *
 * @param params - Navigation parameters
 * @returns Pure navigation functions
 */
export const useStepNavigation = (params: UseStepNavigationParams): UseStepNavigationReturn => {
  const {
    currentStep,
    currentStepIndex: _currentStepIndex,
    isTransitioning,
    popoverState,
    steps,
    start,
    emit,
    emitStepInteractionEvent,
    handleStepDeselection,
    blockScrolling,
    unblockScrolling,
    setStepTransitioning,
    hidePopoverCommunication,
    ensureTooltipHidden,
    ensureStepProcessingComplete,
    showTooltipIfReady,
    stopTour,
    createCoachMarkInterface
  } = params;

  /**
   * Pure function to move to the next step with proper transition handling
   */
  const moveNext = async (navParams: MoveNextParams, _config?: CoachMarkConfig): Promise<void> => {
    const { currentStepIndex: currentIndex, totalSteps, options } = navParams;

    if (currentIndex !== undefined && currentIndex < totalSteps - 1) {
      try {
        // 1. Block scrolling immediately before any transition work
        blockScrolling();

        // 2. Set transitioning flags to prevent conflicts
        isTransitioning.value = true;
        setStepTransitioning(true);

        // 3. Immediately hide tooltip and clear popover state to prevent content flashing
        hidePopoverCommunication();

        // 3. Handle step deselection for current step
        const currentElement = popoverState.value.targetElement;
        const currentStepData = currentStep.value;
        if (currentElement && currentStepData) {
          await handleStepDeselection(currentElement, currentStepData, createCoachMarkInterface());
        }

        // 4. Ensure QTooltip is completely hidden before step transition
        await ensureTooltipHidden();

        // 5. Perform step change
        const nextIndex = currentIndex + 1;

        start(nextIndex, options);
        emit('step-change', steps[nextIndex], nextIndex);

        // Emit step-changed event with interaction context
        emitStepInteractionEvent('step-changed', steps[nextIndex], nextIndex);

        // 6. Wait for all step processing to complete
        await ensureStepProcessingComplete();

        // 7. Clear transitioning flags
        isTransitioning.value = false;
        setStepTransitioning(false);

        // 8. Show tooltip only if all conditions are met
        await showTooltipIfReady('step-transition-moveNext');

        // 9. Unblock scrolling after everything is complete and positioned
        unblockScrolling();

      } catch (error) {
        console.error('Error in moveNext:', error);
        isTransitioning.value = false;
        setStepTransitioning(false);
        unblockScrolling(); // Ensure scrolling is unblocked on error
      }
    } else {
      // Tour completed
      stopTour();
    }
  };

  /**
   * Pure function to move to the previous step with proper transition handling
   */
  const movePrevious = async (navParams: MovePreviousParams, _config?: CoachMarkConfig): Promise<void> => {
    const { currentStepIndex: currentIndex, options } = navParams;
    
    if (currentIndex !== undefined && currentIndex > 0) {
      try {
        // 1. Block scrolling immediately before any transition work
        blockScrolling();

        // 2. Set transitioning flags to prevent conflicts
        isTransitioning.value = true;
        setStepTransitioning(true);

        // 3. Immediately hide tooltip and clear popover state to prevent content flashing
        hidePopoverCommunication();

        // 3. Handle step deselection for current step
        const currentElement = popoverState.value.targetElement;
        const currentStepData = currentStep.value;
        if (currentElement && currentStepData) {
          await handleStepDeselection(currentElement, currentStepData, createCoachMarkInterface());
        }

        // 4. Ensure QTooltip is completely hidden before step transition
        await ensureTooltipHidden();

        // 5. Perform step change
        const prevIndex = currentIndex - 1;

        start(prevIndex, options);
        emit('step-change', steps[prevIndex], prevIndex);

        // Emit step-changed event with interaction context
        emitStepInteractionEvent('step-changed', steps[prevIndex], prevIndex);

        // 6. Wait for all step processing to complete
        await ensureStepProcessingComplete();

        // 7. Clear transitioning flags
        isTransitioning.value = false;
        setStepTransitioning(false);

        // 8. Show tooltip only if all conditions are met
        await showTooltipIfReady('step-transition-movePrevious');

        // 9. Unblock scrolling after everything is complete and positioned
        unblockScrolling();

      } catch (error) {
        console.error('Error in movePrevious:', error);
        isTransitioning.value = false;
        setStepTransitioning(false);
        unblockScrolling(); // Ensure scrolling is unblocked on error
      }
    }
  };

  /**
   * Pure function to move to a specific step with proper transition handling
   */
  const moveTo = async (navParams: MoveToParams, _config?: CoachMarkConfig): Promise<void> => {
    const { stepIndex, currentStepIndex: _currentStepIndex, totalSteps, options } = navParams;
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      try {
        // 1. Block scrolling immediately before any transition work
        blockScrolling();

        // 2. Set transitioning flags to prevent conflicts
        isTransitioning.value = true;
        setStepTransitioning(true);

        // 3. Immediately hide tooltip and clear popover state to prevent content flashing
        hidePopoverCommunication();

        // 3. Handle step deselection for current step
        const currentElement = popoverState.value.targetElement;
        const currentStepData = currentStep.value;
        if (currentElement && currentStepData) {
          await handleStepDeselection(currentElement, currentStepData, createCoachMarkInterface());
        }

        // 4. Ensure QTooltip is completely hidden before step transition
        await ensureTooltipHidden();

        // 5. Perform step change
        start(stepIndex, options);
        emit('step-change', steps[stepIndex], stepIndex);

        // Emit step-changed event with interaction context
        emitStepInteractionEvent('step-changed', steps[stepIndex], stepIndex);

        // 6. Wait for all step processing to complete
        await ensureStepProcessingComplete();

        // 7. Clear transitioning flags
        isTransitioning.value = false;
        setStepTransitioning(false);

        // 8. Show tooltip only if all conditions are met
        await showTooltipIfReady('step-transition-moveTo');

        // 9. Unblock scrolling after everything is complete and positioned
        unblockScrolling();

      } catch (error) {
        console.error('Error in moveTo:', error);
        isTransitioning.value = false;
        setStepTransitioning(false);
        unblockScrolling(); // Ensure scrolling is unblocked on error
      }
    }
  };

  return {
    moveNext,
    movePrevious,
    moveTo
  } as const;
};
