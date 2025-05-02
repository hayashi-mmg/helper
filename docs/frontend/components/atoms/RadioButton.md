# RadioButton コンポーネント仕様書

## コンポーネント基本情報

- **コンポーネント名**: RadioButton
- **タイプ**: atom
- **対応するタスク**: タスク014
- **依存するコンポーネント**: なし

## 機能概要

RadioButtonコンポーネントは、複数の選択肢から1つだけを選択するためのフォーム要素です。同じname属性を持つRadioButtonのグループ内で相互排他的な選択を提供します。アクセシビリティを考慮した設計で、カスタマイズされた外観を提供します。

## 要件

- ラジオボタンの機能を提供する
- ラベルテキストを表示できる
- 選択状態を視覚的に表現する
- 無効状態に対応する
- エラー状態に対応する
- 同一グループ内での相互排他的な選択を保証する
- 縦配置と横配置に対応する

## Props定義

```typescript
export interface RadioButtonProps {
  /**
   * ラジオボタンのID
   */
  id: string;
  
  /**
   * ラジオボタンの名前（グループ名）
   */
  name: string;
  
  /**
   * ラベルテキスト
   */
  label: string;
  
  /**
   * ラジオボタンの値
   */
  value: string;
  
  /**
   * 現在選択されている値
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
   * ラジオボタンのサイズ
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

Propsとして受け取った`checked`と`onChange`を使用して、親コンポーネントで状態を管理します。ラジオボタン自体は内部状態を持ちません。グループ内での状態管理は親コンポーネントの責任です。

## 振る舞い

ラジオボタンがクリックされると、`onChange`コールバックが呼び出され、親コンポーネントに通知されます。同じname属性を持つグループ内では、一度に1つのラジオボタンだけが選択状態になります。
`disabled`が`true`の場合、ラジオボタンは無効化され、ユーザーによる変更ができなくなります。
単一のラジオボタンでは機能が限定的なため、通常は複数のRadioButtonを含むRadioGroupとして使用されます。

## スタイル

```typescript
const getRadioClasses = () => {
  return classNames(
    'radio-button',
    `radio-button--${size}`,
    {
      'radio-button--checked': checked,
      'radio-button--error': error,
      'radio-button--disabled': disabled
    },
    className
  );
};
```

## レスポンシブ対応

- モバイル (< 768px): タッチフレンドリーなサイズに自動調整、縦配置推奨
- タブレット (768px - 1024px): 通常の表示、縦/横配置両対応
- デスクトップ (> 1024px): 通常の表示、縦/横配置両対応

## アクセシビリティ対応

- キーボード操作: 標準のラジオボタン操作（Tab キーで移動、Space キーで選択）
- スクリーンリーダー: 適切なラベル、状態（選択/未選択）の読み上げ対応
- ARIA属性: 
  - `aria-checked`: 選択状態
  - `aria-disabled`: 無効状態の場合true
- コントラスト比: WCAG AAレベル以上のコントラスト比を確保
- グループ化: 関連するラジオボタンがスクリーンリーダーでグループとして認識されるように適切なマークアップ

## テスト計画

### ユニットテスト

```typescript
describe('RadioButton', () => {
  it('正しくレンダリングされること', () => {
    // テスト内容
  });
  
  it('クリック時にonChangeが呼び出されること', () => {
    // テスト内容
  });
  
  it('無効状態のとき、クリックしてもonChangeが呼び出されないこと', () => {
    // テスト内容
  });
  
  it('選択状態が正しく表示されること', () => {
    // テスト内容
  });
  
  it('エラー状態が正しく表示されること', () => {
    // テスト内容
  });
});
```

## 実装例

```tsx
import React from 'react';
import classNames from 'classnames';

export const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  name,
  label,
  value,
  checked,
  onChange,
  disabled = false,
  error = false,
  size = 'medium',
  className
}) => {
  const radioId = id || `radio-${name}-${value}`;
  
  return (
    <div 
      className={classNames(
        'radio-button-container',
        `radio-button-container--${size}`,
        {
          'radio-button-container--error': error,
          'radio-button-container--disabled': disabled
        },
        className
      )}
    >
      <input
        type="radio"
        id={radioId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="radio-button-input"
      />
      
      <label 
        htmlFor={radioId} 
        className="radio-button-label"
      >
        <span className="radio-button-custom">
          {checked && (
            <span className="radio-button-dot"></span>
          )}
        </span>
        <span className="radio-button-label-text">
          {label}
        </span>
      </label>
    </div>
  );
};

export default RadioButton;
```

## RadioGroup の実装例（複数RadioButtonの管理）

```tsx
interface RadioGroupProps {
  /**
   * グループ名
   */
  name: string;
  
  /**
   * ラベルテキスト
   */
  label?: string;
  
  /**
   * 現在選択されている値
   */
  value: string;
  
  /**
   * 値変更時のコールバック関数
   */
  onChange: (value: string) => void;
  
  /**
   * ラジオボタンの選択肢
   */
  options: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
  
  /**
   * エラー状態
   * @default false
   */
  error?: boolean;
  
  /**
   * エラーメッセージ
   */
  errorMessage?: string;
  
  /**
   * 無効状態
   * @default false
   */
  disabled?: boolean;
  
  /**
   * レイアウト方向
   * @default "vertical"
   */
  direction?: 'horizontal' | 'vertical';
  
  /**
   * ラジオボタンのサイズ
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 追加のCSSクラス
   */
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  value,
  onChange,
  options,
  error = false,
  errorMessage,
  disabled = false,
  direction = 'vertical',
  size = 'medium',
  className
}) => {
  const groupId = `radio-group-${name}`;
  const errorId = errorMessage ? `${groupId}-error` : undefined;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <div 
      className={classNames(
        'radio-group',
        `radio-group--${direction}`,
        {
          'radio-group--error': error,
          'radio-group--disabled': disabled
        },
        className
      )}
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={errorId}
    >
      {label && (
        <div id={`${groupId}-label`} className="radio-group-label">
          {label}
        </div>
      )}
      
      <div className="radio-group-options">
        {options.map((option) => (
          <RadioButton
            key={option.value}
            id={`${groupId}-${option.value}`}
            name={name}
            label={option.label}
            value={option.value}
            checked={value === option.value}
            onChange={handleChange}
            disabled={disabled || option.disabled}
            error={error}
            size={size}
          />
        ))}
      </div>
      
      {error && errorMessage && (
        <div id={errorId} className="radio-group-error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
```

## 使用例

```tsx
// 単一のRadioButtonの例（通常は使用しない）
<RadioButton
  id="option1"
  name="options"
  label="オプション1"
  value="option1"
  checked={selectedOption === "option1"}
  onChange={(e) => setSelectedOption(e.target.value)}
/>

// RadioGroupの使用例（推奨）
<RadioGroup
  name="paymentMethod"
  label="支払い方法"
  value={paymentMethod}
  onChange={setPaymentMethod}
  options={[
    { label: "クレジットカード", value: "credit_card" },
    { label: "銀行振込", value: "bank_transfer" },
    { label: "代金引換", value: "cash_on_delivery" },
    { label: "ポイント", value: "points", disabled: pointsInsufficient }
  ]}
/>

// 水平方向のRadioGroup
<RadioGroup
  name="gender"
  label="性別"
  value={gender}
  onChange={setGender}
  options={[
    { label: "男性", value: "male" },
    { label: "女性", value: "female" },
    { label: "その他", value: "other" },
    { label: "回答しない", value: "prefer_not_to_say" }
  ]}
  direction="horizontal"
/>
```

## 注意事項

- 単一のRadioButtonよりも、複数のRadioButtonをグループ化したRadioGroupの使用を推奨します
- ラジオボタンは相互排他的な選択肢を提供するため、デフォルト値の設定を検討してください
- モバイルデバイスでは特に、タッチ操作がしやすいようにラベル領域を十分に広くしてください
- 横配置の場合、モバイル画面では自動的に縦配置になるレスポンシブデザインを考慮してください

---

作成日: 2025-05-02
最終更新日: 2025-05-02
作成者: フロントエンドチーム