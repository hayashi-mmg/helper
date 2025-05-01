# Button コンポーネント仕様書

## 概要

`Button`コンポーネントは、ユーザーのアクションを促すための汎用的なボタンUIを提供します。様々なスタイルバリエーションとサイズをサポートし、アイコンやローディング状態も表現できます。

## Props

| プロパティ名  | 型                                          | 必須  | デフォルト値 | 説明                                  |
|--------------|---------------------------------------------|------|-------------|--------------------------------------|
| variant      | 'primary' \| 'secondary' \| 'outline' \| 'text' | いいえ | 'primary'   | ボタンの見た目のバリエーション        |
| size         | 'small' \| 'medium' \| 'large'               | いいえ | 'medium'    | ボタンのサイズ                        |
| startIcon    | React.ReactNode                              | いいえ | undefined   | ボタンの先頭に表示するアイコン        |
| endIcon      | React.ReactNode                              | いいえ | undefined   | ボタンの末尾に表示するアイコン        |
| loading      | boolean                                      | いいえ | false       | ローディング状態の表示                |
| disabled     | boolean                                      | いいえ | false       | ボタンの無効状態                      |
| className    | string                                       | いいえ | undefined   | 追加のCSSクラス名                    |
| children     | React.ReactNode                              | はい  | -           | ボタンの内容（テキストやコンポーネント）|

また、`Button`コンポーネントは、`ButtonHTMLAttributes<HTMLButtonElement>`のすべてのプロパティを継承しています（例：`onClick`、`type`、`aria-*`属性など）。

## バリエーション

### Primary Button（プライマリボタン）
最も目立つボタンで、主要なアクションに使用します。
```tsx
<Button variant="primary">プライマリボタン</Button>
```

### Secondary Button（セカンダリボタン）
セカンダリアクションに使用します。
```tsx
<Button variant="secondary">セカンダリボタン</Button>
```

### Outline Button（アウトラインボタン）
枠線のみのボタンで、控えめなアクションに使用します。
```tsx
<Button variant="outline">アウトラインボタン</Button>
```

### Text Button（テキストボタン）
最も控えめなボタンで、補助的なアクションに使用します。
```tsx
<Button variant="text">テキストボタン</Button>
```

## サイズ

### Small（小）
コンパクトなUIに適したサイズです。
```tsx
<Button size="small">小サイズボタン</Button>
```

### Medium（中）
標準的なサイズです。
```tsx
<Button size="medium">中サイズボタン</Button>
```

### Large（大）
大きめのサイズで、重要なアクションに使用します。
```tsx
<Button size="large">大サイズボタン</Button>
```

## アイコン付きボタン

### 先頭アイコン
```tsx
<Button startIcon={<Icon name="plus" />}>新規作成</Button>
```

### 末尾アイコン
```tsx
<Button endIcon={<Icon name="arrow-right" />}>次へ</Button>
```

### アイコンのみ
```tsx
<Button aria-label="設定">
  <Icon name="settings" />
</Button>
```

## ローディング状態

ローディング状態のボタンは、自動的に無効化され、ローディングインジケーターが表示されます。
```tsx
<Button loading>保存中</Button>
```

## 無効状態

無効状態のボタンは、クリックできず、視覚的に無効であることを示します。
```tsx
<Button disabled>無効ボタン</Button>
```

## 使用例

### 基本的な使用方法
```tsx
<Button onClick={handleClick}>クリックしてください</Button>
```

### フォーム送信ボタン
```tsx
<Button type="submit" variant="primary">送信</Button>
```

### フルカスタマイズの例
```tsx
<Button
  variant="primary"
  size="large"
  startIcon={<Icon name="save" />}
  disabled={!isValid}
  loading={isSubmitting}
  onClick={handleSubmit}
  className="w-full"
>
  変更を保存
</Button>
```

## アクセシビリティ

- ボタンには必ず適切なラベルを設定してください（`children`またはアイコンのみの場合は`aria-label`）
- ローディング状態では`aria-busy="true"`が自動的に設定されます
- 無効状態では`disabled`属性が設定されます
- キーボードでのフォーカスと操作が可能です

## 内部実装

`Button`コンポーネントは内部的に以下のように実装されています：

```tsx
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  // ボタンクラスの生成
  const buttonClasses = classNames(
    'inline-flex items-center justify-center rounded-md font-medium focus:outline-none',
    {
      // バリエーション別のスタイル
      'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
      'bg-secondary-600 text-white hover:bg-secondary-700': variant === 'secondary',
      'border border-gray-300 text-gray-700 hover:bg-gray-50': variant === 'outline',
      'text-primary-600 hover:bg-gray-50': variant === 'text',
      
      // サイズ別のスタイル
      'text-xs px-2.5 py-1.5': size === 'small',
      'text-sm px-4 py-2': size === 'medium',
      'text-base px-6 py-3': size === 'large',
      
      // 無効状態のスタイル
      'opacity-50 cursor-not-allowed': disabled || loading,
    },
    className
  );
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {loading ? (
        <>
          <span className="mr-2">
            <LoadingSpinner size="small" />
          </span>
          {children}
        </>
      ) : (
        children
      )}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};
```

## テスト

`Button`コンポーネントには以下のテストケースが必要です：

1. 正しいテキストでレンダリングされるか
2. 各バリエーションが正しく適用されるか
3. 各サイズが正しく適用されるか
4. アイコンが正しく表示されるか
5. ローディング状態が正しく表示されるか
6. 無効状態が正しく機能するか
7. クリックイベントが正しく発火するか

## Storybookの例

`Button`コンポーネントのStorybookには以下のストーリーを含めてください：

- 各バリエーション（Primary, Secondary, Outline, Text）
- 各サイズ（Small, Medium, Large）
- アイコン付き（StartIcon, EndIcon, IconOnly）
- ローディング状態
- 無効状態
- インタラクティブな例（クリック可能）

## 関連コンポーネント

- `IconButton` - アイコンのみのボタン用の特化コンポーネント
- `ButtonGroup` - 複数のボタンをグループ化するコンポーネント
- `ToggleButton` - トグル動作を持つボタンコンポーネント
