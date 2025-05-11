/**
 * ヘルパー関連の型定義
 */

/**
 * ヘルパーの状態
 */
export enum HelperStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ONLEAVE = 'on_leave'
}

/**
 * ヘルパーのスキル
 */
export enum HelperSkill {
    COOKING = 'cooking',
    ERRAND = 'errand',
    CLEANING = 'cleaning',
    ELDERCARE = 'eldercare',
    CHILDCARE = 'childcare',
    OTHER = 'other'
}

/**
 * ヘルパー情報の型定義
 */
export interface Helper {
    id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
    status: HelperStatus;
    skills: HelperSkill[];
    rating?: number;
    availability?: Availability;
    createdAt: string;
    updatedAt: string;
}

/**
 * ヘルパーの稼働可能時間
 */
export interface Availability {
    monday?: TimeSlot[];
    tuesday?: TimeSlot[];
    wednesday?: TimeSlot[];
    thursday?: TimeSlot[];
    friday?: TimeSlot[];
    saturday?: TimeSlot[];
    sunday?: TimeSlot[];
}

/**
 * 時間枠
 */
export interface TimeSlot {
    start: string; // HH:MM形式
    end: string;   // HH:MM形式
}

/**
 * ヘルパー作成時のリクエスト情報
 */
export interface CreateHelperRequest {
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
    skills: HelperSkill[];
    availability?: Availability;
}

/**
 * ヘルパー更新時のリクエスト情報
 */
export interface UpdateHelperRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string;
    status?: HelperStatus;
    skills?: HelperSkill[];
    availability?: Availability;
}
