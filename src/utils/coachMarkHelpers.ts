import type { CoachMarkStep, StepLifecycleEventContext, StepInteractionEventContext, CoachMarkInstance } from '../types'

/**
 * Find step index with robust fallback mechanisms
 * Uses multiple strategies to locate a step in the steps array
 */
export const findStepIndex = (
  step: CoachMarkStep,
  steps: CoachMarkStep[],
  currentStepIndex?: number
): number => {
  // First try direct object reference comparison
  let stepIndex = steps.findIndex(s => s === step)
  
  // If direct comparison fails, try element selector comparison
  if (stepIndex === -1 && step.element) {
    stepIndex = steps.findIndex(s => s.element === step.element)
  }
  
  // If still not found, try using current step index as fallback
  if (stepIndex === -1 && currentStepIndex !== undefined) {
    const currentStepData = steps[currentStepIndex]
    if (currentStepData && currentStepData.element === step.element) {
      stepIndex = currentStepIndex
    }
  }
  
  return stepIndex
}

/**
 * Create step lifecycle event context
 * Provides comprehensive context for step lifecycle events
 */
export const createStepLifecycleContext = (
  step: CoachMarkStep,
  steps: CoachMarkStep[],
  currentStepIndex: number | undefined,
  coachMark: CoachMarkInstance,
  stepIndex?: number
): StepLifecycleEventContext => {
  const resolvedStepIndex = stepIndex !== undefined ? stepIndex : findStepIndex(step, steps, currentStepIndex)
  const nextStep = steps[resolvedStepIndex + 1]
  const previousStep = steps[resolvedStepIndex - 1]
  
  return {
    step,
    nextStep,
    previousStep,
    stepIndex: resolvedStepIndex,
    isHighlighted: currentStepIndex === resolvedStepIndex,
    isLastStep: resolvedStepIndex === steps.length - 1,
    isFirstStep: resolvedStepIndex === 0,
    coachMark
  }
}

/**
 * Create step interaction event context
 * Provides comprehensive context for step interaction events
 */
export const createStepInteractionContext = (
  step: CoachMarkStep,
  steps: CoachMarkStep[],
  currentStepIndex: number | undefined,
  coachMark: CoachMarkInstance,
  stepIndex?: number
): StepInteractionEventContext => {
  const resolvedStepIndex = stepIndex !== undefined ? stepIndex : findStepIndex(step, steps, currentStepIndex)
  const nextStep = steps[resolvedStepIndex + 1]
  const previousStep = steps[resolvedStepIndex - 1]
  
  return {
    step,
    nextStep,
    previousStep,
    coachMark,
    stepIndex: resolvedStepIndex,
    hasNextStep: resolvedStepIndex < steps.length - 1,
    hasPreviousStep: resolvedStepIndex > 0,
    isHighlighted: currentStepIndex === resolvedStepIndex
  }
}
