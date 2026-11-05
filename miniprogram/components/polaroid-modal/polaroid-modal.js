Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    records: {
      type: Array,
      value: []
    },
    initialIndex: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.setData({ currentIndex: newVal });
      }
    }
  },

  data: {
    currentIndex: 0
  },

  methods: {
    onSwiperChange(e) {
      this.setData({
        currentIndex: e.detail.current
      });
    },

    handleClose() {
      this.triggerEvent('close');
    },

    preventBubble() {
      // 阻止事件冒泡
    }
  }
});