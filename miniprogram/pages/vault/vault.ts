// miniprogram/pages/vault/vault.ts
import { INITIAL_ACTIVITIES } from '../../data/activities';

Page({
  data: {
    categories: ['全部', '感官与认知', '精细动作', '大运动', '语言交流', '社会与情绪'],
    selectedCategory: '全部',
    activities: INITIAL_ACTIVITIES,
    filteredActivities: INITIAL_ACTIVITIES,
  },

  onSelectCategory(e: any) {
    const { cat } = e.currentTarget.dataset;
    const filtered = cat === '全部' 
      ? this.data.activities 
      : this.data.activities.filter((a: any) => a.category.includes(cat));

    this.setData({
      selectedCategory: cat,
      filteredActivities: filtered,
    });
  }
});
