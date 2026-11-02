/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, PlayRecord, BabyProfile } from '../types';
import { Clock, Play, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getLocalDateStr, getEffectiveBabyMonths } from '../utils/date';
import { getReviewedActivities, getTodayFeaturedActivity, parseAgeRange } from '../utils/activity';
import { safeStorage } from '../utils/storage';
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
  // 1. 获取宝宝统一有效月龄（未建档时严格为 null，严禁隐式回退到 6 个月）
  const effectiveMonths = getEffectiveBabyMonths(profile);

  // 2. 严格安全底线拦截：候选池强制只接受已审核活动
  const reviewedActivities = useMemo(() => {
    return getReviewedActivities(activities);
  }, [activities]);

  // 3. 适龄候选池筛选（若无匹配则保持空，绝不拿未审核或不适龄活动冒充）
  const { filteredPool, ageNotice } = useMemo(() => {
    if (effectiveMonths === null) {
      // 未建档访客状态：进入全部已审核活动的通用池
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
  const todayTotalMinutes = todayRecords.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // 4. 首页主推活动（确定性哈希与缓存锁定，刷新及切换永不跳变）
  const currentActivity = useMemo(() => {
    return getTodayFeaturedActivity(profile, activities);
  }, [activities, profile]);

  // 今日主推荐活动是否已完成打卡
  const todayRecordForHero = useMemo(() => {
    if (!currentActivity) return null;
    const fromStorage = safeStorage.get<boolean>(`today_completed_${todayStr}_${currentActivity.id}`, false);
    const fromRecords = records.find(
      (r) => r.activityId === currentActivity.id && r.date === todayStr && (r.durationMinutes || 0) > 0
    );
    if (fromStorage && !fromRecords) {
      return { durationMinutes: 1 } as PlayRecord;
    }
    return fromRecords || null;
  }, [records, currentActivity, todayStr]);

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
      
      {/* 1. 未建档轻量引导卡片（仅未建档时展示，明确提示访客状态） */}
      {profile === null && (
        <section className="bg-gradient-to-br from-[#FFF5EE] via-[#FFF9F3] to-[#FDF6F0] rounded-3xl p-5 sm:p-6 border border-[#F3EDE2] shadow-[0_10px_30px_-10px_rgba(234,138,92,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 mb-1 whitespace-nowrap">
                🌱 访客探索模式
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[#2C221E] truncate">还没有建立宝宝档案</h3>
              <p className="text-[11px] text-[#786F6A] truncate">设置真实宝宝月龄，获取个性化适龄安全指导</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('profile')}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-orange-500/25 shrink-0 whitespace-nowrap cursor-pointer transition-transform active:scale-95"
          >
            去设置宝宝月龄 →
          </button>
        </section>
      )}

      {/* 右下角悬浮亲子能量挂件（已建档或有暂存陪玩会话时展示） */}
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

      {/* 适龄缺省提示横幅（无匹配适龄活动时展示，绝不伪装不适龄推荐） */}
      {ageNotice && (
        <div className="bg-[#FFF9F3] border border-orange-200/60 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#B86834]">
          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="truncate">{ageNotice}</span>
        </div>
      )}

      {/* 2. 今日主推卡片（无内容时展示安全空状态，杜绝 fallback 到未审核活动） */}
      {currentActivity ? (
        <section className="bg-white rounded-3xl border border-[#F3EDE2] shadow-[0_12px_35px_-12px_rgba(44,34,30,0.07)] overflow-hidden relative">
          
          {/* 纯净封面插画区 */}
          <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-amber-50/30 relative rounded-t-3xl overflow-hidden flex items-center justify-center border-b border-orange-100/50">
            {/* 悬浮标签：未建档明确标注“通用推荐”，已建档显示“今日精选” */}
            {todayRecordForHero ? (
              <div className="absolute top-3 left-3.5 z-10 bg-emerald-600 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 select-none animate-in fade-in">
                <span>✓ 今日已达成 · 陪伴 {todayRecordForHero.durationMinutes} 分钟 🎉</span>
              </div>
            ) : (
              <div className="absolute top-3 left-3.5 z-10 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-amber-800 shadow-xs border border-amber-100/60 flex items-center gap-1 select-none">
                <span>
                  {profile ? `✨ 今日精选 · ${currentActivity.category}` : `🌱 通用探索推荐 · ${currentActivity.category}`}
                </span>
              </div>
            )}

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

          {/* 文本内容区 */}
          <div className="p-4 pt-3 bg-white rounded-b-3xl">
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

            {/* 单行横向紧凑参数条 */}
            <div className="bg-stone-50/80 rounded-xl p-2.5 my-3 flex items-center justify-between text-xs text-stone-600">
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

            {/* 主操作按钮 */}
            <div className="mt-3">
              {todayRecordForHero ? (
                <div className="space-y-1.5">
                  <button
                    onClick={() => onStartPlay(currentActivity)}
                    className="w-full h-12 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 active:scale-[0.98] transition-all text-emerald-800 border border-emerald-200/80 cursor-pointer flex items-center justify-center gap-2 font-bold text-sm tracking-wide shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ 今日已完成 (再玩一次)</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('history')}
                    className="w-full h-8 rounded-xl bg-transparent border-0 text-xs text-stone-400 hover:text-stone-700 transition-colors font-normal flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>查看今日足迹手账 →</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onStartPlay(currentActivity)}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:opacity-95 active:scale-[0.98] transition-all text-white shadow-lg shadow-orange-300/40 cursor-pointer flex items-center justify-center gap-2 font-bold text-base tracking-wide"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>开始陪伴</span>
                </button>
              )}
              <div className="text-center text-[11px] text-stone-400 mt-2">
                {profile
                  ? '✨ 免准备 · 随手即玩 · 月龄陪伴小贴士'
                  : '🌱 访客探索模式 · 建议完善宝宝档案以获取专属适龄匹配'}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* 空状态卡片：无已审核或适龄活动时的标准展示 */
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

      {/* 3. 童趣灵感推荐区 */}
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
            <span>✨ 今天还想玩什么？</span>
          </h3>
          {backupActivities.length > 0 && (
            <button
              onClick={handleRefreshInspirations}
              disabled={isRefreshingInspirations}
              className="group min-h-[44px] min-w-[44px] py-3 px-4 rounded-xl hover:bg-stone-100 active:scale-95 flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-all cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-50"
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
