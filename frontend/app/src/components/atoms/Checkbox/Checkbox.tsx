import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled from 'styled-components';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * チェックボックスのラベル
   */
  label?: string;
  
  /**
   * 中間状態（一部選択）を表すかどうか
   */
  indeterminate?: boolean;
  
  /**
   * ヘルプテキスト
   */
  helpText?: string;
  
  /**
   * エラーメッセージ
   */
  errorMessage?: string;
  
  /**
   * サイズバリエーション
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
}

const CheckboxContainer = styled.div`
  display: inline-flex;
  align-items: flex-start;
  position: relative;
  cursor: pointer;
  user-select: none;

  &:hover input:not(:disabled) ~ .checkbox-custom {
    border-color: var(--color-primary-500);
  }

  &:focus-within .checkbox-custom {
    box-shadow: 0 0 0 2px var(--color-primary-200);
  }
`;

const Input = styled.input`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
  
  &:checked ~ .checkbox-custom {
    background-color: var(--color-primary-500);
    border-color: var(--color-primary-500);
  }

  &:checked ~ .checkbox-custom::after {
    opacity: 1;
  }

  &:disabled ~ .checkbox-custom {
    background-color: var(--color-gray-100);
    border-color: var(--color-gray-300);
    cursor: not-allowed;
  }

  &:disabled ~ .checkbox-label {
    color: var(--color-gray-400);
    cursor: not-allowed;
  }
`;

const CustomCheckbox = styled.span<{ size: CheckboxProps['size'], indeterminate?: boolean }>`
  position: relative;
  display: inline-block;
  width: ${props => props.size === 'small' ? '16px' : props.size === 'large' ? '24px' : '20px'};
  height: ${props => props.size === 'small' ? '16px' : props.size === 'large' ? '24px' : '20px'};
  background-color: white;
  border: 2px solid var(--color-gray-400);
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  margin-right: 8px;
  flex-shrink: 0;

  &::after {
    content: "";
    position: absolute;
    opacity: 0;
    
    ${props => props.indeterminate ? `
      left: 50%;
      top: 50%;
      width: 10px;
      height: 2px;
      background: white;
      transform: translate(-50%, -50%);
    ` : `
      left: 50%;
      top: 30%;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: translateX(-50%) rotate(45deg);
    `}
  }
`;

const Label = styled.span<{ size: CheckboxProps['size'] }>`
  font-size: ${props => props.size === 'small' ? '0.875rem' : props.size === 'large' ? '1.125rem' : '1rem'};
  line-height: ${props => props.size === 'small' ? '16px' : props.size === 'large' ? '24px' : '20px'};
  padding-top: 2px;
`;

const HelpText = styled.div`
  font-size: 0.75rem;
  color: var(--color-gray-500);
  margin-top: 4px;
  margin-left: 28px;
`;

const ErrorMessage = styled.div`
  font-size: 0.75rem;
  color: var(--color-danger-500);
  margin-top: 4px;
  margin-left: 28px;
`;

/**
 * チェックボックスコンポーネント
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className,
  label,
  indeterminate = false,
  helpText,
  errorMessage,
  size = 'medium',
  ...props
}, ref) => {
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useImperativeHandle(ref, () => inputRef.current!, []);
  
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  return (
    <div>
      <CheckboxContainer className={className}>
        <Input
          type="checkbox"
          ref={inputRef}
          {...props}
        />
        <CustomCheckbox className="checkbox-custom" size={size} indeterminate={indeterminate} />
        {label && (
          <Label className="checkbox-label" size={size}>
            {label}
          </Label>
        )}
      </CheckboxContainer>
      {helpText && !errorMessage && <HelpText>{helpText}</HelpText>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
