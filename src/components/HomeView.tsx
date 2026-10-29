/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, PlayRecord, BabyProfile } from '../types';
import { Clock, Play, Sparkles, Baby, AlertCircle } from 'lucide-react';
import { getLocalDateStr } from '../utils/date';

interface HomeViewProps {
  activities: Activity[];
  records: PlayRecord[];
  profile: BabyProfile | null;
  onSelectTab: (tab: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onStartPlay: (activity: Activity) => void;
}

/**
 * 解析适龄范围字符串（例如 "6-8个月" -> min: 6, max: 8；"9-12+" -> min: 9, max: 99）
 */
function parseAgeRange(ageRangeStr: string): { min: number; max: number } {
  const cleaned = ageRangeStr.replace(/个月/g, '').trim();
  if (cleaned.includes('+')) {
    const minVal = parseInt(cleaned.replace('+', ''), 10) || 0;
    return { min: minVal, max: 99 };
  }
  const parts = cleaned.split('-');
  if (parts.length === 2) {
    return { min: parseInt(parts[0], 10) || 0, max: parseInt(parts[1], 10) || 99 };
  }
  const single = parseInt(cleaned, 10);
  if (!isNaN(single)) {
    return { min: single, max: single };
  }
  return { min: 0, max: 99 };
}

/**
 * Fisher-Yates 随机洗牌算法
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  let currentIndex = arr.length;
  let temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }
  return arr;
}

export const HomeView: React.FC<HomeViewProps> = ({
  activities,
  records,
  profile,
  onSelectTab,
  onSelectActivity,
  onStartPlay,
}) => {
  const [shuffleKey, setShuffleKey] = useState(0);

  // 1. 安全底线拦截：强制要求 activity.isReviewed === true
  const reviewedActivities = useMemo(() => {
    return activities.filter((a) => a.isReviewed === true);
  }, [activities]);

  // 2. 适龄匹配过滤与优雅降级
  const { filteredPool, ageNotice } = useMemo(() => {
    if (!profile || !profile.currentMonths) {
      return { filteredPool: reviewedActivities, ageNotice: null };
    }

    const ageMatched = reviewedActivities.filter((a) => {
      const { min, max } = parseAgeRange(a.ageRange);
      return profile.currentMonths >= min && profile.currentMonths <= max;
    });

    if (ageMatched.length > 0) {
      return { filteredPool: ageMatched, ageNotice: null };
    } else {
      return {
        filteredPool: reviewedActivities,
        ageNotice: `暂无完全匹配 ${profile.currentMonths}个月龄的专属活动，已为您展示精选已审核活动`,
      };
    }
  }, [reviewedActivities, profile]);

  // 3. 首页真洗牌算法（Fisher-Yates Shuffle）
  const shuffledPool = useMemo(() => {
    return fisherYatesShuffle(filteredPool);
  }, [filteredPool, shuffleKey]);

  const currentActivity = shuffledPool[0] || reviewedActivities[0] || activities[0];
  const backupActivities = shuffledPool.slice(1, 4);

  const handleShuffle = () => {
    setShuffleKey((prev) => prev + 1);
  };

  const todayStr = getLocalDateStr();
  const todayRecords = records.filter((r) => r.date === todayStr);
  const todayTotalMinutes = todayRecords.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // 多元化马卡龙微透胶囊色体系
  const categoryConfig: Record<string, { icon: string; bg: string; text: string; border: string }> = {
    '语言交流': { icon: '💬', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/70' },
    '社会情绪': { icon: '🌟', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/70' },
    '感官认知': { icon: '🎨', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/70' },
    '大运动': { icon: '✈️', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/70' },
    '精细动作': { icon: '🧸', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/70' },
  };

  return (
    <div className="space-y-4 pb-24 md:pb-16 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-3xl mx-auto">
      
      {/* 1. Unregistered Gift Package Banner (Only when unregistered) */}
      {profile === null && (
        <section className="bg-gradient-to-br from-[#FFF5EE] via-[#FFF9F3] to-[#FDF6F0] rounded-3xl p-5 sm:p-6 border border-[#F3EDE2] shadow-[0_10px_30px_-10px_rgba(234,138,92,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 mb-1 whitespace-nowrap">
                ✨ 定制专属成长方案
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[#2C221E] truncate">还没有建立宝宝档案</h3>
              <p className="text-[11px] text-[#786F6A] truncate">填入宝宝信息，立即开启全周期脑发育科学陪伴</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('profile')}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-orange-500/25 shrink-0 whitespace-nowrap cursor-pointer transition-transform active:scale-95"
          >
            立即去建档 →
          </button>
        </section>
      )}

      {/* 右下角悬浮亲子能量挂件（Floating Capsule Widget for Registered Users） */}
      {profile !== null && (
        <div
          onClick={() => onSelectTab('profile')}
          className="fixed right-4 bottom-20 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(251,146,60,0.25)] border border-orange-100 cursor-pointer transition-transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300"
          title="点击查看宝宝档案与陪伴能量"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold shrink-0 shadow-xs overflow-hidden">
            <Baby className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⏰</span>
            <span className="text-xs font-extrabold text-orange-600 font-mono">
              {todayTotalMinutes}m
            </span>
          </div>
        </div>
      )}

      {/* 适龄降级提示横幅（如有） */}
      {ageNotice && (
        <div className="bg-[#FFF9F3] border border-orange-200/60 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#B86834]">
          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="truncate">{ageNotice}</span>
        </div>
      )}

      {/* 2. Above-the-Fold Core: Today's Featured Activity Card (Directly at top) */}
      {currentActivity && (
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-[#F3EDE2] shadow-[0_12px_35px_-12px_rgba(44,34,30,0.07)] relative overflow-hidden">
          {/* 顶部标签栏（严格防挤压、禁止折行） */}
          <div className="flex items-center justify-between mb-3 gap-1 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-0 shrink-0">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#2C221E] border border-[#F3EDE2] flex items-center gap-0.5 shrink-0 whitespace-nowrap shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-500" /> 今日推荐
              </span>
              {(() => {
                const cfg = categoryConfig[currentActivity.category] || { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
                return (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {currentActivity.category}
                  </span>
                );
              })()}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FAF8F5] text-[#786F6A] border border-[#F3EDE2] shrink-0 whitespace-nowrap">
                {currentActivity.ageRange.replace('个月', '月龄')}
              </span>
            </div>
            <button
              onClick={handleShuffle}
              className="px-2.5 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#F3EDE2] text-[11px] font-medium text-[#2C221E] flex items-center gap-1 transition-colors border border-[#F3EDE2] shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
              title="换一个玩法"
            >
              🔄 换个玩法
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            {/* 场景感插画容器 */}
            <div className="md:col-span-5 w-full h-[150px] sm:h-[170px] rounded-2xl bg-gradient-to-b from-[#FAF8F5] via-white to-[#F7F2EC] p-2.5 relative overflow-hidden flex flex-col items-center justify-center border border-[#F3EDE2] shadow-inner">
              <svg viewBox="0 0 320 180" className="w-full h-full object-contain" aria-label="亲子活动插画">
                <rect x="0" y="0" width="320" height="180" fill="#FAF8F5" />
                <rect x="0" y="140" width="320" height="40" fill="#EFE5D8" rx="8" />
                <ellipse cx="160" cy="152" rx="100" ry="10" fill="#E2D4C3" opacity="0.6" />
                <path d="M70 120 Q160 100 250 120 L270 150 Q160 165 50 150 Z" fill="#A8B9A0" opacity="0.25" />
                
                <g transform="translate(100, 70)">
                  <path d="M15 25 Q30 10 50 20 L58 65 Q35 85 10 75 Z" fill="#E8B58D" />
                  <circle cx="32" cy="5" r="12" fill="#DDB896" />
                </g>
                <g transform="translate(180, 85)">
                  <ellipse cx="25" cy="40" rx="20" ry="6" fill="#C5B5A2" opacity="0.4" />
                  <circle cx="25" cy="16" r="10" fill="#DDB896" />
                  <path d="M12 26 Q25 18 38 26 L42 42 Q25 48 8 42 Z" fill="#DFA39A" />
                </g>
              </svg>
            </div>

            <div className="md:col-span-7 space-y-2.5">
              <div>
                <h3 
                  onClick={() => onSelectActivity(currentActivity)}
                  className="text-base sm:text-lg font-bold text-[#2C221E] hover:text-orange-600 transition-colors cursor-pointer mb-0.5 truncate"
                >
                  {currentActivity.title}
                </h3>
                <p className="text-xs text-[#786F6A] leading-relaxed line-clamp-2">{currentActivity.subtitle}</p>
              </div>

              {/* 游戏属性与材料（严格防挤压） */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="flex items-center gap-1 bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#F3EDE2] text-[#2C221E] font-medium shrink-0 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-orange-500" /> {currentActivity.duration}
                </span>
                <span className="bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#F3EDE2] text-[#786F6A] truncate max-w-[180px] shrink-0">
                  📦 材料：{currentActivity.materials[0]}
                </span>
              </div>

              {/* 核心亮点标签 */}
              <div className="text-[11px] text-orange-700 bg-orange-50/70 border border-orange-200/50 rounded-xl px-3 py-1 font-medium truncate">
                <span>🌟 核心价值：{currentActivity.developmentalDomain}</span>
              </div>

              {/* CTA 按钮 */}
              <div className="pt-0.5">
                <button
                  onClick={() => onStartPlay(currentActivity)}
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 hover:opacity-95 active:scale-[0.98] transition-all text-white shadow-md shadow-orange-500/25 cursor-pointer flex flex-col items-center justify-center gap-0.5 py-1.5"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm shrink-0 whitespace-nowrap">
                    <Play className="w-3.5 h-3.5 fill-white" /> 开始 {currentActivity.duration} 互动游戏
                  </div>
                  <span className="text-[10px] text-white/90 font-medium tracking-wide shrink-0 whitespace-nowrap">
                    免准备 · 随手即玩 · 专业专家指导
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 童趣灵感推荐区 */}
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#786F6A] flex items-center gap-1.5 uppercase tracking-wider">
            <span>✨ 更多专业陪伴灵感</span>
          </h3>
          <button
            onClick={handleShuffle}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>换一批</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {backupActivities.map((act) => {
            const cfg = categoryConfig[act.category] || { icon: '🎈', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/70' };

            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="bg-white rounded-3xl p-4 border border-[#F3EDE2] shadow-[0_8px_25px_-10px_rgba(44,34,30,0.04)] hover:shadow-md hover:border-orange-300/50 transition-all cursor-pointer flex items-center justify-between gap-3.5 active:scale-[0.99]"
              >
                {/* 左侧图标容器 */}
                <div className={`w-12 h-12 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center text-xl shrink-0 shadow-xs`}>
                  {cfg.icon}
                </div>

                {/* 中间信息区：层级重构 */}
                <div className="grow min-w-0 space-y-1">
                  <h4 className="text-sm font-bold text-[#2C221E] line-clamp-2 leading-snug">{act.title}</h4>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${cfg.bg} ${cfg.text} border ${cfg.border} shrink-0 whitespace-nowrap`}>
                      {act.category}
                    </span>
                    <span className="text-[10px] text-[#786F6A] font-mono shrink-0 whitespace-nowrap">
                      ⏱ {act.duration}
                    </span>
                    <span className="text-[10px] text-[#786F6A] font-mono shrink-0 whitespace-nowrap">
                      · 适龄 {act.ageRange}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#786F6A] line-clamp-1 leading-tight">
                    💡 价值：{act.subtitle}
                  </p>
                </div>

                {/* 右侧按钮 */}
                <div className="shrink-0 self-center">
                  <span className="px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-600 flex items-center gap-1 shadow-xs whitespace-nowrap">
                    去看看
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
