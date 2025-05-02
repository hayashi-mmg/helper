import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { format, parse, isValid, isWithinInterval, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isBefore, isSameMonth } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import TextField from '../TextField/TextField';

/**
 * DatePickerProps
 * 日付ピッカーコンポーネントのプロパティ定義
 */
export interface DatePickerProps {
    /** 日付ピッカーのID */
    id: string;
    /** 日付ピッカーの名前 */
    name: string;
    /** ラベルテキスト */
    label?: string;
    /** 選択された日付 */
    value: Date | null;
    /** 値変更時のコールバック関数 */
    onChange: (date: Date | null) => void;
    /** 日付表示形式（デフォルト: YYYY-MM-DD） */
    dateFormat?: string;
    /** プレースホルダーテキスト */
    placeholder?: string;
    /** 必須項目かどうか */
    required?: boolean;
    /** エラー状態 */
    error?: boolean;
    /** エラーメッセージ */
    errorMessage?: string;
    /** 無効状態 */
    disabled?: boolean;
    /** 日付ピッカーのサイズ */
    size?: 'small' | 'medium' | 'large';
    /** 選択可能な最小日付 */
    minDate?: Date;
    /** 選択可能な最大日付 */
    maxDate?: Date;
    /** 言語設定（日本語: 'ja', 英語: 'en' など） */
    locale?: string;
    /** 特定の日付を無効化する関数 */
    filterDate?: (date: Date) => boolean;
    /** アイコンをカスタマイズ */
    calendarIcon?: React.ReactNode;
    /** 追加のCSSクラス */
    className?: string;
}

/**
 * DatePicker コンポーネント
 * @param props DatePickerProps
 * @returns JSX.Element
 */
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
    // カレンダーの表示状態
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // 入力フィールドの一時的な値
    const [inputValue, setInputValue] = useState<string>(value ? formatDate(value) : '');
    // カレンダーの現在の表示月
    const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());
    const datePickerRef = useRef<HTMLDivElement>(null);
    const fieldId = id || `date-picker-${name}`;
    const errorId = errorMessage ? `${fieldId}-error` : undefined;

    /**
     * ロケールの取得
     * @param localeString 言語コード
     * @returns date-fnsロケール
     */
    function getLocale(localeString: string) {
        switch (localeString) {
            case 'ja':
                return ja;
            case 'en':
                return enUS;
            default:
                return ja;
        }
    }

    /**
     * 日付のフォーマット
     * @param date Date|null
     * @returns string
     */
    function formatDate(date: Date | null): string {
        if (!date) return '';
        return format(date, dateFormat, { locale: getLocale(locale) });
    }

    /**
     * 入力文字列を日付に変換
     * @param dateString string
     * @returns Date|null
     */
    function parseDate(dateString: string): Date | null {
        try {
            const parsedDate = parse(dateString, dateFormat, new Date());
            if (isValid(parsedDate)) {
                return parsedDate;
            }
        } catch {
            // パース失敗
        }
        return null;
    }

    /**
     * 日付が選択可能かどうか
     * @param date Date
     * @returns boolean
     */
    function isDateSelectable(date: Date): boolean {
        if (minDate && isBefore(date, minDate)) return false;
        if (maxDate && isAfter(date, maxDate)) return false;
        if (filterDate && !filterDate(date)) return false;
        return true;
    }

    // テキスト入力の変更ハンドラ
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        const parsedDate = parseDate(val);
        if (parsedDate && isDateSelectable(parsedDate)) {
            onChange(parsedDate);
        } else if (val === '') {
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
        setCurrentMonth(prev => addMonths(prev, direction === 'next' ? 1 : -1));
    };

    // カレンダーポップアップの開閉
    const toggleCalendar = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
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

    /**
     * カレンダーグリッドの生成
     * @returns Date[][]
     */
    function generateCalendarGrid(): Date[][] {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const weeks: Date[][] = [];
        let currentWeek: Date[] = [];
        // 最初の週の前に空のセル
        const dayOfWeek = monthStart.getDay();
        for (let i = 0; i < dayOfWeek; i++) {
            currentWeek.push(new Date(0));
        }
        days.forEach(day => {
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
        });
        while (currentWeek.length < 7) {
            currentWeek.push(new Date(0));
        }
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }
        return weeks;
    }

    /**
     * カレンダーの描画
     * @returns JSX.Element
     */
    function renderCalendar() {
        const weeks = generateCalendarGrid();
        const currentLocale = getLocale(locale);
        const weekDays = locale === 'en' ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['日', '月', '火', '水', '木', '金', '土'];
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
                        {format(currentMonth, locale === 'en' ? 'MMM yyyy' : 'yyyy年MM月', { locale: currentLocale })}
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
                            {weekDays.map((day, idx) => (
                                <th key={idx} className="date-picker-weekday">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week, weekIdx) => (
                            <tr key={weekIdx} className="date-picker-week">
                                {week.map((day, dayIdx) => {
                                    const isInvalid = day.getTime() === 0;
                                    const isCurrentMonth = day.getTime() !== 0 && isSameMonth(day, currentMonth);
                                    const isSelected = value && day.getTime() !== 0 && isSameDay(day, value);
                                    const isSelectable = day.getTime() !== 0 && isCurrentMonth && isDateSelectable(day);
                                    return (
                                        <td
                                            key={dayIdx}
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
    }

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

    /**
     * DatePickerのクラス名を生成
     * @returns string
     */
    function getDatePickerClasses() {
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
    }

    return (
        <div
            ref={datePickerRef}
            className={classNames('date-picker-container', className)}
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
                            tabIndex={-1}
                            role="button"
                            aria-label="カレンダーを開く"
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
