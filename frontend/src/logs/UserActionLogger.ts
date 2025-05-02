import { UserActionPayload, LogType } from './types';
import { LogTransport } from './LogTransport';
import { getClientInfo, getSessionId } from './utils';

export class UserActionLogger {
  private transport: LogTransport;

  constructor(transport: LogTransport) {
    this.transport = transport;
  }

  // ユーザーアクションを記録
  public logAction(
    action: string,
    element?: string,
    elementId?: string,
    resourceType?: string,
    resourceId?: string,
    previousState?: any,
    newState?: any,
    metadata?: any
  ): void {
    const userId = this.getUserId();
    const sessionId = getSessionId();
    
    const payload: UserActionPayload = {
      action,
      element,
      elementId,
      resourceType,
      resourceId,
      previousState,
      newState,
      metadata,
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      location: window.location.href,
      userAgent: navigator.userAgent,
      clientInfo: getClientInfo()
    };
    
    this.transport.addLog({
      type: LogType.USER_ACTION,
      payload,
      timestamp: Date.now(),
      priority: 50 // 標準優先度
    });
  }

  // クリック操作を記録
  public logClick(
    element: string,
    elementId?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any
  ): void {
    this.logAction('CLICK', element, elementId, resourceType, resourceId, null, null, metadata);
  }

  // フォーム送信を記録
  public logSubmit(
    formId: string,
    formData: any,
    resourceType?: string,
    resourceId?: string
  ): void {
    // 機密情報（パスワードなど）をフィルタリング
    const safeFormData = this.sanitizeFormData(formData);
    
    this.logAction('SUBMIT', 'FORM', formId, resourceType, resourceId, null, safeFormData);
  }

  // ページナビゲーションを記録
  public logNavigation(
    fromPath: string,
    toPath: string,
    navigationMethod: 'LINK' | 'REDIRECT' | 'HISTORY' | 'DIRECT' = 'LINK'
  ): void {
    this.logAction('NAVIGATE', 'PAGE', undefined, 'PAGE', undefined, 
      { path: fromPath }, 
      { path: toPath }, 
      { navigationMethod }
    );
  }

  // ユーザーIDを取得（認証情報から）
  private getUserId(): number | undefined {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      return authData.user?.id;
    } catch (e) {
      return undefined;
    }
  }

  // 機密情報をフィルタリング
  private sanitizeFormData(formData: any): any {
    if (!formData) return formData;
    
    const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'passwordConfirmation', 'credit_card', 'creditCard'];
    const sanitized = { ...formData };
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '********';
      }
    });
    
    return sanitized;
  }
}