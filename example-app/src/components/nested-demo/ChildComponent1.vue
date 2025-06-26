<script setup lang="ts">
// Child Component 1 - Always visible component
// This component is always rendered and contains static content
</script>

<template>
  <div class="child-component-1">
    <div class="component-content">
      <div class="component-header">
        <h5>✅ Always Visible Component</h5>
        <span class="status-badge always-visible">Always Available</span>
      </div>
      
      <div class="content-area">
        <p class="description">
          This component is always rendered in the DOM and contains elements that are 
          immediately available for coach mark targeting.
        </p>
        
        <div class="feature-showcase">
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <span class="feature-text">Reliable targeting</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <span class="feature-text">No retry needed</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✨</span>
            <span class="feature-text">Instant availability</span>
          </div>
        </div>
        
        <div class="demo-element" id="always-available-element" data-testid="always-available">
          <h6>Demo Element</h6>
          <p>This element is always available for coach mark targeting.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.child-component-1 {
  width: 100%;
}

.component-content {
  border: 2px solid #28a745;
  border-radius: 8px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #28a745;
}

.component-header h5 {
  margin: 0;
  color: #155724;
  font-size: 1.1rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.always-visible {
  background: #28a745;
  color: white;
}

.description {
  margin: 0 0 1rem 0;
  color: #155724;
  line-height: 1.5;
  font-size: 0.9rem;
}

.feature-showcase {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 20px;
  border: 1px solid #28a745;
  font-size: 0.85rem;
  color: #155724;
}

.feature-icon {
  font-size: 1rem;
}

.feature-text {
  font-weight: 500;
}

.demo-element {
  background: white;
  border: 2px solid #28a745;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.demo-element h6 {
  margin: 0 0 0.5rem 0;
  color: #155724;
  font-size: 1rem;
  font-weight: 600;
}

.demo-element p {
  margin: 0;
  color: #155724;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .feature-showcase {
    flex-direction: column;
  }
  
  .feature-item {
    justify-content: center;
  }
}
</style>
