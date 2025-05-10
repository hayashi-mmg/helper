import { useState, useCallback } from 'react';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { devtools } from 'zustand/middleware';

/**
 * 通知タイプの列挙型
 */
export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

/**
 * 通知オプションの型定義
 */
export interface NotificationOptions {
    /** 自動で消えるまでの時間（ミリ秒） */
    duration?: number;
    /** 閉じるボタンを表示するか */
    closable?: boolean;
    /** 通知の詳細情報 */
    description?: string;
}

/**
 * 通知アイテムの型定義
 */
export interface NotificationItem {
    /** 通知ID */
    id: string;
    /** 通知タイトル */
    title: string;
    /** 通知タイプ */
    type: NotificationType;
    /** 通知メッセージ */
    message: string;
    /** 通知が作成された日時 */
    createdAt: Date;
    /** 通知オプション */
    options?: NotificationOptions;
}

/**
 * 通知ストアの状態型定義
 */
interface NotificationState {
    /** 通知一覧 */
    notifications: NotificationItem[];
    /** 最大通知表示数 */
    maxNotifications: number;
}

/**
 * 通知ストアのアクション型定義
 */
interface NotificationActions {
    /** 通知を追加する */
    addNotification: (
        title: string,
        message: string,
        type: NotificationType,
        options?: NotificationOptions
    ) => string;
    /** 通知を削除する */
    removeNotification: (id: string) => void;
    /** すべての通知を削除する */
    clearAllNotifications: () => void;
    /** 成功通知を追加する */
    success: (title: string, message: string, options?: NotificationOptions) => string;
    /** エラー通知を追加する */
    error: (title: string, message: string, options?: NotificationOptions) => string;
    /** 警告通知を追加する */
    warning: (title: string, message: string, options?: NotificationOptions) => string;
    /** 情報通知を追加する */
    info: (title: string, message: string, options?: NotificationOptions) => string;
}

/**
 * 通知ストアの型定義
 */
type NotificationStore = NotificationState & NotificationActions;

/**
 * デフォルトの通知オプション
 */
const DEFAULT_NOTIFICATION_OPTIONS: NotificationOptions = {
    duration: 5000, // 5秒
    closable: true,
};

/**
 * 通知を管理するZustandストア
 */
const useNotificationStore = create<NotificationStore>()(
    devtools(
        (set, get) => ({
            notifications: [],
            maxNotifications: 5,

            /**
             * 通知を追加する
             * @param title 通知タイトル
             * @param message 通知メッセージ
             * @param type 通知タイプ
             * @param options 通知オプション
             * @returns 生成された通知ID
             */
            addNotification: (title, message, type, options = {}) => {
                const id = uuidv4();
                const notification: NotificationItem = {
                    id,
                    title,
                    message,
                    type,
                    createdAt: new Date(),
                    options: { ...DEFAULT_NOTIFICATION_OPTIONS, ...options },
                };

                set((state) => {
                    // 最大数を超える場合は古い通知を削除
                    const notifications = [...state.notifications, notification];
                    if (notifications.length > state.maxNotifications) {
                        return {
                            notifications: notifications.slice(-state.maxNotifications),
                        };
                    }
                    return { notifications };
                });

                // 自動削除タイマーの設定
                if (notification.options?.duration && notification.options.duration > 0) {
                    setTimeout(() => {
                        get().removeNotification(id);
                    }, notification.options.duration);
                }

                return id;
            },

            /**
             * 通知を削除する
             * @param id 削除する通知ID
             */
            removeNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            },

            /**
             * すべての通知を削除する
             */
            clearAllNotifications: () => {
                set({ notifications: [] });
            },

            /**
             * 成功通知を追加する
             * @param title 通知タイトル
             * @param message 通知メッセージ
             * @param options 通知オプション
             * @returns 生成された通知ID
             */
            success: (title, message, options) => {
                return get().addNotification(title, message, NotificationType.SUCCESS, options);
            },

            /**
             * エラー通知を追加する
             * @param title 通知タイトル
             * @param message 通知メッセージ
             * @param options 通知オプション
             * @returns 生成された通知ID
             */
            error: (title, message, options) => {
                return get().addNotification(title, message, NotificationType.ERROR, options);
            },

            /**
             * 警告通知を追加する
             * @param title 通知タイトル
             * @param message 通知メッセージ
             * @param options 通知オプション
             * @returns 生成された通知ID
             */
            warning: (title, message, options) => {
                return get().addNotification(title, message, NotificationType.WARNING, options);
            },

            /**
             * 情報通知を追加する
             * @param title 通知タイトル
             * @param message 通知メッセージ
             * @param options 通知オプション
             * @returns 生成された通知ID
             */
            info: (title, message, options) => {
                return get().addNotification(title, message, NotificationType.INFO, options);
            },
        }),
        { name: 'notification-store' }
    )
);

/**
 * 通知機能を提供するカスタムフック
 * @returns 通知に関する状態と操作メソッド
 */
const useNotification = () => {
    const {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        success,
        error,
        warning,
        info,
    } = useNotificationStore();

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        success,
        error,
        warning,
        info,
    };
};

export default useNotification;
