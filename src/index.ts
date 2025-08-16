// Main entry point for the QuasarCoachMark library
export { default as QuasarCoachMark } from './components/QuasarCoachMark.vue';

// Composables
export { useCoachMark } from './composables/useCoachMark';
export { useCoachMarkState } from './composables/useCoachMarkState';
export { useCoachMarkEvents } from './composables/useCoachMarkEvents';
export { useOverlay } from './composables/useOverlay';
export { useHighlight } from './composables/useHighlight';
export {
  usePopoverCommunication,
  getGlobalPopoverState,
  resetGlobalPopoverState
} from './composables/usePopoverCommunication';
export { useAsyncTour } from './composables/useAsyncTour';
export { useElementRetry } from './composables/useElementRetry';
export {
  getQuasarAnchor,
  getQuasarSelf,
  getQuasarOffset,
  getQuasarClass
} from './composables/useQuasarTooltipConfig';
export {
  useCoachMarkUIState,
  checkIsLastStep,
  getShowButtons,
  checkShouldShowSkipButton,
  getProgressText,
  checkShouldShowTooltip
} from './composables/useCoachMarkUIState';
export { useStepNavigation } from './composables/useStepNavigation';
export { useCoachMarkEventHandlers } from './composables/useCoachMarkEventHandlers';
export {
  hasAsyncNavigationCallbacks,
  hasAsyncLifecycleCallbacks,
  hasAsyncCallbacks
} from './composables/utils';


// Types
export type {
  CoachMarkConfig,
  CoachMarkStep,
  CoachMarkHook,
  AsyncTourHook,
  PopoverConfig,
  AllowedButtons,
  Side,
  Alignment,
  StageDefinition,
  PopoverCommunication,
  UsePopoverCommunicationReturn,
  CoachMarkInstance,
  RetryConfig,
  UseElementRetryOptions,
  UseElementRetryReturn
} from './types';

// Utilities
export * from './utils';
export * from './utils/quasarTooltip';

// CSS
import './styles/coach-mark.css';
