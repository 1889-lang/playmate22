// miniprogram/components/activity-modal/activity-modal.ts
import { saveFootprintRecord } from '../../utils/storage';
import { getLocalDateStr } from '../../utils/date';

Component({
  properties: {
    activity: {
      type: Object,
      value: null,
    }
  },

  methods: {
    onCloseModal() {
      this.triggerEvent('close');
    },

    onStartPlay() {
      const act = this.properties.activity as any;
      if (!act) return;

      const record = {
        id: 'rec_' + Date.now(),
        activityId: act.id,
        activityTitle: act.title,
        date: getLocalDateStr(),
        durationMinutes: 5,
        reaction: '开心专注',
        photoUrl: '/assets/activities/seek_hide_seek_detail.png',
        category: act.category,
        notes: '与宝宝顺利完成陪伴活动',
      };

      saveFootprintRecord(record);

      wx.showToast({
        title: '已存入陪伴足迹',
        icon: 'success',
      });

      this.triggerEvent('close');
    },

    preventProp() {
      // Catch tap
    }
  }
});
