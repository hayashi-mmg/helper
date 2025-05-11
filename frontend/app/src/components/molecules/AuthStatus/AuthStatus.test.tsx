import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { ChakraProvider } from '@chakra-ui/react';
import { useAuthStore } from '../../../store/useAuthStore';
import AuthStatus from './AuthStatus';
import { Component } from 'react';

// モック設定
jest.mock('../../../store/useAuthStore');
const mockLogoutFn = jest.fn();

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

// カスタムhistoryでナビゲーションのテスト
const renderWithHistory = (ui: React.ReactElement) => {
    const history = createMemoryHistory();
    return {
        history,
        ...render(
            <ChakraProvider>
                <Router location={history.location} navigator={history}>
                    {ui}
                </Router>
            </ChakraProvider>
        ),
    };
};

describe('AuthStatus Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('未認証状態', () => {
        beforeEach(() => {
            // 未認証の状態をモック
            (useAuthStore as jest.Mock).mockImplementation((selector) => {
                const state = {
                    isAuthenticated: false,
                    user: null,
                    logout: mockLogoutFn,
                };
                
                if (typeof selector === 'function') {
                    return selector(state);
                }
                
                return state;
            });
        });
        
        it('未認証時にログインと会員登録ボタンを表示する', () => {
            renderWithProviders(<AuthStatus />);
            
            // ログインと会員登録ボタンが表示されることを確認
            expect(screen.getByTestId('auth-login-button')).toBeInTheDocument();
            expect(screen.getByTestId('auth-register-button')).toBeInTheDocument();
            
            // ユーザーメニューが表示されていないことを確認
            expect(screen.queryByTestId('auth-user-menu')).not.toBeInTheDocument();
        });
        
        it('モバイルデザインではアイコンボタンを表示する', () => {
            renderWithProviders(<AuthStatus forceMobile={true} />);
            
            // モバイル用のボタンが表示されることを確認
            expect(screen.getByTestId('auth-login-icon')).toBeInTheDocument();
            expect(screen.getByTestId('auth-register-button-mobile')).toBeInTheDocument();
            
            // 通常のログインボタンが表示されていないことを確認
            expect(screen.queryByTestId('auth-login-button')).not.toBeInTheDocument();
        });
        
        it('カスタムURLを使用する', () => {
            renderWithProviders(
                <AuthStatus 
                    loginUrl="/custom-login" 
                    registerUrl="/custom-register" 
                />
            );
            
            // ログインと会員登録ボタンのURLが正しいことを確認
            const loginButton = screen.getByTestId('auth-login-button');
            const registerButton = screen.getByTestId('auth-register-button');
            
            expect(loginButton.closest('a')).toHaveAttribute('href', '/custom-login');
            expect(registerButton.closest('a')).toHaveAttribute('href', '/custom-register');
        });
    });
    
    describe('認証済み状態', () => {
        const mockUser = { 
            id: '1', 
            email: 'test@example.com', 
            name: 'テストユーザー',
            role: 'user',
        };
        
        beforeEach(() => {
            // 認証済みの状態をモック
            (useAuthStore as jest.Mock).mockImplementation((selector) => {
                const state = {
                    isAuthenticated: true,
                    user: mockUser,
                    logout: mockLogoutFn,
                };
                
                if (typeof selector === 'function') {
                    return selector(state);
                }
                
                return state;
            });
        });
        
        it('認証済み時にユーザーメニューを表示する', () => {
            renderWithProviders(<AuthStatus />);
            
            // ユーザーメニューが表示されることを確認
            expect(screen.getByTestId('auth-user-menu')).toBeInTheDocument();
            
            // ユーザー名が表示されることを確認
            expect(screen.getByText('テストユーザー')).toBeInTheDocument();
            
            // ログインと会員登録ボタンが表示されていないことを確認
            expect(screen.queryByTestId('auth-login-button')).not.toBeInTheDocument();
            expect(screen.queryByTestId('auth-register-button')).not.toBeInTheDocument();
        });
        
        it('モバイルデザインではユーザー名を非表示にする', () => {
            renderWithProviders(<AuthStatus forceMobile={true} />);
            
            // ユーザーメニューは表示される
            expect(screen.getByTestId('auth-user-menu')).toBeInTheDocument();
            
            // ユーザー名がメニュー外に表示されないことを確認（ボタン内に表示されない）
            const menuButton = screen.getByRole('button');
            expect(menuButton).not.toHaveTextContent('テストユーザー');
        });
        
        it('メニューを開くと各項目が表示される', async () => {
            renderWithProviders(<AuthStatus />);
            
            // メニューボタンをクリック
            fireEvent.click(screen.getByRole('button'));
            
            // メニュー項目が表示されることを確認
            expect(await screen.findByTestId('auth-profile-link')).toBeInTheDocument();
            expect(await screen.findByTestId('auth-settings-link')).toBeInTheDocument();
            expect(await screen.findByTestId('auth-logout-button')).toBeInTheDocument();
            
            // メニュー内にユーザー情報が表示されることを確認
            expect(screen.getAllByText('テストユーザー').length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });
        
        it('ログアウトボタンをクリックするとログアウト処理が呼ばれる', async () => {
            const { history } = renderWithHistory(<AuthStatus loginUrl="/custom-login" />);
            
            // メニューボタンをクリック
            fireEvent.click(screen.getByRole('button'));
            
            // ログアウトボタンをクリック
            const logoutButton = await screen.findByTestId('auth-logout-button');
            fireEvent.click(logoutButton);
            
            // ログアウト関数が呼ばれたことを確認
            expect(mockLogoutFn).toHaveBeenCalledTimes(1);
            
            // カスタムログインページにリダイレクトされたことを確認
            expect(history.location.pathname).toBe('/custom-login');
        });
        
        it('カスタムURLを使用する', async () => {
            renderWithProviders(
                <AuthStatus 
                    profileUrl="/custom-profile" 
                    settingsUrl="/custom-settings" 
                />
            );
            
            // メニューボタンをクリック
            fireEvent.click(screen.getByRole('button'));
            
            // メニュー項目のURLが正しいことを確認
            const profileLink = await screen.findByTestId('auth-profile-link');
            const settingsLink = await screen.findByTestId('auth-settings-link');
            
            expect(profileLink.closest('a')).toHaveAttribute('href', '/custom-profile');
            expect(settingsLink.closest('a')).toHaveAttribute('href', '/custom-settings');
        });
    });
});
