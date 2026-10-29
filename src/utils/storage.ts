/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 安全封装 LocalStorage，杜绝 JSON 解析崩溃与配额超限白屏
 */
export const safeStorage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (e) {
      console.warn(`[safeStorage] Error reading ${key}`, e);
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[safeStorage] Error writing ${key}`, e);
      return false;
    }
  },
  setWithStatus<T>(key: string, value: T): { success: boolean; error?: string } {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return { success: true };
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : 'Storage quota exceeded or private mode error';
      console.error(`[safeStorage] SetWithStatus failed for ${key}`, e);
      return { success: false, error: errorMsg };
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Error removing ${key}`, e);
    }
  }
};
