import { render, screen } from '@testing-library/react';
import App from './App';

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
    render(<App />);
    
    // アプリ名が表示されていることを確認
    expect(screen.getByText('テストアプリ')).toBeInTheDocument();
    
    // 初期化完了メッセージが表示されていることを確認
    expect(screen.getByText('プロジェクト初期化完了')).toBeInTheDocument();
    
    // 完了項目が表示されていることを確認
    expect(screen.getByText('プロジェクト構造の最適化')).toBeInTheDocument();
    expect(screen.getByText('セキュリティ設定の強化')).toBeInTheDocument();
    expect(screen.getByText('環境変数の設定')).toBeInTheDocument();
    expect(screen.getByText('テスト環境の構築')).toBeInTheDocument();
    
    // フッターが表示されていることを確認
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} テストアプリ`)).toBeInTheDocument();
  });

  it('CSRFトークンのmetaタグが追加される', () => {
    render(<App />);
    
    // CSRFトークンのmetaタグが追加されていることを確認
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    expect(metaTag).not.toBeNull();
    expect(metaTag?.getAttribute('content')).toBe('test-uuid');
  });
});