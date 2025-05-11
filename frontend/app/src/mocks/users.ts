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

/**
 * モックの担当ユーザーデータ
 */
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '田中 太郎',
    address: '東京都新宿区新宿1-1-1',
    phone: '03-1234-5678',
    email: 'tanaka@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user1',
    pendingRequests: 3,
  },
  {
    id: 'user-2',
    name: '佐藤 花子',
    address: '東京都渋谷区渋谷2-2-2',
    phone: '03-2345-6789',
    email: 'sato@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user2',
    pendingRequests: 1,
  },
  {
    id: 'user-3',
    name: '鈴木 一郎',
    address: '東京都品川区品川3-3-3',
    phone: '03-3456-7890',
    email: 'suzuki@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user3',
    pendingRequests: 0,
  },
  {
    id: 'user-4',
    name: '高橋 真理',
    address: '東京都目黒区目黒4-4-4',
    phone: '03-4567-8901',
    email: 'takahashi@example.com',
    pendingRequests: 2,
  },
  {
    id: 'user-5',
    name: '伊藤 健太',
    address: '東京都港区港5-5-5',
    phone: '03-5678-9012',
    email: 'ito@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user5',
    pendingRequests: 4,
  }
];
