<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useCoachMark, type CoachMarkStep, type RetryConfig } from 'mint-coach-mark'
import RetryDemoTest from '../components/RetryDemoTest.vue'

// Demo state
const isLoading = ref(false)
const showApiElement = ref(false)
const showLazyComponent = ref(false)
const showAnimatedElement = ref(false)
const showConditionalForm = ref(false)
const retryLogs = ref<string[]>([])
const currentDemo = ref<string | null>(null)

// Configuration state
const maxAttempts = ref(3)
const delay = ref(1000)
const exponentialBackoff = ref(false)
const enableRetry = ref(true)

// Coach mark instance
const coachMark = useCoachMark()

/**
 * Add log entry with timestamp
 */
const addLog = (message: string): void => {
  const timestamp = new Date().toLocaleTimeString()
  retryLogs.value.unshift(`[${timestamp}] ${message}`)
  if (retryLogs.value.length > 20) {
    retryLogs.value = retryLogs.value.slice(0, 20)
  }
}

/**
 * Clear all logs
 */
const clearLogs = (): void => {
  retryLogs.value = []
}

/**
 * Create retry configuration based on current settings
 */
const createRetryConfig = (): RetryConfig => ({
  enabled: enableRetry.value,
  maxAttempts: maxAttempts.value,
  delay: delay.value,
  exponentialBackoff: exponentialBackoff.value,
  onRetry: (attempt: number, step: any) => {
    addLog(`🔄 Retry attempt ${attempt}/${maxAttempts.value} for element: ${step.element}`)
  },
  onMaxAttemptsReached: (step: any) => {
    addLog(`❌ Max attempts reached for element: ${step.element}`)
  }
})

/**
 * Demo 1: API-dependent elements
 */
const startApiDemo = async (): Promise<void> => {
  currentDemo.value = 'api'
  clearLogs()
  addLog('🚀 Starting API-dependent elements demo')
  
  // Reset state
  showApiElement.value = false
  
  // Simulate API call delay
  setTimeout(() => {
    showApiElement.value = true
    addLog('✅ API data loaded, element now available')
  }, 3000)

  const steps: CoachMarkStep[] = [
    {
      element: '#api-dependent-element',
      retry: createRetryConfig(),
      popover: {
        title: 'API-Dependent Element',
        description: 'This element appears after an API call completes. The retry mechanism will wait for it to become available.',
        showButtons: ['next', 'close']
      }
    },
    {
      element: '#api-demo-trigger',
      popover: {
        title: 'Demo Complete',
        description: 'The retry mechanism successfully waited for the API-dependent element to load!',
        showButtons: ['close']
      }
    }
  ]

  // Configure the coach mark
  coachMark.setConfig({
    steps,
    animate: true,
    onHighlightStarted: (element, step) => {
      addLog(`🎯 Highlighting element: ${step.element}`)
    }
  })

  coachMark.start()
}

/**
 * Demo 2: Lazy-loaded components
 */
const startLazyDemo = async (): Promise<void> => {
  currentDemo.value = 'lazy'
  clearLogs()
  addLog('🔄 Starting lazy-loaded component demo')
  
  showLazyComponent.value = false
  
  const steps: CoachMarkStep[] = [
    {
      element: '#lazy-trigger-btn',
      popover: {
        title: 'Trigger Lazy Loading',
        description: 'Click this button to load a component dynamically. The next step will wait for it.',
        showButtons: ['next']
      }
    },
    {
      element: '#lazy-loaded-component',
      retry: {
        ...createRetryConfig(),
        maxAttempts: 8,
        delay: 500
      },
      popover: {
        title: 'Lazy-Loaded Component',
        description: 'This component was loaded dynamically after user interaction.',
        showButtons: ['close']
      }
    }
  ]

  // Configure the coach mark
  coachMark.setConfig({
    steps,
    animate: true,
    onHighlightStarted: (element, step) => {
      addLog(`🎯 Highlighting element: ${step.element}`)
    }
  })

  coachMark.start()
}

/**
 * Demo 3: Animation-dependent elements
 */
const startAnimationDemo = async (): Promise<void> => {
  currentDemo.value = 'animation'
  clearLogs()
  addLog('🎨 Starting animation-dependent elements demo')
  
  showAnimatedElement.value = false
  
  // Start animation after a short delay
  setTimeout(() => {
    showAnimatedElement.value = true
    addLog('✨ Animation started, element becoming visible')
  }, 1000)

  const steps: CoachMarkStep[] = [
    {
      element: '#animated-element',
      retry: {
        ...createRetryConfig(),
        maxAttempts: 6,
        delay: 300
      },
      popover: {
        title: 'Animated Element',
        description: 'This element appears with a CSS animation. The retry mechanism waits for it to be fully rendered.',
        showButtons: ['close']
      }
    }
  ]

  // Configure the coach mark
  coachMark.setConfig({
    steps,
    animate: true,
    onHighlightStarted: (element, step) => {
      addLog(`🎯 Highlighting element: ${step.element}`)
    }
  })

  coachMark.start()
}

/**
 * Demo 4: Conditional form elements
 */
const startConditionalDemo = async (): Promise<void> => {
  currentDemo.value = 'conditional'
  clearLogs()
  addLog('📝 Starting conditional form elements demo')
  
  showConditionalForm.value = false

  const steps: CoachMarkStep[] = [
    {
      element: '#show-form-checkbox',
      popover: {
        title: 'Show Form Elements',
        description: 'Check this box to reveal additional form fields that the tour will guide you through.',
        showButtons: ['next']
      }
    },
    {
      element: '#conditional-input',
      retry: {
        ...createRetryConfig(),
        maxAttempts: 5,
        delay: 800
      },
      popover: {
        title: 'Conditional Input Field',
        description: 'This input field only appears when the checkbox above is checked.',
        showButtons: ['next']
      }
    },
    {
      element: '#conditional-submit',
      retry: createRetryConfig(),
      popover: {
        title: 'Submit Button',
        description: 'This submit button is also conditionally displayed.',
        showButtons: ['close']
      }
    }
  ]

  // Configure the coach mark
  coachMark.setConfig({
    steps,
    animate: true,
    onHighlightStarted: (element, step) => {
      addLog(`🎯 Highlighting element: ${step.element}`)
    }
  })

  coachMark.start()
}

/**
 * Demo 5: Global retry configuration
 */
const startGlobalRetryDemo = async (): Promise<void> => {
  currentDemo.value = 'global'
  clearLogs()
  addLog('🌐 Starting global retry configuration demo')
  
  // Reset all elements
  showApiElement.value = false
  showLazyComponent.value = false
  
  // Simulate different loading times
  setTimeout(() => {
    showApiElement.value = true
    addLog('✅ First element loaded')
  }, 2000)
  
  setTimeout(() => {
    showLazyComponent.value = true
    addLog('✅ Second element loaded')
  }, 4000)

  const steps: CoachMarkStep[] = [
    {
      element: '#api-dependent-element',
      // Uses global retry config
      popover: {
        title: 'Global Retry Config',
        description: 'This step uses the global retry configuration.',
        showButtons: ['next']
      }
    },
    {
      element: '#lazy-loaded-component',
      retry: false, // Explicitly disable retry
      popover: {
        title: 'Retry Disabled',
        description: 'This step has retry disabled, so it will fail if element is not immediately available.',
        showButtons: ['next']
      }
    },
    {
      element: '#global-demo-trigger',
      retry: {
        maxAttempts: 2,
        delay: 500
      }, // Override global config
      popover: {
        title: 'Custom Override',
        description: 'This step overrides the global retry configuration with custom settings.',
        showButtons: ['close']
      }
    }
  ]

  // Configure the coach mark
  coachMark.setConfig({
    steps,
    animate: true,
    // Global retry configuration
    retry: createRetryConfig(),
    onHighlightStarted: (element, step) => {
      addLog(`🎯 Highlighting element: ${step.element}`)
    }
  })

  coachMark.start()
}

/**
 * Trigger lazy component loading
 */
const triggerLazyLoad = (): void => {
  addLog('🔄 User triggered lazy component loading')
  setTimeout(() => {
    showLazyComponent.value = true
    addLog('✅ Lazy component loaded successfully')
  }, 1500)
}

/**
 * Handle conditional form checkbox
 */
const onShowFormChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  showConditionalForm.value = target.checked
  
  if (target.checked) {
    addLog('✅ Conditional form elements are now visible')
  } else {
    addLog('❌ Conditional form elements hidden')
  }
}

/**
 * Stop current demo
 */
const stopDemo = (): void => {
  coachMark.destroy()
  currentDemo.value = null
  addLog('🛑 Demo stopped')
}

onMounted(() => {
  addLog('🎯 Retry Mechanism Demo initialized')
})
</script>

<template>
  <div class="retry-demo">
    <!-- Header -->
    <div class="demo-header">
      <h1>🔄 Element Retry Mechanism Demo</h1>
      <p class="demo-description">
        Explore how the retry mechanism handles elements that are not immediately available in the DOM.
        Perfect for Single Page Applications with dynamic content, API calls, and lazy-loaded components.
      </p>
    </div>

    <!-- Configuration Panel -->
    <div class="config-panel">
      <h2>⚙️ Retry Configuration</h2>
      <div class="config-grid">
        <div class="config-item">
          <label for="enable-retry">
            <input
              id="enable-retry"
              type="checkbox"
              v-model="enableRetry"
            />
            Enable Retry
          </label>
        </div>

        <div class="config-item">
          <label for="max-attempts">Max Attempts:</label>
          <input
            id="max-attempts"
            type="number"
            v-model.number="maxAttempts"
            min="1"
            max="10"
            :disabled="!enableRetry"
          />
        </div>

        <div class="config-item">
          <label for="delay">Delay (ms):</label>
          <input
            id="delay"
            type="number"
            v-model.number="delay"
            min="100"
            max="5000"
            step="100"
            :disabled="!enableRetry"
          />
        </div>

        <div class="config-item">
          <label for="exponential-backoff">
            <input
              id="exponential-backoff"
              type="checkbox"
              v-model="exponentialBackoff"
              :disabled="!enableRetry"
            />
            Exponential Backoff
          </label>
        </div>
      </div>
    </div>

    <!-- Demo Scenarios -->
    <div class="demo-scenarios">
      <h2>🎯 Demo Scenarios</h2>

      <!-- Scenario 1: API-Dependent Elements -->
      <div class="scenario-card">
        <div class="scenario-header">
          <h3>1. API-Dependent Elements</h3>
          <p>Elements that appear after API calls complete</p>
        </div>

        <div class="scenario-content">
          <button
            id="api-demo-trigger"
            @click="startApiDemo"
            class="demo-btn primary"
            :disabled="currentDemo === 'api'"
          >
            Start API Demo
          </button>

          <div class="demo-elements">
            <div v-if="!showApiElement && currentDemo === 'api'" class="loading-placeholder">
              <div class="spinner"></div>
              <span>Loading API data...</span>
            </div>

            <div
              v-if="showApiElement"
              id="api-dependent-element"
              class="demo-element api-element"
            >
              <h4>📊 User Profile Data</h4>
              <p>This element appeared after the API call completed!</p>
              <div class="fake-data">
                <span class="data-item">Name: John Doe</span>
                <span class="data-item">Email: john@example.com</span>
                <span class="data-item">Role: Developer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario 2: Lazy-Loaded Components -->
      <div class="scenario-card">
        <div class="scenario-header">
          <h3>2. Lazy-Loaded Components</h3>
          <p>Components that load after user interaction</p>
        </div>

        <div class="scenario-content">
          <button
            @click="startLazyDemo"
            class="demo-btn primary"
            :disabled="currentDemo === 'lazy'"
          >
            Start Lazy Loading Demo
          </button>

          <div class="demo-elements">
            <button
              id="lazy-trigger-btn"
              @click="triggerLazyLoad"
              class="demo-btn secondary"
              :disabled="showLazyComponent"
            >
              Load Component Dynamically
            </button>

            <div
              v-if="showLazyComponent"
              id="lazy-loaded-component"
              class="demo-element lazy-element"
            >
              <h4>🚀 Dynamically Loaded Component</h4>
              <p>This component was loaded after user interaction!</p>
              <div class="component-content">
                <div class="feature-list">
                  <span class="feature">✨ Dynamic Loading</span>
                  <span class="feature">🔄 Retry Support</span>
                  <span class="feature">🎯 Tour Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario 3: Animation-Dependent Elements -->
      <div class="scenario-card">
        <div class="scenario-header">
          <h3>3. Animation-Dependent Elements</h3>
          <p>Elements that appear after animations complete</p>
        </div>

        <div class="scenario-content">
          <button
            @click="startAnimationDemo"
            class="demo-btn primary"
            :disabled="currentDemo === 'animation'"
          >
            Start Animation Demo
          </button>

          <div class="demo-elements">
            <div
              v-if="showAnimatedElement"
              id="animated-element"
              class="demo-element animated-element"
            >
              <h4>✨ Animated Element</h4>
              <p>This element appeared with a smooth animation!</p>
              <div class="animation-demo">
                <div class="pulse-dot"></div>
                <span>Animated content</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario 4: Conditional Form Elements -->
      <div class="scenario-card">
        <div class="scenario-header">
          <h3>4. Conditional Form Elements</h3>
          <p>Form fields that appear based on user input</p>
        </div>

        <div class="scenario-content">
          <button
            @click="startConditionalDemo"
            class="demo-btn primary"
            :disabled="currentDemo === 'conditional'"
          >
            Start Conditional Demo
          </button>

          <div class="demo-elements">
            <div class="form-demo">
              <label class="checkbox-label">
                <input
                  id="show-form-checkbox"
                  type="checkbox"
                  @change="onShowFormChange"
                  :checked="showConditionalForm"
                />
                Show additional form fields
              </label>

              <div v-if="showConditionalForm" class="conditional-form">
                <div class="form-group">
                  <label for="conditional-input">Additional Information:</label>
                  <input
                    id="conditional-input"
                    type="text"
                    placeholder="Enter additional details..."
                    class="form-input"
                  />
                </div>

                <button id="conditional-submit" class="demo-btn success">
                  Submit Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario 5: Global Configuration -->
      <div class="scenario-card">
        <div class="scenario-header">
          <h3>5. Global Retry Configuration</h3>
          <p>Demonstrating global vs step-level retry settings</p>
        </div>

        <div class="scenario-content">
          <button
            id="global-demo-trigger"
            @click="startGlobalRetryDemo"
            class="demo-btn primary"
            :disabled="currentDemo === 'global'"
          >
            Start Global Config Demo
          </button>

          <div class="demo-elements">
            <div class="config-explanation">
              <h4>Configuration Priority:</h4>
              <ol>
                <li><strong>Step-level config</strong> (highest priority)</li>
                <li><strong>Global config</strong></li>
                <li><strong>Default config</strong> (lowest priority)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Control Panel -->
    <div class="control-panel">
      <h2>🎮 Demo Controls</h2>
      <div class="control-buttons">
        <button @click="stopDemo" class="demo-btn danger" :disabled="!currentDemo">
          Stop Current Demo
        </button>
        <button @click="clearLogs" class="demo-btn secondary">
          Clear Logs
        </button>
      </div>

      <div v-if="currentDemo" class="current-demo">
        <span class="demo-status">Current Demo: <strong>{{ currentDemo }}</strong></span>
      </div>
    </div>

    <!-- Activity Logs -->
    <div class="logs-panel">
      <h2>📋 Activity Logs</h2>
      <div class="logs-container">
        <div v-if="retryLogs.length === 0" class="no-logs">
          No activity yet. Start a demo to see retry mechanism in action!
        </div>

        <div v-else class="logs-list">
          <div
            v-for="(log, index) in retryLogs"
            :key="index"
            class="log-entry"
            :class="{
              'log-retry': log.includes('🔄'),
              'log-success': log.includes('✅'),
              'log-error': log.includes('❌'),
              'log-highlight': log.includes('🎯')
            }"
          >
            {{ log }}
          </div>
        </div>
      </div>
    </div>

    <!-- Test Component -->
    <RetryDemoTest />
  </div>
</template>

<style scoped>
/* Retry Mechanism Demo Styles */
.retry-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.demo-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.demo-header h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.demo-description {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* Configuration Panel */
.config-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.config-panel h2 {
  margin: 0 0 1.5rem 0;
  color: #495057;
  font-size: 1.5rem;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-item label {
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.config-item input[type="number"] {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.config-item input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
}

.config-item input[type="number"]:disabled {
  background: #f8f9fa;
  color: #6c757d;
}

.config-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

/* Demo Scenarios */
.demo-scenarios {
  margin-bottom: 2rem;
}

.demo-scenarios h2 {
  margin: 0 0 2rem 0;
  color: #495057;
  font-size: 1.8rem;
  text-align: center;
}

.scenario-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: transform 0.2s, box-shadow 0.2s;
}

.scenario-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.scenario-header {
  margin-bottom: 1.5rem;
}

.scenario-header h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.3rem;
}

.scenario-header p {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

.scenario-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Demo Elements */
.demo-elements {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-element {
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  background: #f8f9fa;
  animation: slideIn 0.5s ease-out;
}

.api-element {
  border-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.lazy-element {
  border-color: #007bff;
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
}

.animated-element {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  animation: slideIn 0.5s ease-out, pulse 2s infinite;
}

.demo-element h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.demo-element p {
  margin: 0 0 1rem 0;
  color: #6c757d;
}

/* Loading States */
.loading-placeholder {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Fake Data Display */
.fake-data {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-item {
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  border-left: 3px solid #28a745;
}

/* Feature List */
.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature {
  padding: 0.25rem 0.75rem;
  background: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #495057;
  border: 1px solid #dee2e6;
}

/* Animation Demo */
.animation-demo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #ffc107;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

/* Form Demo */
.form-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.conditional-form {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  animation: slideIn 0.3s ease-out;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

/* Config Explanation */
.config-explanation {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.config-explanation h4 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.config-explanation ol {
  margin: 0;
  padding-left: 1.5rem;
}

.config-explanation li {
  margin-bottom: 0.5rem;
  color: #6c757d;
}

/* Buttons */
.demo-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.demo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-btn.primary {
  background: #667eea;
  color: white;
}

.demo-btn.primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.demo-btn.secondary {
  background: #6c757d;
  color: white;
}

.demo-btn.secondary:hover:not(:disabled) {
  background: #5a6268;
}

.demo-btn.success {
  background: #28a745;
  color: white;
}

.demo-btn.success:hover:not(:disabled) {
  background: #218838;
}

.demo-btn.danger {
  background: #dc3545;
  color: white;
}

.demo-btn.danger:hover:not(:disabled) {
  background: #c82333;
}

/* Control Panel */
.control-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.control-panel h2 {
  margin: 0 0 1.5rem 0;
  color: #495057;
  font-size: 1.5rem;
}

.control-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.current-demo {
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 6px;
  border-left: 4px solid #2196f3;
}

.demo-status {
  color: #1976d2;
  font-weight: 500;
}

/* Logs Panel */
.logs-panel {
  background: #1e1e1e;
  color: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logs-panel h2 {
  margin: 0 0 1.5rem 0;
  color: #f8f9fa;
  font-size: 1.5rem;
}

.logs-container {
  max-height: 400px;
  overflow-y: auto;
  background: #2d2d2d;
  border-radius: 8px;
  padding: 1rem;
}

.no-logs {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 2rem;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-entry {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  background: #3d3d3d;
  border-left: 3px solid #6c757d;
}

.log-entry.log-retry {
  border-left-color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.log-entry.log-success {
  border-left-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.log-entry.log-error {
  border-left-color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.log-entry.log-highlight {
  border-left-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .retry-demo {
    padding: 1rem;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .control-buttons {
    flex-direction: column;
  }

  .scenario-content {
    gap: 1rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .animated-element,
  .pulse-dot,
  .spinner {
    animation: none;
  }

  .scenario-card {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .demo-element {
    border-width: 3px;
  }

  .log-entry {
    border-left-width: 4px;
  }
}
</style>
