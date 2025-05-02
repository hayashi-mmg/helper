import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';

/**
 * CheckboxProps
 * チェックボックスコンポーネントのプロパティ定義
 */
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

/**
 * Checkbox コンポーネント
 * @param props CheckboxProps
 * @returns JSX.Element
 */
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
    // チェックボックスのref
    const checkboxRef = useRef<HTMLInputElement>(null);
    const checkboxId = id || `checkbox-${name}`;

    // 中間状態（indeterminate）の設定
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate || false;
        }
    }, [indeterminate]);

    /**
     * チェックボックスのクラス名を生成
     * @returns string
     */
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
                className={getCheckboxClasses() + ' checkbox-input'}
                aria-checked={indeterminate ? 'mixed' : checked}
                aria-disabled={disabled}
            />
            <label htmlFor={checkboxId} className="checkbox-label">
                <span className="checkbox-custom">
                    {checked && !indeterminate && (
                        <svg className="checkbox-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                    )}
                    {indeterminate && (
                        <svg className="checkbox-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 13H5v-2h14v2z" />
                        </svg>
                    )}
                </span>
                <span className="checkbox-label-text">{label}</span>
            </label>
        </div>
    );
};

export default Checkbox;
