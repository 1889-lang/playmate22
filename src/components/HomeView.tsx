/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, PlayRecord, BabyProfile } from '../types';
import { Play, AlertCircle, RefreshCw } from 'lucide-react';
import { getLocalDateStr, getEffectiveBabyMonths } from '../utils/date';
import { getReviewedActivities, parseAgeRange } from '../utils/activity';
import { FloatingWidget, PausedSession } from './FloatingWidget';
import { ActivityItemCard } from './ActivityItemCard';

interface HomeViewProps {
  activities: Activity[];
  records: PlayRecord[];
  profile: BabyProfile | null;
  onSelectTab: (tab: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onStartPlay: (activity: Activity) => void;
  isVip?: boolean;
  pausedSession?: PausedSession | null;
  onResumeSession?: (session: PausedSession) => void;
}

/**
 * Fisher-Yates 随机洗牌算法（仅用于备选灵感列表换一批）
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
  pausedSession,
  onResumeSession,
}) => {
  // 1. 获取宝宝统一有效月龄
  const effectiveMonths = getEffectiveBabyMonths(profile);

  // 2. 严格安全底线拦截：候选池强制只接受已审核活动
  const reviewedActivities = useMemo(() => {
    return getReviewedActivities(activities);
  }, [activities]);

  // 3. 适龄候选池筛选
  const { filteredPool, ageNotice } = useMemo(() => {
    if (effectiveMonths === null) {
      return { filteredPool: reviewedActivities, ageNotice: null };
    }

    const ageMatched = reviewedActivities.filter((a) => {
      const { min, max } = parseAgeRange(a.ageRange);
      return effectiveMonths >= min && effectiveMonths <= max;
    });

    if (ageMatched.length > 0) {
      return { filteredPool: ageMatched, ageNotice: null };
    } else {
      return {
        filteredPool: [],
        ageNotice: `当前宝宝月龄（${effectiveMonths}个月）暂无已审核专属活动，请期待专业审核更新`,
      };
    }
  }, [reviewedActivities, effectiveMonths]);

  const todayStr = getLocalDateStr();
  const todayRecords = records.filter((r) => r.date === todayStr);
  const todayTotalMinutes = todayRecords.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  const [featuredOffset, setFeaturedOffset] = useState(0);
  const [isRefreshingFeatured, setIsRefreshingFeatured] = useState(false);

  // 4. 首页主推活动（支持换一换）
  const currentActivity = useMemo(() => {
    const pool = filteredPool.length > 0 ? filteredPool : reviewedActivities;
    if (pool.length === 0) return null;
    const dateKey = getLocalDateStr();
    let baseHash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      baseHash += dateKey.charCodeAt(i);
    }
    const index = (baseHash + featuredOffset) % pool.length;
    return pool[index];
  }, [filteredPool, reviewedActivities, featuredOffset]);

  const handleRefreshFeatured = () => {
    if (isRefreshingFeatured) return;
    setIsRefreshingFeatured(true);
    setFeaturedOffset((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshingFeatured(false);
    }, 400);
  };

  const [inspirationsShuffleKey, setInspirationsShuffleKey] = useState(0);

  const inspirationsShuffled = useMemo(() => {
    return fisherYatesShuffle(filteredPool);
  }, [filteredPool, inspirationsShuffleKey]);

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

  return (
    <div className="space-y-4 pb-32 md:pb-16 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-3xl mx-auto">
      
      {/* 1. 顶部品牌区 */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#2C221E] tracking-tight">玩伴日历</h1>
          <p className="text-xs text-[#786F6A] mt-0.5">今天，和宝宝一起发现世界的小美好</p>
        </div>
        {profile === null && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 flex items-center gap-1 shadow-xs select-none">
            🌱 探索模式
          </span>
        )}
      </div>

      {/* 右下角悬浮亲子能量挂件 */}
      {(profile !== null || pausedSession != null) && (
        <FloatingWidget
          isVip={isVip}
          profile={profile}
          todayTotalMinutes={todayTotalMinutes}
          onClick={() => onSelectTab('profile')}
          pausedSession={pausedSession}
          onResumeSession={onResumeSession}
        />
      )}

      {/* 适龄缺省提示横幅 */}
      {ageNotice && (
        <div className="bg-[#FFF9F3] border border-orange-200/60 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#B86834]">
          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="truncate">{ageNotice}</span>
        </div>
      )}

      {/* 今日推荐标题区 */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-stone-800 tracking-tight">今日推荐</h2>
          <p className="text-[11px] text-stone-500">每天一个，亲子时光更有趣</p>
        </div>
        <button
          onClick={handleRefreshFeatured}
          disabled={isRefreshingFeatured}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#F3EDE2] text-xs font-semibold text-stone-600 hover:bg-stone-50 flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-stone-400 ${isRefreshingFeatured ? 'animate-spin' : ''}`} />
          <span>换一换</span>
        </button>
      </div>

      {/* 2. 今日推荐卡片 */}
      {currentActivity ? (
        <section className="bg-white rounded-3xl border border-[#F3EDE2] shadow-[0_12px_35px_-12px_rgba(44,34,30,0.07)] overflow-hidden relative">
          
          {/* 1. 小型「🌱 推荐体验」标签 */}
          <div className="absolute top-3 left-3.5 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-800 shadow-xs border border-amber-100/70 flex items-center gap-1 select-none">
            <span>🌱 推荐体验</span>
          </div>

          {/* 2. 当前推荐活动的主题插画 */}
          <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-amber-50/30 relative rounded-t-3xl overflow-hidden flex items-center justify-center border-b border-orange-100/50">
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

          {/* 文本内容区：3. 活动标题 4. 活动副标题 5. 现有活动分类标签 6. 橙色主按钮「▶ 开始陪伴」 */}
          <div className="p-4 pt-3.5 bg-white rounded-b-3xl space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-100/80">
                  {currentActivity.category}
                </span>
                <span className="text-[11px] text-stone-400">
                  适龄：{currentActivity.ageRange.replace('个月', '月龄')}
                </span>
              </div>
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

            {/* 6. 橙色主按钮「▶ 开始陪伴」 */}
            <div className="pt-1">
              <button
                onClick={() => onStartPlay(currentActivity)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:opacity-95 active:scale-[0.98] transition-all text-white shadow-lg shadow-orange-300/40 cursor-pointer flex items-center justify-center gap-2 font-bold text-base tracking-wide"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>开始陪伴</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* 空状态卡片 */
        <section className="bg-white rounded-3xl p-8 border border-[#F3EDE2] text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl">
            🌱
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {effectiveMonths !== null ? `暂无适合 ${effectiveMonths} 个月龄的已审核活动` : '暂无可推荐的已审核活动'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            为保障婴幼儿游戏安全性，所有亲子玩法均需通过专业审核。高风险或未复核内容已安全隔离，您可以前往活动库探索其他月龄。
          </p>
          <button
            onClick={() => onSelectTab('library')}
            className="px-4 py-2 rounded-2xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
          >
            去活动宝库浏览 →
          </button>
        </section>
      )}

      {/* 3. 更多玩法区域（今天还想玩什么？） */}
      <section className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
            <span>今天还想玩什么？</span>
          </h3>
          {backupActivities.length > 0 && (
            <button
              onClick={handleRefreshInspirations}
              disabled={isRefreshingInspirations}
              className="group min-h-[44px] min-w-[44px] py-2 px-3 rounded-xl hover:bg-stone-100 active:scale-95 flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-all cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-50"
              title="换一批推荐灵感"
            >
              <RefreshCw
                className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${rotationCount * 360}deg)` }}
              />
              <span className="font-medium">换一批</span>
            </button>
          )}
        </div>

        {backupActivities.length > 0 ? (
          <div className={`space-y-2.5 transition-all duration-400 ease-out ${isRefreshingInspirations ? 'opacity-0 translate-y-1 scale-[0.99]' : 'opacity-100 translate-y-0 scale-100'}`}>
            {backupActivities.map((act) => (
              <ActivityItemCard
                key={act.id}
                activity={act}
                onClick={() => onSelectActivity(act)}
                isVipUser={isVip}
              />
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl p-6 text-center text-xs text-stone-400">
            暂无更多已审核的备选适龄活动
          </div>
        )}
      </section>

    </div>
  );
};
