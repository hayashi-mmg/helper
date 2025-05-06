/**
 * UI状態に関する状態管理を行うZustandストア
 */
import { create } from 'zustand';

// テーマの種類
type ThemeMode = 'light' | 'dark' | 'system';

// UI状態の型定義
interface UIState {
    // 状態
    isSidebarOpen: boolean;
    isModalOpen: boolean;
    modalContent: React.ReactNode | null;
    themeMode: ThemeMode;
    isLoading: boolean;
    notifications: Notification[];
    
    // アクション
    toggleSidebar: () => void;
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void;
    setThemeMode: (mode: ThemeMode) => void;
    setLoading: (isLoading: boolean) => void;
    addNotification: (notification: Notification) => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
}

// 通知の型定義
export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    title?: string;
    autoHideDuration?: number;  // ミリ秒単位、未指定またはnullの場合は自動的に閉じない
    createdAt: number;  // タイムスタンプ
}

/**
 * UI状態を管理するストア
 * 
 * サイドバーの開閉、モーダルの管理、テーマ設定、ローディング状態、通知などを管理します。
 */
export const useUIStore = create<UIState>()((set, get) => ({
    // 初期状態
    isSidebarOpen: true,
    isModalOpen: false,
    modalContent: null,
    themeMode: 'system',
    isLoading: false,
    notifications: [],
    
    // アクション
    /**
     * サイドバーの表示/非表示を切り替え
     */
    toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
    },
    
    /**
     * モーダルを開く
     * @param content モーダルに表示するコンテンツ
     */
    openModal: (content: React.ReactNode) => {
        set({ isModalOpen: true, modalContent: content });
    },
    
    /**
     * モーダルを閉じる
     */
    closeModal: () => {
        set({ isModalOpen: false, modalContent: null });
    },
    
    /**
     * テーマモードを設定
     * @param mode テーマモード ('light', 'dark', 'system')
     */
    setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
    },
    
    /**
     * グローバルローディング状態を設定
     * @param isLoading ローディング状態
     */
    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },
    
    /**
     * 通知を追加
     * @param notification 追加する通知オブジェクト
     */
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
        const id = Math.random().toString(36).substring(2, 15);
        const createdAt = Date.now();
        
        const newNotification: Notification = {
            ...notification,
            id,
            createdAt,
        };
        
        set((state) => ({
            notifications: [...state.notifications, newNotification]
        }));
        
        // autoHideDurationが指定されている場合、指定時間後に通知を削除
        if (notification.autoHideDuration) {
            setTimeout(() => {
                get().removeNotification(id);
            }, notification.autoHideDuration);
        }
    },
    
    /**
     * 通知を削除
     * @param id 削除する通知のID
     */
    removeNotification: (id: string) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
        }));
    },
    
    /**
     * すべての通知をクリア
     */
    clearAllNotifications: () => {
        set({ notifications: [] });
    },
}));