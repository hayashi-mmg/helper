import { Task, TaskPriority, TaskType } from '../types/task';

/**
 * モックのタスクデータ
 */
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: '肉じゃがの調理',
    description: '祖母の味を再現した肉じゃがを作ってください。',
    type: 'cooking',
    userId: 'user-1',
    userName: '田中 太郎',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=user1',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-05-15T18:00:00Z',
    createdAt: '2025-05-08T09:00:00Z',
    recipeUrl: 'https://cookpad.com/recipe/123456',
  },
  {
    id: 'task-2',
    title: 'カレーライスの調理',
    description: '辛さ控えめでお願いします。玉ねぎは大きめに切ってください。',
    type: 'cooking',
    userId: 'user-2',
    userName: '佐藤 花子',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=user2',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2025-05-14T17:30:00Z',
    createdAt: '2025-05-07T10:15:00Z',
    recipeUrl: 'https://cookpad.com/recipe/789012',
  },
  {
    id: 'task-3',
    title: '郵便物の投函',
    description: '封筒に入った手紙を近くの郵便ポストに投函してください。',
    type: 'errand',
    userId: 'user-1',
    userName: '田中 太郎',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=user1',
    priority: 'low',
    status: 'pending',
    dueDate: '2025-05-16T12:00:00Z',
    createdAt: '2025-05-09T14:20:00Z',
  },
  {
    id: 'task-4',
    title: '野菜の買い物',
    description: '近くのスーパーでじゃがいも、にんじん、玉ねぎを購入してください。',
    type: 'errand',
    userId: 'user-3',
    userName: '鈴木 一郎',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=user3',
    priority: 'medium',
    status: 'pending',
    dueDate: '2025-05-13T10:00:00Z',
    createdAt: '2025-05-08T16:30:00Z',
  },
  {
    id: 'task-5',
    title: 'リビングの掃除',
    description: '床の掃除機がけと拭き掃除をお願いします。',
    type: 'cleaning',
    userId: 'user-4',
    userName: '高橋 真理',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-05-12T15:00:00Z',
    createdAt: '2025-05-06T11:45:00Z',
  },
  {
    id: 'task-6',
    title: '照り焼きチキンの調理',
    description: '甘めの味付けでお願いします。付け合わせにブロッコリーも茹でてください。',
    type: 'cooking',
    userId: 'user-5',
    userName: '伊藤 健太',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=user5',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-05-12T18:30:00Z',
    createdAt: '2025-05-07T08:20:00Z',
    recipeUrl: 'https://cookpad.com/recipe/345678',
  },
  {
    id: 'task-7',
    title: '洗濯物の取り込み',
    description: '雨が降りそうなので、ベランダの洗濯物を取り込んでおいてください。',
    type: 'other',
    userId: 'user-2',
    userName: '佐藤 花子',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=user2',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-05-11T16:00:00Z',
    createdAt: '2025-05-11T08:30:00Z',
  }
];

/**
 * タスク種類の日本語表示テキスト
 */
export const taskTypeLabels: Record<TaskType, string> = {
  cooking: '料理',
  errand: 'お使い',
  cleaning: '掃除',
  other: 'その他'
};

/**
 * タスク優先度の日本語表示テキスト
 */
export const taskPriorityLabels: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低'
};

/**
 * タスク優先度のカラースキーム
 */
export const taskPriorityColors: Record<TaskPriority, string> = {
  high: 'red',
  medium: 'orange',
  low: 'green'
};

/**
 * タスク種類のアイコンマッピング
 * HeroIconsのESMインポートを想定
 */
export const taskTypeIcons: Record<TaskType, string> = {
  cooking: 'FireIcon',
  errand: 'ShoppingBagIcon',
  cleaning: 'SparklesIcon',
  other: 'DocumentTextIcon'
};
