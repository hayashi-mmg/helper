import React from 'react';
import classNames from 'classnames';
import MainLayout from './MainLayout';
import GridLayout from './GridLayout';
import './DashboardLayout.css';

export interface DashboardLayoutProps {
  /**
   * ダッシュボードタイトル
   */
  title: string;
  
  /**
   * サイドバーを開いた状態で初期表示するか
   * @default true
   */
  sidebarOpen?: boolean;
  
  /**
   * ダッシュボードコンテンツ
   */
  children: React.ReactNode;
  
  /**
   * アクションボタン群
   */
  actions?: React.ReactNode;
  
  /**
   * ダッシュボードフィルター
   */
  filters?: React.ReactNode;
  
  /**
   * サイドバーコンテンツ
   */
  sidebarContent?: React.ReactNode;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  sidebarOpen = true,
  children,
  actions,
  filters,
  sidebarContent,
  className
}) => {
  const containerClasses = classNames(
    'dashboard-layout',
    className
  );
  
  return (
    <MainLayout
      title={title}
      sidebarOpen={sidebarOpen}
      sidebarContent={sidebarContent}
      className={containerClasses}
    >
      {actions && (
        <div className="dashboard-layout__actions" role="toolbar" aria-label="ダッシュボードアクション">
          {actions}
        </div>
      )}
      
      {filters && (
        <div className="dashboard-layout__filters">
          {filters}
        </div>
      )}
      
      <div className="dashboard-layout__content">
        <GridLayout>
          {children}
        </GridLayout>
      </div>
    </MainLayout>
  );
};

export default DashboardLayout;