// miniprogram/pages/profile/profile.ts
import { clearFootprintRecords } from '../../utils/storage';

Page({
  onClearData() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除本地记录的陪伴足迹吗？',
      success: (res: any) => {
        if (res.confirm) {
          clearFootprintRecords();
          wx.showToast({ title: '记录已清除', icon: 'success' });
        }
      }
    });
  }
});
