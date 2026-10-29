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
        ageNotice: `暂无完全匹配 ${profile.currentMonths} 个月龄的专属活动，已为您展示精选已审核活动`,
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

  const accentBgMap = {
    sage: 'bg-[#A8B9A0]/20 text-[#54704B] border-[#A8B9A0]/30',
    apricot: 'bg-[#E8B58D]/20 text-[#B86834] border-[#E8B58D]/30',
    coral: 'bg-[#DFA39A]/20 text-[#A85C52] border-[#DFA39A]/30',
    blue: 'bg-[#A9BFCC]/20 text-[#4D6E82] border-[#A9BFCC]/30',
  };

  return (
    <div className="space-y-4 pb-24 md:pb-16 animate-in fade-in duration-200">
      
      {/* 1. Profile Status / Guidance Header */}
      {profile === null ? (
        <section className="bg-gradient-to-br from-[#FFF5EE] to-[#FFF9F3] rounded-3xl p-5 border border-[#F28C45]/30 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F28C45]/20 text-[#F28C45] flex items-center justify-center font-bold shrink-0">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#45433F]">还没有建立宝宝档案</h3>
              <p className="text-[11px] text-[#858078]">点击建立档案，解锁个性化陪伴与适龄推荐</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('profile')}
            className="px-4 py-2 rounded-full bg-[#F28C45] hover:bg-[#e07b36] text-white text-xs font-bold shadow-sm shrink-0 cursor-pointer"
          >
            去建档 →
          </button>
        </section>
      ) : (
        <section className="bg-white rounded-2xl px-3.5 py-2.5 border border-[#F1EAE0] shadow-xs flex items-center justify-between">
          <div 
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2 cursor-pointer group"
            title="点击修改宝宝档案"
          >
            <div className="w-7 h-7 rounded-xl bg-[#A8B9A0]/20 text-[#54704B] flex items-center justify-center font-bold shadow-xs group-hover:bg-[#A8B9A0]/30 transition-colors">
              <Baby className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-[#45433F] group-hover:text-[#B86834] transition-colors">
              {profile.name} · {profile.currentMonths}个月
            </span>
          </div>

          <div 
            onClick={() => onSelectTab('history')}
            className="bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#F1EAE0] text-xs font-semibold text-[#858078] cursor-pointer hover:bg-[#F1EAE0] transition-colors"
            title="查看陪玩历史记录"
          >
            今日 <span className="font-bold text-[#45433F] font-mono">{todayTotalMinutes}</span> 分钟
          </div>
        </section>
      )}

      {/* 适龄降级提示横幅（如有） */}
      {ageNotice && (
        <div className="bg-[#FFF9F3] border border-[#E8B58D]/40 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-[#B86834]">
          <AlertCircle className="w-4 h-4 text-[#F28C45] shrink-0" />
          <span>{ageNotice}</span>
        </div>
      )}

      {/* 2. Above-the-Fold Core: Today's Featured Activity Card */}
      {currentActivity && (
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F1EAE0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF7F2] text-[#45433F] border border-[#F1EAE0] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#E8B58D]" /> 今日专业推荐
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${accentBgMap[currentActivity.accentColor] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {currentActivity.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FAF7F2] text-[#858078] border border-[#F1EAE0]">
                适龄: {currentActivity.ageRange}
              </span>
            </div>
            <button
              onClick={handleShuffle}
              className="px-3 py-1 rounded-full bg-[#FAF7F2] hover:bg-[#F1EAE0] text-xs font-medium text-[#45433F] flex items-center gap-1 transition-colors border border-[#F1EAE0] shadow-xs cursor-pointer"
              title="换一个玩法"
            >
              🔄 换个玩法
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            <div className="md:col-span-5 w-full h-[150px] sm:h-[160px] rounded-2xl bg-gradient-to-b from-[#F1EAE0]/60 via-[#FAF7F2] to-[#F1EAE0] p-2 relative overflow-hidden flex flex-col items-center justify-center border border-[#E8B58D]/20">
              <svg viewBox="0 0 320 180" className="w-full h-full object-contain" aria-label="亲子活动插画">
                <rect x="0" y="0" width="320" height="180" fill="#FAF7F2" />
                <rect x="0" y="140" width="320" height="40" fill="#EFE5D8" />
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

            <div className="md:col-span-7 space-y-2">
              <div>
                <h3 
                  onClick={() => onSelectActivity(currentActivity)}
                  className="text-base sm:text-lg font-bold text-[#45433F] hover:text-[#F28C45] transition-colors cursor-pointer mb-0.5"
                >
                  {currentActivity.title}
                </h3>
                <p className="text-xs text-[#858078] leading-relaxed line-clamp-2">{currentActivity.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#45433F]/75">
                <span className="flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-0.5 rounded-lg border border-[#F1EAE0]">
                  <Clock className="w-3.5 h-3.5 text-[#858078]" /> {currentActivity.duration}
                </span>
                <span className="bg-[#FAF7F2] px-2.5 py-0.5 rounded-lg border border-[#F1EAE0] truncate max-w-[180px]">
                  材料：{currentActivity.materials[0]}
                </span>
              </div>

              <div className="pt-0.5">
                <button
                  onClick={() => onStartPlay(currentActivity)}
                  className="w-full h-12 rounded-2xl bg-[#F28C45] hover:bg-[#e07b36] active:scale-[0.98] transition-all text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#F28C45]/25 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" /> ▶ 直接开玩
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 童趣灵感推荐区 */}
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#858078] flex items-center gap-1.5">
            <span>✨ 更多专业陪伴灵感</span>
          </h3>
          <button
            onClick={handleShuffle}
            className="text-xs text-[#F28C45] hover:text-[#e07b36] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>换一批</span>
          </button>
        </div>

        <div className="space-y-2">
          {backupActivities.map((act) => {
            const categoryConfig: Record<string, { icon: string; bg: string; text: string; badge: string }> = {
              '感官认知': { icon: '🎨', bg: 'bg-[#A8B9A0]/20', text: 'text-[#54704B]', badge: 'bg-[#A8B9A0]/15 text-[#54704B]' },
              '大运动': { icon: '✈️', bg: 'bg-[#E8B58D]/25', text: 'text-[#B86834]', badge: 'bg-[#E8B58D]/15 text-[#B86834]' },
              '精细动作': { icon: '🧸', bg: 'bg-[#A9BFCC]/25', text: 'text-[#4D6E82]', badge: 'bg-[#A9BFCC]/15 text-[#4D6E82]' },
              '语言交流': { icon: '💬', bg: 'bg-[#DFA39A]/25', text: 'text-[#A85C52]', badge: 'bg-[#DFA39A]/15 text-[#A85C52]' },
              '社会情绪': { icon: '🌟', bg: 'bg-[#F28C45]/20', text: 'text-[#F28C45]', badge: 'bg-[#F28C45]/15 text-[#F28C45]' },
            };
            const cfg = categoryConfig[act.category] || { icon: '🎈', bg: 'bg-[#FAF7F2]', text: 'text-[#F28C45]', badge: 'bg-orange-50 text-orange-600' };

            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="bg-white rounded-2xl p-3 border border-[#F1EAE0] shadow-xs hover:shadow-sm hover:border-[#E8B58D]/50 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                <div className={`w-11 h-11 rounded-2xl ${cfg.bg} flex items-center justify-center text-xl shrink-0 shadow-xs`}>
                  {cfg.icon}
                </div>

                <div className="grow min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cfg.badge}`}>
                      {act.category}
                    </span>
                    <span className="text-[10px] text-[#858078] font-mono">
                      ⏱ {act.duration}
                    </span>
                    <span className="text-[10px] text-[#858078] font-mono">
                      · 适龄 {act.ageRange}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#45433F] truncate">{act.title}</h4>
                  <p className="text-[11px] text-[#858078] truncate leading-tight">{act.subtitle}</p>
                </div>

                <div className="shrink-0">
                  <span className="px-3 py-1.5 rounded-full bg-[#FFF5EE] border border-[#F28C45]/30 text-xs font-bold text-[#F28C45] flex items-center gap-1">
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
