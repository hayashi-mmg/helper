import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// アプリケーションの状態管理

// 認証状態の型定義
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// 認証ストアの作成
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: (user, token) =>
          set({
            user,
            token,
            isAuthenticated: true,
            error: null,
          }),
        logout: () =>
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      }
    )
  )
);

// UI設定の型定義
interface UIState {
  darkMode: boolean;
  language: 'ja' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  toggleDarkMode: () => void;
  setLanguage: (language: 'ja' | 'en') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

// UI設定ストアの作成
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        darkMode: false,
        language: 'ja',
        fontSize: 'medium',
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        setLanguage: (language) => set({ language }),
        setFontSize: (fontSize) => set({ fontSize }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);

// 通知の型定義
type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  autoHideDuration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// 通知ストアの作成
export const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    notifications: [],
    addNotification: (notification) =>
      set((state) => ({
        notifications: [
          ...state.notifications,
          {
            id: Date.now().toString(),
            ...notification,
          },
        ],
      })),
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((notification) => notification.id !== id),
      })),
    clearNotifications: () => set({ notifications: [] }),
  }))
);

// その他のストアは必要に応じて追加
