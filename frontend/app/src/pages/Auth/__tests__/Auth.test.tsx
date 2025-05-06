import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '../index';

// Chakra UIコンポーネントのモック
vi.mock('@chakra-ui/react', async () => {
    const actual = await vi.importActual('@chakra-ui/react');
    return {
        ...actual as any,
        // TabsコンポーネントのsetIndexを実際に機能させるためにTabsの実装を保持
    };
});

// ログインフォームと新規登録フォームのモック
vi.mock('../LoginForm', () => ({
    default: () => <div data-testid="login-form">ログインフォーム（モック）</div>
}));

vi.mock('../RegisterForm', () => ({
    default: () => <div data-testid="register-form">新規登録フォーム（モック）</div>
}));

describe('AuthPage', () => {
    it('認証ページが正しくレンダリングされること', () => {
        render(<AuthPage />);
        
        // ヘッダー要素を確認
        expect(screen.getByText('ヘルパーシステム')).toBeInTheDocument();
        expect(screen.getByText('アカウント管理')).toBeInTheDocument();
        
        // タブが表示されていることを確認
        expect(screen.getByText('ログイン')).toBeInTheDocument();
        expect(screen.getByText('新規登録')).toBeInTheDocument();
        
        // デフォルトでログインタブが表示されていることを確認
        expect(screen.getByText('ログインフォーム')).toBeInTheDocument();
    });

    it('タブを切り替えると対応するコンテンツが表示されること', () => {
        render(<AuthPage />);
        
        // 初期状態ではログインタブが表示されている
        expect(screen.getByText('ログインフォームは将来的に実装されます。')).toBeInTheDocument();
        
        // 新規登録タブをクリック
        fireEvent.click(screen.getByText('新規登録'));
        
        // 新規登録フォームが表示される
        expect(screen.getByText('新規登録フォームは将来的に実装されます。')).toBeInTheDocument();
    });
});