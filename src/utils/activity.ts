/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, BabyProfile } from '../types';
import { getLocalDateString, getEffectiveBabyMonths } from './date';

/**
 * 严格活动审核准入校验（唯一的全链路准入规则）
 * 满足以下全部条件才判定为通过审核准入：
 * 1. 对象非空且具备基础活动结构（id, title, steps 为数组, ageRange）
 * 2. activity.isReviewed 严格为 true（非 null, 非 undefined, 必须为 boolean true）
 * 3. activity.reviewStatus 若存在，必须严格等于 'approved'（待审核、审核中、未通过一律拦截）
 */
export const isActivityReviewed = (activity: unknown): activity is Activity => {
  if (!activity || typeof activity !== 'object') return false;
  const act = activity as Partial<Activity>;

  // 1. 结构完整性校验
  if (typeof act.id !== 'string' || !act.id) return false;
  if (typeof act.title !== 'string' || !act.title) return false;
  if (typeof act.ageRange !== 'string' || !act.ageRange) return false;
  if (!Array.isArray(act.steps) || act.steps.length === 0) return false;

  // 2. 严格布尔校验：isReviewed 必须为 true
  if (act.isReviewed !== true) return false;

  // 3. 审核状态校验
  if (act.reviewStatus && act.reviewStatus !== 'approved') return false;

  return true;
};

/**
 * 统一解析月龄适龄范围
 * 例如 "6-8个月" -> { min: 6, max: 8 }
 * "9-12+" -> { min: 9, max: 99 }
 * "6个月" -> { min: 6, max: 6 }
 */
export const parseAgeRange = (ageRangeStr: string): { min: number; max: number } => {
  if (!ageRangeStr || typeof ageRangeStr !== 'string') {
    return { min: 0, max: 99 };
  }
  const cleaned = ageRangeStr.replace(/个月/g, '').replace(/月龄/g, '').trim();
  if (cleaned.includes('+')) {
    const minVal = parseInt(cleaned.replace('+', ''), 10) || 0;
    return { min: minVal, max: 99 };
  }
  const parts = cleaned.split('-');
  if (parts.length === 2) {
    const min = parseInt(parts[0], 10) || 0;
    const max = parseInt(parts[1], 10) || 99;
    return { min, max };
  }
  const single = parseInt(cleaned, 10);
  if (!isNaN(single)) {
    return { min: single, max: single };
  }
  return { min: 0, max: 99 };
};

/**
 * 校验活动是否适合指定月龄
 * - 前置条件：必须先通过 isActivityReviewed 审核校验
 * - 若 ageMonths 为 null/undefined，返回 false（未建档不能冒充适龄）
 */
export const isActivityEligibleForAge = (
  activity: Activity,
  ageMonths: number | null | undefined
): boolean => {
  if (!isActivityReviewed(activity)) return false;
  if (ageMonths == null || isNaN(ageMonths) || ageMonths < 0) return false;

  const { min, max } = parseAgeRange(activity.ageRange);
  return ageMonths >= min && ageMonths <= max;
};

/**
 * 过滤获取全部已通过专业安全审核的活动
 */
export const getReviewedActivities = (activities: Activity[]): Activity[] => {
  if (!Array.isArray(activities)) return [];
  return activities.filter(isActivityReviewed);
};

/**
 * 过滤获取指定月龄下已审核适龄活动
 */
export const getAgeEligibleActivities = (
  activities: Activity[],
  ageMonths: number | null | undefined
): Activity[] => {
  if (!Array.isArray(activities)) return [];
  return activities.filter((act) => isActivityEligibleForAge(act, ageMonths));
};

/**
 * 获取今日精选主推活动（确定性哈希算法，零随机跳变）
 * 
 * 规则：
 * 1. 只有已审核活动（isReviewed === true 且 reviewStatus === 'approved'）允许进入候选池
 * 2. 若用户已建档且具备有效月龄，严格筛选适龄已审核活动；若无匹配活动，返回 null（禁止兜底到未审核或不适龄活动，由 UI 呈现真实空状态）
 * 3. 若用户未建档（profile === null），返回已审核的通用精选活动（由 UI 明确标记为“通用探索推荐”）
 * 4. 严禁回退到 allActivities[0] 或任何未审核活动
 */
export const getTodayFeaturedActivity = (
  profile: BabyProfile | null,
  allActivities: Activity[]
): Activity | null => {
  const reviewed = getReviewedActivities(allActivities);
  if (reviewed.length === 0) {
    return null; // 绝无已审核活动兜底，返回 null 触发空状态
  }

  const effectiveMonths = getEffectiveBabyMonths(profile);

  let pool: Activity[] = [];
  let cacheKeySuffix = 'unregistered';

  if (effectiveMonths !== null) {
    // 已设置月龄：严格适龄匹配已审核池
    pool = reviewed.filter((act) => {
      const { min, max } = parseAgeRange(act.ageRange);
      return effectiveMonths >= min && effectiveMonths <= max;
    });

    if (pool.length === 0) {
      // 当前月龄暂无已审核活动：返回 null，杜绝伪造
      return null;
    }
    cacheKeySuffix = `age_${effectiveMonths}`;
  } else {
    // 未建档：进入通用已审核活动池
    pool = reviewed;
    cacheKeySuffix = 'unregistered';
  }

  const dateKey = getLocalDateString();
  const cacheKey = `playmate_featured_${dateKey}_${cacheKeySuffix}`;

  // 优先从本地缓存读取
  try {
    const cachedId = localStorage.getItem(cacheKey);
    if (cachedId) {
      const found = pool.find((a) => a.id === cachedId);
      if (found) return found;
    }
  } catch {}

  // 基于日期的确定性哈希求和取模
  let dateHashSum = 0;
  for (let i = 0; i < dateKey.length; i++) {
    dateHashSum += dateKey.charCodeAt(i);
  }
  const index = dateHashSum % pool.length;
  const selected = pool[index];

  // 固化到当天缓存
  try {
    localStorage.setItem(cacheKey, selected.id);
  } catch {}

  return selected;
};

/**
 * 从活动建议时长字符串中解析推荐分钟数（默认 5 分钟）
 */
export const getRecommendedMinutes = (durationStr: string): number => {
  if (!durationStr || typeof durationStr !== 'string') return 5;
  const match = durationStr.match(/(\d+)/);
  if (match) {
    const val = parseInt(match[1], 10);
    return isNaN(val) || val <= 0 ? 5 : val;
  }
  return 5;
};

/**
 * 校验实际陪玩秒数是否达到建议时长的 80% 门槛
 */
export const checkIsCompletedByDuration = (elapsedSeconds: number, durationStr: string): boolean => {
  const recMins = getRecommendedMinutes(durationStr);
  const minRequiredSeconds = recMins * 60 * 0.8;
  return elapsedSeconds >= minRequiredSeconds;
};

/**
 * 获取活动的专属高精绘本插画路径（带全量关键词智能回退）
 */
export const getActivityCoverImage = (activity: Partial<Activity> | null | undefined): string => {
  if (!activity) return '/assets/activities/seek_hide_seek_detail.png';
  if (activity.coverImage) return activity.coverImage;

  const id = activity.id || '';
  const title = activity.title || '';

  if (id === 'act-01' || title.includes('沙沙响') || title.includes('纸条')) return '/assets/activities/paper_sound_detail.png';
  if (id === 'act-02' || title.includes('飞机')) return '/assets/activities/airplane_tummy_detail.png';
  if (id === 'act-03' || title.includes('触觉盒') || title.includes('抓抓乐')) return '/assets/activities/sensory_box_detail.png';
  if (id === 'act-04' || title.includes('照镜子') || title.includes('鬼脸')) return '/assets/activities/mirror_face_detail.png';
  if (id === 'act-05' || title.includes('躲猫猫')) return '/assets/activities/seek_hide_seek_detail.png';
  if (id === 'act-06' || title.includes('小星星') || title.includes('瓶子')) return '/assets/activities/glitter_bottle_detail.png';
  if (id === 'act-07' || title.includes('拍拍鼓') || title.includes('节奏')) return '/assets/activities/drum_rhythm_detail.png';
  if (id === 'act-08' || title.includes('抓大球') || title.includes('大球') || title.includes('小手抓')) return '/assets/activities/ball_grasp_detail.png';
  if (id === 'act-09' || title.includes('声音模仿') || title.includes('双向对话')) return '/assets/activities/vocal_imitation_detail.png';
  if (id === 'act-10' || title.includes('推推乐')) return '/assets/activities/block_stack_push_detail.png';
  if (id === 'act-11' || title.includes('拉长音') || title.includes('小动物')) return '/assets/activities/animal_sounds_detail.png';
  if (id === 'act-12' || title.includes('手绢') || title.includes('抽抽乐')) return '/assets/activities/handkerchief_pull_detail.png';
  if (id === 'act-13' || title.includes('脚丫')) return '/assets/activities/foot_discovery_detail.png';
  if (id === 'act-14' || title.includes('抱抱')) return '/assets/activities/teddy_hug_detail.png';
  if (id === 'act-15' || title.includes('寻宝')) return '/assets/activities/cup_treasure_detail.png';
  if (id === 'act-16' || title.includes('搬运工') || title.includes('积木')) return '/assets/activities/soft_block_mover_detail.png';
  if (id === 'act-17' || title.includes('摇摆时光') || title.includes('摇摇乐')) return '/assets/activities/music_sway_detail.png';
  if (id === 'act-18' || title.includes('鼓掌') || title.includes('拍手')) return '/assets/activities/hand_clapping_detail.png';
  if (id === 'act-19' || title.includes('嗅觉')) return '/assets/activities/scent_sniff_detail.png';
  if (id === 'act-20' || title.includes('爬行') || title.includes('向前够') || title.includes('俯卧')) return '/assets/activities/tummy_crawling_detail.png';
  if (id === 'act-23' || title.includes('黑白卡')) return '/assets/activities/black_white_cards_detail.png';

  return '/assets/activities/seek_hide_seek_detail.png';
};

