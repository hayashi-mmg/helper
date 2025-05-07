import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils/providers';
import MainLayout from './MainLayout';

describe('MainLayout Component', () => {
    it('renders with all sections by default', () => {
        render(<MainLayout>Content</MainLayout>);
        
        // ヘッダー、サイドバー、メインコンテンツ、フッターが表示されていることを確認
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('toggles sidebar when menu button is clicked', () => {
        render(<MainLayout>Content</MainLayout>);
        
        const menuButton = screen.getByRole('button', { name: /toggle sidebar/i });
        const sidebar = screen.getByRole('complementary');
        
        // サイドバーは初期状態で開いている
        expect(sidebar).toHaveClass('open');
        
        // メニューボタンをクリック
        fireEvent.click(menuButton);
        
        // サイドバーが閉じる（openクラスが削除される）
        expect(sidebar).not.toHaveClass('open');
    });

    it('hides header when showHeader is false', () => {
        render(<MainLayout showHeader={false}>Content</MainLayout>);
        
        // ヘッダーが表示されていないことを確認
        expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });

    it('hides sidebar when showSidebar is false', () => {
        render(<MainLayout showSidebar={false}>Content</MainLayout>);
        
        // サイドバーが表示されていないことを確認
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('hides footer when showFooter is false', () => {
        render(<MainLayout showFooter={false}>Content</MainLayout>);
        
        // フッターが表示されていないことを確認
        expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    });

    it('renders title correctly', () => {
        render(<MainLayout title="Test Title">Content</MainLayout>);
        
        // タイトルが表示されていることを確認
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders custom header content', () => {
        render(
            <MainLayout headerContent={<div>Custom Header</div>}>
                Content
            </MainLayout>
        );
        
        expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('renders custom sidebar content', () => {
        render(
            <MainLayout sidebarContent={<div>Custom Sidebar</div>}>
                Content
            </MainLayout>
        );
        
        expect(screen.getByText('Custom Sidebar')).toBeInTheDocument();
    });

    it('renders custom footer content', () => {
        render(
            <MainLayout footerContent={<div>Custom Footer</div>}>
                Content
            </MainLayout>
        );
        
        expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });
});