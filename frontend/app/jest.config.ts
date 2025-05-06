import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.app.json',
            useESM: true,
            isolatedModules: true,
        }],
    },
    moduleNameMapper: {
        // 外部ライブラリのモック
        '^@chakra-ui/react$': '<rootDir>/src/test-utils/mocks/chakra.tsx',
        '^@chakra-ui/theme-tools$': '<rootDir>/src/test-utils/mocks/chakra-theme-tools.tsx',
        // パスエイリアスの設定
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@features/(.*)$': '<rootDir>/src/features/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
        '^@styles/(.*)$': '<rootDir>/src/styles/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1',
        '^@mocks/(.*)$': '<rootDir>/src/mocks/$1',
        // 静的ファイルのモック
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/src/test-utils/fileMock.js',
        '\\.(css|less|scss|sass)$': '<rootDir>/src/test-utils/styleMock.js'
    },
    setupFilesAfterEnv: ['<rootDir>/src/test-utils/setupTests.ts'],
    setupFiles: ['./.jest.env.js'],
    
    // カバレッジ設定（デフォルトでは無効）
    collectCoverage: false,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/main.tsx',
        '!src/vite-env.d.ts',
        '!src/test-utils/**',
        '!src/mocks/**',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    testMatch: [
        '**/__tests__/**/*.test.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    
    // パフォーマンス向上設定
    maxWorkers: '50%',
    cache: true,
    cacheDirectory: '<rootDir>/node_modules/.cache/jest',
    
    // 変換が不要なパスを無視
    transformIgnorePatterns: [
        '/node_modules/(?!(@chakra-ui|nanoid)/)'
    ],
    
    // モジュール形式の設定
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    
    // エラー処理の改善
    bail: 1,  // 最初のテスト失敗で終了
    verbose: false,  // 出力を減らして実行を高速化
    
    // import.meta.env のモック（.jest.env.jsに移動）
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
};

export default config;