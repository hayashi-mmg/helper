import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

/**
 * SelectOption型
 */
export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

/**
 * SelectOptionGroup型
 */
export interface SelectOptionGroup {
    label: string;
    options: SelectOption[];
}

/**
 * SelectProps
 * セレクトボックスコンポーネントのプロパティ定義
 */
export interface SelectProps {
    /** セレクトボックスのID */
    id: string;
    /** セレクトボックスの名前 */
    name: string;
    /** ラベルテキスト */
    label?: string;
    /** 選択オプション */
    options: SelectOption[] | SelectOptionGroup[];
    /** 選択された値（単一選択） */
    value?: string | number;
    /** 選択された値（複数選択） */
    values?: (string | number)[];
    /** 値変更時のコールバック関数（単一選択） */
    onChange?: (value: string | number) => void;
    /** 値変更時のコールバック関数（複数選択） */
    onMultiChange?: (values: (string | number)[]) => void;
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
    /** 複数選択を有効にする */
    multiple?: boolean;
    /** セレクトボックスのサイズ */
    size?: 'small' | 'medium' | 'large';
    /** カスタムアイコン */
    icon?: React.ReactNode;
    /** 追加のCSSクラス */
    className?: string;
}

/**
 * Select コンポーネント
 * @param props SelectProps
 * @returns JSX.Element
 */
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
    // ドロップダウンの開閉状態
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const fieldId = id || `select-${name}`;
    const errorId = errorMessage ? `${fieldId}-error` : undefined;

    /**
     * 選択されたオプションのラベルを取得
     * @returns string
     */
    const getSelectedLabel = (): string => {
        if (multiple) {
            if (!values || values.length === 0) return placeholder || '';
            if (values.length === 1) {
                const selectedOption = findOptionByValue(values[0]);
                return selectedOption ? selectedOption.label : '';
            } else {
                return `${values.length}項目選択中`;
            }
        } else {
            if (value === undefined || value === null || value === '') return placeholder || '';
            const selectedOption = findOptionByValue(value);
            return selectedOption ? selectedOption.label : '';
        }
    };

    /**
     * 値からオプションを検索
     * @param val string | number
     * @returns SelectOption | undefined
     */
    const findOptionByValue = (val: string | number): SelectOption | undefined => {
        for (const option of options) {
            if ('options' in option) {
                const groupOption = option.options.find(opt => opt.value === val);
                if (groupOption) return groupOption;
            } else if (option.value === val) {
                return option;
            }
        }
        return undefined;
    };

    /**
     * 単一選択のハンドラ
     * @param newValue string | number
     */
    const handleSelect = (newValue: string | number) => {
        if (disabled) return;
        if (onChange) {
            onChange(newValue);
        }
        setIsOpen(false);
    };

    /**
     * 複数選択のハンドラ
     * @param newValue string | number
     */
    const handleMultiSelect = (newValue: string | number) => {
        if (disabled) return;
        if (onMultiChange) {
            const newValues = [...values];
            const index = newValues.indexOf(newValue);
            if (index === -1) {
                newValues.push(newValue);
            } else {
                newValues.splice(index, 1);
            }
            onMultiChange(newValues);
        }
    };

    /**
     * ドロップダウンの開閉
     */
    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    /**
     * 外側クリック検出
     */
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

    /**
     * キーボード操作
     */
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

    /**
     * Selectのクラス名を生成
     * @returns string
     */
    function getSelectClasses() {
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
    }

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
                        'select-wrapper--placeholder': !value && (!values || values.length === 0)
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
                                // オプショングループ
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
                                                onClick={e => {
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
                                // 通常のオプション
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
                                        onClick={e => {
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
