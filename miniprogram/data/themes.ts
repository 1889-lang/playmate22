export interface Theme {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  targetGoal: string;
  ageRange: string;
  coverImage: string;
  status: 'published' | 'draft';
  sortOrder: number;
}

export interface ThemeActivityRelation {
  themeId: string;
  activityId: string;
  sortOrder: number;
  roleTag?: string;
}

export const THEMES: Theme[] = [
  {
    id: 'theme-sensory-land',
    title: '客厅里的多感官探索乐园',
    subtitle: '利用日常物品，轻松开启触觉、视听觉与伸手抓握的感受体验',
    description: '6-8个月的宝宝对周围环境的材质、声音与视觉动态有着天然的好奇。无需复杂昂贵的玩偶，利用客厅里常见的无毒纸条、轻柔手绢、软积木与小布球，就能在爬行垫上搭建一个温馨安全的感官感受乐园。',
    targetGoal: '帮助宝宝感受不同材质的触觉差异，练习双侧手掌抓拉与注意力聚焦，在居家温馨陪伴中享受探索的快乐。',
    ageRange: '6-8个月',
    coverImage: '/assets/activities/sensory_box_detail.png',
    status: 'published',
    sortOrder: 1
  },
  {
    id: 'theme-parent-interaction',
    title: '双向语言互动与社交回应',
    subtitle: '在夸张表情、生动拟声与拍手鼓掌中，建立有呼有应的语言与社交启蒙',
    description: '在宝宝开口说出第一个字之前，眼神注视、唇形与语调模仿以及简单的肢体动作，是早期亲子沟通的重要桥梁。通过充满爱意的做鬼脸、小动物叫声与拍手游戏，让每一次互动都充满情绪呼应。',
    targetGoal: '建立亲子视线聚焦与发音轮流社交意识，引导宝宝观察表情、倾听拟声词汇并尝试模仿简单肢体动作。',
    ageRange: '6-8个月',
    coverImage: '/assets/activities/vocal_imitation_detail.png',
    status: 'published',
    sortOrder: 2
  },
  {
    id: 'theme-movement-exploration',
    title: '宝宝趴爬与日常大运动探索',
    subtitle: '围绕趴卧支撑与向前伸手够物，提供轻松安全的居家体感互动',
    description: '趴卧与挪动是宝宝探索四周空间的自然过程。在安全柔软的爬行垫上，通过摇晃发声玩具逗引宝宝向前够取，让日常体感互动充满陪伴乐趣。',
    targetGoal: '鼓励宝宝在趴卧姿势下保持双肘支撑，试着单手前伸摸取前方玩具，体验自主运动的快乐。',
    ageRange: '6-8个月',
    coverImage: '/assets/activities/tummy_crawling_detail.png',
    status: 'published',
    sortOrder: 3
  }
];

export const THEME_RELATIONS: ThemeActivityRelation[] = [
  // 主题一：客厅里的多感官探索乐园
  { themeId: 'theme-sensory-land', activityId: 'act-01', sortOrder: 1, roleTag: '听觉与视线定位' },
  { themeId: 'theme-sensory-land', activityId: 'act-05', sortOrder: 2, roleTag: '物体隐显体验' },
  { themeId: 'theme-sensory-land', activityId: 'act-08', sortOrder: 3, roleTag: '双手抓抱体验' },
  { themeId: 'theme-sensory-land', activityId: 'act-12', sortOrder: 4, roleTag: '指尖捏取抽拉' },
  { themeId: 'theme-sensory-land', activityId: 'act-16', sortOrder: 5, roleTag: '软物抓取搬运' },

  // 主题二：双向语言互动与社交回应
  { themeId: 'theme-parent-interaction', activityId: 'act-04', sortOrder: 1, roleTag: '镜像表情互动' },
  { themeId: 'theme-parent-interaction', activityId: 'act-07', sortOrder: 2, roleTag: '声音节奏体验' },
  { themeId: 'theme-parent-interaction', activityId: 'act-09', sortOrder: 3, roleTag: '双向发音轮流' },
  { themeId: 'theme-parent-interaction', activityId: 'act-11', sortOrder: 4, roleTag: '拟声词汇倾听' },
  { themeId: 'theme-parent-interaction', activityId: 'act-18', sortOrder: 5, roleTag: '社交肢体回应' },
  { themeId: 'theme-parent-interaction', activityId: 'act-13', sortOrder: 6, roleTag: '身体觉知与抚触' },

  // 主题三：宝宝趴爬与日常大运动探索
  { themeId: 'theme-movement-exploration', activityId: 'act-20', sortOrder: 1, roleTag: '俯卧向前伸手' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { THEMES, THEME_RELATIONS };
}

