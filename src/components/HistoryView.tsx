/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayRecord } from '../types';
import { History as HistoryIcon, Calendar, Flame, Clock } from 'lucide-react';
import { getLocalDateStr } from '../utils/date';
import { PolaroidModal } from './PolaroidModal';
import { INITIAL_ACTIVITIES } from '../data/activities';

interface HistoryViewProps {
  records: PlayRecord[];
  onClearHistory?: () => void;
  onSelectActivityById: (activityId: string) => void;
  onNavigateToToday?: () => void;
  onUpdateRecordNotes?: (recordId: string, newNotes: string) => void;
}

// 格式化手账日期为亲切的 "10月28日"
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

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onClearHistory,
  onSelectActivityById,
  onNavigateToToday,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [polaroidRecord, setPolaroidRecord] = useState<PlayRecord | null>(null);

  const totalPlayTime = records.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const completedCount = records.filter((r) => r.completed).length;

  const todayStr = getLocalDateStr();

  // Calculate 7-day week strip (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = getLocalDateStr(d);
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const hasCheckedIn = records.some((r) => r.date === dateStr && r.completed);
    const isToday = dateStr === todayStr;
    return {
      dayName: dayNames[i],
      dateNum: d.getDate(),
      dateStr,
      hasCheckedIn,
      isToday,
    };
  });

  // Calculate streak count
  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dStr = getLocalDateStr(checkDate);
    const hasRecord = records.some((r) => r.date === dStr && r.completed);
    if (hasRecord) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (streak === 0 && dStr === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yStr = getLocalDateStr(checkDate);
        if (records.some((r) => r.date === yStr && r.completed)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  const filteredRecords = selectedDate
    ? records.filter((r) => r.date === selectedDate)
    : records;

  // Group filtered records by date
  const groupedRecords = filteredRecords.reduce((acc, rec) => {
    const d = rec.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(rec);
    return acc;
  }, {} as Record<string, PlayRecord[]>);

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  const reactionEmojiMap: Record<string, { emoji: string; label: string }> = {
    '开心专注': { emoji: '😍', label: '很喜欢' },
    '平静探索': { emoji: '😊', label: '挺开心' },
    '容易疲劳': { emoji: '🥱', label: '累了' },
    '略显抗拒': { emoji: '😣', label: '不太感兴趣' },
    '很喜欢': { emoji: '😍', label: '很喜欢' },
    '挺开心': { emoji: '😊', label: '挺开心' },
    '一般': { emoji: '😐', label: '一般' },
    '不太感兴趣': { emoji: '😣', label: '不太感兴趣' },
  };

  return (
    <div className="space-y-4 pb-24 md:pb-12 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-3xl mx-auto pt-1">
      {/* 1. 温暖台历周视图卡片 */}
      <div className="bg-white rounded-2xl p-4 border border-amber-100/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-amber-100/50">
          <div className="flex items-center gap-1.5 font-bold text-orange-600">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>连续陪伴 {streak} 天</span>
          </div>
          <div className="flex items-center gap-2 text-[#786F6A]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-500" /> 累计{' '}
              <strong className="text-[#2C221E] font-mono">{totalPlayTime}</strong> 分钟
            </span>
            <span>·</span>
            <span>
              陪伴 <strong className="text-[#2C221E] font-mono">{completedCount}</strong> 次
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((wd) => {
            const isSelected = selectedDate === wd.dateStr;
            return (
              <div
                key={wd.dateStr}
                onClick={() => setSelectedDate((prev) => (prev === wd.dateStr ? null : wd.dateStr))}
                className={`rounded-2xl py-2 px-1 text-center flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-orange-100 border-2 border-orange-500 shadow-xs scale-105'
                    : wd.isToday
                    ? 'bg-orange-50 border-orange-400 shadow-xs'
                    : 'bg-[#FAF8F5] border-[#F3EDE2] hover:border-orange-200'
                }`}
              >
                <span
                  className={`text-[10px] font-semibold ${
                    isSelected || wd.isToday ? 'text-orange-600' : 'text-[#786F6A]'
                  }`}
                >
                  {wd.dayName}
                </span>
                <span
                  className={`text-xs font-bold font-mono ${
                    isSelected || wd.isToday ? 'text-orange-600' : 'text-[#2C221E]'
                  }`}
                >
                  {wd.dateNum}
                </span>
                <div className="h-5 flex items-center justify-center">
                  {wd.hasCheckedIn ? (
                    <div
                      className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white flex items-center justify-center shadow-xs text-[10px]"
                      title="已陪伴"
                    >
                      ✨
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E2D4C3]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 时间轴手账流（Timeline Scrapbook Flow） */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#786F6A] uppercase tracking-wider flex items-center gap-1.5">
            {selectedDate ? (
              <>
                <span className="text-orange-600">{selectedDate}</span> 陪伴足迹
              </>
            ) : (
              '成长时间轴手账'
            )}
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-orange-600 hover:underline font-semibold bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 transition-colors"
            >
              查看全部
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-amber-100/50 p-6 shadow-sm space-y-3.5">
            <HistoryIcon className="w-10 h-10 text-[#786F6A]/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#2C221E]">暂无陪伴足迹</h3>
              <p className="text-xs text-[#786F6A]">和宝宝玩一会儿，在这里留下轻松的亲子陪伴瞬间吧</p>
            </div>
            {onNavigateToToday && (
              <div className="pt-1">
                <button
                  onClick={onNavigateToToday}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>去挑选今日玩法 →</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-amber-100/50 p-6 shadow-sm space-y-2">
            <Calendar className="w-10 h-10 text-orange-500/60 mx-auto mb-1" />
            <h3 className="text-sm font-bold text-[#2C221E]">这天还没有陪伴足迹~</h3>
            <p className="text-xs text-[#786F6A]">点击上方其他日期或点此返回查看全部足迹。</p>
            <div className="pt-2">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 rounded-2xl bg-orange-100 text-orange-800 text-xs font-bold hover:bg-orange-200 transition-colors shadow-xs"
              >
                查看全部足迹
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateStr) => {
              const dayRecords = groupedRecords[dateStr];
              const dateHeader = dateStr === todayStr ? `今天 · ${formatRecordDate(dateStr)}` : formatRecordDate(dateStr);

              return (
                <div key={dateStr} className="space-y-3">
                  {/* 日期分组标题 */}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <h4 className="text-xs font-bold text-stone-700">{dateHeader}</h4>
                  </div>

                  {/* 竖向手账虚线时间轴容器 */}
                  <div className="border-l-2 border-dashed border-amber-200 ml-4 pl-4 space-y-3">
                    {dayRecords.map((rec) => {
                      const reactionInfo = reactionEmojiMap[rec.reaction] || { emoji: '🥰', label: rec.reaction || '很喜欢' };

                      // 统一马卡龙领域胶囊色
                      const catClass =
                        rec.category === '大运动'
                          ? 'bg-orange-50 text-orange-700 border-orange-200/60'
                          : rec.category === '精细动作'
                          ? 'bg-amber-50 text-amber-800 border-amber-200/60'
                          : rec.category === '感官认知'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : rec.category === '社会情绪'
                          ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                          : 'bg-sky-50 text-sky-700 border-sky-200/60';

                      return (
                        <div
                          key={rec.id}
                          onClick={() => setPolaroidRecord(rec)}
                          className="bg-white rounded-2xl p-4 shadow-xs border border-amber-100/60 group cursor-pointer hover:shadow-md hover:border-orange-300 transition-all active:scale-[0.99] relative flex items-center justify-between gap-3"
                        >
                          {/* 时间轴左侧时间点装饰 */}
                          <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white shadow-xs" />

                          {/* 左侧：无照片时展示表情，有照片时作为卡片主体 */}
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {!rec.photoUrl && (
                              <div className="rounded-2xl w-12 h-12 bg-amber-100/60 flex items-center justify-center text-amber-800 text-lg shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                                <span className="select-none">{reactionInfo.emoji}</span>
                              </div>
                            )}

                            {/* 中间核心信息 */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors truncate">
                                  {rec.activityTitle}
                                </h5>
                                <span className="text-xs text-stone-400 font-medium shrink-0 whitespace-nowrap font-mono">
                                  {rec.durationMinutes}分钟
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${catClass}`}>
                                  {rec.category}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50/80 text-amber-800 border border-amber-100 shrink-0 flex items-center gap-1">
                                  <span>{reactionInfo.emoji}</span>
                                  <span>{reactionInfo.label}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 右侧：若有打卡照片，直接渲染 w-14 h-14 rounded-xl object-cover 照片缩略图 */}
                          {rec.photoUrl && (
                            <div className="shrink-0">
                              <img
                                src={rec.photoUrl}
                                alt="亲子陪伴打卡照片"
                                className="w-14 h-14 rounded-xl object-cover shadow-xs border border-amber-200/80 group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
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

      {/* Polaroid Modal for Footprint Record View & Save */}
      {polaroidRecord && (() => {
        const matchingAct =
          INITIAL_ACTIVITIES.find((a) => a.id === polaroidRecord.activityId) || {
            id: polaroidRecord.activityId,
            title: polaroidRecord.activityTitle,
            subtitle: '',
            ageRange: '6-8个月',
            category: polaroidRecord.category as any,
            duration: `${polaroidRecord.durationMinutes}分钟`,
            materials: [],
            prerequisite: '',
            steps: [],
            parentPrompt: '真正陪孩子玩一会儿，留下珍贵的成长片段',
            observationTips: [],
            alternativePlay: '',
            developmentalDomain: polaroidRecord.category,
            safetyReminder: '',
            stopCondition: '',
            source: '日常陪伴',
            isReviewed: true,
            accentColor: 'apricot',
          };

        return (
          <PolaroidModal
            activity={matchingAct}
            durationMinutes={polaroidRecord.durationMinutes}
            date={polaroidRecord.date}
            babyState={polaroidRecord.reaction}
            photoUrl={polaroidRecord.photoUrl}
            babyName="宝宝"
            onClose={() => setPolaroidRecord(null)}
          />
        );
      })()}
    </div>
  );
};
