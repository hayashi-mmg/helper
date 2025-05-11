/**
 * 担当ユーザーの型定義
 */
export interface User {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  pendingRequests: number;
}
