import React, { useState } from 'react';
import { Activity, BabyProfile } from '../types';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('全部类别');
  const [selectedAgeBracket, setSelectedAgeBracket] = useState<string>('all');

  const categories: string[] = ['全部类别', '大运动', '精细动作', '感官认知', '社会情绪', '语言交流'];

  // 严格统一月龄来源（未建档时为 null，绝不隐式回退到 6 个月）
  const effectiveMonths = getEffectiveBabyMonths(profile);

  const ageBrackets = [
    { key: 'all', label: '全部月龄' },
    ...(effectiveMonths !== null
      ? [{ key: 'matched', label: `适合宝宝 (${effectiveMonths}月龄)` }]
      : []),
    { key: '0-6', label: '0-6个月' },
    { key: '7-12', label: '7-12个月' },
    { key: '1-3', label: '1-3岁' },
  ];

  const filteredActivities = activities.filter((act) => {
    // 0. 严格全链路审核准入：未通过审核的一律排除
    if (!isActivityReviewed(act)) {
      return false;
    }

    // 1. 分类匹配
    const matchesCategory =
      selectedCategory === '全部类别' || selectedCategory === '全部' || act.category === selectedCategory;

    // 2. 严格月龄过滤（统一由 parseAgeRange 处理）
    const { min, max } = parseAgeRange(act.ageRange);
    let matchesAge = true;

    if (selectedAgeBracket === 'all') {
      matchesAge = true;
    } else if (selectedAgeBracket === 'matched') {
      if (effectiveMonths !== null) {
        matchesAge = effectiveMonths >= min && effectiveMonths <= max;
      } else {
        matchesAge = true;
      }
    } else if (selectedAgeBracket === '0-6') {
      matchesAge = min <= 6 && max >= 0;
    } else if (selectedAgeBracket === '7-12') {
      matchesAge = (min >= 7 && min <= 12) || (max >= 7 && max <= 12);
    } else if (selectedAgeBracket === '1-3') {
      matchesAge = min >= 12 || max >= 12;
    }

    return matchesCategory && matchesAge;
  });

  const handleActivityClick = (act: Activity) => {
    onSelectActivity(act);
  };

  return (
    <div className="space-y-3.5 pb-24 md:pb-12 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-4xl mx-auto">
      {/* 1. 月龄过滤与分类 Tabs 容器 */}
      <div className="space-y-2.5 my-1">
        {/* 月龄过滤胶囊栏 - 支持原生平滑横向滑动与首尾防截断内边距 */}
        <div className="overflow-x-auto scrollbar-none -mx-3.5 sm:-mx-4">
          <div
            className="flex items-center gap-2 px-4 py-1.5 flex-nowrap min-w-max"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {ageBrackets.map((bracket) => (
              <button
                key={bracket.key}
                onClick={() => setSelectedAgeBracket(bracket.key)}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedAgeBracket === bracket.key
                    ? 'bg-[#62AD78] text-white shadow-xs font-bold'
                    : 'bg-white text-[#45483F] border border-[#EDF4E9] hover:bg-[#EDF4E9]/60'
                }`}
              >
                {bracket.label}
              </button>
            ))}
          </div>
        </div>

        {/* 分类筛选横向滑动栏 */}
        <div className="overflow-x-auto scrollbar-none -mx-3.5 sm:-mx-4">
          <div
            className="flex items-center gap-2 px-4 py-1.5 flex-nowrap min-w-max"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#3F8054] text-white shadow-xs'
                    : 'bg-white text-[#45483F] border border-[#EDF4E9] hover:bg-[#EDF4E9]/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Activity Cards Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#F3EDE2] p-6 shadow-xs space-y-2">
          <div className="text-2xl">🌱</div>
          <p className="text-xs font-bold text-stone-700">未找到符合条件的已审核玩法</p>
          <p className="text-[11px] text-[#786F6A] max-w-sm mx-auto leading-relaxed">
            所有亲子互动均执行严格审核准入，高风险或未复核玩法已安全隔离。您可以尝试调整分类。
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

