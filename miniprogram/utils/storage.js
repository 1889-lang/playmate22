const FOOTPRINTS_STORAGE_KEY = 'companion_footprints';

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DEFAULT_SEEDS = [
  {
    id: 'seed-1',
    date: getTodayString(),
    activityTitle: '寻找躲猫猫',
    durationMinutes: 5,
    totalCount: 1,
    mood: '好奇注视 · 眼睛亮亮的 ✨',
    coverImage: '/assets/images/seek_hide_seek_detail_1793840598398.jpg',
    timestamp: Date.now()
  },
  {
    id: 'seed-2',
    date: '2026-11-04',
    activityTitle: '俯卧爬行逗引',
    durationMinutes: 8,
    totalCount: 2,
    mood: '努力前够 · 抬头看 🌟',
    coverImage: '/assets/images/seek_hide_seek_detail_1793840108536.jpg',
    timestamp: Date.now() - 86400000
  }
];

function getAllFootprints() {
  try {
    let list = wx.getStorageSync(FOOTPRINTS_STORAGE_KEY);
    if (!list || list.length === 0) {
      list = DEFAULT_SEEDS;
      wx.setStorageSync(FOOTPRINTS_STORAGE_KEY, list);
    }
    return list;
  } catch (e) {
    return DEFAULT_SEEDS;
  }
}

function getFootprintsByDate(dateStr) {
  const list = getAllFootprints();
  return list.filter(item => item.date === dateStr);
}

function getMarkedDates() {
  const list = getAllFootprints();
  return Array.from(new Set(list.map(item => item.date)));
}

function saveFootprint(record) {
  try {
    const list = getAllFootprints();
    list.unshift(record);
    wx.setStorageSync(FOOTPRINTS_STORAGE_KEY, list);
  } catch (e) {}
}

module.exports = {
  getAllFootprints,
  getFootprintsByDate,
  getMarkedDates,
  saveFootprint
};

// 兼容别名导出
module.exports.saveFootprintRecord = function(record) {
  return module.exports.saveFootprint(record);
};
