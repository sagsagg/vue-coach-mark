<script setup lang="ts">
// SubChildComponent2 - Conditionally rendered with v-if
// This component only exists in the DOM when the parent condition is true
</script>

<template>
  <div class="sub-child-component-2">
    <div class="sub-component-content">
      <div class="sub-header">
        <h6>🎯 Conditional Element (v-if)</h6>
        <span class="render-badge">Rendered</span>
      </div>
      
      <div class="sub-content">
        <p class="sub-description">
          This element is only present in the DOM when the parent condition is true.
          Coach marks will need to retry until this element becomes available.
        </p>
        
        <div class="retry-info">
          <div class="retry-item">
            <span class="retry-icon">🔄</span>
            <span class="retry-text">Requires retry mechanism</span>
          </div>
          <div class="retry-item">
            <span class="retry-icon">⏱️</span>
            <span class="retry-text">Waits for DOM insertion</span>
          </div>
        </div>
        
        <!-- This is the target element for the coach mark -->
        <button 
          id="conditional-element" 
          data-testid="conditional-element"
          class="target-button"
        >
          🎯 Coach Mark Target
          <span class="target-subtitle">Click me during the tour!</span>
        </button>
        
        <div class="technical-info">
          <h6>Technical Details:</h6>
          <ul class="tech-list">
            <li><code>v-if="isActive"</code> - Complete DOM removal when false</li>
            <li><code>id="conditional-element"</code> - Coach mark target</li>
            <li>Retry config: <code>maxAttempts: 5, delay: 1000ms</code></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-child-component-2 {
  width: 100%;
  animation: slideIn 0.3s ease-out;
}

.sub-component-content {
  background: white;
  border: 2px solid #28a745;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #28a745;
}

.sub-header h6 {
  margin: 0;
  color: #155724;
  font-size: 1rem;
  font-weight: 600;
}

.render-badge {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
}

.sub-description {
  margin: 0 0 1rem 0;
  color: #155724;
  line-height: 1.5;
  font-size: 0.9rem;
}

.retry-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.retry-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #d4edda;
  border-radius: 20px;
  border: 1px solid #c3e6cb;
  font-size: 0.85rem;
  color: #155724;
}

.retry-icon {
  font-size: 1rem;
}

.retry-text {
  font-weight: 500;
}

.target-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.target-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
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

/* Animation */
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

/* Responsive Design */
@media (max-width: 768px) {
  .sub-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .retry-info {
    flex-direction: column;
  }
  
  .retry-item {
    justify-content: center;
  }
  
  .target-button {
    padding: 1.25rem;
    font-size: 1rem;
  }
}
</style>
