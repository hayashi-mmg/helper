# Select コンポーネント仕様書

## コンポーネント基本情報

- **コンポーネント名**: Select
- **タイプ**: atom
- **対応するタスク**: タスク014
- **依存するコンポーネント**: なし

## 機能概要

Selectコンポーネントは、ドロップダウンリストから1つまたは複数の項目を選択できるフォーム要素です。多数の選択肢をコンパクトに表示し、RadioButtonよりも多くのオプションを効率的に提示する必要がある場合に適しています。

## 要件

- ドロップダウンリストの選択機能を提供する
- ラベルを表示できる
- プレースホルダーテキストをサポートする
- 必須項目の表示に対応する
- エラー状態とエラーメッセージの表示に対応する
- 無効状態に対応する
- 単一選択と複数選択に対応する
- グループ化されたオプション表示に対応する
- サイズのバリエーションを提供する（小・中・大）
- カスタムアイコンのサポート

## Props定義

```typescript
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  /**
   * セレクトボックスのID
   */
  id: string;
  
  /**
   * セレクトボックスの名前
   */
  name: string;
  
  /**
   * ラベルテキスト
   */
  label?: string;
  
  /**
   * 選択オプション
   */
  options: SelectOption[] | SelectOptionGroup[];
  
  /**
   * 選択された値（単一選択）
   */
  value?: string | number;
  
  /**
   * 選択された値（複数選択）
   */
  values?: (string | number)[];
  
  /**
   * 値変更時のコールバック関数（単一選択）
   */
  onChange?: (value: string | number) => void;
  
  /**
   * 値変更時のコールバック関数（複数選択）
   */
  onMultiChange?: (values: (string | number)[]) => void;
  
  /**
   * プレースホルダーテキスト
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
   * 複数選択を有効にする
   * @default false
   */
  multiple?: boolean;
  
  /**
   * セレクトボックスのサイズ
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * カスタムアイコン
   */
  icon?: React.ReactNode;
  
  /**
   * 追加のCSSクラス
   */
  className?: string;
}
```

## 状態管理

Propsとして受け取った`value`/`values`と`onChange`/`onMultiChange`を使用して、親コンポーネントで状態を管理します。
ドロップダウンの開閉状態を内部で管理します。

```typescript
const [isOpen, setIsOpen] = useState<boolean>(false);

const toggleDropdown = () => {
  if (!disabled) {
    setIsOpen(!isOpen);
  }
};

const closeDropdown = () => {
  setIsOpen(false);
};
```

## 振る舞い

セレクトボックスがクリックされるとドロップダウンが開き、オプションが表示されます。
オプションが選択されると、`onChange`または`onMultiChange`コールバックが呼び出され、親コンポーネントに通知されます。
`disabled`が`true`の場合、セレクトボックスは無効化され、ユーザーによる変更ができなくなります。
ドロップダウンの外側をクリックすると、ドロップダウンが閉じます。
`multiple`が`true`の場合、複数の項目を選択できるようになります。

## スタイル

```typescript
const getSelectClasses = () => {
  return classNames(
    'select',
    `select--${size}`,
    {
      'select--open': isOpen,
      'select--error': error,
      'select--disabled': disabled,
      'select--multiple': multiple
    },
    className
  );
};
```

## レスポンシブ対応

- モバイル (< 768px): フルスクリーン幅、タッチフレンドリーなサイズに自動調整
- タブレット (768px - 1024px): 通常の表示
- デスクトップ (> 1024px): 通常の表示

## アクセシビリティ対応

- キーボード操作: 
  - Tab: フォーカス移動
  - Enter/Space: ドロップダウン開閉
  - 上下矢印キー: オプション間の移動
  - Escape: ドロップダウンを閉じる
- スクリーンリーダー: 適切なラベル、選択状態、開閉状態の読み上げ対応
- ARIA属性: 
  - `aria-expanded`: ドロップダウンが開いているかどうか
  - `aria-haspopup`: ポップアップメニューがあることを示す
  - `aria-required`: 必須項目の場合true
  - `aria-invalid`: エラー状態の場合true
  - `aria-describedby`: エラーメッセージがある場合、そのIDを指定
- コントラスト比: WCAG AAレベル以上のコントラスト比を確保

## テスト計画

### ユニットテスト

```typescript
describe('Select', () => {
  it('正しくレンダリングされること', () => {
    // テスト内容
  });
  
  it('クリック時にドロップダウンが開くこと', () => {
    // テスト内容
  });
  
  it('オプション選択時にonChangeが呼び出されること', () => {
    // テスト内容
  });
  
  it('複数選択モードで正しく動作すること', () => {
    // テスト内容
  });
  
  it('無効状態のとき、クリックしてもドロップダウンが開かないこと', () => {
    // テスト内容
  });
  
  it('エラー状態が正しく表示されること', () => {
    // テスト内容
  });
  
  it('キーボード操作で適切に動作すること', () => {
    // テスト内容
  });
});
```

## 実装例

```tsx
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  options,
  value,
  values = [],
  onChange,
  onMultiChange,
  placeholder,
  required = false,
  error = false,
  errorMessage,
  disabled = false,
  multiple = false,
  size = 'medium',
  icon,
  className
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const fieldId = id || `select-${name}`;
  const errorId = errorMessage ? `${fieldId}-error` : undefined;
  
  // 選択されたオプションのラベルを取得
  const getSelectedLabel = (): string => {
    if (multiple) {
      if (values.length === 0) return placeholder || '';
      
      // 複数選択時の表示
      if (values.length === 1) {
        const selectedOption = findOptionByValue(values[0]);
        return selectedOption ? selectedOption.label : '';
      } else {
        return `${values.length}項目選択中`;
      }
    } else {
      // 単一選択時の表示
      if (value === undefined || value === null || value === '') return placeholder || '';
      const selectedOption = findOptionByValue(value);
      return selectedOption ? selectedOption.label : '';
    }
  };
  
  // 値からオプションを検索
  const findOptionByValue = (val: string | number): SelectOption | undefined => {
    for (const option of options) {
      if ('options' in option) {
        // オプショングループの場合
        const groupOption = option.options.find(opt => opt.value === val);
        if (groupOption) return groupOption;
      } else if (option.value === val) {
        // 通常のオプションの場合
        return option;
      }
    }
    return undefined;
  };
  
  // 単一選択のハンドラ
  const handleSelect = (newValue: string | number) => {
    if (disabled) return;
    
    if (onChange) {
      onChange(newValue);
    }
    
    setIsOpen(false);
  };
  
  // 複数選択のハンドラ
  const handleMultiSelect = (newValue: string | number) => {
    if (disabled) return;
    
    if (onMultiChange) {
      const newValues = [...values];
      const index = newValues.indexOf(newValue);
      
      if (index === -1) {
        // 追加
        newValues.push(newValue);
      } else {
        // 削除
        newValues.splice(index, 1);
      }
      
      onMultiChange(newValues);
    }
  };
  
  // ドロップダウンの開閉
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // 外側クリック検出
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleDropdown();
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
    }
  };
  
  return (
    <div className="select-container">
      {label && (
        <label 
          htmlFor={fieldId} 
          className={classNames('select-label', {
            'select-label--required': required
          })}
        >
          {label}
        </label>
      )}
      
      <div
        ref={selectRef}
        className={classNames(
          'select-wrapper',
          `select-wrapper--${size}`,
          {
            'select-wrapper--open': isOpen,
            'select-wrapper--error': error,
            'select-wrapper--disabled': disabled,
            'select-wrapper--placeholder': !value && !values.length
          },
          className
        )}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
        aria-invalid={error}
        aria-describedby={errorId}
      >
        <div className="select-value">
          {getSelectedLabel()}
        </div>
        
        <div className="select-icon">
          {icon || (
            <svg viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          )}
        </div>
        
        {isOpen && (
          <div 
            className="select-dropdown" 
            role="listbox"
            aria-multiselectable={multiple}
          >
            {options.map((option, index) => {
              if ('options' in option) {
                // オプショングループのレンダリング
                return (
                  <div key={`group-${index}`} className="select-option-group">
                    <div className="select-group-label">{option.label}</div>
                    {option.options.map((groupOption, groupIndex) => (
                      <div
                        key={`group-${index}-option-${groupIndex}`}
                        className={classNames(
                          'select-option',
                          {
                            'select-option--selected': multiple 
                              ? values.includes(groupOption.value) 
                              : value === groupOption.value,
                            'select-option--disabled': groupOption.disabled
                          }
                        )}
                        role="option"
                        aria-selected={multiple 
                          ? values.includes(groupOption.value) 
                          : value === groupOption.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!groupOption.disabled) {
                            if (multiple) {
                              handleMultiSelect(groupOption.value);
                            } else {
                              handleSelect(groupOption.value);
                            }
                          }
                        }}
                      >
                        {multiple && (
                          <span className="select-option-checkbox">
                            {values.includes(groupOption.value) && (
                              <svg viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            )}
                          </span>
                        )}
                        <span className="select-option-label">{groupOption.label}</span>
                      </div>
                    ))}
                  </div>
                );
              } else {
                // 通常のオプションのレンダリング
                return (
                  <div
                    key={`option-${index}`}
                    className={classNames(
                      'select-option',
                      {
                        'select-option--selected': multiple 
                          ? values.includes(option.value) 
                          : value === option.value,
                        'select-option--disabled': option.disabled
                      }
                    )}
                    role="option"
                    aria-selected={multiple 
                      ? values.includes(option.value) 
                      : value === option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!option.disabled) {
                        if (multiple) {
                          handleMultiSelect(option.value);
                        } else {
                          handleSelect(option.value);
                        }
                      }
                    }}
                  >
                    {multiple && (
                      <span className="select-option-checkbox">
                        {values.includes(option.value) && (
                          <svg viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </span>
                    )}
                    <span className="select-option-label">{option.label}</span>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
      
      {error && errorMessage && (
        <div id={errorId} className="select-error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Select;
```

## 使用例

```tsx
// 基本的な単一選択の例
<Select
  id="country"
  name="country"
  label="国"
  value={country}
  onChange={setCountry}
  placeholder="国を選択してください"
  options={[
    { label: "日本", value: "jp" },
    { label: "アメリカ", value: "us" },
    { label: "中国", value: "cn" },
    { label: "その他", value: "other" }
  ]}
  required
/>

// グループ化されたオプションの例
<Select
  id="category"
  name="category"
  label="カテゴリ"
  value={category}
  onChange={setCategory}
  options={[
    {
      label: "果物",
      options: [
        { label: "りんご", value: "apple" },
        { label: "バナナ", value: "banana" },
        { label: "オレンジ", value: "orange" }
      ]
    },
    {
      label: "野菜",
      options: [
        { label: "にんじん", value: "carrot" },
        { label: "トマト", value: "tomato" },
        { label: "じゃがいも", value: "potato" }
      ]
    }
  ]}
/>

// 複数選択の例
<Select
  id="interests"
  name="interests"
  label="興味のある分野"
  values={interests}
  onMultiChange={setInterests}
  placeholder="興味のある分野を選択してください"
  multiple
  options={[
    { label: "テクノロジー", value: "technology" },
    { label: "健康", value: "health" },
    { label: "経済", value: "economy" },
    { label: "教育", value: "education" },
    { label: "環境", value: "environment" }
  ]}
/>
```

## 注意事項

- 選択肢が多い場合は、ユーザーが簡単に見つけられるように適切なグループ化や検索機能の追加を検討してください
- 複数選択の場合、選択済みアイテムの視覚的表示を明確にし、選択/解除の操作を直感的にしてください
- モバイルデバイスでは、ネイティブの`<select>`が提供するアクセシビリティと使いやすさを考慮してください
- 多くの選択肢がある場合は、ページネーションや仮想化リストの導入を検討してください

---

作成日: 2025-05-02
最終更新日: 2025-05-02
作成者: フロントエンドチーム