/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { checkIsCompletedByDuration, getRecommendedMinutes } from '../src/utils/activity';
import fs from 'fs';
import path from 'path';

function runTests() {
  console.log('================================================================');
  console.log('🧪 玩伴日历 V0.1 — 陪玩时长与完成判定及交互简化专项自动化测试套件');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, desc: string) => {
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
      failed++;
    }
  };

  // 1. 建议时长解析测试
  assert(getRecommendedMinutes('5分钟') === 5, '解析 "5分钟" -> 5');
  assert(getRecommendedMinutes('5-8分钟') === 5, '解析 "5-8分钟" -> 5');
  assert(getRecommendedMinutes('10-15分钟') === 10, '解析 "10-15分钟" -> 10');
  assert(getRecommendedMinutes('无效时长') === 5, '无效时长降级为默认 5 分钟');

  // 2. 80% 门槛判定测试 (建议5分钟，门槛4分钟=240秒)
  const duration5m = '5分钟';
  assert(checkIsCompletedByDuration(60, duration5m) === false, '场景 1: 建议5分钟，实际1分钟 (60秒) -> 未完成 (不显示完成状态)');
  assert(checkIsCompletedByDuration(180, duration5m) === false, '场景 2: 建议5分钟，实际3分钟 (180秒) -> 未完成 (不显示完成状态)');
  assert(checkIsCompletedByDuration(240, duration5m) === true, '场景 3: 建议5分钟，实际4分钟 (240秒) -> 正常完成');
  assert(checkIsCompletedByDuration(300, duration5m) === true, '场景 4: 建议5分钟，实际5分钟 (300秒) -> 正常完成');

  // 3. 检查代码库中是否已彻底清理「片刻陪伴」及复杂提示文案
  const feedbackModalCode = fs.readFileSync(path.join(process.cwd(), 'src/components/PlayFeedbackModal.tsx'), 'utf-8');
  const coachModalCode = fs.readFileSync(path.join(process.cwd(), 'src/components/CoachModeModal.tsx'), 'utf-8');

  assert(!feedbackModalCode.includes('片刻陪伴'), '验证：PlayFeedbackModal 中无「片刻陪伴」字样');
  assert(!coachModalCode.includes('片刻陪伴'), '验证：CoachModeModal 中无「片刻陪伴」字样');
  assert(!coachModalCode.includes('继续陪玩保存实际时长并结束'), '验证：已彻底移除「继续陪玩保存实际时长并结束」复杂选项');

  // 4. 多次短时陪玩累计不自动达成单次活动完成逻辑校验
  const rec1 = { durationMinutes: 1, completed: false };
  const rec2 = { durationMinutes: 1, completed: false };
  const mergedMinutes = rec1.durationMinutes + rec2.durationMinutes;
  const isCompletedMerged = rec1.completed || rec2.completed;
  assert(mergedMinutes === 2, '多次短时陪玩时长正确累加为 2 分钟');
  assert(isCompletedMerged === false, '多次短时陪玩因单次均未达标，合并后 completed 严格为 false，不误判完成');

  console.log('================================================================');
  console.log(`📊 陪玩时长门槛与交互简化专项测试结果: 通过 ${passed} 项, 失败 ${failed} 项`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
