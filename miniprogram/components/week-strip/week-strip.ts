// miniprogram/components/week-strip/week-strip.ts
import { getLocalDateStr } from '../../utils/date';

Component({
  properties: {
    selectedDate: {
      type: String,
      value: '',
    },
    checkedInDates: {
      type: Array,
      value: [],
      observer() {
        this.updateWeekDays();
      }
    }
  },

  data: {
    weekOffset: 0,
    currentMonthYearLabel: '',
    weekDays: [] as any[],
  },

  attached() {
    this.updateWeekDays();
  },

  methods: {
    updateWeekDays() {
      const { weekOffset } = this.data;
      const checkedInDates = (this.properties.checkedInDates || []) as string[];
      const todayStr = getLocalDateStr();

      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - dayOfWeek + weekOffset * 7);

      const year = sunday.getFullYear();
      const month = sunday.getMonth() + 1;
      const currentMonthYearLabel = `${year}年${month}月`;

      const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        const dateStr = getLocalDateStr(d);
        const hasCheckedIn = checkedInDates.includes(dateStr);
        const isToday = dateStr === todayStr;

        return {
          dayName: dayNames[i],
          dateNum: d.getDate(),
          dateStr,
          hasCheckedIn,
          isToday,
        };
      });

      this.setData({
        currentMonthYearLabel,
        weekDays,
      });
    },

    onPrevWeek() {
      this.setData({ weekOffset: this.data.weekOffset - 1 }, () => {
        this.updateWeekDays();
      });
    },

    onNextWeek() {
      this.setData({ weekOffset: this.data.weekOffset + 1 }, () => {
        this.updateWeekDays();
      });
    },

    onResetWeek() {
      this.setData({ weekOffset: 0 }, () => {
        this.updateWeekDays();
      });
    },

    onTapDay(e: any) {
      const { datestr } = e.currentTarget.dataset;
      const nextSelected = this.properties.selectedDate === datestr ? '' : datestr;
      this.triggerEvent('selectDate', { dateStr: nextSelected });
    }
  }
});
