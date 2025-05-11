import { renderHook, act, waitFor } from '@testing-library/react';
import { useCalendarEvents } from './useCalendarEvents';
import { calendarService } from '../services/calendarService';

// CalendarServiceのモック
jest.mock('../services/calendarService', () => ({
  calendarService: {
    getDayEvents: jest.fn(),
    getWeekEvents: jest.fn(),
    getMonthEvents: jest.fn(),
    addEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    searchEvents: jest.fn(),
    checkEventConflicts: jest.fn()
  }
}));

describe('useCalendarEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // モックのデフォルト実装を設定
    const mockEvents = [
      {
        id: 'event-1',
        title: 'テストイベント1',
        start: '2025-05-12T10:00:00Z',
        end: '2025-05-12T12:00:00Z',
        type: 'task',
      },
      {
        id: 'event-2',
        title: 'テストイベント2',
        start: '2025-05-13T14:00:00Z',
        end: '2025-05-13T16:00:00Z',
        type: 'appointment',
      }
    ];
    
    // 成功レスポンスの共通設定
    (calendarService.getDayEvents as jest.Mock).mockResolvedValue({ data: mockEvents });
    (calendarService.getWeekEvents as jest.Mock).mockResolvedValue({ data: mockEvents });
    (calendarService.getMonthEvents as jest.Mock).mockResolvedValue({ data: mockEvents });
    (calendarService.addEvent as jest.Mock).mockResolvedValue({ 
      data: { id: 'new-event', title: 'New Event' }, 
      message: 'イベントを追加しました' 
    });
    (calendarService.updateEvent as jest.Mock).mockResolvedValue({ 
      data: { id: 'event-1', title: 'Updated Event' }, 
      message: 'イベントを更新しました'
    });
    (calendarService.deleteEvent as jest.Mock).mockResolvedValue({ 
      data: null, 
      message: 'イベントを削除しました'
    });
    (calendarService.searchEvents as jest.Mock).mockResolvedValue({ data: [mockEvents[0]] });
    (calendarService.checkEventConflicts as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('初期化時に指定されたビュータイプのイベントを取得する', async () => {
    const { result } = renderHook(() => useCalendarEvents({
      initialDate: new Date('2025-05-12'),
      initialView: 'day',
      helperId: 'helper-1'
    }));

    // 初期状態ではローディング中
    expect(result.current.isLoading).toBe(true);
    
    // イベントがロードされるのを待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // getDayEventsが呼ばれたことを確認
    expect(calendarService.getDayEvents).toHaveBeenCalledWith(
      'helper-1',
      expect.any(Date)
    );
    
    // eventsが設定されていることを確認
    expect(result.current.events).toHaveLength(2);
  });

  it('ビュータイプを変更するとイベントが再取得される', async () => {
    const { result } = renderHook(() => useCalendarEvents({
      initialDate: new Date('2025-05-12'),
      initialView: 'day'
    }));

    // 初期データの読み込みを待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // ビュータイプを週表示に変更
    act(() => {
      result.current.setViewType('week');
    });
    
    // 再度ローディングが始まっていることを確認
    expect(result.current.isLoading).toBe(true);
    
    // イベントが再読み込みされるのを待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // getWeekEventsが呼ばれたことを確認
    expect(calendarService.getWeekEvents).toHaveBeenCalled();
  });

  it('日付を変更するとイベントが再取得される', async () => {
    const { result } = renderHook(() => useCalendarEvents({
      initialDate: new Date('2025-05-12'),
      initialView: 'month'
    }));

    // 初期データの読み込みを待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // 月を変更
    const newDate = new Date('2025-06-01');
    act(() => {
      result.current.setCurrentDate(newDate);
    });
    
    // 再度ローディングが始まっていることを確認
    expect(result.current.isLoading).toBe(true);
    
    // イベントが再読み込みされるのを待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // getMonthEventsが呼ばれたことを確認
    expect(calendarService.getMonthEvents).toHaveBeenCalledWith(
      'current-helper',
      2025,
      5 // 6月は5のインデックス
    );
  });

  it('イベントを追加できる', async () => {
    const { result } = renderHook(() => useCalendarEvents());

    // 初期データの読み込みを待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // 新しいイベントを追加
    const newEvent = {
      title: 'New Event',
      start: '2025-05-15T10:00:00Z',
      end: '2025-05-15T12:00:00Z',
      type: 'task' as const,
    };
    
    let response;
    await act(async () => {
      response = await result.current.addEvent(newEvent);
    });
    
    // addEventが呼ばれたことを確認
    expect(calendarService.addEvent).toHaveBeenCalledWith(newEvent);
    
    // レスポンスが正しいことを確認
    expect(response).toEqual({
      data: { id: 'new-event', title: 'New Event' },
      message: 'イベントを追加しました'
    });
    
    // イベント追加後にrefreshEventsが呼ばれたことを確認（実装による）
    expect(calendarService.getWeekEvents).toHaveBeenCalledTimes(2);
  });

  it('エラー時にエラーメッセージが設定される', async () => {
    // エラーをシミュレート
    (calendarService.getDayEvents as jest.Mock).mockRejectedValue(new Error('API error'));
    
    const { result } = renderHook(() => useCalendarEvents({
      initialView: 'day'
    }));
    
    // エラー状態になるのを待つ
    await waitFor(() => {
      expect(result.current.error).toBe('カレンダーイベントの取得に失敗しました');
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.events).toEqual([]);
  });
});
