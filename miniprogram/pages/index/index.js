const activityData = require('../../data/activities');
const { saveFootprint } = require('../../utils/storage');

const cleanTitle = (title) => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

Page({
  data: {
    profile: null,
    currentActivity: null,
    backupActivities: [],
    isModalOpen: false,
    selectedActivity: null,
    isJournalOpen: false,
    isPolaroidOpen: false,
    newCreatedRecords: []
  },

  onShow() {
    this.setData({
      isModalOpen: false,
      isJournalOpen: false,
      isPolaroidOpen: false
    });
    this.initHomeData();
  },

  initHomeData() {
    const profile = wx.getStorageSync('baby_profile') || null;
    const rawList = activityData.INITIAL_ACTIVITIES || activityData.ACTIVITIES || [];

    const list = rawList.map(act => ({
      ...act,
      cleanTitle: cleanTitle(act.title),
      friendlyIntro: '和宝宝一起进行有趣的互动，在轻松陪伴中发现探索的小美好。'
    }));

    const currentActivity = list.find(a => a.id === 'act-05') || list[0] || null;
    const backupActivities = list.filter(a => a.id !== currentActivity?.id).slice(0, 3);

    this.setData({
      profile,
      currentActivity,
      backupActivities
    });
  },

  handleSelectActivity(e) {
    const id = e.currentTarget.dataset.id;
    const rawList = activityData.INITIAL_ACTIVITIES || activityData.ACTIVITIES || [];
    const act = rawList.find(a => a.id === id) || this.data.currentActivity;
    this.setData({
      selectedActivity: act,
      isModalOpen: true
    });
  },

  handleStartPlay(e) {
    const id = e.currentTarget.dataset.id;
    const rawList = activityData.INITIAL_ACTIVITIES || activityData.ACTIVITIES || [];
    const act = rawList.find(a => a.id === id) || this.data.currentActivity;
    this.setData({
      selectedActivity: act,
      isModalOpen: true
    });
  },

  handleCloseModal() {
    this.setData({ isModalOpen: false });
  },

  // 1. 结束陪伴 -> 打开打卡手账编辑页
  handleEnterJournal(e) {
    const act = (e.detail && e.detail.activity) || this.data.selectedActivity || this.data.currentActivity;
    this.setData({
      selectedActivity: act,
      isModalOpen: false,
      isJournalOpen: true
    });
  },

  handleCloseJournal() {
    this.setData({ isJournalOpen: false });
  },

  // 2. 编辑页点击生成手账 -> 保存并弹出拍立得结果
  handleConfirmJournal(e) {
    const { photoImage, mood, notes } = e.detail;
    const act = this.data.selectedActivity || this.data.currentActivity;
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const newRecord = {
      id: 'footprint_' + Date.now(),
      date: dateStr,
      activityTitle: act ? act.title : '亲子陪伴时光',
      durationMinutes: 5,
      totalCount: 1,
      mood: mood || '🌟 开心投入',
      notes: notes || '',
      coverImage: photoImage || (act ? act.coverImage : '/assets/images/seek_hide_seek_detail_1793840598398.jpg'),
      timestamp: Date.now()
    };

    saveFootprint(newRecord);

    this.setData({
      isJournalOpen: false,
      newCreatedRecords: [newRecord],
      isPolaroidOpen: true
    });
  },

  handleClosePolaroid() {
    this.setData({ isPolaroidOpen: false });
    wx.showToast({ title: '已收录进足迹！', icon: 'success' });
  },

  goToLibrary() {
    wx.switchTab({ url: '/pages/vault/vault' });
  }
});
