// ログレベル
export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// 基本ログペイロード
export interface BaseLogPayload {
  timestamp?: string;      // ISO形式の日時（未設定時は送信時に自動設定）
  sessionId: string;       // セッションID
  userId?: number;         // ユーザーID（認証済みの場合）
  userAgent?: string;      // ユーザーエージェント
  location: string;        // 現在のURL
  clientInfo?: {           // クライアント情報
    browser: string;       // ブラウザ名
    browserVersion: string;// ブラウザバージョン
    os: string;            // OS
    deviceType: string;    // デバイスタイプ（desktop, tablet, mobile）
    screenSize: string;    // 画面サイズ
  };
}

// アプリケーションログペイロード
export interface AppLogPayload extends BaseLogPayload {
  level: LogLevel;         // ログレベル
  source: string;          // ログソース（コンポーネント名など）
  message: string;         // ログメッセージ
  stack?: string;          // スタックトレース（エラー時）
  additionalData?: any;    // 追加データ
}

// ユーザーアクションログペイロード
export interface UserActionPayload extends BaseLogPayload {
  action: string;          // アクション名（CLICK, SUBMIT, NAVIGATEなど）
  element?: string;        // 操作対象要素
  elementId?: string;      // 要素ID
  resourceType?: string;   // リソースタイプ（PAGE, FORM, BUTTONなど）
  resourceId?: string;     // リソースID
  previousState?: any;     // 変更前の状態（該当する場合）
  newState?: any;          // 変更後の状態（該当する場合）
  metadata?: any;          // その他のメタデータ
}

// パフォーマンスログペイロード
export interface PerformancePayload extends BaseLogPayload {
  pageUrl: string;         // ページURL
  loadTime: number;        // ページロード時間（ms）
  domContentLoaded?: number;// DOMContentLoadedイベント時間（ms）
  firstPaint?: number;     // 初回描画時間（ms）
  firstContentfulPaint?: number; // 初回意味のある描画時間（ms）
  largestContentfulPaint?: number; // 最大コンテンツ描画時間（ms）
  firstInputDelay?: number;// 初回入力遅延（ms）
  cumulativeLayoutShift?: number; // 累積レイアウトシフト
  resourceLoadTimes?: {    // リソース読み込み時間
    [key: string]: number; // リソース名: 読み込み時間（ms）
  };
  apiCallTimes?: {         // API呼び出し時間
    endpoint: string;      // エンドポイント
    method: string;        // HTTPメソッド
    duration: number;      // 所要時間（ms）
    status: number;        // HTTPステータスコード
  }[];
  memoryUsage?: number;    // メモリ使用量（MB）
}

// ログペイロード型
export type LogPayload = AppLogPayload | UserActionPayload | PerformancePayload;

// ログタイプ
export enum LogType {
  APP = 'application',
  USER_ACTION = 'audit',
  PERFORMANCE = 'performance'
}

// ログエントリ
export interface LogEntry {
  type: LogType;
  payload: LogPayload;
  timestamp: number;       // エポックミリ秒
  sendAttempts?: number;   // 送信試行回数
  priority: number;        // 優先度（高いほど優先）
}

// ログ転送設定
export interface LogTransportConfig {
  batchSize: number;       // 一度に送信するログの最大数
  maxBufferSize: number;   // バッファの最大サイズ
  flushInterval: number;   // 定期送信の間隔（ms）
  retryLimit: number;      // 再試行の最大回数
  retryInterval: number;   // 再試行の間隔（ms）
  endpoint: string;        // ログ送信先エンドポイント
}