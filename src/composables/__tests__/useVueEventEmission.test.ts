import { describe, it, expect, vi } from 'vitest';
import { getEnhancedConfig, createEventEmitters } from '../useVueEventEmission';
import type { CoachMarkConfig, CoachMarkStep, CoachMarkInstance } from '../../types';

describe('useVueEventEmission - Pure Functions with Proper TypeScript Types', () => {
  const mockSteps: CoachMarkStep[] = [
    { element: '#step1', popover: { title: 'Step 1' } },
    { element: '#step2', popover: { title: 'Step 2' } }
  ];

  const mockConfig: CoachMarkConfig = {
    allowKeyboardControl: true
  };

  const mockCoachMark = (): CoachMarkInstance => ({
    start: vi.fn(),
    destroy: vi.fn(),
    moveNext: vi.fn(),
    movePrevious: vi.fn(),
    moveTo: vi.fn(),
    setSteps: vi.fn(),
    setConfig: vi.fn(),
    skipTour: vi.fn(),
    hasNextStep: vi.fn(),
    hasPreviousStep: vi.fn(),
    highlight: vi.fn()
  });

  const mockEmit = vi.fn();

  describe('getEnhancedConfig', () => {
    it('should return enhanced config with lifecycle hooks', () => {
      const enhancedConfig = getEnhancedConfig({
        config: mockConfig,
        steps: mockSteps,
        currentStepIndex: 0,
        coachMark: mockCoachMark,
        emit: mockEmit
      });

      expect(enhancedConfig).toHaveProperty('onHighlightStarted');
      expect(enhancedConfig).toHaveProperty('onHighlighted');
      expect(enhancedConfig).toHaveProperty('onDeselected');
      expect(typeof enhancedConfig.onHighlightStarted).toBe('function');
    });

    it('should work without emit parameter (optional)', () => {
      const enhancedConfig = getEnhancedConfig({
        config: mockConfig,
        steps: mockSteps,
        currentStepIndex: 0,
        coachMark: mockCoachMark
        // emit is optional
      });

      expect(enhancedConfig).toHaveProperty('onHighlightStarted');
      expect(typeof enhancedConfig.onHighlightStarted).toBe('function');
      
      // Should not throw when called without emit
      expect(() => {
        const mockElement = document.createElement('div');
        enhancedConfig.onHighlightStarted?.(mockElement, mockSteps[0], {});
      }).not.toThrow();
    });

    it('should preserve original config properties', () => {
      const enhancedConfig = getEnhancedConfig({
        config: mockConfig,
        steps: mockSteps,
        currentStepIndex: 0,
        coachMark: mockCoachMark,
        emit: mockEmit
      });

      expect(enhancedConfig.allowKeyboardControl).toBe(true);
    });

    it('should emit Vue events when lifecycle hooks are called with emit', () => {
      const enhancedConfig = getEnhancedConfig({
        config: mockConfig,
        steps: mockSteps,
        currentStepIndex: 0,
        coachMark: mockCoachMark,
        emit: mockEmit
      });

      const mockElement = document.createElement('div');
      const mockStep = mockSteps[0];

      enhancedConfig.onHighlightStarted?.(mockElement, mockStep, {});

      expect(mockEmit).toHaveBeenCalledWith('step-highlight-started', expect.any(Object));
      expect(mockEmit).toHaveBeenCalledWith('highlight-started', mockElement, mockStep);
    });
  });

  describe('createEventEmitters', () => {
    it('should return event emitter functions', () => {
      const emitters = createEventEmitters({
        steps: mockSteps,
        currentStepIndex: 0,
        coachMark: mockCoachMark,
        emit: mockEmit
      });

      expect(emitters).toHaveProperty('emitStepInteractionEvent');
      expect(emitters).toHaveProperty('emitAsyncInteractionEvent');
      expect(emitters).toHaveProperty('emitAsyncDeselectedEvent');
      expect(typeof emitters.emitStepInteractionEvent).toBe('function');
    });

    it('should work without emit parameter (optional)', () => {
      const emitters = createEventEmitters({
        steps: mockSteps,
        currentStepIndex: 0,
        coachMark: mockCoachMark
        // emit is optional
      });

      expect(emitters).toHaveProperty('emitStepInteractionEvent');
      
      // Should not throw when called without emit
      expect(() => {
        emitters.emitStepInteractionEvent('step-next-clicked', mockSteps[0], 0);
      }).not.toThrow();
    });

    it('should emit step interaction events correctly with emit', () => {
      const emitters = createEventEmitters({
        steps: mockSteps,
        currentStepIndex: 0,
        coachMark: mockCoachMark,
        emit: mockEmit
      });

      emitters.emitStepInteractionEvent('step-next-clicked', mockSteps[0], 0);

      expect(mockEmit).toHaveBeenCalledWith('step-next-clicked', expect.objectContaining({
        step: mockSteps[0],
        stepIndex: 0,
        hasNextStep: true,
        hasPreviousStep: false
      }));
    });
  });
});
