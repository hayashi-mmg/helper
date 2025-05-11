import { ReactNode, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import Notification, { NotificationType, NotificationPosition } from '../Notification';
import { useState, useEffect, useContext, useCallback, createContext } from 'react';

/**
 * トーストの設定オプション
 */
export interface ToastOptions {
  /** トーストのタイプ */
  type?: NotificationType;
  /** トーストのタイトル */
  title?: string;
  /** 表示位置 */
  position?: NotificationPosition;
  /** 自動で閉じる時間（ミリ秒）、0の場合は自動で閉じない */
  autoCloseTime?: number;
  /** 閉じるボタンを表示するかどうか */
  showCloseButton?: boolean;
  /** カスタムアイコン */
  icon?: ReactNode;
}

/**
 * トースト情報の内部状態
 */
interface ToastInfo extends ToastOptions {
  id: string;
  message: string;
}

/** トースト表示用のコンテナ */
const ToastContainer = styled.div<{ $position: NotificationPosition }>`
  position: fixed;
  z-index: 10000;
  
  ${props => {
    switch(props.$position) {
      case 'top':
        return `
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'top-right':
        return `
          top: 20px;
          right: 20px;
        `;
      case 'top-left':
        return `
          top: 20px;
          left: 20px;
        `;
      case 'bottom':
        return `
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'bottom-right':
        return `
          bottom: 20px;
          right: 20px;
        `;
      case 'bottom-left':
        return `
          bottom: 20px;
          left: 20px;
        `;
      default:
        return `
          top: 20px;
          right: 20px;
        `;
    }
  }}
`;

/**
 * ToastManagerコンテキスト
 */
export interface ToastManagerContext {
  /**
   * トースト通知を表示する
   * @param message トーストに表示するメッセージ
   * @param options トーストのオプション設定
   * @returns 表示したトーストのID
   */
  show: (message: string, options?: ToastOptions) => string;
  
  /**
   * 成功トースト通知を表示する
   * @param message トーストに表示するメッセージ
   * @param options トーストのオプション設定（typeは'success'で上書きされます）
   * @returns 表示したトーストのID
   */
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  
  /**
   * エラートースト通知を表示する
   * @param message トーストに表示するメッセージ
   * @param options トーストのオプション設定（typeは'error'で上書きされます）
   * @returns 表示したトーストのID
   */
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  
  /**
   * 警告トースト通知を表示する
   * @param message トーストに表示するメッセージ
   * @param options トーストのオプション設定（typeは'warning'で上書きされます）
   * @returns 表示したトーストのID
   */
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  
  /**
   * 情報トースト通知を表示する
   * @param message トーストに表示するメッセージ
   * @param options トーストのオプション設定（typeは'info'で上書きされます）
   * @returns 表示したトーストのID 
   */
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  
  /**
   * 指定したIDのトースト通知を削除する
   * @param id 削除するトーストのID
   */
  remove: (id: string) => void;
  
  /**
   * すべてのトースト通知を削除する
   */
  removeAll: () => void;
}

// React Context の作成
export const ToastContext = React.createContext<ToastManagerContext | null>(null);

/**
 * ToastManager Providerのプロパティ
 */
export interface ToastManagerProviderProps {
  /** デフォルトの表示位置 */
  defaultPosition?: NotificationPosition;
  /** デフォルトの自動消去時間（ミリ秒） */
  defaultAutoCloseTime?: number;
  /** 同時に表示できるトーストの最大数 */
  maxToasts?: number;
  /** 子要素 */
  children: ReactNode;
}

/**
 * トースト通知を管理するプロバイダーコンポーネント
 */
export const ToastManagerProvider: React.FC<ToastManagerProviderProps> = ({
  defaultPosition = 'top-right',
  defaultAutoCloseTime = 5000,
  maxToasts = 5,
  children
}) => {
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // トースト表示位置ごとのグループに分ける
  const toastsByPosition: Record<NotificationPosition, ToastInfo[]> = {
    'top': [],
    'top-right': [],
    'top-left': [],
    'bottom': [],
    'bottom-right': [],
    'bottom-left': []
  };

  toasts.forEach(toast => {
    const position = toast.position || defaultPosition;
    toastsByPosition[position].push(toast);
  });

  // 最大数を超えたトーストを削除
  useEffect(() => {
    if (toasts.length > maxToasts) {
      // 古いトーストから削除
      setToasts(prevToasts => prevToasts.slice(-maxToasts));
    }
  }, [toasts, maxToasts]);

  /**
   * トースト通知を表示する
   */
  const show = useCallback((message: string, options: ToastOptions = {}): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: ToastInfo = {
      id,
      message,
      type: options.type || 'info',
      title: options.title,
      position: options.position || defaultPosition,
      autoCloseTime: options.autoCloseTime !== undefined ? options.autoCloseTime : defaultAutoCloseTime,
      showCloseButton: options.showCloseButton !== undefined ? options.showCloseButton : true,
      icon: options.icon
    };
    
    setToasts(prevToasts => [...prevToasts, toast]);
    return id;
  }, [defaultPosition, defaultAutoCloseTime]);

  /**
   * 成功トースト通知を表示する
   */
  const success = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string => {
    return show(message, { ...options, type: 'success' });
  }, [show]);

  /**
   * エラートースト通知を表示する
   */
  const error = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string => {
    return show(message, { ...options, type: 'error' });
  }, [show]);

  /**
   * 警告トースト通知を表示する
   */
  const warning = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string => {
    return show(message, { ...options, type: 'warning' });
  }, [show]);

  /**
   * 情報トースト通知を表示する
   */
  const info = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string => {
    return show(message, { ...options, type: 'info' });
  }, [show]);

  /**
   * 指定したIDのトースト通知を削除する
   */
  const remove = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  /**
   * すべてのトースト通知を削除する
   */
  const removeAll = useCallback(() => {
    setToasts([]);
  }, []);

  // コンテキスト値
  const contextValue: ToastManagerContext = {
    show,
    success,
    error,
    warning,
    info,
    remove,
    removeAll
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* 各位置ごとにポータルでトーストをレンダリング */}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => 
        positionToasts.length > 0 ? createPortal(
          <ToastContainer $position={position as NotificationPosition}>
            {positionToasts.map(toast => (
              <Notification
                key={toast.id}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                mode="toast"
                position={toast.position}
                autoCloseTime={toast.autoCloseTime}
                showCloseButton={toast.showCloseButton}
                icon={toast.icon}
                onClose={() => remove(toast.id)}
              />
            ))}
          </ToastContainer>,
          document.body
        ) : null
      )}
    </ToastContext.Provider>
  );
};

/**
 * トースト通知を使用するためのフック
 * @returns ToastManager のコンテキスト
 */
export const useToast = (): ToastManagerContext => {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastManagerProvider');
  }
  
  return context;
};
