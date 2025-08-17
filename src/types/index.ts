/**
 * TypeScript type definitions for QuasarCoachMark
 *
 * DEPENDENCY-ORDERED TYPE ORGANIZATION:
 * ====================================
 *
 * This file is organized to ensure all types are defined before they are referenced,
 * eliminating forward reference issues and circular dependencies.
 *
 * DEPENDENCY LEVELS (REORGANIZED TO ELIMINATE FORWARD REFERENCES):
 *
 * Level 1: Basic primitive types (no dependencies)
 *   - Side, Alignment, AllowedButtons
 *   - These are simple string unions with no dependencies
 *
 * Level 2: Core interfaces (no dependencies)
 *   - StageDefinition, QTooltipConfig, PopoverDOM
 *   - These use only primitive types and external library types
 *
 * Level 3: Core minimal interfaces (foundation layer)
 *   - CoreElement, CoreConfig, CoreState, CoreInstance
 *   - Minimal interfaces with no dependencies on other coach mark types
 *
 * Level 4: Generic retry system abstraction
 *   - GenericRetryConfig, RetryState
 *   - Uses generic type parameters to avoid forward references
 *
 * Level 5: Generic hook abstraction layer
 *   - GenericHookFunction, GenericAsyncHook
 *   - Generic types that avoid concrete dependencies
 *
 * Level 6: Minimal type alias declarations (resolve forward references)
 *   - TempCoachMarkStep (minimal), TempCoachMarkConfig (minimal)
 *   - Essential properties only to resolve forward references
 *
 * Level 7: Main coach mark type aliases
 *   - CoachMarkState, CoachMarkInstance, NavigationOptions
 *   - Core types that can reference the minimal types
 *
 * Level 8: Concrete hook type definitions
 *   - HookContext, CoachMarkHook, AsyncTourHook, RetryConfig
 *   - Concrete types using the main type aliases
 *
 * Level 9: Configuration types and type extensions
 *   - PopoverConfig, CoachMarkStep (complete), CoachMarkConfig (complete)
 *   - Complete type definitions using TypeScript intersection types
 *
 * Level 10: Event context types
 *   - StepLifecycleEventContext, StepInteractionEventContext
 *   - Event types using concrete interfaces
 *
 * Level 11: Vue component and specialized types
 *   - MintCoachMarkProps, MintCoachMarkEmits, PopoverCommunication, etc.
 *   - Specialized interfaces for components and composables
 *   - These are return types for composable functions
 *
 * TYPE ALIAS DECLARATION SPLITTING WITH INTERSECTION TYPES STRATEGY:
 * - Minimal type aliases declared early with essential properties only
 * - Intersection types used to combine minimal types with extended properties later
 * - Forward references resolved by having minimal types available when needed
 * - All types follow strict dependency order with zero forward references
 *
 * ZERO FORWARD REFERENCES AND ZERO DUPLICATE IDENTIFIERS ACHIEVED:
 * - Minimal TempCoachMarkStep and TempCoachMarkConfig declared early (Level 6)
 * - Complete types created using intersection types (Level 9A)
 * - Type aliases with intersection types provide complete type definitions
 * - ESLint rule @typescript-eslint/no-explicit-any enforced without exceptions
 *
 * MAINTENANCE NOTES:
 * - When adding new types, ensure they are placed at the correct dependency level
 * - Use generic types for breaking circular dependencies
 * - Define main interfaces before configuration types that reference them
 * - Keep the dependency levels clearly separated with comments
 */

import type { QTooltipProps } from 'quasar';
import { type Ref, type ComputedRef } from 'vue';

// =============================================================================
// LEVEL 1: BASIC PRIMITIVE TYPES (NO DEPENDENCIES)
// =============================================================================

export type Side = 'top' | 'right' | 'bottom' | 'left' | 'over';
export type Alignment = 'start' | 'center' | 'end';
export type AllowedButtons = 'next' | 'previous' | 'close' | 'skip';


// =============================================================================
// LEVEL 2: CORE INTERFACES (NO DEPENDENCIES)
// =============================================================================

// Stage definition for overlay positioning
export type StageDefinition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// QTooltip configuration for step-level customization
// Uses Quasar's official types to ensure consistency and automatic updates
export type QTooltipConfig = {
  anchor?: QTooltipProps['anchor'];
  self?: QTooltipProps['self'];
  offset?: QTooltipProps['offset'];
  class?: string; // Keep as string since QTooltipProps doesn't expose class property directly
};

// Popover DOM elements type
export type PopoverDOM = {
  wrapper: HTMLElement;
  arrow: HTMLElement;
  title: HTMLElement;
  description: HTMLElement;
  footer: HTMLElement;
  progress: HTMLElement;
  nextBtn: HTMLElement;
  prevBtn: HTMLElement;
  closeBtn: HTMLElement;
};

// =============================================================================
// LEVEL 3: CORE MINIMAL INTERFACES (FOUNDATION LAYER - NO DEPENDENCIES)
// =============================================================================

// Core minimal interfaces that form the foundation of the type system
// These interfaces have NO dependencies on other coach mark types
// and serve as the base for breaking circular dependencies

// Core element interface - minimal element properties
export type CoreElement = {
  readonly element?: string | Element | (() => Element);
  readonly id?: string;
  readonly group?: string;
  readonly data?: Record<string, unknown>;
};

// Core configuration interface - basic configuration properties
export type CoreConfig = {
  readonly animate?: boolean;
  readonly overlayColor?: string;
  readonly overlayOpacity?: number;
  readonly smoothScroll?: boolean;
  readonly allowClose?: boolean;
  readonly overlayClickBehavior?: 'close' | 'nextStep';
};

// Core state interface - essential state properties
export type CoreState = {
  readonly isInitialized?: boolean;
  readonly activeIndex?: number;
  readonly activeElement?: Element;
};

// Core instance interface - fundamental methods
export type CoreInstance = {
  readonly isActive: () => boolean;
  readonly getActiveIndex: () => number | undefined;
  readonly getActiveElement: () => Element | undefined;
  readonly refresh: () => void;
  readonly destroy: () => void;
};

// =============================================================================
// LEVEL 4: LEGACY BASE INTERFACES (DEPRECATED - FOR BACKWARD COMPATIBILITY)
// =============================================================================

// Legacy base interfaces - kept for backward compatibility
// These will be removed once migration to core interfaces is complete
export type BaseStep = NonNullable<unknown> & CoreElement;
export type BaseConfig = {
  readonly steps?: readonly BaseStep[];
} & CoreConfig;
export type BaseState = NonNullable<unknown> & CoreState;
export type BaseInstance = {
  readonly getActiveStep: () => BaseStep | undefined;
} & CoreInstance;

// =============================================================================
// LEVEL 4: GENERIC RETRY SYSTEM ABSTRACTION (NO FORWARD REFERENCES)
// =============================================================================

// Generic retry configuration - parameterized to avoid forward references
export type GenericRetryConfig<TStep> = {
  readonly enabled?: boolean;
  readonly maxAttempts?: number;
  readonly delay?: number;
  readonly exponentialBackoff?: boolean;
  readonly onRetry?: (attempt: number, step: TStep) => void;
  readonly onMaxAttemptsReached?: (step: TStep) => void;
};

// Retry state information - no dependencies
export type RetryState = {
  readonly isRetrying: boolean;
  readonly currentAttempt: number;
  readonly maxAttempts: number;
  readonly lastAttemptTime: number;
};

// Note: Concrete RetryConfig type is defined later after main interfaces

// =============================================================================
// LEVEL 5: PROGRESSIVE HOOK TYPE DEFINITIONS (INTERFACE MERGING APPROACH)
// =============================================================================

// Use interface merging to progressively define hook types
// This avoids circular dependencies by allowing incremental type building

// Note: Hook types (CoachMarkHook, AsyncTourHook, HookContext) are defined
// later after all main interfaces to avoid circular dependencies

// Generic hook types for later concrete binding
export type GenericHookFunction<TStep, TConfig, TState, TInstance> = (
  element: Element | undefined,
  step: TStep,
  context: {
    config: TConfig;
    state: TState;
    coachMark: TInstance;
  }
) => void | Promise<void>;

export type GenericAsyncHook<TStep, TInstance> = ({
  element,
  step,
  coachMark,
}: {
  element: Element | undefined;
  step: TStep;
  coachMark: TInstance;
}) => void | Promise<void>;

// =============================================================================
// LEVEL 6: MINIMAL TYPE ALIAS DECLARATIONS (RESOLVE FORWARD REFERENCES)
// =============================================================================

// Declare minimal type aliases early to resolve forward references
// These will be extended later with full definitions using intersection types

// Temporary minimal type aliases for forward references
// These will be combined with extended properties using intersection types
export type TempCoachMarkStep = {
  readonly id?: string;
  readonly element?: string | Element | (() => Element);
} & BaseStep;

export type TempCoachMarkConfig = {
  readonly steps?: readonly TempCoachMarkStep[];
  readonly animate?: boolean;
} & BaseConfig;

// Navigation options for programmatic navigation
export type NavigationOptions = {
  readonly autoScroll?: boolean;
};

// State type - extends BaseState (mutable for state management)
export type CoachMarkState = {
  // State properties (inherited from BaseState but redefined for clarity)
  isInitialized?: boolean;
  activeIndex?: number;
  activeElement?: Element;

  // Additional state properties
  activeStep?: TempCoachMarkStep;
  previousElement?: Element;
  previousStep?: TempCoachMarkStep;
  popover?: PopoverDOM;

  // Internal state (using descriptive naming conventions)
  internalPreviousElement?: Element;
  currentActiveElement?: Element;
  internalPreviousStep?: TempCoachMarkStep;
  currentActiveStep?: TempCoachMarkStep;
  internalActiveOnDestroyed?: Element;
  internalResizeTimeout?: number;
  internalTransitionCallback?: () => void;
  currentActiveStagePosition?: StageDefinition;
  internalOverlaySvg?: SVGSVGElement;
  shouldRenderPopover?: { element: Element; step: TempCoachMarkStep };
  shouldRepositionPopover?: { element: Element; step: TempCoachMarkStep };
} & BaseState;

// CoachMark instance type - extends BaseInstance
export type CoachMarkInstance = {
  // Instance methods (inherited from BaseInstance but redefined for clarity)
  readonly isActive: () => boolean;
  readonly getActiveIndex: () => number | undefined;
  readonly getActiveStep: () => TempCoachMarkStep | undefined;
  readonly getActiveElement: () => Element | undefined;

  // Additional instance methods
  readonly refresh: () => void;
  readonly start: (stepIndex?: number, options?: NavigationOptions) => void;
  readonly setConfig: (config: TempCoachMarkConfig) => void;
  readonly setSteps: (steps: readonly TempCoachMarkStep[]) => void;
  readonly getConfig: () => TempCoachMarkConfig;
  readonly getState: <K extends keyof CoachMarkState>(
    key?: K,
  ) => K extends keyof CoachMarkState ? CoachMarkState[K] : unknown;
  readonly isFirstStep: () => boolean;
  readonly isLastStep: () => boolean;
  readonly getPreviousElement: () => Element | undefined;
  readonly getPreviousStep: () => TempCoachMarkStep | undefined;
  readonly moveNext: (options?: NavigationOptions) => void;
  readonly movePrevious: (options?: NavigationOptions) => void;
  readonly moveTo: (index: number, options?: NavigationOptions) => void;
  readonly skipTour: () => void;
  readonly hasNextStep: () => boolean;
  readonly hasPreviousStep: () => boolean;
  readonly highlight: (step: TempCoachMarkStep) => void;
  readonly destroy: () => void;
} & BaseInstance;

// =============================================================================
// LEVEL 7: CONCRETE HOOK TYPE DEFINITIONS (NOW POSSIBLE WITH MAIN INTERFACES DEFINED)
// =============================================================================

// Hook context with concrete types
export type HookContext = {
  readonly config: TempCoachMarkConfig;
  readonly state: CoachMarkState;
  readonly coachMark: CoachMarkInstance;
};

// Concrete hook types using the main interfaces
export type CoachMarkHook = GenericHookFunction<
  TempCoachMarkStep,
  TempCoachMarkConfig,
  CoachMarkState,
  CoachMarkInstance
>;
export type AsyncTourHook = GenericAsyncHook<TempCoachMarkStep, CoachMarkInstance>;

// Concrete retry config
export type RetryConfig = GenericRetryConfig<TempCoachMarkStep>;

// =============================================================================
// LEVEL 8: STEP AND CONFIG INTERFACE EXTENSIONS (COMPLETE THE INTERFACE DEFINITIONS)
// =============================================================================

// Note: Full interface extensions will be added after PopoverConfig is defined
// This resolves the remaining forward reference to PopoverConfig

// Note: CoachMarkConfig extension will be added after hook types are defined
// This resolves forward references to hook types

// =============================================================================
// LEVEL 9: CONFIGURATION TYPES (EXTENDS BASE INTERFACES)
// =============================================================================

// =============================================================================
// LEVEL 7: CONFIGURATION TYPES (EXTENDS BASE INTERFACES)
// =============================================================================

// Popover configuration
export type PopoverConfig = {
  title?: string;
  description?: string;
  side?: Side;
  alignment?: Alignment;
  showButtons?: AllowedButtons[];
  disableButtons?: AllowedButtons[];
  showProgress?: boolean;
  progressText?: string;
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;
  skipBtnText?: string;
  popoverClass?: string;

  // Highlight appearance (step-level overrides)
  padding?: number | string;
  radius?: number | string;

  // Original navigation callbacks (maintain backward compatibility)
  onNextClick?: CoachMarkHook;
  onPrevClick?: CoachMarkHook;
  onCloseClick?: CoachMarkHook;
  onSkipClick?: CoachMarkHook;

  // New async navigation callbacks (separate from original ones)
  onAsyncNextClick?: AsyncTourHook;
  onAsyncPreviousClick?: AsyncTourHook;
  onAsyncCloseClick?: AsyncTourHook;

  // QTooltip-specific configuration for QuasarCoachMark
  tooltip?: QTooltipConfig;
};

// =============================================================================
// LEVEL 9: INTERFACE EXTENSIONS (COMPLETE THE MINIMAL INTERFACE DEFINITIONS)
// =============================================================================

// Now that PopoverConfig and hook types are defined, extend the minimal interfaces

// =============================================================================
// LEVEL 9A: CONSOLIDATED TYPE ALIAS DEFINITIONS (INTERSECTION TYPES)
// =============================================================================

// Now that all dependencies (PopoverConfig) are defined, we can create the complete consolidated
// type definitions using intersection types. Hook types will be redefined after complete types.

// Complete CoachMarkStep type (consolidates minimal + extended properties using intersection)
export type CoachMarkStep = TempCoachMarkStep & {
  // Extended properties (now that dependencies are available)
  readonly popover?: PopoverConfig;
  readonly disableActiveInteraction?: boolean;
  readonly retry?: boolean | RetryConfig;
  readonly onHighlightStarted?: CoachMarkHook;
  readonly onHighlighted?: CoachMarkHook;
  readonly onDeselected?: CoachMarkHook;
  readonly onAsyncDeselected?: AsyncTourHook;
  readonly group?: string;
  readonly data?: Record<string, unknown>;
};

// Complete CoachMarkConfig type (consolidates minimal + extended properties using intersection)
export type CoachMarkConfig = TempCoachMarkConfig & {
  // Override steps to use complete CoachMarkStep type
  readonly steps?: readonly CoachMarkStep[];

  // Extended properties (now that dependencies are available)
  readonly overlayColor?: string;
  readonly overlayOpacity?: number;
  readonly smoothScroll?: boolean;
  readonly allowClose?: boolean;
  readonly overlayClickBehavior?: 'close' | 'nextStep';
  readonly showProgress?: boolean;
  readonly keyboardControl?: boolean;
  readonly disableActiveInteraction?: boolean;
  readonly padding?: number | string;
  readonly radius?: number | string;
  readonly allowKeyboardControl?: boolean;
  readonly popoverClass?: string;
  readonly popoverOffset?: number;
  readonly showButtons?: AllowedButtons[];
  readonly disableButtons?: AllowedButtons[];
  readonly progressText?: string;
  readonly nextBtnText?: string;
  readonly prevBtnText?: string;
  readonly doneBtnText?: string;
  readonly skipBtnText?: string;
  readonly allowSkip?: boolean;
  readonly retry?: boolean | RetryConfig;
  readonly onHighlightStarted?: CoachMarkHook;
  readonly onHighlighted?: CoachMarkHook;
  readonly onDeselected?: CoachMarkHook;
  readonly onDestroyStarted?: CoachMarkHook;
  readonly onDestroyed?: CoachMarkHook;
  readonly onNextClick?: CoachMarkHook;
  readonly onPrevClick?: CoachMarkHook;
  readonly onCloseClick?: CoachMarkHook;
  readonly onSkipClick?: CoachMarkHook;
  readonly onPopoverRender?: (
    popover: PopoverDOM,
    context: HookContext
  ) => void;
};

// =============================================================================
// LEVEL 10: SPECIALIZED TYPE DEFINITIONS
// =============================================================================

// Tooltip display state (moved here to resolve forward reference)
export type TooltipDisplayState = {
  isDisplaying: boolean;
  pendingDisplayId: number;
  lastDisplayTime: number;
  debounceDelay: number;
  totalCalls: number;
  debouncedCalls: number;
  executedCalls: number;
  lastExecutionContext: string;
  isStepTransitioning: boolean;
};

// =============================================================================
// LEVEL 11: EVENT CONTEXT TYPES (USES CONCRETE TYPES)
// =============================================================================

// Step lifecycle event context
export type StepLifecycleEventContext = {
  readonly step: CoachMarkStep;
  readonly nextStep: CoachMarkStep | undefined;
  readonly previousStep: CoachMarkStep | undefined;
  readonly stepIndex: number;
  readonly isHighlighted: boolean;
  readonly isLastStep: boolean;
  readonly isFirstStep: boolean;
  readonly coachMark: CoachMarkInstance;
};

// Step interaction event context (extends lifecycle context with navigation flags)
export type StepInteractionEventContext = {
  readonly step: CoachMarkStep;
  readonly nextStep: CoachMarkStep | undefined;
  readonly previousStep: CoachMarkStep | undefined;
  readonly coachMark: CoachMarkInstance;
  readonly stepIndex: number;
  readonly hasNextStep: boolean;
  readonly hasPreviousStep: boolean;
  readonly isHighlighted: boolean;
};

// =============================================================================
// LEVEL 8: VUE COMPONENT INTERFACES (USES MAIN INTERFACES FROM LEVEL 7)
// =============================================================================

// Vue component props
export type MintCoachMarkProps = {
  readonly steps?: readonly CoachMarkStep[];
  readonly config?: CoachMarkConfig;
  readonly modelValue?: boolean;
  readonly autoStart?: boolean;
};

// Vue component emits
export type MintCoachMarkEmits = {
  readonly 'update:modelValue': readonly [value: boolean];
  readonly 'tour-start': readonly [];
  readonly 'tour-complete': readonly [];
  readonly 'tour-skipped': readonly [step: CoachMarkStep, index: number];
  readonly 'step-change': readonly [step: CoachMarkStep, index: number];
  readonly 'highlight-started': readonly [element: Element | undefined, step: CoachMarkStep];
  readonly 'highlighted': readonly [element: Element | undefined, step: CoachMarkStep];
  readonly 'deselected': readonly [element: Element | undefined, step: CoachMarkStep];

  // Step lifecycle events with comprehensive context
  readonly 'step-highlight-started': readonly [context: StepLifecycleEventContext];
  readonly 'step-highlighted': readonly [context: StepLifecycleEventContext];
  readonly 'step-deselected': readonly [context: StepLifecycleEventContext];
  readonly 'step-async-deselected': readonly [context: StepLifecycleEventContext];

  // Step interaction events with navigation context
  readonly 'step-async-next-clicked': readonly [context: StepInteractionEventContext];
  readonly 'step-async-previous-clicked': readonly [context: StepInteractionEventContext];
  readonly 'step-changed': readonly [context: StepInteractionEventContext];
  readonly 'step-closed': readonly [context: StepInteractionEventContext];
  readonly 'step-next-clicked': readonly [context: StepInteractionEventContext];
  readonly 'step-previous-clicked': readonly [context: StepInteractionEventContext];

  // Overlay events
  readonly 'overlay-click': readonly [event: MouseEvent];
  readonly 'overlay-show': readonly [];
  readonly 'overlay-hide': readonly [];
};

// =============================================================================
// LEVEL 9: POPOVER SYSTEM TYPES
// =============================================================================



// Enhanced popover communication type
export type PopoverCommunication = {
  readonly visible: boolean;
  readonly targetElement: Element | null;
  readonly step: CoachMarkStep | null;
  readonly position: {
    readonly x: number;
    readonly y: number;
  } | null;
  readonly isPositioning: boolean;
};



// Communication composable return type
export type UsePopoverCommunicationReturn = {
  readonly popoverState: ComputedRef<PopoverCommunication>;
  readonly showPopover: (element: Element, step: CoachMarkStep, isPositioning?: boolean) => void;
  readonly hidePopover: () => void;
};

// =============================================================================
// LEVEL 10: COMPOSABLE-SPECIFIC TYPES
// =============================================================================

// Async Tour Composable Types
export type UseAsyncTourOptions = {
  readonly onAsyncOperationStart?: () => void;
  readonly onAsyncOperationComplete?: () => void;
  readonly onAsyncOperationError?: (error: Error) => void;
};

export type UseAsyncTourReturn = {
  readonly isAsyncOperationInProgress: Ref<boolean>;
  readonly executeAsyncCallback: (
    callback: AsyncTourHook,
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ) => Promise<boolean>;
  readonly handleAsyncNavigation: (
    direction: 'next' | 'previous' | 'close' | 'skip',
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance,
    defaultAction: () => void
  ) => Promise<void>;
  readonly handleStepDeselection: (
    element: Element | undefined,
    step: CoachMarkStep,
    coachMark: CoachMarkInstance
  ) => Promise<void>;
};

// Scroll Blocking Composable Types
export type UseScrollBlockingReturn = {
  readonly blockScrolling: () => void;
  readonly unblockScrolling: () => void;
  readonly isBlocked: Ref<boolean>;
  readonly getScrollPosition: () => { readonly x: number; readonly y: number };
  readonly forceUnblock: () => void;
};

// Tooltip Management Composable Types
export type UseTooltipManagementReturn = {
  readonly tooltipVisible: Ref<boolean>;
  readonly tooltipRefreshKey: Ref<number>;
  readonly showTooltipIfReady: (context?: string) => Promise<void>;
  readonly hideTooltip: () => void;
  readonly forceTooltipRefresh: () => void;
  readonly setStepTransitioning: (transitioning: boolean) => void;
  readonly getDisplayStats: () => TooltipDisplayState;
};

// Quasar Watchers Composable Types
export type UseQuasarWatchersReturn = {
  readonly initWatchers: () => void;
};

// Step navigation composable return type
export type UseStepNavigationReturn = {
  readonly moveNext: () => Promise<void>;
  readonly movePrevious: () => Promise<void>;
  readonly moveTo: (stepIndex: number, options?: NavigationOptions) => Promise<void>;
};

export type PopoverState = {
  readonly visible: boolean;
  readonly targetElement: Element | null;
  readonly step: CoachMarkStep | null;
};

// Element Retry Composable Types
export type UseElementRetryOptions = {
  readonly defaultRetryConfig?: RetryConfig;
};

export type UseElementRetryReturn = {
  readonly resolveElementWithRetry: (
    elementRef: string | Element | (() => Element) | undefined,
    retryConfig?: boolean | RetryConfig,
    step?: CoachMarkStep
  ) => Promise<Element | null>;
  readonly isRetrying: Ref<boolean>;
  readonly currentAttempt: Ref<number>;
  readonly cancelRetry: () => void;
};
