import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiError, getAuthErrorMessage, ApiErrorType } from './errorHandler';
import axios, { AxiosError } from 'axios';

// Axiosをモック
vi.mock('axios', () => {
  return {
    isAxiosError: vi.fn(),
    default: {
      isAxiosError: vi.fn(),
    },
  };
});

describe('errorHandler', () => {
  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('ネットワークエラーを正しく処理する', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(true);
      
      const networkError = {
        isAxiosError: true,
        response: undefined,
        message: 'Network Error',
      } as AxiosError;

      const result = handleApiError(networkError);
      
      expect(result).toEqual({
        type: ApiErrorType.NETWORK,
        message: 'サーバーに接続できません。インターネット接続を確認してください',
      });
    });

    it('タイムアウトエラーを正しく処理する', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(true);
      
      const timeoutError = {
        isAxiosError: true,
        response: { status: 408, data: {} },
        message: 'timeout of 10000ms exceeded',
        code: 'ECONNABORTED',
      } as unknown as AxiosError;

      const result = handleApiError(timeoutError);
      
      expect(result).toEqual({
        type: ApiErrorType.TIMEOUT,
        message: 'サーバーからの応答がタイムアウトしました。後でもう一度お試しください',
      });
    });

    it('401エラー（認証エラー）を正しく処理する', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(true);
      
      const authError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { detail: 'Invalid credentials' },
        },
      } as unknown as AxiosError;

      const result = handleApiError(authError);
      
      expect(result).toEqual({
        type: ApiErrorType.AUTH,
        message: 'メールアドレスまたはパスワードが正しくありません',
        code: 401,
      });
    });

    it('バリデーションエラーを正しく処理する', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(true);
      
      const validationError = {
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            detail: [
              {
                loc: ['body', 'email'],
                msg: 'value is not a valid email address',
                type: 'value_error.email',
              },
            ],
          },
        },
      } as unknown as AxiosError;

      const result = handleApiError(validationError);
      
      expect(result.type).toBe(ApiErrorType.VALIDATION);
      expect(result.code).toBe(422);
      expect(result.message).toBe('email: value is not a valid email address');
      expect(result.details).toHaveProperty('email');
    });

    it('サーバーエラーを正しく処理する', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(true);
      
      const serverError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
        },
      } as unknown as AxiosError;

      const result = handleApiError(serverError);
      
      expect(result).toEqual({
        type: ApiErrorType.SERVER,
        message: 'サーバーエラーが発生しました。後でもう一度お試しください',
        code: 500,
      });
    });

    it('一般的なErrorオブジェクトを正しく処理する', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(false);
      
      const generalError = new Error('Something went wrong');

      const result = handleApiError(generalError);
      
      expect(result).toEqual({
        type: ApiErrorType.UNKNOWN,
        message: 'Something went wrong',
      });
    });

    it('未知のエラーを正しく処理する', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(false);
      
      const unknownError = 'this is not an error object';

      const result = handleApiError(unknownError);
      
      expect(result).toEqual({
        type: ApiErrorType.UNKNOWN,
        message: '予期しないエラーが発生しました。後でもう一度お試しください',
      });
    });
  });

  describe('getAuthErrorMessage', () => {
    it('ログインコンテキストで認証エラーに対して適切なメッセージを返す', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(true);
      
      const authError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { detail: 'Invalid credentials' },
        },
      } as unknown as AxiosError;

      const message = getAuthErrorMessage(authError, 'login');
      
      expect(message).toBe('メールアドレスまたはパスワードが正しくありません');
    });

    it('登録コンテキストでメールアドレス重複エラーに対して適切なメッセージを返す', () => {
      // カスタムエラーオブジェクト
      const emailExistsError = new Error('Email already exists');

      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(false);

      const message = getAuthErrorMessage(emailExistsError, 'register');
      
      expect(message).toContain('メールアドレスは既に登録されています');
    });

    it('パスワードリセットコンテキストでバリデーションエラーに対して適切なメッセージを返す', () => {
      // モックの設定
      (axios.isAxiosError as any).mockReturnValue(true);
      
      const validationError = {
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            detail: [
              {
                loc: ['body', 'email'],
                msg: 'value is not a valid email address',
                type: 'value_error.email',
              },
            ],
          },
        },
      } as unknown as AxiosError;

      const message = getAuthErrorMessage(validationError, 'reset');
      
      expect(message).toBe('メールアドレスの形式が正しくありません');
    });
  });
});
