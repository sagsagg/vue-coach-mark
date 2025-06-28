/**
 * Event handling composable for MintCoachMark
 * Leverages Vue.js built-in features for reactive event management
 */

import {
  ref,
  computed,
  onUnmounted,
  type Ref,
  type ComputedRef
} from 'vue';
import { getFocusableElements } from '../utils';
import { useCoachMarkState } from './useCoachMarkState';
import { useCoachMarkConfig } from './useCoachMarkConfig';
import {
  isElement,
  isHTMLElement,
  isMouseEvent,
  isPointerEvent
} from './utils';

// Event types with strict typing
type AllowedEvents =
  | 'overlayClick'
  | 'escapePress'
  | 'nextClick'
  | 'prevClick'
  | 'closeClick'
  | 'arrowRightPress'
  | 'arrowLeftPress'
  | 'refreshRequired';

type EventCallback = () => void;

type EventListenerMap = Record<AllowedEvents, EventCallback | undefined>;

type KeyboardEventHandler = (event: KeyboardEvent) => void;
type GenericEventHandler = (event: Event) => void;
type PointerEventHandler = (event: MouseEvent | PointerEvent) => void;



interface UseCoachMarkEventsReturn {
  readonly listen: (event: AllowedEvents, callback: EventCallback) => void
  readonly emit: (event: AllowedEvents) => void
  readonly initEvents: () => void
  readonly destroyEvents: () => void
  readonly destroyEmitter: () => void
  readonly onCoachMarkClick: (
    element: Element,
    listener: PointerEventHandler,
    shouldPreventDefault?: (target: HTMLElement) => boolean
  ) => () => void
  readonly eventsInitialized: ComputedRef<boolean>
}

export const useCoachMarkEvents = (): UseCoachMarkEventsReturn => {
  const { getState, setState } = useCoachMarkState();
  const { getConfig } = useCoachMarkConfig();

  // Event listeners registry using Vue's reactive system
  const registeredListeners: Ref<Partial<EventListenerMap>> = ref({});

  // Track if events are initialized using Vue's reactive system
  const eventsInitialized: Ref<boolean> = ref(false);

  // Computed property for events initialization status
  const isEventsInitialized: ComputedRef<boolean> = computed(() => eventsInitialized.value);

  /**
   * Register an event listener using Vue's reactive system
   */
  const listen = (event: AllowedEvents, callback: EventCallback): void => {
    registeredListeners.value[event] = callback;
  };

  /**
   * Emit an event using Vue's reactive system
   */
  const emit = (event: AllowedEvents): void => {
    const callback = registeredListeners.value[event];
    if (callback) {
      callback();
    }
  };

  /**
   * Handle keyboard events using Vue's reactive system
   */
  const handleKeyup: KeyboardEventHandler = (e: KeyboardEvent): void => {
    try {
      const allowKeyboardControl = getConfig('allowKeyboardControl') ?? true;

      if (!allowKeyboardControl) {
        return;
      }

      if (e.key === 'Escape') {
        emit('escapePress');
      } else if (e.key === 'ArrowRight') {
        emit('arrowRightPress');
      } else if (e.key === 'ArrowLeft') {
        emit('arrowLeftPress');
      }
    } catch (error) {
      console.warn('Error in keyboard event handler:', error);
    }
  };

  /**
   * Handle focus trapping for accessibility using Vue's reactive system
   */
  const handleFocusTrapping: KeyboardEventHandler = (e: KeyboardEvent): void => {
    try {
      const isActivated = getState('isInitialized');
      if (!isActivated) {
        return;
      }

      const isTabKey = e.key === 'Tab';
      if (!isTabKey) {
        return;
      }

      const activeElement = getState('currentActiveElement');
      const popoverEl = getState('popover')?.wrapper;

      const elementsToSearch: Element[] = [
        ...(popoverEl ? [popoverEl] : []),
        ...(activeElement ? [activeElement] : [])
      ];

      const focusableEls: HTMLElement[] = getFocusableElements(elementsToSearch);

      const firstFocusableEl: HTMLElement | undefined = focusableEls[0];
      const lastFocusableEl: HTMLElement | undefined = focusableEls[focusableEls.length - 1];

      if (!firstFocusableEl || !lastFocusableEl) {
        return;
      }

      e.preventDefault();

      const currentActiveElement = document.activeElement;
      if (!isHTMLElement(currentActiveElement)) {
        firstFocusableEl.focus();
        return;
      }

      if (e.shiftKey) {
        const currentIndex: number = focusableEls.indexOf(currentActiveElement);
        const previousFocusableEl: HTMLElement = currentIndex > 0 ? focusableEls[currentIndex - 1] : lastFocusableEl;
        previousFocusableEl.focus();
      } else {
        const currentIndex: number = focusableEls.indexOf(currentActiveElement);
        const nextFocusableEl: HTMLElement = currentIndex < focusableEls.length - 1 ? focusableEls[currentIndex + 1] : firstFocusableEl;
        nextFocusableEl.focus();
      }
    } catch (error) {
      console.warn('Error in focus trapping handler:', error);
    }
  };

  /**
   * Handle window resize and scroll events using Vue's reactive system
   *
   * MEMORY LEAK PREVENTION: This function demonstrates proper requestAnimationFrame
   * cleanup patterns that are essential when mixing Vue Transitions with
   * requestAnimationFrame-based animations.
   */
  const handleRefreshRequired = (): void => {
    const resizeTimeout = getState('internalResizeTimeout');

    // CRITICAL: Cancel any pending animation frame to prevent memory leaks
    // This is essential when using requestAnimationFrame alongside Vue Transitions
    // to ensure proper cleanup and prevent callbacks from executing after
    // component destruction
    if (typeof resizeTimeout === 'number') {
      window.cancelAnimationFrame(resizeTimeout);
    }

    // Check if events are still initialized before scheduling new frame
    // This prevents scheduling new animations after component unmount
    if (!eventsInitialized.value) {
      return;
    }

    // Use requestAnimationFrame for debounced refresh operations
    // This provides better performance than setTimeout for UI updates
    const timeoutId: number = window.requestAnimationFrame(() => {
      // Double-check state before emitting to prevent execution after component destruction
      // This pattern is crucial for preventing memory leaks in hybrid animation systems
      if (eventsInitialized.value) {
        emit('refreshRequired');
      }
    });
    setState('internalResizeTimeout', timeoutId);
  };

  /**
   * Handle clicks on coach mark elements with proper event handling using Vue patterns
   */
  const onCoachMarkClick = (
    element: Element,
    listener: PointerEventHandler,
    shouldPreventDefault?: (target: HTMLElement) => boolean
  ): (() => void) => {
    // Add type guard and validation at the beginning
    if (!isElement(element)) {
      console.warn('Invalid element provided to onCoachMarkClick');
      return () => {}; // Return no-op cleanup function
    }

    if (typeof listener !== 'function') {
      console.warn('Invalid listener provided to onCoachMarkClick');
      return () => {}; // Return no-op cleanup function
    }
    const listenerWrapper = (e: MouseEvent | PointerEvent, actualListener?: PointerEventHandler): void => {
      try {
        const target = e.target;
        if (!target || !isElement(target)) {
          return;
        }

        if (!element.contains(target)) {
          return;
        }

        if (!isHTMLElement(target)) {
          return;
        }

        if (!shouldPreventDefault || shouldPreventDefault(target)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }

        if (actualListener) {
          actualListener(e);
        }
      } catch (error) {
        console.warn('Error in coach mark click handler:', error);
      }
    };

    // We want to be the absolute first one to hear about the event
    const useCapture = true;

    // Event handlers with proper type guards using Vue patterns
    const pointerDownHandler: GenericEventHandler = (e: Event): void => {
      if (isPointerEvent(e)) {
        listenerWrapper(e);
      }
    };

    const mouseDownHandler: GenericEventHandler = (e: Event): void => {
      if (isMouseEvent(e)) {
        listenerWrapper(e);
      }
    };

    const pointerUpHandler: GenericEventHandler = (e: Event): void => {
      if (isPointerEvent(e)) {
        listenerWrapper(e);
      }
    };

    const mouseUpHandler: GenericEventHandler = (e: Event): void => {
      if (isMouseEvent(e)) {
        listenerWrapper(e);
      }
    };

    const clickHandler: GenericEventHandler = (e: Event): void => {
      if (isMouseEvent(e)) {
        listenerWrapper(e, listener);
      }
    };

    // Add event listeners using Vue patterns
    element.addEventListener('pointerdown', pointerDownHandler, useCapture);
    element.addEventListener('mousedown', mouseDownHandler, useCapture);
    element.addEventListener('pointerup', pointerUpHandler, useCapture);
    element.addEventListener('mouseup', mouseUpHandler, useCapture);
    element.addEventListener('click', clickHandler, useCapture);

    // Return cleanup function following Vue patterns
    return (): void => {
      element.removeEventListener('pointerdown', pointerDownHandler, useCapture);
      element.removeEventListener('mousedown', mouseDownHandler, useCapture);
      element.removeEventListener('pointerup', pointerUpHandler, useCapture);
      element.removeEventListener('mouseup', mouseUpHandler, useCapture);
      element.removeEventListener('click', clickHandler, useCapture);
    };
  };

  /**
   * Initialize global event listeners using Vue's lifecycle patterns
   */
  const initEvents = (): void => {
    if (eventsInitialized.value) {
      return;
    }

    // Set flag immediately to prevent race conditions
    eventsInitialized.value = true;

    window.addEventListener('keyup', handleKeyup, false);
    window.addEventListener('keydown', handleFocusTrapping, false);
    window.addEventListener('resize', handleRefreshRequired);
    window.addEventListener('scroll', handleRefreshRequired);
  };

  /**
   * Destroy global event listeners using Vue's cleanup patterns
   */
  const destroyEvents = (): void => {
    if (!eventsInitialized.value) {
      return;
    }

    window.removeEventListener('keyup', handleKeyup);
    window.removeEventListener('keydown', handleFocusTrapping);
    window.removeEventListener('resize', handleRefreshRequired);
    window.removeEventListener('scroll', handleRefreshRequired);

    eventsInitialized.value = false;
  };

  /**
   * Clear all event listeners and reset state using Vue's reactive system
   */
  const destroyEmitter = (): void => {
    destroyEvents();
    registeredListeners.value = {};
  };

  // Use Vue's lifecycle hooks for proper cleanup
  // HYBRID ANIMATION CLEANUP: This demonstrates proper cleanup patterns
  // when using both Vue Transitions and requestAnimationFrame animations
  onUnmounted(() => {
    // CRITICAL: Cancel any pending animation frames to prevent memory leaks
    // This is essential in hybrid animation systems where requestAnimationFrame
    // callbacks might still be scheduled when Vue components are destroyed
    const resizeTimeout = getState('internalResizeTimeout');
    if (typeof resizeTimeout === 'number') {
      window.cancelAnimationFrame(resizeTimeout);
      setState('internalResizeTimeout', undefined);
    }

    // Clean up event listeners and reactive state
    // Vue Transitions handle their own cleanup automatically,
    // but we must manually clean up requestAnimationFrame-based animations
    destroyEvents();
    destroyEmitter();
  });



  return {
    // Event management
    listen,
    emit,
    initEvents,
    destroyEvents,
    destroyEmitter,
    onCoachMarkClick,

    // State using Vue's computed property
    eventsInitialized: isEventsInitialized
  } as const;
};
