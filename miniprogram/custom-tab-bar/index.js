Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "今日推荐"
      },
      {
        pagePath: "/pages/vault/vault",
        text: "活动宝库"
      },
      {
        pagePath: "/pages/calendar/calendar",
        text: "成长足迹"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "宝宝档案"
      }
    ]
  },
  methods: {
        switchTab(e) {
      const data = e.currentTarget.dataset;
      const index = Number(data.index);
      if (this.data.selected === index) {
        return; // 已在当前页面，直接拦截，避免重复路由冲突
      }
      const url = '/' + data.path.replace(/^\//, '');
      wx.switchTab({
        url: url
      });
    }
  }
});
