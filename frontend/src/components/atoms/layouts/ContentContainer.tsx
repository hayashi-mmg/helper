import React from 'react';
import classNames from 'classnames';
import './ContentContainer.css';

export interface ContentContainerProps {
  /**
   * コンテナ内のコンテンツ
   */
  children: React.ReactNode;
  
  /**
   * コンテナの最大幅
   * @default 'lg'
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * 水平方向の余白を追加
   * @default true
   */
  withHorizontalPadding?: boolean;
  
  /**
   * 垂直方向の余白を追加
   * @default true
   */
  withVerticalPadding?: boolean;
  
  /**
   * 中央配置
   * @default true
   */
  centered?: boolean;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  maxWidth = 'lg',
  withHorizontalPadding = true,
  withVerticalPadding = true,
  centered = true,
  className
}) => {
  const containerClasses = classNames(
    'content-container',
    `max-width-${maxWidth}`,
    {
      'with-horizontal-padding': withHorizontalPadding,
      'with-vertical-padding': withVerticalPadding,
      'centered': centered
    },
    className
  );
  
  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default ContentContainer;