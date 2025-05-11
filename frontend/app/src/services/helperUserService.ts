import { User, mockUsers } from '../mocks/users';
import { ApiResponse, PaginatedResponse } from '../types/api';

/**
 * ヘルパー用のユーザーサービス
 * ヘルパーが担当するユーザーに関する操作を提供
 */
export const helperUserService = {
  /**
   * ヘルパーの担当ユーザー一覧を取得する
   * @param helperId - ヘルパーID
   * @param page - ページ番号
   * @param size - 1ページあたりの件数
   * @returns 担当ユーザーのページネーション情報
   */
  getAssignedUsers: async (
    helperId: string,
    page = 1,
    size = 10
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // モックデータで返却
    const start = (page - 1) * size;
    const end = start + size;
    const paginatedItems = mockUsers.slice(start, end);
    const total = mockUsers.length;
    
    return {
      data: {
        items: paginatedItems,
        total,
        page,
        size,
        pages: Math.ceil(total / size)
      }
    };
  },
  
  /**
   * ユーザー詳細情報を取得する
   * @param userId - ユーザーID
   * @returns ユーザー情報
   */
  getUserDetails: async (userId: string): Promise<ApiResponse<User>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      data: user
    };
  }
};
