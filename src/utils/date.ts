/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
 * 若未传入或格式非法，返回 null，严禁默认返回 7
 */
export const calculateMonthsFromBirthMonth = (birthMonthStr?: string | null): number | null => {
  if (!birthMonthStr || typeof birthMonthStr !== 'string') return null;
  const birth = new Date(`${birthMonthStr}-01`);
  const now = new Date();
  if (isNaN(birth.getTime()) || birth > now) return null;

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
};

/**
 * 展示月龄文本。未建档或无合法日期时返回空或友好提示，绝不默认返回“7个月”
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
