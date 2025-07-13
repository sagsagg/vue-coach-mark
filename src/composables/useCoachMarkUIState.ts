/**
 * Coach Mark UI state management composable
 *
 * Pure function composable that returns UI state calculation functions
 * extracted from QuasarCoachMark component for better maintainability.
 */

import type {
  CoachMarkStep,
  CoachMarkConfig,
  PopoverCommunication
} from '../types';

/**
 * Parameters for checking if current step is the last step
 */
export type CheckIsLastStepParams = {
  readonly currentStepIndex: number | undefined;
  readonly totalSteps: number;
};

/**
 * Parameters for determining which buttons to show
 */
export type GetShowButtonsParams = {
  readonly currentStep: CoachMarkStep | undefined;
};

/**
 * Parameters for checking if skip button should be shown
 */
export type CheckShouldShowSkipButtonParams = {
  readonly config: CoachMarkConfig;
  readonly showButtons: string[];
};

/**
 * Parameters for generating progress text
 */
export type GetProgressTextParams = {
  readonly currentStepIndex: number | undefined;
  readonly totalSteps: number;
};

/**
 * Parameters for checking if tooltip should be shown
 */
export type CheckShouldShowTooltipParams = {
  readonly currentStep: CoachMarkStep | undefined;
  readonly popoverState: PopoverCommunication;
  readonly isTransitioning: boolean;
};

/**
 * Pure function to check if current step is the last step
 */
export const checkIsLastStep = ({
  currentStepIndex,
  totalSteps
}: CheckIsLastStepParams): boolean => {
  return currentStepIndex !== undefined && currentStepIndex >= totalSteps - 1;
};

/**
 * Pure function to get button configuration for current step
 */
export const getShowButtons = ({
  currentStep
}: GetShowButtonsParams): string[] => {
  return currentStep?.popover?.showButtons || ['next', 'previous', 'close', 'skip'];
};

/**
 * Pure function to check if skip button should be shown
 */
export const checkShouldShowSkipButton = ({
  config,
  showButtons
}: CheckShouldShowSkipButtonParams): boolean => {
  // Check if skip is in the buttons array
  if (!showButtons.includes('skip')) {
    return false;
  }

  // Check global configuration (allowSkip property)
  if (config.allowSkip !== undefined) {
    return config.allowSkip;
  }

  // Default to true if skip is in buttons
  return true;
};

/**
 * Pure function to generate progress text for current step
 */
export const getProgressText = ({
  currentStepIndex,
  totalSteps
}: GetProgressTextParams): string => {
  if (currentStepIndex !== undefined) {
    return `${currentStepIndex + 1} / ${totalSteps}`;
  }

  return '';
};

/**
 * Pure function to check if tooltip should be shown
 */
export const checkShouldShowTooltip = ({
  currentStep,
  popoverState,
  isTransitioning
}: CheckShouldShowTooltipParams): boolean => {
  // Don't show during transitions
  if (isTransitioning) {
    return false;
  }

  // Basic visibility requirements
  const hasBasicRequirements = popoverState.visible && popoverState.targetElement;

  if (!hasBasicRequirements) {
    return false;
  }

  // Ensure we have valid step data to prevent showing stale content
  const hasValidStepData = popoverState.step &&
                          currentStep &&
                          popoverState.step.element === currentStep.element;

  return !!hasValidStepData;
};

/**
 * Return type for useCoachMarkUIState pure function composable
 */
export type UseCoachMarkUIStateReturn = {
  readonly checkIsLastStep: (params: CheckIsLastStepParams, config?: CoachMarkConfig) => boolean;
  readonly getShowButtons: (params: GetShowButtonsParams, config?: CoachMarkConfig) => string[];
  readonly checkShouldShowSkipButton: (params: CheckShouldShowSkipButtonParams, config?: CoachMarkConfig) => boolean;
  readonly getProgressText: (params: GetProgressTextParams, config?: CoachMarkConfig) => string;
  readonly checkShouldShowTooltip: (params: CheckShouldShowTooltipParams, config?: CoachMarkConfig) => boolean;
};

/**
 * Create UI state management pure functions
 *
 * @returns Pure UI state calculation functions
 */
export const useCoachMarkUIState = (): UseCoachMarkUIStateReturn => {
  return {
    checkIsLastStep: (params: CheckIsLastStepParams, _config?: CoachMarkConfig) =>
      checkIsLastStep(params),

    getShowButtons: (params: GetShowButtonsParams, _config?: CoachMarkConfig) =>
      getShowButtons(params),

    checkShouldShowSkipButton: (params: CheckShouldShowSkipButtonParams, _config?: CoachMarkConfig) =>
      checkShouldShowSkipButton(params),

    getProgressText: (params: GetProgressTextParams, _config?: CoachMarkConfig) =>
      getProgressText(params),

    checkShouldShowTooltip: (params: CheckShouldShowTooltipParams, _config?: CoachMarkConfig) =>
      checkShouldShowTooltip(params)
  };
};
