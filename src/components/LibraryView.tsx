/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity } from '../types';
import { Search, Clock, BookOpen, Play, Lock, Crown, Lightbulb } from 'lucide-react';

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
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      
      {/* Header & Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#2C221E] tracking-tight">活动宝库 ({activities.length})</h2>
            <p className="text-xs text-[#786F6A]">精选 6-12 个月宝宝各发育领域的科学亲子游戏与互动指南</p>
          </div>
          {!isVip && (
            <button
              onClick={onUpgradeVip}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 hover:opacity-95 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-amber-200 text-amber-200" /> 解锁 VIP
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#786F6A]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索活动名称、所需材料或技能（如：纸条、抓握、坐姿...）"
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-[#F3EDE2] text-xs text-[#2C221E] placeholder-[#786F6A]/60 focus:outline-none focus:border-orange-400 shadow-xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'bg-white text-[#2C221E]/80 border border-[#F3EDE2] hover:bg-[#FAF8F5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* VIP Expert Tips Section ("专家敏感期解读") */}
        <div className="bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-[#FAF8F5] border border-amber-200/60 rounded-3xl p-5 flex items-start gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Lightbulb className="w-5 h-5 fill-amber-300 text-amber-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2C221E]">💡 育儿专家敏感期解读：7-12月龄大运动与精细动作飞跃</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900">VIP特约</span>
            </div>
            <p className="text-xs text-[#786F6A] leading-relaxed">
              此阶段宝宝正处于坐姿独立、爬行萌芽及手指捏取发育的关键期。通过适度的趣味亲子互动游戏，能有效刺激前庭觉与神经髓鞘发育，为独立行走和手眼协调奠定坚实基础。
            </p>
          </div>
        </div>

        <div className="text-xs text-[#786F6A] flex items-center justify-between pt-1">
          <span>共找到 {filteredActivities.length} 个科学亲子活动</span>
        </div>
      </div>

      {/* Activity Cards Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#F3EDE2] p-8 shadow-xs">
          <BookOpen className="w-12 h-12 text-[#786F6A]/40 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#2C221E] mb-1">未找到相关活动</h3>
          <p className="text-xs text-[#786F6A]">请尝试更换搜索关键词或分类筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map((act) => {
            const isLocked = act.isVip && !isVip;
            const cfg = categoryConfig[act.category] || { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
            return (
              <div
                key={act.id}
                onClick={() => handleActivityClick(act)}
                className={`bg-white rounded-3xl p-5 border shadow-[0_8px_25px_-10px_rgba(44,34,30,0.04)] hover:shadow-md hover:border-orange-300/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  isLocked ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-[#F3EDE2]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {act.category}
                      </span>
                      <span className="text-[11px] text-[#786F6A]">适龄 {act.ageRange}</span>
                    </div>
                    {act.isVip ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        {!isLocked ? <Crown className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3" />} VIP 专享
                      </span>
                    ) : (
                      <span className="text-xs text-[#786F6A] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" /> {act.duration}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2C221E] mb-1 flex items-center gap-2">
                      {act.title}
                    </h3>
                    <p className="text-xs text-[#786F6A] leading-relaxed line-clamp-2">{act.subtitle}</p>
                  </div>

                  {/* Materials preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {act.materials.slice(0, 3).map((m, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-[#FAF8F5] text-[11px] text-[#2C221E]/80 border border-[#F3EDE2]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F3EDE2]">
                  <span className="text-[11px] text-[#786F6A]">{act.developmentalDomain}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(act);
                      }}
                      className="px-3.5 py-1.5 rounded-2xl bg-[#FAF8F5] text-[#2C221E] text-xs font-semibold hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                    >
                      详情
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPlayClick(act);
                      }}
                      className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer ${
                        isLocked
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
                      {isLocked ? '解锁VIP' : '直接开玩'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
