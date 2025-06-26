# 🔄 Element Retry Mechanism Demo

## **Quick Start**

1. **Navigate to the demo:**
   ```
   http://localhost:5173/retry-mechanism
   ```

2. **Explore the scenarios:**
   - API-dependent elements
   - Lazy-loaded components  
   - Animation-dependent elements
   - Conditional form elements
   - Global configuration examples

3. **Customize settings:**
   - Adjust retry attempts, delays, and backoff
   - Monitor real-time logs
   - Test different configurations

## **🎯 What You'll Learn**

### **Core Concepts**
- **When to use retry mechanisms** in modern web apps
- **How to configure retry settings** for different scenarios
- **Best practices for performance** and user experience
- **Debugging techniques** for retry-related issues

### **Practical Skills**
- Handling API-dependent content
- Managing lazy-loaded components
- Synchronizing with CSS animations
- Implementing conditional UI elements
- Configuring global vs step-level settings

## **🚀 Demo Features**

### **Interactive Configuration**
- ⚙️ Real-time retry settings adjustment
- 📊 Live performance monitoring
- 🔍 Detailed activity logging
- 🎮 Multiple demo scenarios

### **Real-World Scenarios**
- 🌐 **API Integration:** Simulates real API call delays
- 🔄 **Lazy Loading:** Dynamic component loading patterns
- ✨ **Animations:** CSS animation synchronization
- 📝 **Forms:** Conditional field visibility
- 🌍 **Global Config:** Configuration inheritance patterns

### **Educational Tools**
- 📋 **Activity Logs:** Real-time retry monitoring
- 🧪 **Test Component:** Simple verification tool
- 📖 **Code Examples:** Copy-paste ready snippets
- 💡 **Best Practices:** Performance optimization tips

## **🔧 Technical Implementation**

### **Retry Configuration Options**
```typescript
interface RetryConfig {
  enabled?: boolean              // Enable/disable retry
  maxAttempts?: number          // Max retry attempts (default: 5)
  delay?: number                // Delay between attempts (default: 1000ms)
  exponentialBackoff?: boolean  // Use exponential backoff (default: false)
  onRetry?: (attempt: number, step: CoachMarkStep) => void
  onMaxAttemptsReached?: (step: CoachMarkStep) => void
}
```

### **Usage Patterns**
```typescript
// Boolean configuration
retry: true   // Uses defaults
retry: false  // Disables retry

// Object configuration
retry: {
  maxAttempts: 3,
  delay: 2000,
  exponentialBackoff: true,
  onRetry: (attempt, step) => {
    console.log(`Retry ${attempt} for ${step.element}`)
  }
}

// Global configuration
const coachMark = new MintCoachMark({
  retry: { maxAttempts: 5, delay: 1000 }, // Global default
  steps: [
    { element: '#el1', retry: true },      // Uses global
    { element: '#el2', retry: false },     // Disables retry
    { element: '#el3', retry: { maxAttempts: 2 } } // Overrides global
  ]
})
```

## **📊 Performance Guidelines**

### **Recommended Settings by Use Case**

| Scenario | Max Attempts | Delay | Exponential Backoff | Notes |
|----------|-------------|-------|-------------------|-------|
| **CSS Animations** | 6 | 300ms | No | Fast, predictable timing |
| **API Calls** | 8 | 1500ms | Yes | Network variability |
| **User Interactions** | 5 | 500ms | No | Responsive feel |
| **Route Changes** | 10 | 800ms | No | SPA navigation |
| **Form Validation** | 4 | 1000ms | No | User input processing |

### **Memory & Performance**
- ✅ **Minimal overhead** per retry operation
- ✅ **Automatic cleanup** on completion/cancellation  
- ✅ **No memory leaks** from cancelled operations
- ✅ **Efficient timeout management**

## **🎨 Best Practices**

### **1. Choose Appropriate Limits**
```typescript
// ✅ Good: Balanced approach
retry: { maxAttempts: 5, delay: 1000 }

// ❌ Avoid: Excessive retries
retry: { maxAttempts: 50, delay: 100 }
```

### **2. Provide User Feedback**
```typescript
retry: {
  maxAttempts: 3,
  delay: 2000,
  onRetry: (attempt) => {
    showToast(`Loading... (${attempt}/3)`)
  },
  onMaxAttemptsReached: () => {
    showError('Content failed to load')
  }
}
```

### **3. Use Exponential Backoff for Network Requests**
```typescript
retry: {
  maxAttempts: 6,
  delay: 1000,
  exponentialBackoff: true // 1s, 2s, 4s, 8s, 16s, 30s (capped)
}
```

## **🔍 Debugging Tips**

### **1. Monitor Retry Logs**
- Use the activity logs panel
- Watch for timing patterns
- Identify optimization opportunities

### **2. Test Edge Cases**
- Slow network conditions
- Failed API responses
- Animation interruptions
- User interaction timing

### **3. Optimize Based on Data**
- Adjust delays based on actual load times
- Reduce attempts for non-critical elements
- Use exponential backoff for network requests

## **🌟 Advanced Use Cases**

### **E-commerce Product Tours**
```typescript
{
  element: '[data-product-details]',
  retry: {
    maxAttempts: 8,
    delay: 1500,
    exponentialBackoff: true,
    onMaxAttemptsReached: () => {
      analytics.track('product_load_failed')
      showFallbackContent()
    }
  }
}
```

### **Dashboard Widget Loading**
```typescript
{
  element: '.analytics-widget',
  retry: {
    maxAttempts: 5,
    delay: 2000,
    onRetry: (attempt) => {
      updateProgressBar(attempt / 5 * 100)
    }
  }
}
```

### **Progressive Form Disclosure**
```typescript
{
  element: '#conditional-field',
  retry: {
    maxAttempts: 4,
    delay: 800,
    onRetry: () => {
      highlightTriggerElement()
    }
  }
}
```

## **🚀 Getting Started in Your App**

### **1. Install the Library**
```bash
npm install mint-coach-mark
```

### **2. Basic Implementation**
```typescript
import { MintCoachMark } from 'mint-coach-mark'

const steps = [
  {
    element: '#dynamic-element',
    retry: {
      maxAttempts: 5,
      delay: 1000,
      onRetry: (attempt) => console.log(`Retry ${attempt}`)
    },
    popover: {
      title: 'Dynamic Content',
      description: 'This element loads asynchronously'
    }
  }
]

const coachMark = new MintCoachMark({ steps })
coachMark.start()
```

### **3. Advanced Configuration**
```typescript
const coachMark = new MintCoachMark({
  // Global retry configuration
  retry: {
    maxAttempts: 5,
    delay: 1000,
    exponentialBackoff: false
  },
  steps,
  animate: true,
  onHighlightStarted: (element, step) => {
    console.log('Highlighting:', step.element)
  }
})
```

## **📚 Additional Resources**

- **[Full API Documentation](../RETRY_MECHANISM.md)**
- **[Implementation Guide](../README.md)**
- **[Performance Best Practices](../docs/performance.md)**
- **[Troubleshooting Guide](../docs/troubleshooting.md)**

---

**Ready to build better user experiences?** 🎯 The retry mechanism makes vue-coach-mark perfect for modern, dynamic web applications!
