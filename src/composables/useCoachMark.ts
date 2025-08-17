/**
 * Main coach mark composable that orchestrates all functionality
 * Provides an intuitive API for coach mark interactions
 */

import { ref } from 'vue';
import { useCoachMarkState } from './useCoachMarkState';
import { useCoachMarkConfig } from './useCoachMarkConfig';
import { useCoachMarkEvents } from './useCoachMarkEvents';

import { useHighlight } from './useHighlight';
import { isFocusableElement, isAllowedButton } from './utils';
import type { CoachMarkConfig, CoachMarkStep, CoachMarkInstance, AllowedButtons, NavigationOptions } from '../types';

/**
 * Main coach mark composable that orchestrates all functionality and provides an intuitive API for coach mark interactions
 * @param initialConfig - Initial configuration object for the coach mark system
 * @returns Coach mark instance with reactive state and control methods
 * @example
 * ```typescript
 * const coachMark = useCoachMark({
 *   steps: [{ element: '#step1', popover: { title: 'Welcome' } }],
 *   animate: true
 * });
 * coachMark.start();
 * ```
 */
export const useCoachMark = (initialConfig: CoachMarkConfig = {}) => {
  const { getState, setState, resetState } = useCoachMarkState();
  const { configure, getConfig, setCurrentCoachMark, getCurrentCoachMark } = useCoachMarkConfig();
  const { listen, initEvents, destroyEvents, destroyEmitter } = useCoachMarkEvents();
  // Overlay is now handled by MintCoachMarkOverlay component
  const { highlight, refreshActiveHighlight, destroyHighlight } = useHighlight();

  // Initialize configuration
  configure(initialConfig);

  // Reactive state for the current tour
  const isActive = ref(false);
  const currentStepIndex = ref<number | undefined>(undefined);

  /**
   * Destroy the coach mark instance and clean up all resources including event listeners, overlays, and state
   * @param withOnDestroyStartedHook - Whether to call the onDestroyStarted hook before destruction (default: true)
   * @returns void
   */
  const destroy = (withOnDestroyStartedHook = true): void => {
    const activeElement = getState('currentActiveElement');
    const activeStep: CoachMarkStep | undefined = getState('currentActiveStep');
    const activeOnDestroyed = getState('internalActiveOnDestroyed');

    const onDestroyStarted = getConfig('onDestroyStarted');
    const coachMark = getCurrentCoachMark();

    // `onDestroyStarted` is used to confirm the exit of tour
    if (withOnDestroyStartedHook && onDestroyStarted && coachMark && activeStep) {
      const isActiveDummyElement = !activeElement || activeElement?.id === 'mint-coach-mark-dummy-element';
      onDestroyStarted(isActiveDummyElement ? undefined : activeElement, activeStep, {
        config: getConfig(),
        state: getState(),
        coachMark
      });
      return;
    }

    const onDeselected = activeStep?.onDeselected || getConfig('onDeselected');
    const onDestroyed = getConfig('onDestroyed');

    // Remove CSS classes from body
    document.body.classList.remove('mint-coach-mark-active', 'mint-coach-mark-fade', 'mint-coach-mark-simple');

    destroyEvents();
    // Overlay is now handled by MintCoachMarkOverlay component lifecycle
    destroyHighlight();
    destroyEmitter();

    resetState();
    isActive.value = false;
    currentStepIndex.value = undefined;

    if (activeElement && activeStep && coachMark) {
      const isActiveDummyElement = activeElement.id === 'mint-coach-mark-dummy-element';

      if (onDeselected) {
        onDeselected(isActiveDummyElement ? undefined : activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        });
      }

      if (onDestroyed) {
        onDestroyed(isActiveDummyElement ? undefined : activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        });
      }
    }

    // Restore focus to the previously active element if it's focusable
    if (activeOnDestroyed && isFocusableElement(activeOnDestroyed)) {
      activeOnDestroyed.focus();
    }
  };

  /**
   * Start the tour at a specific step index with optional navigation configuration
   * @param stepIndex - Zero-based index of the step to start from (default: 0)
   * @param options - Optional navigation options for controlling scroll behavior and callbacks
   * @returns Promise that resolves when the step is successfully highlighted and displayed
   * @throws Will log error and destroy tour if no steps are configured or step index is invalid
   */
  const startStep = async (stepIndex: number = 0, options?: NavigationOptions): Promise<void> => {
    const steps = getConfig('steps');
    if (!steps) {
      console.error('No steps to drive through');
      destroy();
      return;
    }

    if (!steps[stepIndex]) {
      destroy();
      return;
    }

    // Store the currently focused element if it's focusable
    const currentActiveElement = document.activeElement;
    if (isFocusableElement(currentActiveElement)) {
      setState('internalActiveOnDestroyed', currentActiveElement);
    }
    setState('activeIndex', stepIndex);
    currentStepIndex.value = stepIndex;

    const currentStep = steps[stepIndex];
    const hasNextStep = !!steps[stepIndex + 1];
    const hasPreviousStep = !!steps[stepIndex - 1];

    const doneBtnText = currentStep.popover?.doneBtnText || getConfig('doneBtnText') || 'Done';
    const allowsClosing = getConfig('allowClose');
    const showProgress =
      typeof currentStep.popover?.showProgress !== 'undefined'
        ? currentStep.popover?.showProgress
        : getConfig('showProgress');
    // Simplified progress text: just "current / total" format
    const progressText = `${stepIndex + 1} / ${steps.length}`;

    const configuredButtons = currentStep.popover?.showButtons || getConfig('showButtons');

    // Create base buttons array with proper typing
    const baseButtons: AllowedButtons[] = ['next', 'previous'];
    if (allowsClosing) {
      baseButtons.push('close');
    }

    // Filter buttons based on configuration with type safety
    const calculatedButtons: AllowedButtons[] = baseButtons.filter(button => {
      if (!configuredButtons?.length) {
        return true;
      }
      return configuredButtons.some(configButton =>
        isAllowedButton(configButton) && configButton === button
      );
    });

    // Type-safe button arrays without type assertions
    const previousButtonDisabled: AllowedButtons[] = ['previous'];
    const noButtonsDisabled: AllowedButtons[] = [];

    // Prepare step with calculated popover properties
    const stepWithPopover = {
      ...currentStep,
      popover: currentStep.popover ? {
        showButtons: calculatedButtons,
        nextBtnText: !hasNextStep ? doneBtnText : currentStep.popover.nextBtnText,
        disableButtons: !hasPreviousStep ? previousButtonDisabled : noButtonsDisabled,
        showProgress: showProgress,
        progressText: progressText,
        ...currentStep.popover
      } : undefined
    };

    await highlight(stepWithPopover, options);
  };

  /**
   * Move to the next step in the tour sequence or destroy the tour if at the last step
   * @param options - Optional navigation options for controlling scroll behavior and callbacks
   * @returns void
   */
  const moveNext = (options?: NavigationOptions): void => {
    const activeIndex = getState('activeIndex');
    const steps = getConfig('steps') || [];
    if (typeof activeIndex === 'undefined') {
      return;
    }

    const nextStepIndex = activeIndex + 1;
    if (steps[nextStepIndex]) {
      startStep(nextStepIndex, options);
    } else {
      destroy();
    }
  };

  /**
   * Handle close action triggered by user interaction (ESC key, close button, etc.)
   * @returns void - Only destroys the tour if allowClose configuration is enabled
   */
  const handleClose = (): void => {
    if (!getConfig('allowClose')) {
      return;
    }
    destroy();
  };

  /**
   * Handle overlay click based on configured behavior (close tour or move to next step)
   * @returns void - Behavior depends on overlayClickBehavior configuration setting
   */
  const handleOverlayClick = (): void => {
    const overlayClickBehavior = getConfig('overlayClickBehavior');

    if (getConfig('allowClose') && overlayClickBehavior === 'close') {
      destroy();
      return;
    }

    if (overlayClickBehavior === 'nextStep') {
      moveNext();
    }
  };

  /**
   * Move to the previous step in the tour sequence or destroy the tour if at the first step
   * @param options - Optional navigation options for controlling scroll behavior and callbacks
   * @returns void
   */
  const movePrevious = (options?: NavigationOptions): void => {
    const activeIndex = getState('activeIndex');
    const steps = getConfig('steps') || [];
    if (typeof activeIndex === 'undefined') {
      return;
    }

    const previousStepIndex = activeIndex - 1;
    if (steps[previousStepIndex]) {
      startStep(previousStepIndex, options);
    } else {
      destroy();
    }
  };

  /**
   * Move directly to a specific step by its zero-based index
   * @param index - Zero-based index of the target step
   * @param options - Optional navigation options for controlling scroll behavior and callbacks
   * @returns void - Destroys the tour if the specified index is invalid
   */
  const moveTo = (index: number, options?: NavigationOptions): void => {
    const steps = getConfig('steps') || [];

    if (steps[index]) {
      startStep(index, options);
    } else {
      destroy();
    }
  };

  /**
   * Skip the entire tour and trigger the onSkipClick hook if configured
   * @returns void - Destroys the tour without calling onDestroyStarted hook
   */
  const skipTour = (): void => {
    const activeStep = getState('currentActiveStep');
    const activeElement = getState('currentActiveElement');

    // Execute skip hook if provided
    const onSkipClick = getConfig('onSkipClick');
    if (onSkipClick) {
      const coachMark = getCurrentCoachMark();
      if (coachMark) {
        // Create a safe fallback step if activeStep is undefined
        const safeActiveStep: CoachMarkStep = activeStep || {
          element: '',
          popover: {
            title: 'Tour Skipped',
            description: 'The tour was skipped by the user.'
          }
        };
        onSkipClick(activeElement || undefined, safeActiveStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        });
      }
    }

    // Destroy the tour
    destroy(false);
  };

  /**
   * Handle left arrow key navigation to move to the previous step
   * @returns void - Calls onPrevClick hook if configured, otherwise moves to previous step
   */
  const handleArrowLeft = (): void => {
    const isTransitioning = getState('internalTransitionCallback');
    if (isTransitioning) {
      return;
    }

    const activeIndex = getState('activeIndex');
    const activeStep: CoachMarkStep | undefined = getState('currentActiveStep');
    const activeElement = getState('currentActiveElement');
    if (typeof activeIndex === 'undefined' || typeof activeStep === 'undefined') {
      return;
    }

    const onPrevClick = activeStep.popover?.onPrevClick || getConfig('onPrevClick');
    if (onPrevClick) {
      const coachMark = getCurrentCoachMark();
      if (coachMark) {
        onPrevClick(activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        });
        return;
      }
    }

    movePrevious();
  };

  /**
   * Handle right arrow key navigation to move to the next step
   * @returns void - Calls onNextClick hook if configured, otherwise moves to next step
   */
  const handleArrowRight = (): void => {
    const isTransitioning = getState('internalTransitionCallback');
    if (isTransitioning) {
      return;
    }

    const activeIndex = getState('activeIndex');
    const activeStep: CoachMarkStep | undefined = getState('currentActiveStep');
    const activeElement = getState('currentActiveElement');
    if (typeof activeIndex === 'undefined' || typeof activeStep === 'undefined') {
      return;
    }

    const onNextClick = activeStep.popover?.onNextClick || getConfig('onNextClick');
    if (onNextClick) {
      const coachMark = getCurrentCoachMark();
      if (coachMark) {
        onNextClick(activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        });
        return;
      }
    }

    moveNext();
  };

  /**
   * Initialize the coach mark system by setting up event listeners and applying CSS classes
   * @returns void - Sets up the coach mark environment and marks system as initialized
   */
  const init = (): void => {
    if (getState('isInitialized')) {
      return;
    }

    setState('isInitialized', true);
    isActive.value = true;

    // Add CSS classes to body
    document.body.classList.add(
      'mint-coach-mark-active',
      getConfig('animate') ? 'mint-coach-mark-fade' : 'mint-coach-mark-simple'
    );

    initEvents();

    // Set up event listeners
    listen('overlayClick', handleOverlayClick);
    listen('escapePress', handleClose);
    listen('arrowLeftPress', handleArrowLeft);
    listen('arrowRightPress', handleArrowRight);
    listen('refreshRequired', refreshActiveHighlight);
  };

  

  // Create the coach mark API
  const api: CoachMarkInstance = {
    isActive: () => getState('isInitialized') || false,
    refresh: refreshActiveHighlight,
    start: (stepIndex: number = 0, options?: NavigationOptions) => {
      init();
      startStep(stepIndex, options);
    },
    setConfig: configure,
    setSteps: (steps: readonly CoachMarkStep[]) => {
      resetState();
      configure({
        ...getConfig(),
        steps: [...steps] // Convert readonly to mutable array
      });
    },
    getConfig,
    getState,
    getActiveIndex: () => getState('activeIndex'),
    isFirstStep: () => getState('activeIndex') === 0,
    isLastStep: () => {
      const steps = getConfig('steps') || [];
      const activeIndex = getState('activeIndex');
      return activeIndex !== undefined && activeIndex === steps.length - 1;
    },
    getActiveStep: () => getState('currentActiveStep') as CoachMarkStep | undefined,
    getActiveElement: () => getState('currentActiveElement'),
    getPreviousElement: () => getState('internalPreviousElement'),
    getPreviousStep: () => getState('internalPreviousStep') as CoachMarkStep | undefined,
    moveNext: (options?: NavigationOptions) => moveNext(options),
    movePrevious: (options?: NavigationOptions) => movePrevious(options),
    moveTo: (index: number, options?: NavigationOptions) => moveTo(index, options),
    skipTour,
    hasNextStep: () => {
      const steps = getConfig('steps') || [];
      const activeIndex = getState('activeIndex');
      return activeIndex !== undefined && !!steps[activeIndex + 1];
    },
    hasPreviousStep: () => {
      const steps = getConfig('steps') || [];
      const activeIndex = getState('activeIndex');
      return activeIndex !== undefined && !!steps[activeIndex - 1];
    },
    highlight: (step: CoachMarkStep) => {
      init();
      highlight({
        ...step,
        popover: step.popover
          ? {
              showButtons: [],
              showProgress: false,
              progressText: '1 / 1',
              ...step.popover,
            }
          : undefined
      });
    },
    destroy: () => {
      destroy(false);
    }
  };

  setCurrentCoachMark(api);

  return {
    // Coach mark API
    ...api,

    // Reactive state
    isActive,
    currentStepIndex,

    // Internal methods for component use
    init,
    destroy
  };
};
