<template>
  <div class="quasar-coach-mark">
    <MintCoachMarkPopover
      v-if="shouldShowTooltip"
      v-model="tooltipVisible"
      :refresh-key="tooltipRefreshKey"
      :target="popoverState.targetElement || undefined"
      :anchor="quasarAnchor"
      :self="quasarSelf"
      :offset="quasarOffset"
      :class-name="quasarClass"
      :step="currentStep"
      :step-index="currentStepIndex"
      :total-steps="totalSteps"
      :is-last-step="isLastStep"
      :show-buttons="showButtons"
      :disable-buttons="disableButtons"
      :should-show-skip-button="shouldShowSkipButton"
      :skip-btn-text="skipBtnText"
      :progress-text="progressText"
      @show="handleTooltipShow"
      @hide="handleTooltipHide"
      @next="handleNext"
      @previous="handlePrevious"
      @skip="handleSkip"
      @close="handleClose"
    >
      <template #title="slotProps">
        <slot name="title" v-bind="slotProps" />
      </template>
      <template #content="slotProps">
        <slot name="content" v-bind="slotProps" />
      </template>
      <template #progress="slotProps">
        <slot name="progress" v-bind="slotProps" />
      </template>
      <template #skip-button="slotProps">
        <slot name="skip-button" v-bind="slotProps" />
      </template>
      <template #prev-button="slotProps">
        <slot name="prev-button" v-bind="slotProps" />
      </template>
      <template #next-button="slotProps">
        <slot name="next-button" v-bind="slotProps" />
      </template>
      <template #close-icon>
        <slot name="close-icon" />
      </template>
    </MintCoachMarkPopover>
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
import MintCoachMarkPopover from './MintCoachMarkPopover.vue';
import { useCoachMark } from '../composables/useCoachMark';
import { useCoachMarkState } from '../composables/useCoachMarkState';
import { usePopoverCommunication } from '../composables/usePopoverCommunication';
import { useAsyncTour } from '../composables/useAsyncTour';
import { useScrollBlocking } from '../composables/useScrollBlocking';
import useTooltipManagement from '../composables/useTooltipManagement';
import { useQuasarWatchers } from '../composables/useQuasarWatchers';
import {
  getQuasarAnchor,
  getQuasarSelf,
  getQuasarOffset,
  getQuasarClass
} from '../utils/quasarTooltip';
import { useCoachMarkUIState } from '../composables/useCoachMarkUIState';
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
  skipTour,
  moveNext,
  movePrevious,
  moveTo
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
  handleAsyncNavigation
} = useAsyncTour();

// Initialize scroll blocking functionality
const { blockScrolling, unblockScrolling } = useScrollBlocking();

// Flag to prevent conflicts during step transitions
const isTransitioning: Ref<boolean> = ref(false);

// Computed properties
const currentStep: ComputedRef<CoachMarkStep | undefined> = computed(() => getActiveStep());
const totalSteps: ComputedRef<number> = computed(() => props.steps?.length || 0);

// QTooltip configuration computed properties
const quasarAnchor = computed(() => getQuasarAnchor(currentStep.value));
const quasarSelf = computed(() => getQuasarSelf(currentStep.value));
const quasarOffset = computed(() => getQuasarOffset(currentStep.value, getConfig()));
const quasarClass = computed(() => getQuasarClass(currentStep.value));

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
const tooltipManagement = useTooltipManagement(() => ({
  popoverState,
  currentStep,
  isTransitioning
}));

const {
  tooltipVisible,
  tooltipRefreshKey,
  showTooltipIfReady
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
  // Use a single Promise-based timeout instead of a loop with await
  if (!currentStep.value && popoverState.value.step) {
    await new Promise<void>((resolve) => {
      const maxWaitTime = 150; // 3 * 50ms equivalent to 3 nextTick calls
      const startTime = Date.now();

      const checkStep = () => {
        if (currentStep.value || !popoverState.value.step || Date.now() - startTime > maxWaitTime) {
          resolve();
        } else {
          // Use requestAnimationFrame for better performance than nextTick in a loop
          requestAnimationFrame(checkStep);
        }
      };

      checkStep();
    });
  }

  // Additional wait for async operations
  if (isAsyncOperationInProgress.value) {
    await nextTick();
  }
};

// Tooltip management functions removed - handled by useTooltipManagement

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

// Watchers moved after function definitions

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
    moveNext: (options?: NavigationOptions) => moveNext({ autoScroll: true, ...options }),
    movePrevious: (options?: NavigationOptions) => movePrevious({ autoScroll: true, ...options }),
    moveTo: (index: number, options?: NavigationOptions) => moveTo(index, { autoScroll: true, ...options }),
    skipTour: () => skipTour(),
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

const { emitStepInteractionEvent } = eventEmitters;



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

// Navigation wrappers removed - using direct async tour functions

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

// Navigation functions are now provided directly from useCoachMark

// Create wrapper functions for event handlers with auto-scroll enabled
const moveNextForEventHandlers = async () => {
  moveNext({ autoScroll: true });
};
const movePreviousForEventHandlers = async () => {
  movePrevious({ autoScroll: true });
};

// Initialize event handlers
const { handleNext, handlePrevious, handleClose, handleSkip, handleTooltipShow, handleTooltipHide } = useCoachMarkEventHandlers({
  currentStep,
  currentStepIndex,
  popoverState,
  isActive,
  emit,
  emitStepInteractionEvent: emitStepInteractionEventWrapper,
  handleAsyncNavigation,
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

// Create wrapper functions for backward compatibility with auto-scroll enabled by default
const moveNextWrapper = (options?: NavigationOptions) => moveNext({ autoScroll: true, ...options });
const movePreviousWrapper = (options?: NavigationOptions) => movePrevious({ autoScroll: true, ...options });
const moveToWrapper = (index: number, options?: NavigationOptions) => moveTo(index, { autoScroll: true, ...options });

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
