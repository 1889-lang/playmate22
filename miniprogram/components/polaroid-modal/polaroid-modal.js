Component({
  properties: {
    visible: { type: Boolean, value: false },
    record: { type: Object, value: null }
  },
  data: {
    todayDate: '',
    durationMinutes: 1,
    customPhoto: '',
    moodOptions: [
      { emoji: '😍', text: '开心' },
      { emoji: '😊', text: '专注' },
      { emoji: '🥱', text: '累了' }
    ],
    selectedMood: { emoji: '😍', text: '开心' }
  },
  observers: {
    'visible': function(val) {
      if (val) {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        this.setData({
          todayDate: `${y}-${m}-${day}`,
          customPhoto: '',
          selectedMood: { emoji: '😍', text: '开心' }
        });
      }
    }
  },
  methods: {
    preventProp() {},
    handleClose() {
      this.triggerEvent('close', {
        customPhoto: this.data.customPhoto,
        mood: `${this.data.selectedMood.emoji} ${this.data.selectedMood.text}`
      });
    },
    handleChoosePhoto() {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          if (res.tempFiles && res.tempFiles.length > 0) {
            this.setData({ customPhoto: res.tempFiles[0].tempFilePath });
          }
        }
      });
    },
    onSelectMood(e) {
      const idx = e.currentTarget.dataset.index;
      this.setData({ selectedMood: this.data.moodOptions[idx] });
    }
  }
});
