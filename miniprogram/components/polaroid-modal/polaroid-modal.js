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
    handleSavePoster() {
      wx.showLoading({ title: '生成打卡海报中...' });
      const query = this.createSelectorQuery();
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res[0] || !res[0].node) {
            wx.hideLoading();
            wx.showToast({ title: '画布初始化失败', icon: 'none' });
            return;
          }
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio || 2;
          const width = 320;
          const height = 480;

          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          // 1. 绘制拍立得暖白背景底卡
          ctx.fillStyle = '#FAF9F2';
          ctx.fillRect(0, 0, width, height);

          // 2. 绘制插画相框
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(20, 20, 280, 280);

          // 3. 绘制活动插画
          const act = this.data.record || {};
          const imgUrl = act.coverImage || '/assets/activities/tummy_crawling_detail.png';
          
          try {
            const img = canvas.createImage();
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
              img.src = imgUrl;
            });
            ctx.drawImage(img, 24, 24, 272, 272);
          } catch (e) {}

          // 4. 绘制文字信息
          ctx.fillStyle = '#2D3748';
          ctx.font = 'bold 16px sans-serif';
          const title = act.activityTitle || '亲子互动时光';
          ctx.fillText(title, 24, 330);

          ctx.fillStyle = '#718096';
          ctx.font = '12px sans-serif';
          const dateStr = act.date || new Date().toISOString().split('T')[0];
          ctx.fillText(`打卡日期：${dateStr}  ·  陪伴宝宝成长`, 24, 355);

          // 5. 绘制分割虚线
          ctx.strokeStyle = '#E2E8F0';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(24, 380);
          ctx.lineTo(296, 380);
          ctx.stroke();

          // 6. 绘制右下角小程序码
          try {
            const qrImg = canvas.createImage();
            await new Promise((resolve) => {
              qrImg.onload = resolve;
              qrImg.onerror = resolve;
              qrImg.src = '/assets/images/gh_qrcode.png';
            });
            ctx.drawImage(qrImg, 236, 395, 60, 60);
          } catch (e) {}

          // 7. 绘制左下角扫码提示
          ctx.fillStyle = '#4D7C5F';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText('长按识别小程序码', 24, 415);
          ctx.fillStyle = '#A0AEC0';
          ctx.font = '11px sans-serif';
          ctx.fillText('和我一起记录宝宝互动', 24, 435);

          // 导出图片并保存到相册
          wx.canvasToTempFilePath({
            canvas,
            success: (tempRes) => {
              const fs = wx.getFileSystemManager();
              const actName = (act.activityTitle || '亲子互动').replace(/[\/\:*?"<>|]/g, '').trim();
              const nowStr = (act.date || '').replace(/-/g, '') || Date.now();
              const friendlyFileName = `${actName}_打卡_${nowStr}.png`;
              const targetPath = `${wx.env.USER_DATA_PATH}/${friendlyFileName}`;

              // 复制/写入为带活动名称的文件
              fs.saveFile({
                tempFilePath: tempRes.tempFilePath,
                filePath: targetPath,
                success: (saveRes) => {
                  const finalPath = saveRes.savedFilePath || targetPath;
                  wx.saveImageToPhotosAlbum({
                    filePath: finalPath,
                    success: () => {
                      wx.hideLoading();
                      wx.showModal({
                        title: '保存成功 🎉',
                        content: `已保存「${actName}」拍立得照片至相册，可前往朋友圈分享！`,
                        showCancel: false,
                        confirmText: '好的',
                        confirmColor: '#2E5A44'
                      });
                    },
                    fail: (err) => {
                      wx.hideLoading();
                      if (err.errMsg && err.errMsg.includes('auth deny')) {
                        wx.showModal({
                          title: '需要相册权限',
                          content: '请允许保存到相册以分享到朋友圈',
                          confirmText: '去授权',
                          success: (authRes) => {
                            if (authRes.confirm) wx.openSetting();
                          }
                        });
                      }
                    }
                  });
                },
                fail: () => {
                  // 降级直接保存原临时文件
                  wx.saveImageToPhotosAlbum({
                    filePath: tempRes.tempFilePath,
                    complete: () => wx.hideLoading()
                  });
                }
              });
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '生成图片失败', icon: 'none' });
            }
          });
        });
    },

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
