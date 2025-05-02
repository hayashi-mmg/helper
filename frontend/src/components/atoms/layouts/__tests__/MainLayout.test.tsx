import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MainLayout } from '../MainLayout';

describe('MainLayout', () => {
  it('renders correctly with default props', () => {
    render(<MainLayout>コンテンツ</MainLayout>);
    
    // メインコンテンツが表示されていることを確認
    expect(screen.getByText('コンテンツ')).toBeInTheDocument();
    
    // デフォルトでヘッダー、サイドバー、フッターが表示されていることを確認
    expect(screen.getByRole('banner')).toBeInTheDocument(); // ヘッダー
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // サイドバー
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // フッター
  });
  
  it('toggles sidebar when menu button is clicked', () => {
    render(<MainLayout>コンテンツ</MainLayout>);
    
    // メニューボタンを取得
    const menuButton = screen.getByRole('button', { name: /メニュー/i });
    
    // サイドバーは初期状態で開いていることを確認
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('open');
    
    // メニューボタンをクリックしてサイドバーを閉じる
    fireEvent.click(menuButton);
    expect(sidebar).not.toHaveClass('open');
    
    // 再度クリックして開く
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('open');
  });
  
  it('renders with custom title and content', () => {
    render(
      <MainLayout 
        title="テストタイトル"
        headerContent={<div data-testid="custom-header">カスタムヘッダー</div>}
        sidebarContent={<div data-testid="custom-sidebar">カスタムサイドバー</div>}
        footerContent={<div data-testid="custom-footer">カスタムフッター</div>}
      >
        メインコンテンツ
      </MainLayout>
    );
    
    // タイトルが表示されていることを確認
    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    
    // カスタムコンテンツが表示されていることを確認
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.getByTestId('custom-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
    
    // メインコンテンツが表示されていることを確認
    expect(screen.getByText('メインコンテンツ')).toBeInTheDocument();
  });
  
  it('hides header when showHeader is false', () => {
    render(<MainLayout showHeader={false}>コンテンツ</MainLayout>);
    
    // ヘッダーが表示されていないことを確認
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });
  
  it('hides sidebar when showSidebar is false', () => {
    render(<MainLayout showSidebar={false}>コンテンツ</MainLayout>);
    
    // サイドバーが表示されていないことを確認
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });
  
  it('hides footer when showFooter is false', () => {
    render(<MainLayout showFooter={false}>コンテンツ</MainLayout>);
    
    // フッターが表示されていないことを確認
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
  
  it('applies additional className correctly', () => {
    render(<MainLayout className="custom-class">コンテンツ</MainLayout>);
    
    // mainLayout要素にカスタムクラスが適用されていることを確認
    const mainLayoutElement = screen.getByText('コンテンツ').closest('.main-layout');
    expect(mainLayoutElement).toHaveClass('custom-class');
  });
});
