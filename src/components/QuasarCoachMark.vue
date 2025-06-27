<template>
  <div class="quasar-coach-mark">
    <!-- QTooltip-based popover implementation -->
    <QTooltip
      v-if="shouldShowTooltip"
      :key="`tooltip-${tooltipRefreshKey}`"
      v-model="tooltipVisible"
      :target="popoverState.targetElement || undefined"
      :anchor="quasarAnchor"
      :self="quasarSelf"
      :offset="quasarOffset"
      :delay="1000"
      :hide-delay="50"
      no-parent-event
      class="mint-coach-mark-quasar-tooltip"
      :class="quasarClass"
      @show="handleTooltipShow"
      @hide="handleTooltipHide"
    >
      <div class="mint-coach-mark-quasar-wrapper">
        <!-- Title -->
        <div v-if="currentStep?.popover?.title" class="mint-coach-mark-quasar-title">
          <slot name="title" :step="currentStep" :index="currentStepIndex">
            {{ currentStep.popover.title }}
          </slot>
        </div>
        
        <!-- Description -->
        <div v-if="currentStep?.popover?.description" class="mint-coach-mark-quasar-description">
          <slot name="content" :step="currentStep" :index="currentStepIndex">
            {{ currentStep.popover.description }}
          </slot>
        </div>
        
        <!-- Progress -->
        <div
          v-if="currentStep?.popover?.showProgress"
          class="mint-coach-mark-quasar-progress"
        >
          <slot name="progress" :step="currentStep" :index="currentStepIndex" :total="totalSteps">
            <div class="mint-coach-mark-quasar-progress-text">
              {{ progressText }}
            </div>
          </slot>
        </div>
        
        <!-- Buttons -->
        <div class="mint-coach-mark-quasar-footer">
          <slot name="skip-button" :step="currentStep" :index="currentStepIndex">
            <button
              v-if="shouldShowSkipButton"
              @click="handleSkip"
              class="mint-coach-mark-quasar-btn mint-coach-mark-quasar-btn--skip"
              :disabled="disableButtons.includes('skip')"
            >
              {{ skipBtnText }}
            </button>
          </slot>

          <slot name="prev-button" :step="currentStep" :index="currentStepIndex">
            <button
              v-if="showButtons.includes('previous')"
              @click="handlePrevious"
              class="mint-coach-mark-quasar-btn mint-coach-mark-quasar-btn--prev"
              :disabled="disableButtons.includes('previous') || (currentStepIndex || 0) === 0"
            >
              {{ currentStep?.popover?.prevBtnText || 'Previous' }}
            </button>
          </slot>

          <slot name="next-button" :step="currentStep" :index="currentStepIndex">
            <button
              v-if="showButtons.includes('next')"
              @click="handleNext"
              class="mint-coach-mark-quasar-btn mint-coach-mark-quasar-btn--next"
              :disabled="disableButtons.includes('next')"
            >
              {{ currentStep?.popover?.nextBtnText || (isLastStep ? 'Done' : 'Next') }}
            </button>
          </slot>

          <slot name="close-icon">
            <button
              v-if="showButtons.includes('close')"
              @click="handleClose"
              class="mint-coach-mark-quasar-btn mint-coach-mark-quasar-btn--close"
              :disabled="disableButtons.includes('close')"
              aria-label="Close"
            >
              ×
            </button>
          </slot>
        </div>
      </div>
    </QTooltip>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  type Ref,
  type ComputedRef
} from 'vue'
import { QTooltip } from 'quasar'
import { useCoachMark } from '../composables/useCoachMark'
import { useCoachMarkState } from '../composables/useCoachMarkState'
import { usePopoverCommunication } from '../composables/usePopoverCommunication'
import { useAsyncTour } from '../composables/useAsyncTour'
import { useScrollBlocking } from '../composables/useScrollBlocking'
import { useTooltipManagement } from '../composables/useTooltipManagement'
import { useQuasarWatchers } from '../composables/useQuasarWatchers'
import { getEffectivePadding } from '../utils'
import type {
  CoachMarkConfig,
  CoachMarkStep,
  MintCoachMarkProps,
  MintCoachMarkEmits,
  CoachMarkInstance,
  NavigationOptions,
  StepLifecycleEventContext,
  StepInteractionEventContext
} from '../types'
import type { QTooltipProps } from 'quasar'

// Define props with same interface as MintCoachMark
const props = withDefaults(defineProps<MintCoachMarkProps>(), {
  modelValue: false,
  steps: () => [],
  config: () => ({}),
  autoStart: false
})

// Define emits with same interface as MintCoachMark
const emit = defineEmits<MintCoachMarkEmits>()

// Initialize coach mark state
const {
  setState,
  getState
} = useCoachMarkState();

// Initialize coach mark functionality
const {
  isActive,
  currentStepIndex,
  getActiveStep,
  start,
  destroy,
  refresh,
  setSteps,
  setConfig,
  getConfig,
  skipTour
} = useCoachMark(props.config);

// Set initial steps (without enhancement to avoid DOM duplication)
setSteps(props.steps)

// Enhanced configuration with global lifecycle hooks that emit Vue events
const enhancedConfig = computed(() => ({
  ...props.config,
  onHighlightStarted: (element: Element | undefined, step: CoachMarkStep, context: any) => {
    // Call original global config hook if defined
    if (props.config.onHighlightStarted) {
      props.config.onHighlightStarted(element, step, context)
    }

    // Call step-level hook if defined
    if (step.onHighlightStarted) {
      step.onHighlightStarted(element, step, context)
    }

    // Emit Vue event with comprehensive context
    const stepIndex = findStepIndex(step)
    if (stepIndex !== -1) {
      const eventContext = createStepLifecycleContext(step, stepIndex)
      emit('step-highlight-started', eventContext)
    }

    // Emit legacy event for backward compatibility
    emit('highlight-started', element, step)
  },
  onHighlighted: (element: Element | undefined, step: CoachMarkStep, context: any) => {
    // Call original global config hook if defined
    if (props.config.onHighlighted) {
      props.config.onHighlighted(element, step, context)
    }

    // Call step-level hook if defined
    if (step.onHighlighted) {
      step.onHighlighted(element, step, context)
    }

    // Emit Vue event with comprehensive context
    const stepIndex = findStepIndex(step)
    if (stepIndex !== -1) {
      const eventContext = createStepLifecycleContext(step, stepIndex)
      emit('step-highlighted', eventContext)
    }

    // Emit legacy event for backward compatibility
    emit('highlighted', element, step)
  },
  onDeselected: (element: Element | undefined, step: CoachMarkStep, context: any) => {
    // Call original global config hook if defined
    if (props.config.onDeselected) {
      props.config.onDeselected(element, step, context)
    }

    // Call step-level hook if defined
    if (step.onDeselected) {
      step.onDeselected(element, step, context)
    }

    // Emit Vue event with comprehensive context
    const stepIndex = findStepIndex(step)
    if (stepIndex !== -1) {
      const eventContext = createStepLifecycleContext(step, stepIndex)
      emit('step-deselected', eventContext)
    }

    // Emit legacy event for backward compatibility
    emit('deselected', element, step)
  }
}))

// Apply enhanced configuration once
setConfig(enhancedConfig.value)

// Watch for config changes and update enhanced config
watch(() => props.config, () => {
  setConfig(enhancedConfig.value)
}, { deep: true })

// Watch for steps prop changes (only when parent component changes the steps array)
watch(() => props.steps, (newSteps) => {
  setSteps(newSteps)
})

// Computed config
const mergedConfig = computed(() => getConfig());

// Initialize popover communication
const {
  popoverState,
  showPopover: showPopoverCommunication,
  hidePopover: hidePopoverCommunication
} = usePopoverCommunication(`quasar-coach-mark-${Date.now()}`);

// Initialize async tour functionality
const {
  isAsyncOperationInProgress,
  handleAsyncNavigation,
  handleStepDeselection
} = useAsyncTour()

// Handle async deselected events by wrapping the handleStepDeselection function
const wrappedHandleStepDeselection = async (
  element: Element | undefined,
  step: CoachMarkStep,
  coachMark: CoachMarkInstance
): Promise<void> => {
  // Call original async deselection handling
  await handleStepDeselection(element, step, coachMark)

  // Emit Vue event for async deselection if the step has onAsyncDeselected
  if (step.onAsyncDeselected) {
    const stepIndex = findStepIndex(step)
    if (stepIndex !== -1) {
      const eventContext = createStepLifecycleContext(step, stepIndex)
      emit('step-async-deselected', eventContext)
    }
  }
}

// Wrapper for async navigation to emit interaction events
const wrappedHandleAsyncNavigation = async (
  direction: 'next' | 'previous' | 'close' | 'skip',
  element: Element,
  step: CoachMarkStep,
  coachMark: CoachMarkInstance,
  callback: () => void
): Promise<void> => {
  // Emit interaction events before async operation
  const stepIndex = findStepIndex(step)
  if (stepIndex !== -1) {
    const eventContext = createStepInteractionContext(step, stepIndex)

    if (direction === 'next' && step.popover?.onAsyncNextClick) {
      emit('step-async-next-clicked', eventContext)
    } else if (direction === 'previous' && step.popover?.onAsyncPreviousClick) {
      emit('step-async-previous-clicked', eventContext)
    }
  }

  // Call original async navigation handling
  await handleAsyncNavigation(direction, element, step, coachMark, callback)
}

// Initialize scroll blocking functionality
const { blockScrolling, unblockScrolling } = useScrollBlocking();

// Flag to prevent conflicts during step transitions
const isTransitioning: Ref<boolean> = ref(false)

// Computed properties
const currentStep: ComputedRef<CoachMarkStep | undefined> = computed(() => getActiveStep())
const totalSteps: ComputedRef<number> = computed(() => props.steps?.length || 0)
const isLastStep: ComputedRef<boolean> = computed(() =>
  currentStepIndex.value === totalSteps.value - 1
)

// QTooltip positioning configuration with step-level support
// Using Quasar's official types for better type safety and consistency
const DEFAULT_ANCHOR: QTooltipProps['anchor'] = 'bottom middle'
const DEFAULT_SELF: QTooltipProps['self'] = 'top middle'
const DEFAULT_OFFSET: QTooltipProps['offset'] = [0, 10]
const DEFAULT_CLASS = ''

const quasarAnchor: ComputedRef<QTooltipProps['anchor']> = computed(() => {
  return currentStep.value?.popover?.tooltip?.anchor || DEFAULT_ANCHOR
})

const quasarSelf: ComputedRef<QTooltipProps['self']> = computed(() => {
  return currentStep.value?.popover?.tooltip?.self || DEFAULT_SELF
})

const quasarClass: ComputedRef<string> = computed(() => {
  const stepClass = currentStep.value?.popover?.tooltip?.class || DEFAULT_CLASS
  const popoverClass = currentStep.value?.popover?.popoverClass || ''
  return [stepClass, popoverClass].filter(Boolean).join(' ')
})

// Quasar offset calculation with step-level configuration support
const quasarOffset: ComputedRef<QTooltipProps['offset']> = computed(() => {
  // Get effective padding value (used for both step-specific and calculated offsets)
  const config = getConfig()
  const globalPadding = config.padding || 10
  const effectivePadding = getEffectivePadding(
    currentStep.value?.popover?.padding,
    globalPadding,
    10
  )

  // Check for step-specific offset first
  const stepOffset = currentStep.value?.popover?.tooltip?.offset
  if (stepOffset) {
    // Add effective padding to step-specific offset for consistent spacing
    return [stepOffset[0], stepOffset[1] + effectivePadding]
  }

  // Fall back to calculated offset based on padding
  const baseOffset = DEFAULT_OFFSET[1] // Use default offset as base

  // Add padding to the base offset for proper spacing
  const totalOffset = baseOffset + effectivePadding

  return [0, totalOffset]
})

// Button configuration
const showButtons: ComputedRef<string[]> = computed(() =>
  currentStep.value?.popover?.showButtons || ['next', 'previous', 'close', 'skip']
)

const disableButtons: ComputedRef<string[]> = computed(() =>
  currentStep.value?.popover?.disableButtons || []
)

// Skip button configuration
const shouldShowSkipButton: ComputedRef<boolean> = computed(() => {
  // Only show skip button on first step if enabled
  const allowSkip = mergedConfig.value.allowSkip !== false // Default to true
  const isFirstStep = (currentStepIndex.value || 0) === 0
  const showSkip = showButtons.value.includes('skip')

  return allowSkip && isFirstStep && showSkip
})

const skipBtnText: ComputedRef<string> = computed(() =>
  currentStep.value?.popover?.skipBtnText ||
  mergedConfig.value.skipBtnText ||
  'Skip'
)

// Simplified progress calculation - just "current / total" format
const progressText: ComputedRef<string> = computed(() => {
  return `${(currentStepIndex.value || 0) + 1} / ${totalSteps.value}`
})

// Enhanced visibility logic to prevent content flashing during transitions
const shouldShowTooltip: ComputedRef<boolean> = computed(() => {
  // Don't show tooltip during step transitions to prevent content flashing
  if (isTransitioning.value) {
    return false
  }

  // Basic visibility requirements
  const hasBasicRequirements = popoverState.value.visible &&
                               popoverState.value.targetElement

  if (!hasBasicRequirements) {
    return false
  }

  // Ensure we have valid step data to prevent showing stale content
  const hasValidStepData = popoverState.value.step &&
                          currentStep.value &&
                          popoverState.value.step.element === currentStep.value.element

  return !!hasValidStepData
})

// Initialize tooltip management with internal display function
const tooltipManagement = useTooltipManagement(async () => {
  await showTooltipIfReadyInternal()
})

const {
  tooltipVisible,
  tooltipRefreshKey,
  showTooltipIfReady,
  setStepTransitioning
} = tooltipManagement

/**
 * Ensure QTooltip is completely hidden before proceeding
 */
const ensureTooltipHidden = async (): Promise<void> => {
  if (tooltipVisible.value) {
    tooltipVisible.value = false

    // Wait for Vue reactivity to process and QTooltip's hide delay
    await nextTick()
  }
}

/**
 * Ensure all step processing is complete before showing tooltip
 */
const ensureStepProcessingComplete = async (): Promise<void> => {
  // Wait for Vue reactivity to process the step change
  await nextTick()

  // Extra safety for tour start - wait if currentStep is still not available
  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries && !currentStep.value && popoverState.value.step) {
    await nextTick()
    retryCount++
  }

  // Additional wait for async operations
  if (isAsyncOperationInProgress.value) {
    await nextTick()
  }
}

/**
 * Internal implementation - show tooltip only if all conditions are met
 */
const showTooltipIfReadyInternal = async (): Promise<void> => {
  // Verify all conditions are met before showing
  const hasValidStep = !!(popoverState.value.step || currentStep.value)
  const isReady = popoverState.value.visible &&
                  popoverState.value.targetElement &&
                  hasValidStep &&
                  !isTransitioning.value    

  if (isReady) {
    // Use QTooltip's native delay handling - just set visibility
    if (!tooltipVisible.value) {
      await nextTick()
      tooltipVisible.value = true
    }
  } else {
    // Simple retry for missing step data
    if (popoverState.value.visible && popoverState.value.targetElement && !isTransitioning.value && !hasValidStep) {
      await nextTick()

      const retryHasValidStep = !!(popoverState.value.step || currentStep.value)
      if (retryHasValidStep && !tooltipVisible.value) {
        tooltipVisible.value = true
      }
    }
  }
}

// Initialize watcher management after function declarations
const watchers = useQuasarWatchers({
  getState,
  setState: setState as (key: string, value: any) => void,
  showPopoverCommunication,
  ensureTooltipHidden,
  ensureStepProcessingComplete,
  popoverState,
  isTransitioning,
  tooltipManagement,
  scrollBlocking: {
    blockScrolling,
    unblockScrolling,
    isBlocked: ref(false),
    getScrollPosition: () => ({ x: 0, y: 0 }),
    forceUnblock: () => unblockScrolling()
  }
})

// Initialize all watchers
watchers.initWatchers()

// Watch for model value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && !isActive.value) {
    startTour()
  } else if (!newValue && isActive.value) {
    stopTour()
  }
})

// Watch for step changes to ensure tooltip synchronization
watch(() => currentStep.value, async (newStep, oldStep) => {
  // Only handle step changes if we're not already transitioning
  if (newStep && oldStep && newStep !== oldStep && tooltipVisible.value && !isTransitioning.value) {
    try {
      // 1. Immediately hide tooltip to prevent content flashing
      tooltipVisible.value = false

      // 2. Ensure tooltip is completely hidden
      await ensureTooltipHidden()

      // 3. Wait for content to be updated
      await ensureStepProcessingComplete()

      // 4. Show tooltip if conditions are met
      await showTooltipIfReady('step-change-watcher')

    } catch (error) {
      console.error('Error during step change synchronization:', error)
    }
  }
})

/**
 * Create a coach mark interface for hook callbacks
 */
const createCoachMarkInterface = (): CoachMarkInstance => {
  return {
    isActive: () => isActive.value,
    refresh: () => refresh(),
    start: (stepIndex?: number) => start(stepIndex),
    setConfig: (config) => setConfig(config),
    setSteps: (steps) => setSteps(steps),
    getConfig: () => getConfig(),
    getState: (key?: string) => getState(key as any),
    getActiveIndex: () => currentStepIndex.value,
    isFirstStep: () => currentStepIndex.value === 0,
    isLastStep: () => currentStepIndex.value === totalSteps.value - 1,
    getActiveStep: () => getActiveStep(),
    getActiveElement: () => popoverState.value.targetElement || undefined,
    getPreviousElement: () => undefined,
    getPreviousStep: () => undefined,
    moveNext: (options?: NavigationOptions) => moveNext(options),
    movePrevious: (options?: NavigationOptions) => movePrevious(options),
    moveTo: (index: number, options?: NavigationOptions) => moveTo(index, options),
    skipTour: () => handleSkip(),
    hasNextStep: () => currentStepIndex.value !== undefined && currentStepIndex.value < totalSteps.value - 1,
    hasPreviousStep: () => currentStepIndex.value !== undefined && currentStepIndex.value > 0,
    highlight: (step) => start(props.steps.indexOf(step)),
    destroy: () => destroy()
  }
}



/**
 * Find step index with robust fallback mechanisms
 */
const findStepIndex = (step: CoachMarkStep): number => {
  // First try direct object reference comparison
  let stepIndex = props.steps.findIndex(s => s === step)

  // If direct comparison fails, try element selector comparison
  if (stepIndex === -1 && step.element) {
    stepIndex = props.steps.findIndex(s => s.element === step.element)
  }

  // If still not found, try using current step index as fallback
  if (stepIndex === -1 && currentStepIndex.value !== undefined) {
    const currentStepData = props.steps[currentStepIndex.value]
    if (currentStepData && currentStepData.element === step.element) {
      stepIndex = currentStepIndex.value
    }
  }
  return stepIndex
}

/**
 * Create step lifecycle event context
 */
const createStepLifecycleContext = (step: CoachMarkStep, stepIndex?: number): StepLifecycleEventContext => {
  const resolvedStepIndex = stepIndex !== undefined ? stepIndex : findStepIndex(step)
  const steps = props.steps
  const nextStep = steps[resolvedStepIndex + 1]
  const previousStep = steps[resolvedStepIndex - 1]

  return {
    step,
    nextStep,
    previousStep,
    stepIndex: resolvedStepIndex,
    isHighlighted: currentStepIndex.value === resolvedStepIndex,
    isLastStep: resolvedStepIndex === steps.length - 1,
    isFirstStep: resolvedStepIndex === 0,
    coachMark: createCoachMarkInterface()
  }
}

/**
 * Create step interaction event context
 */
const createStepInteractionContext = (step: CoachMarkStep, stepIndex?: number): StepInteractionEventContext => {
  const resolvedStepIndex = stepIndex !== undefined ? stepIndex : findStepIndex(step)
  const steps = props.steps
  const nextStep = steps[resolvedStepIndex + 1]
  const previousStep = steps[resolvedStepIndex - 1]

  return {
    step,
    nextStep,
    previousStep,
    coachMark: createCoachMarkInterface(),
    stepIndex: resolvedStepIndex,
    hasNextStep: resolvedStepIndex < steps.length - 1,
    hasPreviousStep: resolvedStepIndex > 0,
    isHighlighted: currentStepIndex.value === resolvedStepIndex
  }
}

/**
 * Start the tour
 */
const startTour = (stepIndex?: number): void => {
  if (props.steps.length === 0) {
    console.warn('No steps provided for the tour')
    return
  }

  // Block scrolling when starting the tour
  blockScrolling()

  start(stepIndex)
  emit('update:modelValue', true)
  emit('tour-start')
}

/**
 * Stop the tour
 */
const stopTour = (): void => {
  // Emit step-closed event if there's a current step
  const currentStepData = currentStep.value
  const currentIndex = currentStepIndex.value
  if (currentStepData && currentIndex !== undefined) {
    const eventContext = createStepInteractionContext(currentStepData, currentIndex)
    emit('step-closed', eventContext)
  }

  tooltipVisible.value = false
  hidePopoverCommunication()
  destroy()

  // Unblock scrolling when tour ends
  unblockScrolling()

  emit('update:modelValue', false)
  emit('tour-complete')
}

/**
 * Move to next step
 */
const moveNext = async (options?: NavigationOptions): Promise<void> => {
  const currentIndex = currentStepIndex.value
  if (currentIndex !== undefined && currentIndex < totalSteps.value - 1) {
    try {
      // 1. Block scrolling immediately before any transition work
      blockScrolling()

      // 2. Set transitioning flags to prevent conflicts
      isTransitioning.value = true
      setStepTransitioning(true)

      // 3. Immediately hide tooltip and clear popover state to prevent content flashing
      tooltipVisible.value = false
      hidePopoverCommunication()

      // 3. Handle step deselection for current step
      const currentElement = popoverState.value.targetElement
      const currentStepData = currentStep.value
      if (currentElement && currentStepData) {
        await wrappedHandleStepDeselection(currentElement, currentStepData, createCoachMarkInterface())
      }

      // 4. Ensure QTooltip is completely hidden before step transition
      await ensureTooltipHidden()

      // 5. Perform step change
      const nextIndex = currentIndex + 1

      start(nextIndex, options)
      emit('step-change', props.steps[nextIndex], nextIndex)

      // Emit step-changed event with interaction context
      const eventContext = createStepInteractionContext(props.steps[nextIndex], nextIndex)
      emit('step-changed', eventContext)

      // 6. Wait for all step processing to complete
      await ensureStepProcessingComplete()

      // 7. Clear transitioning flags
      isTransitioning.value = false
      setStepTransitioning(false)

      // 8. Show tooltip only if all conditions are met
      await showTooltipIfReady('step-transition-moveNext')

      // 9. Unblock scrolling after everything is complete and positioned
      unblockScrolling()

    } catch (error) {
      console.error('Error during step transition:', error)
      isTransitioning.value = false
      setStepTransitioning(false)
      unblockScrolling() // Ensure scrolling is unblocked on error
    }
  } else {
    // Tour completed
    stopTour()
  }
}

/**
 * Move to previous step
 */
const movePrevious = async (options?: NavigationOptions): Promise<void> => {
  const currentIndex = currentStepIndex.value
  if (currentIndex !== undefined && currentIndex > 0) {
    try {
      // 1. Block scrolling immediately before any transition work
      blockScrolling()

      // 2. Set transitioning flags to prevent conflicts
      isTransitioning.value = true
      setStepTransitioning(true)

      // 3. Immediately hide tooltip and clear popover state to prevent content flashing
      tooltipVisible.value = false
      hidePopoverCommunication()

      // 3. Handle step deselection for current step
      const currentElement = popoverState.value.targetElement
      const currentStepData = currentStep.value
      if (currentElement && currentStepData) {
        await wrappedHandleStepDeselection(currentElement, currentStepData, createCoachMarkInterface())
      }

      // 4. Ensure QTooltip is completely hidden before step transition
      await ensureTooltipHidden()

      // 5. Perform step change
      const prevIndex = currentIndex - 1

      start(prevIndex, options)
      emit('step-change', props.steps[prevIndex], prevIndex)

      // Emit step-changed event with interaction context
      const eventContext = createStepInteractionContext(props.steps[prevIndex], prevIndex)
      emit('step-changed', eventContext)

      // 6. Wait for all step processing to complete
      await ensureStepProcessingComplete()

      // 7. Clear transitioning flags
      isTransitioning.value = false
      setStepTransitioning(false)

      // 8. Show tooltip only if all conditions are met
      await showTooltipIfReady('step-transition-movePrevious')

      // 9. Unblock scrolling after everything is complete and positioned
      unblockScrolling()

    } catch (error) {
      console.error('Error during step transition:', error)
      isTransitioning.value = false
      setStepTransitioning(false)
      unblockScrolling() // Ensure scrolling is unblocked on error
    }
  }
}

/**
 * Move to specific step
 */
const moveTo = async (stepIndex: number, options?: NavigationOptions): Promise<void> => {
  if (stepIndex >= 0 && stepIndex < totalSteps.value) {
    try {
      // 1. Block scrolling immediately before any transition work
      blockScrolling()

      // 2. Set transitioning flags to prevent conflicts
      isTransitioning.value = true
      setStepTransitioning(true)

      // 3. Immediately hide tooltip and clear popover state to prevent content flashing
      tooltipVisible.value = false
      hidePopoverCommunication()

      // 3. Handle step deselection for current step
      const currentElement = popoverState.value.targetElement
      const currentStepData = currentStep.value
      if (currentElement && currentStepData) {
        await wrappedHandleStepDeselection(currentElement, currentStepData, createCoachMarkInterface())
      }

      // 4. Ensure QTooltip is completely hidden before step transition
      await ensureTooltipHidden()

      // 5. Perform step change
      start(stepIndex, options)
      emit('step-change', props.steps[stepIndex], stepIndex)

      // Emit step-changed event with interaction context
      const eventContext = createStepInteractionContext(props.steps[stepIndex], stepIndex)
      emit('step-changed', eventContext)

      // 6. Wait for all step processing to complete
      await ensureStepProcessingComplete()

      // 7. Clear transitioning flags
      isTransitioning.value = false
      setStepTransitioning(false)

      // 8. Show tooltip only if all conditions are met
      await showTooltipIfReady('step-transition-moveTo')

      // 9. Unblock scrolling after everything is complete and positioned
      unblockScrolling()

    } catch (error) {
      console.error('Error during step transition:', error)
      isTransitioning.value = false
      setStepTransitioning(false)
      unblockScrolling() // Ensure scrolling is unblocked on error
    }
  }
}

// Event handlers with async support
const handleNext = async (): Promise<void> => {
  const element = popoverState.value.targetElement
  // Use popoverState.step as primary source since it's more reliable than currentStep computed
  const step = popoverState.value.step || currentStep.value

  // Emit step-next-clicked event
  if (step) {
    const stepIndex = findStepIndex(step)
    if (stepIndex !== -1) {
      const eventContext = createStepInteractionContext(step, stepIndex)
      emit('step-next-clicked', eventContext)
    }
  }

  if (element && step) {
    await wrappedHandleAsyncNavigation(
      'next',
      element,
      step,
      createCoachMarkInterface(),
      () => moveNext()
    )
  } else {
    moveNext()
  }
}

const handlePrevious = async (): Promise<void> => {
  const element = popoverState.value.targetElement
  // Use popoverState.step as primary source since it's more reliable than currentStep computed
  const step = popoverState.value.step || currentStep.value

  // Emit step-previous-clicked event
  if (step) {
    const stepIndex = findStepIndex(step)
    if (stepIndex !== -1) {
      const eventContext = createStepInteractionContext(step, stepIndex)
      emit('step-previous-clicked', eventContext)
    }
  }

  if (element && step) {
    await wrappedHandleAsyncNavigation(
      'previous',
      element,
      step,
      createCoachMarkInterface(),
      () => movePrevious()
    )
  } else {
    movePrevious()
  }
}

const handleClose = async (): Promise<void> => {
  const element = popoverState.value.targetElement
  // Use popoverState.step as primary source since it's more reliable than currentStep computed
  const step = popoverState.value.step || currentStep.value

  if (element && step) {
    await handleAsyncNavigation(
      'close',
      element,
      step,
      createCoachMarkInterface(),
      () => stopTour()
    )
  } else {
    stopTour()
  }
}

const handleSkip = async (): Promise<void> => {
  const element = popoverState.value.targetElement
  // Use popoverState.step as primary source since it's more reliable than currentStep computed
  const step = popoverState.value.step || currentStep.value

  if (element && step) {
    // Emit skip event before handling async navigation
    emit('tour-skipped', step, currentStepIndex.value || 0)

    await handleAsyncNavigation(
      'skip',
      element,
      step,
      createCoachMarkInterface(),
      () => {
        skipTour()
        stopTour()
      }
    )
  } else {
    // Emit skip event even if no element/step
    if (step) {
      emit('tour-skipped', step, currentStepIndex.value || 0)
    }
    skipTour()
    stopTour()
  }
}

const handleTooltipShow = (): void => {
  // Tooltip is now visible
}

const handleTooltipHide = (): void => {
  // Tooltip is now hidden
  if (isActive.value) {
    hidePopoverCommunication()
  }
}

// Define the exposed API interface
interface QuasarCoachMarkExposed {
  startTour: (stepIndex?: number) => void
  stopTour: () => void
  moveNext: (options?: NavigationOptions) => void
  movePrevious: (options?: NavigationOptions) => void
  moveTo: (stepIndex: number, options?: NavigationOptions) => void
  skipTour: () => void
  setSteps: (steps: CoachMarkStep[]) => void
  isActive: () => boolean
  getCurrentStep: () => CoachMarkStep | undefined
  getCurrentStepIndex: () => number | undefined
}

// Expose public API
defineExpose<QuasarCoachMarkExposed>({
  startTour,
  stopTour,
  moveNext,
  movePrevious,
  moveTo,
  skipTour: handleSkip,
  setSteps,
  isActive: (): boolean => isActive.value,
  getCurrentStep: (): CoachMarkStep | undefined => currentStep.value,
  getCurrentStepIndex: (): number | undefined => currentStepIndex.value
})

// Auto-start functionality
onMounted(() => {
  if (props.autoStart || props.modelValue) {
    nextTick(() => {
      startTour()
    })
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (isActive.value) {
    destroy()
  }

  // Ensure scroll blocking is removed on unmount
  unblockScrolling()
})
</script>
