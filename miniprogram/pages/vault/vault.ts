// miniprogram/pages/vault/vault.ts
import { INITIAL_ACTIVITIES, getActivityById } from '../../data/activities';

Page({
  data: {
    categories: ['全部', '感官认知', '精细动作', '大运动', '语言交流', '社会情绪'],
    ageRanges: ['全部月龄', '0-3个月', '4-5个月', '6-8个月', '9-12个月', '13-18个月', '19-24个月', '25-36个月'],
    selectedCategory: '全部',
    selectedAge: '全部月龄',
    activities: INITIAL_ACTIVITIES,
    filteredActivities: INITIAL_ACTIVITIES,
    selectedActivity: null as any,
  },

  applyFilters() {
    const { activities, selectedCategory, selectedAge } = this.data;
    const filtered = activities.filter((a: any) => {
      const matchCat = selectedCategory === '全部' || a.category.includes(selectedCategory);
      const matchAge = selectedAge === '全部月龄' || a.ageRange.includes(selectedAge) || a.ageRange.includes('0-36');
      return matchCat && matchAge;
    });

    this.setData({
      filteredActivities: filtered,
    });
  },

  onSelectCategory(e: any) {
    const { cat } = e.currentTarget.dataset;
    this.setData({ selectedCategory: cat }, () => {
      this.applyFilters();
    });
  },

  onSelectAge(e: any) {
    const { age } = e.currentTarget.dataset;
    this.setData({ selectedAge: age }, () => {
      this.applyFilters();
    });
  },

  onOpenActivityModal(e: any) {
    const { id } = e.currentTarget.dataset;
    const activity = getActivityById(id);
    this.setData({ selectedActivity: activity });
  },

  onCloseActivityModal() {
    this.setData({ selectedActivity: null });
  }
});
