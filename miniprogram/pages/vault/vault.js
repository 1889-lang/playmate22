const { INITIAL_ACTIVITIES } = require('../../data/activities');
const { THEMES, THEME_RELATIONS } = require('../../data/themes');

const cleanTitle = (title) => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

Page({
  data: {
    activities: [],
    filteredActivities: [],
    themes: [],
    selectedThemeId: 'all', // 'all' | 'theme-sensory-land' | 'theme-parent-interaction' | 'theme-movement-exploration'
    totalApprovedCount: 0,
    ageFilters: ['全部月龄', '0-6个月', '7-12个月', '1-3岁'],
    categoryFilters: ['全部类别', '大运动', '精细动作', '感官认知', '语言沟通', '社会情绪'],
    selectedAge: '全部月龄',
    selectedCategory: '全部类别',

    isModalOpen: false,
    isPolaroidOpen: false,
    currentRecord: null,
    selectedActivity: null
  },

  onLoad() {
    const rawActivities = INITIAL_ACTIVITIES || [];
    const list = rawActivities.map(item => ({
      ...item,
      cleanTitle: item.cleanTitle || cleanTitle(item.title),
      friendlyIntro: item.friendlyIntro || item.subtitle || item.description
    }));

    const totalApproved = list.filter(a => a.isReviewed === true && a.reviewStatus === 'approved').length;

    // 动态计算每个主题中真实通过审核的活动数量
    const processedThemes = (THEMES || [])
      .filter(t => t.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(theme => {
        const relations = (THEME_RELATIONS || []).filter(r => r.themeId === theme.id);
        const approvedCount = relations.reduce((acc, rel) => {
          const act = list.find(a => String(a.id) === String(rel.activityId));
          if (act && act.isReviewed === true && act.reviewStatus === 'approved') {
            return acc + 1;
          }
          return acc;
        }, 0);

        return {
          ...theme,
          approvedCount
        };
      });

    this.setData({
      activities: list,
      totalApprovedCount: totalApproved || list.length,
      themes: processedThemes
    }, () => {
      this.applyFilter();
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  onSelectTheme(e) {
    const id = e.currentTarget.dataset.id;
    if (id && id !== this.data.selectedThemeId) {
      this.setData({ selectedThemeId: id }, () => {
        this.applyFilter();
      });
    }
  },

  onSelectAge(e) {
    const age = e.currentTarget.dataset.age;
    this.setData({ selectedAge: age }, () => {
      this.applyFilter();
    });
  },

  onSelectCategory(e) {
    const cat = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: cat }, () => {
      this.applyFilter();
    });
  },

  applyFilter() {
    const { activities, selectedThemeId, selectedAge, selectedCategory } = this.data;
    let pool = activities;

    // 1. 若选中具体主题，裁剪为该主题关联且严格通过审核的活动列表
    if (selectedThemeId && selectedThemeId !== 'all') {
      const relations = (THEME_RELATIONS || []).filter(r => r.themeId === selectedThemeId);
      const relMap = new Map();
      relations.forEach(r => relMap.set(String(r.activityId), r));

      pool = pool.filter(item => {
        if (!relMap.has(String(item.id))) return false;
        // 严格活动审核防线：必须 isReviewed === true 且 reviewStatus === 'approved'
        return item.isReviewed === true && item.reviewStatus === 'approved';
      });

      // 保持主题内定义的展示顺序
      pool.sort((a, b) => {
        const orderA = relMap.get(String(a.id))?.sortOrder || 99;
        const orderB = relMap.get(String(b.id))?.sortOrder || 99;
        return orderA - orderB;
      });
    }

    // 2. 组合月龄筛选
    if (selectedAge !== '全部月龄') {
      pool = pool.filter(item => item.ageRange === selectedAge || (item.age && item.age.includes(selectedAge)));
    }

    // 3. 组合分类筛选
    if (selectedCategory !== '全部类别') {
      pool = pool.filter(item => item.category === selectedCategory);
    }

    this.setData({ filteredActivities: pool });
  },

  handleSelectActivity(e) {
    const id = e.currentTarget.dataset.id;
    const found = this.data.activities.find(item => String(item.id) === String(id));
    if (found) {
      this.setData({
        selectedActivity: found,
        isModalOpen: true
      });
    }
  },

  handleCloseModal() {
    this.setData({
      isModalOpen: false,
      selectedActivity: null
    });
  },

  handleClosePolaroid() {
    this.setData({
      isPolaroidOpen: false,
      currentRecord: null
    });
  },

  handleCompletePlay(e) {
    const act = (e && e.detail && e.detail.activity) || this.data.selectedActivity;
    if (!act) {
      this.handleCloseModal();
      return;
    }
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    const record = {
      id: 'footprint_' + Date.now(),
      date: `${y}-${m}-${day}`,
      activityTitle: act.cleanTitle || act.title,
      coverImage: act.coverImage,
      durationMinutes: 1,
      totalCount: 1,
      timestamp: Date.now()
    };

    this.setData({
      isModalOpen: false,
      isPolaroidOpen: true,
      currentRecord: record
    });
  }
});
