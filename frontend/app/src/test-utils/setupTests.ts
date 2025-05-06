// jestのセットアップファイル
// このファイルはテストを実行する前に実行される

// jest-domのカスタムマッチャーを追加
import '@testing-library/jest-dom';

// fetch APIのモック
global.fetch = jest.fn();

// MSWのモックを無効化（必要に応じてコメントアウト）
jest.mock('../mocks/server', () => ({
    server: {
        listen: jest.fn(),
        resetHandlers: jest.fn(),
        close: jest.fn(),
    },
}));

// ウィンドウのalertとconfirmをモック
window.alert = jest.fn();
window.confirm = jest.fn();

// localStorage, sessionStorageのモック
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
    key: jest.fn(),
    length: 0,
};

const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
    key: jest.fn(),
    length: 0,
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

// ResizeObserverのモック
class ResizeObserverMock {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserverMock;

// テスト開始前の共通処理
beforeAll(() => {
    console.log('テスト開始');
});

// 各テスト後のクリーンアップ
afterEach(() => {
    jest.clearAllMocks();
});

// テスト終了後の共通処理
afterAll(() => {
    console.log('テスト終了');
});