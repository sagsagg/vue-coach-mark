<script setup lang="ts">
import { ref, computed } from 'vue'
import ChildComponent1 from './ChildComponent1.vue'
import ChildComponent2 from './ChildComponent2.vue'
import ChildComponent3 from './ChildComponent3.vue'

// Define props
interface Props {
  isActive: boolean
  isDataLoaded: boolean
  isApiLoading: boolean
}

const props = defineProps<Props>()

// Define emits
interface Emits {
  (e: 'toggle-active'): void
  (e: 'load-api-data'): void
  (e: 'reset-demo'): void
  (e: 'start-tour'): void
}

const emit = defineEmits<Emits>()

// Computed properties for display
const activeStatus = computed(() => props.isActive ? 'Active' : 'Inactive')
const dataStatus = computed(() => {
  if (props.isApiLoading) return 'Loading...'
  return props.isDataLoaded ? 'Loaded' : 'Not Loaded'
})

// Event handlers
const handleToggleActive = (): void => {
  emit('toggle-active')
}

const handleLoadApiData = (): void => {
  emit('load-api-data')
}

const handleResetDemo = (): void => {
  emit('reset-demo')
}

const handleStartTour = (): void => {
  emit('start-tour')
}
</script>

<template>
  <div class="parent-component">
    <!-- Header Section -->
    <div class="demo-header">
      <h2 id="parent-intro" data-testid="parent-intro">
        🏗️ Nested Component Demo
      </h2>
      <p class="demo-description">
        This demo showcases how the retry mechanism handles elements in nested components
        with different visibility conditions (v-if, v-show, API loading).
      </p>
    </div>

    <!-- Status Panel -->
    <div class="status-panel">
      <h3>Current State</h3>
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">Conditional Component:</span>
          <span class="status-value" :class="{ active: isActive }">
            {{ activeStatus }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">API Data:</span>
          <span class="status-value" :class="{ loaded: isDataLoaded, loading: isApiLoading }">
            {{ dataStatus }}
          </span>
        </div>
      </div>
    </div>

    <!-- Control Panel -->
    <div class="control-panel">
      <h3>Demo Controls</h3>
      <div class="control-buttons">
        <button 
          @click="handleToggleActive"
          class="control-btn primary"
          :class="{ active: isActive }"
        >
          {{ isActive ? 'Hide' : 'Show' }} Conditional Component
        </button>
        
        <button 
          @click="handleLoadApiData"
          class="control-btn secondary"
          :disabled="isApiLoading || isDataLoaded"
        >
          {{ isApiLoading ? 'Loading...' : 'Load API Data' }}
        </button>
        
        <button 
          @click="handleResetDemo"
          class="control-btn danger"
        >
          Reset Demo
        </button>
        
        <button 
          @click="handleStartTour"
          class="control-btn success"
        >
          🎯 Begin Coach Mark Tour
        </button>
      </div>
    </div>

    <!-- Component Grid -->
    <div class="component-grid">
      <!-- Child Component 1 - Always Visible -->
      <div class="component-section">
        <h4>Child Component 1 (Always Visible)</h4>
        <ChildComponent1 />
      </div>

      <!-- Child Component 2 - Conditional Rendering Container -->
      <div class="component-section">
        <h4>Child Component 2 (Conditional Container)</h4>
        <div class="conditional-info">
          <p>Contains SubChildComponent2 with v-if="isActive"</p>
          <p class="condition-status">
            Condition: <code>v-if="{{ isActive }}"</code>
          </p>
        </div>
        <ChildComponent2 :is-active="isActive" />
      </div>

      <!-- Child Component 3 - API Data Container -->
      <div class="component-section">
        <h4>Child Component 3 (API Data Container)</h4>
        <div class="api-info">
          <p>Contains SubChildComponent3 with v-show="isDataLoaded"</p>
          <p class="condition-status">
            Condition: <code>v-show="{{ isDataLoaded }}"</code>
          </p>
        </div>
        <ChildComponent3 
          :is-data-loaded="isDataLoaded" 
          :is-api-loading="isApiLoading" 
        />
      </div>
    </div>

    <!-- Instructions Panel -->
    <div class="instructions-panel">
      <h3>📋 Demo Instructions</h3>
      <ol class="instructions-list">
        <li>
          <strong>Start the tour:</strong> Click "Begin Coach Mark Tour" to start the demonstration
        </li>
        <li>
          <strong>Step 1:</strong> Tour begins with the always-available parent intro element
        </li>
        <li>
          <strong>Step 2:</strong> Tour will retry until you click "Show Conditional Component"
        </li>
        <li>
          <strong>Step 3:</strong> Tour will retry until you click "Load API Data" and loading completes
        </li>
        <li>
          <strong>Reset:</strong> Use "Reset Demo" to return to initial state and try again
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.parent-component {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Styles */
.demo-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.demo-header h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.demo-description {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
}

/* Status Panel */
.status-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.status-panel h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.3rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #dee2e6;
}

.status-label {
  font-weight: 500;
  color: #495057;
}

.status-value {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: #6c757d;
  color: white;
  font-size: 0.9rem;
}

.status-value.active {
  background: #28a745;
}

.status-value.loaded {
  background: #007bff;
}

.status-value.loading {
  background: #ffc107;
  color: #212529;
}

/* Control Panel */
.control-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.control-panel h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.3rem;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.control-btn {
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

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.control-btn.primary {
  background: #667eea;
  color: white;
}

.control-btn.primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.control-btn.primary.active {
  background: #28a745;
}

.control-btn.secondary {
  background: #6c757d;
  color: white;
}

.control-btn.secondary:hover:not(:disabled) {
  background: #5a6268;
}

.control-btn.danger {
  background: #dc3545;
  color: white;
}

.control-btn.danger:hover:not(:disabled) {
  background: #c82333;
}

.control-btn.success {
  background: #28a745;
  color: white;
}

.control-btn.success:hover:not(:disabled) {
  background: #218838;
}

/* Component Grid */
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.component-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.component-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.conditional-info,
.api-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.conditional-info p,
.api-info p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #495057;
}

.conditional-info p:last-child,
.api-info p:last-child {
  margin-bottom: 0;
}

.condition-status code {
  background: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: #495057;
}

/* Instructions Panel */
.instructions-panel {
  background: #e3f2fd;
  border-radius: 12px;
  padding: 2rem;
  border-left: 4px solid #2196f3;
}

.instructions-panel h3 {
  margin: 0 0 1rem 0;
  color: #1976d2;
  font-size: 1.3rem;
}

.instructions-list {
  margin: 0;
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

/* Responsive Design */
@media (max-width: 768px) {
  .parent-component {
    padding: 1rem;
  }
  
  .demo-header h2 {
    font-size: 1.5rem;
  }
  
  .component-grid {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
