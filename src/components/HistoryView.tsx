/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayRecord } from '../types';
import { History as HistoryIcon, Calendar, Flame, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { getLocalDateStr } from '../utils/date';

interface HistoryViewProps {
  records: PlayRecord[];
  onClearHistory: () => void;
  onSelectActivityById: (activityId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onClearHistory,
  onSelectActivityById,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const handleConfirmClear = () => {
    onClearHistory();
    setShowConfirmModal(false);
    setSelectedDate(null);
  };

  const filteredRecords = selectedDate
    ? records.filter((r) => r.date === selectedDate)
    : records;

  return (
    <div className="space-y-4 pb-24 md:pb-12 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-3xl mx-auto pt-1">
      
      {/* 1. Two-in-One Compact Weekly Desk Calendar Card (周打卡台历卡 - 页面顶部直接展示) */}
      <div className="bg-white rounded-3xl p-4 border border-[#F3EDE2] shadow-[0_10px_30px_-10px_rgba(44,34,30,0.05)] space-y-3">
        {/* Top bar of desk calendar card: Streak & Total Stats */}
        <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F3EDE2]">
          <div className="flex items-center gap-1.5 font-bold text-orange-600">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>连续陪伴 {streak} 天</span>
          </div>
          <div className="flex items-center gap-2 text-[#786F6A]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-500" /> 累计 <strong className="text-[#2C221E] font-mono">{totalPlayTime}</strong> 分钟
            </span>
            <span>·</span>
            <span>打卡 <strong className="text-[#2C221E] font-mono">{completedCount}</strong> 次</span>
          </div>
        </div>

        {/* Bottom part of desk calendar card: 7-day grid (Mon-Sun) with click filter */}
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
                <span className={`text-[10px] font-semibold ${isSelected || wd.isToday ? 'text-orange-600' : 'text-[#786F6A]'}`}>
                  {wd.dayName}
                </span>
                <span className={`text-xs font-bold font-mono ${isSelected || wd.isToday ? 'text-orange-600' : 'text-[#2C221E]'}`}>
                  {wd.dateNum}
                </span>
                <div className="h-5 flex items-center justify-center">
                  {wd.hasCheckedIn ? (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white flex items-center justify-center shadow-xs text-xs" title="已打卡">
                      🐾
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

      {/* 2. History Footprint Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#786F6A] uppercase tracking-wider flex items-center gap-1.5">
            {selectedDate ? (
              <>
                <span className="text-orange-600">{selectedDate}</span> 打卡足迹
              </>
            ) : (
              '历史足迹'
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
          <div className="text-center py-12 bg-white rounded-3xl border border-[#F3EDE2] p-6 shadow-xs">
            <HistoryIcon className="w-10 h-10 text-[#786F6A]/40 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-[#2C221E] mb-1">暂无陪玩记录</h3>
            <p className="text-xs text-[#786F6A]">点击“今日推荐”或“活动宝库”开始第一次亲子陪伴吧！</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#F3EDE2] p-6 shadow-xs space-y-2">
            <Calendar className="w-10 h-10 text-orange-500/60 mx-auto mb-1" />
            <h3 className="text-sm font-bold text-[#2C221E]">这天还没有陪玩记录，去完成今天的陪伴吧~</h3>
            <p className="text-xs text-[#786F6A]">点击上方其他日期或点此返回查看全部足迹。</p>
            <div className="pt-2">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 rounded-2xl bg-orange-100 text-orange-800 text-xs font-bold hover:bg-orange-200 transition-colors shadow-xs"
              >
                查看全部记录
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredRecords.map((rec) => {
              const hasNotes = rec.notes && rec.notes.trim().length > 0;
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-3xl p-4 border border-[#F3EDE2] shadow-[0_6px_20px_rgba(44,34,30,0.03)] space-y-2 border-l-4 border-l-orange-500 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF8F5] text-[#2C221E] border border-[#F3EDE2] shrink-0 whitespace-nowrap">
                        {rec.category}
                      </span>
                      <span className="text-[11px] text-[#786F6A] flex items-center gap-1 font-mono shrink-0 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" /> {rec.date}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 shrink-0 whitespace-nowrap">
                      {rec.reaction}
                    </span>
                  </div>

                  <div className="pt-0.5">
                    <h4 
                      onClick={() => onSelectActivityById(rec.activityId)}
                      className="text-sm font-bold text-[#2C221E] hover:text-orange-600 cursor-pointer transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{rec.activityTitle}</span>
                      <ArrowRight className="w-4 h-4 text-[#786F6A] shrink-0" />
                    </h4>

                    {/* 仅在存在有效随手记时渲染笔记容器，彻底消除空引号框 */}
                    {hasNotes && (
                      <p className="text-xs text-[#2C221E]/90 mt-1.5 bg-[#FAF8F5] px-3 py-2 rounded-2xl border border-[#F3EDE2] leading-relaxed font-serif">
                        “{rec.notes}”
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#786F6A] pt-1 border-t border-[#F3EDE2]">
                    <span>时长：约 {rec.durationMinutes} 分钟</span>
                    <span>难度：{rec.difficulty}</span>
                    <span className="text-emerald-700 font-semibold">{rec.completed ? '✓ 完整打卡' : '部分完成'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Footer Clear History Link */}
      {records.length > 0 && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="text-[11px] text-[#786F6A]/70 hover:text-rose-600 transition-colors underline decoration-dotted underline-offset-4 cursor-pointer"
          >
            清空历史打卡记录
          </button>
        </div>
      )}

      {/* Secondary Confirmation Modal for Clearing History */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2C221E]">清空历史记录确认</h3>
            </div>
            <p className="text-xs text-[#786F6A] leading-relaxed">
              确定要清空所有陪玩记录吗？此操作不可撤销，并将同时重置日历打卡与陪伴统计数据。
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-11 rounded-2xl bg-[#FAF8F5] text-xs font-semibold text-[#2C221E] hover:bg-[#F3EDE2] transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 h-11 rounded-2xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
