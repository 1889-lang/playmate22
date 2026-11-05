// miniprogram/utils/storage.ts
import { getLocalDateStr } from './date';

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

function getSeedRecords(): PlayRecord[] {
  const today = new Date();
  const todayStr = getLocalDateStr(today);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getLocalDateStr(yesterday);

  return [
    {
      id: 'seed_01',
      activityId: 'act-05',
      activityTitle: '寻找躲猫猫',
      date: todayStr,
      durationMinutes: 5,
      reaction: '好奇注视 · 眼睛亮亮的 ✨',
      photoUrl: '/assets/activities/seek_hide_seek_detail.png',
      category: '感官认知',
      notes: '观察到宝宝能主动伸手掀开手帕寻找藏起来的小熊啦！',
    },
    {
      id: 'seed_02',
      activityId: 'act-04',
      activityTitle: '照镜子做鬼脸',
      date: yesterdayStr,
      durationMinutes: 7,
      reaction: '开心专注',
      photoUrl: '/assets/activities/seek_hide_seek_detail.png',
      category: '社会情绪',
      notes: '宝宝看到镜子里的影像咯咯笑个不停。',
    }
  ];
}

export function getFootprintRecords(): PlayRecord[] {
  try {
    const data = wx.getStorageSync(FOOTPRINTS_KEY);
    if (!data || (Array.isArray(data) && data.length === 0)) {
      const seed = getSeedRecords();
      wx.setStorageSync(FOOTPRINTS_KEY, seed);
      return seed;
    }
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      const seed = getSeedRecords();
      wx.setStorageSync(FOOTPRINTS_KEY, seed);
      return seed;
    }
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('读取足迹存储失败', err);
    return getSeedRecords();
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
