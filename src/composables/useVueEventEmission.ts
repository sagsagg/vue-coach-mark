import type { SetupContext } from 'vue';
import type {
  CoachMarkConfig,
  CoachMarkStep,
  CoachMarkInstance,
  MintCoachMarkEmits,
  HookContext
} from '../types';
import { findStepIndex, createStepLifecycleContext, createStepInteractionContext } from '../utils/coachMarkHelpers';

// =============================================================================
// TYPE-SAFE EVENT EMISSION SYSTEM
// =============================================================================

/**
 * Extract event names from MintCoachMarkEmits type
 * This ensures compile-time safety for event names
 */
export type EventName = keyof MintCoachMarkEmits;

/**
 * Extract payload type for a specific event name
 * This creates a mapped type that ensures event payloads match their definitions
 */
export type EventPayload<T extends EventName> = MintCoachMarkEmits[T] extends readonly [...infer Args] ? Args : never;

/**
 * Type-safe emit function derived directly from MintCoachMarkEmits
 * Single source of truth: event names and payloads come from MintCoachMarkEmits
 */
export type TypeSafeEmit = <E extends EventName>(
  event: E,
  ...args: MintCoachMarkEmits[E]
) => void;

/**
 * Create a type-safe wrapper around Vue's emit function
 * Returns the provided emit or a typed no-op when emit is undefined
 * No type assertions or any are used; relies on TypeScript's structural typing
 */
const createTypeSafeEmit = (
  emit?: SetupContext<MintCoachMarkEmits>['emit']
): TypeSafeEmit => {
  const noopEmit: TypeSafeEmit = () => { /* no-op */ };
  return emit ?? noopEmit;
};

/**
 * Interaction event names that use StepInteractionEventContext
 */
export type InteractionEventName = Extract<EventName,
  | 'step-next-clicked'
  | 'step-previous-clicked'
  | 'step-changed'
  | 'step-closed'
  | 'step-async-next-clicked'
  | 'step-async-previous-clicked'
>;

/**
 * Configuration object for enhanced config generation with type-safe emit
 */
export type EnhancedConfigParams = {
  config: CoachMarkConfig
  steps: readonly CoachMarkStep[]
  currentStepIndex: number | undefined
  coachMark: () => CoachMarkInstance
  emit?: SetupContext<MintCoachMarkEmits>['emit']
};

/**
 * Configuration object for event emitters with type-safe emit
 */
export type EventEmittersParams = {
  steps: readonly CoachMarkStep[]
  currentStepIndex: number | undefined
  coachMark: () => CoachMarkInstance
  emit?: SetupContext<MintCoachMarkEmits>['emit']
};

/**
 * Pure function to generate enhanced configuration with global lifecycle hooks
 * Returns plain object without Vue reactivity with type-safe event emission
 */
export const getEnhancedConfig = ({
  config,
  steps,
  currentStepIndex,
  coachMark,
  emit
}: EnhancedConfigParams): CoachMarkConfig => {
  // Create type-safe emit function
  const typeSafeEmit = createTypeSafeEmit(emit);

  return {
    ...config,
    onHighlightStarted: (element: Element | undefined, step: CoachMarkStep, context: HookContext) => {
      // Call original global config hook if defined
      if (config.onHighlightStarted) {
        config.onHighlightStarted(element, step, context);
      }

      // Call step-level hook if defined
      if (step.onHighlightStarted) {
        step.onHighlightStarted(element, step, context);
      }

      // Emit Vue event with comprehensive context using type-safe emit
      const stepIndex = findStepIndex(step, steps, currentStepIndex);
      if (stepIndex !== -1) {
        const eventContext = createStepLifecycleContext(step, steps, currentStepIndex, coachMark(), stepIndex);
        // Type-safe: 'step-highlight-started' requires StepLifecycleEventContext
        typeSafeEmit('step-highlight-started', eventContext);
      }

      // Emit legacy event for backward compatibility with type safety
      // Type-safe: 'highlight-started' requires [Element | undefined, CoachMarkStep]
      typeSafeEmit('highlight-started', element, step);
    },
    onHighlighted: (element: Element | undefined, step: CoachMarkStep, context: HookContext) => {
      // Call original global config hook if defined
      if (config.onHighlighted) {
        config.onHighlighted(element, step, context);
      }

      // Call step-level hook if defined
      if (step.onHighlighted) {
        step.onHighlighted(element, step, context);
      }

      // Emit Vue event with comprehensive context using type-safe emit
      const stepIndex = findStepIndex(step, steps, currentStepIndex);
      if (stepIndex !== -1) {
        const eventContext = createStepLifecycleContext(step, steps, currentStepIndex, coachMark(), stepIndex);
        // Type-safe: 'step-highlighted' requires StepLifecycleEventContext
        typeSafeEmit('step-highlighted', eventContext);
      }

      // Emit legacy event for backward compatibility with type safety
      // Type-safe: 'highlighted' requires [Element | undefined, CoachMarkStep]
      typeSafeEmit('highlighted', element, step);
    },
    onDeselected: (element: Element | undefined, step: CoachMarkStep, context: HookContext) => {
      // Call original global config hook if defined
      if (config.onDeselected) {
        config.onDeselected(element, step, context);
      }

      // Call step-level hook if defined
      if (step.onDeselected) {
        step.onDeselected(element, step, context);
      }

      // Emit Vue event with comprehensive context using type-safe emit
      const stepIndex = findStepIndex(step, steps, currentStepIndex);
      if (stepIndex !== -1) {
        const eventContext = createStepLifecycleContext(step, steps, currentStepIndex, coachMark(), stepIndex);
        // Type-safe: 'step-deselected' requires StepLifecycleEventContext
        typeSafeEmit('step-deselected', eventContext);
      }

      // Emit legacy event for backward compatibility with type safety
      // Type-safe: 'deselected' requires [Element | undefined, CoachMarkStep]
      typeSafeEmit('deselected', element, step);
    }
  };
};

/**
 * Pure function to create event emitters with type-safe event emission
 * Returns plain functions without Vue reactivity
 */
export const createEventEmitters = ({
  steps,
  currentStepIndex,
  coachMark,
  emit
}: EventEmittersParams) => {
  // Create type-safe emit function
  const typeSafeEmit = createTypeSafeEmit(emit);

  /**
   * Emit step interaction event with strict type safety
   * Uses type-safe emit with specific event name constraints
   */
  const emitStepInteractionEvent = (
    eventName: InteractionEventName,
    step: CoachMarkStep,
    stepIndex?: number
  ): void => {
    const resolvedStepIndex = stepIndex !== undefined ? stepIndex : findStepIndex(step, steps, currentStepIndex);
    if (resolvedStepIndex !== -1) {
      const eventContext = createStepInteractionContext(step, steps, currentStepIndex, coachMark(), resolvedStepIndex);

      // Type-safe event emission using switch for precise type matching
      // This ensures compile-time type safety for each specific event
      switch (eventName) {
        case 'step-next-clicked':
          typeSafeEmit('step-next-clicked', eventContext);
          break;
        case 'step-previous-clicked':
          typeSafeEmit('step-previous-clicked', eventContext);
          break;
        case 'step-changed':
          typeSafeEmit('step-changed', eventContext);
          break;
        case 'step-closed':
          typeSafeEmit('step-closed', eventContext);
          break;
        case 'step-async-next-clicked':
          typeSafeEmit('step-async-next-clicked', eventContext);
          break;
        case 'step-async-previous-clicked':
          typeSafeEmit('step-async-previous-clicked', eventContext);
          break;
        default: {
          // TypeScript will ensure this is never reached due to exhaustive checking
          // Keep a typed reference to satisfy exhaustiveness without returning a value
          const _exhaustiveCheck: never = eventName;
          void _exhaustiveCheck;
        }
      }
    }
  };

  /**
   * Emit async interaction event with type safety
   * This function is now redundant since emitStepInteractionEvent handles all interaction events
   * Kept for backward compatibility but delegates to the main function
   */
  const emitAsyncInteractionEvent = (
    eventName: Extract<InteractionEventName, 'step-async-next-clicked' | 'step-async-previous-clicked'>,
    step: CoachMarkStep,
    stepIndex?: number
  ): void => {
    // Delegate to the main type-safe function
    emitStepInteractionEvent(eventName, step, stepIndex);
  };

  /**
   * Emit async deselected event with type safety
   */
  const emitAsyncDeselectedEvent = (step: CoachMarkStep): void => {
    if (step.onAsyncDeselected) {
      const stepIndex = findStepIndex(step, steps, currentStepIndex);
      if (stepIndex !== -1) {
        const eventContext = createStepLifecycleContext(step, steps, currentStepIndex, coachMark(), stepIndex);
        // Type-safe: 'step-async-deselected' requires StepLifecycleEventContext
        typeSafeEmit('step-async-deselected', eventContext);
      }
    }
  };

  return {
    emitStepInteractionEvent,
    emitAsyncInteractionEvent,
    emitAsyncDeselectedEvent
  };
};
