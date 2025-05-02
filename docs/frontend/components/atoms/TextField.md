# TextField コンポーネント仕様書

## コンポーネント基本情報

- **コンポーネント名**: TextField
- **タイプ**: atom
- **対応するタスク**: タスク014
- **依存するコンポーネント**: なし

## 機能概要

TextFieldコンポーネントは、シンプルな一行テキスト入力フィールドを提供します。ラベル、プレースホルダー、エラーメッセージなどのアクセシビリティ機能をサポートし、さまざまなフォームシナリオで使用できます。

## 要件

- 一行テキスト入力用のフィールドを提供する
- ラベルを表示できる
- プレースホルダーテキストをサポートする
- 必須項目の表示に対応する
- エラー状態とエラーメッセージの表示に対応する
- 無効状態に対応する
- サイズのバリエーションを提供する（小・中・大）
- アイコンを追加できる（オプション）

## Props定義

```typescript
export interface TextFieldProps {
  /**
   * 入力フィールドのID
   */
  id: string;
  
  /**
   * 入力フィールドの名前
   */
  name: string;
  
  /**
   * ラベルテキスト
   */
  label?: string;
  
  /**
   * 入力値
   */
  value: string;
  
  /**
   * 値変更時のコールバック関数
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * プレースホルダーテキスト
   * @default ""
   */
  placeholder?: string;
  
  /**
   * 必須項目かどうか
   * @default false
   */
  required?: boolean;
  
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
   * フィールドのサイズ
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 入力タイプ（HTMLのinput typeと同様）
   * @default "text"
   */
  type?: string;
  
  /**
   * 先頭に表示するアイコン
   */
  startIcon?: React.ReactNode;
  
  /**
   * 末尾に表示するアイコン
   */
  endIcon?: React.ReactNode;
  
  /**
   * 追加のCSSクラス
   */
  className?: string;
}
```

## 状態管理

Propsとして受け取った`value`と`onChange`を使用して、親コンポーネントで状態を管理します。
コンポーネント内部では特に状態を持ちません。

## 振る舞い

入力値の変更が発生すると、`onChange`コールバックが呼び出され、親コンポーネントに通知されます。
エラー状態が`true`の場合、フィールドは赤い枠線でハイライトされ、エラーメッセージが表示されます。
`disabled`が`true`の場合、フィールドは無効化され、ユーザーによる入力ができなくなります。

## スタイル

```typescript
const getFieldClasses = () => {
  return classNames(
    'text-field',
    `text-field--${size}`,
    {
      'text-field--error': error,
      'text-field--disabled': disabled,
      'text-field--with-start-icon': startIcon,
      'text-field--with-end-icon': endIcon
    },
    className
  );
};
```

## レスポンシブ対応

- モバイル (< 768px): フィールド幅100%、タッチフレンドリーなサイズに自動調整
- タブレット (768px - 1024px): 通常の表示
- デスクトップ (> 1024px): 通常の表示

## アクセシビリティ対応

- キーボード操作: 標準のフォーム操作と一貫性のあるキーボードナビゲーション
- スクリーンリーダー: 適切なラベルとエラーメッセージの関連付け
- ARIA属性: 
  - `aria-required`: 必須項目の場合true
  - `aria-invalid`: エラー状態の場合true
  - `aria-describedby`: エラーメッセージがある場合、そのIDを指定
- コントラスト比: WCAG AAレベル以上のコントラスト比を確保

## テスト計画

### ユニットテスト

```typescript
describe('TextField', () => {
  it('正しくレンダリングされること', () => {
    // テスト内容
  });
  
  it('入力値が変更されたとき、onChangeが呼び出されること', () => {
    // テスト内容
  });
  
  it('エラー状態のとき、エラースタイルとメッセージが表示されること', () => {
    // テスト内容
  });
  
  it('無効状態のとき、入力ができないこと', () => {
    // テスト内容
  });
  
  it('アイコンが正しく表示されること', () => {
    // テスト内容
  });
});
```

## 実装例

```tsx
import React from 'react';
import classNames from 'classnames';

export const TextField: React.FC<TextFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = false,
  errorMessage,
  disabled = false,
  size = 'medium',
  type = 'text',
  startIcon,
  endIcon,
  className
}) => {
  const fieldId = id || `text-field-${name}`;
  const errorId = errorMessage ? `${fieldId}-error` : undefined;
  
  return (
    <div className={classNames('text-field-container', className)}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className={classNames('text-field-label', {
            'text-field-label--required': required
          })}
        >
          {label}
        </label>
      )}
      
      <div className="text-field-input-wrapper">
        {startIcon && (
          <div className="text-field-start-icon">
            {startIcon}
          </div>
        )}
        
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={error}
          aria-describedby={errorId}
          className={classNames(
            'text-field-input',
            `text-field-input--${size}`,
            {
              'text-field-input--error': error,
              'text-field-input--with-start-icon': startIcon,
              'text-field-input--with-end-icon': endIcon
            }
          )}
        />
        
        {endIcon && (
          <div className="text-field-end-icon">
            {endIcon}
          </div>
        )}
      </div>
      
      {error && errorMessage && (
        <div id={errorId} className="text-field-error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default TextField;
```

## 使用例

```tsx
// 基本的な使用例
<TextField
  id="user-name"
  name="userName"
  label="ユーザー名"
  value={userName}
  onChange={(e) => setUserName(e.target.value)}
  placeholder="ユーザー名を入力してください"
  required
/>

// エラー状態の例
<TextField
  id="email"
  name="email"
  label="メールアドレス"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="example@example.com"
  error={!isValidEmail}
  errorMessage="有効なメールアドレスを入力してください"
/>

// アイコン付きの例
<TextField
  id="search"
  name="search"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="検索..."
  startIcon={<SearchIcon />}
/>
```

## 注意事項

- 入力検証はコンポーネント自体では行わず、親コンポーネントで処理します
- パスワードなどの機密情報入力にも使用できますが、適切な`type`属性を設定してください
- 大量のテキスト入力が予想される場合は、代わりに`TextArea`コンポーネントの使用を検討してください

---

作成日: 2025-05-02
最終更新日: 2025-05-02
作成者: フロントエンドチーム