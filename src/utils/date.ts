import { BabyProfile } from '../types';

/**
 * 格式化本地日期 YYYY-MM-DD（杜绝东八区时间漂移）
 */
export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLocalDateStr = (d: Date = new Date()): string => {
  return getLocalDateString(d);
};

/**
 * 根据出生月份 YYYY-MM 精准计算当前月龄
 * - 严格校验 YYYY-MM 格式与月份合法性 (01-12)
 * - 不允许未来出生月份，返回 null
 * - 支持传入 referenceDate（默认为当前时间），便于跨年、跨月与边界测试
 * - 未传入或格式非法返回 null，严禁默认任何伪造月龄
 */
export const calculateMonthsFromBirthMonth = (
  birthMonthStr?: string | null,
  referenceDate: Date = new Date()
): number | null => {
  if (!birthMonthStr || typeof birthMonthStr !== 'string') return null;
  const trimmed = birthMonthStr.trim();
  const match = trimmed.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!match) return null;

  const birthYear = parseInt(match[1], 10);
  const birthMonth = parseInt(match[2], 10); // 1-12

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1; // 1-12

  // 不允许未来出生月份
  if (birthYear > refYear || (birthYear === refYear && birthMonth > refMonth)) {
    return null;
  }

  // 计算跨年跨月总月龄差
  const months = (refYear - birthYear) * 12 + (refMonth - birthMonth);
  return Math.max(0, months);
};

/**
 * 获取宝宝统一有效月龄
 * - 若 profile 为 null 或未建档，必须返回 null，严禁隐式回退到 6 个月！
 * - 若为真实出生年月模式且有 birthMonth，由出生年月统一计算
 * - 若为估算月龄模式且 currentMonths 为合法数字，使用估算月龄
 * - 未知时返回 null
 */
export const getEffectiveBabyMonths = (profile?: BabyProfile | null): number | null => {
  if (!profile) return null;

  if (profile.ageSource === 'birth_month' && profile.birthMonth) {
    const calculated = calculateMonthsFromBirthMonth(profile.birthMonth);
    if (calculated !== null) {
      return calculated;
    }
  }

  if (typeof profile.currentMonths === 'number' && !isNaN(profile.currentMonths) && profile.currentMonths >= 0) {
    return profile.currentMonths;
  }

  return null;
};

/**
 * 全局工具函数：实时动态获取宝宝当前月龄
 */
export const getCurrentBabyAge = (profile?: BabyProfile | null): number | null => {
  return getEffectiveBabyMonths(profile);
};

/**
 * 展示月龄文本。未建档或无合法日期时返回明确提示，绝不默认返回“6个月”或“7个月”
 */
export const calculateBabyAge = (birthDateStr?: string | null): string => {
  if (!birthDateStr) return '未设置月龄';
  const birth = new Date(birthDateStr.length === 7 ? `${birthDateStr}-01` : birthDateStr);
  const now = new Date();
  if (isNaN(birth.getTime()) || birth > now) return '新生儿';

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months <= 0) return `${Math.max(1, days)}天`;
  if (days === 0) return `${months}个月`;
  return `${months}个月零${days}天`;
};

export const formatBabyAge = (birthDateStr?: string | null): string => {
  if (!birthDateStr) return '未建档宝宝';
  return calculateBabyAge(birthDateStr);
};
