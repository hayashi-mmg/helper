import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';
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

describe('RegisterForm', () => {
    // 各テスト前にモックをリセット
    beforeEach(() => {
        vi.clearAllMocks();
        
        // デフォルトのモック実装
        (useAuthStore as any).mockReturnValue({
            register: vi.fn().mockResolvedValue(undefined),
            loading: false,
        });
    });

    it('正しくレンダリングされる', () => {
        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        // 主要な要素の存在チェック
        expect(screen.getByLabelText(/お名前/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
        expect(screen.getByLabelText(/パスワード（確認）/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /登録する/i })).toBeInTheDocument();
        expect(screen.getByText(/既にアカウントをお持ちですか？/i)).toBeInTheDocument();
    });

    it('空のフォームを送信するとエラーが表示される', async () => {
        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        // 送信ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /登録する/i }));
        
        // エラーメッセージの確認
        expect(await screen.findByText(/すべての項目を正しく入力してください/i)).toBeInTheDocument();
        
        // register関数が呼び出されていないことを確認
        const { register } = useAuthStore() as any;
        expect(register).not.toHaveBeenCalled();
    });

    it('パスワード不一致の場合にエラーが表示される', async () => {
        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        // フォームに入力（パスワードが一致しない）
        fireEvent.change(screen.getByLabelText(/お名前/i), {
            target: { value: '山田太郎' },
        });
        fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('パスワード'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByLabelText(/パスワード（確認）/i), {
            target: { value: 'password456' }, // 意図的に一致しないパスワード
        });

        // 送信ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /登録する/i }));
        
        // エラーメッセージの確認
        expect(await screen.findByText(/すべての項目を正しく入力してください/i)).toBeInTheDocument();
        
        // register関数が呼び出されていないことを確認
        const { register } = useAuthStore() as any;
        expect(register).not.toHaveBeenCalled();
    });

    it('正しいフォーム入力で登録が実行される', async () => {
        const mockRegister = vi.fn().mockResolvedValue(undefined);
        (useAuthStore as any).mockReturnValue({
            register: mockRegister,
            loading: false,
        });

        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        // フォームに正しく入力
        fireEvent.change(screen.getByLabelText(/お名前/i), {
            target: { value: '山田太郎' },
        });
        fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('パスワード'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByLabelText(/パスワード（確認）/i), {
            target: { value: 'password123' },
        });

        // 送信ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /登録する/i }));

        // register関数が正しい引数で呼び出されることを確認
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith('test', 'test@example.com', 'password123');
        });
    });

    it('登録に失敗するとエラーメッセージが表示される', async () => {
        const mockError = new Error('ユーザー登録に失敗しました');
        const mockRegister = vi.fn().mockRejectedValue(mockError);
        
        (useAuthStore as any).mockReturnValue({
            register: mockRegister,
            loading: false,
        });

        render(
            <BrowserRouter>
                <RegisterForm />
            </BrowserRouter>
        );

        // フォームに正しく入力
        fireEvent.change(screen.getByLabelText(/お名前/i), {
            target: { value: '山田太郎' },
        });
        fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText('パスワード'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByLabelText(/パスワード（確認）/i), {
            target: { value: 'password123' },
        });

        // 送信ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /登録する/i }));

        // エラーメッセージが表示されることを確認
        await waitFor(() => {
            expect(screen.getByText('ユーザー登録に失敗しました')).toBeInTheDocument();
        });
    });
});
