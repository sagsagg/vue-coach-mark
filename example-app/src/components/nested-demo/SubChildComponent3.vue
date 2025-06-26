<script setup lang="ts">
// SubChildComponent3 - Visibility controlled with v-show
// This component is always in the DOM but hidden until data is loaded

// Define props
interface Props {
  isDataLoaded: boolean
  isApiLoading: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <div class="sub-child-component-3">
    <!-- Loading State -->
    <div v-if="isApiLoading" class="loading-state">
      <div class="loading-content">
        <div class="spinner"></div>
        <h6>Loading API Data...</h6>
        <p class="loading-text">
          The target element exists in DOM but is hidden during loading.
          Coach marks will retry until the element becomes visible.
        </p>
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">Simulating API call...</span>
        </div>
      </div>
    </div>

    <!-- Data Loaded State - Controlled by v-show -->
    <div 
      v-show="isDataLoaded && !isApiLoading" 
      class="sub-component-content"
    >
      <div class="sub-header">
        <h6>🎯 API-Dependent Element (v-show)</h6>
        <span class="visibility-badge">Visible</span>
      </div>
      
      <div class="sub-content">
        <p class="sub-description">
          This element is always present in the DOM but hidden until API data loads.
          Coach marks can target it once it becomes visible.
        </p>
        
        <div class="api-data-showcase">
          <div class="data-item">
            <span class="data-icon">👤</span>
            <div class="data-content">
              <span class="data-label">User Profile</span>
              <span class="data-value">John Doe</span>
            </div>
          </div>
          <div class="data-item">
            <span class="data-icon">📧</span>
            <div class="data-content">
              <span class="data-label">Email</span>
              <span class="data-value">john@example.com</span>
            </div>
          </div>
          <div class="data-item">
            <span class="data-icon">🏢</span>
            <div class="data-content">
              <span class="data-label">Department</span>
              <span class="data-value">Engineering</span>
            </div>
          </div>
        </div>
        
        <!-- This is the target element for the coach mark -->
        <button 
          id="api-dependent-element" 
          data-testid="api-dependent-element"
          class="target-button"
        >
          🎯 API Data Target
          <span class="target-subtitle">Loaded from API!</span>
        </button>
        
        <div class="technical-info">
          <h6>Technical Details:</h6>
          <ul class="tech-list">
            <li><code>v-show="isDataLoaded"</code> - Hidden until data loads</li>
            <li><code>id="api-dependent-element"</code> - Coach mark target</li>
            <li>Retry config: <code>maxAttempts: 8, delay: 1500ms, exponentialBackoff: true</code></li>
            <li>Element exists in DOM during loading (unlike v-if)</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Waiting State (when not loading and no data) -->
    <div v-if="!isApiLoading && !isDataLoaded" class="waiting-state">
      <div class="waiting-content">
        <div class="waiting-icon">⏳</div>
        <h6>Waiting for API Data</h6>
        <p class="waiting-text">
          Click "Load API Data" to simulate an API call and reveal the hidden element.
        </p>
        <div class="dom-info">
          <span class="dom-note">
            💡 The target element exists in DOM but is hidden (display: none)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-child-component-3 {
  width: 100%;
  min-height: 200px;
}

/* Loaded Content Styles */
.sub-component-content {
  background: white;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  animation: fadeIn 0.5s ease-out;
}

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #007bff;
}

.sub-header h6 {
  margin: 0;
  color: #004085;
  font-size: 1rem;
  font-weight: 600;
}

.visibility-badge {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
}

.sub-description {
  margin: 0 0 1rem 0;
  color: #004085;
  line-height: 1.5;
  font-size: 0.9rem;
}

.api-data-showcase {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.data-icon {
  font-size: 1.5rem;
  width: 2rem;
  text-align: center;
}

.data-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.data-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.data-value {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 600;
}

.target-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.target-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.target-button:active {
  transform: translateY(0);
}

.target-subtitle {
  font-size: 0.8rem;
  font-weight: 400;
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* Loading State Styles */
.loading-state {
  background: white;
  border: 2px dashed #ffc107;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.loading-content h6 {
  margin: 0 0 1rem 0;
  color: #856404;
  font-size: 1.1rem;
  font-weight: 600;
}

.loading-text {
  margin: 0 0 1.5rem 0;
  color: #856404;
  line-height: 1.5;
  font-size: 0.9rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffc107;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

.loading-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffc107;
  border-radius: 4px;
  animation: progress 3s ease-in-out infinite;
}

.progress-text {
  font-size: 0.8rem;
  color: #856404;
  font-style: italic;
}

/* Waiting State Styles */
.waiting-state {
  background: white;
  border: 2px dashed #6c757d;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.waiting-content h6 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.waiting-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.waiting-text {
  margin: 0 0 1.5rem 0;
  color: #495057;
  line-height: 1.5;
  font-size: 0.9rem;
}

.dom-info {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.dom-note {
  font-size: 0.85rem;
  color: #495057;
  font-style: italic;
}

/* Technical Info */
.technical-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
}

.technical-info h6 {
  margin: 0 0 0.75rem 0;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 600;
}

.tech-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #495057;
}

.tech-list li {
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.4;
}

.tech-list li:last-child {
  margin-bottom: 0;
}

.tech-list code {
  background: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: #495057;
}

/* Animations */
@keyframes fadeIn {
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

@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .sub-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .data-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .target-button {
    padding: 1.25rem;
    font-size: 1rem;
  }
  
  .progress-bar {
    width: 150px;
  }
}
</style>
