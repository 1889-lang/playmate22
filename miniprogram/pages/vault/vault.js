const { INITIAL_ACTIVITIES } = require('../../data/activities');

Page({
  data: {
    activities: [],
    filteredActivities: [],
    ageFilters: ['全部月龄', '0-6个月', '7-12个月', '1-3岁'],
    categoryFilters: ['全部类别', '大运动', '精细动作', '感官认知', '语言沟通', '社会情绪'],
    selectedAge: '全部月龄',
    selectedCategory: '全部类别',
    isModalOpen: false,
    selectedActivity: null
  },

  onLoad() {
    const list = (INITIAL_ACTIVITIES || []).map(item => ({
      ...item,
      cleanTitle: item.cleanTitle || item.title,
      friendlyIntro: item.friendlyIntro || item.subtitle || item.description
    }));
    this.setData({
      activities: list,
      filteredActivities: list
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
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
    const { activities, selectedAge, selectedCategory } = this.data;
    let list = activities;

    if (selectedAge !== '全部月龄') {
      list = list.filter(item => item.ageRange === selectedAge || (item.age && item.age.includes(selectedAge)));
    }

    if (selectedCategory !== '全部类别') {
      list = list.filter(item => item.category === selectedCategory);
    }

    this.setData({ filteredActivities: list });
  },

  openActivityModal(e) {
    this.handleSelectActivity(e);
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

  handleCompletePlay() {
    this.handleCloseModal();
  }
});
