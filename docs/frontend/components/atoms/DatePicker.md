# DatePicker コンポーネント仕様書

## コンポーネント基本情報

- **コンポーネント名**: DatePicker
- **タイプ**: atom
- **対応するタスク**: タスク014
- **依存するコンポーネント**: TextField

## 機能概要

DatePickerコンポーネントは、日付選択のためのUI要素を提供します。テキスト入力フィールドとカレンダーポップアップを組み合わせて、ユーザーが直感的に日付を選択できるようにします。入力形式の検証や様々な日付表示形式に対応します。

## 要件

- 日付選択のためのカレンダーUIを提供する
- テキスト入力による日付指定もサポートする
- 日付表示形式をカスタマイズ可能にする
- ラベルを表示できる
- プレースホルダーテキストをサポートする
- 必須項目の表示に対応する
- エラー状態とエラーメッセージの表示に対応する
- 無効状態に対応する
- サイズのバリエーションを提供する（小・中・大）
- 日付の範囲指定（最小値・最大値）に対応する
- 特定の日付の無効化に対応する
- 国際化対応（言語、日付形式）をサポートする

## Props定義

```typescript
export interface DatePickerProps {
  /**
   * 日付ピッカーのID
   */
  id: string;
  
  /**
   * 日付ピッカーの名前
   */
  name: string;
  
  /**
   * ラベルテキスト
   */
  label?: string;
  
  /**
   * 選択された日付
   */
  value: Date | null;
  
  /**
   * 値変更時のコールバック関数
   */
  onChange: (date: Date | null) => void;
  
  /**
   * 日付表示形式（デフォルト: YYYY-MM-DD）
   * @default "YYYY-MM-DD"
   */
  dateFormat?: string;
  
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
   * 日付ピッカーのサイズ
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 選択可能な最小日付
   */
  minDate?: Date;
  
  /**
   * 選択可能な最大日付
   */
  maxDate?: Date;
  
  /**
   * 言語設定（日本語: 'ja', 英語: 'en' など）
   * @default "ja"
   */
  locale?: string;
  
  /**
   * 特定の日付を無効化する関数
   */
  filterDate?: (date: Date) => boolean;
  
  /**
   * アイコンをカスタマイズ
   */
  calendarIcon?: React.ReactNode;
  
  /**
   * 追加のCSSクラス
   */
  className?: string;
}
```

## 状態管理

Propsとして受け取った`value`と`onChange`を使用して、親コンポーネントで日付の状態を管理します。
カレンダーポップアップの表示状態や、テキスト入力の一時的な状態を内部で管理します。

```typescript
// カレンダーの表示状態
const [isOpen, setIsOpen] = useState<boolean>(false);

// 入力フィールドの一時的な値
const [inputValue, setInputValue] = useState<string>(formatDate(value));

// カレンダーの現在の表示月
const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());

// カレンダーポップアップの開閉
const toggleCalendar = () => {
  if (!disabled) {
    setIsOpen(!isOpen);
  }
};

// 日付の選択
const handleDateSelect = (date: Date) => {
  onChange(date);
  setInputValue(formatDate(date));
  setIsOpen(false);
};
```

## 振る舞い

カレンダーアイコンまたはテキストフィールドがクリックされると、カレンダーポップアップが表示されます。
カレンダーから日付が選択されると、`onChange`コールバックが呼び出され、親コンポーネントに通知されます。
テキスト入力でも日付を入力でき、入力された日付が有効な形式の場合、その値が使用されます。
`disabled`が`true`の場合、日付ピッカーは無効化され、ユーザーによる変更ができなくなります。
`minDate`と`maxDate`を指定すると、指定範囲外の日付は選択できなくなります。
`filterDate`関数を使用すると、さらに細かい日付の有効/無効の制御が可能です。

## スタイル

```typescript
const getDatePickerClasses = () => {
  return classNames(
    'date-picker',
    `date-picker--${size}`,
    {
      'date-picker--open': isOpen,
      'date-picker--error': error,
      'date-picker--disabled': disabled
    },
    className
  );
};
```

## レスポンシブ対応

- モバイル (< 768px): 
  - フィールド幅100%
  - タッチフレンドリーなカレンダーUI
  - モバイルデバイスのネイティブ日付ピッカーを考慮したフォールバック
- タブレット (768px - 1024px): 通常の表示
- デスクトップ (> 1024px): 通常の表示

## アクセシビリティ対応

- キーボード操作: 
  - Tab: フォーカス移動
  - Enter/Space: カレンダーポップアップの開閉
  - 矢印キー: カレンダー内の日付間移動
  - Escape: カレンダーポップアップを閉じる
- スクリーンリーダー: 適切なラベル、日付選択状態、カレンダーの月・年の読み上げ対応
- ARIA属性: 
  - `aria-haspopup`: カレンダーポップアップの存在を示す
  - `aria-expanded`: カレンダーが開いているかどうか
  - `aria-required`: 必須項目の場合true
  - `aria-invalid`: エラー状態の場合true
  - `aria-describedby`: エラーメッセージがある場合、そのIDを指定
- コントラスト比: WCAG AAレベル以上のコントラスト比を確保

## テスト計画

### ユニットテスト

```typescript
describe('DatePicker', () => {
  it('正しくレンダリングされること', () => {
    // テスト内容
  });
  
  it('カレンダーアイコンクリック時にポップアップが開くこと', () => {
    // テスト内容
  });
  
  it('日付選択時にonChangeが呼び出されること', () => {
    // テスト内容
  });
  
  it('テキスト入力による日付変更が機能すること', () => {
    // テスト内容
  });
  
  it('無効状態のとき、クリックしてもポップアップが開かないこと', () => {
    // テスト内容
  });
  
  it('minDate, maxDateの範囲外の日付が選択できないこと', () => {
    // テスト内容
  });
  
  it('エラー状態が正しく表示されること', () => {
    // テスト内容
  });
  
  it('キーボード操作で適切に動作すること', () => {
    // テスト内容
  });
  
  it('日付フォーマットが正しく適用されること', () => {
    // テスト内容
  });
});
```

## 実装例

```tsx
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { format, parse, isValid, isWithinInterval, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isBefore, isSameMonth } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import TextField from '../TextField/TextField';

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  dateFormat = 'yyyy-MM-dd',
  placeholder = '日付を選択',
  required = false,
  error = false,
  errorMessage,
  disabled = false,
  size = 'medium',
  minDate,
  maxDate,
  locale = 'ja',
  filterDate,
  calendarIcon,
  className
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value ? format(value, dateFormat, { locale: getLocale(locale) }) : '');
  const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const fieldId = id || `date-picker-${name}`;
  const errorId = errorMessage ? `${fieldId}-error` : undefined;
  
  // ロケールの取得
  const getLocale = (localeString: string) => {
    switch (localeString) {
      case 'ja':
        return ja;
      case 'en':
        return enUS;
      default:
        return ja;
    }
  };
  
  // 日付のフォーマット
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return format(date, dateFormat, { locale: getLocale(locale) });
  };
  
  // 入力された文字列を日付に変換
  const parseDate = (dateString: string): Date | null => {
    try {
      const parsedDate = parse(dateString, dateFormat, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    } catch (error) {
      // パース失敗
    }
    return null;
  };
  
  // 日付が選択可能かどうかをチェック
  const isDateSelectable = (date: Date): boolean => {
    // 最小日付チェック
    if (minDate && isBefore(date, minDate)) return false;
    
    // 最大日付チェック
    if (maxDate && isAfter(date, maxDate)) return false;
    
    // カスタムフィルター
    if (filterDate && !filterDate(date)) return false;
    
    return true;
  };
  
  // テキスト入力の変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 有効な日付の場合は親コンポーネントに通知
    const parsedDate = parseDate(value);
    if (parsedDate && isDateSelectable(parsedDate)) {
      onChange(parsedDate);
    } else if (value === '') {
      onChange(null);
    }
  };
  
  // 日付選択ハンドラ
  const handleDateSelect = (date: Date) => {
    if (isDateSelectable(date)) {
      onChange(date);
      setInputValue(formatDate(date));
      setIsOpen(false);
    }
  };
  
  // カレンダーの月を変更
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      addMonths(prev, direction === 'next' ? 1 : -1)
    );
  };
  
  // カレンダーポップアップの開閉
  const toggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      
      // 開く時に現在選択されている日付の月を表示
      if (!isOpen && value) {
        setCurrentMonth(value);
      }
    }
  };
  
  // 外側クリック検出
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
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
  
  // 選択された日付に変更があった場合、入力値を更新
  useEffect(() => {
    setInputValue(formatDate(value));
  }, [value, dateFormat, locale]);
  
  // カレンダーグリッドの生成
  const generateCalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // 週ごとに日付をグループ化
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // 最初の週の前に空のセルを追加
    const dayOfWeek = monthStart.getDay();
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push(new Date(0)); // 空のセル
    }
    
    // カレンダーの日付を追加
    days.forEach(day => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    // 最後の週の後に空のセルを追加
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(0)); // 空のセル
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };
  
  // カレンダーをレンダリング
  const renderCalendar = () => {
    const weeks = generateCalendarGrid();
    const currentLocale = getLocale(locale);
    
    return (
      <div className="date-picker-calendar">
        <div className="date-picker-header">
          <button
            type="button"
            className="date-picker-prev-month"
            onClick={() => handleMonthChange('prev')}
            aria-label="前月"
          >
            &lt;
          </button>
          <div className="date-picker-current-month">
            {format(currentMonth, 'yyyy年MM月', { locale: currentLocale })}
          </div>
          <button
            type="button"
            className="date-picker-next-month"
            onClick={() => handleMonthChange('next')}
            aria-label="翌月"
          >
            &gt;
          </button>
        </div>
        
        <table className="date-picker-table">
          <thead>
            <tr>
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <th key={index} className="date-picker-weekday">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex} className="date-picker-week">
                {week.map((day, dayIndex) => {
                  // 無効な日付（空セル）かどうか
                  const isInvalid = day.getTime() === 0;
                  // 現在の月の日付かどうか
                  const isCurrentMonth = day.getTime() !== 0 && isSameMonth(day, currentMonth);
                  // 選択されている日付かどうか
                  const isSelected = value && day.getTime() !== 0 && isSameDay(day, value);
                  // 選択可能な日付かどうか
                  const isSelectable = day.getTime() !== 0 && isCurrentMonth && isDateSelectable(day);
                  
                  return (
                    <td
                      key={dayIndex}
                      className={classNames(
                        'date-picker-day',
                        {
                          'date-picker-day--invalid': isInvalid,
                          'date-picker-day--other-month': !isCurrentMonth,
                          'date-picker-day--selected': isSelected,
                          'date-picker-day--disabled': !isSelectable
                        }
                      )}
                      onClick={() => {
                        if (isCurrentMonth && isSelectable) {
                          handleDateSelect(day);
                        }
                      }}
                    >
                      {isInvalid ? '' : format(day, 'd')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleCalendar();
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };
  
  return (
    <div
      ref={datePickerRef}
      className={classNames(
        'date-picker-container',
        className
      )}
    >
      {label && (
        <label 
          htmlFor={fieldId} 
          className={classNames('date-picker-label', {
            'date-picker-label--required': required
          })}
        >
          {label}
        </label>
      )}
      
      <div 
        className={classNames(
          'date-picker-input-wrapper',
          `date-picker-input-wrapper--${size}`,
          {
            'date-picker-input-wrapper--error': error,
            'date-picker-input-wrapper--disabled': disabled,
            'date-picker-input-wrapper--open': isOpen
          }
        )}
      >
        <TextField
          id={fieldId}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          size={size}
          required={required}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-required={required}
          aria-invalid={error}
          aria-describedby={errorId}
          onKeyDown={handleKeyDown}
          endIcon={
            <div 
              className="date-picker-calendar-icon" 
              onClick={toggleCalendar}
            >
              {calendarIcon || (
                <svg viewBox="0 0 24 24">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
              )}
            </div>
          }
        />
        
        {isOpen && renderCalendar()}
      </div>
      
      {error && errorMessage && (
        <div id={errorId} className="date-picker-error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
```

## 使用例

```tsx
// 基本的な使用例
<DatePicker
  id="birth-date"
  name="birthDate"
  label="生年月日"
  value={birthDate}
  onChange={setBirthDate}
  placeholder="生年月日を選択してください"
  required
/>

// 日付範囲の制限例
<DatePicker
  id="reservation-date"
  name="reservationDate"
  label="予約日"
  value={reservationDate}
  onChange={setReservationDate}
  minDate={new Date()} // 今日以降
  maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))} // 3ヶ月以内
/>

// 祝日の無効化例
<DatePicker
  id="delivery-date"
  name="deliveryDate"
  label="配達希望日"
  value={deliveryDate}
  onChange={setDeliveryDate}
  filterDate={(date) => {
    // 土日と祝日を除外
    const day = date.getDay();
    return day !== 0 && day !== 6 && !isHoliday(date);
  }}
/>

// 日付フォーマットのカスタマイズ
<DatePicker
  id="meeting-date"
  name="meetingDate"
  label="ミーティング日"
  value={meetingDate}
  onChange={setMeetingDate}
  dateFormat="yyyy年MM月dd日"
  locale="ja"
/>
```

## 注意事項

- ユーザーが入力した日付形式が指定した`dateFormat`と一致しない場合、入力値の検証とエラー表示の処理を実装する必要があります
- モバイルデバイスでは、ネイティブの日付ピッカーを利用するオプションも検討してください（特にタッチ操作が多い環境）
- 国際化対応する場合は、日付の表示形式や曜日の名称など、ロケールに応じた適切な設定を行ってください
- 日付の範囲制限を設ける場合は、ユーザーに明確な視覚的フィードバックを提供してください（無効な日付の灰色表示など）

---

作成日: 2025-05-02
最終更新日: 2025-05-02
作成者: フロントエンドチーム