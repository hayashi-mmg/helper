module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts', 'jest.config.ts'],
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    'react/self-closing-comp': 'warn',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/strict-boolean-expressions': ['warn', {
      allowString: true,
      allowNumber: true,
      allowNullableObject: true,
    }],
    
    // React Hooks rules
    'react-hooks/exhaustive-deps': 'warn',
    
    // Accessibility rules
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    
    // Import rules
    'import/order': ['warn', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
        'object',
        'type',
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
    }],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'warn',
    'import/no-useless-path-segments': 'warn',
    'import/no-duplicates': 'warn',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'warn',
    'arrow-body-style': ['warn', 'as-needed'],
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
    'template-curly-spacing': ['warn', 'never'],
    'prefer-destructuring': ['warn', {
      array: true,
      object: true,
    }, {
      enforceForRenamedProperties: false,
    }],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['vite.config.ts', 'jest.config.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
}
