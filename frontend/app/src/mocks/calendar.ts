import { CalendarEvent } from '../types/calendar';
import { Task } from '../types/task';
import { mockTasks } from './tasks';

/**
 * モックのカレンダーイベントデータ
 * タスク以外のイベント（定期訪問、ミーティングなど）
 */
export const mockEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: '定期訪問 - 田中家',
    start: '2025-05-12T10:00:00Z',
    end: '2025-05-12T12:00:00Z',
    type: 'appointment',
    userId: 'user-1',
    userName: '田中 太郎',
    location: '東京都新宿区新宿1-1-1',
    description: '週次の定期訪問',
    color: '#3182ce',
  },
  {
    id: 'event-2',
    title: '定期訪問 - 佐藤家',
    start: '2025-05-13T14:00:00Z',
    end: '2025-05-13T16:00:00Z',
    type: 'appointment',
    userId: 'user-2',
    userName: '佐藤 花子',
    location: '東京都渋谷区渋谷2-2-2',
    description: '週次の定期訪問',
    color: '#3182ce',
  },
  {
    id: 'event-3',
    title: '支援センターミーティング',
    start: '2025-05-14T09:00:00Z',
    end: '2025-05-14T10:30:00Z',
    type: 'other',
    location: '支援センター会議室',
    description: '月次の進捗報告会',
    color: '#805ad5',
  },
  {
    id: 'event-4',
    title: '休暇',
    start: '2025-05-18T00:00:00Z',
    end: '2025-05-19T23:59:59Z',
    allDay: true,
    type: 'other',
    description: '個人的な休暇',
    color: '#e53e3e',
  },
  {
    id: 'event-5',
    title: '定期訪問 - 鈴木家',
    start: '2025-05-16T13:00:00Z',
    end: '2025-05-16T15:00:00Z',
    type: 'appointment',
    userId: 'user-3',
    userName: '鈴木 一郎',
    location: '東京都品川区品川3-3-3',
    description: '週次の定期訪問',
    color: '#3182ce',
  },
];

/**
 * タスクをカレンダーイベント形式に変換する
 */
export const tasksToEvents = (tasks: Task[]): CalendarEvent[] => {
  return tasks.map(task => {
    // 優先度に応じた色を設定
    let color = '#38a169'; // 低優先度: 緑
    if (task.priority === 'high') {
      color = '#e53e3e'; // 高優先度: 赤
    } else if (task.priority === 'medium') {
      color = '#dd6b20'; // 中優先度: オレンジ
    }
    
    // タスクの所要時間を仮定（タイプによって異なる時間）
    const startDate = new Date(task.dueDate);
    const endDate = new Date(task.dueDate);
    
    if (task.type === 'cooking') {
      endDate.setHours(endDate.getHours() + 2); // 料理は2時間と仮定
    } else if (task.type === 'cleaning') {
      endDate.setHours(endDate.getHours() + 1); // 掃除は1時間と仮定
    } else {
      endDate.setHours(endDate.getHours() + 0.5); // その他は30分と仮定
    }
    
    return {
      id: `task-${task.id}`,
      title: task.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      type: 'task',
      status: task.status,
      priority: task.priority,
      userId: task.userId,
      userName: task.userName,
      description: task.description,
      color
    };
  });
};

/**
 * モックのカレンダーイベント（タスクとその他のイベントを結合）
 */
export const mockCalendarEvents = [
  ...mockEvents,
  ...tasksToEvents(mockTasks)
];
