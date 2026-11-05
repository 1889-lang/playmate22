// miniprogram/components/polaroid-modal/polaroid-modal.ts
Component({
  properties: {
    records: {
      type: Array,
      value: [],
    },
    initialIndex: {
      type: Number,
      value: 0,
      observer(newVal: number) {
        this.setData({ currentIndex: newVal });
      }
    }
  },

  data: {
    currentIndex: 0,
  },

  attached() {
    this.setData({ currentIndex: this.properties.initialIndex || 0 });
  },

  methods: {
    onSwiperChange(e: any) {
      const current = e.detail.current;
      this.setData({ currentIndex: current });
      this.triggerEvent('switchRecord', { index: current });
    },

    onCloseModal() {
      this.triggerEvent('close');
    },

    preventProp() {
      // Catch tap
    }
  }
});
