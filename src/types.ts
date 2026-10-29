export type ActivityCategory = '大运动' | '精细动作' | '感官认知' | '社会情绪' | '语言交流';

export interface ActivityStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface Activity {
  id: string;
  title: string;
  subtitle: string;
  ageRange: string; // e.g. "6-8个月"
  category: ActivityCategory;
  duration: string; // e.g. "5-10分钟"
  materials: string[];
  prerequisite: string;
  steps: ActivityStep[];
  parentPrompt: string; // 家长话术
  observationTips: string[]; // 观察提示
  alternativePlay: string; // 替代玩法
  developmentalDomain: string; // 发展领域
  safetyReminder: string; // 安全提醒
  stopCondition: string; // 停止条件
  source: string; // 来源
  isReviewed: boolean; // 是否经过专业审核
  accentColor: 'sage' | 'apricot' | 'coral' | 'blue';
  isVip?: boolean; // 是否为VIP高级活动
}

export type BabyReaction = '开心专注' | '平静探索' | '容易疲劳' | '略显抗拒';
export type ActivityDifficulty = '轻松完成' | '刚好合适' | '稍有挑战';

export interface PlayRecord {
  id: string;
  activityId: string;
  activityTitle: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  reaction: BabyReaction;
  difficulty: ActivityDifficulty;
  completed: boolean;
  notes: string;
}

export interface BabyProfile {
  name: string;
  birthMonth: string; // YYYY-MM
  currentMonths: number;
  favoriteCategories: ActivityCategory[];
}

export type ProfileStatus = 'unregistered' | 'registered';
