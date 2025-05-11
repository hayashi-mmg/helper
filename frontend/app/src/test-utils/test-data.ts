// テスト用のモックデータ生成関数
import { format } from 'date-fns';
import {
  User,
  UserSummary,
  Request,
  RequestStatus,
  RequestType,
  Helper,
  HelperStatus,
  HelperSkill,
} from '../features/user/types';

// 日付生成ヘルパー関数
const generateDate = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// ユーザーモックデータ生成
export const mockUser = (overrides = {}): User => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  firstName: '太郎',
  lastName: '山田',
  profileImage: 'https://example.com/profile.jpg',
  createdAt: generateDate(-30),
  updatedAt: generateDate(-5),
  ...overrides,
});

// ユーザーサマリーモックデータ生成
export const mockUserSummary = (overrides = {}): UserSummary => ({
  totalRequests: 10,
  activeRequests: 3,
  completedRequests: 5,
  favoriteHelpers: 2,
  ...overrides,
});

// リクエストモックデータ生成
export const mockRequest = (overrides = {}): Request => ({
  id: '1',
  userId: '1',
  title: 'テストリクエスト',
  description: 'これはテスト用のリクエストです。',
  type: RequestType.COOKING,
  status: RequestStatus.PENDING,
  scheduledDate: generateDate(1),
  createdAt: generateDate(-2),
  updatedAt: generateDate(-1),
  estimatedDuration: 60,
  ...overrides,
});

// リクエスト配列モックデータ生成
export const mockRequestArray = (count = 3): Request[] => {
  return Array(count)
    .fill(null)
    .map((_, index) => mockRequest({
      id: `${index + 1}`,
      title: `テストリクエスト ${index + 1}`,
      status: [
        RequestStatus.PENDING,
        RequestStatus.ACCEPTED,
        RequestStatus.INPROGRESS,
        RequestStatus.COMPLETED,
        RequestStatus.CANCELLED,
      ][index % 5],
      type: [
        RequestType.COOKING,
        RequestType.ERRAND,
        RequestType.CLEANING,
        RequestType.OTHER,
      ][index % 4],
      scheduledDate: generateDate(index + 1),
    }));
};

// ヘルパーモックデータ生成
export const mockHelper = (overrides = {}): Helper => ({
  id: '1',
  firstName: '花子',
  lastName: '佐藤',
  email: 'helper@example.com',
  phoneNumber: '090-1234-5678',
  profileImage: 'https://example.com/helper.jpg',
  status: HelperStatus.ACTIVE,
  skills: [HelperSkill.COOKING, HelperSkill.CLEANING],
  rating: 4.5,
  createdAt: generateDate(-60),
  updatedAt: generateDate(-3),
  ...overrides,
});
