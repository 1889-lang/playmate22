// miniprogram/utils/storage.ts

export interface PlayRecord {
  id: string;
  activityId: string;
  activityTitle: string;
  date: string;
  durationMinutes: number;
  reaction: '开心专注' | '平静探索' | '容易疲劳' | string;
  photoUrl?: string;
  category?: string;
  notes?: string;
}

const FOOTPRINTS_KEY = 'companion_footprints';

export function getFootprintRecords(): PlayRecord[] {
  try {
    const data = wx.getStorageSync(FOOTPRINTS_KEY);
    if (!data) return [];
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('读取足迹存储失败', err);
    return [];
  }
}

export function saveFootprintRecord(record: PlayRecord): void {
  try {
    const existing = getFootprintRecords();
    const updated = [record, ...existing];
    wx.setStorageSync(FOOTPRINTS_KEY, updated);
  } catch (err) {
    console.error('保存足迹记录失败', err);
  }
}

export function clearFootprintRecords(): void {
  try {
    wx.removeStorageSync(FOOTPRINTS_KEY);
  } catch (err) {
    console.error('清除足迹存储失败', err);
  }
}
