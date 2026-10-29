/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, PlayRecord, BabyProfile } from '../types';
import { Clock, Play, Sparkles, Baby, AlertCircle, ChevronRight, Smile, Star, Heart, Sun, RefreshCw } from 'lucide-react';
import { getLocalDateStr } from '../utils/date';

interface HomeViewProps {
  activities: Activity[];
  records: PlayRecord[];
  profile: BabyProfile | null;
  onSelectTab: (tab: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onStartPlay: (activity: Activity) => void;
  isVip?: boolean;
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
  isVip = false,
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

  // 3. 首页玩法呈现（主推活动确立为今日专属精选，备选列表支持独立换一批）
  const [inspirationsShuffleKey, setInspirationsShuffleKey] = useState(0);

  const featuredShuffled = useMemo(() => {
    return fisherYatesShuffle(filteredPool);
  }, [filteredPool]);

  const inspirationsShuffled = useMemo(() => {
    return fisherYatesShuffle(filteredPool);
  }, [filteredPool, inspirationsShuffleKey]);

  const currentActivity = featuredShuffled[0] || reviewedActivities[0] || activities[0];

  const backupActivities = useMemo(() => {
    const filtered = inspirationsShuffled.filter((a) => a.id !== currentActivity?.id);
    return filtered.slice(0, 3);
  }, [inspirationsShuffled, currentActivity]);

  const [isRefreshingInspirations, setIsRefreshingInspirations] = useState(false);
  const [rotationCount, setRotationCount] = useState(0);

  const handleRefreshInspirations = () => {
    if (isRefreshingInspirations) return;
    setIsRefreshingInspirations(true);
    setRotationCount((prev) => prev + 1);
    setInspirationsShuffleKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshingInspirations(false);
    }, 400);
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
    <div className="space-y-4 pb-32 md:pb-16 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-3xl mx-auto">
      
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

      {/* 右下角悬浮亲子能量挂件（Floating Capsule Widget with VIP Crown indicator） */}
      <div
        onClick={() => onSelectTab('profile')}
        className="fixed right-4 bottom-20 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(251,146,60,0.22)] border border-orange-100/80 cursor-pointer transition-transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300"
        title={profile ? `${profile.name}的成长档案 · 点击查看` : '点击查看宝宝档案与会员状态'}
      >
        <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
          {isVip && (
            <span
              className="absolute -top-1.5 -left-1 text-[13px] leading-none transform -rotate-[12deg] select-none filter drop-shadow-xs z-20 pointer-events-none"
              title="VIP 年卡会员"
            >
              👑
            </span>
          )}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold shadow-xs ${
            isVip
              ? 'bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300/80 text-amber-800'
              : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
          }`}>
            <Baby className={`w-4 h-4 ${isVip ? 'text-amber-700' : 'text-emerald-700'}`} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 pr-0.5">
          <span className="text-xs">⏰</span>
          <span className="text-xs font-extrabold text-orange-600 font-mono">
            {todayTotalMinutes}m
          </span>
        </div>
      </div>

      {/* 适龄降级提示横幅（如有） */}
      {ageNotice && (
        <div className="bg-[#FFF9F3] border border-orange-200/60 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#B86834]">
          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="truncate">{ageNotice}</span>
        </div>
      )}

      {/* 2. Above-the-Fold Core: Today's Featured Activity Card (Directly at top) */}
                  {currentActivity && (
        <section className="bg-white rounded-3xl border border-[#F3EDE2] shadow-[0_12px_35px_-12px_rgba(44,34,30,0.07)] overflow-hidden relative">
          
          {/* 插画区通栏贴顶（无内嵌小盒子与独立外部标签行） */}
          <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-amber-50/30 relative overflow-hidden flex items-center justify-center border-b border-orange-100/50">
            {/* 左上角轻盈自然融入式状态文本（一体化微标签，强化今日专属精选） */}
            <div className="absolute top-3 left-3.5 z-10 flex items-center gap-1 text-xs font-medium text-amber-800/80 select-none">
              <span className="text-amber-500">✨</span>
              <span>今日精选 · {currentActivity.category}</span>
            </div>

            {/* 装饰微光星星 */}
            <div className="absolute top-3.5 right-4 text-amber-400 text-xs animate-pulse select-none pointer-events-none">✨</div>
            <div className="absolute bottom-4 left-6 text-amber-300 text-[10px] select-none pointer-events-none">✨</div>
            <div className="absolute bottom-6 right-16 text-amber-400 text-xs select-none pointer-events-none">⭐</div>

            <svg viewBox="0 0 320 200" className="w-full h-full object-contain" aria-label="亲子活动插画">
              <rect x="0" y="0" width="320" height="200" fill="transparent" />
              <rect x="0" y="150" width="320" height="50" fill="#FDF3E3" opacity="0.6" rx="8" />
              <ellipse cx="160" cy="165" rx="110" ry="12" fill="#E8D5BC" opacity="0.4" />
              <path d="M60 130 Q160 110 260 130 L280 170 Q160 185 40 170 Z" fill="#A8B9A0" opacity="0.25" />
              
              <g transform="translate(105, 75)">
                <path d="M15 25 Q30 10 50 20 L58 65 Q35 85 10 75 Z" fill="#E8B58D" />
                <circle cx="32" cy="5" r="12" fill="#DDB896" />
              </g>
              <g transform="translate(175, 90)">
                <ellipse cx="25" cy="40" rx="20" ry="6" fill="#C5B5A2" opacity="0.4" />
                <circle cx="25" cy="16" r="10" fill="#DDB896" />
                <path d="M12 26 Q25 18 38 26 L42 42 Q25 48 8 42 Z" fill="#DFA39A" />
              </g>
            </svg>
          </div>

          {/* 下半部分：高质感杂志化信息流（Lovevery / Kinedu 风格） */}
          <div className="p-5 sm:p-6 bg-white">
            {/* 标题与副标题 */}
            <div>
              <h3 
                onClick={() => onSelectActivity(currentActivity)}
                className="text-lg font-bold text-stone-900 hover:text-orange-600 transition-colors cursor-pointer tracking-tight"
              >
                {currentActivity.title}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                {currentActivity.subtitle}
              </p>
            </div>

            {/* 单行横向参数条（横向紧凑收敛，严禁一长排竖着堆砌胶囊） */}
            <div className="bg-stone-50/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-stone-600 my-2.5">
              <span className="flex items-center gap-1 font-medium shrink-0">
                <span>⏱</span>
                <span>{currentActivity.duration}</span>
              </span>
              <span className="text-stone-300 text-[10px]">|</span>
              <span className="flex items-center gap-1 font-medium shrink-0">
                <span>👶</span>
                <span>{currentActivity.ageRange.replace('个月', '月龄')}</span>
              </span>
              <span className="text-stone-300 text-[10px]">|</span>
              <span 
                className="flex items-center gap-1 font-medium truncate max-w-[120px]"
                title={currentActivity.materials.join('、')}
              >
                <span>📦</span>
                <span className="truncate">
                  {currentActivity.materials && currentActivity.materials.length > 0
                    ? (currentActivity.materials[0].length > 6 
                        ? currentActivity.materials[0].slice(0, 5) + '…' 
                        : currentActivity.materials[0])
                    : '简易道具'}
                </span>
              </span>
            </div>
            {/* 主操作按钮（CTA）与底部标语 */}
            <div className="mt-3.5">
              <button
                onClick={() => onStartPlay(currentActivity)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:opacity-95 active:scale-[0.98] transition-all text-white shadow-lg shadow-orange-300/40 cursor-pointer flex items-center justify-center gap-2 font-bold text-sm tracking-wide"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>开始 {currentActivity.duration} 互动游戏</span>
              </button>
              <div className="text-center text-[11px] text-stone-400 mt-2">
                ✨ 免准备 · 随手即玩 · 专业专家指导
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 童趣灵感推荐区 */}
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
            <span>✨ 今天还想玩什么？</span>
          </h3>
          <button
            onClick={handleRefreshInspirations}
            disabled={isRefreshingInspirations}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap active:scale-95 disabled:opacity-75"
          >
            <RefreshCw
              className="w-3.5 h-3.5 transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${rotationCount * 360}deg)` }}
            />
            <span>换一批</span>
          </button>
        </div>

        <div className={`space-y-2.5 transition-all duration-400 ease-out ${isRefreshingInspirations ? 'opacity-0 translate-y-1 scale-[0.99]' : 'opacity-100 translate-y-0 scale-100'}`}>
          {backupActivities.map((act, index) => {
            const icons = [Sparkles, Smile, Star, Sun, Heart];
            const IconComponent = icons[index % icons.length];

            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="group bg-white rounded-3xl p-4 border border-[#F3EDE2] shadow-[0_8px_25px_-10px_rgba(44,34,30,0.04)] hover:shadow-md hover:border-orange-300/60 transition-all cursor-pointer flex items-center justify-between gap-3.5 active:scale-[0.99]"
              >
                {/* 左侧图标容器：升级为平滑可爱的矢量图标底座 */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100/50 flex items-center justify-center text-orange-600 shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* 中间信息区：从四行压缩为清晰的两行 */}
                <div className="grow min-w-0 space-y-1">
                  {/* 第一行：标题 + 耗时小胶囊 */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-stone-800 truncate group-hover:text-orange-600 transition-colors">
                      {act.title}
                    </h4>
                    <span className="bg-stone-100/80 text-stone-600 text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0">
                      ⏱ {act.duration}
                    </span>
                  </div>

                  {/* 第二行：分类标签 + 核心育儿价值 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-amber-100/60 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                      {act.category}
                    </span>
                    <p className="text-xs text-stone-500 truncate">
                      {act.subtitle}
                    </p>
                  </div>
                </div>

                {/* 右侧极简引导箭头 */}
                <div className="shrink-0 self-center pl-1">
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
