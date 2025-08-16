import {
  type ComputedRef, nextTick, type Ref, ref,
} from 'vue';
import type { PopoverCommunication, TooltipDisplayState, CoachMarkStep } from '../types';

type TooltipDependenciesProvider = () => {
  popoverState: ComputedRef<PopoverCommunication>;
  currentStep: ComputedRef<CoachMarkStep | undefined>;
  isTransitioning: Ref<boolean>;
};

/**
 * Tooltip management composable
 *
 * Provides centralized tooltip display management with:
 * - Context-aware execution control
 * - Debouncing to prevent visual flashing
 * - Step transition state management
 * - Performance monitoring
 *
 * @param showTooltipInternal - Internal function to actually show the tooltip
 * @returns Tooltip management API
 */
const useTooltipManagement = (
  getDependencies: TooltipDependenciesProvider,
) => {
  // Reactive state
  const tooltipVisible = ref(false);
  const tooltipRefreshKey = ref(0);

  // Internal state management
  const displayState: TooltipDisplayState = {
    isDisplaying: false,
    pendingDisplayId: 0,
    lastDisplayTime: 0,
    debounceDelay: 100,
    totalCalls: 0,
    debouncedCalls: 0,
    executedCalls: 0,
    lastExecutionContext: '',
    isStepTransitioning: false,
  };

  // Throttling for refresh operations
  let lastRefreshTime = 0;

  /**
   * Promise-based delay utility
   */
  const delay = (ms: number): Promise<void> => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

  /**
   * Internal implementation - show tooltip only if all conditions are met
   * Gets current reactive values from the dependencies provider to ensure fresh data
   */
  const showTooltipIfReadyInternal = async (): Promise<void> => {
    // Get current reactive values to ensure we have the latest state
    const { popoverState, currentStep, isTransitioning } = getDependencies();

    // Verify all conditions are met before showing
    const hasValidStep = !!(popoverState.value.step ?? currentStep.value);
    const isReady = popoverState.value.visible
                    && popoverState.value.targetElement
                    && hasValidStep
                    && !isTransitioning.value;

    if (isReady) {
      // Use QTooltip's native delay handling - just set visibility
      if (!tooltipVisible.value) {
        await nextTick();
        tooltipVisible.value = true;
      }
    } else if (popoverState.value.visible
      && popoverState.value.targetElement
      && !isTransitioning.value && !hasValidStep) {
      // Simple retry for missing step data
      await nextTick();

      const retryHasValidStep = !!(popoverState.value.step ?? currentStep.value);

      if (retryHasValidStep && !tooltipVisible.value) {
        tooltipVisible.value = true;
      }
    }
  };

  /**
   * Force tooltip refresh with throttling
   */
  const forceTooltipRefresh = (): void => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;

    // Throttle refresh to prevent excessive updates
    if (timeSinceLastRefresh < 50) {
      return;
    }

    // tooltipRefreshKey.value += 1
    lastRefreshTime = now;
  };

  /**
   * Debounced tooltip display with context awareness
   */
  const debouncedShowTooltip = async (context = 'unknown'): Promise<void> => {
    displayState.totalCalls++;

    const displayId = ++displayState.pendingDisplayId;
    const now = Date.now();

    // During step transitions, only allow calls from step transition functions
    if (displayState.isStepTransitioning) {
      const isStepTransitionContext = context.includes('step-transition');

      if (!isStepTransitionContext) {
        displayState.debouncedCalls++;

        return;
      }
    }

    // If another display operation is in progress, wait for it to complete
    if (displayState.isDisplaying) {
      // Wait for current operation to complete using Promise-based polling
      await new Promise<void>((resolve) => {
        const checkDisplayState = (): void => {
          if (!displayState.isDisplaying) {
            resolve();
          } else {
            setTimeout(checkDisplayState, 25);
          }
        };

        checkDisplayState();
      });

      // Check if this request is still the latest
      if (displayId !== displayState.pendingDisplayId) {
        displayState.debouncedCalls++;

        return;
      }
    }

    // Debounce rapid successive calls
    const timeSinceLastDisplay = now - displayState.lastDisplayTime;

    if (timeSinceLastDisplay < displayState.debounceDelay) {
      const remainingDelay = displayState.debounceDelay - timeSinceLastDisplay;

      await delay(remainingDelay);

      // Check if this request is still the latest after debounce
      if (displayId !== displayState.pendingDisplayId) {
        displayState.debouncedCalls++;

        return;
      }
    }

    // Mark as displaying and execute
    displayState.isDisplaying = true;
    displayState.lastDisplayTime = Date.now();
    displayState.executedCalls++;
    displayState.lastExecutionContext = context;

    try {
      await showTooltipIfReadyInternal();
    } finally {
      displayState.isDisplaying = false;
    }
  };

  /**
   * Public interface for showing tooltip
   */
  const showTooltipIfReady = async (context = 'unknown'): Promise<void> => {
    await debouncedShowTooltip(context);
  };

  /**
   * Hide tooltip immediately
   */
  const hideTooltip = (): void => {
    tooltipVisible.value = false;
  };

  /**
   * Set step transition state
   */
  const setStepTransitioning = (transitioning: boolean): void => {
    displayState.isStepTransitioning = transitioning;
  };

  /**
   * Get display statistics for debugging
   */
  const getDisplayStats = (): TooltipDisplayState => ({ ...displayState });

  return {
    tooltipVisible,
    tooltipRefreshKey,
    showTooltipIfReady,
    hideTooltip,
    forceTooltipRefresh,
    setStepTransitioning,
    getDisplayStats,
  };
};

export default useTooltipManagement;
