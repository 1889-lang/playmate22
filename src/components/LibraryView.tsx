/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity } from '../types';
import { Search, Lightbulb, ChevronRight } from 'lucide-react';
import { ActivityItemCard } from './ActivityItemCard';

interface LibraryViewProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  onStartPlay: (activity: Activity) => void;
  isVip: boolean;
  onUpgradeVip: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  activities,
  onSelectActivity,
  onStartPlay,
  isVip,
  onUpgradeVip,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showExpertTip, setShowExpertTip] = useState(false);

  const categories: string[] = ['全部', '大运动', '精细动作', '感官认知', '社会情绪', '语言交流'];

  const filteredActivities = activities.filter((act) => {
    const matchesCategory = selectedCategory === '全部' || act.category === selectedCategory;
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.materials.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleActivityClick = (act: Activity) => {
    if (act.isVip && !isVip) {
      onUpgradeVip();
    } else {
      onSelectActivity(act);
    }
  };

  return (
    <div className="space-y-3.5 pb-24 md:pb-12 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-4xl mx-auto">
      {/* 1. 顶部直接渲染优雅的全宽搜索栏、分类 Tabs 与可折叠专家解读 */}
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

        {/* 紧凑可折叠的专家解读小胶囊 Banner */}
        <div
          className="bg-amber-50/80 border border-amber-200/70 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 shadow-xs cursor-pointer"
          onClick={() => setShowExpertTip(!showExpertTip)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300 shrink-0" />
            <span className="text-xs font-bold text-[#2C221E] truncate">
              💡 专家敏感期解读：7-12月龄大动作与精细动作飞跃
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
            此阶段宝宝正处于坐姿独立、爬行萌芽及手指捏取发育的关键期。通过适度的趣味亲子互动游戏，能有效刺激前庭觉与神经髓鞘发育，为独立行走和手眼协调奠定坚实基础。
          </div>
        )}
      </div>

      {/* 2. Activity Cards Grid（统一采用绘本杂志卡牌结构规范） */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#F3EDE2] p-6 shadow-xs">
          <p className="text-xs text-[#786F6A]">未找到相关活动，请尝试更换关键词</p>
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
