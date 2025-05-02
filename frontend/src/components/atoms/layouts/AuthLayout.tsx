import React from 'react';
import classNames from 'classnames';
import './AuthLayout.css';

export interface AuthLayoutProps {
  /**
   * レイアウトタイトル
   */
  title?: string;
  
  /**
   * 認証フォームコンテンツ
   */
  children: React.ReactNode;
  
  /**
   * ロゴ表示
   * @default true
   */
  showLogo?: boolean;
  
  /**
   * 背景画像URL
   */
  backgroundImage?: string;
  
  /**
   * フッターコンテンツ
   */
  footerContent?: React.ReactNode;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  children,
  showLogo = true,
  backgroundImage,
  footerContent,
  className
}) => {
  const containerClasses = classNames(
    'auth-layout',
    {
      'with-background': !!backgroundImage
    },
    className
  );
  
  const containerStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};
  
  return (
    <div className={containerClasses} style={containerStyle}>
      <div className="auth-layout__card">
        {showLogo && (
          <div className="auth-layout__logo">
            {/* Logo component would be imported and used here */}
            <div className="logo" aria-label="ロゴ"></div>
          </div>
        )}
        
        {title && (
          <h1 className="auth-layout__title">{title}</h1>
        )}
        
        <div className="auth-layout__content">
          {children}
        </div>
      </div>
      
      {footerContent && (
        <div className="auth-layout__footer" role="contentinfo">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default AuthLayout;