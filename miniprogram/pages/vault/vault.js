const { INITIAL_ACTIVITIES, ACTIVITIES } = require('../../data/activities');

const cleanTitle = (title) => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

Page({
  data: {
    ageBrackets: [
      { key: 'all', label: '全部月龄' },
      { key: '0-6', label: '0-6个月' },
      { key: '7-12', label: '7-12个月' },
      { key: '1-3', label: '1-3岁' }
    ],
    categories: ['全部类别', '大运动', '精细动作', '感官认知', '社会情绪', '语言交流'],
    selectedAge: 'all',
    selectedCategory: '全部类别',
    allActivities: [],
    filteredActivities: [],
    isModalOpen: false,
    selectedActivity: null
  },

  onShow() {
    const rawList = INITIAL_ACTIVITIES || ACTIVITIES || [];
    const list = rawList.map(a => ({
      ...a,
      cleanTitle: cleanTitle(a.title)
    }));
    this.setData({ allActivities: list }, () => {
      this.filterList();
    });
  },

  onSelectAge(e) {
    this.setData({ selectedAge: e.currentTarget.dataset.key }, () => this.filterList());
  },

  onSelectCategory(e) {
    this.setData({ selectedCategory: e.currentTarget.dataset.cat }, () => this.filterList());
  },

  filterList() {
    const { allActivities, selectedAge, selectedCategory } = this.data;
    const result = allActivities.filter(item => {
      // 1. 分类匹配
      const catMatch = selectedCategory === '全部类别' || item.category === selectedCategory;
      
      // 2. 月龄宽松匹配（全部月龄默认放行所有审核活动）
      let ageMatch = true;
      if (selectedAge === 'all') {
        ageMatch = true;
      } else if (selectedAge === '0-6') {
        ageMatch = item.ageRange.includes('0-6') || item.ageRange.includes('6-8') || item.ageRange.includes('新生');
      } else if (selectedAge === '7-12') {
        ageMatch = item.ageRange.includes('6-8') || item.ageRange.includes('7-12') || item.ageRange.includes('8-12');
      } else if (selectedAge === '1-3') {
        ageMatch = item.ageRange.includes('1-3') || item.ageRange.includes('12-');
      }
      return catMatch && ageMatch;
    });

    this.setData({ filteredActivities: result });
  },

  handleOpenDetail(e) {
    const act = this.data.allActivities.find(a => a.id === e.currentTarget.dataset.id);
    if (act) {
      wx.showModal({
        title: act.title,
        content: `【${act.subtitle || act.category}】\n\n建议时长：${act.duration}\n\n所需材料：${act.materials ? act.materials.join('、') : '生活常见物品'}\n\n陪伴锦囊：${act.parentPrompt || '与宝宝温和互动'}`,
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#2E5A44'
      });
    }
  }
});
