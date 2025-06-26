// Main entry point for the MintCoachMark library
export { default as MintCoachMark } from './components/MintCoachMark.vue'
export { default as QuasarCoachMark } from './components/QuasarCoachMark.vue'
export { default as MintPopover } from './components/MintPopover.vue'

// Composables
export { useCoachMark } from './composables/useCoachMark'
export { useCoachMarkState } from './composables/useCoachMarkState'
export { useCoachMarkEvents } from './composables/useCoachMarkEvents'
export { useOverlay } from './composables/useOverlay'
export { useHighlight } from './composables/useHighlight'
export {
  usePopoverCommunication,
  getGlobalPopoverState,
  resetGlobalPopoverState
} from './composables/usePopoverCommunication'
export { useAsyncTour } from './composables/useAsyncTour'
export {
  hasAsyncNavigationCallbacks,
  hasAsyncLifecycleCallbacks,
  hasAsyncCallbacks
} from './composables/utils'


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
  PopoverProvider,
  PopoverProviderConfig,
  PopoverCommunication,
  MintPopoverProps,
  MintPopoverEmits,
  UsePopoverCommunicationReturn,
  CoachMarkInstance
} from './types'

// Utilities
export * from './utils'

// CSS
import './styles/coach-mark.css'
