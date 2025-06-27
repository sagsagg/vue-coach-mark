# TypeScript Circular Dependency Resolution Plan

## Strategic Overview

**Objective**: Eliminate all circular dependencies and forward references in the vue-coach-mark type system while maintaining full functionality and backward compatibility.

**Approach**: Progressive type abstraction using advanced TypeScript patterns to create a clean, maintainable type hierarchy.

## Advanced TypeScript Patterns to Employ

### 1. **Conditional Type Abstraction**
```typescript
// Use conditional types to defer type resolution
type StepReference<T> = T extends { step: infer S } ? S : never
```

### 2. **Interface Merging Strategy**
```typescript
// Split interfaces across declaration boundaries
interface BaseHookContext {
  readonly element: Element | undefined
}

// Merge additional properties later
interface BaseHookContext {
  readonly config: unknown // Resolved later
}
```

### 3. **Generic Type Parameters**
```typescript
// Use generics to defer concrete type binding
interface HookFunction<TStep, TConfig, TState, TInstance> {
  (element: Element | undefined, step: TStep, context: {
    config: TConfig
    state: TState
    coachMark: TInstance
  }): void | Promise<void>
}
```

### 4. **Mapped Type Abstractions**
```typescript
// Create mapped types for flexible type relationships
type StepProperties<T> = {
  readonly [K in keyof T]: T[K]
}
```

## Implementation Plan

### **Phase 1: Core Abstraction Layer (Steps 1-3)**

#### **Step 1: Create Minimal Core Interfaces**
**Objective**: Define the absolute minimum interfaces needed to break circular dependencies

**Implementation**:
```typescript
// Core minimal interfaces - no dependencies
interface CoreElement {
  readonly element?: string | Element | (() => Element)
  readonly id?: string
}

interface CoreConfig {
  readonly animate?: boolean
  readonly overlayColor?: string
}

interface CoreState {
  readonly isInitialized?: boolean
  readonly activeIndex?: number
}

interface CoreInstance {
  readonly isActive: () => boolean
  readonly getActiveIndex: () => number | undefined
}
```

**Risk Assessment**: LOW - These are minimal interfaces with no dependencies
**Rollback Strategy**: Simple revert - no other types depend on these yet

#### **Step 2: Create Hook Abstraction Layer**
**Objective**: Define hook types using generic parameters to avoid concrete type dependencies

**Implementation**:
```typescript
// Generic hook types - no concrete dependencies
type GenericHookFunction<TStep, TConfig, TState, TInstance> = (
  element: Element | undefined,
  step: TStep,
  context: {
    config: TConfig
    state: TState
    coachMark: TInstance
  }
) => void | Promise<void>

type GenericAsyncHook<TStep, TInstance> = ({
  element,
  step,
  coachMark
}: {
  element: Element | undefined
  step: TStep
  coachMark: TInstance
}) => void | Promise<void>
```

**Risk Assessment**: LOW - Generic types don't create dependencies
**Rollback Strategy**: Remove generic types, revert to previous hook definitions

#### **Step 3: Create Retry System Abstraction**
**Objective**: Define retry types using generic step references

**Implementation**:
```typescript
// Generic retry configuration
interface GenericRetryConfig<TStep> {
  readonly enabled?: boolean
  readonly maxAttempts?: number
  readonly delay?: number
  readonly exponentialBackoff?: boolean
  readonly onRetry?: (attempt: number, step: TStep) => void
  readonly onMaxAttemptsReached?: (step: TStep) => void
}
```

**Risk Assessment**: LOW - Generic approach eliminates forward references
**Rollback Strategy**: Revert to unknown type for step parameter

### **Phase 2: Progressive Type Building (Steps 4-6)**

#### **Step 4: Build Configuration Types**
**Objective**: Create configuration types that extend core interfaces and use generic hooks

**Implementation**:
```typescript
// Configuration using generic hooks
interface PopoverConfig<TStep, TConfig, TState, TInstance> extends CoreConfig {
  readonly onNextClick?: GenericHookFunction<TStep, TConfig, TState, TInstance>
  readonly onPrevClick?: GenericHookFunction<TStep, TConfig, TState, TInstance>
  // ... other properties
}

// Step definition using generic types
interface GenericStep<TConfig, TState, TInstance> extends CoreElement {
  readonly popover?: PopoverConfig<GenericStep<TConfig, TState, TInstance>, TConfig, TState, TInstance>
  readonly retry?: GenericRetryConfig<GenericStep<TConfig, TState, TInstance>>
  // ... other properties
}
```

**Risk Assessment**: MEDIUM - Complex generic relationships
**Rollback Strategy**: Simplify generics, use intermediate interfaces

#### **Step 5: Build State and Instance Types**
**Objective**: Create state and instance types using the established generic patterns

**Implementation**:
```typescript
// State type using generic step reference
interface GenericState<TStep> extends CoreState {
  activeStep?: TStep
  previousStep?: TStep
  currentActiveStep?: TStep
  internalPreviousStep?: TStep
  shouldRenderPopover?: { element: Element; step: TStep }
  shouldRepositionPopover?: { element: Element; step: TStep }
}

// Instance type using generic references
interface GenericInstance<TStep, TConfig, TState> extends CoreInstance {
  readonly getActiveStep: () => TStep | undefined
  readonly setConfig: (config: TConfig) => void
  readonly setSteps: (steps: readonly TStep[]) => void
  readonly getConfig: () => TConfig
  readonly getState: <K extends keyof TState>(key?: K) => TState[K]
  readonly highlight: (step: TStep) => void
  // ... other methods
}
```

**Risk Assessment**: MEDIUM - Generic constraints may be complex
**Rollback Strategy**: Use interface merging instead of generics

#### **Step 6: Create Concrete Type Bindings**
**Objective**: Bind generic types to concrete implementations using type aliases

**Implementation**:
```typescript
// Concrete type bindings - resolve all generics
type CoachMarkStep = GenericStep<CoachMarkConfig, CoachMarkState, CoachMarkInstance>
type CoachMarkConfig = GenericConfig<CoachMarkStep, CoachMarkState, CoachMarkInstance>
type CoachMarkState = GenericState<CoachMarkStep>
type CoachMarkInstance = GenericInstance<CoachMarkStep, CoachMarkConfig, CoachMarkState>

// Concrete hook types
type CoachMarkHook = GenericHookFunction<CoachMarkStep, CoachMarkConfig, CoachMarkState, CoachMarkInstance>
type AsyncTourHook = GenericAsyncHook<CoachMarkStep, CoachMarkInstance>
```

**Risk Assessment**: HIGH - Circular type binding may fail
**Rollback Strategy**: Use interface merging or conditional types

### **Phase 3: Validation and Refinement (Steps 7-9)**

#### **Step 7: Build Verification**
**Objective**: Ensure all types compile correctly and maintain functionality

**Validation Checklist**:
- [ ] TypeScript compilation succeeds
- [ ] No forward reference errors
- [ ] All existing functionality preserved
- [ ] ESLint passes with no-explicit-any rule
- [ ] IDE IntelliSense works correctly

**Risk Assessment**: MEDIUM - May discover issues with generic approach
**Rollback Strategy**: Revert to previous working state, try alternative approach

#### **Step 8: Test Suite Validation**
**Objective**: Ensure all tests pass with new type system

**Validation Checklist**:
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Type-specific tests pass
- [ ] No runtime errors introduced

**Risk Assessment**: LOW - Tests should pass if types are correct
**Rollback Strategy**: Fix type issues or revert if unfixable

#### **Step 9: Developer Experience Testing**
**Objective**: Validate that the new type system provides excellent developer experience

**Validation Checklist**:
- [ ] Autocomplete works correctly
- [ ] Error messages are clear and helpful
- [ ] Type inference works as expected
- [ ] Documentation generation works
- [ ] No performance issues with type checking

**Risk Assessment**: LOW - Should improve with better type organization
**Rollback Strategy**: Optimize type definitions or simplify if needed

## Alternative Strategies

### **Strategy A: Interface Merging Approach**
If generics prove too complex, use TypeScript's interface merging:

```typescript
// Base interface
interface CoachMarkStep {
  readonly element?: string | Element | (() => Element)
  readonly id?: string
}

// Merge additional properties later
interface CoachMarkStep {
  readonly popover?: PopoverConfig
  readonly onHighlighted?: CoachMarkHook
}
```

### **Strategy B: Conditional Types Approach**
Use conditional types to defer type resolution:

```typescript
type HookContext<T = unknown> = T extends CoachMarkConfig 
  ? { config: T; state: CoachMarkState; coachMark: CoachMarkInstance }
  : { config: unknown; state: unknown; coachMark: unknown }
```

### **Strategy C: Namespace Approach**
Use TypeScript namespaces to organize related types:

```typescript
namespace CoachMark {
  export interface Step { /* ... */ }
  export interface Config { /* ... */ }
  export interface State { /* ... */ }
  export interface Instance { /* ... */ }
}
```

## Risk Mitigation

### **High-Risk Areas**
1. **Generic Type Binding**: Complex circular generic relationships
2. **Type Inference**: May break with complex generics
3. **Backward Compatibility**: Existing code may need updates

### **Mitigation Strategies**
1. **Incremental Implementation**: Test each step thoroughly
2. **Comprehensive Testing**: Validate at each phase
3. **Multiple Fallback Plans**: Have alternative approaches ready
4. **Documentation**: Document all changes and decisions

## Success Criteria

### **Technical Criteria**
- ✅ Zero circular dependencies
- ✅ Zero forward references
- ✅ Zero `any` types
- ✅ All builds pass
- ✅ All tests pass
- ✅ ESLint compliance

### **Quality Criteria**
- ✅ Excellent IDE support
- ✅ Clear error messages
- ✅ Maintainable code structure
- ✅ Good performance
- ✅ Comprehensive documentation

### **Business Criteria**
- ✅ No breaking changes for users
- ✅ Improved developer experience
- ✅ Reduced maintenance burden
- ✅ Future-proof architecture
