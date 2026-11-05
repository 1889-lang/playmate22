Component({
  properties: {
    visible: { type: Boolean, value: false },
    activity: { type: Object, value: null }
  },
  data: {
    photoUrl: '',
    notes: '',
    selectedMood: '🌟 开心投入',
    moods: [
      { emoji: '🌟', text: '开心投入', tag: '🌟 开心投入' },
      { emoji: '🥰', text: '亲密互动', tag: '🥰 亲密互动' },
      { emoji: '💡', text: '发现新大陆', tag: '💡 发现新大陆' },
      { emoji: '😴', text: '满足平静', tag: '😴 满足平静' }
    ]
  },
  observers: {
    'visible': function(val) {
      if (val) {
        this.setData({
          photoUrl: '',
          notes: '',
          selectedMood: '🌟 开心投入'
        });
      }
    }
  },
  methods: {
    preventProp() {},
    handleClose() {
      this.triggerEvent('close');
    },
    handleChoosePhoto() {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          if (res.tempFiles && res.tempFiles.length > 0) {
            this.setData({ photoUrl: res.tempFiles[0].tempFilePath });
          }
        }
      });
    },
    selectMood(e) {
      this.setData({ selectedMood: e.currentTarget.dataset.mood });
    },
    onInputNotes(e) {
      this.setData({ notes: e.detail.value });
    },
    handleGenerate() {
      const finalImage = this.data.photoUrl || (this.data.activity && this.data.activity.coverImage);
      this.triggerEvent('confirm', {
        photoImage: finalImage,
        mood: this.data.selectedMood,
        notes: this.data.notes
      });
    }
  }
});
