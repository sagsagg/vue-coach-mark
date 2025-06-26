# 🔄 Element Retry Mechanism Demo Guide

## **Overview**

The Retry Mechanism Demo showcases the powerful new retry functionality in vue-coach-mark that handles elements not immediately available in the DOM. This is essential for modern Single Page Applications with dynamic content, API calls, and lazy-loaded components.

## **🎯 Demo Scenarios**

### **1. API-Dependent Elements**
**Use Case:** Elements that appear after API calls complete
- **Simulates:** Real-world API data loading
- **Retry Config:** Standard retry with callback logging
- **Learning Points:**
  - How retry mechanism waits for API responses
  - Callback functions for monitoring retry attempts
  - Graceful handling of network delays

**Code Example:**
```typescript
{
  element: '#api-dependent-element',
  retry: {
    maxAttempts: 5,
    delay: 1000,
    onRetry: (attempt, step) => {
      console.log(`Retry attempt ${attempt} for ${step.element}`)
    }
  },
  popover: {
    title: 'API-Dependent Element',
    description: 'This element appears after an API call completes.'
  }
}
```

### **2. Lazy-Loaded Components**
**Use Case:** Components that load after user interaction
- **Simulates:** Dynamic component loading
- **Retry Config:** Higher attempt count with shorter delays
- **Learning Points:**
  - Handling user-triggered dynamic content
  - Optimized retry settings for interactive elements
  - Integration with component lifecycle

**Code Example:**
```typescript
{
  element: '#lazy-loaded-component',
  retry: {
    maxAttempts: 8,
    delay: 500,
    onRetry: (attempt) => console.log(`Loading component... ${attempt}/8`)
  }
}
```

### **3. Animation-Dependent Elements**
**Use Case:** Elements that appear after animations complete
- **Simulates:** CSS animations and transitions
- **Retry Config:** Shorter delays for animation timing
- **Learning Points:**
  - Synchronizing tours with CSS animations
  - Optimal retry timing for visual effects
  - Performance considerations

**Code Example:**
```typescript
{
  element: '#animated-element',
  retry: {
    maxAttempts: 6,
    delay: 300,
    exponentialBackoff: false
  }
}
```

### **4. Conditional Form Elements**
**Use Case:** Form fields that appear based on user input
- **Simulates:** Progressive form disclosure
- **Retry Config:** Medium retry settings
- **Learning Points:**
  - Handling conditional UI elements
  - Form-based dynamic content
  - User-driven content visibility

### **5. Global Configuration Demo**
**Use Case:** Demonstrating configuration priority
- **Simulates:** Mixed retry configurations
- **Learning Points:**
  - Global vs step-level configuration
  - Configuration inheritance and overrides
  - Best practices for large applications

## **⚙️ Configuration Options**

### **Interactive Controls**
The demo provides real-time configuration controls:

- **Enable Retry:** Toggle retry functionality on/off
- **Max Attempts:** Set maximum retry attempts (1-10)
- **Delay:** Configure delay between attempts (100-5000ms)
- **Exponential Backoff:** Enable/disable exponential delay increases

### **Configuration Priority**
1. **Step-level configuration** (highest priority)
2. **Global configuration**
3. **Default configuration** (lowest priority)

## **📋 Activity Logging**

The demo includes comprehensive logging to help understand retry behavior:

### **Log Types**
- **🔄 Retry Attempts:** Shows each retry attempt with timing
- **✅ Success Events:** Indicates when elements are found
- **❌ Failure Events:** Shows when max attempts are reached
- **🎯 Highlight Events:** Tracks tour progression

### **Log Analysis**
Use the logs to:
- Monitor retry performance
- Debug timing issues
- Understand retry patterns
- Optimize configuration settings

## **🚀 Real-World Applications**

### **Single Page Applications**
```typescript
// Route-based lazy loading
{
  element: '#dashboard-widget',
  retry: {
    maxAttempts: 10,
    delay: 500,
    exponentialBackoff: true
  }
}
```

### **E-commerce Platforms**
```typescript
// Product data loading
{
  element: '[data-product-details]',
  retry: {
    maxAttempts: 8,
    delay: 1500,
    onMaxAttemptsReached: () => {
      showErrorMessage('Product data unavailable')
    }
  }
}
```

### **Dashboard Applications**
```typescript
// Widget loading with fallback
{
  element: '.analytics-widget',
  retry: {
    maxAttempts: 5,
    delay: 2000,
    onRetry: (attempt) => {
      updateLoadingIndicator(`Loading... ${attempt}/5`)
    }
  }
}
```

## **🎨 Best Practices**

### **1. Reasonable Retry Limits**
```typescript
// Good: Balanced approach
retry: { maxAttempts: 5, delay: 1000 }

// Avoid: Excessive retries
retry: { maxAttempts: 50, delay: 100 }
```

### **2. Context-Appropriate Delays**
```typescript
// Fast UI interactions
retry: { delay: 300, maxAttempts: 6 }

// API-dependent content
retry: { delay: 1500, maxAttempts: 8, exponentialBackoff: true }

// Animation synchronization
retry: { delay: 100, maxAttempts: 10 }
```

### **3. User Feedback**
```typescript
retry: {
  maxAttempts: 5,
  delay: 1000,
  onRetry: (attempt) => {
    showToast(`Loading content... (${attempt}/5)`)
  },
  onMaxAttemptsReached: () => {
    showError('Content failed to load. Please refresh the page.')
  }
}
```

### **4. Performance Optimization**
```typescript
// Use exponential backoff for network-dependent elements
retry: {
  maxAttempts: 6,
  delay: 1000,
  exponentialBackoff: true // 1s, 2s, 4s, 8s, 16s, 30s (capped)
}
```

## **🔧 Troubleshooting**

### **Common Issues**

1. **Element Never Appears**
   - Check element selector accuracy
   - Verify element is actually being created
   - Increase max attempts if needed

2. **Performance Impact**
   - Reduce retry frequency for non-critical elements
   - Use exponential backoff for network requests
   - Set reasonable maximum attempts

3. **Timing Issues**
   - Adjust delay based on content type
   - Consider using exponential backoff
   - Monitor logs for optimal timing

### **Debug Tips**

1. **Use Console Logs**
   ```typescript
   retry: {
     onRetry: (attempt, step) => {
       console.log(`Retry ${attempt} for ${step.element}`)
     }
   }
   ```

2. **Monitor Network Timing**
   - Use browser dev tools
   - Correlate with retry attempts
   - Adjust delays accordingly

3. **Test Edge Cases**
   - Slow network conditions
   - Failed API calls
   - Animation interruptions

## **📊 Performance Metrics**

### **Optimal Settings by Use Case**

| Use Case | Max Attempts | Delay | Exponential Backoff |
|----------|-------------|-------|-------------------|
| CSS Animations | 6 | 300ms | No |
| API Calls | 8 | 1500ms | Yes |
| User Interactions | 5 | 500ms | No |
| Route Changes | 10 | 800ms | No |
| Form Validation | 4 | 1000ms | No |

### **Memory Usage**
- Minimal overhead per retry operation
- Automatic cleanup on completion/cancellation
- No memory leaks from cancelled operations

## **🎓 Learning Outcomes**

After exploring this demo, you should understand:

1. **When to use retry mechanisms** in your applications
2. **How to configure retry settings** for different scenarios
3. **Best practices for performance** and user experience
4. **Debugging techniques** for retry-related issues
5. **Integration patterns** with existing applications

## **🔗 Related Documentation**

- [Retry Mechanism Implementation Guide](../RETRY_MECHANISM.md)
- [Vue Coach Mark API Documentation](../README.md)
- [Performance Best Practices](../docs/performance.md)
- [Troubleshooting Guide](../docs/troubleshooting.md)

---

**Happy exploring!** 🎯 The retry mechanism makes vue-coach-mark robust and reliable for modern web applications with dynamic content.
