import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import LoginForm from './LoginForm';
import { useAuthStore } from '../../../store/useAuthStore';
import { Component } from 'react';

// モック設定
jest.mock('../../../store/useAuthStore');

const mockLoginFn = jest.fn();
const mockClearErrorFn = jest.fn();

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

describe('LoginForm Component', () => {
    beforeEach(() => {
        // モック関数をリセット
        jest.clearAllMocks();
        
        // useAuthStore モックの実装
        (useAuthStore as jest.Mock).mockImplementation((selector) => {
            const state = {
                login: mockLoginFn,
                error: null,
                clearError: mockClearErrorFn,
            };
            
            if (typeof selector === 'function') {
                return selector(state);
            }
            
            return state;
        });
    });
    
    it('renders login form correctly', () => {
        renderWithProviders(<LoginForm />);
        
        // フォーム要素の存在を確認
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
        expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
        
        // デフォルトではリンクが表示される
        expect(screen.getByText(/パスワードをお忘れですか？/i)).toBeInTheDocument();
        expect(screen.getByText(/アカウントをお持ちでないですか？/i)).toBeInTheDocument();
        expect(screen.getByText(/会員登録/i)).toBeInTheDocument();
    });
    
    it('hides forgot password link when showForgotPassword is false', () => {
        renderWithProviders(<LoginForm showForgotPassword={false} />);
        
        // パスワードリセットリンクが非表示になっていることを確認
        expect(screen.queryByText(/パスワードをお忘れですか？/i)).not.toBeInTheDocument();
    });
    
    it('hides sign up link when showSignUpLink is false', () => {
        renderWithProviders(<LoginForm showSignUpLink={false} />);
        
        // 会員登録リンクが非表示になっていることを確認
        expect(screen.queryByText(/アカウントをお持ちでないですか？/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/会員登録/i)).not.toBeInTheDocument();
    });
    
    it('shows custom error message when provided', () => {
        const errorMessage = 'カスタムエラーメッセージ';
        renderWithProviders(<LoginForm externalError={errorMessage} />);
        
        // カスタムエラーメッセージの表示を確認
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    it('validates form inputs', async () => {
        renderWithProviders(<LoginForm />);
        
        // 何も入力せずに送信
        fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));
        
        // バリデーションエラーのチェック
        await waitFor(() => {
            expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument();
            expect(screen.getByText(/パスワードは必須です/i)).toBeInTheDocument();
        });
        
        // 不正なメールアドレスを入力
        fireEvent.input(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'invalid-email' }
        });
        
        // 短いパスワードを入力
        fireEvent.input(screen.getByLabelText(/パスワード/i), {
            target: { value: 'short' }
        });
        
        // バリデーションエラーのチェック
        await waitFor(() => {
            expect(screen.getByText(/正しいメールアドレス形式で入力してください/i)).toBeInTheDocument();
            expect(screen.getByText(/パスワードは8文字以上で入力してください/i)).toBeInTheDocument();
        });
    });
    
    it('submits form with valid data', async () => {
        const mockSuccess = jest.fn();
        
        renderWithProviders(<LoginForm onSuccess={mockSuccess} />);
        
        // 正しい値を入力
        fireEvent.input(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'test@example.com' }
        });
        
        fireEvent.input(screen.getByLabelText(/パスワード/i), {
            target: { value: 'password123' }
        });
        
        // フォーム送信
        fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));
        
        // login関数が呼ばれることを確認
        await waitFor(() => {
            expect(mockLoginFn).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockClearErrorFn).toHaveBeenCalled();
            expect(mockSuccess).toHaveBeenCalled();
        });
    });
    
    it('toggles password visibility', () => {
        renderWithProviders(<LoginForm />);
        
        // パスワードフィールドの初期状態はマスクされている
        const passwordField = screen.getByLabelText(/パスワード/i);
        expect(passwordField).toHaveAttribute('type', 'password');
        
        // 表示ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /パスワードを表示/i }));
        
        // パスワードが表示されている
        expect(passwordField).toHaveAttribute('type', 'text');
        
        // 非表示ボタンをクリック
        fireEvent.click(screen.getByRole('button', { name: /パスワードを隠す/i }));
        
        // パスワードが再びマスクされている
        expect(passwordField).toHaveAttribute('type', 'password');
    });
});
