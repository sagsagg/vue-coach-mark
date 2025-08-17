<template>
  <Teleport to="body">
    <!--
      Simplified overlay with CSS-based SVG path morphing animations.
      No Vue Transition wrapper needed - animations handled purely in CSS.
    -->
    <svg
      v-if="visible"
      :id="overlayId"
      ref="svgRef"
      :class="computedClasses"
      :style="computedStyles"
      :aria-hidden="ariaHidden"
      :role="role"
      :data-visible="visible"
      :data-animation-disabled="!animationEnabled"
      class="mint-coach-mark-overlay"
      @click="handleOverlayClick"
      @keydown="handleKeydown"
    >
      <path
        :id="pathId"
        :d="effectivePathData"
        :fill="computedOverlayColor"
        :fill-opacity="computedOverlayOpacity"
        :fill-rule="fillRule"
        :style="computedPathStyles"
        class="mint-coach-mark-overlay-path"
        @animationstart="handleAnimationStart"
        @animationend="handleAnimationEnd"
        @transitionstart="handleAnimationStart"
        @transitionend="handleAnimationEnd"
      />

      <!-- Custom overlay content slot -->
      <slot
        name="overlay-content"
        :stage="stage"
        :step="step"
        :step-index="stepIndex"
        :visible="visible"
        :is-active="isActive"
      />
    </svg>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type CSSProperties } from 'vue';
import { getEffectivePadding, getEffectiveRadius } from '../utils';
import type { StageDefinition, CoachMarkStep, CoachMarkConfig } from '../types';

// Props interface
interface MintCoachMarkOverlayProps {
  readonly visible: boolean;
  readonly stage?: StageDefinition;
  readonly step?: CoachMarkStep;
  readonly stepIndex?: number;
  readonly config?: CoachMarkConfig;
  readonly isActive?: boolean;
  readonly customClasses?: string | string[];
  readonly customStyles?: CSSProperties;
  readonly overlayId?: string;
  readonly pathId?: string;
  readonly transitionName?: string;
  readonly transitionDuration?: number | { enter: number; leave: number };
  readonly fillRule?: 'nonzero' | 'evenodd';
  readonly pathStyles?: CSSProperties;
  readonly clickable?: boolean;
  readonly focusable?: boolean;
  readonly ariaHidden?: boolean;
  readonly role?: string;
  readonly animationEnabled?: boolean;
}

const props = withDefaults(defineProps<MintCoachMarkOverlayProps>(), {
  visible: false,
  stepIndex: 0,
  config: () => ({}),
  isActive: false,
  customClasses: '',
  customStyles: () => ({}),
  overlayId: 'mint-coach-mark-overlay',
  pathId: 'mint-coach-mark-overlay-path',
  transitionName: 'mint-overlay-fade',
  transitionDuration: 300,
  fillRule: 'evenodd',
  pathStyles: () => ({}),
  clickable: true,
  focusable: false,
  ariaHidden: true,
  role: 'presentation',
  animationEnabled: true
});

// Emits interface
interface MintCoachMarkOverlayEmits {
  (e: 'show'): void;
  (e: 'hide'): void;
  (e: 'click', event: MouseEvent): void;
  (e: 'overlay-click', event: MouseEvent): void;
  (e: 'keydown', event: KeyboardEvent): void;
  (e: 'stage-update', stage: StageDefinition): void;
  (e: 'animation-start'): void;
  (e: 'animation-end'): void;
}

const emit = defineEmits<MintCoachMarkOverlayEmits>();

// Slots interface
interface MintCoachMarkOverlaySlots {
  'overlay-content'?: (scope: {
    stage: StageDefinition | undefined;
    step: CoachMarkStep | undefined;
    stepIndex: number | undefined;
    visible: boolean;
    isActive: boolean;
  }) => unknown;
}

defineSlots<MintCoachMarkOverlaySlots>();

// Template refs
const svgRef = ref<SVGSVGElement | null>(null);

// Computed properties for overlay styling
const computedOverlayColor = computed(() => {
  return props.config?.overlayColor || 'rgba(0, 0, 0, 0.7)';
});

const computedOverlayOpacity = computed(() => {
  return props.config?.overlayOpacity || 0.7;
});

const computedClasses = computed(() => {
  const classes = ['mint-coach-mark-overlay'];

  if (props.customClasses) {
    if (Array.isArray(props.customClasses)) {
      classes.push(...props.customClasses);
    } else {
      classes.push(props.customClasses);
    }
  }

  return classes;
});

// Animation state management
const isAnimating = ref(false);

// Computed properties for CSS-based animations
const animationDuration = computed(() => {
  if (!props.animationEnabled) return 0;

  if (typeof props.transitionDuration === 'number') {
    return props.transitionDuration;
  }

  // For object duration, use enter duration as default
  return props.transitionDuration?.enter || 300;
});

// Generate collapsed path for animation start/end states
const generateCollapsedPath = (): string => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;

  // Create a tiny circle in the center for collapsed state
  const outerPath = `M0,0 L${windowWidth},0 L${windowWidth},${windowHeight} L0,${windowHeight} Z`;
  const innerPath = `M${centerX},${centerY} L${centerX},${centerY} L${centerX},${centerY} L${centerX},${centerY} Z`;

  return `${outerPath} ${innerPath}`;
};

const computedStyles = computed((): CSSProperties => {
  const baseStyles: CSSProperties = {
    pointerEvents: props.clickable ? 'auto' : 'none',
    cursor: props.clickable ? 'auto' : 'default'
  };

  return {
    ...baseStyles,
    ...props.customStyles
  };
});

// Path generation function
const generateOverlayPath = (stage: StageDefinition): string => {
  const { x, y, width, height } = stage;
  
  // Get effective radius from step or config
  const globalRadius = props.config?.radius || 5;
  const effectiveRadius = getEffectiveRadius(
    props.step?.popover?.radius,
    globalRadius,
    5
  );
  
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Create path that covers entire screen with a rounded rectangle cutout
  const outerPath = `M0,0 L${windowWidth},0 L${windowWidth},${windowHeight} L0,${windowHeight} Z`;

  // Ensure radius doesn't exceed half of width or height
  const maxRadius = Math.min(width / 2, height / 2, effectiveRadius);

  // Inner cutout path (rounded rectangle)
  const innerPath = `M${x + maxRadius},${y} ` +
    `L${x + width - maxRadius},${y} ` +
    `Q${x + width},${y} ${x + width},${y + maxRadius} ` +
    `L${x + width},${y + height - maxRadius} ` +
    `Q${x + width},${y + height} ${x + width - maxRadius},${y + height} ` +
    `L${x + maxRadius},${y + height} ` +
    `Q${x},${y + height} ${x},${y + height - maxRadius} ` +
    `L${x},${y + maxRadius} ` +
    `Q${x},${y} ${x + maxRadius},${y} Z`;

  return `${outerPath} ${innerPath}`;
};

// Path generation with CSS animation support
const basePathData = computed(() => {
  if (!props.stage) {
    return generateCollapsedPath();
  }
  return generateOverlayPath(props.stage);
});

// Effective path data with animation state consideration
const effectivePathData = computed(() => {
  return basePathData.value;
});

// Computed styles for the path element with CSS animations
const computedPathStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {
    ...props.pathStyles
  };

  if (props.animationEnabled) {
    styles.transition = `d ${animationDuration.value}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
  }

  return styles;
});

// Event handlers
const handleOverlayClick = (event: MouseEvent): void => {
  if (!props.clickable) return;

  const target = event.target as Element;
  const svg = svgRef.value;
  const path = svg?.querySelector(`#${props.pathId}`);

  emit('click', event);

  if (target === svg || target === path) {
    emit('overlay-click', event);
  }
};

const handleKeydown = (event: KeyboardEvent): void => {
  emit('keydown', event);
};

// CSS animation event handlers
const handleAnimationStart = (): void => {
  isAnimating.value = true;
  emit('animation-start');
};

const handleAnimationEnd = (): void => {
  isAnimating.value = false;
  emit('animation-end');

  // Emit appropriate events based on visibility state
  if (props.visible) {
    emit('show');
  } else {
    emit('hide');
  }
};

// Utility function to track element and generate stage
const trackElement = (element: Element): StageDefinition => {
  const globalPadding = props.config?.padding || 10;
  const effectivePadding = getEffectivePadding(
    props.step?.popover?.padding,
    globalPadding,
    10
  );

  const rect = element.getBoundingClientRect();

  const stage: StageDefinition = {
    x: rect.x - effectivePadding,
    y: rect.y - effectivePadding,
    width: rect.width + effectivePadding * 2,
    height: rect.height + effectivePadding * 2
  };

  emit('stage-update', stage);
  return stage;
};

// Watch for visibility changes and emit events
watch(() => props.visible, (newVisible, oldVisible) => {
  if (newVisible && !oldVisible) {
    // Overlay is becoming visible
    nextTick(() => {
      // Focus management for accessibility
      if (props.focusable && svgRef.value) {
        svgRef.value.focus();
      }

      // Emit show event if animations are disabled
      if (!props.animationEnabled) {
        emit('show');
      }
    });
  } else if (!newVisible && oldVisible) {
    // Overlay is becoming hidden
    if (!props.animationEnabled) {
      emit('hide');
    }
  }
});

// Watch for stage changes to trigger path morphing
watch(() => props.stage, (newStage, oldStage) => {
  if (newStage && oldStage && props.animationEnabled) {
    // Stage is changing - CSS will handle the smooth transition
    isAnimating.value = true;
  }
});

// Lifecycle hooks removed - z-index now handled directly in CSS

// Expose public API for programmatic control
defineExpose({
  svgElement: svgRef,
  trackElement,
  generatePath: generateOverlayPath,
  refresh: () => {
    // Force reactivity update
    nextTick();
  }
});
</script>

<style scoped>
.mint-coach-mark-overlay {
  /* Base overlay styles with z-index */
  
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  /* Performance optimizations for smooth animations */
  will-change: auto;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.mint-coach-mark-overlay-path {
  /* CSS-based path morphing animations */
  transition-property: d, opacity;
  transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
  transition-duration: 300ms;
  /* Performance optimizations */
  will-change: d, opacity;
  vector-effect: non-scaling-stroke;
}

/* Animation states for appearance/disappearance */
.mint-coach-mark-overlay[data-visible="true"] .mint-coach-mark-overlay-path {
  opacity: 1;
}

.mint-coach-mark-overlay[data-visible="false"] .mint-coach-mark-overlay-path {
  opacity: 0;
}

/* Disable animations when not enabled */
.mint-coach-mark-overlay[data-animation-disabled="true"] .mint-coach-mark-overlay-path {
  transition: none !important;
}

/* Hardware acceleration for smooth morphing */
@supports (d: path('M0,0')) {
  .mint-coach-mark-overlay-path {
    /* Enhanced support for modern browsers with path() support */
    transform: translateZ(0);
  }
}

/* Fallback for browsers without CSS path morphing support */
@supports not (transition-property: d) {
  .mint-coach-mark-overlay-path {
    /* Fallback to opacity-only transitions */
    transition-property: opacity;
  }
}
</style>
