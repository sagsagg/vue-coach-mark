/**
 * Main coach mark composable that orchestrates all functionality
 * Provides an intuitive API for coach mark interactions
 */

import { ref } from 'vue'
import { useCoachMarkState } from './useCoachMarkState'
import { useCoachMarkConfig } from './useCoachMarkConfig'
import { useCoachMarkEvents } from './useCoachMarkEvents'
import { useOverlay } from './useOverlay'
import { useHighlight } from './useHighlight'
import type { CoachMarkConfig, CoachMarkStep, CoachMarkInstance, AllowedButtons } from '../types'

export function useCoachMark(initialConfig: CoachMarkConfig = {}) {
  const { getState, setState, resetState } = useCoachMarkState()
  const { configure, getConfig, setCurrentCoachMark, getCurrentCoachMark } = useCoachMarkConfig()
  const { listen, initEvents, destroyEvents, destroyEmitter } = useCoachMarkEvents()
  const { destroyOverlay } = useOverlay()
  const { highlight, refreshActiveHighlight, destroyHighlight } = useHighlight()

  // Initialize configuration
  configure(initialConfig)

  // Reactive state for the current tour
  const isActive = ref(false)
  const currentStepIndex = ref<number | undefined>(undefined)

  /**
   * Handle close action
   */
  function handleClose() {
    if (!getConfig('allowClose')) {
      return
    }
    destroy()
  }

  /**
   * Handle overlay click
   */
  function handleOverlayClick() {
    const overlayClickBehavior = getConfig('overlayClickBehavior')

    if (getConfig('allowClose') && overlayClickBehavior === 'close') {
      destroy()
      return
    }

    if (overlayClickBehavior === 'nextStep') {
      moveNext()
    }
  }

  /**
   * Move to next step
   */
  function moveNext() {
    const activeIndex = getState('activeIndex')
    const steps = getConfig('steps') || []
    if (typeof activeIndex === 'undefined') {
      return
    }

    const nextStepIndex = activeIndex + 1
    if (steps[nextStepIndex]) {
      startStep(nextStepIndex)
    } else {
      destroy()
    }
  }

  /**
   * Move to previous step
   */
  function movePrevious() {
    const activeIndex = getState('activeIndex')
    const steps = getConfig('steps') || []
    if (typeof activeIndex === 'undefined') {
      return
    }

    const previousStepIndex = activeIndex - 1
    if (steps[previousStepIndex]) {
      startStep(previousStepIndex)
    } else {
      destroy()
    }
  }

  /**
   * Move to specific step index
   */
  function moveTo(index: number) {
    const steps = getConfig('steps') || []

    if (steps[index]) {
      startStep(index)
    } else {
      destroy()
    }
  }

  /**
   * Skip the entire tour
   */
  function skipTour() {
    const activeStep = getState('currentActiveStep')
    const activeElement = getState('currentActiveElement')

    // Execute skip hook if provided
    const onSkipClick = getConfig('onSkipClick')
    if (onSkipClick) {
      const coachMark = getCurrentCoachMark()
      if (coachMark) {
        onSkipClick(activeElement || undefined, activeStep || {} as CoachMarkStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        })
      }
    }

    // Destroy the tour
    destroy(false)
  }

  /**
   * Handle arrow key navigation
   */
  function handleArrowLeft() {
    const isTransitioning = getState('internalTransitionCallback')
    if (isTransitioning) {
      return
    }

    const activeIndex = getState('activeIndex')
    const activeStep = getState('currentActiveStep')
    const activeElement = getState('currentActiveElement')
    if (typeof activeIndex === 'undefined' || typeof activeStep === 'undefined') {
      return
    }

    const onPrevClick = activeStep.popover?.onPrevClick || getConfig('onPrevClick')
    if (onPrevClick) {
      const coachMark = getCurrentCoachMark()
      if (coachMark) {
        return onPrevClick(activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        })
      }
    }

    movePrevious()
  }

  /**
   * Handle arrow key navigation
   */
  function handleArrowRight() {
    const isTransitioning = getState('internalTransitionCallback')
    if (isTransitioning) {
      return
    }

    const activeIndex = getState('activeIndex')
    const activeStep = getState('currentActiveStep')
    const activeElement = getState('currentActiveElement')
    if (typeof activeIndex === 'undefined' || typeof activeStep === 'undefined') {
      return
    }

    const onNextClick = activeStep.popover?.onNextClick || getConfig('onNextClick')
    if (onNextClick) {
      const coachMark = getCurrentCoachMark()
      if (coachMark) {
        return onNextClick(activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        })
      }
    }

    moveNext()
  }

  /**
   * Initialize the coach mark system
   */
  function init() {
    if (getState('isInitialized')) {
      return
    }

    setState('isInitialized', true)
    isActive.value = true
    
    // Add CSS classes to body
    document.body.classList.add(
      'mint-coach-mark-active',
      getConfig('animate') ? 'mint-coach-mark-fade' : 'mint-coach-mark-simple'
    )

    initEvents()

    // Set up event listeners
    listen('overlayClick', handleOverlayClick)
    listen('escapePress', handleClose)
    listen('arrowLeftPress', handleArrowLeft)
    listen('arrowRightPress', handleArrowRight)
    listen('refreshRequired', refreshActiveHighlight)
  }

  /**
   * Start the tour at a specific step
   */
  async function startStep(stepIndex: number = 0) {
    const steps = getConfig('steps')
    if (!steps) {
      console.error('No steps to drive through')
      destroy()
      return
    }

    if (!steps[stepIndex]) {
      destroy()
      return
    }

    setState('internalActiveOnDestroyed', document.activeElement as HTMLElement)
    setState('activeIndex', stepIndex)
    currentStepIndex.value = stepIndex

    const currentStep = steps[stepIndex]
    const hasNextStep = !!steps[stepIndex + 1]
    const hasPreviousStep = !!steps[stepIndex - 1]

    const doneBtnText = currentStep.popover?.doneBtnText || getConfig('doneBtnText') || 'Done'
    const allowsClosing = getConfig('allowClose')
    const showProgress =
      typeof currentStep.popover?.showProgress !== 'undefined'
        ? currentStep.popover?.showProgress
        : getConfig('showProgress')
    // Simplified progress text: just "current / total" format
    const progressText = `${stepIndex + 1} / ${steps.length}`

    const configuredButtons = currentStep.popover?.showButtons || getConfig('showButtons')
    const calculatedButtons: AllowedButtons[] = [
      'next',
      'previous',
      ...(allowsClosing ? ['close' as AllowedButtons] : [])
    ].filter(b => {
      return !configuredButtons?.length || configuredButtons.includes(b as AllowedButtons)
    }) as AllowedButtons[]

    // Prepare step with calculated popover properties
    const stepWithPopover = {
      ...currentStep,
      popover: currentStep.popover ? {
        showButtons: calculatedButtons,
        nextBtnText: !hasNextStep ? doneBtnText : currentStep.popover.nextBtnText,
        disableButtons: [...(!hasPreviousStep ? ['previous' as AllowedButtons] : [])],
        showProgress: showProgress,
        progressText: progressText,
        ...currentStep.popover
      } : undefined
    }

    await highlight(stepWithPopover)
  }

  /**
   * Destroy the coach mark
   */
  function destroy(withOnDestroyStartedHook = true) {
    const activeElement = getState('currentActiveElement')
    const activeStep = getState('currentActiveStep')
    const activeOnDestroyed = getState('internalActiveOnDestroyed')

    const onDestroyStarted = getConfig('onDestroyStarted')
    const coachMark = getCurrentCoachMark()

    // `onDestroyStarted` is used to confirm the exit of tour
    if (withOnDestroyStartedHook && onDestroyStarted && coachMark) {
      const isActiveDummyElement = !activeElement || activeElement?.id === 'mint-coach-mark-dummy-element'
      onDestroyStarted(isActiveDummyElement ? undefined : activeElement, activeStep!, {
        config: getConfig(),
        state: getState(),
        coachMark
      })
      return
    }

    const onDeselected = activeStep?.onDeselected || getConfig('onDeselected')
    const onDestroyed = getConfig('onDestroyed')

    // Remove CSS classes from body
    document.body.classList.remove('mint-coach-mark-active', 'mint-coach-mark-fade', 'mint-coach-mark-simple')

    destroyEvents()
    destroyOverlay()
    destroyHighlight()
    destroyEmitter()

    resetState()
    isActive.value = false
    currentStepIndex.value = undefined

    if (activeElement && activeStep && coachMark) {
      const isActiveDummyElement = activeElement.id === 'mint-coach-mark-dummy-element'

      if (onDeselected) {
        onDeselected(isActiveDummyElement ? undefined : activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        })
      }

      if (onDestroyed) {
        onDestroyed(isActiveDummyElement ? undefined : activeElement, activeStep, {
          config: getConfig(),
          state: getState(),
          coachMark
        })
      }
    }

    if (activeOnDestroyed) {
      (activeOnDestroyed as HTMLElement).focus()
    }
  }

  // Create the coach mark API
  const api: CoachMarkInstance = {
    isActive: () => getState('isInitialized') || false,
    refresh: refreshActiveHighlight,
    start: (stepIndex: number = 0) => {
      init()
      startStep(stepIndex)
    },
    setConfig: configure,
    setSteps: (steps: CoachMarkStep[]) => {
      resetState()
      configure({
        ...getConfig(),
        steps
      })
    },
    getConfig,
    getState,
    getActiveIndex: () => getState('activeIndex'),
    isFirstStep: () => getState('activeIndex') === 0,
    isLastStep: () => {
      const steps = getConfig('steps') || []
      const activeIndex = getState('activeIndex')
      return activeIndex !== undefined && activeIndex === steps.length - 1
    },
    getActiveStep: () => getState('currentActiveStep'),
    getActiveElement: () => getState('currentActiveElement'),
    getPreviousElement: () => getState('internalPreviousElement'),
    getPreviousStep: () => getState('internalPreviousStep'),
    moveNext,
    movePrevious,
    moveTo,
    skipTour,
    hasNextStep: () => {
      const steps = getConfig('steps') || []
      const activeIndex = getState('activeIndex')
      return activeIndex !== undefined && !!steps[activeIndex + 1]
    },
    hasPreviousStep: () => {
      const steps = getConfig('steps') || []
      const activeIndex = getState('activeIndex')
      return activeIndex !== undefined && !!steps[activeIndex - 1]
    },
    highlight: (step: CoachMarkStep) => {
      init()
      highlight({
        ...step,
        popover: step.popover
          ? {
              showButtons: [],
              showProgress: false,
              progressText: '1 / 1',
              ...step.popover!
            }
          : undefined
      })
    },
    destroy: () => {
      destroy(false)
    }
  }

  setCurrentCoachMark(api)

  return {
    // Coach mark API
    ...api,

    // Reactive state
    isActive,
    currentStepIndex,

    // Internal methods for component use
    init,
    destroy
  }
}
