# レイアウトコンポーネント仕様書

## コンポーネント基本情報

- **コンポーネント群名**: LayoutComponents
- **タイプ**: organisms
- **対応するタスク**: task-012-design-organism-layouts
- **依存するコンポーネント**: 
  - atoms/* (Button, Icon, Typography)
  - molecules/Navigation
  - molecules/Sidebar

## 1. 機能概要

レイアウトコンポーネントは、アプリケーション全体の構造を定義する基盤となるコンポーネントです。一貫したユーザーエクスペリエンスと効率的な開発を実現するために、共通のレイアウト要素を抽象化し再利用可能な形で提供します。

## 2. 対象となるレイアウトコンポーネント

### 2.1 基本レイアウトコンポーネント

1. **MainLayout**
   - アプリケーションの主要レイアウト
   - ヘッダー、サイドバー、メインコンテンツエリア、フッターを含む

2. **DashboardLayout**
   - ダッシュボード画面用の特殊レイアウト
   - サイドバー付きのグリッドベースレイアウト

3. **AuthLayout**
   - 認証関連ページ（ログイン、登録など）用のシンプルレイアウト
   - 中央寄せのコンテンツエリアのみ

4. **EditorLayout**
   - コンテンツ編集ページ用のレイアウト
   - ツールバー、編集エリア、プレビューエリアを含む

### 2.2 補助レイアウトコンポーネント

1. **ContentContainer**
   - コンテンツエリアのラッパー
   - 適切なパディングとマージンを提供

2. **SplitLayout**
   - 画面を水平または垂直に分割するレイアウト
   - 分割比率を調整可能

3. **GridLayout**
   - グリッドベースのレイアウトシステム
   - レスポンシブ対応のフレキシブルな配置

4. **CardGrid**
   - カードコンポーネント用のグリッドレイアウト
   - 均等配置と可変サイズ対応

## 3. 詳細仕様

### 3.1 MainLayout

#### Props定義

```typescript
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
```

#### デザイン仕様

- ヘッダー高さ: 64px
- サイドバー幅: 240px (展開時)、64px (折りたたみ時)
- フッター高さ: 48px
- 背景色: #f5f5f5
- コンテンツエリア背景色: #ffffff

#### 振る舞い

- サイドバーはトグルボタンで開閉可能
- モバイルビューではサイドバーはデフォルトで非表示（ハンバーガーメニューで表示）
- ヘッダーは固定表示（スクロールしても上部に表示）
- フッターは画面下部に固定（コンテンツが少ない場合）または通常フロー（コンテンツが多い場合）

#### レスポンシブ対応

- ブレークポイント:
  - モバイル: < 768px
  - タブレット: 768px - 1024px
  - デスクトップ: > 1024px

- モバイル対応:
  - サイドバーは全画面オーバーレイとして表示
  - ヘッダーはシンプル化（タイトルとハンバーガーメニューのみ）

#### 実装例

```tsx
import React, { useState } from 'react';
import classNames from 'classnames';
import Header from '../molecules/Header';
import Sidebar from '../molecules/Sidebar';
import Footer from '../molecules/Footer';

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
        <Header 
          title={title} 
          onMenuClick={toggleSidebar}
          showMenuButton={showSidebar}
        >
          {headerContent}
        </Header>
      )}
      
      <div className="main-layout__content-wrapper">
        {showSidebar && (
          <Sidebar open={isSidebarOpen} onToggle={toggleSidebar}>
            {sidebarContent}
          </Sidebar>
        )}
        
        <main className="main-layout__content">
          {children}
        </main>
      </div>
      
      {showFooter && (
        <Footer>
          {footerContent}
        </Footer>
      )}
    </div>
  );
};

export default MainLayout;
```

### 3.2 DashboardLayout

#### Props定義

```typescript
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
```

#### デザイン仕様

- MainLayoutを拡張、特にダッシュボード向けに最適化
- アクションボタンエリア高さ: 56px
- フィルターエリア高さ: 48px
- グリッドカラム数: 12
- グリッドガター: 16px
- ウィジェット間マージン: 16px
- ウィジェット最小高さ: 200px

#### 振る舞い

- リサイズ可能なウィジェットグリッド
- ドラッグ&ドロップでウィジェット配置変更可能
- フィルターパネルは展開/折りたたみ可能

#### 実装例

```tsx
import React from 'react';
import classNames from 'classnames';
import MainLayout from './MainLayout';
import GridLayout from './GridLayout';

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
        <div className="dashboard-layout__actions">
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
```

### 3.3 AuthLayout

#### Props定義

```typescript
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
```

#### デザイン仕様

- フルスクリーンレイアウト
- コンテンツは中央配置のカード内
- カード最大幅: 480px
- ロゴ表示位置: カード上部中央
- 背景色: #f0f2f5（背景画像がない場合）

#### レスポンシブ対応

- モバイル時はパディングを縮小
- モバイル時のカード幅: 90% (画面幅の90%)

#### 実装例

```tsx
import React from 'react';
import classNames from 'classnames';
import Logo from '../atoms/Logo';

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
            <Logo />
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
        <div className="auth-layout__footer">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
```

### 3.4 EditorLayout

#### Props定義

```typescript
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
```

#### デザイン仕様

- ツールバー高さ: 48px
- デフォルト分割比率: エディタ 60% - プレビュー 40%
- 分割バーの幅: 4px
- プレビューパネルは表示/非表示切り替え可能
- エディタ背景色: #ffffff
- プレビュー背景色: #f8f9fa
- ツールバー背景色: #f0f0f0

#### 振る舞い

- 分割バーのドラッグでエディタとプレビューの比率を調整可能
- 「保存」ボタンはツールバーの右端に固定表示
- ツールバーはスクロール時も画面上部に固定表示

#### 実装例

```tsx
import React, { useState } from 'react';
import classNames from 'classnames';
import Button from '../atoms/Button';
import SplitLayout from './SplitLayout';

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
          <Button variant="text" onClick={handleTogglePreview}>
            {isPreviewVisible ? 'プレビューを隠す' : 'プレビューを表示'}
          </Button>
          
          {onSave && (
            <Button variant="primary" onClick={onSave}>
              保存
            </Button>
          )}
        </div>
      </div>
      
      {toolbar && (
        <div className="editor-layout__toolbar">
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
```

### 3.5 ContentContainer

#### Props定義

```typescript
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
```

#### デザイン仕様

- 最大幅の定義:
  - xs: 480px
  - sm: 600px
  - md: 960px
  - lg: 1280px
  - xl: 1920px
  - full: 100%
- 水平パディング: 16px（モバイル）、24px（タブレット）、32px（デスクトップ）
- 垂直パディング: 24px

#### 実装例

```tsx
import React from 'react';
import classNames from 'classnames';

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
```

### 3.6 SplitLayout

#### Props定義

```typescript
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
```

#### デザイン仕様

- スプリッターのデフォルト色: #e0e0e0
- スプリッターのホバー色: #bdbdbd
- スプリッターのドラッグ中色: #9e9e9e

#### 振る舞い

- マウスドラッグでペインサイズを調整可能
- ダブルクリックで50/50分割にリセット

#### 実装例

```tsx
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

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
```

### 3.7 GridLayout

#### Props定義

```typescript
export interface GridLayoutProps {
  /**
   * グリッドアイテム
   */
  children: React.ReactNode;
  
  /**
   * グリッドカラム数
   * @default 12
   */
  columns?: number;
  
  /**
   * グリッドアイテム間のギャップ
   * @default 16
   */
  gap?: number | { x: number, y: number };
  
  /**
   * レスポンシブ設定
   * @default { sm: 1, md: 2, lg: 3, xl: 4 }
   */
  responsive?: {
    sm?: number; // 576px以上のカラム数
    md?: number; // 768px以上のカラム数
    lg?: number; // 992px以上のカラム数
    xl?: number; // 1200px以上のカラム数
  };
  
  /**
   * 自動行高さを使用するか
   * @default true
   */
  autoRows?: boolean;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export interface GridItemProps {
  /**
   * グリッドアイテムの内容
   */
  children: React.ReactNode;
  
  /**
   * 横方向のグリッドセル数
   * @default 1
   */
  colSpan?: number | { sm?: number, md?: number, lg?: number, xl?: number };
  
  /**
   * 縦方向のグリッドセル数
   * @default 1
   */
  rowSpan?: number;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}
```

#### デザイン仕様

- グリッドシステムの基本:
  - 12カラムグリッド
  - デフォルトギャップ: 16px
- レスポンシブブレークポイント:
  - sm: 576px
  - md: 768px
  - lg: 992px
  - xl: 1200px

#### 実装例

```tsx
import React from 'react';
import classNames from 'classnames';

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 12,
  gap = 16,
  responsive = { sm: 1, md: 2, lg: 3, xl: 4 },
  autoRows = true,
  className
}) => {
  const containerClasses = classNames(
    'grid-layout',
    {
      'auto-rows': autoRows
    },
    className
  );
  
  const gapStyle = typeof gap === 'number'
    ? { gap: `${gap}px` }
    : { columnGap: `${gap.x}px`, rowGap: `${gap.y}px` };
  
  const style = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    ...gapStyle
  };
  
  // レスポンシブスタイルをCSSカスタムプロパティとして設定
  Object.entries(responsive).forEach(([breakpoint, cols]) => {
    style[`--grid-columns-${breakpoint}`] = cols;
  });
  
  return (
    <div className={containerClasses} style={style}>
      {children}
    </div>
  );
};

export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan = 1,
  rowSpan = 1,
  className
}) => {
  const itemClasses = classNames(
    'grid-item',
    className
  );
  
  const style: React.CSSProperties = {
    gridColumn: typeof colSpan === 'number' 
      ? `span ${colSpan}` 
      : undefined,
    gridRow: `span ${rowSpan}`
  };
  
  // レスポンシブcolSpanをCSSカスタムプロパティとして設定
  if (typeof colSpan !== 'number') {
    Object.entries(colSpan).forEach(([breakpoint, span]) => {
      style[`--col-span-${breakpoint}`] = span;
    });
  }
  
  return (
    <div className={itemClasses} style={style}>
      {children}
    </div>
  );
};
```

### 3.8 CardGrid

#### Props定義

```typescript
export interface CardGridProps {
  /**
   * グリッドアイテム（通常はCardコンポーネント）
   */
  children: React.ReactNode;
  
  /**
   * カード間のギャップ
   * @default 16
   */
  gap?: number | { x: number, y: number };
  
  /**
   * 各ブレークポイントでの行あたりのカード数
   * @default { sm: 1, md: 2, lg: 3, xl: 4 }
   */
  columns?: {
    sm?: number; // 576px以上のカラム数
    md?: number; // 768px以上のカラム数
    lg?: number; // 992px以上のカラム数
    xl?: number; // 1200px以上のカラム数
  };
  
  /**
   * カード幅を均等にするか
   * @default true
   */
  equalWidth?: boolean;
  
  /**
   * カード高さを均等にするか
   * @default false
   */
  equalHeight?: boolean;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}
```

#### デザイン仕様

- デフォルトのカード間ギャップ: 16px
- カードの最小幅: 250px
- モバイル表示: 1カラム
- デスクトップ表示: 最大4カラム
- カード間の最小間隔: 16px

#### 実装例

```tsx
import React from 'react';
import classNames from 'classnames';

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  gap = 16,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  equalWidth = true,
  equalHeight = false,
  className
}) => {
  const containerClasses = classNames(
    'card-grid',
    {
      'equal-width': equalWidth,
      'equal-height': equalHeight
    },
    className
  );
  
  const gapValue = typeof gap === 'number'
    ? `${gap}px`
    : `${gap.y}px ${gap.x}px`;
  
  const style = {
    '--card-gap': gapValue
  };
  
  // レスポンシブカラム設定をCSSカスタムプロパティとして設定
  Object.entries(columns).forEach(([breakpoint, count]) => {
    style[`--card-columns-${breakpoint}`] = count;
  });
  
  return (
    <div className={containerClasses} style={style}>
      {React.Children.map(children, child => (
        <div className="card-grid__item">
          {child}
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
```

## 4. アクセシビリティ対応

レイアウトコンポーネントは、以下のアクセシビリティ対応を実装しています：

### 4.1 キーボードナビゲーション

- **フォーカス管理**:
  - サイドバーの開閉はキーボード（Tabキー）でフォーカス可能
  - SplitLayoutのリサイズハンドルはTabキーでフォーカス可能、矢印キーでのリサイズ対応
  - モーダルやドロワー表示時のフォーカストラップ実装

- **ショートカットキー**:
  - サイドバー開閉: `Alt+S`
  - 編集/プレビュー切替: `Alt+P`
  - 全画面表示切替: `F11`

### 4.2 スクリーンリーダー

- **ARIA属性**:
  - ナビゲーション要素: `role="navigation"`
  - メインコンテンツ: `role="main"`
  - サイドバー: `role="complementary"`
  - ツールバー: `role="toolbar"`
  - ステータス情報: `role="status"`

- **ARIA状態**:
  - サイドバー開閉状態: `aria-expanded="true/false"`
  - 現在のナビゲーション項目: `aria-current="page"`
  - 折りたたみ要素: `aria-hidden="true/false"`

### 4.3 その他のアクセシビリティ機能

- **色のコントラスト比**:
  - テキストと背景色のコントラスト比は4.5:1以上
  - フォーカス表示は視認性の高い色で実装

- **テキストサイズ**:
  - すべてのレイアウトがテキストサイズ拡大に対応
  - フォントサイズに相対的な単位（rem, em）を使用

- **レスポンシブ対応**:
  - すべての画面サイズと向きに対応
  - ズーム表示時でも正しく表示

## 5. スタイリング

### 5.1 スタイル実装方針

レイアウトコンポーネントのスタイリングには、次の方針を採用しています：

1. **BEMベースの命名規則**:
   - Block: `.main-layout`
   - Element: `.main-layout__header`
   - Modifier: `.main-layout--compact`

2. **レスポンシブデザイン**:
   - モバイルファーストアプローチ
   - メディアクエリによるブレークポイント対応
   - 相対単位（rem, %）の使用

3. **CSSカスタムプロパティ**:
   - 共通変数の定義（色、サイズなど）
   - テーマ切替対応

4. **スタイル適用順序**:
   - レイアウト（display, position, width, height）
   - ボックスモデル（margin, padding, border）
   - 視覚効果（color, background, shadow, opacity）
   - タイポグラフィ（font, text-align, line-height）
   - アニメーション（transition, animation）

### 5.2 テーマ対応

レイアウトコンポーネントは、ライト・ダークテーマの両方に対応しています：

```scss
// themes.scss
:root {
  // ライトテーマ（デフォルト）
  --layout-bg-color: #f5f5f5;
  --content-bg-color: #ffffff;
  --header-bg-color: #ffffff;
  --sidebar-bg-color: #ffffff;
  --border-color: #e0e0e0;
  --text-color: #333333;
  --text-color-secondary: #757575;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  // ダークテーマ
  --layout-bg-color: #121212;
  --content-bg-color: #1e1e1e;
  --header-bg-color: #1e1e1e;
  --sidebar-bg-color: #1e1e1e;
  --border-color: #424242;
  --text-color: #f5f5f5;
  --text-color-secondary: #bbbbbb;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

### 5.3 アニメーションとトランジション

レイアウトコンポーネントでは、以下のアニメーションとトランジションを実装しています：

- サイドバーの開閉: 300ms ease-in-out
- スプリッターのドラッグ時の視覚フィードバック: 50ms linear
- モーダルとドロワーの表示/非表示: 200ms ease
- ページ遷移アニメーション: 300ms fade/slide

## 6. テスト計画

各レイアウトコンポーネントに対して、以下のテストを実装します：

### 6.1 ユニットテスト

```typescript
// MainLayout.test.tsx
describe('MainLayout', () => {
  it('renders correctly with default props', () => {
    render(<MainLayout>Content</MainLayout>);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // sidebar
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });
  
  it('toggles sidebar when menu button is clicked', () => {
    render(<MainLayout>Content</MainLayout>);
    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    // サイドバーは初期状態で開いている
    let sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('open');
    
    // メニューボタンをクリックしてサイドバーを閉じる
    fireEvent.click(menuButton);
    expect(sidebar).not.toHaveClass('open');
    
    // 再度クリックして開く
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('open');
  });
  
  it('hides header when showHeader is false', () => {
    render(<MainLayout showHeader={false}>Content</MainLayout>);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });
  
  it('hides sidebar when showSidebar is false', () => {
    render(<MainLayout showSidebar={false}>Content</MainLayout>);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });
  
  it('hides footer when showFooter is false', () => {
    render(<MainLayout showFooter={false}>Content</MainLayout>);
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});
```

### 6.2 インタラクションテスト

```typescript
// SplitLayout.test.tsx
describe('SplitLayout', () => {
  it('renders both panes correctly', () => {
    render(
      <SplitLayout 
        leftPane={<div>Left Content</div>} 
        rightPane={<div>Right Content</div>}
      />
    );
    
    expect(screen.getByText('Left Content')).toBeInTheDocument();
    expect(screen.getByText('Right Content')).toBeInTheDocument();
  });
  
  it('applies default split position', () => {
    render(
      <SplitLayout 
        leftPane={<div>Left Content</div>} 
        rightPane={<div>Right Content</div>}
        defaultSplit={30}
      />
    );
    
    const leftPane = screen.getByText('Left Content').closest('.split-layout__pane');
    expect(leftPane).toHaveStyle('width: 30%');
  });
  
  it('changes split position when dragging splitter', () => {
    // テスト用にmockの位置情報を設定
    const mockClientRect = {
      left: 0,
      width: 1000,
      right: 1000,
      top: 0,
      height: 1000,
      bottom: 1000,
    };
    
    // BoundingClientRectをモック
    Element.prototype.getBoundingClientRect = jest.fn(() => mockClientRect);
    
    render(
      <SplitLayout 
        leftPane={<div>Left Content</div>} 
        rightPane={<div>Right Content</div>}
        defaultSplit={50}
      />
    );
    
    const splitter = screen.getByRole('separator');
    const leftPane = screen.getByText('Left Content').closest('.split-layout__pane');
    
    // ドラッグ開始
    fireEvent.mouseDown(splitter);
    
    // ドラッグ中（30%の位置に移動）
    fireEvent.mouseMove(document, { clientX: 300 });
    
    // ドラッグ終了
    fireEvent.mouseUp(document);
    
    // 左ペインの幅が更新されていることを確認
    expect(leftPane).toHaveStyle('width: 30%');
  });
  
  it('resets to 50/50 when double clicking splitter', () => {
    render(
      <SplitLayout 
        leftPane={<div>Left Content</div>} 
        rightPane={<div>Right Content</div>}
        defaultSplit={30}
      />
    );
    
    const splitter = screen.getByRole('separator');
    const leftPane = screen.getByText('Left Content').closest('.split-layout__pane');
    
    // 最初は30%
    expect(leftPane).toHaveStyle('width: 30%');
    
    // ダブルクリックで50%にリセット
    fireEvent.doubleClick(splitter);
    
    expect(leftPane).toHaveStyle('width: 50%');
  });
});
```

### 6.3 レスポンシブテスト

```typescript
// レスポンシブテスト用のユーティリティ
const resizeScreenTo = (width: number, height: number) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

describe('MainLayout responsive behavior', () => {
  afterEach(() => {
    // テスト後に画面サイズをリセット
    resizeScreenTo(1024, 768);
  });
  
  it('collapses sidebar on mobile view', () => {
    render(<MainLayout>Content</MainLayout>);
    
    // デスクトップ表示では通常のサイドバーが表示される
    expect(screen.getByRole('complementary')).toHaveClass('desktop-view');
    
    // モバイルサイズにリサイズ
    resizeScreenTo(480, 800);
    
    // サイドバーがモバイルビューに切り替わる
    expect(screen.getByRole('complementary')).toHaveClass('mobile-view');
    expect(screen.getByRole('complementary')).not.toHaveClass('open');
    
    // メニューボタンをクリック
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    // モバイルビューでサイドバーが開く
    expect(screen.getByRole('complementary')).toHaveClass('open');
  });
});
```

## 7. 使用例

### 7.1 MainLayout

```tsx
import { MainLayout } from '@/components/layouts/MainLayout';
import Sidebar from '@/components/navigation/Sidebar';
import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';

const DashboardPage = () => {
  return (
    <MainLayout
      title="ダッシュボード"
      headerContent={<Header />}
      sidebarContent={<Sidebar />}
      footerContent={<Footer />}
    >
      <h1>ようこそ、ダッシュボードへ</h1>
      <p>今日のアクティビティを確認しましょう。</p>
      
      {/* ダッシュボードコンテンツ */}
    </MainLayout>
  );
};
```

### 7.2 AuthLayout

```tsx
import { AuthLayout } from '@/components/layouts/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout 
      title="ログイン"
      backgroundImage="/images/login-background.jpg"
      footerContent={
        <p>アカウントをお持ちでない場合は<a href="/register">登録</a>してください。</p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
};
```

### 7.3 EditorLayout

```tsx
import { EditorLayout } from '@/components/layouts/EditorLayout';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import MarkdownPreview from '@/components/editor/MarkdownPreview';
import EditorToolbar from '@/components/editor/EditorToolbar';
import { useState } from 'react';

const PostEditor = () => {
  const [content, setContent] = useState('# 新しい投稿');
  
  const handleSave = () => {
    // 保存処理
    console.log('保存しました:', content);
  };
  
  return (
    <EditorLayout
      title="新規投稿作成"
      toolbar={<EditorToolbar />}
      onSave={handleSave}
      previewContent={<MarkdownPreview markdown={content} />}
    >
      <MarkdownEditor 
        value={content} 
        onChange={setContent} 
      />
    </EditorLayout>
  );
};
```

### 7.4 複合的なレイアウト例

```tsx
import { MainLayout } from '@/components/layouts/MainLayout';
import { SplitLayout } from '@/components/layouts/SplitLayout';
import { GridLayout, GridItem } from '@/components/layouts/GridLayout';
import Sidebar from '@/components/navigation/Sidebar';
import Header from '@/components/navigation/Header';
import Card from '@/components/ui/Card';

const AnalyticsPage = () => {
  return (
    <MainLayout
      title="分析ダッシュボード"
      headerContent={<Header />}
      sidebarContent={<Sidebar />}
    >
      <SplitLayout
        direction="vertical"
        defaultSplit={40}
        leftPane={
          <div className="chart-container">
            {/* 大きなチャート */}
            <h2>月間トレンド</h2>
            <LineChart data={monthlyData} />
          </div>
        }
        rightPane={
          <GridLayout columns={12} gap={16}>
            <GridItem colSpan={4}>
              <Card title="訪問者数">
                {/* 訪問者統計 */}
              </Card>
            </GridItem>
            <GridItem colSpan={4}>
              <Card title="ページビュー">
                {/* ページビュー統計 */}
              </Card>
            </GridItem>
            <GridItem colSpan={4}>
              <Card title="直帰率">
                {/* 直帰率統計 */}
              </Card>
            </GridItem>
            <GridItem colSpan={6}>
              <Card title="トラフィックソース">
                {/* トラフィックソース統計 */}
              </Card>
            </GridItem>
            <GridItem colSpan={6}>
              <Card title="デバイス別訪問者">
                {/* デバイス統計 */}
              </Card>
            </GridItem>
          </GridLayout>
        }
      />
    </MainLayout>
  );
};
```

## 8. パフォーマンス最適化

レイアウトコンポーネントには、以下のパフォーマンス最適化を実装しています：

1. **メモ化によるレンダリング最適化**:
   - React.memo によるコンポーネントのメモ化
   - useMemo によるコンピューテーションのメモ化
   - useCallback によるコールバック関数のメモ化

2. **レイアウトスラッシング防止**:
   - スタイル変更の一括処理
   - requestAnimationFrame の使用

3. **リサイズ処理の最適化**:
   - デバウンスによるリサイズイベントの制限
   - パフォーマンスに影響するスタイル計算の最小化

4. **レイジーローディング**:
   - 画面外コンテンツの遅延読み込み
   - React.lazy と Suspense の使用

## 9. 今後の改善計画

今後のレイアウトコンポーネントの改善計画は以下の通りです：

1. **追加コンポーネント**:
   - マルチパネルレイアウト（3分割以上）
   - タブレイアウト
   - ステッパーレイアウト
   - マスターディテールレイアウト

2. **機能改善**:
   - ドラッグ&ドロップによるレイアウト調整
   - レイアウト設定の保存と読み込み
   - カスタムテーマのサポート強化

3. **パフォーマンス最適化**:
   - 仮想化スクロールの組み込み
   - スタイルのコード分割

4. **アクセシビリティ強化**:
   - キーボードナビゲーションの改善
   - 支援技術との連携強化
   - ハイコントラストモードのサポート

## 10. 注意事項

- レイアウトコンポーネントは基盤要素であるため、大きな変更を行う場合は影響範囲を慎重に検討してください。
- パフォーマンス上の理由から、深くネストされたレイアウトの使用は避けてください。
- アクセシビリティの観点から、適切な意味的要素とARIA属性を常に維持してください。
- レスポンシブデザインのテストは、実機および複数のブラウザで行ってください。

---

作成日: 2025-05-01
最終更新日: 2025-05-01
作成者: レイアウトチーム