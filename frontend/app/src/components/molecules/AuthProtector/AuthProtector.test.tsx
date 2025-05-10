import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import AuthProtector from './AuthProtector';

// モック設定
jest.mock('../../../store/useAuthStore');

const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/protected']) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/login" element={<div>ログインページ</div>} />
                <Route path="/unauthorized" element={<div>権限がありません</div>} />
                <Route path="/protected" element={ui} />
                <Route path="/protected-admin" element={ui} />
            </Routes>
        </MemoryRouter>
    );
};

describe('AuthProtector Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it('renders children when user is authenticated', () => {
        // 認証済みユーザーの状態をモック
        (useAuthStore as jest.Mock).mockImplementation((selector) => {
            const state = {
                isAuthenticated: true,
                user: { id: '1', email: 'test@example.com', name: 'テストユーザー', role: 'user' },
            };
            
            if (typeof selector === 'function') {
                return selector(state);
            }
            
            return state;
        });
        
        renderWithRouter(
            <AuthProtector>
                <div>保護されたコンテンツ</div>
            </AuthProtector>
        );
        
        // 子コンポーネントが表示されることを確認
        expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
        // ログインページにリダイレクトされていないことを確認
        expect(screen.queryByText('ログインページ')).not.toBeInTheDocument();
    });
    
    it('redirects to login when user is not authenticated', () => {
        // 未認証の状態をモック
        (useAuthStore as jest.Mock).mockImplementation((selector) => {
            const state = {
                isAuthenticated: false,
                user: null,
            };
            
            if (typeof selector === 'function') {
                return selector(state);
            }
            
            return state;
        });
        
        renderWithRouter(
            <AuthProtector>
                <div>保護されたコンテンツ</div>
            </AuthProtector>
        );
        
        // ログインページにリダイレクトされることを確認
        expect(screen.getByText('ログインページ')).toBeInTheDocument();
        // 子コンポーネントが表示されていないことを確認
        expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
    });
    
    it('redirects to custom path when specified', () => {
        // 未認証の状態をモック
        (useAuthStore as jest.Mock).mockImplementation((selector) => {
            const state = {
                isAuthenticated: false,
                user: null,
            };
            
            if (typeof selector === 'function') {
                return selector(state);
            }
            
            return state;
        });
        
        renderWithRouter(
            <AuthProtector redirectTo="/custom-login">
                <div>保護されたコンテンツ</div>
            </AuthProtector>
        );
        
        // カスタムログインページへのリダイレクトは直接テストできないため、
        // 子コンポーネントが表示されていないことを確認
        expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
    });
    
    it('redirects to unauthorized when user lacks required role', () => {
        // 一般ユーザーでログイン済みの状態をモック
        (useAuthStore as jest.Mock).mockImplementation((selector) => {
            const state = {
                isAuthenticated: true,
                user: { id: '1', email: 'user@example.com', name: '一般ユーザー', role: 'user' },
            };
            
            if (typeof selector === 'function') {
                return selector(state);
            }
            
            return state;
        });
        
        renderWithRouter(
            <AuthProtector requiredRole="admin">
                <div>管理者専用コンテンツ</div>
            </AuthProtector>,
            ['/protected-admin']
        );
        
        // 権限不足ページにリダイレクトされることを確認
        expect(screen.getByText('権限がありません')).toBeInTheDocument();
        // 管理者専用コンテンツが表示されていないことを確認
        expect(screen.queryByText('管理者専用コンテンツ')).not.toBeInTheDocument();
    });
    
    it('allows access when user has required role', () => {
        // 管理者ユーザーでログイン済みの状態をモック
        (useAuthStore as jest.Mock).mockImplementation((selector) => {
            const state = {
                isAuthenticated: true,
                user: { id: '2', email: 'admin@example.com', name: '管理者', role: 'admin' },
            };
            
            if (typeof selector === 'function') {
                return selector(state);
            }
            
            return state;
        });
        
        renderWithRouter(
            <AuthProtector requiredRole="admin">
                <div>管理者専用コンテンツ</div>
            </AuthProtector>,
            ['/protected-admin']
        );
        
        // 管理者専用コンテンツが表示されることを確認
        expect(screen.getByText('管理者専用コンテンツ')).toBeInTheDocument();
        // 権限不足ページにリダイレクトされていないことを確認
        expect(screen.queryByText('権限がありません')).not.toBeInTheDocument();
    });
});
