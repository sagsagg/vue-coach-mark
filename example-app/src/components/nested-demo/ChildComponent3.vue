<script setup lang="ts">
import SubChildComponent3 from './SubChildComponent3.vue'

// Define props
interface Props {
  isDataLoaded: boolean
  isApiLoading: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <div class="child-component-3">
    <div class="component-content">
      <div class="component-header">
        <h5>📡 API Data Container</h5>
        <span class="status-badge" :class="{ 
          loading: isApiLoading, 
          loaded: isDataLoaded && !isApiLoading, 
          waiting: !isDataLoaded && !isApiLoading 
        }">
          {{ isApiLoading ? 'Loading...' : (isDataLoaded ? 'Data Loaded' : 'Waiting') }}
        </span>
      </div>
      
      <div class="content-area">
        <p class="description">
          This component contains a sub-component that uses <code>v-show</code> for visibility control.
          The element remains in the DOM but is hidden until API data is loaded.
        </p>
        
        <div class="condition-display">
          <div class="condition-info">
            <span class="condition-label">Current Condition:</span>
            <code class="condition-code">v-show="{{ isDataLoaded }}"</code>
          </div>
          <div class="dom-status">
            <span class="dom-label">DOM Status:</span>
            <span class="dom-value always-present">Always Present</span>
          </div>
          <div class="visibility-status">
            <span class="visibility-label">Visibility:</span>
            <span class="visibility-value" :class="{ visible: isDataLoaded, hidden: !isDataLoaded }">
              {{ isDataLoaded ? 'Visible' : 'Hidden' }}
            </span>
          </div>
        </div>
        
        <div class="api-simulation">
          <div class="api-info">
            <h6>API Simulation Details:</h6>
            <ul class="api-details">
              <li>Simulates 3-second data loading delay</li>
              <li>Element exists in DOM during loading (v-show)</li>
              <li>Coach mark retries until element becomes visible</li>
            </ul>
          </div>
        </div>
        
        <div class="sub-component-container">
          <!-- This component is always in DOM but visibility controlled by v-show -->
          <SubChildComponent3 
            :is-data-loaded="isDataLoaded" 
            :is-api-loading="isApiLoading" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.child-component-3 {
  width: 100%;
}

.component-content {
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #007bff;
}

.component-header h5 {
  margin: 0;
  color: #004085;
  font-size: 1.1rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.loading {
  background: #ffc107;
  color: #212529;
  animation: pulse 1.5s infinite;
}

.status-badge.loaded {
  background: #28a745;
  color: white;
}

.status-badge.waiting {
  background: #6c757d;
  color: white;
}

.description {
  margin: 0 0 1rem 0;
  color: #004085;
  line-height: 1.5;
  font-size: 0.9rem;
}

.description code {
  background: rgba(0, 123, 255, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  color: #004085;
}

.condition-display {
  background: white;
  border: 1px solid #007bff;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.condition-info,
.dom-status,
.visibility-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.visibility-status {
  margin-bottom: 0;
}

.condition-label,
.dom-label,
.visibility-label {
  font-weight: 500;
  color: #004085;
  font-size: 0.9rem;
}

.condition-code {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: #495057;
  border: 1px solid #dee2e6;
}

.dom-value,
.visibility-value {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.dom-value.always-present {
  background: #d1ecf1;
  color: #004085;
  border: 1px solid #bee5eb;
}

.visibility-value.visible {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.visibility-value.hidden {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.api-simulation {
  background: white;
  border: 1px solid #007bff;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.api-info h6 {
  margin: 0 0 0.75rem 0;
  color: #004085;
  font-size: 0.95rem;
  font-weight: 600;
}

.api-details {
  margin: 0;
  padding-left: 1.25rem;
  color: #004085;
}

.api-details li {
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.4;
}

.api-details li:last-child {
  margin-bottom: 0;
}

.sub-component-container {
  margin-top: 1rem;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .condition-info,
  .dom-status,
  .visibility-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
