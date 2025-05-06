/**
 * @chakra-ui/utils のモック
 */

// Dict型の定義
export interface Dict<T = any> {
  [key: string]: T;
}

// ユーティリティ関数のモック
export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isObject = (value: any): boolean => typeof value === 'object' && value !== null;
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isArray = Array.isArray;

// その他のユーティリティ関数
export const runIfFn = <T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T => {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
};

export const cx = (...classNames: any[]) => classNames.filter(Boolean).join(' ');