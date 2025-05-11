import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import PasswordResetForm from './PasswordResetForm';
import { Component } from 'react';

// テスト用のラッパーコンポーネント
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ChakraProvider>
            <BrowserRouter>
                {ui}
            </BrowserRouter>
        </ChakraProvider>
    );
};

// タイマーをモック化
jest.useFakeTimers();

describe('PasswordResetForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it('renders password reset form correctly', () => {
        renderWithProviders(<PasswordResetForm />);
        
        // フォーム要素の存在を確認
        expect(screen.getByTestId('password-reset-form')).toBeInTheDocument();
        expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /パスワードリセットリンクを送信/i })).toBeInTheDocument();
        
        // 説明テキストの存在を確認
        expect(screen.getByText(/登録時に使用したメールアドレスを入力してください/i)).toBeInTheDocument();
        
        // リンクの存在を確認
        expect(screen.getByText(/ログインページに戻る/i)).toBeInTheDocument();
        expect(screen.getByText(/アカウントをお持ちでないですか？/i)).toBeInTheDocument();
        expect(screen.getByText(/会員登録/i)).toBeInTheDocument();
    });
    
    it('shows custom error message when provided', () => {
        const errorMessage = 'カスタムエラーメッセージ';
        renderWithProviders(<PasswordResetForm externalError={errorMessage} />);
        
        // カスタムエラーメッセージの表示を確認
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    it('validates email input', async () => {
        renderWithProviders(<PasswordResetForm />);
        
        // 何も入力せずに送信
        fireEvent.click(screen.getByRole('button', { name: /パスワードリセットリンクを送信/i }));
        
        // バリデーションエラーのチェック
        await waitFor(() => {
            expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument();
        });
        
        // 不正なメールアドレスを入力
        fireEvent.input(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'invalid-email' }
        });
        
        // バリデーションエラーのチェック
        await waitFor(() => {
            expect(screen.getByText(/正しいメールアドレス形式で入力してください/i)).toBeInTheDocument();
        });
    });
    
    it('submits form with valid email and shows success message', async () => {
        const mockSuccess = jest.fn();
        
        renderWithProviders(<PasswordResetForm onSuccess={mockSuccess} />);
        
        // 正しい値を入力
        fireEvent.input(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'test@example.com' }
        });
        
        // フォーム送信
        fireEvent.click(screen.getByRole('button', { name: /パスワードリセットリンクを送信/i }));
        
        // ローディング状態を確認
        expect(screen.getByRole('button', { name: /送信中/i })).toBeInTheDocument();
        
        // タイマーを進めて、モック処理を完了させる
        jest.advanceTimersByTime(1000);
        
        // 成功メッセージが表示されることを確認
        await waitFor(() => {
            expect(screen.getByTestId('password-reset-success')).toBeInTheDocument();
            expect(screen.getByText(/パスワードリセット用のメールを送信しました/i)).toBeInTheDocument();
            expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
            expect(mockSuccess).toHaveBeenCalled();
        });
        
        // 成功後のログインページに戻るボタンの存在を確認
        expect(screen.getByRole('button', { name: /ログインページに戻る/i })).toBeInTheDocument();
    });
    
    it('uses custom URLs for links', () => {
        renderWithProviders(
            <PasswordResetForm 
                loginUrl="/custom-login" 
                registerUrl="/custom-register" 
            />
        );
        
        // リンクURLの確認
        const loginLink = screen.getByText(/ログインページに戻る/i);
        expect(loginLink.closest('a')).toHaveAttribute('href', '/custom-login');
        
        const registerLink = screen.getByText(/会員登録/i);
        expect(registerLink.closest('a')).toHaveAttribute('href', '/custom-register');
    });
});
