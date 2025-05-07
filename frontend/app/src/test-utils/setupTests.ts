/**
 * テスト実行のためのセットアップファイル
 * Jestが各テストを実行する前に自動的にインポートされます。
 */
import '@testing-library/jest-dom';

// コンソールエラーを静かにする（意図的なテストでは個別に有効化）
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('React does not recognize the') ||
             args[0].includes('Warning:') ||
             args[0].includes('Invalid prop'))
        ) {
            return;
        }
        originalConsoleError(...args);
    };
    console.log('テスト開始');
});

afterAll(() => {
    console.error = originalConsoleError;
    console.log('テスト終了');
});

// TextEncoderとTextDecoderの定義（react-router-domなどで必要）
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// グローバルなモック
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Fetch APIのモック
global.fetch = jest.fn();

// LocalStorageのモック
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// import.meta.env のモック
global.import = {
    meta: {
        env: {
            VITE_API_BASE_URL: 'http://localhost:8000/api/v1',
        },
    },
} as any;

// IntersectionObserver APIのモック
const mockIntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: null,
    rootMargin: '',
    thresholds: [0],
}));

global.IntersectionObserver = mockIntersectionObserver;

// 各テスト後のクリーンアップ
afterEach(() => {
    jest.clearAllMocks();
});