// miniprogram/custom-tab-bar/index.ts
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "今日推荐"
      },
      {
        pagePath: "/pages/calendar/calendar",
        text: "成长足迹"
      },
      {
        pagePath: "/pages/vault/vault",
        text: "活动宝库"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "宝宝档案"
      }
    ]
  },

  methods: {
    switchTab(e: any) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
    }
  }
});
