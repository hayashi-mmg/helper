import React, { useState } from 'react';
import classNames from 'classnames';
import './MainLayout.css';

export interface MainLayoutProps {
  /**
   * ヘッダーの表示・非表示
   * @default true
   */
  showHeader?: boolean;
  
  /**
   * サイドバーの表示・非表示
   * @default true
   */
  showSidebar?: boolean;
  
  /**
   * フッターの表示・非表示
   * @default true
   */
  showFooter?: boolean;
  
  /**
   * サイドバーを開いた状態で初期表示するか
   * @default true
   */
  sidebarOpen?: boolean;
  
  /**
   * ヘッダーに表示するタイトル
   */
  title?: string;
  
  /**
   * メインコンテンツ
   */
  children: React.ReactNode;
  
  /**
   * カスタムヘッダーコンテンツ
   */
  headerContent?: React.ReactNode;
  
  /**
   * カスタムサイドバーコンテンツ
   */
  sidebarContent?: React.ReactNode;
  
  /**
   * カスタムフッターコンテンツ
   */
  footerContent?: React.ReactNode;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  sidebarOpen = true,
  title,
  children,
  headerContent,
  sidebarContent,
  footerContent,
  className
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(sidebarOpen);
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  const containerClasses = classNames(
    'main-layout',
    {
      'with-sidebar': showSidebar && isSidebarOpen,
      'sidebar-collapsed': showSidebar && !isSidebarOpen,
    },
    className
  );
  
  return (
    <div className={containerClasses}>
      {showHeader && (
        <header className="main-layout__header" role="banner">
          <div className="main-layout__header-content">
            {showSidebar && (
              <button 
                className="main-layout__menu-button" 
                onClick={toggleSidebar}
                aria-expanded={isSidebarOpen}
                aria-controls="sidebar"
                aria-label="メニュー"
              >
                <span className="main-layout__menu-icon"></span>
              </button>
            )}
            
            {title && <h1 className="main-layout__title">{title}</h1>}
            
            {headerContent}
          </div>
        </header>
      )}
      
      <div className="main-layout__content-wrapper">
        {showSidebar && (
          <aside 
            id="sidebar"
            className={classNames('main-layout__sidebar', { 'open': isSidebarOpen })}
            role="complementary"
          >
            <div className="main-layout__sidebar-content">
              {sidebarContent}
            </div>
          </aside>
        )}
        
        <main className="main-layout__content" role="main">
          {children}
        </main>
      </div>
      
      {showFooter && (
        <footer className="main-layout__footer" role="contentinfo">
          {footerContent}
        </footer>
      )}
    </div>
  );
};

export default MainLayout;