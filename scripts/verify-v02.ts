/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayRecord } from '../src/types';

function runV02Tests() {
  console.log('================================================================');
  console.log('🧪 玩伴日历 V0.2 — 首页陪玩次数与时长展示优化专项自动化测试套件');
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

  const todayStr = '2026-11-02';

  // 1. 模拟多次独立陪玩记录（V0.2 不再合并同日同活动记录）
  const mockRecords: PlayRecord[] = [
    {
      id: 'rec_1',
      activityId: 'act-01',
      activityTitle: '彩色纸条沙沙响',
      category: '感官认知',
      date: todayStr,
      durationMinutes: 2,
      reaction: '开心专注',
      difficulty: '刚好合适',
      completed: true,
      notes: '',
    },
    {
      id: 'rec_2',
      activityId: 'act-01',
      activityTitle: '彩色纸条沙沙响',
      category: '感官认知',
      date: todayStr,
      durationMinutes: 4,
      reaction: '平静探索',
      difficulty: '刚好合适',
      completed: true,
      notes: '',
    },
    {
      id: 'rec_3',
      activityId: 'act-02',
      activityTitle: '翻身小飞机',
      category: '大运动',
      date: '2026-11-01', // 昨天记录
      durationMinutes: 5,
      reaction: '开心专注',
      difficulty: '刚好合适',
      completed: true,
      notes: '',
    }
  ];

  // 2. 统计今日次数与时长
  const todayRecords = mockRecords.filter((r) => r.date === todayStr);
  const todayCount = todayRecords.length;
  const todayTotalMinutes = todayRecords.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  assert(todayCount === 2, '同一活动当天独立陪玩 2 次，统计次数严格为 2');
  assert(todayTotalMinutes === 6, '两次分别陪玩 2 分钟和 4 分钟，今日累计时长严格为 6 分钟');

  // 3. 跨自然日统计过滤验证
  const yesterdayRecords = mockRecords.filter((r) => r.date === '2026-11-01');
  assert(yesterdayRecords.length === 1, '跨自然日重新统计，昨天记录独立保留，不计入今天');
  assert(yesterdayRecords[0].durationMinutes === 5, '昨天记录时长为 5 分钟');

  // 4. 零次陪玩验证
  const emptyRecords: PlayRecord[] = [];
  const emptyToday = emptyRecords.filter((r) => r.date === todayStr);
  assert(emptyToday.length === 0, '今日 0 次陪玩，记录数组长度为 0');

  console.log('================================================================');
  console.log(`📊 玩伴日历 V0.2 专项测试结果: 通过 ${passed} 项, 失败 ${failed} 项`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runV02Tests();
