Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    theme: {
      type: Object,
      value: null
    },
    activities: {
      type: Array,
      value: []
    }
  },

  methods: {
    handleClose() {
      this.triggerEvent('close');
    },

    handleCloseMask() {
      this.triggerEvent('close');
    },

    preventBubble() {
      // 阻止冒泡
    },

    handleSelectActivity(e) {
      const id = e.currentTarget.dataset.id;
      this.triggerEvent('select-activity', { id });
    }
  }
});
