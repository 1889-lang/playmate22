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

  const accentBgMap = {
    sage: 'bg-[#A8B9A0]/20 text-[#54704B] border-[#A8B9A0]/30',
    apricot: 'bg-[#E8B58D]/20 text-[#B86834] border-[#E8B58D]/30',
    coral: 'bg-[#DFA39A]/20 text-[#A85C52] border-[#DFA39A]/30',
    blue: 'bg-[#A9BFCC]/20 text-[#4D6E82] border-[#A9BFCC]/30',
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
            <h2 className="text-2xl font-bold text-[#45433F] tracking-tight">活动宝库 ({activities.length})</h2>
            <p className="text-xs text-[#858078]">精选 6-12 个月宝宝各发育领域的科学亲子游戏与互动指南</p>
          </div>
          {!isVip && (
            <button
              onClick={onUpgradeVip}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-amber-200 text-amber-200" /> 解锁 VIP
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858078]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索活动名称、所需材料或技能（如：纸条、抓握、坐姿...）"
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-[#F1EAE0] text-xs text-[#45433F] placeholder-[#858078]/60 focus:outline-none focus:border-[#F28C45] shadow-xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#45433F] text-white shadow-xs'
                  : 'bg-white text-[#45433F]/80 border border-[#F1EAE0] hover:bg-[#F1EAE0]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* VIP Expert Tips Section ("专家敏感期解读") */}
        <div className="bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-[#FAF7F2] border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 fill-amber-300 text-amber-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#45433F]">💡 育儿专家敏感期解读：7-12月龄大运动与精细动作飞跃</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900">VIP特约</span>
            </div>
            <p className="text-xs text-[#858078] leading-relaxed">
              此阶段宝宝正处于坐姿独立、爬行萌芽及手指捏取发育的关键期。通过适度的趣味亲子互动游戏，能有效刺激前庭觉与神经髓鞘发育，为独立行走和手眼协调奠定坚实基础。
            </p>
          </div>
        </div>

        <div className="text-xs text-[#858078] flex items-center justify-between pt-1">
          <span>共找到 {filteredActivities.length} 个科学亲子活动</span>
        </div>
      </div>

      {/* Activity Cards Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#F1EAE0] p-8 shadow-xs">
          <BookOpen className="w-12 h-12 text-[#858078]/40 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#45433F] mb-1">未找到相关活动</h3>
          <p className="text-xs text-[#858078]">请尝试更换搜索关键词或分类筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map((act) => {
            const isLocked = act.isVip && !isVip;
            return (
              <div
                key={act.id}
                onClick={() => handleActivityClick(act)}
                className={`bg-white rounded-3xl p-5 border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  isLocked ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-[#F1EAE0]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${accentBgMap[act.accentColor]}`}>
                        {act.category}
                      </span>
                      <span className="text-[11px] text-[#858078]">适龄 {act.ageRange}</span>
                    </div>
                    {act.isVip ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        {!isLocked ? <Crown className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3" />} VIP 专享
                      </span>
                    ) : (
                      <span className="text-xs text-[#858078] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {act.duration}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#45433F] mb-1 flex items-center gap-2">
                      {act.title}
                    </h3>
                    <p className="text-xs text-[#858078] leading-relaxed line-clamp-2">{act.subtitle}</p>
                  </div>

                  {/* Materials preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {act.materials.slice(0, 3).map((m, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] text-[11px] text-[#45433F]/75 border border-[#F1EAE0]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F1EAE0]">
                  <span className="text-[11px] text-[#858078]">{act.developmentalDomain}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(act);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-[#45433F] text-xs font-semibold hover:bg-[#F1EAE0] transition-colors cursor-pointer"
                    >
                      详情
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPlayClick(act);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer ${
                        isLocked
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-[#F28C45] hover:bg-[#e07b36] text-white'
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
