import { useState, useCallback, useEffect } from 'react';
import { calendarService, CalendarViewType } from '../services/calendarService';
import { CalendarEvent } from '../types/calendar';
import { ApiResponse } from '../types/api';

interface UseCalendarEventsProps {
  initialDate?: Date;
  initialView?: CalendarViewType;
  helperId?: string;
}

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  currentDate: Date;
  viewType: CalendarViewType;
  setCurrentDate: (date: Date) => void;
  setViewType: (viewType: CalendarViewType) => void;
  refreshEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<ApiResponse<CalendarEvent>>;
  updateEvent: (eventId: string, eventData: Partial<Omit<CalendarEvent, 'id'>>) => Promise<ApiResponse<CalendarEvent>>;
  deleteEvent: (eventId: string) => Promise<ApiResponse<null>>;
  searchEvents: (keyword: string, startDate?: Date, endDate?: Date) => Promise<ApiResponse<CalendarEvent[]>>;
  checkEventConflicts: (event: CalendarEvent) => Promise<ApiResponse<CalendarEvent[]>>;
}

/**
 * カレンダーイベントを管理するカスタムフック
 * カレンダービューの変更に応じて自動でデータ取得
 */
export const useCalendarEvents = ({
  initialDate = new Date(),
  initialView = 'week',
  helperId = 'current-helper',
}: UseCalendarEventsProps = {}): UseCalendarEventsReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewType, setViewType] = useState<CalendarViewType>(initialView);

  // イベントを取得する関数
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (viewType === 'day') {
        response = await calendarService.getDayEvents(helperId, currentDate);
      } else if (viewType === 'week') {
        response = await calendarService.getWeekEvents(helperId, currentDate);
      } else {
        response = await calendarService.getMonthEvents(
          helperId, 
          currentDate.getFullYear(), 
          currentDate.getMonth()
        );
      }
      
      setEvents(response.data);
    } catch (err) {
      setError('カレンダーイベントの取得に失敗しました');
      console.error('カレンダーイベント取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, viewType, helperId]);

  // 表示日付またはビュータイプが変更されたらイベントを再取得
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // イベントを手動で再取得する関数
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // イベントを追加する関数
  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>) => {
    const response = await calendarService.addEvent(event);
    // 追加に成功したら一覧を更新
    await refreshEvents();
    return response;
  }, [refreshEvents]);

  // イベントを更新する関数
  const updateEvent = useCallback(async (
    eventId: string, 
    eventData: Partial<Omit<CalendarEvent, 'id'>>
  ) => {
    const response = await calendarService.updateEvent(eventId, eventData);
    // 更新に成功したら一覧を更新
    await refreshEvents();
    return response;
  }, [refreshEvents]);

  // イベントを削除する関数
  const deleteEvent = useCallback(async (eventId: string) => {
    const response = await calendarService.deleteEvent(eventId);
    // 削除に成功したら一覧を更新
    await refreshEvents();
    return response;
  }, [refreshEvents]);

  // イベントを検索する関数
  const searchEvents = useCallback((
    keyword: string, 
    startDate?: Date, 
    endDate?: Date
  ) => {
    return calendarService.searchEvents(keyword, startDate, endDate);
  }, []);

  // イベントの重複をチェックする関数
  const checkEventConflicts = useCallback((event: CalendarEvent) => {
    return calendarService.checkEventConflicts(event);
  }, []);

  return {
    events,
    isLoading,
    error,
    currentDate,
    viewType,
    setCurrentDate,
    setViewType,
    refreshEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    checkEventConflicts
  };
};
