// miniprogram/pages/index/index.ts
import { INITIAL_ACTIVITIES } from '../../data/activities';

Page({
  data: {
    dailyActivities: [] as any[],
  },

  onLoad() {
    // Select 3 sample daily activities (act-04, act-05, act-08)
    const daily = INITIAL_ACTIVITIES.filter(a => ['act-04', 'act-05', 'act-08'].includes(a.id));
    this.setData({
      dailyActivities: daily.length ? daily : INITIAL_ACTIVITIES.slice(0, 3)
    });
  },

  onOpenActivityModal(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: '正在载入玩法...',
      icon: 'none'
    });
  }
});
