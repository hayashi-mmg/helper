import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from '../MainLayout';

// useColorModeのモック
vi.mock('@chakra-ui/react', async () => {
    const actual = await vi.importActual('@chakra-ui/react');
    return {
        ...actual as any,
        useColorMode: () => ({
            colorMode: 'light',
            toggleColorMode: vi.fn(),
        }),
    };
});

// テスト用ラッパーコンポーネント
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
        {children}
    </BrowserRouter>
);

describe('MainLayout', () => {
    it('ヘッダー、フッター、子コンポーネントを正しくレンダリングすること', () => {
        render(
            <TestWrapper>
                <MainLayout>
                    <div data-testid="test-content">テストコンテンツ</div>
                </MainLayout>
            </TestWrapper>
        );

        // ヘッダーの要素を確認
        expect(screen.getByText('ヘルパーシステム')).toBeInTheDocument();
        expect(screen.getByText('ホーム')).toBeInTheDocument();
        expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
        expect(screen.getByText('ログイン')).toBeInTheDocument();

        // 子コンポーネントが表示されていることを確認
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
        expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();

        // フッターの要素を確認
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(`© ${currentYear} ヘルパーシステム`)).toBeInTheDocument();
    });

    it('ナビゲーションリンクが適切なhref属性を持っていること', () => {
        render(
            <TestWrapper>
                <MainLayout>
                    <div>テストコンテンツ</div>
                </MainLayout>
            </TestWrapper>
        );

        // ヘッダーのリンクを取得
        const homeLinks = screen.getAllByText('ホーム');
        const dashboardLink = screen.getByText('ダッシュボード');
        const loginLink = screen.getByText('ログイン');

        // ホームリンクのいずれかがルートに向いていることを確認
        expect(homeLinks.some(link => link.closest('a')?.getAttribute('href') === '/')).toBeTruthy();
        
        // 他のリンクも確認
        expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
        expect(loginLink.closest('a')).toHaveAttribute('href', '/auth');
    });
});