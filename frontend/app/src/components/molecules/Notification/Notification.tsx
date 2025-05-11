import { ReactNode, useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

/**
 * 通知タイプの定義
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * 通知の表示位置
 */
export type NotificationPosition = 
  | 'top' 
  | 'top-right' 
  | 'top-left' 
  | 'bottom' 
  | 'bottom-right' 
  | 'bottom-left';

/**
 * 通知の表示モード
 */
export type NotificationMode = 'toast' | 'alert' | 'dialog';

/**
 * Notification コンポーネントの Props
 */
export interface NotificationProps {
  /** 通知タイプ */
  type: NotificationType;
  /** 通知タイトル */
  title?: string;
  /** 通知メッセージ */
  message: string;
  /** 通知に表示するアイコン */
  icon?: ReactNode;
  /** 表示モード */
  mode?: NotificationMode;
  /** 通知の表示位置 (トーストモード時) */
  position?: NotificationPosition;
  /** 自動で閉じる時間（ミリ秒）、0の場合は自動で閉じない */
  autoCloseTime?: number;
  /** 閉じるボタンを表示するかどうか */
  showCloseButton?: boolean;
  /** 通知が閉じられた時のコールバック */
  onClose?: () => void;
  /** 通知が表示された時のコールバック */
  onShow?: () => void;
  /** 子要素（追加のアクション等） */
  children?: ReactNode;
}

// アイコンの定義
const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

// アニメーション定義
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

// スタイル付きコンポーネント
const NotificationContainer = styled.div<{
  $type: NotificationType;
  $mode: NotificationMode;
  $position: NotificationPosition;
  $isVisible: boolean;
  $isClosing: boolean;
}>`
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: ${props => (props.$isClosing ? fadeOut : fadeIn)} 0.3s ease-in-out;
  width: ${props => props.$mode === 'toast' ? '320px' : '100%'};
  max-width: ${props => props.$mode === 'dialog' ? '500px' : '100%'};
  position: ${props => props.$mode === 'toast' ? 'fixed' : 'relative'};
  z-index: 1000;
  
  ${props => {
    switch(props.$position) {
      case 'top':
        return css`
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'top-right':
        return css`
          top: 20px;
          right: 20px;
        `;
      case 'top-left':
        return css`
          top: 20px;
          left: 20px;
        `;
      case 'bottom':
        return css`
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'bottom-right':
        return css`
          bottom: 20px;
          right: 20px;
        `;
      case 'bottom-left':
        return css`
          bottom: 20px;
          left: 20px;
        `;
      default:
        return css`
          top: 20px;
          right: 20px;
        `;
    }
  }}

  ${props => {
    const colors = {
      success: { bg: '#f0fff4', border: '#38A169', text: '#2f855a' },
      error: { bg: '#fff5f5', border: '#E53E3E', text: '#c53030' },
      warning: { bg: '#fffaf0', border: '#DD6B20', text: '#c05621' },
      info: { bg: '#ebf8ff', border: '#3182CE', text: '#2b6cb0' }
    };

    const color = colors[props.$type];

    return css`
      background-color: ${color.bg};
      border-left: 4px solid ${color.border};
      color: ${color.text};

      .notification-icon {
        color: ${color.border};
      }
    `;
  }}

  /* ダイアログモード時のスタイル */
  ${props => props.$mode === 'dialog' && css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 500px;
    z-index: 1010;
    border: 1px solid rgba(0, 0, 0, 0.1);
  `}
`;

const NotificationContent = styled.div`
  flex: 1;
  margin: 0 12px;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const NotificationIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationActions = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.5);
    border-radius: 2px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

/**
 * アイコンを通知タイプに基づいて取得する
 */
const getDefaultIcon = (type: NotificationType): ReactNode => {
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return null;
  }
};

/**
 * 通知コンポーネント
 * 成功・エラー・警告・情報を表示するための通知コンポーネント
 */
export const Notification: React.FC<NotificationProps> = ({
  type = 'info',
  title,
  message,
  icon,
  mode = 'alert',
  position = 'top-right',
  autoCloseTime = 5000,
  showCloseButton = true,
  onClose,
  onShow,
  children
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  
  // 自動的に閉じる処理
  useEffect(() => {
    if (onShow) {
      onShow();
    }

    if (autoCloseTime > 0 && mode === 'toast') {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoCloseTime, mode, onShow]);

  // 閉じる処理
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  };
  
  // 表示するアイコン
  const displayIcon = icon || getDefaultIcon(type);

  // ダイアログモードの場合はPortalを使用して表示
  if (mode === 'dialog') {
    return isVisible ? createPortal(
      <>
        <Overlay onClick={handleClose} />
        <NotificationContainer 
          $type={type} 
          $mode={mode} 
          $position={position} 
          $isVisible={isVisible}
          $isClosing={isClosing}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "notification-title" : undefined}
          aria-describedby="notification-message"
        >
          {displayIcon && (
            <NotificationIconWrapper className="notification-icon">
              {displayIcon}
            </NotificationIconWrapper>
          )}
          <NotificationContent>
            {title && <NotificationTitle id="notification-title">{title}</NotificationTitle>}
            <NotificationMessage id="notification-message">{message}</NotificationMessage>
            {children && (
              <NotificationActions>
                {children}
              </NotificationActions>
            )}
          </NotificationContent>
          {showCloseButton && (
            <CloseButton 
              onClick={handleClose}
              aria-label="閉じる"
            >
              <CloseIcon />
            </CloseButton>
          )}
        </NotificationContainer>
      </>,
      document.body
    ) : null;
  }

  // トーストモードの場合もPortalを使用
  if (mode === 'toast') {
    return isVisible ? createPortal(
      <NotificationContainer 
        $type={type} 
        $mode={mode} 
        $position={position} 
        $isVisible={isVisible}
        $isClosing={isClosing}
        role="alert"
      >
        {displayIcon && (
          <NotificationIconWrapper className="notification-icon">
            {displayIcon}
          </NotificationIconWrapper>
        )}
        <NotificationContent>
          {title && <NotificationTitle>{title}</NotificationTitle>}
          <NotificationMessage>{message}</NotificationMessage>
        </NotificationContent>
        {showCloseButton && (
          <CloseButton 
            onClick={handleClose}
            aria-label="閉じる"
          >
            <CloseIcon />
          </CloseButton>
        )}
      </NotificationContainer>,
      document.body
    ) : null;
  }

  // 通常のアラートモード
  return isVisible ? (
    <NotificationContainer 
      $type={type} 
      $mode={mode} 
      $position={position} 
      $isVisible={isVisible}
      $isClosing={isClosing}
      role="alert"
    >
      {displayIcon && (
        <NotificationIconWrapper className="notification-icon">
          {displayIcon}
        </NotificationIconWrapper>
      )}
      <NotificationContent>
        {title && <NotificationTitle>{title}</NotificationTitle>}
        <NotificationMessage>{message}</NotificationMessage>
        {children && (
          <NotificationActions>
            {children}
          </NotificationActions>
        )}
      </NotificationContent>
      {showCloseButton && (
        <CloseButton 
          onClick={handleClose}
          aria-label="閉じる"
        >
          <CloseIcon />
        </CloseButton>
      )}
    </NotificationContainer>
  ) : null;
};

export default Notification;
