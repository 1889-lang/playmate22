/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, PlayRecord, BabyProfile } from '../types';
import { Play, AlertCircle } from 'lucide-react';
import { getLocalDateStr, getEffectiveBabyMonths } from '../utils/date';
import { getReviewedActivities, parseAgeRange } from '../utils/activity';

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
 * Fisher-Yates 随机洗牌算法（用于换一换灵感列表）
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

const cleanTitle = (title: string): string => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

const getFriendlyIntro = (act: Activity): string => {
  if (!act) return '';
  const sub = act.subtitle || '';
  if (sub.includes('听觉') || sub.includes('抓握')) {
    return '和宝宝一起听听奇妙的声音，引导宝宝伸手探索，享受轻松愉快的亲子互动时光。';
  }
  if (sub.includes('前庭') || sub.includes('运动') || sub.includes('平衡')) {
    return '带宝宝体验轻柔有趣的身体互动，在欢声笑语中感受充满活力的亲子时刻。';
  }
  if (sub.includes('触觉') || sub.includes('精细') || sub.includes('抓取')) {
    return '陪宝宝摸摸不同的小物件，用小手开启充满好奇的探索之旅。';
  }
  return `和宝宝一起进行有趣的${act.category}互动，在轻松陪伴中发现探索的小美好。`;
};

export const HomeView: React.FC<HomeViewProps> = ({
  activities,
  records,
  profile,
  onSelectTab,
  onSelectActivity,
  onStartPlay,
  isVip = false,
}) => {
  const effectiveMonths = getEffectiveBabyMonths(profile);

  const reviewedActivities = useMemo(() => {
    return getReviewedActivities(activities);
  }, [activities]);

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

  const [featuredOffset] = useState(0);

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

  const [inspirationsShuffleKey] = useState(0);

  const inspirationsShuffled = useMemo(() => {
    return fisherYatesShuffle(filteredPool.length > 0 ? filteredPool : reviewedActivities);
  }, [filteredPool, reviewedActivities, inspirationsShuffleKey]);

  const backupActivities = useMemo(() => {
    const filtered = inspirationsShuffled.filter((a) => a.id !== currentActivity?.id);
    return filtered.slice(0, 3);
  }, [inspirationsShuffled, currentActivity]);

  return (
    <div className="space-y-4 pb-32 md:pb-16 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-3xl mx-auto">
      
      {/* 1. 顶部 Header 结构（干净纯粹） */}
      <div className="flex items-center justify-between pt-3 pb-1">
        <div>
          <h1 className="text-xl font-bold text-[#45483F] tracking-tight">
            玩伴日历
          </h1>
          <p className="text-xs text-[#85877B] mt-1">今天，和宝宝一起发现世界的小美好</p>
        </div>
        {profile === null && (
          <span className="bg-[#EDF4E9] text-[#3F8054] border border-[#62AD78]/30 text-xs px-2.5 py-1 rounded-full font-medium select-none shadow-xs">
            🌱 探索模式
          </span>
        )}
      </div>

      {/* 适龄缺省提示横幅 */}
      {ageNotice && (
        <div className="bg-[#EDF4E9]/80 border border-[#62AD78]/30 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#3F8054]">
          <AlertCircle className="w-4 h-4 text-[#62AD78] shrink-0" />
          <span className="truncate">{ageNotice}</span>
        </div>
      )}

      {/* 2. 今日主推荐卡片（今日陪玩邀请卡，纯净无冗余） */}
      {currentActivity ? (
        <div className="bg-white rounded-3xl p-3 shadow-xs border border-[#EDF4E9] space-y-3">
          
          {/* 纯净插画区（无任何悬浮横幅或遮挡胶囊） */}
          <div 
            onClick={() => onSelectActivity(currentActivity)}
            className="w-full aspect-[4/3] rounded-2xl object-cover bg-[#EDF4E9]/40 relative overflow-hidden flex items-center justify-center cursor-pointer group"
          >
            <svg viewBox="0 0 320 240" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102" aria-label="北欧绘本育儿插画">
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FAF9F2" />
                  <stop offset="100%" stopColor="#EDF4E9" />
                </linearGradient>
              </defs>
              <rect width="320" height="240" fill="url(#bgGrad)" />
              <rect x="0" y="170" width="320" height="70" fill="#A8B9A0" opacity="0.35" />
              <ellipse cx="160" cy="190" rx="130" ry="16" fill="#62AD78" opacity="0.2" />
              
              <circle cx="65" cy="140" r="16" fill="#62AD78" opacity="0.5" />
              <rect x="235" y="135" width="22" height="22" rx="4" fill="#F5CF65" opacity="0.75" />
              <rect x="255" y="125" width="18" height="32" rx="4" fill="#E9A9B0" opacity="0.75" />

              <g transform="translate(130, 75)">
                <path d="M15 35 Q32 15 55 25 L65 85 Q35 105 5 95 Z" fill="#F17D70" opacity="0.9" />
                <circle cx="38" cy="14" r="16" fill="#F5CF65" opacity="0.9" />
                <path d="M22 12 Q38 -2 54 12 Q52 4 38 2 Q24 4 22 12 Z" fill="#3F8054" />
                <circle cx="32" cy="14" r="1.5" fill="#45483F" />
                <circle cx="44" cy="14" r="1.5" fill="#45483F" />
                <path d="M36 18 Q38 21 40 18" stroke="#E9A9B0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <circle cx="55" cy="55" r="7" fill="#F5CF65" opacity="0.9" />
              </g>
            </svg>
          </div>

          {/* 卡片文字与精致排版（一气呵成） */}
          <div className="px-1 pb-1 space-y-2.5">
            
            {/* 玩法标题 */}
            <h3
              onClick={() => onSelectActivity(currentActivity)}
              className="text-xl font-bold text-[#45483F] hover:text-[#3F8054] transition-colors cursor-pointer tracking-tight"
            >
              {cleanTitle(currentActivity.title)}
            </h3>

            {/* 温暖导引语 */}
            <p className="text-xs text-[#85877B] leading-relaxed line-clamp-2">
              {getFriendlyIntro(currentActivity)}
            </p>

            {/* 轻量标签 */}
            <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto scrollbar-none">
              <span className="bg-[#EDF4E9] text-[#3F8054] text-[11px] px-2.5 py-0.5 rounded-md font-medium border border-[#62AD78]/20">
                {currentActivity.category}
              </span>
              <span className="bg-[#EDF4E9] text-[#3F8054] text-[11px] px-2.5 py-0.5 rounded-md font-medium border border-[#62AD78]/20">
                亲子互动
              </span>
            </div>

            {/* 居中精致按钮（开始陪伴） */}
            <div className="pt-3 pb-1">
              <button
                onClick={() => onStartPlay(currentActivity)}
                className="mx-auto w-3/5 max-w-[200px] h-11 bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>开始陪伴</span>
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* 空状态卡片 */
        <div className="bg-white rounded-3xl p-8 border border-[#EDF4E9] text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EDF4E9] text-[#3F8054] flex items-center justify-center text-2xl">
            🌱
          </div>
          <h3 className="text-base font-bold text-[#45483F]">
            {effectiveMonths !== null ? `暂无适合 ${effectiveMonths} 个月龄的已审核活动` : '暂无可推荐的已审核活动'}
          </h3>
          <p className="text-xs text-[#85877B] max-w-sm mx-auto leading-relaxed">
            为保障婴幼儿游戏安全性，所有亲子玩法均需通过专业审核。高风险或未复核内容已安全隔离，您可以前往活动库探索其他月龄。
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onSelectTab('library')}
              className="w-3/5 max-w-[200px] h-11 bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>去活动宝库浏览 →</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. 下方「今天还想玩什么？」三列插画画廊 */}
      <div className="space-y-2.5 pt-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#45483F]">今天还想玩什么？</h3>
          <button
            onClick={() => onSelectTab('library')}
            className="text-xs text-[#3F8054] font-medium hover:text-[#62AD78] transition-colors cursor-pointer"
          >
            更多玩法 ›
          </button>
        </div>

        {backupActivities.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5">
            {backupActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="bg-white rounded-2xl p-2.5 border border-[#EDF4E9] shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer group flex flex-col items-center text-center justify-between select-none"
              >
                <div className="w-full aspect-square rounded-2xl object-cover bg-[#EDF4E9]/50 relative overflow-hidden flex items-center justify-center mb-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" aria-label="活动小图">
                    <rect width="100" height="100" fill="#FAF9F2" />
                    <circle cx="50" cy="50" r="26" fill="#A8B9A0" opacity="0.4" />
                    <path d="M30 65 Q50 40 70 65 Z" fill="#62AD78" opacity="0.8" />
                    <circle cx="50" cy="38" r="10" fill="#F5CF65" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-[#45483F] line-clamp-1 group-hover:text-[#3F8054] transition-colors w-full px-0.5">
                  {cleanTitle(act.title)}
                </h4>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-[#85877B] border border-[#EDF4E9]">
            暂无更多已审核的备选适龄活动
          </div>
        )}
      </div>

    </div>
  );
};
