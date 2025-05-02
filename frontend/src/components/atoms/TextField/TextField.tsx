import React from 'react';
import classNames from 'classnames';

/**
 * TextFieldProps
 * テキストフィールドコンポーネントのプロパティ定義
 */
export interface TextFieldProps {
    /** 入力フィールドのID */
    id: string;
    /** 入力フィールドの名前 */
    name: string;
    /** ラベルテキスト */
    label?: string;
    /** 入力値 */
    value: string;
    /** 値変更時のコールバック関数 */
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    /** フィールドのサイズ */
    size?: 'small' | 'medium' | 'large';
    /** 入力タイプ（HTMLのinput typeと同様） */
    type?: string;
    /** 先頭に表示するアイコン */
    startIcon?: React.ReactNode;
    /** 末尾に表示するアイコン */
    endIcon?: React.ReactNode;
    /** 追加のCSSクラス */
    className?: string;
}

/**
 * TextField コンポーネント
 * @param props TextFieldProps
 * @returns JSX.Element
 */
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

    /**
     * TextFieldのクラス名を生成
     * @returns string
     */
    function getFieldClasses() {
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
    }

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
