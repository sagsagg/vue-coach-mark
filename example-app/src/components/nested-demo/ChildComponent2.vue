<script setup lang="ts">
import SubChildComponent2 from './SubChildComponent2.vue'

// Define props
interface Props {
  isActive: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <div class="child-component-2">
    <div class="component-content">
      <div class="component-header">
        <h5>🔄 Conditional Rendering Container</h5>
        <span class="status-badge" :class="{ active: isActive, inactive: !isActive }">
          {{ isActive ? 'Active' : 'Inactive' }}
        </span>
      </div>
      
      <div class="content-area">
        <p class="description">
          This component contains a sub-component that uses <code>v-if</code> for conditional rendering.
          When the condition is false, the element is completely removed from the DOM.
        </p>
        
        <div class="condition-display">
          <div class="condition-info">
            <span class="condition-label">Current Condition:</span>
            <code class="condition-code">v-if="{{ isActive }}"</code>
          </div>
          <div class="dom-status">
            <span class="dom-label">DOM Status:</span>
            <span class="dom-value" :class="{ present: isActive, absent: !isActive }">
              {{ isActive ? 'Element Present' : 'Element Removed' }}
            </span>
          </div>
        </div>
        
        <div class="sub-component-container">
          <!-- This uses v-if, so the element is completely removed from DOM when isActive is false -->
          <SubChildComponent2 v-if="isActive" />
          
          <!-- Placeholder when component is not active -->
          <div v-else class="placeholder-content">
            <div class="placeholder-icon">👻</div>
            <p class="placeholder-text">
              SubChildComponent2 is not rendered (removed from DOM)
            </p>
            <p class="placeholder-hint">
              Toggle the "Show Conditional Component" button to render it
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.child-component-2 {
  width: 100%;
}

.component-content {
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ffc107;
}

.component-header h5 {
  margin: 0;
  color: #856404;
  font-size: 1.1rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #28a745;
  color: white;
}

.status-badge.inactive {
  background: #6c757d;
  color: white;
}

.description {
  margin: 0 0 1rem 0;
  color: #856404;
  line-height: 1.5;
  font-size: 0.9rem;
}

.description code {
  background: rgba(255, 193, 7, 0.3);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  color: #856404;
}

.condition-display {
  background: white;
  border: 1px solid #ffc107;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.condition-info,
.dom-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dom-status {
  margin-bottom: 0;
}

.condition-label,
.dom-label {
  font-weight: 500;
  color: #856404;
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

.dom-value {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.dom-value.present {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.dom-value.absent {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.sub-component-container {
  margin-top: 1rem;
}

/* Placeholder Styles */
.placeholder-content {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.7);
  border: 2px dashed #ffc107;
  border-radius: 8px;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.placeholder-text {
  margin: 0 0 0.5rem 0;
  color: #856404;
  font-weight: 500;
  font-size: 1rem;
}

.placeholder-hint {
  margin: 0;
  color: #856404;
  font-size: 0.9rem;
  opacity: 0.8;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .condition-info,
  .dom-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
