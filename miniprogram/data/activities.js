const { getIllustration } = require('../utils/illustration');

const INITIAL_ACTIVITIES = [
  {
    id: 'act-01',
    title: '彩色纸条沙沙响',
    subtitle: '锻炼听觉定位与双手抓握能力',
    ageRange: '6-8个月',
    category: '感官认知',
    duration: '5-8分钟',
    materials: ['食品级无毒薄纸', '透明胶带'],
    steps: [
      { stepNumber: 1, title: '准备纸条', description: '将无毒薄纸剪成宽约5厘米的纸条，用胶带固定在宝宝前方略高于视线的高度。' },
      { stepNumber: 2, title: '引导触碰', description: '轻轻摇动纸条发出沙沙声，引导宝宝寻找声音来源并伸手抓握。' },
      { stepNumber: 3, title: '互动鼓励', description: '当宝宝抓到纸条发出声音时，给予微笑和语言回应。' }
    ],
    parentPrompt: '“宝宝听，什么声音沙沙响？是小纸条在跳舞呢，伸手抓抓看！”',
    safetyReminder: '必须全程成人紧密看护，纸条固定在适宜高度，严防撕碎放入口中吞咽。',
    coverImage: '/assets/images/seek_hide_seek_detail_1793840108536.jpg'
  },
  {
    id: 'act-02',
    title: '翻身小飞机',
    subtitle: '促进前庭觉发育与腰背部肌肉力量',
    ageRange: '6-8个月',
    category: '大运动',
    duration: '3-5分钟',
    materials: ['柔软的婴儿爬行垫'],
    steps: [
      { stepNumber: 1, title: '俯卧准备', description: '让宝宝趴在爬行垫上，胸前可垫一个小圆枕。' },
      { stepNumber: 2, title: '轻柔托举', description: '双手扶住宝宝腹部，将其轻轻抬离垫子几厘米，模仿飞机飞翔。' },
      { stepNumber: 3, title: '视线互动', description: '在宝宝前方放置色彩鲜艳的玩具吸引注意力。' }
    ],
    parentPrompt: '“小飞机起飞啦！飞向蓝天，宝宝看前方有什么呀？”',
    safetyReminder: '切勿动作过猛，避免宝宝头部无支撑下垂或突然滑落。',
    coverImage: '/assets/images/seek_hide_seek_detail_1793840108536.jpg'
  },
  {
    id: 'act-03',
    title: '精细抓抓乐（触觉盒）',
    subtitle: '体验不同材质的触觉差异，促进手部触觉辨别',
    ageRange: '6-8个月',
    category: '精细动作',
    duration: '8-10分钟',
    materials: ['纸盒或浅盘', '棉花、丝绸布、硅胶垫、粗麻布'],
    steps: [
      { stepNumber: 1, title: '布置触觉盒', description: '将几种不同质感的材料分区域平铺在矮纸盒或盘中。' },
      { stepNumber: 2, title: '引导触摸', description: '抱宝宝坐在盒前，握住小手依次触摸不同材质。' },
      { stepNumber: 3, title: '描述感受', description: '用生动的词汇描述每种材质的触感。' }
    ],
    parentPrompt: '“摸一摸，这个毛茸茸的，这个滑溜溜的，好舒服呀。”',
    safetyReminder: '确保所有材料清洁无灰尘，无小颗粒脱落风险。',
    coverImage: '/assets/images/seek_hide_seek_detail_1793840598398.jpg'
  },
  {
    id: 'act-04',
    title: '照镜子做鬼脸',
    subtitle: '建立自我认知与面部表情模仿',
    ageRange: '6-8个月',
    category: '社会情绪',
    duration: '5-7分钟',
    materials: ['安全塑料婴儿镜'],
    steps: [
      { stepNumber: 1, title: '照镜子', description: '让宝宝面对安全镜子，看自己和家长的影像。' },
      { stepNumber: 2, title: '做表情', description: '对镜子做出微笑、睁大眼睛、吐舌头等夸张有趣的表情。' },
      { stepNumber: 3, title: '呼唤名字', description: '指着镜中的宝宝说出名字，观察反应。' }
    ],
    parentPrompt: '“镜子里的小宝贝是谁呀？笑一笑，你好呀！”',
    safetyReminder: '确保使用的是不会碎裂的婴儿专用安全镜。',
    coverImage: '/assets/images/seek_hide_seek_detail_1793840598398.jpg'
  },
  {
    id: 'act-05',
    title: '寻找躲猫猫',
    subtitle: '培养客体永久性概念（物体离开视线依然存在）',
    ageRange: '6-8个月',
    category: '感官认知',
    duration: '5分钟',
    materials: ['一块轻薄的纱巾或小毛巾'],
    steps: [
      { stepNumber: 1, title: '展示玩具', description: '拿着宝宝喜欢的玩具吸引注意力。' },
      { stepNumber: 2, title: '轻轻遮挡', description: '用纱巾轻轻盖住玩具的一半或全部。' },
      { stepNumber: 3, title: '掀开惊喜', description: '鼓励宝宝自己伸手掀开纱巾找到玩具。' }
    ],
    parentPrompt: '“玩具去哪儿啦？哇，原来在这里！”',
    safetyReminder: '使用轻薄透气的纱巾，切勿用厚重不透气织物完全盖住面部。',
    // 躲猫猫精准匹配妈妈拿毛毯盖脸手绘原图
    coverImage: '/assets/images/seek_hide_seek_detail_1793840598398.jpg'
  }
];

module.exports = {
  INITIAL_ACTIVITIES,
  ACTIVITIES: INITIAL_ACTIVITIES
};

// 兼容别名与辅助函数
module.exports.getActivityById = function(id) {
  const list = module.exports.INITIAL_ACTIVITIES || module.exports.ACTIVITIES || [];
  return list.find(item => item.id === id);
};

module.exports.getRecommendedActivities = function() {
  return module.exports.INITIAL_ACTIVITIES || module.exports.ACTIVITIES || [];
};
