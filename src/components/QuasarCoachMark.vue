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
/* eslint-disable no-use-before-define */
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  type Ref,
  type ComputedRef
} from 'vue';
import { QTooltip } from 'quasar';
import { useCoachMark } from '../composables/useCoachMark';
import { useCoachMarkState } from '../composables/useCoachMarkState';
import { usePopoverCommunication } from '../composables/usePopoverCommunication';
import { useAsyncTour } from '../composables/useAsyncTour';
import { useScrollBlocking } from '../composables/useScrollBlocking';
import { useTooltipManagement } from '../composables/useTooltipManagement';
import { useQuasarWatchers } from '../composables/useQuasarWatchers';
import {
  getQuasarAnchor,
  getQuasarSelf,
  getQuasarOffset,
  getQuasarClass
} from '../composables/useQuasarTooltipConfig';
import { useCoachMarkUIState } from '../composables/useCoachMarkUIState';
import { useStepNavigation } from '../composables/useStepNavigation';
import { useCoachMarkEventHandlers } from '../composables/useCoachMarkEventHandlers';
import type {
  CoachMarkConfig,
  CoachMarkStep,
  MintCoachMarkProps,
  MintCoachMarkEmits,
  CoachMarkInstance,
  NavigationOptions
} from '../types';
import { getEnhancedConfig, createEventEmitters } from '../composables/useVueEventEmission';
import { createNavigationWrappers } from '../composables/useCoachMarkNavigation';

// Define props with same interface as MintCoachMark
const props = withDefaults(defineProps<MintCoachMarkProps>(), {
  modelValue: false,
  steps: () => [],
  config: () => ({}),
  autoStart: false
});

// Define emits with same interface as MintCoachMark
const emit = defineEmits<MintCoachMarkEmits>();

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
setSteps(props.steps);

// Computed config
const mergedConfig: ComputedRef<CoachMarkConfig> = computed(() => getConfig());

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
} = useAsyncTour();

// Initialize scroll blocking functionality
const { blockScrolling, unblockScrolling } = useScrollBlocking();

// Flag to prevent conflicts during step transitions
const isTransitioning: Ref<boolean> = ref(false);

// Computed properties
const currentStep: ComputedRef<CoachMarkStep | undefined> = computed(() => getActiveStep());
const totalSteps: ComputedRef<number> = computed(() => props.steps?.length || 0);

// QTooltip configuration computed properties
const quasarAnchor = computed(() => getQuasarAnchor({ currentStep: currentStep.value }));
const quasarSelf = computed(() => getQuasarSelf({ currentStep: currentStep.value }));
const quasarOffset = computed(() => getQuasarOffset({ currentStep: currentStep.value, config: getConfig() }));
const quasarClass = computed(() => getQuasarClass({ currentStep: currentStep.value }));

// Initialize UI state management functions
const uiStateFunctions = useCoachMarkUIState();

// UI state management computed properties
const isLastStep = computed(() => uiStateFunctions.checkIsLastStep({
  currentStepIndex: currentStepIndex.value,
  totalSteps: totalSteps.value
}, getConfig()));

const showButtons = computed(() => uiStateFunctions.getShowButtons({
  currentStep: currentStep.value
}, getConfig()));

const shouldShowSkipButton = computed(() => uiStateFunctions.checkShouldShowSkipButton({
  config: mergedConfig.value,
  showButtons: showButtons.value
}, getConfig()));

const progressText = computed(() => uiStateFunctions.getProgressText({
  currentStepIndex: currentStepIndex.value,
  totalSteps: totalSteps.value
}, getConfig()));

const shouldShowTooltip = computed(() => uiStateFunctions.checkShouldShowTooltip({
  currentStep: currentStep.value,
  popoverState: popoverState.value,
  isTransitioning: isTransitioning.value
}, getConfig()));

// Additional button configuration not moved to composable
const disableButtons: ComputedRef<string[]> = computed(() =>
  currentStep.value?.popover?.disableButtons || []
);

const skipBtnText: ComputedRef<string> = computed(() =>
  currentStep.value?.popover?.skipBtnText ||
  mergedConfig.value.skipBtnText ||
  'Skip'
);

// Initialize tooltip management with internal display function
const tooltipManagement = useTooltipManagement(async () => {
  await showTooltipIfReadyInternal();
});

const {
  tooltipVisible,
  tooltipRefreshKey,
  showTooltipIfReady,
  setStepTransitioning
} = tooltipManagement;

/**
 * Ensure QTooltip is completely hidden before proceeding
 */
const ensureTooltipHidden = async (): Promise<void> => {
  if (tooltipVisible.value) {
    tooltipVisible.value = false;

    // Wait for Vue reactivity to process and QTooltip's hide delay
    await nextTick();
  }
};

/**
 * Ensure all step processing is complete before showing tooltip
 */
const ensureStepProcessingComplete = async (): Promise<void> => {
  // Wait for Vue reactivity to process the step change
  await nextTick();

  // Extra safety for tour start - wait if currentStep is still not available
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries && !currentStep.value && popoverState.value.step) {
    await nextTick();
    retryCount++;
  }

  // Additional wait for async operations
  if (isAsyncOperationInProgress.value) {
    await nextTick();
  }
};

/**
 * Internal implementation - show tooltip only if all conditions are met
 */
const showTooltipIfReadyInternal = async (): Promise<void> => {
  // Verify all conditions are met before showing
  const hasValidStep = !!(popoverState.value.step || currentStep.value);
  const isReady = popoverState.value.visible &&
                  popoverState.value.targetElement &&
                  hasValidStep &&
                  !isTransitioning.value;    

  if (isReady) {
    // Use QTooltip's native delay handling - just set visibility
    if (!tooltipVisible.value) {
      await nextTick();
      tooltipVisible.value = true;
    }
  } else {
    // Simple retry for missing step data
    if (popoverState.value.visible && popoverState.value.targetElement && !isTransitioning.value && !hasValidStep) {
      await nextTick();

      const retryHasValidStep = !!(popoverState.value.step || currentStep.value);
      if (retryHasValidStep && !tooltipVisible.value) {
        tooltipVisible.value = true;
      }
    }
  }
};

// Initialize watcher management after function declarations
const watchers = useQuasarWatchers({
  getState,
  setState,
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
});

// Initialize all watchers
watchers.initWatchers();

// Watch for model value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && !isActive.value) {
    startTour();
  } else if (!newValue && isActive.value) {
    stopTour();
  }
});

// Watch for step changes to ensure tooltip synchronization
watch(() => currentStep.value, async (newStep, oldStep) => {
  // Only handle step changes if we're not already transitioning
  if (newStep && oldStep && newStep !== oldStep && tooltipVisible.value && !isTransitioning.value) {
    try {
      // 1. Immediately hide tooltip to prevent content flashing
      tooltipVisible.value = false;

      // 2. Ensure tooltip is completely hidden
      await ensureTooltipHidden();

      // 3. Wait for content to be updated
      await ensureStepProcessingComplete();

      // 4. Show tooltip if conditions are met
      await showTooltipIfReady('step-change-watcher');

    } catch (error) {
      console.error('Error during step change synchronization:', error);
    }
  }
});

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
    getState: (key?: string) => getState(key as never),
    getActiveIndex: () => currentStepIndex.value,
    isFirstStep: () => currentStepIndex.value === 0,
    isLastStep: () => currentStepIndex.value === totalSteps.value - 1,
    getActiveStep: () => getActiveStep(),
    getActiveElement: () => popoverState.value.targetElement || undefined,
    getPreviousElement: () => undefined,
    getPreviousStep: () => undefined,
    moveNext: (options?: NavigationOptions) => moveNext({
      currentStepIndex: currentStepIndex.value,
      totalSteps: totalSteps.value,
      options
    }, getConfig()),
    movePrevious: (options?: NavigationOptions) => movePrevious({
      currentStepIndex: currentStepIndex.value,
      options
    }, getConfig()),
    moveTo: (index: number, options?: NavigationOptions) => moveTo({
      stepIndex: index,
      currentStepIndex: currentStepIndex.value,
      totalSteps: totalSteps.value,
      options
    }, getConfig()),
    skipTour: () => handleSkip(),
    hasNextStep: () => currentStepIndex.value !== undefined && currentStepIndex.value < totalSteps.value - 1,
    hasPreviousStep: () => currentStepIndex.value !== undefined && currentStepIndex.value > 0,
    highlight: (step) => start(props.steps.indexOf(step)),
    destroy: () => destroy()
  };
};

// Component handles reactivity with computed properties
const enhancedConfig = computed(() => getEnhancedConfig({
  config: props.config,
  steps: props.steps,
  currentStepIndex: currentStepIndex.value,
  coachMark: createCoachMarkInterface,
  emit
}));

// Create event emitters (pure functions)
const eventEmitters = createEventEmitters({
  steps: props.steps,
  currentStepIndex: currentStepIndex.value,
  coachMark: createCoachMarkInterface,
  emit
});

const { emitStepInteractionEvent, emitAsyncInteractionEvent, emitAsyncDeselectedEvent } = eventEmitters;



// Apply enhanced configuration once
setConfig(enhancedConfig.value);

// Watch for config changes and update enhanced config
watch(() => props.config, () => {
  setConfig(enhancedConfig.value);
}, { deep: true });

// Watch for steps prop changes (only when parent component changes the steps array)
watch(() => props.steps, (newSteps) => {
  setSteps(newSteps);
});

// Initialize navigation wrapper functions (pure functions)
const navigationWrappers = createNavigationWrappers({
  handleStepDeselection,
  handleAsyncNavigation,
  emitAsyncDeselectedEvent,
  emitAsyncInteractionEvent
});

const { wrappedHandleStepDeselection, wrappedHandleAsyncNavigation } = navigationWrappers;

/**
 * Start the tour
 */
const startTour = (stepIndex?: number): void => {
  if (props.steps.length === 0) {
    console.warn('No steps provided for the tour');
    return;
  }

  // Block scrolling when starting the tour
  blockScrolling();

  start(stepIndex);
  emit('update:modelValue', true);
  emit('tour-start');
};

/**
 * Stop the tour
 */
const stopTour = (): void => {
  // Emit step-closed event if there's a current step
  const currentStepData = currentStep.value;
  const currentIndex = currentStepIndex.value;
  if (currentStepData && currentIndex !== undefined) {
    emitStepInteractionEvent('step-closed', currentStepData, currentIndex);
  }

  tooltipVisible.value = false;
  hidePopoverCommunication();
  destroy();

  // Unblock scrolling when tour ends
  unblockScrolling();

  emit('update:modelValue', false);
  emit('tour-complete');
};



// Type guards for runtime validation (used by emitStepInteractionEventWrapper)
const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

const isCoachMarkStep = (value: unknown): value is CoachMarkStep => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check for required properties that define a CoachMarkStep
  // At minimum, it should have an element property (string, Element, or function)
  const hasElement = 'element' in obj && (
    typeof obj.element === 'string' ||
    obj.element instanceof Element ||
    typeof obj.element === 'function'
  );

  return hasElement;
};

// Create wrapper functions for type compatibility

const emitStepInteractionEventWrapper = (...args: unknown[]): void => {
  const [eventName, step, stepIndex] = args;

  // Type guard for valid step interaction event names
  const validEventNames = ['step-next-clicked', 'step-previous-clicked', 'step-changed', 'step-closed'] as const;
  type ValidEventName = typeof validEventNames[number];

  const isValidEventName = (name: unknown): name is ValidEventName => {
    return typeof name === 'string' && validEventNames.includes(name as ValidEventName);
  };

  const isNumberOrUndefined = (value: unknown): value is number | undefined => {
    return value === undefined || isNumber(value);
  };

  // Type-safe wrapper for step interaction events with proper validation
  if (isValidEventName(eventName) && isCoachMarkStep(step) && isNumberOrUndefined(stepIndex)) {
    emitStepInteractionEvent(eventName, step, stepIndex);
  }
};

// Initialize step navigation
const { moveNext, movePrevious, moveTo } = useStepNavigation({
  currentStep,
  currentStepIndex,
  isTransitioning,
  popoverState,
  steps: props.steps,
  start,
  emit,
  emitStepInteractionEvent,
  handleStepDeselection: wrappedHandleStepDeselection,
  blockScrolling,
  unblockScrolling,
  setStepTransitioning,
  hidePopoverCommunication,
  ensureTooltipHidden,
  ensureStepProcessingComplete,
  showTooltipIfReady,
  stopTour,
  createCoachMarkInterface
});

// Create wrapper functions for event handlers
const moveNextForEventHandlers = () => moveNext({
  currentStepIndex: currentStepIndex.value,
  totalSteps: totalSteps.value
}, getConfig());

const movePreviousForEventHandlers = () => movePrevious({
  currentStepIndex: currentStepIndex.value
}, getConfig());

// Initialize event handlers
const { handleNext, handlePrevious, handleClose, handleSkip, handleTooltipShow, handleTooltipHide } = useCoachMarkEventHandlers({
  currentStep,
  currentStepIndex,
  popoverState,
  isActive,
  emit,
  emitStepInteractionEvent: emitStepInteractionEventWrapper,
  handleAsyncNavigation: wrappedHandleAsyncNavigation,
  moveNext: moveNextForEventHandlers,
  movePrevious: movePreviousForEventHandlers,
  hidePopoverCommunication,
  stopTour,
  skipTour,
  createCoachMarkInterface
});

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

// Create wrapper functions for backward compatibility
const moveNextWrapper = (options?: NavigationOptions) => moveNext({
  currentStepIndex: currentStepIndex.value,
  totalSteps: totalSteps.value,
  options
}, getConfig());

const movePreviousWrapper = (options?: NavigationOptions) => movePrevious({
  currentStepIndex: currentStepIndex.value,
  options
}, getConfig());

const moveToWrapper = (index: number, options?: NavigationOptions) => moveTo({
  stepIndex: index,
  currentStepIndex: currentStepIndex.value,
  totalSteps: totalSteps.value,
  options
}, getConfig());

// Expose public API
defineExpose<QuasarCoachMarkExposed>({
  startTour,
  stopTour,
  moveNext: moveNextWrapper,
  movePrevious: movePreviousWrapper,
  moveTo: moveToWrapper,
  skipTour: handleSkip,
  setSteps,
  isActive: (): boolean => isActive.value,
  getCurrentStep: (): CoachMarkStep | undefined => currentStep.value,
  getCurrentStepIndex: (): number | undefined => currentStepIndex.value
});

// Auto-start functionality
onMounted(() => {
  if (props.autoStart || props.modelValue) {
    nextTick(() => {
      startTour();
    });
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (isActive.value) {
    destroy();
  }

  // Ensure scroll blocking is removed on unmount
  unblockScrolling();
});
</script>
