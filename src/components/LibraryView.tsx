/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, BabyProfile } from '../types';
import { Search, Lightbulb, ChevronRight } from 'lucide-react';
import { ActivityItemCard } from './ActivityItemCard';
import { getEffectiveBabyMonths } from '../utils/date';
import { isActivityReviewed, parseAgeRange } from '../utils/activity';

interface LibraryViewProps {
  activities: Activity[];
  profile?: BabyProfile | null;
  onSelectActivity: (activity: Activity) => void;
  onStartPlay: (activity: Activity) => void;
  isVip: boolean;
  onUpgradeVip: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  activities,
  profile,
  onSelectActivity,
  isVip,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedAgeBracket, setSelectedAgeBracket] = useState<string>('matched');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showExpertTip, setShowExpertTip] = useState(false);

  const categories: string[] = ['全部', '大运动', '精细动作', '感官认知', '社会情绪', '语言交流'];

  // 严格统一月龄来源（未建档时为 null，绝不隐式回退到 6 个月）
  const effectiveMonths = getEffectiveBabyMonths(profile);

  const ageBrackets = [
    {
      key: 'matched',
      label: effectiveMonths !== null ? `适合宝宝 (${effectiveMonths}月龄)` : '推荐探索',
    },
    { key: '0-6', label: '0-6个月' },
    { key: '7-12', label: '7-12个月' },
    { key: '1-3', label: '1-3岁' },
    { key: 'all', label: '全部月龄' },
  ];

  const filteredActivities = activities.filter((act) => {
    // 0. 严格全链路审核准入：未通过审核的一律排除
    if (!isActivityReviewed(act)) {
      return false;
    }

    // 1. 分类匹配
    const matchesCategory = selectedCategory === '全部' || act.category === selectedCategory;

    // 2. 关键词匹配
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.materials.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    // 3. 严格月龄过滤（统一由 parseAgeRange 处理）
    const { min, max } = parseAgeRange(act.ageRange);
    let matchesAge = true;
    if (selectedAgeBracket === 'matched') {
      if (effectiveMonths !== null) {
        matchesAge = effectiveMonths >= min && effectiveMonths <= max;
      } else {
        // 未建档时展示全部已审核玩法，不伪造 6 个月专属过滤
        matchesAge = true;
      }
    } else if (selectedAgeBracket === '0-6') {
      matchesAge = min <= 6 && max >= 0;
    } else if (selectedAgeBracket === '7-12') {
      matchesAge = (min >= 7 && min <= 12) || (max >= 7 && max <= 12);
    } else if (selectedAgeBracket === '1-3') {
      matchesAge = min >= 12 || max >= 12;
    }

    return matchesCategory && matchesSearch && matchesAge;
  });

  const handleActivityClick = (act: Activity) => {
    onSelectActivity(act);
  };

  return (
    <div className="space-y-3.5 pb-24 md:pb-12 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-4xl mx-auto">
      {/* 1. 顶部全宽搜索栏、月龄过滤与分类 Tabs */}
      <div className="space-y-2.5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#786F6A]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索活动名称、所需材料或技能..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white border border-[#F3EDE2] text-xs text-[#2C221E] placeholder-[#786F6A]/60 focus:outline-none focus:border-orange-400 shadow-xs"
          />
        </div>

        {/* 月龄过滤胶囊栏 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {ageBrackets.map((bracket) => (
            <button
              key={bracket.key}
              onClick={() => setSelectedAgeBracket(bracket.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedAgeBracket === bracket.key
                  ? 'bg-orange-500 text-white shadow-xs font-bold'
                  : 'bg-white text-stone-600 border border-[#F3EDE2] hover:bg-[#FAF8F5]'
              }`}
            >
              {bracket.label}
            </button>
          ))}
        </div>

        {/* 分类筛选横向滑动栏 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'bg-white text-[#2C221E]/80 border border-[#F3EDE2] hover:bg-[#FAF8F5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 紧凑可折叠的月龄陪伴小贴士胶囊 Banner */}
        <div
          className="bg-amber-50/80 border border-amber-200/70 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 shadow-xs cursor-pointer"
          onClick={() => setShowExpertTip(!showExpertTip)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300 shrink-0" />
            <span className="text-xs font-bold text-[#2C221E] truncate">
              💡 月龄陪伴小贴士：7-12月龄趣味大动作与小手探索
            </span>
          </div>
          <span className="text-[11px] text-amber-800 font-bold shrink-0 flex items-center gap-0.5">
            {showExpertTip ? '收起' : '详情'}{' '}
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${showExpertTip ? 'rotate-90' : ''}`}
            />
          </span>
        </div>

        {showExpertTip && (
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-3 text-xs text-[#786F6A] leading-relaxed animate-in fade-in">
            7-12月龄的宝宝越来越活泼好动，开始喜欢稳稳独坐、到处探索爬行和用小手指抓取物品。每天抽一点时间和宝宝玩玩互动小游戏，在轻松欢笑中陪伴宝宝自由探索！
          </div>
        )}
      </div>

      {/* 2. Activity Cards Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#F3EDE2] p-6 shadow-xs space-y-2">
          <div className="text-2xl">🌱</div>
          <p className="text-xs font-bold text-stone-700">未找到符合条件的已审核玩法</p>
          <p className="text-[11px] text-[#786F6A] max-w-sm mx-auto leading-relaxed">
            所有亲子互动均执行严格审核准入，高风险或未复核玩法已安全隔离。您可以尝试调整分类或搜索关键词。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {filteredActivities.map((act) => (
            <ActivityItemCard
              key={act.id}
              activity={act}
              onClick={() => handleActivityClick(act)}
              isVipUser={isVip}
            />
          ))}
        </div>
      )}
    </div>
  );
};
