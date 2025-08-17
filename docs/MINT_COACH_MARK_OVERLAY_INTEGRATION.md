# MintCoachMarkOverlay Integration Guide

This document explains the integration of the new `MintCoachMarkOverlay.vue` component into `QuasarCoachMark.vue`, replacing the previous composable-based overlay approach with a direct component-based solution.

## Overview

The `MintCoachMarkOverlay.vue` component provides a coach-mark-specific overlay that integrates seamlessly with the QuasarCoachMark component, offering better customization capabilities while maintaining backward compatibility.

## Architecture Changes

### Before: Composable-Based Approach
```typescript
// Previous approach using useOverlay composable
const { createOverlay, updateOverlay, destroyOverlay } = useOverlay();
```

### After: Component-Based Approach
```vue
<template>
  <div class="quasar-coach-mark">
    <!-- Direct overlay component integration -->
    <MintCoachMarkOverlay
      :visible="shouldShowOverlay"
      :stage="overlayStage"
      :step="currentStep"
      :config="getConfig()"
      @overlay-click="handleOverlayClick"
    />
    
    <!-- Popover component -->
    <MintCoachMarkPopover />
  </div>
</template>
```

## Component Features

### MintCoachMarkOverlay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `false` | Controls overlay visibility |
| `stage` | `StageDefinition` | `undefined` | Position and size of the cutout |
| `step` | `CoachMarkStep` | `undefined` | Current coach mark step |
| `stepIndex` | `number` | `0` | Current step index |
| `config` | `CoachMarkConfig` | `{}` | Coach mark configuration |
| `isActive` | `boolean` | `false` | Whether coach mark is active |
| `customClasses` | `string \| string[]` | `''` | Additional CSS classes |
| `customStyles` | `CSSProperties` | `{}` | Additional CSS styles |
| `clickable` | `boolean` | `true` | Allow click interactions |
| `animationEnabled` | `boolean` | `true` | Enable/disable animations |

### MintCoachMarkOverlay Events

| Event | Payload | Description |
|-------|---------|-------------|
| `show` | `void` | Emitted when overlay becomes visible |
| `hide` | `void` | Emitted when overlay becomes hidden |
| `overlay-click` | `MouseEvent` | Emitted when clicking overlay |
| `stage-update` | `StageDefinition` | Emitted when stage is updated |

### MintCoachMarkOverlay Slots

| Slot | Props | Description |
|------|-------|-------------|
| `overlay-content` | `{ stage, step, stepIndex, visible, isActive }` | Custom content to render inside the SVG |

## Integration Details

### Computed Properties

The QuasarCoachMark component now includes overlay-specific computed properties:

```typescript
// Overlay visibility logic
const shouldShowOverlay = computed(() => {
  return Boolean(
    isActive.value && 
    currentStep.value && 
    popoverState.value.targetElement &&
    !isTransitioning.value
  );
});

// Stage calculation from target element
const overlayStage = computed(() => {
  const targetElement = popoverState.value.targetElement;
  if (!targetElement || !currentStep.value) {
    return undefined;
  }

  const rect = targetElement.getBoundingClientRect();
  const globalPadding = 10;
  const effectivePadding = getEffectivePadding(
    currentStep.value.popover?.padding,
    globalPadding,
    10
  );

  return {
    x: rect.x - effectivePadding,
    y: rect.y - effectivePadding,
    width: rect.width + effectivePadding * 2,
    height: rect.height + effectivePadding * 2
  };
});
```

### Event Handlers

New overlay-specific event handlers:

```typescript
// Handle overlay click behavior
const handleOverlayClick = (event: MouseEvent): void => {
  emit('overlay-click', event);
  
  const overlayClickBehavior = getConfig().overlayClickBehavior;
  
  if (getConfig().allowClose && overlayClickBehavior === 'close') {
    stopTour();
    return;
  }
  
  if (overlayClickBehavior === 'nextStep') {
    moveNext({ autoScroll: true });
  }
};

// Overlay lifecycle handlers
const handleOverlayShow = (): void => {
  emit('overlay-show');
};

const handleOverlayHide = (): void => {
  emit('overlay-hide');
};
```

## Customization Examples

### Basic Usage
```vue
<template>
  <QuasarCoachMark
    v-model="showTour"
    :steps="tourSteps"
    :config="tourConfig"
    @overlay-click="handleOverlayClick"
  />
</template>
```

### Custom Overlay Content
```vue
<template>
  <QuasarCoachMark
    v-model="showTour"
    :steps="tourSteps"
  >
    <template #overlay-content="{ stage, step, stepIndex }">
      <!-- Custom SVG content -->
      <text
        :x="stage?.x + 10"
        :y="stage?.y - 10"
        fill="white"
        font-size="14"
      >
        Step {{ stepIndex + 1 }}: {{ step?.popover?.title }}
      </text>
      
      <!-- Custom shapes -->
      <circle
        :cx="stage?.x + stage?.width + 20"
        :cy="stage?.y + 10"
        r="5"
        fill="red"
      />
    </template>
  </QuasarCoachMark>
</template>
```

### Advanced Styling
```vue
<template>
  <QuasarCoachMark
    v-model="showTour"
    :steps="tourSteps"
    :config="{
      overlayColor: '#1a1a1a',
      overlayOpacity: 0.9,
      radius: 12,
      animate: true
    }"
  />
</template>
```

## Benefits

### 1. Better Customization
- **Direct component access**: Easy to customize overlay appearance and behavior
- **Slot support**: Add custom SVG content to the overlay
- **Props-based configuration**: Type-safe configuration options

### 2. Improved Developer Experience
- **TypeScript support**: Full type safety for props, events, and slots
- **Vue 3 best practices**: Uses `<script setup>` and Composition API
- **Better debugging**: Component-based architecture is easier to debug

### 3. Enhanced Performance
- **Optimized rendering**: Only renders when needed
- **Efficient reactivity**: Uses computed properties for optimal updates
- **Teleport usage**: Renders overlay in document body for better z-index handling

### 4. Backward Compatibility
- **Same external API**: QuasarCoachMark component API remains unchanged
- **Event compatibility**: All existing events continue to work
- **Configuration compatibility**: Existing configuration options are preserved

## Migration Impact

### For End Users
- **No changes required**: Existing QuasarCoachMark usage continues to work
- **New customization options**: Can now use overlay-content slot for custom content
- **New events**: Can listen to overlay-specific events (overlay-show, overlay-hide)

### For Developers
- **Component-based architecture**: Easier to extend and customize
- **Better testing**: Components are easier to test than composables
- **Improved maintainability**: Clear separation of concerns

## Technical Implementation

### Component Structure
```
QuasarCoachMark.vue
├── MintCoachMarkOverlay.vue (NEW)
│   ├── SVG overlay with cutout
│   ├── Custom content slots
│   └── Event handling
└── MintCoachMarkPopover.vue
    ├── QTooltip integration
    ├── Step content
    └── Navigation buttons
```

### State Management
- **Overlay visibility**: Computed from coach mark state
- **Stage calculation**: Reactive to target element changes
- **Event coordination**: Proper event bubbling and handling

### Performance Optimizations
- **Conditional rendering**: Overlay only renders when needed
- **Efficient updates**: Uses Vue's reactivity system optimally
- **Memory management**: Proper cleanup on component unmount

## Future Enhancements

The component-based approach enables future enhancements:

1. **Animation system**: Custom transition effects
2. **Multiple overlays**: Support for complex highlighting scenarios
3. **Accessibility improvements**: Better screen reader support
4. **Theme system**: Predefined overlay themes
5. **Plugin architecture**: Extensible overlay behaviors

## Conclusion

The integration of `MintCoachMarkOverlay.vue` into `QuasarCoachMark.vue` represents a significant improvement in the library's architecture, providing better customization capabilities while maintaining full backward compatibility. The component-based approach aligns with Vue 3 best practices and provides a solid foundation for future enhancements.
