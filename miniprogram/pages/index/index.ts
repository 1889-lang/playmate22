// miniprogram/pages/index/index.ts
import { getRecommendedActivities, getActivityById } from '../../data/activities';

Page({
  data: {
    recommendedActivities: [] as any[],
    selectedActivity: null as any,
  },

  onLoad() {
    const recommended = getRecommendedActivities(7);
    this.setData({
      recommendedActivities: recommended
    });
  },

  onOpenActivityModal(e: any) {
    const { id } = e.currentTarget.dataset;
    const activity = getActivityById(id);
    this.setData({
      selectedActivity: activity,
    });
  },

  onCloseActivityModal() {
    this.setData({
      selectedActivity: null,
    });
  }
});
