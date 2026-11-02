/**
 * Automated test script for Stage 2-1 (P1-01, P1-02, P1-03) verification
 */

import fs from 'fs';
import path from 'path';
import { INITIAL_ACTIVITIES } from '../src/data/activities';
import { Activity } from '../src/types';

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

console.log('================================================================');
console.log('🧪 玩伴日历 V0.1 — 阶段二-1：3 大线上缺陷修复自动化测试');
console.log('================================================================\n');

// ----------------------------------------------------------------
// P1-01: 校验宝宝档案页绝无内部设计规范卡泄露
// ----------------------------------------------------------------
console.log('=== 【P1-01】宝宝档案页泄漏设计规范卡彻底移除测试 ===');
const profileViewPath = path.resolve(process.cwd(), 'src/components/ProfileView.tsx');
const profileViewContent = fs.readFileSync(profileViewPath, 'utf-8');

const forbiddenDesignTerms = [
  'Design System V1.0',
  '标准圆角 (rx=24%)',
  '暖橙琥珀渐变底板',
  'SVG 矢量源码',
  '512×512 HD',
  '192×192 PWA',
  '下载 SVG 源码',
  '512px PNG 头像',
  '192px PNG 规格',
  'handleDownloadIcon',
  'downloadToast',
];

let leakCount = 0;
for (const term of forbiddenDesignTerms) {
  if (profileViewContent.includes(term)) {
    leakCount++;
    console.error(`ProfileView 仍残存内部设计规范词: ${term}`);
  }
}
assert(leakCount === 0, 'ProfileView.tsx 100% 清理全部内部设计系统与开发下载卡片，0 泄漏');

// 确认档案核心业务代码完好无损
assert(profileViewContent.includes('handleSave'), '档案保存逻辑 handleSave 完好无损');
assert(profileViewContent.includes('calculateMonthsFromBirthMonth'), '精准月龄计算函数完好保留');
assert(profileViewContent.includes('onResetAllData') && profileViewContent.includes('showResetConfirm'), '重置清空全部数据弹窗与逻辑完好保留');
assert(profileViewContent.includes('profileMode'), '真实出生年月与直接选月龄双模式完好保留');

// ----------------------------------------------------------------
// P1-02: 校验海报默认插画分类匹配、无孤立大Emoji/沙漏图案，且不含无入口手记
// ----------------------------------------------------------------
console.log('\n=== 【P1-02】海报默认插画分类匹配与无冗余手记测试 ===');
const polaroidModalPath = path.resolve(process.cwd(), 'src/components/PolaroidModal.tsx');
const polaroidModalContent = fs.readFileSync(polaroidModalPath, 'utf-8');

// 确认不再有 110px 孤立大 Emoji 绘制
assert(!polaroidModalContent.includes("font = '110px"), '已彻底移除 110px 巨大孤立 Emoji 绘制代码');

// 确认具备分类专属插画绘制分支
assert(polaroidModalContent.includes("cat.includes('大运动')"), '具备“大运动”分类专属绘本插画逻辑');
assert(polaroidModalContent.includes("cat.includes('精细')"), '具备“精细动作”分类专属绘本插画逻辑');
assert(polaroidModalContent.includes("cat.includes('感官')"), '具备“感官认知”分类专属绘本插画逻辑');
assert(polaroidModalContent.includes("cat.includes('社会')"), '具备“社会情绪”分类专属绘本插画逻辑');

// 确认不包含未提供入口的手记展示逻辑
assert(!polaroidModalContent.includes('notes?: string;'), 'PolaroidModalProps 接口已移除未提供入口的 notes 字段');

// 检查 PlayFeedbackModal 是否未包含多余手记输入框
const feedbackModalPath = path.resolve(process.cwd(), 'src/components/PlayFeedbackModal.tsx');
const feedbackModalContent = fs.readFileSync(feedbackModalPath, 'utf-8');
assert(!feedbackModalContent.includes('userNote'), 'PlayFeedbackModal 严格遵守规定：不新增宝宝手记输入框');

// 检查 HistoryView
const historyViewPath = path.resolve(process.cwd(), 'src/components/HistoryView.tsx');
const historyViewContent = fs.readFileSync(historyViewPath, 'utf-8');
assert(!historyViewContent.includes('notes={polaroidRecord.notes}'), 'HistoryView 调用 PolaroidModal 时保持干净简洁');

// ----------------------------------------------------------------
// P1-03: 校验 VIP 详情及全活动详情绝无“要点：要点：”重复
// ----------------------------------------------------------------
console.log('\n=== 【P1-03】VIP详情及全活动消除“要点：要点：”重复测试 ===');

// 1. 检查数据源 act-21
const act21 = INITIAL_ACTIVITIES.find((a) => a.id === 'act-21');
assert(Boolean(act21), '存在 act-21 活动');
const act21Tip = act21?.observationTips?.[0] || '';
assert(!act21Tip.startsWith('要点：') && !act21Tip.startsWith('要点:'), 'act-21 数据源彻底移除了开头的“要点：”前缀');

// 2. 检查全量 22 个活动的数据源，均不得有开头的“要点：”
let tipPrefixCount = 0;
for (const act of INITIAL_ACTIVITIES) {
  if (act.observationTips) {
    for (const tip of act.observationTips) {
      if (/^(要点|提示|注意)[：:]/.test(tip)) {
        tipPrefixCount++;
        console.error(`活动 ${act.id} observationTips 仍有重复前缀: ${tip}`);
      }
    }
  }
}
assert(tipPrefixCount === 0, '全量 22 个活动数据源 0 包含开头的“要点/提示/注意”前缀');

// 3. 检查 ActivityDetailModal.tsx 是否具备前缀自动剥离防重机制
const detailModalPath = path.resolve(process.cwd(), 'src/components/ActivityDetailModal.tsx');
const detailModalContent = fs.readFileSync(detailModalPath, 'utf-8');
assert(
  detailModalContent.includes('.replace(/^(要点|提示|注意)[：:]\\s*/, \'\')'),
  'ActivityDetailModal 具有前缀正则自动消除防御机制，从根本上杜绝重复渲染'
);

// ----------------------------------------------------------------
// 阶段一基线回归验证
// ----------------------------------------------------------------
console.log('\n=== 阶段一 P0 基线零破坏回归校验 ===');
assert(act21?.isReviewed === false, 'act-21 仍严格处于安全隔离状态');
assert(act21?.reviewStatus === 'pending_safety_audit', 'act-21 reviewStatus 仍为 pending_safety_audit');

console.log('\n================================================================');
console.log(`📊 阶段二-1 测试汇总: 全部 ${passCount} 项断言通过，失败 ${failCount} 项`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
}
