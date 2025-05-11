import { CalendarEvent } from '../types/calendar';
import { ApiResponse } from '../types/api';
import { mockCalendarEvents } from '../mocks/calendar';
import { Task } from '../types/task';
import { mockTasks } from '../mocks/tasks';
import { tasksToEvents } from '../mocks/calendar';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from 'date-fns';

/**
 * カレンダービューの種類
 */
export type CalendarViewType = 'day' | 'week' | 'month';

/**
 * カレンダーイベントの予定インポート形式
 */
export interface CalendarImportData {
  events: CalendarEvent[];
  source: string;
  timestamp: string;
}

/**
 * カレンダーサービス
 * スケジュールやイベント関連の操作を提供するサービス
 */
export const calendarService = {
  /**
   * 指定日のイベントを取得する
   * @param helperId - ヘルパーID
   * @param date - 日付
   * @returns 指定日のイベント一覧
   */  getDayEvents: async (
    _helperId: string, // API連携時に使用するためアンダースコア付きで保持
    date: Date
  ): Promise<ApiResponse<CalendarEvent[]>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const events = mockCalendarEvents.filter(event => {
      const eventDate = format(new Date(event.start), 'yyyy-MM-dd');
      return eventDate === dateStr;
    });
    
    return {
      data: events
    };
  },
  
  /**
   * 指定週のイベントを取得する
   * @param helperId - ヘルパーID
   * @param startDate - 週の開始日
   * @returns 指定週のイベント一覧
   */  getWeekEvents: async (
    _helperId: string, // API連携時に使用するためアンダースコア付きで保持
    startDate: Date
  ): Promise<ApiResponse<CalendarEvent[]>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const start = startOfWeek(startDate, { weekStartsOn: 1 }); // 月曜始まり
    const end = endOfWeek(startDate, { weekStartsOn: 1 });
    
    const events = mockCalendarEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= start && eventDate <= end;
    });
    
    return {
      data: events
    };
  },
  
  /**
   * 指定月のイベントを取得する
   * @param helperId - ヘルパーID
   * @param year - 年
   * @param month - 月（0-11）
   * @returns 指定月のイベント一覧
   */  getMonthEvents: async (
    _helperId: string, // API連携時に使用するためアンダースコア付きで保持
    year: number,
    month: number
  ): Promise<ApiResponse<CalendarEvent[]>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const date = new Date(year, month);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const events = mockCalendarEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= start && eventDate <= end;
    });
    
    return {
      data: events
    };
  },
  
  /**
   * タスク一覧からカレンダーイベントを生成する
   * @param tasks - タスク一覧
   * @returns カレンダーイベント一覧
   */
  convertTasksToEvents: (tasks: Task[]): CalendarEvent[] => {
    return tasksToEvents(tasks);
  },
  
  /**
   * イベントを追加する
   * @param event - 追加するイベント
   * @returns 追加されたイベント
   */
  addEvent: async (
    event: Omit<CalendarEvent, 'id'>
  ): Promise<ApiResponse<CalendarEvent>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // 新しいIDを生成
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}`
    };
    
    // 実際のAPIではここでデータベースに保存
    
    return {
      data: newEvent,
      message: 'イベントを追加しました'
    };
  },
  
  /**
   * イベントを更新する
   * @param eventId - 更新するイベントのID
   * @param eventData - 更新データ
   * @returns 更新されたイベント
   */
  updateEvent: async (
    eventId: string,
    eventData: Partial<Omit<CalendarEvent, 'id'>>
  ): Promise<ApiResponse<CalendarEvent>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // 実際のAPIではここでデータベースのイベントを更新
    const existingEvent = mockCalendarEvents.find(event => event.id === eventId);
    
    if (!existingEvent) {
      throw new Error('イベントが見つかりません');
    }
    
    // 更新されたイベントを作成
    const updatedEvent: CalendarEvent = {
      ...existingEvent,
      ...eventData
    };
    
    return {
      data: updatedEvent,
      message: 'イベントを更新しました'
    };
  },
  
  /**
   * イベントを削除する
   * @param eventId - 削除するイベントのID
   * @returns 処理結果
   */
  deleteEvent: async (
    eventId: string
  ): Promise<ApiResponse<null>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // 実際のAPIではここでデータベースからイベントを削除
    const existingEvent = mockCalendarEvents.find(event => event.id === eventId);
    
    if (!existingEvent) {
      throw new Error('イベントが見つかりません');
    }
    
    return {
      data: null,
      message: 'イベントを削除しました'
    };
  },
  
  /**
   * キーワードでイベントを検索する
   * @param keyword - 検索キーワード
   * @param startDate - 開始日（任意）
   * @param endDate - 終了日（任意）
   * @returns 検索結果のイベント一覧
   */
  searchEvents: async (
    keyword: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<CalendarEvent[]>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 700));
    
    // キーワードでフィルタリング
    let filteredEvents = mockCalendarEvents.filter(event => {
      return (
        event.title.toLowerCase().includes(keyword.toLowerCase()) || 
        (event.description && event.description.toLowerCase().includes(keyword.toLowerCase()))
      );
    });
    
    // 日付範囲でフィルタリング
    if (startDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = parseISO(event.start);
        return eventDate >= startDate;
      });
    }
    
    if (endDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = parseISO(event.end);
        return eventDate <= endDate;
      });
    }
    
    return {
      data: filteredEvents
    };
  },
  
  /**
   * カレンダーデータをエクスポートする
   * @param startDate - エクスポート期間の開始日
   * @param endDate - エクスポート期間の終了日
   * @returns エクスポートされたカレンダーデータ
   */
  exportCalendar: async (
    startDate: Date,
    endDate: Date
  ): Promise<ApiResponse<string>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // 期間内のイベントをフィルタリング
    const events = mockCalendarEvents.filter(event => {
      const eventDate = parseISO(event.start);
      return eventDate >= startDate && eventDate <= endDate;
    });
    
    // JSON形式でデータを返す
    const exportData = JSON.stringify({
      events,
      exportDate: new Date().toISOString(),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
    
    return {
      data: exportData,
      message: 'カレンダーデータをエクスポートしました'
    };
  },
  
  /**
   * カレンダーデータをインポートする
   * @param importData - インポートするデータ
   * @returns インポート結果
   */
  importCalendar: async (
    importData: CalendarImportData
  ): Promise<ApiResponse<{ importedCount: number }>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // 実際のAPIではここでデータベースにイベントを追加
    const importedCount = importData.events.length;
    
    return {
      data: {
        importedCount
      },
      message: `${importedCount}件のイベントをインポートしました`
    };
  },
  
  /**
   * イベントの重複をチェックする
   * @param event - チェックするイベント
   * @returns 重複イベントの一覧
   */
  checkEventConflicts: async (
    event: CalendarEvent
  ): Promise<ApiResponse<CalendarEvent[]>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const eventStart = parseISO(event.start);
    const eventEnd = parseISO(event.end);
    
    // 重複するイベントをフィルタリング
    const conflictingEvents = mockCalendarEvents.filter(existingEvent => {
      // 自分自身は除外
      if (existingEvent.id === event.id) return false;
      
      const existingStart = parseISO(existingEvent.start);
      const existingEnd = parseISO(existingEvent.end);
      
      // 時間が重複するかチェック
      return (
        (eventStart >= existingStart && eventStart < existingEnd) || // イベント開始が既存イベント中
        (eventEnd > existingStart && eventEnd <= existingEnd) || // イベント終了が既存イベント中
        (eventStart <= existingStart && eventEnd >= existingEnd) // イベントが既存イベントを包含
      );
    });
    
    return {
      data: conflictingEvents
    };
  }
};
