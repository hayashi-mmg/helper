import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';

/**
 * TextAreaProps
 * テキストエリアコンポーネントのプロパティ定義
 */
export interface TextAreaProps {
    /** テキストエリアのID */
    id: string;
    /** テキストエリアの名前 */
    name: string;
    /** ラベルテキスト */
    label?: string;
    /** 入力値 */
    value: string;
    /** 値変更時のコールバック関数 */
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
    /** テキストエリアのサイズ */
    size?: 'small' | 'medium' | 'large';
    /** 行数（高さ指定） */
    rows?: number;
    /** 自動リサイズ（入力に合わせて高さ調整） */
    autoResize?: boolean;
    /** 最大文字数 */
    maxLength?: number;
    /** 文字数カウンターを表示するかどうか */
    showCharCount?: boolean;
    /** 追加のCSSクラス */
    className?: string;
}

/**
 * TextArea コンポーネント
 * @param props TextAreaProps
 * @returns JSX.Element
 */
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
    // テキストエリアのref
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

    /**
     * TextAreaのクラス名を生成
     * @returns string
     */
    function getTextAreaClasses() {
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
    }

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
                className={getTextAreaClasses() + ' text-area-input'}
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
