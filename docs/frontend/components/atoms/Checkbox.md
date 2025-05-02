# Checkbox コンポーネント仕様書

## コンポーネント基本情報

- **コンポーネント名**: Checkbox
- **タイプ**: atom
- **対応するタスク**: タスク014
- **依存するコンポーネント**: なし

## 機能概要

Checkboxコンポーネントは、真偽値の入力（オン・オフの選択）を提供するフォーム要素です。単独での使用や、複数選択可能なオプションリストとしての使用が可能です。アクセシビリティを考慮した設計で、カスタマイズされた外観を提供します。

## 要件

- チェックボックスの機能を提供する
- ラベルテキストを表示できる
- チェック状態（選択/未選択）を視覚的に表現する
- 無効状態に対応する
- エラー状態に対応する
- インデント付きでグループ化可能にする
- 中間状態（indeterminate）に対応する（複数選択のグループ用）

## Props定義

```typescript
export interface CheckboxProps {
  /**
   * チェックボックスのID
   */
  id: string;
  
  /**
   * チェックボックスの名前
   */
  name: string;
  
  /**
   * ラベルテキスト
   */
  label: string;
  
  /**
   * チェック状態
   */
  checked: boolean;
  
  /**
   * 値変更時のコールバック関数
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * 無効状態
   * @default false
   */
  disabled?: boolean;
  
  /**
   * エラー状態
   * @default false
   */
  error?: boolean;
  
  /**
   * 中間状態（一部選択）
   * @default false
   */
  indeterminate?: boolean;
  
  /**
   * インデントレベル（グループ化時）
   * @default 0
   */
  indentLevel?: number;
  
  /**
   * チェックボックスのサイズ
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 追加のCSSクラス
   */
  className?: string;
}
```

## 状態管理

Propsとして受け取った`checked`と`onChange`を使用して、親コンポーネントで状態を管理します。
中間状態（indeterminate）はHTMLの属性ではなくDOMプロパティなので、useRefとuseEffectを使用して設定します。

```typescript
const checkboxRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (checkboxRef.current) {
    checkboxRef.current.indeterminate = indeterminate || false;
  }
}, [indeterminate]);
```

## 振る舞い

チェックボックスがクリックされると、`onChange`コールバックが呼び出され、親コンポーネントに通知されます。
`disabled`が`true`の場合、チェックボックスは無効化され、ユーザーによる変更ができなくなります。
`indeterminate`が`true`の場合、チェックボックスは中間状態の視覚表示になります。
`indentLevel`が0より大きい場合、左側にインデントが追加され、階層構造を視覚的に表現します。

## スタイル

```typescript
const getCheckboxClasses = () => {
  return classNames(
    'checkbox',
    `checkbox--${size}`,
    {
      'checkbox--checked': checked,
      'checkbox--indeterminate': indeterminate,
      'checkbox--error': error,
      'checkbox--disabled': disabled,
      [`checkbox--indent-${indentLevel}`]: indentLevel > 0
    },
    className
  );
};
```

## レスポンシブ対応

- モバイル (< 768px): タッチフレンドリーなサイズに自動調整
- タブレット (768px - 1024px): 通常の表示
- デスクトップ (> 1024px): 通常の表示

## アクセシビリティ対応

- キーボード操作: 標準のチェックボックス操作（Space キーでトグル）
- スクリーンリーダー: 適切なラベル、状態（チェック、未チェック、中間状態）の読み上げ対応
- ARIA属性: 
  - `aria-checked`: 選択状態（true、false、mixed）
  - `aria-disabled`: 無効状態の場合true
- コントラスト比: WCAG AAレベル以上のコントラスト比を確保

## テスト計画

### ユニットテスト

```typescript
describe('Checkbox', () => {
  it('正しくレンダリングされること', () => {
    // テスト内容
  });
  
  it('クリック時にonChangeが呼び出されること', () => {
    // テスト内容
  });
  
  it('無効状態のとき、クリックしてもonChangeが呼び出されないこと', () => {
    // テスト内容
  });
  
  it('中間状態が正しく表示されること', () => {
    // テスト内容
  });
  
  it('インデントが正しく適用されること', () => {
    // テスト内容
  });
  
  it('エラー状態が正しく表示されること', () => {
    // テスト内容
  });
});
```

## 実装例

```tsx
import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  error = false,
  indeterminate = false,
  indentLevel = 0,
  size = 'medium',
  className
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const checkboxId = id || `checkbox-${name}`;
  
  // 中間状態（indeterminate）の設定
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  return (
    <div 
      className={classNames(
        'checkbox-container',
        `checkbox-container--${size}`,
        {
          'checkbox-container--error': error,
          'checkbox-container--disabled': disabled,
          [`checkbox-container--indent-${indentLevel}`]: indentLevel > 0
        },
        className
      )}
      style={{ marginLeft: `${indentLevel * 1.5}rem` }}
    >
      <input
        ref={checkboxRef}
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-input"
        aria-checked={indeterminate ? 'mixed' : checked}
      />
      
      <label 
        htmlFor={checkboxId} 
        className="checkbox-label"
      >
        <span className="checkbox-custom">
          {checked && !indeterminate && (
            <svg className="checkbox-icon" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
          {indeterminate && (
            <svg className="checkbox-icon" viewBox="0 0 24 24">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          )}
        </span>
        <span className="checkbox-label-text">
          {label}
        </span>
      </label>
    </div>
  );
};

export default Checkbox;
```

## 使用例

```tsx
// 基本的な使用例
<Checkbox
  id="terms"
  name="terms"
  label="利用規約に同意する"
  checked={isAgreed}
  onChange={(e) => setIsAgreed(e.target.checked)}
/>

// 無効状態の例
<Checkbox
  id="premium"
  name="premium"
  label="プレミアム機能（現在ご利用いただけません）"
  checked={false}
  onChange={() => {}}
  disabled
/>

// インデント付きの例（グループ化）
<div>
  <Checkbox
    id="all-notifications"
    name="all-notifications"
    label="すべての通知"
    checked={allChecked}
    indeterminate={someChecked}
    onChange={handleAllChange}
  />
  <Checkbox
    id="email-notifications"
    name="email-notifications"
    label="メール通知"
    checked={emailChecked}
    onChange={handleEmailChange}
    indentLevel={1}
  />
  <Checkbox
    id="push-notifications"
    name="push-notifications"
    label="プッシュ通知"
    checked={pushChecked}
    onChange={handlePushChange}
    indentLevel={1}
  />
</div>
```

## 注意事項

- 複数のチェックボックスをグループ化する場合、親子関係の一貫性を維持する必要があります
- 中間状態（indeterminate）は視覚的な表現のみで、フォーム送信値としては常に`true`または`false`になります
- ラベルはチェックボックス自体をクリックしなくても操作できるように十分な大きさを確保してください

---

作成日: 2025-05-02
最終更新日: 2025-05-02
作成者: フロントエンドチーム