/**
 * Configuration management composable for MintCoachMark
 * Manages reactive configuration with defaults
 */

import { reactive, computed, type ComputedRef } from 'vue';
import type { CoachMarkConfig, CoachMarkInstance } from '../types';

// Default configuration
const defaultConfig: Required<Omit<CoachMarkConfig, 'steps' | 'retry' | 'onHighlightStarted' | 'onHighlighted' | 'onDeselected' | 'onDestroyStarted' | 'onDestroyed' | 'onNextClick' | 'onPrevClick' | 'onCloseClick' | 'onSkipClick' | 'onPopoverRender'>> = {
  animate: true,
  overlayColor: '#000',
  overlayOpacity: 0.7,
  smoothScroll: false,
  allowClose: true,
  overlayClickBehavior: 'close',
  padding: 10,
  radius: 5,
  disableActiveInteraction: false,
  keyboardControl: true,
  allowKeyboardControl: true,
  popoverClass: '',
  popoverOffset: 10,
  showButtons: ['next', 'previous', 'close'],
  disableButtons: [],
  showProgress: false,
  progressText: '',
  nextBtnText: 'Next',
  prevBtnText: 'Previous',
  doneBtnText: 'Done',
  skipBtnText: 'Skip Tour',
  allowSkip: true
};

// Global configuration instance
const globalConfig = reactive<CoachMarkConfig>({ ...defaultConfig });

// Current coach mark instance
let currentCoachMark: CoachMarkInstance | null = null;

export const useCoachMarkConfig = () => {
  /**
   * Configure the coach mark with new options
   */
  const configure = (config: CoachMarkConfig = {}): void => {
    // Merge with defaults and existing config
    Object.assign(globalConfig, defaultConfig, config);
  };

  /**
   * Get configuration value(s)
   */
  function getConfig(): CoachMarkConfig;
  function getConfig<K extends keyof CoachMarkConfig>(key: K): CoachMarkConfig[K];
  function getConfig<K extends keyof CoachMarkConfig>(key?: K): CoachMarkConfig | CoachMarkConfig[K] {
    return key ? globalConfig[key] : globalConfig;
  }

  /**
   * Set current coach mark instance
   */
  const setCurrentCoachMark = (coachMark: CoachMarkInstance): void => {
    currentCoachMark = coachMark;
  };

  /**
   * Get current coach mark instance
   */
  const getCurrentCoachMark = (): CoachMarkInstance | null => {
    return currentCoachMark;
  };

  // Computed properties for commonly used config values
  const animate: ComputedRef<boolean> = computed(() => globalConfig.animate ?? true);
  
  const allowClose: ComputedRef<boolean> = computed(() => globalConfig.allowClose ?? true);
  
  const overlayClickBehavior: ComputedRef<'close' | 'nextStep'> = computed(
    () => globalConfig.overlayClickBehavior ?? 'close'
  );
  
  // Padding and radius options
  const padding: ComputedRef<number | string> = computed(() =>
    globalConfig.padding ?? 10
  );

  const radius: ComputedRef<number | string> = computed(() =>
    globalConfig.radius ?? 5
  );
  
  const overlayColor: ComputedRef<string> = computed(() => globalConfig.overlayColor ?? '#000');
  
  const overlayOpacity: ComputedRef<number> = computed(() => globalConfig.overlayOpacity ?? 0.7);
  
  const smoothScroll: ComputedRef<boolean> = computed(() => globalConfig.smoothScroll ?? false);
  
  const allowKeyboardControl: ComputedRef<boolean> = computed(
    () => globalConfig.allowKeyboardControl ?? true
  );
  
  const showProgress: ComputedRef<boolean> = computed(() => globalConfig.showProgress ?? false);
  
  const progressText: ComputedRef<string> = computed(
    () => globalConfig.progressText ?? ''
  );
  
  const steps: ComputedRef<CoachMarkConfig['steps']> = computed(() => globalConfig.steps);

  return {
    // Configuration management
    configure,
    getConfig,
    setCurrentCoachMark,
    getCurrentCoachMark,

    // Reactive config
    config: globalConfig,
    
    // Computed properties
    animate,
    allowClose,
    overlayClickBehavior,
    padding,
    radius,
    overlayColor,
    overlayOpacity,
    smoothScroll,
    allowKeyboardControl,
    showProgress,
    progressText,
    steps
  };
};
