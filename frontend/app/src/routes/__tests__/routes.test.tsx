import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { router } from '../index';

// モックコンポーネント
vi.mock('../../pages/Home', () => ({
    default: () => <div data-testid="home-page">ホームページ</div>
}));

vi.mock('../../pages/Auth', () => ({
    default: () => <div data-testid="auth-page">認証ページ</div>
}));

vi.mock('../../pages/NotFound', () => ({
    default: () => <div data-testid="not-found-page">404ページ</div>
}));

vi.mock('../../layouts/MainLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="main-layout">
            <div>メインレイアウト</div>
            {children}
        </div>
    )
}));

// ルートレンダリングのためのユーティリティ関数
const renderRoute = (path: string) => {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                {router.routes.map((route, index) => {
                    // ルート定義から再現
                    if (route.path === '/') {
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={route.element}
                            >
                                {route.children?.map((child, childIndex) => (
                                    <Route
                                        key={`${index}-${childIndex}`}
                                        index={child.index}
                                        path={child.path}
                                        element={child.element}
                                    />
                                ))}
                            </Route>
                        );
                    } else {
                        return (
                            <Route 
                                key={index} 
                                path={route.path} 
                                element={route.element} 
                            />
                        );
                    }
                })}
            </Routes>
        </MemoryRouter>
    );
};

describe('ルーティング設定', () => {
    it('ホームページルートが正しく動作すること', async () => {
        renderRoute('/');
        expect(await screen.findByTestId('main-layout')).toBeInTheDocument();
        expect(await screen.findByTestId('home-page')).toBeInTheDocument();
    });

    it('認証ページルートが正しく動作すること', async () => {
        renderRoute('/auth');
        expect(await screen.findByTestId('auth-page')).toBeInTheDocument();
    });

    it('存在しないパスは404ページにリダイレクトされること', async () => {
        renderRoute('/unknown-path');
        expect(await screen.findByTestId('not-found-page')).toBeInTheDocument();
    });

    it('ダッシュボードルートが正しく動作すること', async () => {
        renderRoute('/dashboard');
        expect(await screen.findByTestId('main-layout')).toBeInTheDocument();
        expect(await screen.findByTestId('home-page')).toBeInTheDocument();
    });
});