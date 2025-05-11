module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:storybook/recommended',
    'prettier',
  ],
  plugins: [
    'react', 
    'react-hooks', 
    '@typescript-eslint', 
    'import', 
    'jsx-a11y',
    'unused-imports'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    // 単一のtsconfig.jsonを使用
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        // プロジェクトのルートを指定
        project: './tsconfig.json',
      },
    },
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  rules: {
    // React関連のルール
    'react/react-in-jsx-scope': 'off', // React 17+ではインポート不要
    'react/prop-types': 'off', // TypeScriptを使用しているので不要
    'react/display-name': 'off', // ストーリーブックやテストで問題になることがある
    'react-hooks/exhaustive-deps': 'warn',
    
    // TypeScript関連のルール
    '@typescript-eslint/no-explicit-any': 'warn', // anyは警告レベルに
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-ignore': 'allow-with-description',
      'ts-expect-error': 'allow-with-description',
    }],
    '@typescript-eslint/no-empty-object-type': 'off', // 空のオブジェクト型を許可
    '@typescript-eslint/no-require-imports': 'off', // 必要な場合はrequireを許可
    '@typescript-eslint/no-unsafe-function-type': 'warn',
    
    // インポート関連のルール
    'import/order': ['warn', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always-and-inside-groups',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],
    'import/no-unresolved': 'off', // TypeScriptの解決に任せる
    'import/no-named-as-default': 'warn',
    'import/export': 'warn',
    'import/no-duplicates': 'warn',
    
    // 未使用のインポートを削除
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': ['warn', {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_'
    }],
    
    // その他のルール
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'react/no-unknown-property': ['error', { ignore: ['colorscheme', 'variant'] }],
    'no-case-declarations': 'off', // switch文内での宣言を許可
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.stories.{js,jsx,ts,tsx}'],
      rules: {
        'react-hooks/rules-of-hooks': 'off', // テストとストーリーではフックのルールを緩和
      },
    },
  ],
}
