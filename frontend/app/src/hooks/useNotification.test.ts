import { renderHook, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import useNotification, { NotificationType } from './useNotification';

// UUIDの生成をモック化
jest.mock('uuid', () => ({
    v4: () => 'test-uuid',
}));

describe('useNotification', () => {
    beforeEach(() => {
        // 各テスト前にローカルストレージとタイマーをクリア
        localStorage.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should initialize with empty notifications', () => {
        const { result } = renderHook(() => useNotification());
        expect(result.current.notifications).toEqual([]);
    });

    it('should add a notification', () => {
        const { result } = renderHook(() => useNotification());

        act(() => {
            result.current.addNotification(
                'テスト通知',
                'これはテスト通知です',
                NotificationType.INFO
            );
        });

        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0]).toEqual(
            expect.objectContaining({
                id: 'test-uuid',
                title: 'テスト通知',
                message: 'これはテスト通知です',
                type: NotificationType.INFO,
                options: expect.objectContaining({
                    duration: 5000,
                    closable: true,
                }),
            })
        );
    });

    it('should add success notification', () => {
        const { result } = renderHook(() => useNotification());

        act(() => {
            result.current.success('成功', '操作が成功しました');
        });

        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].type).toBe(NotificationType.SUCCESS);
    });

    it('should add error notification', () => {
        const { result } = renderHook(() => useNotification());

        act(() => {
            result.current.error('エラー', 'エラーが発生しました');
        });

        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].type).toBe(NotificationType.ERROR);
    });

    it('should add warning notification', () => {
        const { result } = renderHook(() => useNotification());

        act(() => {
            result.current.warning('警告', '注意が必要です');
        });

        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].type).toBe(NotificationType.WARNING);
    });

    it('should add info notification', () => {
        const { result } = renderHook(() => useNotification());

        act(() => {
            result.current.info('情報', 'お知らせがあります');
        });

        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].type).toBe(NotificationType.INFO);
    });

    it('should remove notification by id', () => {
        const { result } = renderHook(() => useNotification());

        let notificationId: string;
        act(() => {
            notificationId = result.current.info('情報', 'お知らせがあります');
        });

        expect(result.current.notifications).toHaveLength(1);

        act(() => {
            result.current.removeNotification(notificationId);
        });

        expect(result.current.notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
        const { result } = renderHook(() => useNotification());

        act(() => {
            result.current.info('情報1', 'お知らせ1');
            result.current.info('情報2', 'お知らせ2');
            result.current.info('情報3', 'お知らせ3');
        });

        expect(result.current.notifications).toHaveLength(3);

        act(() => {
            result.current.clearAllNotifications();
        });

        expect(result.current.notifications).toHaveLength(0);
    });

    it('should automatically remove notification after duration', () => {
        const { result } = renderHook(() => useNotification());

        act(() => {
            result.current.info('情報', 'お知らせ', { duration: 2000 });
        });

        expect(result.current.notifications).toHaveLength(1);

        // 時間を進める
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(result.current.notifications).toHaveLength(0);
    });

    it('should not automatically remove notification if duration is 0', () => {
        const { result } = renderHook(() => useNotification());

        act(() => {
            result.current.info('情報', 'お知らせ', { duration: 0 });
        });

        expect(result.current.notifications).toHaveLength(1);

        // 十分な時間を進める
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        // 通知が削除されていないことを確認
        expect(result.current.notifications).toHaveLength(1);
    });

    it('should limit the number of notifications', () => {
        const { result } = renderHook(() => useNotification());

        // 最大数以上の通知を追加
        act(() => {
            for (let i = 0; i < 10; i++) {
                result.current.info(`情報${i}`, `お知らせ${i}`);
            }
        });

        // 最大5つの通知のみが保持されること
        expect(result.current.notifications).toHaveLength(5);
        
        // 最新の通知が残っていることを確認
        expect(result.current.notifications[4].title).toBe('情報9');
    });

    it('should override default options with custom options', () => {
        const { result } = renderHook(() => useNotification());
        const customOptions = {
            duration: 10000,
            closable: false,
            description: 'カスタム詳細情報',
        };

        act(() => {
            result.current.info('情報', 'お知らせ', customOptions);
        });

        expect(result.current.notifications[0].options).toEqual(customOptions);
    });
});
