/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity } from '../types';
import { Search, Clock, Play, Lock, Crown, Lightbulb, ChevronRight } from 'lucide-react';

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
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.materials.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categoryConfig: Record<string, { bg: string; text: string; border: string }> = {
    '感官认知': { bg: 'bg-emerald-50/80', text: 'text-emerald-700', border: 'border-emerald-200/70' },
    '大运动': { bg: 'bg-amber-50/85', text: 'text-amber-700', border: 'border-amber-200/70' },
    '精细动作': { bg: 'bg-rose-50/80', text: 'text-rose-700', border: 'border-rose-200/70' },
    '社会情绪': { bg: 'bg-indigo-50/80', text: 'text-indigo-700', border: 'border-indigo-200/70' },
    '语言交流': { bg: 'bg-purple-50/80', text: 'text-purple-700', border: 'border-purple-200/70' },
  };

  const handleActivityClick = (act: Activity) => {
    if (act.isVip && !isVip) {
      onUpgradeVip();
    } else {
      onSelectActivity(act);
    }
  };

  const handleStartPlayClick = (act: Activity) => {
    if (act.isVip && !isVip) {
      onUpgradeVip();
    } else {
      onStartPlay(act);
    }
  };

  return (
    <div className="space-y-3.5 pb-24 md:pb-12 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-4xl mx-auto">
      
      {/* 1. 顶部直接渲染搜索栏、分类 Tabs 与可折叠专家解读（无大标题挤占首屏） */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#786F6A]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索活动名称、所需材料或技能..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white border border-[#F3EDE2] text-xs text-[#2C221E] placeholder-[#786F6A]/60 focus:outline-none focus:border-orange-400 shadow-xs"
            />
          </div>
          {!isVip && (
            <button
              onClick={onUpgradeVip}
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-xs flex items-center gap-1 shrink-0 hover:opacity-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Crown className="w-3.5 h-3.5 fill-amber-200 text-amber-200" /> VIP
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
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
        <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 shadow-xs cursor-pointer" onClick={() => setShowExpertTip(!showExpertTip)}>
          <div className="flex items-center gap-2 min-w-0">
            <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-300 shrink-0" />
            <span className="text-xs font-bold text-[#2C221E] truncate">💡 专家敏感期解读：7-12月龄大动作与精细动作飞跃</span>
          </div>
          <span className="text-[11px] text-amber-800 font-bold shrink-0 flex items-center gap-0.5">
            {showExpertTip ? '收起' : '详情'} <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showExpertTip ? 'rotate-90' : ''}`} />
          </span>
        </div>

        {showExpertTip && (
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-3 text-xs text-[#786F6A] leading-relaxed animate-in fade-in">
            此阶段宝宝正处于坐姿独立、爬行萌芽及手指捏取发育的关键期。通过适度的趣味亲子互动游戏，能有效刺激前庭觉与神经髓鞘发育，为独立行走和手眼协调奠定坚实基础。
          </div>
        )}
      </div>

      {/* 2. Activity Cards Grid (首屏直接露出 1.5+ 张卡片) */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#F3EDE2] p-6 shadow-xs">
          <p className="text-xs text-[#786F6A]">未找到相关活动，请尝试更换关键词</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {filteredActivities.map((act) => {
            const isLocked = act.isVip && !isVip;
            const cfg = categoryConfig[act.category] || { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
            return (
              <div
                key={act.id}
                onClick={() => handleActivityClick(act)}
                className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-[0_8px_25px_-10px_rgba(44,34,30,0.04)] hover:shadow-md hover:border-orange-300/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isLocked ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-[#F3EDE2]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {act.category}
                      </span>
                      <span className="text-[11px] text-[#786F6A] shrink-0 whitespace-nowrap">适龄 {act.ageRange}</span>
                    </div>
                    {act.isVip ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0 whitespace-nowrap">
                        {!isLocked ? <Crown className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3" />} VIP 专享
                      </span>
                    ) : (
                      <span className="text-xs text-[#786F6A] flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-orange-500" /> {act.duration}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#2C221E] mb-0.5 line-clamp-1">
                      {act.title}
                    </h3>
                    <p className="text-xs text-[#786F6A] leading-relaxed line-clamp-1">{act.subtitle}</p>
                  </div>
                </div>

                {/* 底部精简：左侧材料，右侧单一高亮“开始玩”胶囊按钮 */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#F3EDE2] gap-2">
                  <span className="text-[11px] text-[#786F6A] truncate max-w-[200px]">
                    📦 {act.materials[0]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartPlayClick(act);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1 shadow-xs shrink-0 whitespace-nowrap cursor-pointer ${
                      isLocked
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white shadow-orange-500/20'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3 h-3" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    {isLocked ? '解锁VIP' : '开始玩'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
