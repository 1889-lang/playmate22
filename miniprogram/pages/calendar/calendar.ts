// miniprogram/pages/calendar/calendar.ts
import { getFootprintRecords, PlayRecord } from '../../utils/storage';
import { getLocalDateStr } from '../../utils/date';

Page({
  data: {
    selectedDate: '',
    records: [] as PlayRecord[],
    filteredRecords: [] as PlayRecord[],
    checkedInDates: [] as string[],
    isPolaroidModalOpen: false,
    modalIndex: 0,
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    const records = getFootprintRecords();
    const todayStr = getLocalDateStr();
    
    // Default to today or selected date
    const selectedDate = this.data.selectedDate || todayStr;
    const checkedInDates = Array.from(new Set(records.map((r: PlayRecord) => r.date)));

    const filteredRecords = selectedDate 
      ? records.filter((r: PlayRecord) => r.date === selectedDate)
      : records;

    this.setData({
      records,
      checkedInDates,
      selectedDate,
      filteredRecords,
    });
  },

  onSelectDate(e: any) {
    const { dateStr } = e.detail;
    const records = this.data.records;
    const filteredRecords = dateStr 
      ? records.filter((r: PlayRecord) => r.date === dateStr)
      : records;

    this.setData({
      selectedDate: dateStr,
      filteredRecords,
    });
  },

  onOpenPolaroidModal(e: any) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      modalIndex: index || 0,
      isPolaroidModalOpen: true,
    });
  },

  onClosePolaroidModal() {
    this.setData({
      isPolaroidModalOpen: false,
    });
  },

  onShareAppMessage() {
    const selectedDate = this.data.selectedDate || '今日';
    return {
      title: `玩伴日历 - ${selectedDate} 陪伴手账`,
      path: '/pages/calendar/calendar',
      imageUrl: '/assets/activities/seek_hide_seek_detail.png'
    };
  }
});
