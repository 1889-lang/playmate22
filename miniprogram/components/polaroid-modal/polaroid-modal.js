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
      value: 0
    }
  },
  data: {
    currentIndex: 0
  },
  observers: {
    'visible': function(val) {
      if (val) {
        this.setData({ currentIndex: 0 });
      }
    },
    'initialIndex': function(val) {
      this.setData({ currentIndex: val || 0 });
    }
  },
  methods: {
    onSwiperChange(e) {
      this.setData({ currentIndex: e.detail.current });
    },
    handleClose() {
      this.triggerEvent('close');
    },
    onCloseModal() {
      this.triggerEvent('close');
    },
    preventProp() {}
  }
});
