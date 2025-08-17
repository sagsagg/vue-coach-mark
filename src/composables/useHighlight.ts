/**
 * Element highlighting composable for MintCoachMark
 * Manages element highlighting, transitions, and animations
 *
 * ANIMATION ARCHITECTURE EXPLANATION:
 *
 * This composable uses requestAnimationFrame for complex overlay morphing animations
 * instead of Vue Transitions for the following critical reasons:
 *
 * 1. GEOMETRIC INTERPOLATION: The overlay system requires real-time calculation
 *    of SVG path coordinates, morphing between different element shapes and sizes.
 *    Vue Transitions cannot handle this level of geometric complexity.
 *
 * 2. PERFORMANCE REQUIREMENTS: 60fps smooth animations are essential for good UX.
 *    requestAnimationFrame provides precise timing control and optimal performance
 *    for complex mathematical calculations.
 *
 * 3. CUSTOM EASING FUNCTIONS: Uses specialized easing (easeInOutQuad) for smooth
 *    morphing between different element geometries. Vue Transitions are limited
 *    to CSS easing functions.
 *
 * 4. ASYNC COORDINATION: Must coordinate with async tour functionality, step
 *    lifecycle hooks, and programmatic navigation timing. requestAnimationFrame
 *    provides the imperative control needed for this coordination.
 *
 * 5. STATE SYNCHRONIZATION: Complex state management during animations requires
 *    precise timing control that Vue's declarative transitions cannot provide.
 *
 * Vue Transitions are used for simple popover show/hide animations in the
 * component layer, while this system handles the complex overlay morphing.
 */

import { ref, nextTick } from 'vue';
import { createDummyElement, removeDummyElement, bringInView } from '../utils';
import { useCoachMarkState } from './useCoachMarkState';
import { useCoachMarkConfig } from './useCoachMarkConfig';

import { useElementRetry } from './useElementRetry';
import { extractRetryConfig } from './utils';
import type { CoachMarkStep, NavigationOptions } from '../types';

export const useHighlight = () => {
  const { getState, setState } = useCoachMarkState();
  const { getConfig, getCurrentCoachMark } = useCoachMarkConfig();
  // Overlay functionality now handled by MintCoachMarkOverlay component

  // Initialize element retry with global configuration
  const globalRetryConfig = getConfig('retry');
  const { resolveElementWithRetry, cancelRetry } = useElementRetry({
    defaultRetryConfig: extractRetryConfig(globalRetryConfig)
  });

  // Animation state
  const isAnimating = ref(false);

  /**
   * Update element classes and ARIA attributes
   */
  const updateElementHighlight = (fromElement: Element, toElement: Element, toStep: CoachMarkStep): void => {
    // Remove classes from previous element
    fromElement.classList.remove('mint-coach-mark-active-element', 'mint-coach-mark-no-interaction');
    fromElement.removeAttribute('aria-haspopup');
    fromElement.removeAttribute('aria-expanded');
    fromElement.removeAttribute('aria-controls');

    // Add classes to new element
    const disableActiveInteraction = toStep.disableActiveInteraction ?? getConfig('disableActiveInteraction');
    if (disableActiveInteraction) {
      toElement.classList.add('mint-coach-mark-no-interaction');
    }

    toElement.classList.add('mint-coach-mark-active-element');
    toElement.setAttribute('aria-haspopup', 'dialog');
    toElement.setAttribute('aria-expanded', 'true');
    toElement.setAttribute('aria-controls', 'mint-coach-mark-popover-content');
  };

  /**
   * Transfer highlight from current element to new element
   */
  const transferHighlight = async (toElement: Element, toStep: CoachMarkStep, options?: NavigationOptions): Promise<void> => {
    // Animation timing is now handled by CSS path morphing

    const fromStep: CoachMarkStep | undefined = getState('currentActiveStep');
    const fromElement = getState('currentActiveElement') || toElement;

    // If it's the first time we're highlighting an element, we show
    // the popover immediately. Otherwise, we wait for the animation
    // to finish before showing the popover.
    const isFirstHighlight = !fromElement || fromElement === toElement;
    const isToDummyElement = toElement.id === 'mint-coach-mark-dummy-element';
    const isFromDummyElement = fromElement.id === 'mint-coach-mark-dummy-element';

    const isAnimatedTour = getConfig('animate');
    const highlightStartedHook = toStep.onHighlightStarted || getConfig('onHighlightStarted');
    const highlightedHook = toStep?.onHighlighted || getConfig('onHighlighted');
    const deselectedHook = fromStep?.onDeselected || getConfig('onDeselected');

    const config = getConfig();
    const state = getState();
    const coachMark = getCurrentCoachMark();

    // Call deselected hook for previous element
    if (!isFirstHighlight && deselectedHook && coachMark && fromStep) {
      deselectedHook(isFromDummyElement ? undefined : fromElement, fromStep, {
        config,
        state,
        coachMark
      });
    }

    // Call highlight started hook
    if (highlightStartedHook && coachMark) {
      highlightStartedHook(isToDummyElement ? undefined : toElement, toStep, {
        config,
        state,
        coachMark
      });
    }

    // Set up animation state for complex overlay morphing
    // This cannot use Vue Transitions due to the geometric complexity
    isAnimating.value = true;
    let isPopoverRendered = false;
    const hasDelayedPopover = isAnimatedTour && !isFirstHighlight && toStep.popover;

    /**
     * CRITICAL: requestAnimationFrame-based animation loop
     *
     * Why not Vue Transitions:
     * - Requires real-time SVG path morphing calculations
     * - Needs custom easing functions for smooth geometric interpolation
     * - Must coordinate with async operations and step lifecycle
     * - Requires 60fps performance for smooth visual experience
     * - Handles complex state synchronization during transitions
     */
    // CSS path morphing handles animations, so we just finalize state immediately
    const finalize = () => {
      // Render popover if delayed
      if (!isPopoverRendered && hasDelayedPopover) {
        setState('shouldRenderPopover', { element: toElement, step: toStep });
        isPopoverRendered = true;
      }

      // Coordinate scrolling
      const shouldAutoScroll = !!options?.autoScroll || (options?.autoScroll && getConfig('smoothScroll'));

      if (!isToDummyElement && shouldAutoScroll) {
        const smoothScroll = getConfig('smoothScroll');

        // Delay ensures overlay positioning is fully complete before scrolling
        setTimeout(() => {
          bringInView(toElement, smoothScroll);
        }, 100);
      }

      // Execute step lifecycle hooks
      if (highlightedHook && coachMark) {
        highlightedHook(isToDummyElement ? undefined : toElement, toStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        });
      }

      // Update element tracking state
      setState('internalTransitionCallback', undefined);
      setState('internalPreviousStep', fromStep);
      setState('internalPreviousElement', fromElement);
      setState('currentActiveStep', toStep);
      setState('currentActiveElement', toElement);

      isAnimating.value = false;
    };

    // Execute the highlight logic immediately since CSS handles animations
    finalize();



    // Render popover immediately if not delayed
    if (!hasDelayedPopover && toStep.popover) {
      await nextTick();
      setState('shouldRenderPopover', { element: toElement, step: toStep });
    }

    // Update element classes and attributes
    updateElementHighlight(fromElement, toElement, toStep);
  };

  /**
   * Highlight a step element with retry mechanism
   */
  const highlight = async (step: CoachMarkStep, options?: NavigationOptions): Promise<void> => {
    const { element, retry } = step;

    // Try to resolve element with retry mechanism
    let elemObj = await resolveElementWithRetry(element, retry, step);

    // If the element is not found after retries, we mount a 1px div
    // at the center of the screen to highlight and show
    // the popover on top of that. This is to show a
    // modal-like highlight.
    if (!elemObj) {
      elemObj = createDummyElement();
    }

    await transferHighlight(elemObj, step, options);
  };

  /**
   * Refresh active highlight (useful for window resize)
   */
  const refreshActiveHighlight = (): void => {
    const activeHighlight = getState('currentActiveElement');
    const activeStep = getState('currentActiveStep');

    if (!activeHighlight || !activeStep) {
      return;
    }

    // Element tracking and overlay updates are now handled by MintCoachMarkOverlay component

    // Emit event for popover repositioning
    setState('shouldRepositionPopover', { element: activeHighlight, step: activeStep });
  };

  /**
   * Destroy highlighting and cancel any ongoing retries
   */
  const destroyHighlight = (): void => {
    // Cancel any ongoing retry operations
    cancelRetry();

    removeDummyElement();

    document.querySelectorAll('.mint-coach-mark-active-element').forEach(element => {
      element.classList.remove('mint-coach-mark-active-element', 'mint-coach-mark-no-interaction');
      element.removeAttribute('aria-haspopup');
      element.removeAttribute('aria-expanded');
      element.removeAttribute('aria-controls');
    });

    isAnimating.value = false;
    setState('internalTransitionCallback', undefined);
  };

  return {
    // Highlighting methods
    highlight,
    transferHighlight,
    refreshActiveHighlight,
    destroyHighlight,
    
    // State
    isAnimating
  };
};
