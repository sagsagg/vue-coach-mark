<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCoachMark, type CoachMarkStep } from 'mint-coach-mark'

// Test state
const showTestElement = ref(false)
const testLogs = ref<string[]>([])

// Coach mark instance
const coachMark = useCoachMark()

/**
 * Add test log
 */
const addTestLog = (message: string): void => {
  const timestamp = new Date().toLocaleTimeString()
  testLogs.value.unshift(`[${timestamp}] ${message}`)
}

/**
 * Simple retry test
 */
const runSimpleTest = (): void => {
  addTestLog('🧪 Starting simple retry test')
  showTestElement.value = false
  
  // Show element after 2 seconds
  setTimeout(() => {
    showTestElement.value = true
    addTestLog('✅ Test element is now visible')
  }, 2000)

  const steps: CoachMarkStep[] = [
    {
      element: '#test-element',
      retry: {
        maxAttempts: 5,
        delay: 500,
        onRetry: (attempt) => {
          addTestLog(`🔄 Retry attempt ${attempt}/5`)
        },
        onMaxAttemptsReached: () => {
          addTestLog('❌ Max attempts reached')
        }
      },
      popover: {
        title: 'Test Element',
        description: 'This is a simple retry mechanism test.',
        showButtons: ['close']
      }
    }
  ]

  // Configure the coach mark
  coachMark.setConfig({
    steps,
    onHighlightStarted: () => {
      addTestLog('🎯 Element highlighted successfully!')
    }
  })

  coachMark.start()
}

/**
 * Clear test logs
 */
const clearTestLogs = (): void => {
  testLogs.value = []
}

onMounted(() => {
  addTestLog('🎯 Retry Demo Test Component initialized')
})
</script>

<template>
  <div class="retry-test">
    <h2>🧪 Retry Mechanism Test</h2>
    <p>This is a simple test component to verify the retry mechanism works correctly.</p>
    
    <div class="test-controls">
      <button @click="runSimpleTest" class="test-btn">
        Run Simple Test
      </button>
      <button @click="clearTestLogs" class="test-btn secondary">
        Clear Logs
      </button>
    </div>
    
    <div class="test-area">
      <div v-if="showTestElement" id="test-element" class="test-element">
        <h3>✅ Test Element</h3>
        <p>This element appeared after a delay and should be highlighted by the tour!</p>
      </div>
      
      <div v-else class="placeholder">
        <p>Test element will appear here after starting the test...</p>
      </div>
    </div>
    
    <div class="test-logs">
      <h3>Test Logs</h3>
      <div class="logs-container">
        <div v-if="testLogs.length === 0" class="no-logs">
          No test activity yet.
        </div>
        <div v-else class="logs-list">
          <div 
            v-for="(log, index) in testLogs" 
            :key="index" 
            class="log-entry"
          >
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.retry-test {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.retry-test h2 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.test-controls {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.test-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  background: #667eea;
  color: white;
  transition: background 0.2s;
}

.test-btn:hover {
  background: #5a67d8;
}

.test-btn.secondary {
  background: #6c757d;
}

.test-btn.secondary:hover {
  background: #5a6268;
}

.test-area {
  min-height: 150px;
  padding: 2rem;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  margin: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.test-element {
  padding: 2rem;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 2px solid #28a745;
  border-radius: 8px;
  text-align: center;
  animation: slideIn 0.5s ease-out;
}

.test-element h3 {
  margin: 0 0 1rem 0;
  color: #155724;
}

.test-element p {
  margin: 0;
  color: #155724;
}

.placeholder {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.test-logs {
  margin-top: 2rem;
}

.test-logs h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.logs-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
}

.no-logs {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-entry {
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  border-left: 3px solid #667eea;
}

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
</style>
