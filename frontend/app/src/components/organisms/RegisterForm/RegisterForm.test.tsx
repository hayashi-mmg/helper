import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import RegisterForm from './RegisterForm';
import { useAuthStore } from '../../../store/useAuthStore';

// モック設定
jest.mock('../../../store/useAuthStore');

const mockRegisterFn = jest.fn();
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

describe('RegisterForm Component', () => {
    beforeEach(() => {
        // モック関数をリセット
        jest.clearAllMocks();
        
        // useAuthStore モックの実装
        (useAuthStore as jest.Mock).mockImplementation((selector) => {
            const state = {
                register: mockRegisterFn,
                error: null,
                clearError: mockClearErrorFn,
            };
            
            if (typeof selector === 'function') {
                return selector(state);
            }
            
            return state;
        });
    });
    
    it('renders register form correctly', () => {
        renderWithProviders(<RegisterForm />);
        
        // フォーム要素の存在を確認
        expect(screen.getByTestId('register-form')).toBeInTheDocument();
        expect(screen.getByLabelText(/名前/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^パスワード$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/パスワード（確認）/i)).toBeInTheDocument();
        expect(screen.getByText(/利用規約/i)).toBeInTheDocument();
        expect(screen.getByText(/プライバシーポリシー/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /会員登録/i })).toBeInTheDocument();
        
        // デフォルトではログインリンクが表示される
        expect(screen.getByText(/すでにアカウントをお持ちですか？/i)).toBeInTheDocument();
        expect(screen.getByText(/ログイン/i)).toBeInTheDocument();
    });
    
    it('hides login link when showLoginLink is false', () => {
        renderWithProviders(<RegisterForm showLoginLink={false} />);
        
        // ログインリンクが非表示になっていることを確認
        expect(screen.queryByText(/すでにアカウントをお持ちですか？/i)).not.toBeInTheDocument();
    });
    
    it('shows custom error message when provided', () => {
        const errorMessage = 'カスタムエラーメッセージ';
        renderWithProviders(<RegisterForm externalError={errorMessage} />);
        
        // カスタムエラーメッセージの表示を確認
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    it('validates form inputs', async () => {
        renderWithProviders(<RegisterForm />);
        
        // 何も入力せずに送信
        fireEvent.click(screen.getByRole('button', { name: /会員登録/i }));
        
        // バリデーションエラーのチェック
        await waitFor(() => {
            expect(screen.getByText(/名前は必須です/i)).toBeInTheDocument();
            expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument();
            expect(screen.getByText(/パスワードは必須です/i)).toBeInTheDocument();
            expect(screen.getByText(/パスワード（確認）は必須です/i)).toBeInTheDocument();
            expect(screen.getByText(/利用規約に同意する必要があります/i)).toBeInTheDocument();
        });
        
        // 不正なメールアドレスを入力
        fireEvent.input(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'invalid-email' }
        });
        
        // 短いパスワードを入力
        fireEvent.input(screen.getByLabelText(/^パスワード$/i), {
            target: { value: 'short' }
        });
        
        // バリデーションエラーのチェック
        await waitFor(() => {
            expect(screen.getByText(/正しいメールアドレス形式で入力してください/i)).toBeInTheDocument();
            expect(screen.getByText(/パスワードは8文字以上で入力してください/i)).toBeInTheDocument();
        });
        
        // パスワードの要件を満たしていない
        fireEvent.input(screen.getByLabelText(/^パスワード$/i), {
            target: { value: 'password123' }
        });
        
        await waitFor(() => {
            expect(screen.getByText(/パスワードには大文字を含める必要があります/i)).toBeInTheDocument();
        });
        
        // パスワードと確認用パスワードが一致しない
        fireEvent.input(screen.getByLabelText(/^パスワード$/i), {
            target: { value: 'Password123' }
        });
        
        fireEvent.input(screen.getByLabelText(/パスワード（確認）/i), {
            target: { value: 'Password124' }
        });
        
        fireEvent.click(screen.getByRole('button', { name: /会員登録/i }));
        
        await waitFor(() => {
            expect(screen.getByText(/パスワードが一致しません/i)).toBeInTheDocument();
        });
    });
    
    it('submits form with valid data', async () => {
        const mockSuccess = jest.fn();
        
        renderWithProviders(<RegisterForm onSuccess={mockSuccess} />);
        
        // 正しい値を入力
        fireEvent.input(screen.getByLabelText(/名前/i), {
            target: { value: '山田 太郎' }
        });
        
        fireEvent.input(screen.getByLabelText(/メールアドレス/i), {
            target: { value: 'test@example.com' }
        });
        
        fireEvent.input(screen.getByLabelText(/^パスワード$/i), {
            target: { value: 'Password123' }
        });
        
        fireEvent.input(screen.getByLabelText(/パスワード（確認）/i), {
            target: { value: 'Password123' }
        });
        
        // 利用規約に同意
        fireEvent.click(screen.getByTestId('register-agree-terms'));
        
        // フォーム送信
        fireEvent.click(screen.getByRole('button', { name: /会員登録/i }));
        
        // register関数が呼ばれることを確認
        await waitFor(() => {
            expect(mockRegisterFn).toHaveBeenCalledWith('test@example.com', 'Password123', '山田 太郎');
            expect(mockClearErrorFn).toHaveBeenCalled();
            expect(mockSuccess).toHaveBeenCalled();
        });
    });
    
    it('toggles password visibility', () => {
        renderWithProviders(<RegisterForm />);
        
        // パスワードフィールドの初期状態はマスクされている
        const passwordField = screen.getByLabelText(/^パスワード$/i);
        const confirmPasswordField = screen.getByLabelText(/パスワード（確認）/i);
        expect(passwordField).toHaveAttribute('type', 'password');
        expect(confirmPasswordField).toHaveAttribute('type', 'password');
        
        // パスワード表示ボタンをクリック
        const showPasswordButtons = screen.getAllByRole('button', { name: /パスワードを表示/i });
        fireEvent.click(showPasswordButtons[0]);
        
        // パスワードが表示されている
        expect(passwordField).toHaveAttribute('type', 'text');
        
        // 確認用パスワード表示ボタンをクリック
        fireEvent.click(showPasswordButtons[1]);
        
        // 確認用パスワードが表示されている
        expect(confirmPasswordField).toHaveAttribute('type', 'text');
    });
});
