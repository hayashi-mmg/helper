import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import './SplitLayout.css';

export interface SplitLayoutProps {
  /**
   * 左側（または上側）のペイン内容
   */
  leftPane: React.ReactNode;
  
  /**
   * 右側（または下側）のペイン内容
   */
  rightPane: React.ReactNode;
  
  /**
   * 分割方向
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';
  
  /**
   * デフォルトの分割位置（左側または上側の割合、1-99）
   * @default 50
   */
  defaultSplit?: number;
  
  /**
   * リサイズ可能か
   * @default true
   */
  resizable?: boolean;
  
  /**
   * 左（上）ペインの最小サイズ（%）
   * @default 20
   */
  minLeftSize?: number;
  
  /**
   * 右（下）ペインの最小サイズ（%）
   * @default 20
   */
  minRightSize?: number;
  
  /**
   * スプリッターの幅またはオーバーライドコンポーネント
   * @default 4
   */
  splitter?: number | React.ReactNode;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  leftPane,
  rightPane,
  direction = 'horizontal',
  defaultSplit = 50,
  resizable = true,
  minLeftSize = 20,
  minRightSize = 20,
  splitter = 4,
  className
}) => {
  const [splitPosition, setSplitPosition] = useState(defaultSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
    
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    e.preventDefault();
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    let newPosition;
    if (direction === 'horizontal') {
      newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      newPosition = ((e.clientY - rect.top) / rect.height) * 100;
    }
    
    // 最小サイズの制約を適用
    newPosition = Math.max(minLeftSize, Math.min(100 - minRightSize, newPosition));
    
    setSplitPosition(newPosition);
    e.preventDefault();
  };
  
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const handleDoubleClick = () => {
    if (resizable) {
      setSplitPosition(50);
    }
  };
  
  // キーボード操作でのリサイズ
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!resizable) return;
    
    let newPosition = splitPosition;
    const step = 5; // 5%ずつ移動
    
    if (direction === 'horizontal') {
      if (e.key === 'ArrowLeft') {
        newPosition = Math.max(minLeftSize, splitPosition - step);
      } else if (e.key === 'ArrowRight') {
        newPosition = Math.min(100 - minRightSize, splitPosition + step);
      }
    } else {
      if (e.key === 'ArrowUp') {
        newPosition = Math.max(minLeftSize, splitPosition - step);
      } else if (e.key === 'ArrowDown') {
        newPosition = Math.min(100 - minRightSize, splitPosition + step);
      }
    }
    
    if (newPosition !== splitPosition) {
      setSplitPosition(newPosition);
      e.preventDefault();
    }
  };
  
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  const containerClasses = classNames(
    'split-layout',
    `direction-${direction}`,
    {
      'resizable': resizable
    },
    className
  );
  
  const leftStyle = {
    [direction === 'horizontal' ? 'width' : 'height']: `${splitPosition}%`
  };
  
  const rightStyle = {
    [direction === 'horizontal' ? 'width' : 'height']: `${100 - splitPosition}%`
  };
  
  return (
    <div className={containerClasses} ref={containerRef}>
      <div className="split-layout__pane split-layout__left" style={leftStyle}>
        {leftPane}
      </div>
      
      <div 
        className="split-layout__splitter"
        style={{ 
          [direction === 'horizontal' ? 'width' : 'height']: typeof splitter === 'number' ? `${splitter}px` : 'auto'
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        role="separator"
        aria-valuenow={splitPosition}
        aria-valuemin={minLeftSize}
        aria-valuemax={100 - minRightSize}
        aria-orientation={direction}
        tabIndex={resizable ? 0 : -1}
      >
        {typeof splitter !== 'number' && splitter}
      </div>
      
      <div className="split-layout__pane split-layout__right" style={rightStyle}>
        {rightPane}
      </div>
    </div>
  );
};

export default SplitLayout;