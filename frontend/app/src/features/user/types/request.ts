/**
 * リクエスト関連の型定義
 */

/**
 * リクエストのステータス
 */
export enum RequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    INPROGRESS = 'inprogress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REJECTED = 'rejected'
}

/**
 * リクエストのタイプ
 */
export enum RequestType {
    COOKING = 'cooking',
    ERRAND = 'errand',
    CLEANING = 'cleaning',
    OTHER = 'other'
}

/**
 * リクエストの基本情報
 */
export interface Request {
    id: string;
    userId: string;
    assignedHelperId?: string;
    title: string;
    description: string;
    type: RequestType;
    status: RequestStatus;
    scheduledDate: string;
    createdAt: string;
    updatedAt: string;
    estimatedDuration?: number; // 分単位
}

/**
 * 料理リクエストの詳細情報
 */
export interface CookingRequest extends Request {
    recipeUrl?: string;
    recipeDetails?: RecipeDetails;
    dietaryRestrictions?: string[];
}

/**
 * レシピの詳細情報
 */
export interface RecipeDetails {
    name: string;
    ingredients: Ingredient[];
    instructions: string[];
    servings: number;
    cookingTime: number; // 分単位
    imageUrl?: string;
}

/**
 * 食材情報
 */
export interface Ingredient {
    name: string;
    quantity?: string;
    unit?: string;
}

/**
 * お願いごとリクエストの詳細情報
 */
export interface ErrandRequest extends Request {
    location?: string;
    items?: string[];
    budget?: number;
}

/**
 * リクエスト作成時の基本情報
 */
export interface CreateRequestBase {
    title: string;
    description: string;
    type: RequestType;
    scheduledDate: string;
    estimatedDuration?: number;
}

/**
 * 料理リクエスト作成時の情報
 */
export interface CreateCookingRequest extends CreateRequestBase {
    recipeUrl?: string;
    recipeDetails?: RecipeDetails;
    dietaryRestrictions?: string[];
}

/**
 * お願いごとリクエスト作成時の情報
 */
export interface CreateErrandRequest extends CreateRequestBase {
    location?: string;
    items?: string[];
    budget?: number;
}

/**
 * リクエスト更新時の情報
 */
export interface UpdateRequestRequest {
    title?: string;
    description?: string;
    status?: RequestStatus;
    scheduledDate?: string;
    estimatedDuration?: number;
    recipeUrl?: string;
    recipeDetails?: Partial<RecipeDetails>;
    dietaryRestrictions?: string[];
    location?: string;
    items?: string[];
    budget?: number;
}

/**
 * リクエストのフィルタリング条件
 */
export interface RequestFilter {
    status?: RequestStatus;
    type?: RequestType;
    startDate?: string;
    endDate?: string;
    helperId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * リクエスト一覧のレスポンス
 */
export interface RequestListResponse {
    items: Request[];
    totalItems: number;
    page: number;
    totalPages: number;
    limit: number;
}

/**
 * フィードバック情報
 */
export interface Feedback {
    id: string;
    requestId: string;
    userId: string;
    helperId: string;
    rating: number; // 1-5
    comment?: string;
    tasteRating?: number; // 料理の場合
    presentationRating?: number; // 料理の場合
    quantityRating?: number; // 料理の場合
    improvementSuggestions?: string;
    createdAt: string;
    updatedAt: string;
}