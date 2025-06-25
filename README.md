# MintCoachMark

A modern Vue.js component library for creating guided tours and coach marks, inspired by driver.js.

## 🎯 Project Overview

MintCoachMark is a complete refactoring of the popular driver.js library into a modern Vue.js architecture. It maintains the same powerful functionality while leveraging Vue 3's Composition API, reactive system, and component-based architecture.

## ✨ Features

- 🎯 **Vue 3 Composition API** - Built with modern Vue.js patterns
- 🧩 **Composable Architecture** - Reusable composables for state management
- 🎨 **Highly Customizable** - CSS variables, slots, and theming support
- 📱 **Responsive Design** - Works seamlessly on all screen sizes
- ♿ **Accessibility First** - Built with ARIA attributes and keyboard navigation
- 🔧 **Full TypeScript Support** - Complete type definitions included
- 🚀 **Lightweight & Fast** - Optimized bundle size and performance
- 🎪 **Same API Surface** - Drop-in replacement for driver.js users
- 🔄 **Reactive State** - Leverages Vue's reactivity system
- 🎨 **Custom Slots** - Flexible content customization

## 🏗️ Architecture

### Composables (Vue 3 Composition API)
- **`useCoachMark`** - Main orchestration composable
- **`useCoachMarkState`** - Reactive state management
- **`useCoachMarkConfig`** - Configuration management
- **`useCoachMarkEvents`** - Event handling and keyboard controls
- **`useOverlay`** - SVG overlay management
- **`useHighlight`** - Element highlighting and transitions

### Pure Utility Functions
- **Animation utilities** - Easing functions and interpolation
- **DOM utilities** - Element queries and manipulation
- **Geometry utilities** - Position calculations and collision detection

### Vue Components
- **`MintCoachMark`** - Main component with full tour functionality
- **`MintPopover`** - Reusable popover component with slots

## 📦 Installation

```bash
npm install mint-coach-mark
```

## 🚀 Quick Start

### Component-based Usage

```vue
<template>
  <div>
    <MintCoachMark
      v-model="showTour"
      :steps="steps"
      :config="config"
      @tour-complete="onTourComplete"
    />

    <button id="step1">Step 1</button>
    <button id="step2">Step 2</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MintCoachMark } from 'mint-coach-mark'
import 'mint-coach-mark/dist/style.css'

const showTour = ref(false)

const steps = [
  {
    element: '#step1',
    popover: {
      title: 'Welcome!',
      description: 'This is your first step.'
    }
  },
  {
    element: '#step2',
    popover: {
      title: 'Second Step',
      description: 'Here is the second step.'
    }
  }
]

const config = {
  animate: true,
  allowClose: true,
  showProgress: true
}

const onTourComplete = () => {
  console.log('Tour completed!')
}
</script>
```

### Composable-based Usage

```vue
<script setup>
import { useCoachMark } from 'mint-coach-mark'

const { drive, destroy, moveNext, movePrevious } = useCoachMark({
  steps: [
    {
      element: '#my-element',
      popover: {
        title: 'Hello!',
        description: 'This is a guided tour step.'
      }
    }
  ]
})

// Start tour
function startTour() {
  drive(0)
}
</script>
```

## 📚 Documentation

- **[Usage Guide](./docs/USAGE.md)** - Comprehensive usage documentation
- **[Examples](./examples/)** - Working examples and demos
- **[API Reference](./docs/API.md)** - Complete API documentation

## 🎨 Customization

### CSS Custom Properties

```css
:root {
  --mint-coach-mark-overlay-color: #000;
  --mint-coach-mark-overlay-opacity: 0.7;
  --mint-coach-mark-popover-bg: #ffffff;
  --mint-coach-mark-popover-color: #333333;
  --mint-coach-mark-button-bg: #007bff;
  --mint-coach-mark-button-color: #ffffff;
}
```

### Custom Slots

```vue
<MintCoachMark :steps="steps">
  <template #title="{ step, index }">
    <h3>{{ step.popover.title }} ({{ index + 1 }})</h3>
  </template>

  <template #content="{ step }">
    <div v-html="step.popover.description" />
  </template>
</MintCoachMark>
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build

# Run tests
npm run test

# Type checking
npm run build:types
```

## 🤝 Migration from driver.js

MintCoachMark provides an intuitive API that's easy to migrate from driver.js:

```javascript
// driver.js (old)
import { driver } from 'driver.js'
const driverObj = driver({ steps })
driverObj.drive()

// MintCoachMark (new)
import { useCoachMark } from 'mint-coach-mark'
const coachMark = useCoachMark({ steps })
coachMark.start()
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

This project is inspired by and maintains compatibility with [driver.js](https://github.com/kamranahmedse/driver.js) by Kamran Ahmed. We thank the original authors for their excellent work.
