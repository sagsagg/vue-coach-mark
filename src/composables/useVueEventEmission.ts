import type { SetupContext } from 'vue'
import type {
  CoachMarkConfig,
  CoachMarkStep,
  CoachMarkInstance,
  MintCoachMarkEmits
} from '../types'
import { findStepIndex, createStepLifecycleContext, createStepInteractionContext } from '../utils/coachMarkHelpers'

/**
 * Configuration object for enhanced config generation
 */
export type EnhancedConfigParams = {
  config: CoachMarkConfig
  steps: readonly CoachMarkStep[]
  currentStepIndex: number | undefined
  coachMark: () => CoachMarkInstance
  emit?: SetupContext<MintCoachMarkEmits>['emit']
}

/**
 * Configuration object for event emitters
 */
export type EventEmittersParams = {
  steps: readonly CoachMarkStep[]
  currentStepIndex: number | undefined
  coachMark: () => CoachMarkInstance
  emit?: SetupContext<MintCoachMarkEmits>['emit']
}

/**
 * Pure function to generate enhanced configuration with global lifecycle hooks
 * Returns plain object without Vue reactivity
 */
export const getEnhancedConfig = ({
  config,
  steps,
  currentStepIndex,
  coachMark,
  emit
}: EnhancedConfigParams): CoachMarkConfig => {
  return {
    ...config,
    onHighlightStarted: (element: Element | undefined, step: CoachMarkStep, context: any) => {
      // Call original global config hook if defined
      if (config.onHighlightStarted) {
        config.onHighlightStarted(element, step, context)
      }

      // Call step-level hook if defined
      if (step.onHighlightStarted) {
        step.onHighlightStarted(element, step, context)
      }

      // Emit Vue event with comprehensive context
      const stepIndex = findStepIndex(step, steps, currentStepIndex)
      if (stepIndex !== -1) {
        const eventContext = createStepLifecycleContext(step, steps, currentStepIndex, coachMark(), stepIndex)
        emit?.('step-highlight-started', eventContext)
      }

      // Emit legacy event for backward compatibility
      emit?.('highlight-started', element, step)
    },
    onHighlighted: (element: Element | undefined, step: CoachMarkStep, context: any) => {
      // Call original global config hook if defined
      if (config.onHighlighted) {
        config.onHighlighted(element, step, context)
      }

      // Call step-level hook if defined
      if (step.onHighlighted) {
        step.onHighlighted(element, step, context)
      }

      // Emit Vue event with comprehensive context
      const stepIndex = findStepIndex(step, steps, currentStepIndex)
      if (stepIndex !== -1) {
        const eventContext = createStepLifecycleContext(step, steps, currentStepIndex, coachMark(), stepIndex)
        emit?.('step-highlighted', eventContext)
      }

      // Emit legacy event for backward compatibility
      emit?.('highlighted', element, step)
    },
    onDeselected: (element: Element | undefined, step: CoachMarkStep, context: any) => {
      // Call original global config hook if defined
      if (config.onDeselected) {
        config.onDeselected(element, step, context)
      }

      // Call step-level hook if defined
      if (step.onDeselected) {
        step.onDeselected(element, step, context)
      }

      // Emit Vue event with comprehensive context
      const stepIndex = findStepIndex(step, steps, currentStepIndex)
      if (stepIndex !== -1) {
        const eventContext = createStepLifecycleContext(step, steps, currentStepIndex, coachMark(), stepIndex)
        emit?.('step-deselected', eventContext)
      }

      // Emit legacy event for backward compatibility
      emit?.('deselected', element, step)
    }
  }
}

/**
 * Pure function to create event emitters
 * Returns plain functions without Vue reactivity
 */
export const createEventEmitters = ({
  steps,
  currentStepIndex,
  coachMark,
  emit
}: EventEmittersParams) => {
  /**
   * Emit step interaction event
   */
  const emitStepInteractionEvent = (
    eventName: 'step-next-clicked' | 'step-previous-clicked' | 'step-changed' | 'step-closed',
    step: CoachMarkStep,
    stepIndex?: number
  ): void => {
    const resolvedStepIndex = stepIndex !== undefined ? stepIndex : findStepIndex(step, steps, currentStepIndex)
    if (resolvedStepIndex !== -1) {
      const eventContext = createStepInteractionContext(step, steps, currentStepIndex, coachMark(), resolvedStepIndex)

      // Use proper type-safe event emission based on event name
      switch (eventName) {
        case 'step-next-clicked':
          emit?.('step-next-clicked', eventContext)
          break
        case 'step-previous-clicked':
          emit?.('step-previous-clicked', eventContext)
          break
        case 'step-changed':
          emit?.('step-changed', eventContext)
          break
        case 'step-closed':
          emit?.('step-closed', eventContext)
          break
      }
    }
  }

  /**
   * Emit async interaction event
   */
  const emitAsyncInteractionEvent = (
    eventName: 'step-async-next-clicked' | 'step-async-previous-clicked',
    step: CoachMarkStep,
    stepIndex?: number
  ): void => {
    const resolvedStepIndex = stepIndex !== undefined ? stepIndex : findStepIndex(step, steps, currentStepIndex)
    if (resolvedStepIndex !== -1) {
      const eventContext = createStepInteractionContext(step, steps, currentStepIndex, coachMark(), resolvedStepIndex)

      // Use proper type-safe event emission based on event name
      switch (eventName) {
        case 'step-async-next-clicked':
          emit?.('step-async-next-clicked', eventContext)
          break
        case 'step-async-previous-clicked':
          emit?.('step-async-previous-clicked', eventContext)
          break
      }
    }
  }

  /**
   * Emit async deselected event
   */
  const emitAsyncDeselectedEvent = (step: CoachMarkStep): void => {
    if (step.onAsyncDeselected) {
      const stepIndex = findStepIndex(step, steps, currentStepIndex)
      if (stepIndex !== -1) {
        const eventContext = createStepLifecycleContext(step, steps, currentStepIndex, coachMark(), stepIndex)
        emit?.('step-async-deselected', eventContext)
      }
    }
  }

  return {
    emitStepInteractionEvent,
    emitAsyncInteractionEvent,
    emitAsyncDeselectedEvent
  }
}
