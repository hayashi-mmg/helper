# テストガイドライン

このドキュメントでは、本プロジェクトで採用しているテスト戦略と実装ガイドラインについて説明します。既存のテスト関連ドキュメントから必要な部分を抽出・再構成しています。

## テスト戦略の概要

本プロジェクトでは、以下の3種類のテストを実施します：

1. **ユニットテスト**: 個別のコンポーネント、関数、フックのテスト
2. **統合テスト**: 複数のコンポーネントや機能の連携テスト
3. **E2Eテスト**: ユーザーフロー全体のテスト

各テストは、開発→承認フローの中で重要な役割を果たし、コードの品質を確保します。

## テストの配置と命名規則

- **ユニットテスト**:
  - 配置: テスト対象と同じディレクトリ
  - 命名: `[対象ファイル名].test.tsx`
  - 例: `Button.tsx` → `Button.test.tsx`

- **統合テスト**:
  - 配置: `features/[name]/__tests__/integration/`
  - 命名: `[テスト内容].test.tsx`
  - 例: `login-flow.test.tsx`

- **E2Eテスト**:
  - 配置: ルートの`e2e/`ディレクトリ
  - 命名: `[機能名].[テスト内容].spec.ts`
  - 例: `auth.login.spec.ts`

## コンポーネントテストのガイドライン

### 基本原則

1. **レンダリングのテスト**: コンポーネントが正しくレンダリングされることを確認
2. **インタラクションのテスト**: ユーザー操作に対して適切に反応することを確認
3. **プロップスのテスト**: 異なるプロップスでの動作を確認
4. **状態変化のテスト**: 状態変化によるUI変更を確認
5. **エラーケースのテスト**: エラー状態の適切な処理を確認

### テスト実装例

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  // レンダリングテスト
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  // インタラクションテスト
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // プロップスのテスト
  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    
    // スタイルの検証方法はプロジェクトによって異なる
    expect(button).toHaveClass('primary');
  });

  // 無効状態のテスト
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## 要素の選択方法

テストでの要素の選択には、以下の優先順位で方法を選びます：

1. **アクセシビリティロール**: `getByRole`（最優先）
2. **ラベルテキスト**: `getByLabelText`（フォーム要素）
3. **テキスト内容**: `getByText`（テキストを含む要素）
4. **プレースホルダー**: `getByPlaceholderText`（入力フィールド）
5. **テストID**: `getByTestId`（上記で選択できない場合のみ）

```typescript
// 良い例
const button = screen.getByRole('button', { name: 'Submit' });
const nameInput = screen.getByLabelText('Full name');
const heading = screen.getByRole('heading', { name: 'Registration Form' });

// 避けるべき例（必要な場合以外）
const button = screen.getByTestId('submit-button');
```

## テストIDの使用ガイドライン

テストIDは、他の方法で要素を選択できない場合にのみ使用します。テストIDを使用する場合は、以下の命名規則に従います：

```typescript
// コンポーネント内
<div data-testid="user-profile-container">
  <button data-testid="user-profile-edit-button">Edit</button>
</div>

// テスト内
const container = screen.getByTestId('user-profile-container');
const editButton = screen.getByTestId('user-profile-edit-button');
```

## モックの活用

外部依存を持つコンポーネントのテストでは、適切にモックを使用します：

```typescript
// APIクライアントのモック
jest.mock('../../lib/api/client', () => ({
  fetchUserData: jest.fn().mockResolvedValue({ name: 'Test User' }),
}));

// Contextのモック
jest.mock('../../providers/AuthProvider', () => ({
  useAuth: jest.fn().mockReturnValue({
    isAuthenticated: true,
    user: { id: '123', name: 'Test User' },
  }),
}));
```

## テストとタスク記録の連携

開発→承認フローにおけるテストの役割：

1. **開発フェーズ**:
   - 実装と並行してテストを作成
   - TDDアプローチの推奨（可能な場合）
   - テストカバレッジ目標: 最低80%

2. **レビューフェーズ**:
   - テスト実装の品質チェック
   - エッジケースのカバー状況確認
   - テストの可読性と保守性確認

3. **承認フェーズ**:
   - すべてのテストが成功することを確認
   - テストカバレッジの目標達成確認
   - CI/CDでのテスト実行結果確認

## テストの記録とドキュメント化

タスク記録には、テスト実装に関する情報も含めます：

```markdown
## テスト実装状況
- [x] ユニットテスト実装 (カバレッジ: 85%)
- [x] エッジケーステスト
- [ ] 統合テスト

## テスト実行結果
```shell
PASS src/components/Button.test.tsx
PASS src/features/auth/components/LoginForm.test.tsx
```
```

## テストのトラブルシューティング

### よくある問題と解決策

1. **非同期テストの失敗**:
   ```typescript
   // 正しい非同期テスト
   it('loads user data', async () => {
     render(<UserProfile userId="123" />);
     // waitForを使用して非同期処理の完了を待つ
     await waitFor(() => {
       expect(screen.getByText('Test User')).toBeInTheDocument();
     });
   });
   ```

2. **styled-componentsとのテスト互換性問題**:
   - Jestの設定でスタイルモックを適切に設定
   - ThemeProviderのテスト用ラッパーを作成

3. **TestIDの不一致**:
   - コンポーネントとテスト間でTestID命名規則を統一
   - テスト失敗時にはscreen.debugを使用してDOMを確認

## その他の参考資料

詳細なテストガイドラインについては、以下のドキュメントも参照してください：

- [コンポーネントテストパターン集](./test-patterns.md)
- [テストのトラブルシューティングガイド](./troubleshooting/index.md)

---

最終更新日: 2025-04-11
