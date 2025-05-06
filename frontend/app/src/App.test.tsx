import { render, screen } from '@testing-library/react';
import App from './App';
import { AllProviders } from './test-utils/providers';

// import.meta.envをモック
jest.mock('./utils/env', () => ({
  getEnv: jest.fn().mockImplementation((key, defaultValue) => {
    if (key === 'VITE_APP_NAME') {
      return 'テストアプリ';
    }
    return defaultValue;
  }),
}));

// setupCspViolationReportingをモック
jest.mock('./utils/security', () => ({
  setupCspViolationReporting: jest.fn(),
}));

describe('App', () => {
  // 各テスト前にRandomUUIDをモック
  beforeAll(() => {
    // crypto.randomUUIDをモック
    Object.defineProperty(global.crypto, 'randomUUID', {
      value: jest.fn().mockReturnValue('test-uuid'),
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('アプリケーションが正しくレンダリングされる', () => {
    render(
      <AllProviders>
        <App />
      </AllProviders>
    );
    
    // アプリ名が表示されていることを確認
    expect(screen.getByText('テストアプリ')).toBeInTheDocument();
    
    // UIライブラリ導入完了メッセージが表示されていることを確認
    expect(screen.getByText('UIライブラリ導入完了')).toBeInTheDocument();
    
    // 完了項目が表示されていることを確認
    expect(screen.getByText('Chakra UIのインストールと基本設定')).toBeInTheDocument();
    expect(screen.getByText('カスタムテーマの作成')).toBeInTheDocument();
    expect(screen.getByText('グローバルスタイルの適用')).toBeInTheDocument();
    expect(screen.getByText('基本コンポーネントの実装')).toBeInTheDocument();
    expect(screen.getByText('テストコードの作成')).toBeInTheDocument();
    
    // フッターが表示されていることを確認
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} テストアプリ`)).toBeInTheDocument();
  });

  it('CSRFトークンのmetaタグが追加される', () => {
    render(
      <AllProviders>
        <App />
      </AllProviders>
    );
    
    // CSRFトークンのmetaタグが追加されていることを確認
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    expect(metaTag).not.toBeNull();
    expect(metaTag?.getAttribute('content')).toBe('test-uuid');
  });
});