/**
 * TypeScript type definitions for MintCoachMark
 *
 * Type Organization:
 * 1. Basic primitive types
 * 2. Core interfaces (no dependencies)
 * 3. Retry mechanism types
 * 4. Hook and callback types
 * 5. Configuration interfaces
 * 6. Main coach mark interfaces
 * 7. Vue component interfaces
 * 8. Popover system interfaces
 * 9. Composable-specific types
 */

import type { QTooltipProps } from 'quasar'

// =============================================================================
// 1. BASIC PRIMITIVE TYPES
// =============================================================================

export type Side = 'top' | 'right' | 'bottom' | 'left' | 'over'
export type Alignment = 'start' | 'center' | 'end'
export type AllowedButtons = 'next' | 'previous' | 'close' | 'skip'
export type PopoverProvider = 'mint' | 'quasar'

// =============================================================================
// 2. CORE INTERFACES (NO DEPENDENCIES)
// =============================================================================

// Stage definition for overlay positioning
export type StageDefinition = {
  x: number
  y: number
  width: number
  height: number
}

// QTooltip configuration for step-level customization
// Uses Quasar's official types to ensure consistency and automatic updates
export type QTooltipConfig = {
  anchor?: QTooltipProps['anchor']
  self?: QTooltipProps['self']
  offset?: QTooltipProps['offset']
  class?: string // Keep as string since QTooltipProps doesn't expose class property directly
}

// Popover DOM elements type
export type PopoverDOM = {
  wrapper: HTMLElement
  arrow: HTMLElement
  title: HTMLElement
  description: HTMLElement
  footer: HTMLElement
  progress: HTMLElement
  nextBtn: HTMLElement
  prevBtn: HTMLElement
  closeBtn: HTMLElement
}

// =============================================================================
// 3. RETRY MECHANISM TYPES
// =============================================================================

// Retry configuration for element resolution
export type RetryConfig = {
  enabled?: boolean
  maxAttempts?: number
  delay?: number
  exponentialBackoff?: boolean
  onRetry?: (attempt: number, step: CoachMarkStep) => void
  onMaxAttemptsReached?: (step: CoachMarkStep) => void
}

// Retry state information
export type RetryState = {
  isRetrying: boolean
  currentAttempt: number
  maxAttempts: number
  lastAttemptTime: number
}

// =============================================================================
// 4. HOOK AND CALLBACK TYPES
// =============================================================================

// Hook function type - supports both sync and async operations
export type CoachMarkHook = (
  element: Element | undefined,
  step: CoachMarkStep,
  context: {
    config: CoachMarkConfig
    state: CoachMarkState
    coachMark: CoachMarkInstance
  }
) => void | Promise<void>

// Async tour hook type for step-level callbacks
export type AsyncTourHook = ({
  element,
  step,
  coachMark
}: {
  element: Element | undefined,
  step: CoachMarkStep,
  coachMark: CoachMarkInstance
}) => void | Promise<void>

// =============================================================================
// 5. CONFIGURATION TYPES
// =============================================================================

// Popover configuration
export type PopoverConfig = {
  title?: string
  description?: string
  side?: Side
  alignment?: Alignment
  showButtons?: AllowedButtons[]
  disableButtons?: AllowedButtons[]
  showProgress?: boolean
  progressText?: string
  nextBtnText?: string
  prevBtnText?: string
  doneBtnText?: string
  skipBtnText?: string
  popoverClass?: string

  // Highlight appearance (step-level overrides)
  padding?: number | string
  radius?: number | string

  // Original navigation callbacks (maintain backward compatibility)
  onNextClick?: CoachMarkHook
  onPrevClick?: CoachMarkHook
  onCloseClick?: CoachMarkHook
  onSkipClick?: CoachMarkHook

  // New async navigation callbacks (separate from original ones)
  onAsyncNextClick?: AsyncTourHook
  onAsyncPreviousClick?: AsyncTourHook
  onAsyncCloseClick?: AsyncTourHook

  // QTooltip-specific configuration for QuasarCoachMark
  tooltip?: QTooltipConfig
}

// Coach mark step definition
export type CoachMarkStep = {
  element?: string | Element | (() => Element)
  popover?: PopoverConfig
  disableActiveInteraction?: boolean

  // Retry configuration for element resolution
  retry?: boolean | RetryConfig

  // Step lifecycle hooks
  onHighlightStarted?: CoachMarkHook
  onHighlighted?: CoachMarkHook
  onDeselected?: CoachMarkHook  // Keep original signature for backward compatibility

  // Async lifecycle hooks (new)
  onAsyncDeselected?: AsyncTourHook  // New async version
}

// =============================================================================
// 6. MAIN COACH MARK TYPES
// =============================================================================

// Main configuration type
export type CoachMarkConfig = {
  steps?: CoachMarkStep[]
  animate?: boolean
  overlayColor?: string
  overlayOpacity?: number
  smoothScroll?: boolean
  allowClose?: boolean
  overlayClickBehavior?: 'close' | 'nextStep'

  // Highlight appearance
  padding?: number | string
  radius?: number | string

  disableActiveInteraction?: boolean
  allowKeyboardControl?: boolean

  // Popover defaults
  popoverClass?: string
  popoverOffset?: number
  showButtons?: AllowedButtons[]
  disableButtons?: AllowedButtons[]
  showProgress?: boolean

  // Button text defaults
  progressText?: string
  nextBtnText?: string
  prevBtnText?: string
  doneBtnText?: string
  skipBtnText?: string

  // Skip tour configuration
  allowSkip?: boolean

  // Global retry configuration for element resolution
  retry?: boolean | RetryConfig

  // Global hooks
  onHighlightStarted?: CoachMarkHook
  onHighlighted?: CoachMarkHook
  onDeselected?: CoachMarkHook
  onDestroyStarted?: CoachMarkHook
  onDestroyed?: CoachMarkHook
  onNextClick?: CoachMarkHook
  onPrevClick?: CoachMarkHook
  onCloseClick?: CoachMarkHook
  onSkipClick?: CoachMarkHook
  onPopoverRender?: (
    popover: PopoverDOM,
    context: {
      config: CoachMarkConfig
      state: CoachMarkState
      coachMark: CoachMarkInstance
    }
  ) => void
}

// State type
export type CoachMarkState = {
  isInitialized?: boolean
  activeIndex?: number
  activeElement?: Element
  activeStep?: CoachMarkStep
  previousElement?: Element
  previousStep?: CoachMarkStep
  popover?: PopoverDOM

  // Internal state (using descriptive naming conventions)
  internalPreviousElement?: Element
  currentActiveElement?: Element
  internalPreviousStep?: CoachMarkStep
  currentActiveStep?: CoachMarkStep
  internalActiveOnDestroyed?: Element
  internalResizeTimeout?: number
  internalTransitionCallback?: () => void
  currentActiveStagePosition?: StageDefinition
  internalOverlaySvg?: SVGSVGElement
  shouldRenderPopover?: { element: Element; step: CoachMarkStep }
  shouldRepositionPopover?: { element: Element; step: CoachMarkStep }
}

// Navigation options for programmatic navigation
export type NavigationOptions = {
  autoScroll?: boolean
}

// CoachMark instance type (provides intuitive API for coach mark interactions)
export type CoachMarkInstance = {
  isActive: () => boolean
  refresh: () => void
  start: (stepIndex?: number, options?: NavigationOptions) => void
  setConfig: (config: CoachMarkConfig) => void
  setSteps: (steps: CoachMarkStep[]) => void
  getConfig: () => CoachMarkConfig
  getState: (key?: string) => any
  getActiveIndex: () => number | undefined
  isFirstStep: () => boolean
  isLastStep: () => boolean
  getActiveStep: () => CoachMarkStep | undefined
  getActiveElement: () => Element | undefined
  getPreviousElement: () => Element | undefined
  getPreviousStep: () => CoachMarkStep | undefined
  moveNext: (options?: NavigationOptions) => void
  movePrevious: (options?: NavigationOptions) => void
  moveTo: (index: number, options?: NavigationOptions) => void
  skipTour: () => void
  hasNextStep: () => boolean
  hasPreviousStep: () => boolean
  highlight: (step: CoachMarkStep) => void
  destroy: () => void
}

// =============================================================================
// 7. VUE COMPONENT TYPES
// =============================================================================

// Vue component props
export type MintCoachMarkProps = {
  steps?: CoachMarkStep[]
  config?: CoachMarkConfig
  modelValue?: boolean
  autoStart?: boolean
}

// Vue component emits
export type MintCoachMarkEmits = {
  'update:modelValue': [value: boolean]
  'tour-start': []
  'tour-complete': []
  'tour-skipped': [step: CoachMarkStep, index: number]
  'step-change': [step: CoachMarkStep, index: number]
  'highlight-started': [element: Element | undefined, step: CoachMarkStep]
  'highlighted': [element: Element | undefined, step: CoachMarkStep]
  'deselected': [element: Element | undefined, step: CoachMarkStep]
}

// =============================================================================
// 8. POPOVER SYSTEM TYPES
// =============================================================================

// Popover provider configuration
export type PopoverProviderConfig = {
  provider: PopoverProvider
  quasarOptions?: Record<string, unknown>
}

// Enhanced popover communication type
export type PopoverCommunication = {
  visible: boolean
  targetElement: Element | null
  step: CoachMarkStep | null
  position: {
    x: number
    y: number
  } | null
  provider: PopoverProvider
  isPositioning: boolean
}

// Popover component props for decoupled architecture
export type MintPopoverProps = {
  visible?: boolean
  targetElement?: Element | null
  step?: CoachMarkStep | null
  title?: string
  description?: string
  side?: Side
  showButtons?: AllowedButtons[]
  disableButtons?: AllowedButtons[]
  showProgress?: boolean
  progressText?: string
  nextBtnText?: string
  prevBtnText?: string
  skipBtnText?: string
  popoverClass?: string
  offset?: number
}

// Popover component emits
export type MintPopoverEmits = {
  (e: 'next'): void
  (e: 'previous'): void
  (e: 'close'): void
  (e: 'skip'): void
  (e: 'rendered', popover: HTMLElement): void
  (e: 'destroyed'): void
}



// Communication composable return type
export type UsePopoverCommunicationReturn = {
  readonly popoverState: import('vue').ComputedRef<PopoverCommunication>
  readonly updatePopoverState: (updates: Partial<PopoverCommunication>) => void
  readonly showPopover: (element: Element, step: CoachMarkStep, isPositioning?: boolean) => void
  readonly hidePopover: () => void
  readonly repositionPopover: () => void
  readonly forceRepositioning: () => void
  readonly completePositioning: () => void
  readonly setProvider: (provider: PopoverProvider) => void
}

// =============================================================================
// 9. COMPOSABLE-SPECIFIC TYPES
// =============================================================================

// Async Tour Composable Types
export type UseAsyncTourOptions = {
  onAsyncOperationStart?: () => void
  onAsyncOperationComplete?: () => void
  onAsyncOperationError?: (error: Error) => void
}

export type UseAsyncTourReturn = {
  isAsyncOperationInProgress: import('vue').Ref<boolean>
  executeAsyncCallback: (
    callback: AsyncTourHook,
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ) => Promise<boolean>
  handleAsyncNavigation: (
    direction: 'next' | 'previous' | 'close' | 'skip',
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance,
    defaultAction: () => void
  ) => Promise<void>
  handleStepDeselection: (
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ) => Promise<void>
}

// Scroll Blocking Composable Types
export type UseScrollBlockingReturn = {
  blockScrolling: () => void
  unblockScrolling: () => void
  isBlocked: import('vue').Ref<boolean>
  getScrollPosition: () => { x: number; y: number }
  forceUnblock: () => void
}

// Tooltip Management Composable Types
export type UseTooltipManagementReturn = {
  tooltipVisible: import('vue').Ref<boolean>
  tooltipRefreshKey: import('vue').Ref<number>
  showTooltipIfReady: (context?: string) => Promise<void>
  hideTooltip: () => void
  forceTooltipRefresh: () => void
  setStepTransitioning: (transitioning: boolean) => void
  getDisplayStats: () => TooltipDisplayState
}

export type TooltipDisplayState = {
  isDisplaying: boolean
  pendingDisplayId: number
  lastDisplayTime: number
  debounceDelay: number
  totalCalls: number
  debouncedCalls: number
  executedCalls: number
  lastExecutionContext: string
  isStepTransitioning: boolean
}

// Quasar Watchers Composable Types
export type UseQuasarWatchersReturn = {
  initWatchers: () => void
  isProcessing: () => boolean
}

export type PopoverState = {
  visible: boolean
  targetElement: Element | null
  step: CoachMarkStep | null
}

// Element Retry Composable Types
export type UseElementRetryOptions = {
  defaultRetryConfig?: RetryConfig
}

export type UseElementRetryReturn = {
  resolveElementWithRetry: (
    elementRef: string | Element | (() => Element) | undefined,
    retryConfig?: boolean | RetryConfig,
    step?: CoachMarkStep
  ) => Promise<Element | null>
  isRetrying: import('vue').Ref<boolean>
  currentAttempt: import('vue').Ref<number>
  cancelRetry: () => void
}
