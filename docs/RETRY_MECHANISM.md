# Element Retry Mechanism

## **Overview**

The vue-coach-mark library now includes a comprehensive retry mechanism for handling cases where target elements are not immediately available in the DOM. This is particularly useful for Single Page Applications with lazy-loaded components, dynamic content, or elements that appear after API calls.

## ✅ **Features**

### **1. Step-Level Retry Configuration**

Each step can specify its own retry behavior:

```typescript
const steps: CoachMarkStep[] = [
  {
    element: '#dynamic-button',
    retry: {
      maxAttempts: 3,
      delay: 2000,
      exponentialBackoff: true,
      onRetry: (attempt, step) => {
        console.log(`Retry attempt ${attempt} for step:`, step)
      },
      onMaxAttemptsReached: (step) => {
        console.warn('Max retry attempts reached for step:', step)
      }
    },
    popover: {
      title: 'Dynamic Element',
      description: 'This element loads asynchronously'
    }
  }
]
```

### **2. Global Retry Configuration**

Set default retry behavior for all steps:

```typescript
const config: CoachMarkConfig = {
  retry: {
    enabled: true,
    maxAttempts: 5,
    delay: 1000,
    exponentialBackoff: false
  },
  steps: [
    {
      element: '#element1',
      retry: true, // Uses global config
      popover: { title: 'Step 1' }
    },
    {
      element: '#element2',
      retry: false, // Disables retry for this step
      popover: { title: 'Step 2' }
    }
  ]
}
```

### **3. Flexible Configuration Options**

```typescript
// Boolean configuration
retry: true  // Uses default settings
retry: false // Disables retry

// Object configuration
retry: {
  enabled?: boolean              // Enable/disable retry (default: true)
  maxAttempts?: number          // Max retry attempts (default: 5)
  delay?: number                // Delay between attempts in ms (default: 1000)
  exponentialBackoff?: boolean  // Use exponential backoff (default: false)
  onRetry?: (attempt: number, step: CoachMarkStep) => void
  onMaxAttemptsReached?: (step: CoachMarkStep) => void
}
```

## ✅ **Use Cases**

### **1. Lazy-Loaded Components**

```typescript
const steps: CoachMarkStep[] = [
  {
    element: '#lazy-component-button',
    retry: {
      maxAttempts: 10,
      delay: 500,
      onRetry: (attempt) => {
        console.log(`Waiting for lazy component... attempt ${attempt}`)
      }
    },
    popover: {
      title: 'Lazy Component',
      description: 'This component loads after route navigation'
    }
  }
]
```

### **2. API-Dependent Elements**

```typescript
const steps: CoachMarkStep[] = [
  {
    element: '[data-user-profile]',
    retry: {
      maxAttempts: 8,
      delay: 1500,
      exponentialBackoff: true,
      onRetry: (attempt, step) => {
        console.log(`Waiting for user data to load... attempt ${attempt}`)
      },
      onMaxAttemptsReached: (step) => {
        console.error('User profile data failed to load')
        // Could trigger fallback behavior here
      }
    },
    popover: {
      title: 'User Profile',
      description: 'Your profile information appears here'
    }
  }
]
```

### **3. Animation-Dependent Elements**

```typescript
const steps: CoachMarkStep[] = [
  {
    element: '.animated-menu-item',
    retry: {
      maxAttempts: 6,
      delay: 300,
      onRetry: (attempt) => {
        console.log(`Waiting for animation to complete... attempt ${attempt}`)
      }
    },
    popover: {
      title: 'Menu Item',
      description: 'This item appears after the menu animation'
    }
  }
]
```

## ✅ **Advanced Features**

### **1. Exponential Backoff**

When `exponentialBackoff: true`, delays increase exponentially:
- Attempt 1: 1000ms
- Attempt 2: 2000ms  
- Attempt 3: 4000ms
- Attempt 4: 8000ms
- Attempt 5: 16000ms (capped at 30 seconds)

```typescript
retry: {
  maxAttempts: 5,
  delay: 1000,
  exponentialBackoff: true
}
```

### **2. Custom Retry Logic**

```typescript
retry: {
  maxAttempts: 3,
  delay: 2000,
  onRetry: (attempt, step) => {
    // Custom logic during retry
    if (attempt === 2) {
      // Trigger some action on second attempt
      triggerDataRefresh()
    }
  },
  onMaxAttemptsReached: (step) => {
    // Custom fallback behavior
    showErrorMessage('Element not found')
    skipToNextStep()
  }
}
```

### **3. Programmatic Control**

```typescript
import { useElementRetry } from 'vue-coach-mark'

const { resolveElementWithRetry, isRetrying, currentAttempt, cancelRetry } = useElementRetry()

// Manual element resolution with retry
const element = await resolveElementWithRetry('#my-element', {
  maxAttempts: 3,
  delay: 1000
})

// Check retry status
console.log('Is retrying:', isRetrying.value)
console.log('Current attempt:', currentAttempt.value)

// Cancel ongoing retry
cancelRetry()
```

## ✅ **Configuration Priority**

The retry configuration follows this priority order:

1. **Step-level configuration** (highest priority)
2. **Global configuration** 
3. **Default configuration** (lowest priority)

```typescript
// Default configuration
const DEFAULT_RETRY_CONFIG = {
  enabled: true,
  maxAttempts: 5,
  delay: 1000,
  exponentialBackoff: false
}
```

## ✅ **Error Handling**

### **1. Graceful Fallback**

When max attempts are reached, the library:
- Creates a dummy element for modal-like display
- Continues with the tour using the dummy element
- Calls `onMaxAttemptsReached` callback if provided

### **2. Cancellation**

Retry operations are automatically cancelled when:
- The tour is destroyed
- A new step is started
- `cancelRetry()` is called manually

## ✅ **Performance Considerations**

### **1. Reasonable Defaults**

Default settings are optimized for most use cases:
- Max 5 attempts prevents infinite loops
- 1-second delay balances responsiveness and performance
- No exponential backoff by default for predictable timing

### **2. Memory Management**

- Timeouts are properly cleaned up
- No memory leaks from cancelled operations
- Reactive state is reset between operations

## ✅ **TypeScript Support**

Full TypeScript support with proper type definitions:

```typescript
import type { 
  RetryConfig, 
  UseElementRetryOptions, 
  UseElementRetryReturn 
} from 'vue-coach-mark'

const retryConfig: RetryConfig = {
  maxAttempts: 3,
  delay: 1000,
  exponentialBackoff: true
}
```

## ✅ **Backward Compatibility**

The retry mechanism is fully backward compatible:
- Existing configurations work without changes
- Default behavior remains the same (no retry)
- No breaking changes to existing APIs

## ✅ **Best Practices**

### **1. Reasonable Retry Limits**

```typescript
// Good: Reasonable limits
retry: { maxAttempts: 5, delay: 1000 }

// Avoid: Excessive retries
retry: { maxAttempts: 50, delay: 100 }
```

### **2. Use Exponential Backoff for Network-Dependent Elements**

```typescript
// For API-dependent elements
retry: {
  maxAttempts: 6,
  delay: 1000,
  exponentialBackoff: true
}
```

### **3. Provide User Feedback**

```typescript
retry: {
  maxAttempts: 3,
  delay: 2000,
  onRetry: (attempt) => {
    showLoadingMessage(`Loading... (${attempt}/3)`)
  },
  onMaxAttemptsReached: () => {
    showErrorMessage('Content failed to load')
  }
}
```

The retry mechanism provides a robust solution for handling dynamic content while maintaining excellent performance and user experience.
