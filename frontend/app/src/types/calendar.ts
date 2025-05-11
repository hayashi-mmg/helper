/**
 * カレンダーイベントの型定義
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601形式の日付文字列
  end: string; // ISO 8601形式の日付文字列
  allDay?: boolean;
  type: 'task' | 'appointment' | 'other';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  userId?: string;
  userName?: string;
  location?: string;
  description?: string;
  color?: string;
}
