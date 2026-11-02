/**
 * Automated test script for Stage 1 (P0-01 to P0-06) verification
 */

import { calculateMonthsFromBirthMonth, getEffectiveBabyMonths } from '../src/utils/date';
import { isActivityReviewed, isActivityEligibleForAge, getTodayFeaturedActivity, getReviewedActivities } from '../src/utils/activity';
import { INITIAL_ACTIVITIES } from '../src/data/activities';
import { Activity, BabyProfile } from '../src/types';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail: string = '') {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${testName} - ${detail}`);
    failCount++;
  }
}

console.log('====================================================');
console.log('🧪 开始执行 玩伴日历 V0.1 — 阶段一 P0 完整验收测试套件');
console.log('====================================================\n');

// ----------------------------------------------------
// P0-01: VIP 活动与免费活动机制一致性
// ----------------------------------------------------
console.log('--- 测试 P0-01：VIP 活动机制与打卡数据完整性 ---');
const vipAct21 = INITIAL_ACTIVITIES.find((a) => a.id === 'act-21');
assert(!!vipAct21, '存在 VIP 活动 act-21 (独立扶站学步游)');
assert(vipAct21?.isVip === true, 'act-21 标识为 VIP 专属');
assert(vipAct21?.isReviewed === true, 'act-21 通过安全审核');
assert(Array.isArray(vipAct21?.steps) && (vipAct21?.steps.length ?? 0) >= 3, 'act-21 拥有完整陪玩三步法步骤');
assert(!!vipAct21?.observationTips && vipAct21.observationTips.length > 0, 'act-21 具有观察要点');
assert(!!vipAct21?.safetyReminder && vipAct21.safetyReminder.length > 5, 'act-21 具有明确安全防护提醒');

// ----------------------------------------------------
// P0-02: 分类与内容匹配，彻底消除病理体征暗示
// ----------------------------------------------------
console.log('\n--- 测试 P0-02：内容分类匹配与无病理暗示词检查 ---');
assert(vipAct21?.category === '大运动', 'act-21 明确归属于“大运动”分类，非语言交流');
const act21Text = JSON.stringify(vipAct21);
const forbiddenTerms = ['内扣', '外八', '病理', '落后', '黄金期', '缺陷', '脑发育科学'];
let foundForbidden = false;
for (const term of forbiddenTerms) {
  if (act21Text.includes(term)) {
    foundForbidden = true;
    console.error(`在 act-21 中发现禁止词汇: ${term}`);
  }
}
assert(!foundForbidden, 'act-21 彻底移除所有下肢病理暗示词汇（如内扣、外八、落后等）');

// 全局活动库审查
let globalForbiddenCount = 0;
for (const act of INITIAL_ACTIVITIES) {
  const fullText = JSON.stringify(act);
  for (const term of forbiddenTerms) {
    if (fullText.includes(term)) {
      globalForbiddenCount++;
      console.error(`活动 ${act.id} 包含违规词汇: ${term}`);
    }
  }
}
assert(globalForbiddenCount === 0, '全量 22 个活动数据零包含医疗诊断、病理暗示或焦虑营销词汇');

// ----------------------------------------------------
// P0-03: 跳过建档不生成虚假宝宝档案
// ----------------------------------------------------
console.log('\n--- 测试 P0-03：跳过建档访客模式与零虚假档案 ---');
const uncreatedBabyMonths = getEffectiveBabyMonths(null);
assert(uncreatedBabyMonths === null, '未建档用户 profile 为 null 时，有效月龄严格返回 null，不默认生成 6 个月');

// ----------------------------------------------------
// P0-04: 出生月份与月龄计算逻辑
// ----------------------------------------------------
console.log('\n--- 测试 P0-04：出生月份计算与严格边界校验 ---');
const refDate = new Date('2026-11-15'); // 基准时间：2026年11月

// 1. 出生月份为当前月份
const resCurrent = calculateMonthsFromBirthMonth('2026-11', refDate);
assert(resCurrent === 0, '出生月份为当前月份 (2026-11 -> 0个月)', `Got ${resCurrent}`);

// 2. 出生月份为上个月
const resPrev = calculateMonthsFromBirthMonth('2026-10', refDate);
assert(resPrev === 1, '出生月份为上个月 (2026-10 -> 1个月)', `Got ${resPrev}`);

// 3. 出生月份跨年
const resCrossYear = calculateMonthsFromBirthMonth('2025-11', refDate);
assert(resCrossYear === 12, '出生月份跨年 (2025-11 -> 12个月)', `Got ${resCrossYear}`);

// 4. 出生月份为闰年2月
const resLeapYear = calculateMonthsFromBirthMonth('2024-02', refDate);
assert(resLeapYear === 33, '出生月份为闰年2月 (2024-02 -> 33个月)', `Got ${resLeapYear}`);

// 5. 出生月份在未来
const resFutureYear = calculateMonthsFromBirthMonth('2027-01', refDate);
assert(resFutureYear === null, '出生月份在未来年份 (2027-01 -> null)', `Got ${resFutureYear}`);

const resFutureMonth = calculateMonthsFromBirthMonth('2026-12', refDate);
assert(resFutureMonth === null, '出生月份在未来月份 (2026-12 -> null)', `Got ${resFutureMonth}`);

// 6. 出生月份为空
const resEmpty = calculateMonthsFromBirthMonth('', refDate);
assert(resEmpty === null, '出生月份为空字符串 -> null', `Got ${resEmpty}`);

const resNull = calculateMonthsFromBirthMonth(null, refDate);
assert(resNull === null, '出生月份为 null -> null', `Got ${resNull}`);

// 7. 出生月份格式非法
const resInvalid1 = calculateMonthsFromBirthMonth('invalid-date', refDate);
assert(resInvalid1 === null, '出生月份格式非法 (invalid-date) -> null', `Got ${resInvalid1}`);

const resInvalid2 = calculateMonthsFromBirthMonth('2025-13', refDate);
assert(resInvalid2 === null, '出生月份超出合法月份 (2025-13) -> null', `Got ${resInvalid2}`);

const resInvalid3 = calculateMonthsFromBirthMonth('2025/08', refDate);
assert(resInvalid3 === null, '出生月份分隔符非法 (2025/08) -> null', `Got ${resInvalid3}`);

// 8. 用户只选择月龄（估算模式），没有提供出生月份
const estimatedProfile: BabyProfile = {
  name: '小明',
  currentMonths: 8,
  favoriteCategories: ['感官认知'],
  ageSource: 'estimated',
};
const effEstimated = getEffectiveBabyMonths(estimatedProfile);
assert(effEstimated === 8, '估算月龄模式有效月龄为 8', `Got ${effEstimated}`);
assert(estimatedProfile.birthMonth === undefined, '估算月龄模式下 birthMonth 为 undefined，未伪造出生日期');

// ----------------------------------------------------
// P0-05: 严格活动审核准入准则与零回退
// ----------------------------------------------------
console.log('\n--- 测试 P0-05：严格活动审核准入准则与零回退机制 ---');
const mockActivityBase = {
  subtitle: '测试副标题',
  category: '感官认知' as const,
  duration: '5分钟',
  materials: ['毛巾'],
  prerequisite: '无',
  steps: [{ stepNumber: 1, title: '步1', description: '说明' }],
  parentPrompt: '提示',
  observationTips: ['技巧'],
  alternativePlay: '替代',
  developmentalDomain: '认知',
  safetyReminder: '提醒',
  stopCondition: '停止',
  source: '来源',
  accentColor: 'sage' as const,
};

const actA: Activity = {
  ...mockActivityBase,
  id: 'test-A',
  title: '已审核活动A',
  ageRange: '6-8个月',
  isReviewed: true,
  reviewStatus: 'approved',
};

const actB: Activity = {
  ...mockActivityBase,
  id: 'test-B',
  title: '未审核活动B',
  ageRange: '6-8个月',
  isReviewed: false,
  reviewStatus: 'pending_safety_audit',
};

const actC: any = {
  ...mockActivityBase,
  id: 'test-C',
  title: '缺少isReviewed活动C',
  ageRange: '6-8个月',
};

const actD: any = {
  ...mockActivityBase,
  id: 'test-D',
  title: 'isReviewed为null活动D',
  ageRange: '6-8个月',
  isReviewed: null,
};

const actE: any = {
  ...mockActivityBase,
  id: 'test-E',
  title: 'isReviewed类型异常活动E',
  ageRange: '6-8个月',
  isReviewed: 'true',
};

const actF: Activity = {
  ...mockActivityBase,
  id: 'test-F',
  title: '已审核但不适龄活动F',
  ageRange: '12-18个月',
  isReviewed: true,
  reviewStatus: 'approved',
};

const actG: Activity = {
  ...mockActivityBase,
  id: 'test-G',
  title: '已审核且适龄活动G',
  ageRange: '6-8个月',
  isReviewed: true,
  reviewStatus: 'approved',
};

// 准入过滤测试
assert(isActivityReviewed(actA) === true, '用例 A: isReviewed===true & approved 准入通过');
assert(isActivityReviewed(actB) === false, '用例 B: isReviewed===false 拦截成功');
assert(isActivityReviewed(actC) === false, '用例 C: 缺少 isReviewed 拦截成功');
assert(isActivityReviewed(actD) === false, '用例 D: isReviewed===null 拦截成功');
assert(isActivityReviewed(actE) === false, '用例 E: isReviewed 为字符串类型异常 拦截成功');
assert(isActivityReviewed(actF) === true, '用例 F: 审核状态准入通过');
assert(isActivityReviewed(actG) === true, '用例 G: 审核状态准入通过');

// 适龄匹配测试（月龄 7 个月）
assert(isActivityEligibleForAge(actA, 7) === true, '用例 A: 7个月适龄匹配通过');
assert(isActivityEligibleForAge(actB, 7) === false, '用例 B: 未审核活动即便月龄匹配也拦截');
assert(isActivityEligibleForAge(actF, 7) === false, '用例 F: 12-18个月活动在7个月时不匹配');
assert(isActivityEligibleForAge(actG, 7) === true, '用例 G: 7个月适龄匹配通过');

// 零回退与空状态测试
const poolOnlyUnreviewed = [actB, actC, actD, actE];
const featuredNoReviewed = getTodayFeaturedActivity(null, poolOnlyUnreviewed);
assert(featuredNoReviewed === null, '没有已审核活动时，绝不回退到 allActivities[0]，必须返回 null');

const poolAgeMismatch = [actF];
const profile7m: BabyProfile = { name: '宝宝', currentMonths: 7, favoriteCategories: ['感官认知'], ageSource: 'estimated' };
const featuredAgeMismatch = getTodayFeaturedActivity(profile7m, poolAgeMismatch);
assert(featuredAgeMismatch === null, '已审核活动无适龄匹配时，绝不强行推荐不适龄活动，必须返回 null');

// ----------------------------------------------------
// P0-06: 高风险婴幼儿活动安全隔离状态
// ----------------------------------------------------
console.log('\n--- 测试 P0-06：高风险婴幼儿活动安全隔离状态 ---');
const highRiskIds = ['act-02', 'act-03', 'act-06', 'act-10', 'act-14', 'act-15', 'act-17', 'act-19', 'act-22'];
let allHighRiskQuarantined = true;

for (const id of highRiskIds) {
  const act = INITIAL_ACTIVITIES.find((a) => a.id === id);
  if (!act) {
    allHighRiskQuarantined = false;
    console.error(`未在活动库中找到高风险活动 ${id}`);
    continue;
  }
  const isQuarantined = act.isReviewed === false && act.reviewStatus === 'pending_safety_audit' && !!act.auditReason;
  if (!isQuarantined) {
    allHighRiskQuarantined = false;
    console.error(`活动 ${id} (${act.title}) 未被正确隔离！isReviewed=${act.isReviewed}, status=${act.reviewStatus}`);
  }
}

assert(allHighRiskQuarantined, '所有识别出的 9 项高风险或需复核活动 (小零件/水宝宝/托举悬空/香囊气味等) 均已被隔离');

const reviewedList = getReviewedActivities(INITIAL_ACTIVITIES);
const reviewedHasHighRisk = reviewedList.some((a) => highRiskIds.includes(a.id));
assert(!reviewedHasHighRisk, '正式已审核推荐池中 0 包含任何高风险被隔离活动');

console.log('\n====================================================');
console.log(`📊 测试汇总: 通过 ${passCount} 项, 失败 ${failCount} 项`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
