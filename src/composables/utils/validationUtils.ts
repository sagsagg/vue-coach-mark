/**
 * Pure validation utility functions
 * These functions are stateless and don't use Vue reactivity
 */

import type { CoachMarkStep } from '../../types'

/**
 * Validate if an element is a valid DOM element
 */
export const isValidElement = (element: unknown): element is Element => {
  return element instanceof Element && element.nodeType === Node.ELEMENT_NODE
}

/**
 * Validate if a step object has the required properties
 */
export const isValidStep = (step: unknown): step is CoachMarkStep => {
  return (
    typeof step === 'object' &&
    step !== null &&
    ('element' in step || 'popover' in step)
  )
}

/**
 * Type guard for DOM elements
 */
export const isElement = (element: unknown): element is Element => {
  return element instanceof Element
}

/**
 * Type guard for HTML elements
 */
export const isHTMLElement = (element: unknown): element is HTMLElement => {
  return element instanceof HTMLElement
}

/**
 * Type guard for mouse events
 */
export const isMouseEvent = (event: Event): event is MouseEvent => {
  return event instanceof MouseEvent
}

/**
 * Type guard for pointer events
 */
export const isPointerEvent = (event: Event): event is PointerEvent => {
  return event instanceof PointerEvent
}

/**
 * Type guard for keyboard events
 */
export const isKeyboardEvent = (event: Event): event is KeyboardEvent => {
  return event instanceof KeyboardEvent
}

/**
 * Check if a target element should prevent default behavior
 */
export const shouldPreventDefault = (target: HTMLElement): boolean => {
  const tagName = target.tagName.toLowerCase()
  const interactiveElements = ['input', 'button', 'select', 'textarea', 'a']
  return !interactiveElements.includes(tagName)
}

/**
 * Type guard to check if an element is an SVGPathElement
 */
export const isSVGPathElement = (element: unknown): element is SVGPathElement => {
  return element instanceof SVGPathElement
}

/**
 * Type guard to check if an element is focusable (has focus method)
 */
export const isFocusableElement = (element: unknown): element is HTMLElement & { focus(): void } => {
  return isHTMLElement(element) && typeof element.focus === 'function'
}

/**
 * Type guard to check if a value is an AllowedButtons type
 */
export const isAllowedButton = (value: unknown): value is import('../../types').AllowedButtons => {
  return typeof value === 'string' &&
    ['next', 'previous', 'close', 'skip'].includes(value)
}

/**
 * Type guard to check if an error is an Error instance
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error
}
