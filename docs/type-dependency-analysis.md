# TypeScript Circular Dependency Analysis

## Executive Summary

**Status**: CRITICAL - Multiple circular dependencies detected in core type system
**Impact**: Forward reference violations, potential compilation issues, poor maintainability
**Root Cause**: Core types (CoachMarkInstance, CoachMarkStep, CoachMarkState, CoachMarkConfig) reference each other in circular patterns

## Detailed Dependency Graph Analysis

### Current Type Definition Order (Lines in index.ts)

1. **RetryConfig** (Lines 155-162)
   - ❌ **FORWARD REFERENCE**: References `CoachMarkStep` (defined at line 241)
   - Dependencies: CoachMarkStep (not yet defined)

2. **HookContext** (Lines 177-181)
   - ❌ **FORWARD REFERENCE**: References `CoachMarkConfig`, `CoachMarkState`, `CoachMarkInstance`
   - Dependencies: CoachMarkConfig (line 267), CoachMarkState (line 323), CoachMarkInstance (line 355)

3. **CoachMarkHook** (Lines 184-188)
   - ❌ **FORWARD REFERENCE**: References `CoachMarkStep`, `HookContext`
   - Dependencies: CoachMarkStep (line 241), HookContext (line 177)

4. **AsyncTourHook** (Lines 191-199)
   - ❌ **FORWARD REFERENCE**: References `CoachMarkStep`, `CoachMarkInstance`
   - Dependencies: CoachMarkStep (line 241), CoachMarkInstance (line 355)

5. **CoachMarkStep** (Lines 241-261)
   - ✅ **VALID**: References PopoverConfig (defined earlier), RetryConfig, CoachMarkHook, AsyncTourHook
   - Dependencies: PopoverConfig ✅, RetryConfig ✅, CoachMarkHook ✅, AsyncTourHook ✅

6. **CoachMarkConfig** (Lines 267-320)
   - ✅ **VALID**: References CoachMarkStep (defined earlier), CoachMarkHook, HookContext
   - Dependencies: CoachMarkStep ✅, CoachMarkHook ✅, HookContext ❌ (circular)

7. **CoachMarkState** (Lines 323-347)
   - ✅ **VALID**: References CoachMarkStep (defined earlier)
   - Dependencies: CoachMarkStep ✅

8. **CoachMarkInstance** (Lines 355-381)
   - ✅ **VALID**: References CoachMarkConfig, CoachMarkStep (both defined earlier)
   - Dependencies: CoachMarkConfig ✅, CoachMarkStep ✅

### Circular Dependency Chains Identified

#### **Chain 1: Hook System Circular Dependency**
```
HookContext → CoachMarkConfig → CoachMarkHook → HookContext
```
- **HookContext** (line 177) references **CoachMarkConfig** (line 267)
- **CoachMarkConfig** (line 267) references **CoachMarkHook** (line 184)
- **CoachMarkHook** (line 184) references **HookContext** (line 177)
- **Severity**: HIGH - Core hook system affected

#### **Chain 2: Retry System Forward Reference**
```
RetryConfig → CoachMarkStep (forward reference)
```
- **RetryConfig** (line 155) references **CoachMarkStep** (line 241)
- **Definition Order**: RetryConfig defined before CoachMarkStep
- **Severity**: MEDIUM - Retry callbacks affected

#### **Chain 3: Hook Type Forward References**
```
CoachMarkHook → CoachMarkStep (forward reference)
AsyncTourHook → CoachMarkStep (forward reference)
AsyncTourHook → CoachMarkInstance (forward reference)
```
- **CoachMarkHook** (line 184) references **CoachMarkStep** (line 241)
- **AsyncTourHook** (line 191) references **CoachMarkStep** (line 241) and **CoachMarkInstance** (line 355)
- **Severity**: HIGH - Core hook types affected

### Impact Analysis

#### **Compilation Issues**
- TypeScript may fail to resolve types in certain scenarios
- IDE IntelliSense may be degraded
- Declaration file generation may be affected

#### **Developer Experience Issues**
- Confusing error messages when types can't be resolved
- Poor autocomplete and type checking
- Difficulty understanding type relationships

#### **Maintainability Issues**
- Adding new types becomes risky
- Refactoring existing types is complex
- Type system is fragile and error-prone

## Root Cause Analysis

### **Primary Causes**

1. **Monolithic Type Design**
   - Core types are too tightly coupled
   - No clear separation of concerns
   - Missing abstraction layers

2. **Inadequate Type Abstraction**
   - Base interfaces are too minimal
   - Missing intermediate abstraction layers
   - Hook system not properly abstracted

3. **Definition Order Issues**
   - Types defined in usage order rather than dependency order
   - Hook types defined before the types they reference
   - No clear dependency hierarchy

### **Secondary Causes**

1. **Missing Type Boundaries**
   - No clear separation between configuration, state, and behavior
   - Hook context mixes concerns
   - Retry system tightly coupled to step definitions

2. **Over-Engineering Base Interfaces**
   - Base interfaces too abstract to be useful
   - Main interfaces don't properly extend base interfaces
   - Duplication between base and main interfaces

## Proposed Resolution Strategy

### **Phase 1: Type Boundary Definition**
- Separate configuration, state, and behavior concerns
- Create clear type boundaries with minimal interfaces
- Define core abstractions that break circular dependencies

### **Phase 2: Hook System Redesign**
- Create hook-specific abstractions
- Separate hook context from main interfaces
- Use generic types for hook parameters

### **Phase 3: Dependency Order Restructuring**
- Reorganize types in strict dependency order
- Eliminate all forward references
- Validate dependency graph is acyclic

### **Phase 4: Validation and Testing**
- Comprehensive build testing
- Type safety validation
- Developer experience testing

## Success Metrics

- ✅ Zero forward references
- ✅ Zero circular dependencies
- ✅ All builds pass
- ✅ All tests pass
- ✅ ESLint passes with no-explicit-any rule
- ✅ Excellent IDE IntelliSense
- ✅ Maintainable type system
