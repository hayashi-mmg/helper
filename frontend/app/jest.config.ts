import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.app.json',
        }],
    },
    moduleNameMapper: {
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
    collectCoverage: true,
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
};

export default config;