import { api } from '@lib/axios';

// 認証関連のAPI
export const authService = {
  login: (credentials: { username: string; password: string }) => 
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials),
  
  register: (userData: { username: string; email: string; password: string; role: 'user' | 'helper' }) =>
    api.post<ApiResponse<User>>('/auth/register', userData),
  
  logout: () => 
    api.post<ApiResponse<null>>('/auth/logout'),
  
  resetPassword: (email: string) => 
    api.post<ApiResponse<null>>('/auth/reset-password', { email }),
  
  getCurrentUser: () => 
    api.get<ApiResponse<User>>('/auth/me')
};

// ユーザー関連のAPI
export const userService = {
  getProfile: () => 
    api.get<ApiResponse<User>>('/users/profile'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<ApiResponse<User>>('/users/profile', data),
  
  getHelpers: () => 
    api.get<ApiResponse<Helper[]>>('/users/helpers'),
  
  addHelper: (helperData: { name: string; email: string; phone?: string }) => 
    api.post<ApiResponse<Helper>>('/users/helpers', helperData),
  
  updateHelper: (id: number, helperData: Partial<Helper>) => 
    api.put<ApiResponse<Helper>>(`/users/helpers/${id}`, helperData),
  
  deleteHelper: (id: number) => 
    api.delete<ApiResponse<null>>(`/users/helpers/${id}`)
};

// リクエスト関連のAPI
export const requestService = {
  getRequests: (params?: { status?: string; helperId?: number; page?: number; pageSize?: number }) => 
    api.get<PaginatedResponse<Request>>('/requests', { params }),
  
  getRequest: (id: number) => 
    api.get<ApiResponse<Request>>(`/requests/${id}`),
  
  createRequest: (requestData: { title: string; content: string; recipeUrl?: string }) => 
    api.post<ApiResponse<Request>>('/requests', requestData),
  
  updateRequest: (id: number, requestData: Partial<Request>) => 
    api.put<ApiResponse<Request>>(`/requests/${id}`, requestData),
  
  deleteRequest: (id: number) => 
    api.delete<ApiResponse<null>>(`/requests/${id}`),
  
  changeRequestStatus: (id: number, status: Request['status']) => 
    api.patch<ApiResponse<Request>>(`/requests/${id}/status`, { status })
};

// フィードバック関連のAPI
export const feedbackService = {
  getFeedbacks: (params?: { requestId?: number; page?: number; pageSize?: number }) => 
    api.get<PaginatedResponse<Feedback>>('/feedbacks', { params }),
  
  getFeedback: (id: number) => 
    api.get<ApiResponse<Feedback>>(`/feedbacks/${id}`),
  
  createFeedback: (feedbackData: { 
    requestId: number; 
    taste: number; 
    texture: number; 
    amount: number; 
    comment?: string; 
    nextRequest?: string 
  }) => 
    api.post<ApiResponse<Feedback>>('/feedbacks', feedbackData),
  
  uploadFeedbackImage: (id: number, formData: FormData) => 
    api.post<ApiResponse<{ imageUrl: string }>>(`/feedbacks/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  replyToFeedback: (id: number, reply: string) => 
    api.post<ApiResponse<Feedback>>(`/feedbacks/${id}/reply`, { reply })
};

// QRコード関連のAPI
export const qrcodeService = {
  generateQRCode: (data: { url: string; title: string; expiration?: number }) => 
    api.post<ApiResponse<{ qrcodeImageUrl: string; expireAt?: string }>>('/qrcode/generate', data),
  
  getQRCodes: () => 
    api.get<ApiResponse<{ id: number; url: string; title: string; createdAt: string; expireAt?: string }[]>>('/qrcode')
};

// ログ関連のAPI (管理者用)
export const logService = {
  getApplicationLogs: (params?: { 
    level?: string; 
    source?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    pageSize?: number 
  }) => 
    api.get<PaginatedResponse<any>>('/logs/application', { params }),
  
  getAuditLogs: (params?: { 
    userId?: number;
    action?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    pageSize?: number 
  }) => 
    api.get<PaginatedResponse<any>>('/logs/audit', { params }),
  
  getPerformanceLogs: (params?: { 
    endpoint?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    pageSize?: number 
  }) => 
    api.get<PaginatedResponse<any>>('/logs/performance', { params }),
  
  getPerformanceSummary: (params?: { 
    endpoint?: string;
    startTime?: string;
    endTime?: string;
  }) => 
    api.get<ApiResponse<any>>('/logs/performance/summary', { params })
};
