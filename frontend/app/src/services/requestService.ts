import { Request } from '../types/request';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { mockRequests } from '../mocks/requests';

/**
 * リクエストフィルター条件の型定義
 */
export interface RequestFilter {
  status?: string[];
  type?: string[];
  userId?: string;
  searchKeyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * リクエストサービス
 * ヘルパーがユーザーのリクエストを取得、更新するためのサービス
 */
export const requestService = {
  /**
   * ユーザー別のリクエスト一覧を取得する
   * @param userId - ユーザーID（指定しない場合は全ユーザー）
   * @param filter - フィルター条件
   * @param page - ページ番号
   * @param size - 1ページあたりの件数
   * @returns リクエストのページネーション情報
   */
  getUserRequests: async (
    userId?: string,
    filter: RequestFilter = {},
    page = 1,
    size = 10
  ): Promise<ApiResponse<PaginatedResponse<Request>>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // フィルタリング
    let filteredRequests = [...mockRequests];
    
    if (userId) {
      filteredRequests = filteredRequests.filter(req => req.userId === userId);
    }
    
    if (filter.status && filter.status.length > 0) {
      filteredRequests = filteredRequests.filter(req => 
        filter.status?.includes(req.status)
      );
    }
    
    if (filter.type && filter.type.length > 0) {
      filteredRequests = filteredRequests.filter(req => 
        filter.type?.includes(req.type)
      );
    }
    
    if (filter.searchKeyword) {
      const keyword = filter.searchKeyword.toLowerCase();
      filteredRequests = filteredRequests.filter(req => 
        req.title.toLowerCase().includes(keyword) ||
        req.description.toLowerCase().includes(keyword) ||
        (req.ingredients && req.ingredients.some(i => i.toLowerCase().includes(keyword)))
      );
    }
    
    if (filter.dateFrom) {
      filteredRequests = filteredRequests.filter(req => 
        req.createdAt >= filter.dateFrom
      );
    }
    
    if (filter.dateTo) {
      filteredRequests = filteredRequests.filter(req => 
        req.createdAt <= filter.dateTo
      );
    }
    
    // ページネーション
    const start = (page - 1) * size;
    const end = start + size;
    const paginatedItems = filteredRequests.slice(start, end);
    const total = filteredRequests.length;
    
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
   * リクエスト詳細を取得する
   * @param requestId - リクエストID
   * @returns リクエスト詳細情報
   */
  getRequestDetails: async (requestId: string): Promise<ApiResponse<Request>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const request = mockRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Request not found');
    }
    
    return {
      data: request
    };
  },
  
  /**
   * リクエストのステータスを更新する
   * @param requestId - リクエストID
   * @param status - 新しいステータス
   * @param comment - 更新時のコメント
   * @returns 更新されたリクエスト
   */
  updateRequestStatus: async (
    requestId: string,
    status: string,
    comment?: string
  ): Promise<ApiResponse<Request>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const requestIndex = mockRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }
    
    // モックデータを更新
    mockRequests[requestIndex] = {
      ...mockRequests[requestIndex],
      status: status as any
    };
    
    // コメントがある場合はコメントも追加
    if (comment) {
      const newComment = {
        id: `comment-${Date.now()}`,
        requestId,
        userId: 'helper-1', // 仮のヘルパーID
        userName: '山田 太郎', // 仮のヘルパー名
        userType: 'helper',
        content: comment,
        createdAt: new Date().toISOString()
      };
      
      if (!mockRequests[requestIndex].comments) {
        mockRequests[requestIndex].comments = [];
      }
      
      mockRequests[requestIndex].comments!.push(newComment);
    }
    
    return {
      data: mockRequests[requestIndex],
      message: 'リクエスト状態を更新しました'
    };
  },
  
  /**
   * リクエストにコメントを追加する
   * @param requestId - リクエストID
   * @param comment - コメント内容
   * @returns 更新されたリクエスト
   */
  addRequestComment: async (
    requestId: string,
    comment: string
  ): Promise<ApiResponse<Request>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const requestIndex = mockRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Request not found');
    }
    
    const newComment = {
      id: `comment-${Date.now()}`,
      requestId,
      userId: 'helper-1', // 仮のヘルパーID
      userName: '山田 太郎', // 仮のヘルパー名
      userType: 'helper',
      content: comment,
      createdAt: new Date().toISOString()
    };
    
    if (!mockRequests[requestIndex].comments) {
      mockRequests[requestIndex].comments = [];
    }
    
    mockRequests[requestIndex].comments!.push(newComment);
    
    return {
      data: mockRequests[requestIndex],
      message: 'コメントを追加しました'
    };
  }
};
