/**
 * Pure position calculation utility functions
 * These functions are stateless and don't use Vue reactivity
 */

/**
 * Calculate center position of an element
 */
export const calculateElementCenter = (element: Element): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
};

/**
 * Calculate position with padding applied
 */
export const calculatePositionWithPadding = (
  rect: DOMRect,
  padding: number
): { x: number; y: number; width: number; height: number } => {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  };
};

/**
 * Get current scroll position
 */
export const getCurrentScrollPosition = (): { x: number; y: number } => {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
};


