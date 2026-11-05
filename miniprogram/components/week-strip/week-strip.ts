Component({
  properties: {
    selectedDate: {
      type: String,
      value: '',
      observer(newVal) {
        if (newVal) this.initWeek(new Date(newVal));
      }
    },
    markedDates: {
      type: Array,
      value: []
    }
  },

  data: {
    currentYearMonth: '',
    weekDays: []
  },

  lifetimes: {
    attached() {
      const initial = this.data.selectedDate ? new Date(this.data.selectedDate) : new Date();
      this.initWeek(initial);
    }
  },

  methods: {
    formatDateStr(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    initWeek(anchorDate) {
      const current = new Date(anchorDate);
      const dayOfWeek = current.getDay();
      const startOfWeek = new Date(current);
      startOfWeek.setDate(current.getDate() - dayOfWeek);

      const weekdaysNames = ['日', '一', '二', '三', '四', '五', '六'];
      const todayStr = this.formatDateStr(new Date());
      const days = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = this.formatDateStr(d);

        days.push({
          dateString: dateStr,
          dayNum: d.getDate(),
          weekdayName: weekdaysNames[i],
          isToday: dateStr === todayStr,
          hasRecord: (this.data.markedDates || []).includes(dateStr)
        });
      }

      const yearMonth = `${startOfWeek.getFullYear()}年${startOfWeek.getMonth() + 1}月`;
      this.setData({
        currentYearMonth: yearMonth,
        weekDays: days
      });
    },

    onTapDay(e) {
      const date = e.currentTarget.dataset.date;
      this.triggerEvent('selectDate', { date });
    },

    handlePrevWeek() {
      const first = new Date(this.data.weekDays[0].dateString);
      first.setDate(first.getDate() - 7);
      this.initWeek(first);
    },

    handleNextWeek() {
      const first = new Date(this.data.weekDays[0].dateString);
      first.setDate(first.getDate() + 7);
      this.initWeek(first);
    }
  }
});