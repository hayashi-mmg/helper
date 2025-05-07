import React from 'react';
import { render, screen } from '../../../test-utils/providers';
import DashboardLayout from './DashboardLayout';

describe('DashboardLayout Component', () => {
    it('renders with the main layout and content', () => {
        render(
            <DashboardLayout title="Dashboard Title">
                ダッシュボードコンテンツ
            </DashboardLayout>
        );
        
        // MainLayoutの継承を確認
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
        
        // タイトルとコンテンツ
        expect(screen.getByText('Dashboard Title')).toBeInTheDocument();
        expect(screen.getByText('ダッシュボードコンテンツ')).toBeInTheDocument();
    });
    
    it('renders action buttons correctly', () => {
        render(
            <DashboardLayout 
                title="Dashboard" 
                actions={<button>アクション</button>}
            >
                コンテンツ
            </DashboardLayout>
        );
        
        // アクションボタンが表示されることを確認
        expect(screen.getByText('アクション')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument();
    });
    
    it('renders filters correctly', () => {
        render(
            <DashboardLayout 
                title="Dashboard" 
                filters={<div>フィルター</div>}
            >
                コンテンツ
            </DashboardLayout>
        );
        
        // フィルターが表示されることを確認
        expect(screen.getByText('フィルター')).toBeInTheDocument();
    });
    
    it('renders both actions and filters when provided', () => {
        render(
            <DashboardLayout 
                title="Dashboard" 
                actions={<button>アクション</button>}
                filters={<div>フィルター</div>}
            >
                コンテンツ
            </DashboardLayout>
        );
        
        // アクションとフィルターの両方が表示されることを確認
        expect(screen.getByText('アクション')).toBeInTheDocument();
        expect(screen.getByText('フィルター')).toBeInTheDocument();
    });
    
    it('renders sidebar content when provided', () => {
        render(
            <DashboardLayout 
                title="Dashboard" 
                sidebarContent={<div>サイドバーコンテンツ</div>}
            >
                メインコンテンツ
            </DashboardLayout>
        );
        
        // サイドバーコンテンツとメインコンテンツの両方が表示されることを確認
        expect(screen.getByText('サイドバーコンテンツ')).toBeInTheDocument();
        expect(screen.getByText('メインコンテンツ')).toBeInTheDocument();
    });
});