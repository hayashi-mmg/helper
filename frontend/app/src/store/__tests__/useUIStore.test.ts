/**
 * UI状態管理ストアのテスト
 */
import { act } from '@testing-library/react';
import { useUIStore } from '../useUIStore';

describe('useUIStore', () => {
    // 各テスト後にストアをリセット
    afterEach(() => {
        act(() => {
            useUIStore.setState({
                isSidebarOpen: true,
                isModalOpen: false,
                modalContent: null,
                themeMode: 'system',
                isLoading: false,
                notifications: [],
            });
        });
    });

    it('初期状態が正しく設定されていること', () => {
        const state = useUIStore.getState();
        expect(state.isSidebarOpen).toBe(true);
        expect(state.isModalOpen).toBe(false);
        expect(state.modalContent).toBeNull();
        expect(state.themeMode).toBe('system');
        expect(state.isLoading).toBe(false);
        expect(state.notifications).toEqual([]);
    });

    it('toggleSidebar関数がサイドバーの状態を切り替えること', () => {
        // 初期状態の確認
        expect(useUIStore.getState().isSidebarOpen).toBe(true);

        // サイドバー閉じる
        act(() => {
            useUIStore.getState().toggleSidebar();
        });
        expect(useUIStore.getState().isSidebarOpen).toBe(false);

        // サイドバー開く
        act(() => {
            useUIStore.getState().toggleSidebar();
        });
        expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });

    it('openModal関数がモーダルを開くこと', () => {
        const testContent = 'テストモーダルコンテンツ';
        
        act(() => {
            useUIStore.getState().openModal(testContent);
        });
        
        const state = useUIStore.getState();
        expect(state.isModalOpen).toBe(true);
        expect(state.modalContent).toBe(testContent);
    });

    it('closeModal関数がモーダルを閉じること', () => {
        // まずモーダルを開く
        act(() => {
            useUIStore.getState().openModal('テスト');
        });
        
        expect(useUIStore.getState().isModalOpen).toBe(true);
        
        // モーダルを閉じる
        act(() => {
            useUIStore.getState().closeModal();
        });
        
        const state = useUIStore.getState();
        expect(state.isModalOpen).toBe(false);
        expect(state.modalContent).toBeNull();
    });

    it('setThemeMode関数がテーマモードを更新すること', () => {
        act(() => {
            useUIStore.getState().setThemeMode('dark');
        });
        
        expect(useUIStore.getState().themeMode).toBe('dark');
        
        act(() => {
            useUIStore.getState().setThemeMode('light');
        });
        
        expect(useUIStore.getState().themeMode).toBe('light');
    });

    it('setLoading関数がローディング状態を更新すること', () => {
        act(() => {
            useUIStore.getState().setLoading(true);
        });
        
        expect(useUIStore.getState().isLoading).toBe(true);
        
        act(() => {
            useUIStore.getState().setLoading(false);
        });
        
        expect(useUIStore.getState().isLoading).toBe(false);
    });

    it('addNotification関数が通知を追加すること', () => {
        // 乱数生成の代わりに固定値を返すようにモック化
        const mockId = 'mock-id';
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        
        const mockDate = new Date(2025, 4, 6).getTime();
        jest.spyOn(Date, 'now').mockReturnValue(mockDate);
        
        const notification = {
            type: 'info' as const,
            message: 'テスト通知',
            title: 'テストタイトル',
        };
        
        act(() => {
            useUIStore.getState().addNotification(notification);
        });
        
        const state = useUIStore.getState();
        expect(state.notifications.length).toBe(1);
        expect(state.notifications[0]).toEqual({
            ...notification,
            id: expect.any(String),
            createdAt: mockDate,
        });
    });

    it('自動消去設定付きの通知が指定時間後に削除されること', () => {
        jest.useFakeTimers();
        
        const notification = {
            type: 'info' as const,
            message: 'テスト通知',
            autoHideDuration: 1000, // 1秒後に自動削除
        };
        
        act(() => {
            useUIStore.getState().addNotification(notification);
        });
        
        expect(useUIStore.getState().notifications.length).toBe(1);
        
        // タイマーを進める
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        
        // 通知が削除されているか確認
        expect(useUIStore.getState().notifications.length).toBe(0);
        
        jest.useRealTimers();
    });

    it('removeNotification関数が特定の通知を削除すること', () => {
        // 2つの通知を追加
        act(() => {
            useUIStore.setState({
                notifications: [
                    { id: 'id1', type: 'info', message: '通知1', createdAt: Date.now() },
                    { id: 'id2', type: 'warning', message: '通知2', createdAt: Date.now() },
                ],
            });
        });
        
        expect(useUIStore.getState().notifications.length).toBe(2);
        
        // id1の通知を削除
        act(() => {
            useUIStore.getState().removeNotification('id1');
        });
        
        const state = useUIStore.getState();
        expect(state.notifications.length).toBe(1);
        expect(state.notifications[0].id).toBe('id2');
    });

    it('clearAllNotifications関数がすべての通知を削除すること', () => {
        // 複数の通知を追加
        act(() => {
            useUIStore.setState({
                notifications: [
                    { id: 'id1', type: 'info', message: '通知1', createdAt: Date.now() },
                    { id: 'id2', type: 'warning', message: '通知2', createdAt: Date.now() },
                    { id: 'id3', type: 'error', message: '通知3', createdAt: Date.now() },
                ],
            });
        });
        
        expect(useUIStore.getState().notifications.length).toBe(3);
        
        // 全通知削除
        act(() => {
            useUIStore.getState().clearAllNotifications();
        });
        
        expect(useUIStore.getState().notifications.length).toBe(0);
    });
});