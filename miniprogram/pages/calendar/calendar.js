const { getAllFootprints } = require('../../utils/storage');

const cleanTitle = (title) => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

function getLocalDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

Page({
  data: {
    weekOffset: 0,
    currentMonthLabel: '',
    weekDays: [],
    selectedDate: null,
    allRecords: [],
    groupedRecords: [],
    isPolaroidOpen: false, // 严格默认关闭
    polaroidIndex: 0
  },

  onShow() {
    this.setData({ isPolaroidOpen: false });
    this.refreshCalendarAndRecords();
  },

  refreshCalendarAndRecords() {
    const allRecords = getAllFootprints();
    const todayStr = getLocalDateString();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek + this.data.weekOffset * 7);

    const monthLabel = `${sunday.getFullYear()}年${sunday.getMonth() + 1}月`;
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = getLocalDateString(d);
      return {
        dayName: dayNames[i],
        dateNum: d.getDate(),
        dateStr,
        hasCheckedIn: allRecords.some(r => r.date === dateStr),
        isToday: dateStr === todayStr
      };
    });

    const activeDate = this.data.selectedDate;
    const filtered = activeDate 
      ? allRecords.filter(r => r.date === activeDate)
      : allRecords;

    const dateMap = {};
    filtered.forEach((rec, idx) => {
      const d = rec.date;
      if (!dateMap[d]) dateMap[d] = [];
      dateMap[d].push({ ...rec, originalIndex: idx });
    });

    const sortedDates = Object.keys(dateMap).sort((a, b) => b.localeCompare(a));
    const groupedRecords = sortedDates.map(dateStr => {
      const items = dateMap[dateStr];
      const actMap = {};

      items.forEach(item => {
        const key = item.activityTitle;
        if (!actMap[key]) {
          actMap[key] = {
            activityId: key,
            cleanTitle: cleanTitle(key),
            coverImage: item.coverImage,
            totalDuration: 0,
            totalCount: 0,
            firstRecordIndex: item.originalIndex
          };
        }
        actMap[key].totalDuration += (item.durationMinutes || 5);
        actMap[key].totalCount += 1;
      });

      const parts = dateStr.split('-');
      const dateHeader = dateStr === todayStr ? `今天 · ${parseInt(parts[1])}月${parseInt(parts[2])}日` : `${parseInt(parts[1])}月${parseInt(parts[2])}日`;

      return {
        dateStr,
        dateHeader,
        activities: Object.values(actMap)
      };
    });

    this.setData({
      allRecords,
      currentMonthLabel: monthLabel,
      weekDays,
      groupedRecords
    });
  },

  handleSelectDate(e) {
    const date = e.currentTarget.dataset.date;
    const nextDate = this.data.selectedDate === date ? null : date;
    this.setData({ selectedDate: nextDate }, () => {
      this.refreshCalendarAndRecords();
    });
  },

  handlePrevWeek() {
    this.setData({ weekOffset: this.data.weekOffset - 1 }, () => {
      this.refreshCalendarAndRecords();
    });
  },

  handleNextWeek() {
    this.setData({ weekOffset: this.data.weekOffset + 1 }, () => {
      this.refreshCalendarAndRecords();
    });
  },

  handleResetWeek() {
    this.setData({ weekOffset: 0 }, () => {
      this.refreshCalendarAndRecords();
    });
  },

  openPolaroidModal(e) {
    const index = e.currentTarget.dataset.index || 0;
    this.setData({
      polaroidIndex: index,
      isPolaroidOpen: true
    });
  },

  closePolaroidModal() {
    this.setData({ isPolaroidOpen: false });
  }
});
