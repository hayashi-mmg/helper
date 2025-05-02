import React, { useState } from 'react';
import classNames from 'classnames';
import SplitLayout from './SplitLayout';
import './EditorLayout.css';

export interface EditorLayoutProps {
  /**
   * エディタタイトル
   */
  title: string;
  
  /**
   * エディタメインコンテンツ
   */
  children: React.ReactNode;
  
  /**
   * ツールバーコンテンツ
   */
  toolbar?: React.ReactNode;
  
  /**
   * プレビューパネルの表示
   * @default true
   */
  showPreview?: boolean;
  
  /**
   * プレビューコンテンツ
   */
  previewContent?: React.ReactNode;
  
  /**
   * 保存ボタンクリック時のコールバック
   */
  onSave?: () => void;
  
  /**
   * プレビュートグルボタンクリック時のコールバック
   */
  onTogglePreview?: () => void;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  title,
  children,
  toolbar,
  showPreview = true,
  previewContent,
  onSave,
  onTogglePreview,
  className
}) => {
  const [isPreviewVisible, setPreviewVisible] = useState(showPreview);
  
  const handleTogglePreview = () => {
    const newState = !isPreviewVisible;
    setPreviewVisible(newState);
    if (onTogglePreview) {
      onTogglePreview();
    }
  };
  
  const containerClasses = classNames(
    'editor-layout',
    {
      'with-preview': isPreviewVisible
    },
    className
  );
  
  return (
    <div className={containerClasses}>
      <div className="editor-layout__header">
        <h1 className="editor-layout__title">{title}</h1>
        
        <div className="editor-layout__actions">
          <button 
            className="editor-layout__preview-toggle" 
            onClick={handleTogglePreview}
            aria-pressed={isPreviewVisible}
          >
            {isPreviewVisible ? 'プレビューを隠す' : 'プレビューを表示'}
          </button>
          
          {onSave && (
            <button 
              className="editor-layout__save-button" 
              onClick={onSave}
              aria-label="保存"
            >
              保存
            </button>
          )}
        </div>
      </div>
      
      {toolbar && (
        <div className="editor-layout__toolbar" role="toolbar" aria-label="エディターツールバー">
          {toolbar}
        </div>
      )}
      
      <div className="editor-layout__content">
        {isPreviewVisible ? (
          <SplitLayout 
            leftPane={children}
            rightPane={previewContent}
            defaultSplit={60}
            minLeftSize={30}
            minRightSize={30}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default EditorLayout;