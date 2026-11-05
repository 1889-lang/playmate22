Component({
  properties: {
    visible: { type: Boolean, value: false },
    activity: { type: Object, value: null }
  },
  methods: {
    preventProp() {},
    handleClose() {
      this.triggerEvent('close');
    },
    // 两个方法名均实现，杜绝任何命名冲突报错
    onFinishTap() {
      this.triggerEvent('finish', { activity: this.data.activity });
    },
    handleFinish() {
      this.triggerEvent('finish', { activity: this.data.activity });
    }
  }
});
