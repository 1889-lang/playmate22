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
        return;
      }
      const url = '/' + data.path.replace(/^\//, '');
      wx.switchTab({
        url: url
      });
    }
  }
});
