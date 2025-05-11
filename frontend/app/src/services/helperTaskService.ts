import { Task } from '../types/task';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { mockTasks } from '../mocks/tasks';

/**
 * タスクフィルター条件の型定義
 */
export interface TaskFilter {
  status?: string[];
  type?: string[];
  priority?: string[];
  userId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  searchKeyword?: string;
}

/**
 * タスクソート条件の型定義
 */
export interface TaskSort {
  field: 'dueDate' | 'priority' | 'createdAt';
  direction: 'asc' | 'desc';
}

/**
 * ヘルパー用のタスクサービス
 */
export const helperTaskService = {
  /**
   * タスク一覧を取得する
   * @param helperId - ヘルパーID
   * @param filter - フィルター条件
   * @param sort - ソート条件
   * @param page - ページ番号
   * @param size - 1ページあたりの件数
   * @returns タスクのページネーション情報
   */
  getTasks: async (
    helperId: string,
    filter: TaskFilter = {},
    sort: TaskSort = { field: 'dueDate', direction: 'asc' },
    page = 1,
    size = 10
  ): Promise<ApiResponse<PaginatedResponse<Task>>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // フィルタリング
    let filteredTasks = [...mockTasks];
    
    if (filter.status && filter.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filter.status?.includes(task.status)
      );
    }
    
    if (filter.type && filter.type.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filter.type?.includes(task.type)
      );
    }
    
    if (filter.priority && filter.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filter.priority?.includes(task.priority)
      );
    }
    
    if (filter.userId) {
      filteredTasks = filteredTasks.filter(task => 
        task.userId === filter.userId
      );
    }
    
    if (filter.dueDateFrom) {
      filteredTasks = filteredTasks.filter(task => 
        new Date(task.dueDate) >= new Date(filter.dueDateFrom || '')
      );
    }
    
    if (filter.dueDateTo) {
      filteredTasks = filteredTasks.filter(task => 
        new Date(task.dueDate) <= new Date(filter.dueDateTo || '')
      );
    }
    
    if (filter.searchKeyword) {
      const keyword = filter.searchKeyword.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword) ||
        task.userName.toLowerCase().includes(keyword)
      );
    }
    
    // ソート
    filteredTasks.sort((a, b) => {
      if (sort.field === 'dueDate') {
        return sort.direction === 'asc'
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      
      if (sort.field === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sort.direction === 'asc'
          ? (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
          : (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }
      
      if (sort.field === 'createdAt') {
        return sort.direction === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      return 0;
    });
    
    // ページネーション
    const start = (page - 1) * size;
    const end = start + size;
    const paginatedItems = filteredTasks.slice(start, end);
    const total = filteredTasks.length;
    
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
   * タスク詳細を取得する
   * @param taskId - タスクID
   * @returns タスク詳細情報
   */
  getTaskDetails: async (taskId: string): Promise<ApiResponse<Task>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    return {
      data: task
    };
  },
  
  /**
   * タスクのステータスを更新する
   * @param taskId - タスクID
   * @param status - 新しいステータス
   * @returns 更新されたタスク
   */
  updateTaskStatus: async (
    taskId: string,
    status: string
  ): Promise<ApiResponse<Task>> => {
    // APIリクエストをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    // モックデータを更新
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      status: status as any
    };
    
    return {
      data: mockTasks[taskIndex],
      message: 'タスク状態を更新しました'
    };
  }
};
