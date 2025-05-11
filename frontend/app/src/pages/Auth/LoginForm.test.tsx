import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';
import { useAuthStore } from '../../hooks/useAuth';

// モックの作成
vi.mock('../../hooks/useAuth', () => ({
    useAuthStore: vi.fn(),
}));

// モックのuseNavigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe('LoginForm', () => {
    // 各テスト前にモックをリセット
    beforeEach(() => {
        vi.clearAllMocks();
        
        // デフォルトのモック実装
        (useAuthStore as any).mockReturnValue({
            login: vi.fn().mockResolvedValue(undefined),
            loading: false,
        });
    });

    it('正しくレンダリングされる', () => {
        render(
            <BrowserRouter>
                <LoginForm />
            </BrowserRouter>
        );

        // 主要な要素の存在チェック
        expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
        expect(screen.getByText(/パスワードをお忘れですか？/i)).toBeInTheDocument();
    });

    it('空のフォームを送信するとエラーが表示される', async () => {
        render(
            <BrowserRouter>
                <LoginForm />
            </BrowserRouter>
        );

        // 送信ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));
        
        // エラーメッセージの確認
        expect(await screen.findByText(/メールアドレスとパスワードを入力してください/i)).toBeInTheDocument();
        
        // login関数が呼び出されていないことを確認
        const { login } = useAuthStore() as any;
        expect(login).not.toHaveBeenCalled();
    });

    it('正しくフォームを送信すると、login関数が呼び出される', async () => {
        const mockLogin = vi.fn().mockResolvedValue(undefined);
        (useAuthStore as any).mockReturnValue({
            login: mockLogin,
            loading: false,
        });

        render(
            <BrowserRouter>
                <LoginForm />
            </BrowserRouter>
        );

        // フォームに入力
        fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/パスワード/i), {
            target: { value: 'password123' },
        });

        // 送信ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));

        // login関数が正しい引数で呼び出されることを確認
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('ログインに失敗すると、エラーメッセージが表示される', async () => {
        const mockError = new Error('認証エラーが発生しました');
        const mockLogin = vi.fn().mockRejectedValue(mockError);
        
        (useAuthStore as any).mockReturnValue({
            login: mockLogin,
            loading: false,
        });

        render(
            <BrowserRouter>
                <LoginForm />
            </BrowserRouter>
        );

        // フォームに入力
        fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/パスワード/i), {
            target: { value: 'password123' },
        });

        // 送信ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));

        // エラーメッセージが表示されることを確認
        await waitFor(() => {
            expect(screen.getByText('認証エラーが発生しました')).toBeInTheDocument();
        });
    });

    it('ローディング中は送信ボタンがローディング状態になる', () => {
        (useAuthStore as any).mockReturnValue({
            login: vi.fn(),
            loading: true,
        });

        render(
            <BrowserRouter>
                <LoginForm />
            </BrowserRouter>
        );

        // ローディング中のボタンの状態を確認
        const button = screen.getByRole('button', { name: /ログイン/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('disabled');
    });
});
