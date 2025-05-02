# コンポーネント設計テンプレート

## コンポーネント基本情報

- **コンポーネント名**: Navigation
- **タイプ**: organism
- **対応するタスク**: タスク017
- **依存するコンポーネント**: 
  - NavigationLink (atom)
  - NavigationGroup (molecule)
  - UserProfile (molecule)
  - ThemeToggle (atom)

## 機能概要

Navigationコンポーネントはアプリケーション全体のナビゲーション機能を提供するコンポーネントです。サイドバーやヘッダーに配置され、アプリケーション内の主要なページへのリンク、ユーザープロフィール表示、テーマ切り替え機能などを含みます。レスポンシブデザインに対応し、モバイル画面ではハンバーガーメニューとして表示されます。

## 要件

- アプリケーション内の主要ページへのナビゲーションリンクを提供すること
- 現在のページをハイライト表示すること
- ユーザープロフィール情報を表示すること
- ダークモード/ライトモードの切り替え機能を提供すること
- モバイル画面ではコンパクトなハンバーガーメニューとして表示されること
- ナビゲーションセクションのグルーピングをサポートすること
- 認証状態に応じて表示内容を変更できること

## Props定義

```typescript
export interface NavigationProps {
  /**
   * ナビゲーションのタイプ（サイドバーまたはヘッダー）
   * @default 'sidebar'
   */
  type?: 'sidebar' | 'header';
  
  /**
   * ナビゲーションリンクの配列
   */
  navigationItems: NavigationItem[];
  
  /**
   * 現在のアクティブなページのパス
   */
  activePath: string;
  
  /**
   * ユーザー情報（未認証の場合はnull）
   */
  user?: UserInfo | null;
  
  /**
   * 現在のテーマ
   * @default 'light'
   */
  theme?: 'light' | 'dark';
  
  /**
   * テーマ切り替え時のコールバック
   */
  onThemeToggle?: () => void;
  
  /**
   * ログアウト時のコールバック
   */
  onLogout?: () => void;
  
  /**
   * モバイル表示時のハンバーガーメニュークリック時のコールバック
   */
  onMenuToggle?: () => void;
  
  /**
   * コンポーネントのカスタムクラス名
   */
  className?: string;
}

export interface NavigationItem {
  /**
   * リンクのラベル
   */
  label: string;
  
  /**
   * リンク先のパス
   */
  path: string;
  
  /**
   * アイコン名
   */
  icon?: string;
  
  /**
   * サブメニューの配列（グループ化する場合）
   */
  items?: NavigationItem[];
  
  /**
   * 表示条件（認証状態など）
   */
  showIf?: 'always' | 'authenticated' | 'unauthenticated' | 'admin';
}

export interface UserInfo {
  /**
   * ユーザーID
   */
  id: number;
  
  /**
   * ユーザー名
   */
  username: string;
  
  /**
   * ユーザーの表示名
   */
  displayName: string;
  
  /**
   * アバター画像URL
   */
  avatarUrl?: string;
  
  /**
   * ユーザーの役割
   */
  role: 'user' | 'helper' | 'admin';
}
```

## 状態管理

```typescript
// サイドバーの開閉状態（モバイル表示時）
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

// 画面幅の状態
const [isMobile, setIsMobile] = useState<boolean>(false);

// 画面サイズ変更検知
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  window.addEventListener('resize', handleResize);
  handleResize(); // 初期チェック
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// ハンバーガーメニュークリック時の処理
const handleMenuToggle = () => {
  setIsMobileMenuOpen(!isMobileMenuOpen);
  if (onMenuToggle) {
    onMenuToggle();
  }
};
```

## 振る舞い

```typescript
// ナビゲーションアイテムのフィルタリング（認証状態に基づいて）
const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
  return items.filter(item => {
    if (!item.showIf || item.showIf === 'always') {
      return true;
    }
    
    if (item.showIf === 'authenticated' && user) {
      return true;
    }
    
    if (item.showIf === 'unauthenticated' && !user) {
      return true;
    }
    
    if (item.showIf === 'admin' && user?.role === 'admin') {
      return true;
    }
    
    return false;
  }).map(item => {
    if (item.items) {
      return {
        ...item,
        items: filterNavigationItems(item.items)
      };
    }
    return item;
  });
};

// アイテムがアクティブかどうかのチェック
const isActive = (path: string): boolean => {
  return activePath === path || activePath.startsWith(`${path}/`);
};

// ログアウト処理
const handleLogout = () => {
  if (onLogout) {
    onLogout();
  }
};
```

## スタイル

```typescript
// ナビゲーションコンテナのスタイル
const navigationClasses = classNames(
  'navigation',
  {
    'navigation--sidebar': type === 'sidebar',
    'navigation--header': type === 'header',
    'navigation--mobile': isMobile,
    'navigation--mobile-open': isMobile && isMobileMenuOpen,
    'navigation--dark': theme === 'dark',
  },
  className
);

// リンクアイテムのスタイル
const linkClasses = (path: string) => classNames(
  'navigation__link',
  {
    'navigation__link--active': isActive(path),
    'navigation__link--dark': theme === 'dark',
  }
);
```

## レスポンシブ対応

- モバイル (< 768px): 
  - ヘッダー型: ハンバーガーメニューでドロップダウン表示
  - サイドバー型: デフォルトで非表示、ハンバーガーメニュークリックでサイドパネル表示

- タブレット (768px - 1024px): 
  - ヘッダー型: 横並びメニュー、必要に応じてドロップダウン
  - サイドバー型: コンパクト表示（アイコンのみ）、ホバーで拡張表示

- デスクトップ (> 1024px): 
  - ヘッダー型: 横並び完全表示
  - サイドバー型: 常時表示、フル幅

## アクセシビリティ対応

- キーボード操作: 
  - Tab キーでのナビゲーション
  - Enter キーでのリンクアクティベーション
  - Esc キーでのドロップダウン/モバイルメニュー閉じる操作

- スクリーンリーダー: 
  - 適切なARIA属性の使用
  - フォーカス状態の適切な管理

- ARIA属性: 
  - aria-expanded: ドロップダウンメニューの状態
  - aria-current: 現在のアクティブページ
  - aria-haspopup: サブメニューを持つアイテム

- コントラスト比: 
  - テキストと背景のコントラスト比は4.5:1以上を確保

## テスト計画

### ユニットテスト

```typescript
describe('Navigation', () => {
  it('正しくレンダリングされること', () => {
    const navigationItems = [
      { label: 'ホーム', path: '/' },
      { label: 'プロフィール', path: '/profile', showIf: 'authenticated' }
    ];
    
    render(
      <Navigation 
        navigationItems={navigationItems} 
        activePath="/" 
        user={null}
      />
    );
    
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.queryByText('プロフィール')).not.toBeInTheDocument();
  });
  
  it('認証ユーザーの場合、認証済みリンクが表示されること', () => {
    const navigationItems = [
      { label: 'ホーム', path: '/' },
      { label: 'プロフィール', path: '/profile', showIf: 'authenticated' }
    ];
    
    const user = {
      id: 1,
      username: 'testuser',
      displayName: 'Test User',
      role: 'user'
    };
    
    render(
      <Navigation 
        navigationItems={navigationItems} 
        activePath="/" 
        user={user}
      />
    );
    
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('プロフィール')).toBeInTheDocument();
  });
  
  it('アクティブなリンクが正しくハイライトされること', () => {
    const navigationItems = [
      { label: 'ホーム', path: '/' },
      { label: 'プロフィール', path: '/profile' }
    ];
    
    render(
      <Navigation 
        navigationItems={navigationItems} 
        activePath="/profile" 
        user={null}
      />
    );
    
    const homeLink = screen.getByText('ホーム').closest('a');
    const profileLink = screen.getByText('プロフィール').closest('a');
    
    expect(homeLink).not.toHaveClass('navigation__link--active');
    expect(profileLink).toHaveClass('navigation__link--active');
  });
  
  it('モバイル表示時にハンバーガーメニューが表示されること', () => {
    // 画面サイズをモバイルに設定
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    const navigationItems = [
      { label: 'ホーム', path: '/' }
    ];
    
    render(
      <Navigation 
        navigationItems={navigationItems} 
        activePath="/" 
        user={null}
      />
    );
    
    expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument();
  });
});
```

### 統合テスト

```typescript
describe('Navigation Integration', () => {
  it('テーマ切り替えが正常に動作すること', () => {
    const mockThemeToggle = jest.fn();
    
    render(
      <Navigation 
        navigationItems={[]} 
        activePath="/" 
        user={null}
        theme="light"
        onThemeToggle={mockThemeToggle}
      />
    );
    
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(mockThemeToggle).toHaveBeenCalledTimes(1);
  });
  
  it('ログアウトボタンが正常に動作すること', () => {
    const mockLogout = jest.fn();
    const user = {
      id: 1,
      username: 'testuser',
      displayName: 'Test User',
      role: 'user'
    };
    
    render(
      <Navigation 
        navigationItems={[]} 
        activePath="/" 
        user={user}
        onLogout={mockLogout}
      />
    );
    
    fireEvent.click(screen.getByText('ログアウト'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
```

## 実装例

```tsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import NavigationLink from '../atoms/NavigationLink';
import NavigationGroup from '../molecules/NavigationGroup';
import UserProfile from '../molecules/UserProfile';
import ThemeToggle from '../atoms/ThemeToggle';

export const Navigation: React.FC<NavigationProps> = ({
  type = 'sidebar',
  navigationItems,
  activePath,
  user = null,
  theme = 'light',
  onThemeToggle,
  onLogout,
  onMenuToggle,
  className
}) => {
  // 状態の初期化
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // 画面サイズ変更検知
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // 初期チェック
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // ハンバーガーメニュー切替
  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMenuToggle) {
      onMenuToggle();
    }
  };
  
  // ログアウト処理
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };
  
  // ナビゲーションアイテムのフィルタリング
  const filteredItems = filterNavigationItems(navigationItems);
  
  // スタイルクラスの生成
  const navigationClasses = classNames(
    'navigation',
    {
      'navigation--sidebar': type === 'sidebar',
      'navigation--header': type === 'header',
      'navigation--mobile': isMobile,
      'navigation--mobile-open': isMobile && isMobileMenuOpen,
      'navigation--dark': theme === 'dark',
    },
    className
  );
  
  return (
    <nav className={navigationClasses} aria-label="メインナビゲーション">
      {/* モバイルメニューボタン */}
      {isMobile && (
        <button 
          className="navigation__mobile-toggle"
          onClick={handleMenuToggle}
          aria-expanded={isMobileMenuOpen}
          aria-controls="navigation-menu"
          data-testid="hamburger-menu"
        >
          <span className="sr-only">メニュー</span>
          <div className="hamburger-icon"></div>
        </button>
      )}
      
      {/* ナビゲーションコンテンツ */}
      <div 
        id="navigation-menu" 
        className={`navigation__content ${isMobileMenuOpen ? 'open' : ''}`}
      >
        {/* ユーザープロフィール */}
        {user && (
          <UserProfile 
            user={user}
            theme={theme}
            onLogout={handleLogout}
          />
        )}
        
        {/* ナビゲーションリンク */}
        <ul className="navigation__list">
          {filteredItems.map((item) => (
            <li key={item.path} className="navigation__item">
              {item.items ? (
                <NavigationGroup
                  item={item}
                  activePath={activePath}
                  theme={theme}
                />
              ) : (
                <NavigationLink
                  path={item.path}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.path)}
                  theme={theme}
                />
              )}
            </li>
          ))}
        </ul>
        
        {/* テーマ切り替え */}
        <div className="navigation__footer">
          <ThemeToggle
            theme={theme}
            onChange={onThemeToggle}
            data-testid="theme-toggle"
          />
        </div>
      </div>
    </nav>
  );
};

// ナビゲーションアイテムのフィルタリング（認証状態に基づいて）
function filterNavigationItems(items: NavigationItem[], user?: UserInfo | null): NavigationItem[] {
  return items.filter(item => {
    if (!item.showIf || item.showIf === 'always') {
      return true;
    }
    
    if (item.showIf === 'authenticated' && user) {
      return true;
    }
    
    if (item.showIf === 'unauthenticated' && !user) {
      return true;
    }
    
    if (item.showIf === 'admin' && user?.role === 'admin') {
      return true;
    }
    
    return false;
  }).map(item => {
    if (item.items) {
      return {
        ...item,
        items: filterNavigationItems(item.items, user)
      };
    }
    return item;
  });
}

export default Navigation;
```

## 使用例

```tsx
// 基本的な使用例
<Navigation 
  navigationItems={[
    { label: 'ホーム', path: '/', icon: 'home' },
    { label: 'レシピ一覧', path: '/recipes', icon: 'book' },
    { 
      label: 'マイページ', 
      path: '/mypage', 
      icon: 'user',
      showIf: 'authenticated',
      items: [
        { label: 'プロフィール', path: '/mypage/profile' },
        { label: '予定表', path: '/mypage/schedule' }
      ] 
    },
    { label: '管理画面', path: '/admin', icon: 'settings', showIf: 'admin' },
    { label: 'ログイン', path: '/login', icon: 'login', showIf: 'unauthenticated' }
  ]}
  activePath="/recipes"
  user={{
    id: 1,
    username: 'yamada',
    displayName: '山田太郎',
    avatarUrl: '/images/avatar.jpg',
    role: 'user'
  }}
  theme="light"
  onThemeToggle={() => console.log('テーマ切替')}
  onLogout={() => console.log('ログアウト')}
/>

// ヘッダータイプの使用例
<Navigation 
  type="header"
  navigationItems={[
    { label: 'ホーム', path: '/' },
    { label: 'レシピ', path: '/recipes' },
    { label: 'お問い合わせ', path: '/contact' }
  ]}
  activePath="/"
  user={null}
/>
```

## 注意事項

- モバイル表示時はパフォーマンスを考慮して、不要なコンポーネントのレンダリングを避ける
- ナビゲーションが深くなりすぎないようにする（最大2階層程度に抑える）
- アイコンは一貫性を持たせる
- フォーカス状態の視認性を確保する
- 将来的には、ナビゲーション項目の順序をドラッグアンドドロップで変更できる機能を追加予定

---

作成日: 2025-05-02
最終更新日: 2025-05-02
作成者: Claude
