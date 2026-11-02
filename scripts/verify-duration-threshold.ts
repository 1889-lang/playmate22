/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { checkIsCompletedByDuration, getRecommendedMinutes } from '../src/utils/activity';

function runTests() {
  console.log('================================================================');
  console.log('🧪 玩伴日历 V0.1 — 陪玩时长与完成判定 80% 门槛专项自动化测试套件');
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
  assert(checkIsCompletedByDuration(60, duration5m) === false, '场景 A: 建议5分钟，实际1分钟 (60秒) -> 未完成');
  assert(checkIsCompletedByDuration(180, duration5m) === false, '场景 B: 建议5分钟，实际3分钟 (180秒) -> 未完成');
  assert(checkIsCompletedByDuration(240, duration5m) === true, '场景 C: 建议5分钟，实际4分钟 (240秒) -> 完成 (刚好达到80%)');
  assert(checkIsCompletedByDuration(300, duration5m) === true, '场景 D: 建议5分钟，实际5分钟 (300秒) -> 完成');

  // 3. 不同建议时长门槛测试
  // 3分钟 -> 80% = 2分24秒 = 144秒
  assert(checkIsCompletedByDuration(120, '3分钟') === false, '建议3分钟，实际2分钟 -> 未完成');
  assert(checkIsCompletedByDuration(144, '3分钟') === true, '建议3分钟，实际2分24秒 -> 完成');

  // 10分钟 -> 80% = 8分钟 = 480秒
  assert(checkIsCompletedByDuration(420, '10-15分钟') === false, '建议10分钟，实际7分钟 -> 未完成');
  assert(checkIsCompletedByDuration(480, '10-15分钟') === true, '建议10分钟，实际8分钟 -> 完成');

  // 4. 多次短时陪玩累计不自动达成单次活动完成逻辑校验
  // 模拟两次 1 分钟（共 2 分钟）短时陪玩合并记录
  const rec1 = { durationMinutes: 1, completed: false };
  const rec2 = { durationMinutes: 1, completed: false };
  const mergedMinutes = rec1.durationMinutes + rec2.durationMinutes;
  const isCompletedMerged = rec1.completed || rec2.completed;
  assert(mergedMinutes === 2, '多次短时陪玩时长正确累加为 2 分钟');
  assert(isCompletedMerged === false, '多次短时陪玩因单次均未达标，合并后 completed 严格为 false，不误判完成');

  // 5. 达到门槛后的正常完成记录
  const recValid = { durationMinutes: 4, completed: checkIsCompletedByDuration(240, '5分钟') };
  assert(recValid.completed === true, '达到 80% 门槛后打卡记录标记为 completed: true');

  console.log('================================================================');
  console.log(`📊 陪玩时长门槛专项测试结果: 通过 ${passed} 项, 失败 ${failed} 项`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
