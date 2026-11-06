const activityData = require('../../data/activities');
const { saveFootprint } = require('../../utils/storage');

const cleanTitle = (title) => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

const getCoverImage = (act) => {
  if (!act) return '/assets/activities/seek_hide_seek_detail.png';
  if (act.coverImage) return act.coverImage;
  const id = act.id || '';
  const title = act.title || '';
  if (id === 'act-01' || title.includes('沙沙响')) return '/assets/activities/paper_sound_detail.png';
  if (id === 'act-02' || title.includes('飞机')) return '/assets/activities/airplane_tummy_detail.png';
  if (id === 'act-03' || title.includes('触觉盒')) return '/assets/activities/sensory_box_detail.png';
  if (id === 'act-04' || title.includes('照镜子')) return '/assets/activities/mirror_face_detail.png';
  if (id === 'act-05' || title.includes('躲猫猫')) return '/assets/activities/seek_hide_seek_detail.png';
  if (id === 'act-06' || title.includes('小星星')) return '/assets/activities/glitter_bottle_detail.png';
  if (id === 'act-07' || title.includes('拍拍鼓')) return '/assets/activities/drum_rhythm_detail.png';
  if (id === 'act-08' || title.includes('抓大球')) return '/assets/activities/ball_grasp_detail.png';
  if (id === 'act-09' || title.includes('声音模仿')) return '/assets/activities/vocal_imitation_detail.png';
  if (id === 'act-10' || title.includes('推推乐')) return '/assets/activities/block_stack_push_detail.png';
  if (id === 'act-11' || title.includes('拉长音')) return '/assets/activities/animal_sounds_detail.png';
  if (id === 'act-12' || title.includes('手绢')) return '/assets/activities/handkerchief_pull_detail.png';
  if (id === 'act-13' || title.includes('脚丫')) return '/assets/activities/foot_discovery_detail.png';
  if (id === 'act-14' || title.includes('抱抱')) return '/assets/activities/teddy_hug_detail.png';
  if (id === 'act-15' || title.includes('寻宝')) return '/assets/activities/cup_treasure_detail.png';
  if (id === 'act-16' || title.includes('搬运工')) return '/assets/activities/soft_block_mover_detail.png';
  if (id === 'act-17' || title.includes('摇摆时光')) return '/assets/activities/music_sway_detail.png';
  if (id === 'act-18' || title.includes('鼓掌')) return '/assets/activities/hand_clapping_detail.png';
  if (id === 'act-19' || title.includes('嗅觉')) return '/assets/activities/scent_sniff_detail.png';
  if (id === 'act-20' || title.includes('爬行') || title.includes('俯卧')) return '/assets/activities/tummy_crawling_detail.png';
  if (id === 'act-23' || title.includes('黑白卡')) return '/assets/activities/black_white_cards_detail.png';
  return '/assets/activities/seek_hide_seek_detail.png';
};

Page({
  data: {
    profile: null,
    currentActivity: null,
    backupActivities: [],
    isModalOpen: false,
    selectedActivity: null,
    isPolaroidOpen: false,
    currentRecord: null
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.setData({
      isModalOpen: false,
      isPolaroidOpen: false
    });
    this.initHomeData();
  },

  initHomeData() {
    const profile = wx.getStorageSync('baby_profile') || null;
    const rawList = activityData.INITIAL_ACTIVITIES || activityData.ACTIVITIES || [];

    const list = rawList.map(act => ({
      ...act,
      coverImage: getCoverImage(act),
      cleanTitle: cleanTitle(act.title),
      friendlyIntro: '和宝宝一起进行有趣的互动，在轻松陪伴中发现探索的小美好。'
    }));

    const currentActivity = list.find(a => a.id === 'act-20') || list.find(a => a.id === 'act-05') || list[0] || null;
    const backupActivities = list.filter(a => a.id !== currentActivity?.id).slice(0, 3);

    this.setData({
      profile,
      currentActivity,
      backupActivities
    });
  },

  handleSelectActivity(e) {
    const id = e.currentTarget.dataset.id;
    const rawList = activityData.INITIAL_ACTIVITIES || activityData.ACTIVITIES || [];
    const act = rawList.find(a => a.id === id) || this.data.currentActivity;
    this.setData({
      selectedActivity: act,
      isModalOpen: true
    });
  },

  handleStartPlay(e) {
    const id = e.currentTarget.dataset.id;
    const rawList = activityData.INITIAL_ACTIVITIES || activityData.ACTIVITIES || [];
    const act = rawList.find(a => a.id === id) || this.data.currentActivity;
    this.setData({
      selectedActivity: act,
      isModalOpen: true
    });
  },

  handleCloseModal() {
    this.setData({ isModalOpen: false });
  },

  // 点击结束陪伴 -> 直接呼出截图2的拍立得打卡页
  handleCompletePlay(e) {
    const act = (e.detail && e.detail.activity) || this.data.selectedActivity || this.data.currentActivity;
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    const record = {
      id: 'footprint_' + Date.now(),
      date: `${y}-${m}-${day}`,
      activityTitle: act.title,
      coverImage: act.coverImage,
      durationMinutes: 1,
      totalCount: 1,
      timestamp: Date.now()
    };

    this.setData({
      selectedActivity: act,
      currentRecord: record,
      isModalOpen: false,
      isPolaroidOpen: true
    });
  },

  handleClosePolaroid(e) {
    const detail = e.detail || {};
    if (this.data.currentRecord) {
      const finalRecord = {
        ...this.data.currentRecord,
        coverImage: detail.customPhoto || this.data.currentRecord.coverImage,
        mood: detail.mood || '😍 开心'
      };
      saveFootprint(finalRecord);
    }
    this.setData({ isPolaroidOpen: false });
    wx.showToast({ title: '已收入成长足迹', icon: 'success' });
  },

  goToLibrary() {
    wx.switchTab({ url: '/pages/vault/vault' });
  }
});
