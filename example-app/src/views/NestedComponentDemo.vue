<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { type CoachMarkStep, type CoachMarkConfig, type StepLifecycleEventContext, type StepInteractionEventContext } from 'mint-coach-mark'
import { QuasarCoachMark } from 'mint-coach-mark'
import ParentComponent from '../components/nested-demo/ParentComponent.vue'

// Demo state
const isActive = ref(false)
const isDataLoaded = ref(false)
const isApiLoading = ref(false)
const demoLogs = ref<string[]>([])

// Coach mark component state
const isTourActive = ref(false)

/**
 * Add log entry with timestamp
 */
const addLog = (message: string): void => {
  const timestamp = new Date().toLocaleTimeString()
  demoLogs.value.unshift(`[${timestamp}] ${message}`)
  if (demoLogs.value.length > 50) {
    demoLogs.value = demoLogs.value.slice(0, 50)
  }
}

/**
 * Clear all logs
 */
const clearLogs = (): void => {
  demoLogs.value = []
}

/**
 * Toggle the conditional component visibility
 */
const handleToggleActive = (): void => {
  isActive.value = !isActive.value
  addLog(`🔄 Conditional component ${isActive.value ? 'shown' : 'hidden'}`)
}

/**
 * Simulate API data loading
 */
const handleLoadApiData = (): void => {
  if (isApiLoading.value || isDataLoaded.value) return
  
  isApiLoading.value = true
  addLog('📡 Starting API data simulation...')
  
  // Simulate 3-second API call
  setTimeout(() => {
    isApiLoading.value = false
    isDataLoaded.value = true
    addLog('✅ API data loaded successfully')
  }, 3000)
}

/**
 * Reset demo to initial state
 */
const handleResetDemo = (): void => {
  isActive.value = false
  isDataLoaded.value = false
  isApiLoading.value = false
  isTourActive.value = false
  addLog('🔄 Demo reset to initial state')
}

/**
 * Start the coach mark tour
 */
const handleStartTour = (): void => {
  addLog('🎯 Starting nested component coach mark tour')

  // Debug: Log the configuration
  console.log('Coach mark config:', coachMarkConfig.value)
  console.log('Coach mark steps:', coachMarkSteps.value)
  console.log('Steps count:', coachMarkSteps.value.length)

  isTourActive.value = true
}

// Coach mark steps configuration
const coachMarkSteps = computed((): CoachMarkStep[] => [
  {
    element: '#parent-intro',
    popover: {
      title: 'Welcome to Nested Component Demo',
      description: 'This tour demonstrates how the retry mechanism handles elements in nested components with different visibility conditions.',
      showButtons: ['next', 'close'],
      onAsyncNextClick: async ({ element, step, coachMark }) => {
        addLog('🔄 Step 1: Automatically activating conditional component...')
        isActive.value = true
        addLog('✅ Step 1: Conditional component activated for seamless tour flow')
        // Allow a brief moment for the DOM to update
        await new Promise(resolve => setTimeout(resolve, 100))

        addLog('🎯 Step 1: Moving to next step with autoScroll enabled')
        coachMark.moveNext({ autoScroll: true })
      }
    }
  },
  {
    element: '#conditional-element',
    retry: {
      maxAttempts: 10,
      delay: 500,
      onRetry: (attempt, step) => {
        if (attempt === 1 && !isActive.value) {
          addLog('🔄 Conditional element not found - automatically activating component...')
          isActive.value = true
          addLog('✅ Conditional component activated for seamless tour flow')
        }
        addLog(`🔄 Retry attempt ${attempt}/10 for conditional element`)
      },
      onMaxAttemptsReached: (step) => {
        addLog('❌ Max attempts reached for conditional element - automation may have failed!')
      }
    },
    popover: {
      title: 'Conditional Element (v-if)',
      description: 'This element was automatically rendered when the retry mechanism detected it was missing. The tour flow seamlessly activated the conditional component!',
      showButtons: ['next', 'previous', 'close'],
      onAsyncNextClick: async ({ element, step, coachMark }) => {
        addLog('🔄 Step 2: Automatically triggering API data load...')
        if (!isDataLoaded.value && !isApiLoading.value) {
          handleLoadApiData()
          addLog('✅ Step 2: API data loading initiated for seamless tour flow')
          // Wait for API loading to complete (3 seconds + buffer)
          await new Promise(resolve => setTimeout(resolve, 3200))
        } else {
          addLog('✅ Step 2: API data already loaded, proceeding...')
        }

        addLog('🎯 Step 2: Moving to next step with autoScroll enabled')
        coachMark.moveNext({ autoScroll: true })
      }
    }
  },
  {
    element: '#api-dependent-element',
    retry: {
      maxAttempts: 5,
      delay: 1000,
      exponentialBackoff: true,
      onRetry: (attempt, step) => {
        addLog(`🔄 Retry attempt ${attempt}/5 for API-dependent element (automated loading in progress)`)
      },
      onMaxAttemptsReached: (step) => {
        addLog('❌ Max attempts reached for API element - automated loading may have failed!')
      }
    },
    popover: {
      title: 'API-Dependent Element (v-show)',
      description: 'This element was automatically loaded when you clicked "Next" on the previous step. The tour seamlessly triggered the API data loading and waited for completion!',
      showButtons: ['next', 'previous', 'close']
    }
  },
  {
    element: '#parent-intro',
    popover: {
      title: 'Automated Tour Complete!',
      description: 'You\'ve experienced a fully automated nested component demo! The tour seamlessly activated conditional components and triggered API loading without manual intervention. The retry mechanism handled all visibility conditions automatically.',
      showButtons: ['close']
    }
  }
])

// Coach mark configuration (separate from steps)
const coachMarkConfig = computed((): CoachMarkConfig => ({
  animate: true,
  smoothScroll: true,
  onHighlightStarted: (element, step) => {
    addLog(`🎯 Highlighting element: ${step.element}`)
  }
}))

// Event handlers for coach mark component
const handleTourStart = (): void => {
  console.log('handleTourStart')
  addLog('🎯 Tour started successfully')
}

const handleTourComplete = (): void => {
  addLog('✅ Tour completed successfully')
  console.log('handleTourComplete')
  isTourActive.value = false
}

const handleTourSkipped = (step: CoachMarkStep, index: number): void => {
  addLog(`⏭️ Tour skipped at step ${index + 1}: ${step.element}`)
  console.log('handleTourSkipped')
  isTourActive.value = false
}

const handleStepChange = (step: CoachMarkStep, index: number): void => {
  addLog(`📍 Step ${index + 1}: Moving to ${step.element}`)
  console.log('handleStepChange')
}

const handleHighlightStarted = (element: Element | undefined, step: CoachMarkStep): void => {
  addLog(`🎯 Highlighting element: ${step.element}`)
  if (element) {
    addLog(`📍 Element position: ${element.getBoundingClientRect().top}px from top`)
  }
  console.log('handleHighlightStarted')
}

const handleHighlighted = (element: Element | undefined, step: CoachMarkStep): void => {
  addLog(`✨ Element highlighted: ${step.element}`)
  if (element) {
    const rect = element.getBoundingClientRect()
    const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight
    addLog(`👁️ Element visibility: ${isInView ? 'In viewport' : 'Outside viewport'} (${rect.top}px from top)`)
  }
  console.log('handleHighlighted')
}

const handleDeselected = (element: Element | undefined, step: CoachMarkStep): void => {
  addLog(`👋 Element deselected: ${step.element}`)
  console.log('handleDeselected')
}

// New step interaction event handlers
const handleStepAsyncNextClicked = (context: StepInteractionEventContext): void => {
  addLog(`🚀 [Interaction Event] Step ${context.stepIndex + 1} async next clicked: ${context.step.element}`)
  addLog(`📊 [Interaction Event] Navigation: hasNext=${context.hasNextStep}, hasPrevious=${context.hasPreviousStep}`)
  console.log('handleStepAsyncNextClicked')
}

const handleStepAsyncPreviousClicked = (context: StepInteractionEventContext): void => {
  addLog(`⬅️ [Interaction Event] Step ${context.stepIndex + 1} async previous clicked: ${context.step.element}`)
  addLog(`📊 [Interaction Event] Navigation: hasNext=${context.hasNextStep}, hasPrevious=${context.hasPreviousStep}`)
  console.log('handleStepAsyncPreviousClicked')
}

const handleStepChanged = (context: StepInteractionEventContext): void => {
  addLog(`🔄 [Interaction Event] Step changed to ${context.stepIndex + 1}: ${context.step.element}`)
  addLog(`🎮 [Interaction Event] CoachMark instance available: ${typeof context.coachMark}`)
  console.log('handleStepChanged')
}

const handleStepClosed = (context: StepInteractionEventContext): void => {
  addLog(`❌ [Interaction Event] Step ${context.stepIndex + 1} closed: ${context.step.element}`)
  addLog(`📊 [Interaction Event] Final step context: hasNext=${context.hasNextStep}, hasPrevious=${context.hasPreviousStep}`)
  console.log('handleStepClosed')
}

const handleStepNextClicked = (context: StepInteractionEventContext): void => {
  addLog(`➡️ [Interaction Event] Step ${context.stepIndex + 1} next clicked: ${context.step.element}`)
  if (context.nextStep) {
    addLog(`🎯 [Interaction Event] Moving to: ${context.nextStep.element}`)
  }
  console.log('handleStepNextClicked')
}

const handleStepPreviousClicked = (context: StepInteractionEventContext): void => {
  addLog(`⬅️ [Interaction Event] Step ${context.stepIndex + 1} previous clicked: ${context.step.element}`)
  if (context.previousStep) {
    addLog(`🎯 [Interaction Event] Moving to: ${context.previousStep.element}`)
  }
  console.log('handleStepPreviousClicked')
}

onMounted(() => {
  addLog('🎯 Nested Component Demo initialized')
})
</script>

<template>
  <div class="nested-demo">
    <!-- QuasarCoachMark Component -->
    <QuasarCoachMark
      v-model="isTourActive"
      :steps="coachMarkSteps"
      :config="coachMarkConfig"
      @tour-start="handleTourStart"
      @tour-complete="handleTourComplete"
      @tour-skipped="handleTourSkipped"
      @step-change="handleStepChange"
      @highlight-started="handleHighlightStarted"
      @highlighted="handleHighlighted"
      @deselected="handleDeselected"
      @step-async-next-clicked="handleStepAsyncNextClicked"
      @step-async-previous-clicked="handleStepAsyncPreviousClicked"
      @step-changed="handleStepChanged"
      @step-closed="handleStepClosed"
      @step-next-clicked="handleStepNextClicked"
      @step-previous-clicked="handleStepPreviousClicked"
    />

    <!-- Header -->
    <div class="demo-header">
      <h1>🤖 Automated Nested Component Demo</h1>
      <p class="demo-description">
        Experience a fully automated tour showcasing the retry mechanism with nested Vue components.
        The tour seamlessly handles v-if conditional rendering and v-show API-dependent visibility
        using the QuasarCoachMark component with intelligent automation.
      </p>
    </div>

    <!-- Main Demo Component -->
    <div class="demo-content">
      <ParentComponent
        :is-active="isActive"
        :is-data-loaded="isDataLoaded"
        :is-api-loading="isApiLoading"
        @toggle-active="handleToggleActive"
        @load-api-data="handleLoadApiData"
        @reset-demo="handleResetDemo"
        @start-tour="handleStartTour"
      />
    </div>

    <!-- Activity Logs -->
    <div class="logs-panel">
      <div class="logs-header">
        <h2>📋 Activity Logs</h2>
        <button @click="clearLogs" class="clear-btn">Clear Logs</button>
      </div>
      
      <div class="logs-container">
        <div v-if="demoLogs.length === 0" class="no-logs">
          No activity yet. Start the demo to see retry mechanism in action!
        </div>
        
        <div v-else class="logs-list">
          <div 
            v-for="(log, index) in demoLogs" 
            :key="index" 
            class="log-entry"
            :class="{ 
              'log-retry': log.includes('🔄'),
              'log-success': log.includes('✅'),
              'log-error': log.includes('❌'),
              'log-highlight': log.includes('🎯'),
              'log-api': log.includes('📡')
            }"
          >
            {{ log }}
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions Panel -->
    <div class="instructions-panel">
      <h3>📋 Automated Demo Instructions</h3>
      <ol class="instructions-list">
        <li>
          <strong>Start the tour:</strong> Click "Begin Coach Mark Tour" to start the automated demonstration
        </li>
        <li>
          <strong>Step 1:</strong> Tour begins with the always-available parent intro element
        </li>
        <li>
          <strong>Step 2:</strong> Click "Next" to automatically activate the conditional component (v-if)
        </li>
        <li>
          <strong>Step 3:</strong> Click "Next" to automatically trigger API data loading (v-show)
        </li>
        <li>
          <strong>Step 4:</strong> Tour completes after showcasing automated retry mechanisms
        </li>
        <li>
          <strong>Manual controls:</strong> Toggle buttons remain available for manual testing
        </li>
        <li>
          <strong>Reset:</strong> Use "Reset Demo" to return to initial state and try again
        </li>
      </ol>

      <div class="automation-note">
        <h4>🤖 Automation Features</h4>
        <ul class="automation-list">
          <li><strong>Seamless flow:</strong> No manual intervention required during tour</li>
          <li><strong>Smart timing:</strong> Automatic delays for DOM updates and API loading</li>
          <li><strong>Retry optimization:</strong> Reduced retry attempts due to automated state changes</li>
          <li><strong>Enhanced logging:</strong> Detailed logs show automation in action</li>
        </ul>
      </div>
    </div>

    <!-- Technical Information -->
    <div class="tech-info-panel">
      <h2>🔧 Technical Implementation</h2>

      <div class="tech-grid">
        <div class="tech-card">
          <h3>Component Architecture</h3>
          <ul class="tech-list">
            <li><strong>QuasarCoachMark:</strong> Declarative component interface</li>
            <li><strong>ParentComponent:</strong> Main container with state management</li>
            <li><strong>ChildComponent1:</strong> Always visible (no retry needed)</li>
            <li><strong>ChildComponent2:</strong> Contains conditional v-if element</li>
            <li><strong>SubChildComponent2:</strong> Rendered with v-if="isActive"</li>
            <li><strong>ChildComponent3:</strong> Contains API-dependent content</li>
            <li><strong>SubChildComponent3:</strong> Visibility with v-show="isDataLoaded"</li>
          </ul>
        </div>

        <div class="tech-card">
          <h3>QuasarCoachMark Features</h3>
          <ul class="tech-list">
            <li><strong>v-model:</strong> Reactive tour state control</li>
            <li><strong>:config prop:</strong> Computed configuration object</li>
            <li><strong>Event handlers:</strong> @tour-start, @tour-complete, @step-change</li>
            <li><strong>Retry callbacks:</strong> Integrated onRetry and onMaxAttemptsReached</li>
            <li><strong>Declarative API:</strong> Template-based configuration</li>
          </ul>
        </div>

        <div class="tech-card">
          <h3>Automated Retry Configurations</h3>
          <ul class="tech-list">
            <li><strong>Step 1:</strong> No retry (always available) + onAsyncNextClick automation</li>
            <li><strong>Step 2:</strong> maxAttempts: 3, delay: 500ms (optimized for automation)</li>
            <li><strong>Step 3:</strong> maxAttempts: 5, delay: 1000ms, exponentialBackoff</li>
            <li><strong>Automation:</strong> Automatic state changes via async navigation callbacks</li>
            <li><strong>Callbacks:</strong> Enhanced logging with automation status</li>
          </ul>
        </div>

        <div class="tech-card">
          <h3>Visibility Conditions</h3>
          <ul class="tech-list">
            <li><strong>v-if:</strong> Element completely removed from DOM</li>
            <li><strong>v-show:</strong> Element hidden but remains in DOM</li>
            <li><strong>API Loading:</strong> Simulated 3-second delay</li>
            <li><strong>State Management:</strong> Reactive Vue 3 refs</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Demo Styles */
.nested-demo {
  max-width: 1400px;
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

/* Demo Content */
.demo-content {
  margin-bottom: 3rem;
}

/* Logs Panel */
.logs-panel {
  background: #1e1e1e;
  color: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logs-header h2 {
  margin: 0;
  color: #f8f9fa;
  font-size: 1.5rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #c82333;
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

.log-entry.log-api {
  border-left-color: #17a2b8;
  background: rgba(23, 162, 184, 0.1);
}

/* Technical Info Panel */
.tech-info-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.tech-info-panel h2 {
  margin: 0 0 2rem 0;
  color: #495057;
  font-size: 1.8rem;
  text-align: center;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tech-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
}

.tech-card h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.2rem;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.tech-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #495057;
}

.tech-list li {
  margin-bottom: 0.75rem;
  line-height: 1.5;
  font-size: 0.9rem;
}

.tech-list li:last-child {
  margin-bottom: 0;
}

.tech-list strong {
  color: #212529;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nested-demo {
    padding: 1rem;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .logs-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
}

/* Instructions Panel */
.instructions-panel {
  background: #e3f2fd;
  border-radius: 12px;
  padding: 2rem;
  border-left: 4px solid #2196f3;
  margin-bottom: 3rem;
}

.instructions-panel h3 {
  margin: 0 0 1rem 0;
  color: #1976d2;
  font-size: 1.3rem;
}

.instructions-list {
  margin: 0 0 2rem 0;
  padding-left: 1.5rem;
  color: #1976d2;
}

.instructions-list li {
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.instructions-list li:last-child {
  margin-bottom: 0;
}

.instructions-list strong {
  color: #0d47a1;
}

/* Automation Note */
.automation-note {
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #2196f3;
}

.automation-note h4 {
  margin: 0 0 1rem 0;
  color: #0d47a1;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.automation-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #1976d2;
}

.automation-list li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
  font-size: 0.9rem;
}

.automation-list li:last-child {
  margin-bottom: 0;
}

.automation-list strong {
  color: #0d47a1;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .log-entry {
    border-left-width: 4px;
  }
  
  .tech-card {
    border-width: 2px;
  }
}
</style>
