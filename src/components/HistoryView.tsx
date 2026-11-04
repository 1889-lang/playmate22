/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayRecord } from '../types';
import { History as HistoryIcon, Calendar } from 'lucide-react';
import { getLocalDateStr } from '../utils/date';
import { PolaroidDetailModal } from './PolaroidDetailModal';

interface HistoryViewProps {
  records: PlayRecord[];
  onClearHistory?: () => void;
  onSelectActivityById: (activityId: string) => void;
  onNavigateToToday?: () => void;
  onNavigateToLibrary?: () => void;
  onUpdateRecordNotes?: (recordId: string, newNotes: string) => void;
}

const cleanTitle = (title: string): string => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

function formatRecordDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      return `${month}月${day}日`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

function renderActivityIllustration(cat?: string) {
  const category = cat || '';
  if (category.includes('大运动')) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <circle cx="60" cy="60" r="50" fill="#FEF3E2" />
        <circle cx="60" cy="45" r="18" fill="#FDBA74" />
        <path d="M35 85 C45 65 75 65 85 85" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" fill="none" />
      </svg>
    );
  } else if (category.includes('精细')) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <circle cx="60" cy="60" r="50" fill="#FFF1F2" />
        <rect x="35" y="35" width="22" height="22" rx="4" fill="#FDA4AF" />
        <rect x="63" y="35" width="22" height="22" rx="4" fill="#FBBF24" />
        <rect x="49" y="63" width="22" height="22" rx="4" fill="#6EE7B7" />
      </svg>
    );
  } else if (category.includes('感官')) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <circle cx="60" cy="60" r="50" fill="#F0FDF4" />
        <circle cx="60" cy="60" r="30" stroke="#38BDF8" strokeWidth="4" strokeDasharray="6 4" fill="none" />
        <circle cx="60" cy="60" r="12" fill="#F97316" />
      </svg>
    );
  } else if (category.includes('社会')) {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
        <circle cx="60" cy="60" r="50" fill="#FAF5FF" />
        <circle cx="45" cy="60" r="20" fill="#C7D2FE" />
        <circle cx="75" cy="60" r="18" fill="#FED7AA" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full object-contain">
      <circle cx="60" cy="60" r="50" fill="#F0F9FF" />
      <path d="M40 50 Q60 30 80 50 Q60 70 40 50 Z" fill="#BAE6FD" />
      <circle cx="60" cy="50" r="8" fill="#0284C7" />
    </svg>
  );
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onNavigateToToday,
  onNavigateToLibrary,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [polaroidModalIndex, setPolaroidModalIndex] = useState<number | null>(null);

  const todayStr = getLocalDateStr();

  // Calculate 7-day week strip (Sunday to Saturday) based on weekOffset
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const sundayOffset = -dayOfWeek;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + sundayOffset + weekOffset * 7);

  const currentMonthYearLabel = `${sunday.getFullYear()}年${sunday.getMonth() + 1}月`;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = getLocalDateStr(d);
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const hasCheckedIn = records.some((r) => r.date === dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    return {
      dayName: dayNames[i],
      dateNum: d.getDate(),
      dateStr,
      hasCheckedIn,
      isToday,
      isFuture,
    };
  });

  const filteredRecords = selectedDate
    ? records.filter((r) => r.date === selectedDate)
    : records;

  // Group filtered records by date first
  const recordsByDate = filteredRecords.reduce((acc, rec) => {
    const d = rec.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(rec);
    return acc;
  }, {} as Record<string, PlayRecord[]>);

  const sortedDates = Object.keys(recordsByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4 pb-24 md:pb-12 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-3xl mx-auto pt-1">
      {/* 1. 舒展手账风格 WeekCalendar 陪伴日历 */}
      {records.length > 0 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-100 shadow-xs space-y-2 select-none mb-4">
          {/* 顶栏：月份与手账式温馨副标题 ＋ 无底色轻量导航按钮 */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div>
              <h2 className="text-base font-bold text-stone-800 tracking-tight">
                {currentMonthYearLabel}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5 font-normal">
                和宝宝一起度过的日子
              </p>
            </div>

            {/* 轻量触控导航按钮 */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="w-7 h-7 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 text-xs transition-colors cursor-pointer active:scale-95"
                title="上一周"
                aria-label="上一周"
              >
                ‹
              </button>

              {weekOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="px-2.5 h-7 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  本周
                </button>
              )}

              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="w-7 h-7 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 text-xs transition-colors cursor-pointer active:scale-95"
                title="下一周"
                aria-label="下一周"
              >
                ›
              </button>
            </div>
          </div>

          {/* 严格 7 等分 Grid 网格，以【周日】打头，结构独立，消除打卡点穿模 */}
          <div className="grid grid-cols-7 gap-1 w-full text-center mt-3">
            {weekDays.map((wd) => {
              const isSelected = selectedDate === wd.dateStr;

              return (
                <div
                  key={wd.dateStr}
                  onClick={() => setSelectedDate((prev) => (prev === wd.dateStr ? null : wd.dateStr))}
                  className="flex flex-col items-center cursor-pointer select-none"
                >
                  {/* 星期行（第一行：日、一、二...） */}
                  <div className="text-xs text-stone-400 font-normal py-1">
                    {wd.dayName}
                  </div>

                  {/* 日期行（第二行，固定 h-14 容器） */}
                  <div className="flex flex-col items-center justify-center h-14 w-full">
                    {isSelected ? (
                      <div className="w-10 h-12 rounded-2xl bg-emerald-700 text-white flex flex-col items-center justify-center shadow-xs transition-all">
                        <span className="text-sm font-bold leading-none">{wd.dateNum}</span>
                        {wd.hasCheckedIn ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-200/90 mt-1" title="有陪伴记录" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full opacity-0 mt-1" />
                        )}
                      </div>
                    ) : (
                      <div className="w-10 h-12 rounded-2xl flex flex-col items-center justify-center hover:bg-stone-50/80 transition-all">
                        <span
                          className={`text-sm leading-none ${
                            wd.isToday
                              ? 'text-emerald-700 font-extrabold'
                              : wd.isFuture
                              ? 'text-stone-300 font-medium'
                              : 'text-stone-700 font-semibold'
                          }`}
                        >
                          {wd.dateNum}
                        </span>
                        {wd.hasCheckedIn ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" title="有陪伴记录" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full opacity-0 mt-1" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 陪伴记录列表（按日期＋活动聚合展示） */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-stone-800 py-2 px-1">
          {selectedDate ? `${selectedDate} 陪伴手账` : '成长陪伴手账'}
        </h3>

        {records.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-[#EDF4E9] p-6 shadow-xs space-y-3.5">
            <HistoryIcon className="w-10 h-10 text-[#85877B]/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#45483F]">暂无陪伴足迹</h3>
              <p className="text-xs text-[#85877B]">和宝宝玩一会儿，在这里留下轻松的亲子陪伴瞬间吧</p>
            </div>
            {onNavigateToToday && (
              <div className="pt-1 flex justify-center">
                <button
                  onClick={onNavigateToToday}
                  className="w-3/5 max-w-[200px] h-11 bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>挑选今日玩法 →</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-[#EDF4E9] p-6 shadow-xs space-y-2.5">
            <Calendar className="w-10 h-10 text-[#62AD78]/60 mx-auto mb-1" />
            <h3 className="text-sm font-bold text-[#45483F]">这一天还没有留下陪伴印记</h3>
            {onNavigateToLibrary && (
              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={onNavigateToLibrary}
                  className="text-xs text-[#3F8054] font-medium hover:underline inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>去挑个好玩的 ›</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {sortedDates.map((dateStr) => {
              const dayRecords = recordsByDate[dateStr];
              const dateHeader =
                dateStr === todayStr
                  ? `今天 · ${formatRecordDate(dateStr)}`
                  : formatRecordDate(dateStr);

              // 按照活动 (activityId 或 cleanTitle) 聚合当天的陪伴记录
              const activityGroupsMap = dayRecords.reduce((acc, rec) => {
                const key = rec.activityId || cleanTitle(rec.activityTitle);
                if (!acc[key]) acc[key] = [];
                acc[key].push(rec);
                return acc;
              }, {} as Record<string, PlayRecord[]>);

              const groupKeys = Object.keys(activityGroupsMap);

              return (
                <div key={dateStr} className="space-y-3">
                  {/* 日期标题（提供充足的上边距，消除顶部周历遮挡） */}
                  <div className="flex items-center gap-2 pt-2 pb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#62AD78]" />
                    <h4 className="text-xs font-bold text-[#45483F]">{dateHeader}</h4>
                  </div>

                  {/* 当天活动组汇总卡片 */}
                  <div className="space-y-3">
                    {groupKeys.map((groupKey) => {
                      const groupRecords = activityGroupsMap[groupKey];
                      const firstRec = groupRecords[0];
                      const displayTitleName = cleanTitle(firstRec.activityTitle);
                      const totalCount = groupRecords.length;
                      const totalDuration = groupRecords.reduce(
                        (sum, r) => sum + (r.durationMinutes || 0),
                        0
                      );

                      const thumbnailSrc =
                        firstRec.photoUrl ||
                        (firstRec as any).polaroidImage ||
                        (firstRec as any).userPhoto ||
                        (firstRec as any).coverImage;

                      const recordIndex = filteredRecords.findIndex((r) => r.id === firstRec.id);

                      return (
                        <div
                          key={groupKey}
                          onClick={() => setPolaroidModalIndex(recordIndex >= 0 ? recordIndex : 0)}
                          className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#EDF4E9] shadow-xs select-none active:scale-[0.99] transition-all cursor-pointer hover:border-[#62AD78]/30"
                        >
                          {/* 卡片主体布局：左侧 2 层基础信息 + 右侧打卡封面相纸 ＋ 轻量右箭头 */}
                          <div className="flex items-center justify-between gap-3 sm:gap-4">
                            {/* 左侧主要信息区 */}
                            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                              {/* 1. 第一层：活动标题 */}
                              <h5 className="text-base font-bold text-[#45483F] leading-snug truncate">
                                {displayTitleName}
                              </h5>

                              {/* 2. 第二层：陪伴统计 */}
                              <div className="flex items-center gap-1.5 text-xs text-[#85877B] font-medium pt-0.5">
                                {totalDuration > 0 ? (
                                  <span>
                                    陪伴 <span className="font-mono text-[#45483F] font-semibold">{totalDuration}</span> 分钟 · 共 <span className="font-mono text-[#45483F] font-semibold">{totalCount}</span> 次
                                  </span>
                                ) : (
                                  <span>
                                    共 <span className="font-mono text-[#45483F] font-semibold">{totalCount}</span> 次陪伴记录
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 右侧活动打卡封面 ＋ 右箭头 › */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-2xl bg-[#FAF9F2] border border-[#EDF4E9] flex items-center justify-center p-1.5 overflow-hidden shadow-xs">
                                {thumbnailSrc ? (
                                  <img
                                    src={thumbnailSrc}
                                    alt={displayTitleName}
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  renderActivityIllustration(firstRec.category)
                                )}
                              </div>
                              <span className="text-stone-300 text-sm font-light select-none pl-0.5">›</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. 拍立得手账详情弹窗 */}
      {polaroidModalIndex !== null && filteredRecords.length > 0 && (
        <PolaroidDetailModal
          records={filteredRecords}
          currentIndex={polaroidModalIndex}
          onSwitchRecord={(idx) => setPolaroidModalIndex(idx)}
          onClose={() => setPolaroidModalIndex(null)}
        />
      )}
    </div>
  );
};

