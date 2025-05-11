/**
 * ユーザー関連の型定義
 */

/**
 * ユーザー情報の型定義
 */
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
    preferences?: UserPreferences;
}

/**
 * ユーザーの詳細情報
 */
export interface UserDetail extends User {
    address?: string;
    phoneNumber?: string;
    birthDate?: string;
    emergencyContact?: string;
}

/**
 * ユーザー作成時のリクエスト情報
 */
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
}

/**
 * ユーザー更新時のリクエスト情報
 */
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImage?: string;
    address?: string;
    phoneNumber?: string;
    birthDate?: string;
    emergencyContact?: string;
    preferences?: UserPreferences;
}

/**
 * ユーザーの設定情報
 */
export interface UserPreferences {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    language?: string;
}

/**
 * ユーザーサマリー情報
 */
export interface UserSummary {
    totalRequests: number;
    activeRequests: number;
    completedRequests: number;
    favoriteHelpers: number;
}

/**
 * ユーザーの設定情報
 */
export interface UserSettings {
    notificationPreferences: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    theme: 'light' | 'dark' | 'system';
    language: string;
    privacySettings: {
        showProfile: boolean;
        shareContactInfo: boolean;
    };
}