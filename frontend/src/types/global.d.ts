// グローバル型定義

// ログインユーザー情報
interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'helper' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ヘルパー情報
interface Helper {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// リクエスト（料理など）
interface Request {
  id: number;
  title: string;
  content: string;
  recipeUrl?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  userId: number;
  helperId?: number;
  createdAt: string;
  updatedAt: string;
}

// フィードバック
interface Feedback {
  id: number;
  requestId: number;
  taste: number; // 1-5の評価
  texture: number; // 1-5の評価
  amount: number; // 1-5の評価
  comment?: string;
  nextRequest?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  reply?: string;
  replyAt?: string;
}

// APIレスポンスの基本型
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ページネーション情報
interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ページネーション付きレスポンス
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}
