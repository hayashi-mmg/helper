/**
 * タスクの種類
 */
export type TaskType = 'cooking' | 'errand' | 'cleaning' | 'other';

/**
 * タスクの優先度
 */
export type TaskPriority = 'high' | 'medium' | 'low';

/**
 * タスクのステータス
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * タスクの型定義
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // ISO 8601形式の日付文字列
  createdAt: string; // ISO 8601形式の日付文字列
  recipeUrl?: string;
  notes?: string;
}
