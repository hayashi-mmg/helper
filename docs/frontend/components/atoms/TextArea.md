# TextArea コンポーネント仕様書

## コンポーネント基本情報

- **コンポーネント名**: TextArea
- **タイプ**: atom
- **対応するタスク**: タスク014
- **依存するコンポーネント**: なし

## 機能概要

TextAreaコンポーネントは、複数行のテキスト入力が可能なフィールドを提供します。コメント、説明文、長文入力など、単一行のTextFieldでは対応できないシナリオで使用します。ラベル、プレースホルダー、エラーメッセージなどのアクセシビリティ機能をサポートしています。

## 要件

- 複数行テキスト入力用のフィールドを提供する
- ラベルを表示できる
- プレースホルダーテキストをサポートする
- 必須項目の表示に対応する
- エラー状態とエラーメッセージの表示に対応する
- 無効状態に対応する
- サイズのバリエーションを提供する（小・中・大）
- 高さを調整可能にする（固定または自動リサイズ）
- 文字数カウント機能を提供する（オプション）

## Props定義

```typescript
export interface TextAreaProps {
  /**
   * テキストエリアのID
   */
  id: string;
  
  /**
   * テキストエリアの名前
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
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  
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
   * テキストエリアのサイズ
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 行数（高さ指定）
   * @default 3
   */
  rows?: number;
  
  /**
   * 自動リサイズ（入力に合わせて高さ調整）
   * @default false
   */
  autoResize?: boolean;
  
  /**
   * 最大文字数
   */
  maxLength?: number;
  
  /**
   * 文字数カウンターを表示するかどうか
   * @default false
   */
  showCharCount?: boolean;
  
  /**
   * 追加のCSSクラス
   */
  className?: string;
}
```

## 状態管理

Propsとして受け取った`value`と`onChange`を使用して、親コンポーネントで状態を管理します。
自動リサイズ機能が有効な場合、内部で高さを調整するためのrefとuseEffectを使用します。

```typescript
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  if (autoResize && textareaRef.current) {
    const element = textareaRef.current;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }
}, [value, autoResize]);
```

## 振る舞い

入力値の変更が発生すると、`onChange`コールバックが呼び出され、親コンポーネントに通知されます。
エラー状態が`true`の場合、フィールドは赤い枠線でハイライトされ、エラーメッセージが表示されます。
`disabled`が`true`の場合、フィールドは無効化され、ユーザーによる入力ができなくなります。
`autoResize`が`true`の場合、テキスト量に応じて自動的に高さが調整されます。
`maxLength`と`showCharCount`が設定されている場合、残り文字数が表示されます。

## スタイル

```typescript
const getTextAreaClasses = () => {
  return classNames(
    'text-area',
    `text-area--${size}`,
    {
      'text-area--error': error,
      'text-area--disabled': disabled,
      'text-area--auto-resize': autoResize
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
  - `aria-describedby`: エラーメッセージや文字数カウンターがある場合、そのIDを指定
- コントラスト比: WCAG AAレベル以上のコントラスト比を確保

## テスト計画

### ユニットテスト

```typescript
describe('TextArea', () => {
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
  
  it('最大文字数を超えて入力できないこと', () => {
    // テスト内容
  });
  
  it('文字数カウンターが正しく表示されること', () => {
    // テスト内容
  });
  
  it('自動リサイズが機能すること', () => {
    // テスト内容
  });
});
```

## 実装例

```tsx
import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';

export const TextArea: React.FC<TextAreaProps> = ({
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
  rows = 3,
  autoResize = false,
  maxLength,
  showCharCount = false,
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fieldId = id || `text-area-${name}`;
  const errorId = errorMessage ? `${fieldId}-error` : undefined;
  const counterId = showCharCount ? `${fieldId}-counter` : undefined;
  
  // 自動リサイズ処理
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const element = textareaRef.current;
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [value, autoResize]);
  
  // アクセシビリティのためのdescribedby
  const getAriaDescribedBy = () => {
    const ids = [];
    if (errorId) ids.push(errorId);
    if (counterId) ids.push(counterId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  };
  
  return (
    <div className={classNames('text-area-container', className)}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className={classNames('text-area-label', {
            'text-area-label--required': required
          })}
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={textareaRef}
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={error}
        aria-describedby={getAriaDescribedBy()}
        className={classNames(
          'text-area-input',
          `text-area-input--${size}`,
          {
            'text-area-input--error': error,
            'text-area-input--auto-resize': autoResize
          }
        )}
      />
      
      {maxLength && showCharCount && (
        <div id={counterId} className="text-area-counter">
          {value.length}/{maxLength}
        </div>
      )}
      
      {error && errorMessage && (
        <div id={errorId} className="text-area-error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default TextArea;
```

## 使用例

```tsx
// 基本的な使用例
<TextArea
  id="description"
  name="description"
  label="商品説明"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="商品の詳細を入力してください"
  rows={5}
/>

// 文字数制限と文字カウンター付きの例
<TextArea
  id="comment"
  name="comment"
  label="コメント"
  value={comment}
  onChange={(e) => setComment(e.target.value)}
  placeholder="コメントを入力してください（100文字以内）"
  maxLength={100}
  showCharCount
/>

// 自動リサイズの例
<TextArea
  id="bio"
  name="bio"
  label="自己紹介"
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  placeholder="自己紹介を入力してください"
  autoResize
/>
```

## 注意事項

- 長すぎるテキストを入力する可能性がある場合は、適切な`maxLength`を設定することを検討してください
- モバイルでの使いやすさを確保するため、タッチデバイスでは十分な高さを提供してください
- `autoResize`を使用する場合、急激な高さ変更によるレイアウトシフトに注意してください

---

作成日: 2025-05-02
最終更新日: 2025-05-02
作成者: フロントエンドチーム