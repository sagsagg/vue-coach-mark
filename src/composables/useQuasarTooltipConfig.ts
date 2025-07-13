/**
 * Quasar QTooltip configuration composable
 *
 * Pure functions for QTooltip positioning, styling, and configuration logic
 * extracted from QuasarCoachMark component for better maintainability.
 */

import type { QTooltipProps } from 'quasar';
import type { CoachMarkStep, CoachMarkConfig } from '../types';
import { getEffectivePadding } from '../utils';

/**
 * Parameters for calculating QTooltip anchor position
 */
export type GetQuasarAnchorParams = {
  readonly currentStep: CoachMarkStep | undefined;
};

/**
 * Parameters for calculating QTooltip self position
 */
export type GetQuasarSelfParams = {
  readonly currentStep: CoachMarkStep | undefined;
};

/**
 * Parameters for calculating QTooltip offset
 */
export type GetQuasarOffsetParams = {
  readonly currentStep: CoachMarkStep | undefined;
  readonly config: CoachMarkConfig;
};

/**
 * Parameters for generating QTooltip CSS class
 */
export type GetQuasarClassParams = {
  readonly currentStep: CoachMarkStep | undefined;
};

/**
 * QTooltip configuration defaults
 */
const DEFAULT_ANCHOR: QTooltipProps['anchor'] = 'bottom middle';
const DEFAULT_SELF: QTooltipProps['self'] = 'top middle';
const DEFAULT_OFFSET: QTooltipProps['offset'] = [0, 10];
const DEFAULT_CLASS = '';

/**
 * Pure function to calculate QTooltip anchor position
 */
export const getQuasarAnchor = ({
  currentStep
}: GetQuasarAnchorParams): QTooltipProps['anchor'] => {
  return currentStep?.popover?.tooltip?.anchor || DEFAULT_ANCHOR;
};

/**
 * Pure function to calculate QTooltip self position
 */
export const getQuasarSelf = ({
  currentStep
}: GetQuasarSelfParams): QTooltipProps['self'] => {
  return currentStep?.popover?.tooltip?.self || DEFAULT_SELF;
};

/**
 * Pure function to calculate QTooltip CSS class
 */
export const getQuasarClass = ({
  currentStep
}: GetQuasarClassParams): string => {
  return currentStep?.popover?.tooltip?.class || DEFAULT_CLASS;
};

/**
 * Pure function to calculate QTooltip offset with padding support
 */
export const getQuasarOffset = ({
  currentStep,
  config
}: GetQuasarOffsetParams): QTooltipProps['offset'] => {
  // Get effective padding value (used for both step-specific and calculated offsets)
  const globalPadding = config.padding || 10;
  const effectivePadding = getEffectivePadding(
    currentStep?.popover?.padding,
    globalPadding,
    10
  );

  // Check for step-specific offset first
  const stepOffset = currentStep?.popover?.tooltip?.offset;
  if (stepOffset) {
    // Add effective padding to step-specific offset for consistent spacing
    return [stepOffset[0], stepOffset[1] + effectivePadding];
  }

  // Fall back to calculated offset based on padding
  const baseOffset = DEFAULT_OFFSET[1]; // Use default offset as base

  // Add padding to the base offset for proper spacing
  const totalOffset = baseOffset + effectivePadding;

  return [DEFAULT_OFFSET[0], totalOffset];
};
