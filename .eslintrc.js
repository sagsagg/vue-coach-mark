module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'error', // Prevent any type usage
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-redeclare': 'error',

    // Code quality rules
    '@typescript-eslint/no-use-before-define': ['error', {
      functions: false,  // Allow function hoisting
      classes: true,     // Disallow class usage before definition
      variables: true,   // Disallow variable usage before definition
      allowNamedExports: false
    }],
    

    
    // General rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-use-before-define': 'off', // Disabled in favor of TypeScript version
    'no-unused-vars': 'off', // Disabled in favor of TypeScript version
    semi: 'off',
    '@typescript-eslint/semi': 'error',
    camelcase: 'off',
    'no-redeclare': 'off',

    // Import/Export rules
    'import/no-cycle': ['error', {
      maxDepth: 10,
      ignoreExternal: true
    }],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off' // Allow any in tests for mocking
      }
    }
  ]
};
