# コンポーネント設計テンプレート

## コンポーネント基本情報

- **コンポーネント名**: [PascalCase形式で記載]
- **タイプ**: [atom/molecule/organism]
- **対応するタスク**: [タスクID]
- **依存するコンポーネント**: [依存するコンポーネントのリスト]

## 機能概要

[コンポーネントの主な機能と役割について1-2段落で説明]

## 要件

- [要件1]
- [要件2]
- [要件3]

## Props定義

```typescript
export interface [コンポーネント名]Props {
  /**
   * [Prop1の説明]
   * @default [デフォルト値があれば記載]
   */
  [prop1名]: [型];
  
  /**
   * [Prop2の説明]
   * @default [デフォルト値があれば記載]
   */
  [prop2名]?: [型]; // オプショナルな場合は?を付ける
  
  /**
   * [Prop3の説明]
   */
  [prop3名]: [型];
  
  // その他のPropsを追加
}
```

## 状態管理

[コンポーネント内で管理する状態がある場合、その詳細を記載]

```typescript
// 状態管理の例
const [isOpen, setIsOpen] = useState<boolean>(false);
const [value, setValue] = useState<string>('');
```

## 振る舞い

[コンポーネントの振る舞いに関する説明。イベントハンドラやライフサイクルメソッド等の動作について記述]

```typescript
// イベントハンドラの例
const handleClick = () => {
  setIsOpen(!isOpen);
};

// 副作用の例
useEffect(() => {
  // 処理内容
}, [依存配列]);
```

## スタイル

[スタイリングの方針や特記事項がある場合に記載]

```typescript
// スタイルの例
const containerStyles = classNames(
  'base-style-class',
  {
    'active-class': isActive,
    'disabled-class': disabled,
  },
  className
);
```

## レスポンシブ対応

[レスポンシブデザインの対応方針を記載]

- モバイル (< 768px): [対応方針]
- タブレット (768px - 1024px): [対応方針]
- デスクトップ (> 1024px): [対応方針]

## アクセシビリティ対応

[アクセシビリティ対応の方針を記載]

- キーボード操作: [対応方法]
- スクリーンリーダー: [対応方法]
- ARIA属性: [使用するARIA属性]
- コントラスト比: [対応方針]

## テスト計画

[テスト対象とする内容を記載]

### ユニットテスト

```typescript
// テストケースの例
describe('[コンポーネント名]', () => {
  it('正しくレンダリングされること', () => {
    // テスト内容
  });
  
  it('[イベント]が発生したとき[期待する動作]すること', () => {
    // テスト内容
  });
  
  // その他のテストケース
});
```

### 統合テスト

[必要に応じて統合テストについて記載]

## 実装例

```tsx
import React, { useState } from 'react';
import classNames from 'classnames';

export interface [コンポーネント名]Props {
  // Propsの定義
}

export const [コンポーネント名]: React.FC<[コンポーネント名]Props> = ({
  // Propsの分割代入
}) => {
  // 状態の定義
  
  // イベントハンドラの定義
  
  // JSXのレンダリング
  return (
    <div className={containerStyles}>
      {/* コンポーネントの内容 */}
    </div>
  );
};

export default [コンポーネント名];
```

## 使用例

```tsx
// 基本的な使用例
<[コンポーネント名] />

// プロパティを指定した例
<[コンポーネント名] 
  [prop1]={[値1]} 
  [prop2]={[値2]}
>
  [子要素がある場合]
</[コンポーネント名]>
```

## 注意事項

- [実装時の注意点や制約事項]
- [既知の問題点]
- [将来的な拡張計画]

---

作成日: [作成日]
最終更新日: [最終更新日]
作成者: [作成者名]