# ESLint Configuration Guide

This document explains the ESLint configuration for the Vue Coach Mark project, including the three key code quality rules that have been implemented.

## Overview

The project uses ESLint with TypeScript and Vue.js support to enforce code quality standards. The configuration includes three critical rules to prevent common coding issues:

1. **`@typescript-eslint/no-use-before-define`** - Prevents using variables, functions, or classes before they are defined
2. **`@typescript-eslint/no-unused-vars`** - Flags variables that are declared but never used
3. **`import/no-cycle`** - Detects circular import dependencies between modules

## Configuration File

The ESLint configuration is located in `.eslintrc.js` at the project root.

### Key Plugins

- `@typescript-eslint` - TypeScript-specific linting rules
- `import` - Import/export related rules including circular dependency detection
- `vue` - Vue.js specific linting rules

### Environment Setup

```javascript
env: {
  node: true,
  browser: true,
  es2022: true
}
```

## Rule Details

### 1. No Use Before Define (`@typescript-eslint/no-use-before-define`)

**Purpose**: Prevents accessing variables, functions, or classes before their declaration.

**Configuration**:
```javascript
'@typescript-eslint/no-use-before-define': ['error', {
  functions: false,  // Allow function hoisting
  classes: true,     // Disallow class usage before definition
  variables: true,   // Disallow variable usage before definition
  allowNamedExports: false
}]
```

**What it catches**:
- Variables used before declaration
- Classes instantiated before definition
- Arrow functions called before assignment

**What it allows**:
- Function declarations (due to hoisting)
- Named exports (when configured)

### 2. No Unused Variables (`@typescript-eslint/no-unused-vars`)

**Purpose**: Identifies variables, functions, and imports that are declared but never used.

**Configuration**:
```javascript
'@typescript-eslint/no-unused-vars': ['error', { 
  argsIgnorePattern: '^_',
  varsIgnorePattern: '^_'
}]
```

**What it catches**:
- Unused variables and constants
- Unused function parameters
- Unused imports
- Variables that are only assigned but never read

**What it ignores**:
- Variables and parameters prefixed with underscore (`_`)

### 3. No Circular Dependencies (`import/no-cycle`)

**Purpose**: Prevents circular import dependencies that can cause runtime issues.

**Configuration**:
```javascript
'import/no-cycle': ['error', { 
  maxDepth: 10,
  ignoreExternal: true 
}]
```

**What it catches**:
- Direct circular imports (A imports B, B imports A)
- Indirect circular imports (A → B → C → A)
- Complex dependency cycles up to 10 levels deep

**What it ignores**:
- External package dependencies

## Running ESLint

### Check for Issues
```bash
npm run lint -- --no-fix
```

### Auto-fix Issues
```bash
npm run lint
```

### Check Specific Files
```bash
npx eslint src/components/MyComponent.vue --no-fix
```

## Examples

### ❌ Code that violates the rules:

```typescript
// no-use-before-define violation
console.log(myVar); // Error: used before defined
const myVar = 'hello';

// no-unused-vars violation
const unusedVariable = 'never used'; // Error: declared but not used

// import/no-cycle violation (in file A)
import { functionB } from './fileB';
// fileB imports from fileA, creating a cycle
```

### ✅ Code that follows the rules:

```typescript
// Proper variable definition order
const myVar = 'hello';
console.log(myVar);

// All variables are used
const userName = 'John';
const greeting = `Hello, ${userName}!`;
console.log(greeting);

// No circular dependencies
import { utility } from './utils'; // utils doesn't import from this file
```

## Integration with Development Workflow

### Pre-commit Hooks
Consider adding ESLint to your pre-commit hooks to catch issues early:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint"
    }
  }
}
```

### IDE Integration
Most modern IDEs support ESLint integration:
- **VS Code**: Install the ESLint extension
- **WebStorm**: ESLint support is built-in
- **Vim/Neovim**: Use plugins like ALE or coc-eslint

### CI/CD Integration
Add ESLint checks to your CI pipeline:

```yaml
- name: Run ESLint
  run: npm run lint -- --max-warnings=0
```

## Troubleshooting

### Common Issues

1. **"Cannot find module 'eslint-plugin-import'"**
   - Solution: Install the plugin with `npm install --save-dev eslint-plugin-import`

2. **Rules not being applied**
   - Check that the plugin is listed in the `plugins` array
   - Verify the rule name is correct (e.g., `import/no-cycle` not `no-cycle`)

3. **Too many false positives**
   - Adjust rule configuration options
   - Use ignore patterns for specific cases
   - Consider using `// eslint-disable-next-line` for exceptional cases

### Disabling Rules

For exceptional cases, you can disable rules:

```typescript
// Disable for next line
// eslint-disable-next-line @typescript-eslint/no-use-before-define
const result = processData();

// Disable for entire file
/* eslint-disable import/no-cycle */
```

## Benefits

These rules help maintain:
- **Code clarity**: Variables and functions are defined before use
- **Clean codebase**: No unused code cluttering the project
- **Maintainable architecture**: No circular dependencies that complicate understanding
- **Better debugging**: Clearer execution flow and dependency relationships
- **Team consistency**: Shared coding standards across the team

## Further Reading

- [ESLint Official Documentation](https://eslint.org/docs/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [ESLint Plugin Import](https://github.com/import-js/eslint-plugin-import)
