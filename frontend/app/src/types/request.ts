/**
 * リクエストの型定義
 */
export interface Request {
  id: string;
  title: string;
  description: string;
  type: 'cooking' | 'errand' | 'other';
  userId: string;
  userName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  createdAt: string; // ISO 8601形式の日付文字列
  dueDate?: string; // ISO 8601形式の日付文字列
  recipeUrl?: string; // 料理リクエストの場合のレシピURL
  ingredients?: string[]; // 料理リクエストの場合の食材リスト
  images?: string[]; // 添付画像のURL
  comments?: RequestComment[]; // コメント
  feedbackId?: string; // フィードバックがある場合のID
}

/**
 * リクエストコメントの型定義
 */
export interface RequestComment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userType: 'user' | 'helper' | 'admin';
  content: string;
  createdAt: string; // ISO 8601形式の日付文字列
}
