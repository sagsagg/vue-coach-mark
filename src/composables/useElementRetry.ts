/**
 * Element retry composable for MintCoachMark
 * Handles retry logic for element resolution when elements are not immediately available
 */

import { ref, type Ref } from 'vue';
import { useTimeout } from 'quasar';
import { getElement } from '../utils';
import type {
  CoachMarkStep,
  RetryConfig,
  UseElementRetryOptions,
  UseElementRetryReturn
} from '../types';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  enabled: true,
  maxAttempts: 5,
  delay: 1000,
  exponentialBackoff: false,
  onRetry: () => {},
  onMaxAttemptsReached: () => {}
};

/**
 * Composable for handling element retry logic
 * 
 * @param options - Configuration options for the retry mechanism
 * @returns Retry management API
 */
export const useElementRetry = (options: UseElementRetryOptions = {}): UseElementRetryReturn => {
  const { defaultRetryConfig = {} } = options;

  // Reactive state for retry operations
  const isRetrying: Ref<boolean> = ref(false);
  const currentAttempt: Ref<number> = ref(0);

  // Quasar timeout management with automatic cleanup
  const { registerTimeout, removeTimeout } = useTimeout();
  let isCancelled = false;

  /**
   * Merge retry configurations with defaults
   */
  const mergeRetryConfig = (
    stepRetryConfig?: boolean | RetryConfig,
    globalRetryConfig?: RetryConfig
  ): Required<RetryConfig> => {
    // If step retry is explicitly false, disable retry
    if (stepRetryConfig === false) {
      return { ...DEFAULT_RETRY_CONFIG, enabled: false };
    }

    // If step retry is true, use defaults with global overrides
    if (stepRetryConfig === true) {
      return {
        ...DEFAULT_RETRY_CONFIG,
        ...defaultRetryConfig,
        ...globalRetryConfig
      };
    }

    // If step retry is an object, merge with defaults and global config
    if (typeof stepRetryConfig === 'object') {
      return {
        ...DEFAULT_RETRY_CONFIG,
        ...defaultRetryConfig,
        ...globalRetryConfig,
        ...stepRetryConfig
      };
    }

    // If no step retry config, use global config or defaults
    return {
      ...DEFAULT_RETRY_CONFIG,
      ...defaultRetryConfig,
      ...globalRetryConfig
    };
  };

  /**
   * Calculate delay for retry attempt with optional exponential backoff
   */
  const calculateDelay = (attempt: number, baseDelay: number, exponentialBackoff: boolean): number => {
    if (!exponentialBackoff) {
      return baseDelay;
    }
    
    // Exponential backoff: delay * (2 ^ (attempt - 1))
    // Capped at 30 seconds to prevent excessive delays
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    return Math.min(exponentialDelay, 30000);
  };

  /**
   * Sleep for specified duration using Quasar's useTimeout for automatic cleanup
   */
  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      registerTimeout(resolve, ms);
    });
  };

  /**
   * Resolve element with retry mechanism
   */
  const resolveElementWithRetry = async (
    elementRef: string | Element | (() => Element) | undefined,
    retryConfig?: boolean | RetryConfig,
    step?: CoachMarkStep
  ): Promise<Element | null> => {
    // Reset state
    isCancelled = false;
    currentAttempt.value = 0;
    isRetrying.value = false;

    // Get merged retry configuration
    const config = mergeRetryConfig(retryConfig, defaultRetryConfig);

    // If retry is disabled, try once and return
    if (!config.enabled) {
      return getElement(elementRef);
    }

    // Start retry process
    isRetrying.value = true;

    /**
     * Recursive retry function to avoid await-in-loop ESLint violations
     */
    const attemptResolve = async (attempt: number): Promise<Element | null> => {
      // Check if retry was cancelled
      if (isCancelled) {
        isRetrying.value = false;
        return null;
      }

      currentAttempt.value = attempt;

      // Try to resolve element
      const element = getElement(elementRef);

      if (element) {
        // Element found successfully
        isRetrying.value = false;
        currentAttempt.value = 0;
        return element;
      }

      // Element not found, check if we should retry
      if (attempt < config.maxAttempts) {
        // Handle retry callback and delays
        const delays: number[] = [];

        // Call retry callback if provided
        if (config.onRetry && step) {
          try {
            config.onRetry(attempt, step);

            // Add extra delay after first retry to allow DOM updates
            if (attempt === 1) {
              delays.push(200); // Extra time for DOM updates
            }
          } catch (error) {
            console.warn('Error in retry callback:', error);
          }
        }

        // Calculate main retry delay
        const delay = calculateDelay(attempt, config.delay, config.exponentialBackoff);
        delays.push(delay);

        // Chain delays and continue with next attempt
        return delays.reduce(
          (promise, delayMs) => promise.then(() => sleep(delayMs)),
          Promise.resolve()
        ).then(() => attemptResolve(attempt + 1));
      }

      // Max attempts reached
      isRetrying.value = false;
      currentAttempt.value = 0;

      // Call max attempts reached callback if provided
      if (config.onMaxAttemptsReached && step) {
        try {
          config.onMaxAttemptsReached(step);
        } catch (error) {
          console.warn('Error in max attempts reached callback:', error);
        }
      }

      return null;
    };

    // Start the recursive retry process
    return attemptResolve(1);
  };

  /**
   * Cancel ongoing retry operation using Quasar's removeTimeout
   */
  const cancelRetry = (): void => {
    isCancelled = true;
    isRetrying.value = false;
    currentAttempt.value = 0;

    // Quasar's useTimeout automatically handles cleanup
    removeTimeout();
  };

  return {
    resolveElementWithRetry,
    isRetrying,
    currentAttempt,
    cancelRetry
  };
};
