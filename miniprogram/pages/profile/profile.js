Page({
  data: {
    babyName: '小芽芽',
    babyAge: 7,
    showAgeModal: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    const profile = wx.getStorageSync('baby_profile');
    if (profile) {
      this.setData({
        babyName: profile.name || '小芽芽',
        babyAge: typeof profile.currentMonths === 'number' ? profile.currentMonths : 7
      });
    }
  },

  onNameInput(e) {
    const name = e.detail.value;
    this.setData({ babyName: name });
    this.saveProfile(name, this.data.babyAge);
  },

  openAgeModal() {
    this.setData({ showAgeModal: true });
  },

  closeAgeModal() {
    this.setData({ showAgeModal: false });
  },

  selectMonth(e) {
    const month = e.currentTarget.dataset.month;
    this.setData({
      babyAge: month,
      showAgeModal: false
    });
    this.saveProfile(this.data.babyName, month);
    wx.showToast({ title: '月龄已更新', icon: 'success' });
  },

  saveProfile(name, age) {
    wx.setStorageSync('baby_profile', {
      name: name || '小芽芽',
      currentMonths: age
    });
  },

  copyWeChat() {
    wx.setClipboardData({
      data: 'wanbandaili_helper',
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success' });
      }
    });
  },

  handleReset() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有档案与手账记录并恢复初始状态吗？',
      confirmColor: '#E06D53',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.setData({ babyName: '小芽芽', babyAge: 7 });
          wx.showToast({ title: '已恢复初始状态', icon: 'success' });
        }
      }
    });
  },

  preventBubble() {}
});
