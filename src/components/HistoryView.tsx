/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayRecord } from '../types';
import { History as HistoryIcon, Calendar, Flame, AlertTriangle, Clock } from 'lucide-react';
import { getLocalDateStr } from '../utils/date';

interface HistoryViewProps {
  records: PlayRecord[];
  onClearHistory: () => void;
  onSelectActivityById: (activityId: string) => void;
  onNavigateToToday?: () => void;
  onUpdateRecordNotes?: (recordId: string, newNotes: string) => void;
}

// 默认套话占位文案清单，此类文案在无用户个性化输入时视为无手记
const DEFAULT_PLACEHOLDER_NOTES = [
  '和宝宝度过了专注而温暖的专属亲子时光，在欢声笑语中悄悄点亮关键期脑发育～',
  '和宝宝度过了专注而温暖的专属亲子时光',
  '无备注',
  '暂无手记',
  '暂无备注',
];

export function hasMeaningfulNote(notes?: string | null): boolean {
  if (!notes) return false;
  const trimmed = notes.trim();
  if (!trimmed) return false;
  if (DEFAULT_PLACEHOLDER_NOTES.some((p) => trimmed === p)) {
    return false;
  }
  return true;
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
  onUpdateRecordNotes,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<PlayRecord | null>(null);
  const [noteInput, setNoteInput] = useState('');

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

  const reactionEmojiMap: Record<string, string> = {
    '开心专注': '🥰',
    '平静探索': '🌱',
    '容易疲劳': '😴',
    '略显抗拒': '🐥',
  };

  const handleOpenNoteModal = (record: PlayRecord) => {
    setEditingRecord(record);
    const existing = hasMeaningfulNote(record.notes) ? record.notes.trim() : '';
    setNoteInput(existing);
  };

  const handleSaveNoteModal = () => {
    if (editingRecord) {
      if (onUpdateRecordNotes) {
        onUpdateRecordNotes(editingRecord.id, noteInput.trim());
      }
      setEditingRecord(null);
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-12 animate-in fade-in duration-200 px-3.5 sm:px-4 max-w-3xl mx-auto pt-1">
      {/* 1. Two-in-One Compact Weekly Desk Calendar Card (周打卡台历卡 - 温暖手账时光印记) */}
      <div className="bg-white rounded-2xl p-4 border border-amber-100/60 shadow-sm space-y-3">
        {/* Top bar of desk calendar card: Streak & Total Stats */}
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

      {/* 2. History Footprint Stream（温暖亲子手账时光轴） */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#786F6A] uppercase tracking-wider flex items-center gap-1.5">
            {selectedDate ? (
              <>
                <span className="text-orange-600">{selectedDate}</span> 亲子手账
              </>
            ) : (
              '成长手账印记'
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
              <h3 className="text-sm font-bold text-[#2C221E]">手账本还是空白的呢</h3>
              <p className="text-xs text-[#786F6A]">记录宝宝每一个温馨的成长瞬间，开启第一次亲子互动吧！</p>
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
            <h3 className="text-sm font-bold text-[#2C221E]">这天还没有陪玩记录，去完成今天的陪伴吧~</h3>
            <p className="text-xs text-[#786F6A]">点击上方其他日期或点此返回查看全部手账。</p>
            <div className="pt-2">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 rounded-2xl bg-orange-100 text-orange-800 text-xs font-bold hover:bg-orange-200 transition-colors shadow-xs"
              >
                查看全部手账
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredRecords.map((rec) => {
              const hasRealNote = hasMeaningfulNote(rec.notes);
              const emoji = reactionEmojiMap[rec.reaction] || '🥰';

              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectActivityById(rec.activityId)}
                  className="bg-white rounded-2xl p-3.5 shadow-sm border border-amber-100/40 mb-2.5 group cursor-pointer hover:shadow-md hover:border-orange-200/80 transition-all active:scale-[0.99]"
                >
                  {/* 卡片主体：左侧手账微徽章 + 右侧内容 */}
                  <div className="flex items-center gap-3">
                    {/* 左侧圆润温暖的亲子手账微徽章 */}
                    <div className="rounded-2xl w-11 h-11 bg-amber-100/60 flex items-center justify-center text-amber-800 text-base shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <span className="select-none">{emoji}</span>
                    </div>

                    {/* 右侧核心信息 */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* 顶行：标题 + 右上角优雅克制的时间手账印记 */}
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors truncate">
                          {rec.activityTitle}
                        </h4>
                        <span className="text-xs text-stone-400 font-medium shrink-0 whitespace-nowrap">
                          ✨ {formatRecordDate(rec.date)} · 陪伴 {rec.durationMinutes}分钟
                        </span>
                      </div>

                      {/* 次行：领域微胶囊 + 宝宝状态反馈徽章 + 右侧无备注时的补充手记次级引导 */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                            {rec.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50/80 text-orange-700 border border-orange-100 shrink-0">
                            {rec.reaction}
                          </span>
                          {rec.difficulty && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] text-stone-500 bg-stone-100/70 border border-stone-200/50 shrink-0">
                              {rec.difficulty}
                            </span>
                          )}
                        </div>

                        {!hasRealNote && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenNoteModal(rec);
                            }}
                            className="text-[11px] text-stone-400 hover:text-amber-800 transition-colors inline-flex items-center gap-1 py-0.5 px-1.5 rounded-md hover:bg-amber-50/80 cursor-pointer ml-auto"
                            title="为这次陪伴写下简短手记"
                          >
                            <span>✏️ 补充手记</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 手账感亲子随笔气泡（仅在有真实输入备注时展示）：奶黄拍立得便签条 */}
                  {hasRealNote && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNoteModal(rec);
                      }}
                      className="bg-amber-50/80 rounded-xl p-2.5 text-xs text-stone-600 border border-amber-100/50 leading-relaxed mt-2.5 font-sans relative group/note cursor-pointer hover:bg-amber-100/60 transition-colors"
                      title="点击编辑手记"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex-1">“{rec.notes}”</span>
                        <span className="text-[10px] text-stone-400 group-hover/note:text-amber-800 transition-colors shrink-0 flex items-center gap-0.5 pt-0.5">
                          ✏️ 编辑
                        </span>
                      </div>
                    </div>
                  )}
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
            清空历史手账记录
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
              <h3 className="text-base font-bold text-[#2C221E]">清空手账记录确认</h3>
            </div>
            <p className="text-xs text-[#786F6A] leading-relaxed">
              确定要清空所有手账记录吗？此操作不可撤销，并将同时重置日历打卡与陪伴统计数据。
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

      {/* 补充/修改手记弹窗 */}
      {editingRecord && (
        <div
          onClick={() => setEditingRecord(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-amber-100 space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-100/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-800 text-sm shadow-xs">
                  ✏️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {hasMeaningfulNote(editingRecord.notes) ? '编辑亲子手记' : '补充亲子手记'}
                  </h3>
                  <p className="text-[11px] text-stone-400 truncate max-w-[200px]">
                    {editingRecord.activityTitle} · {formatRecordDate(editingRecord.date)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer transition-colors text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-2.5">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="记录宝宝当下的可爱反应、新掌握的动作或亲子温馨瞬间（如：笑出声、抓握很有力、对声音很敏感...）"
                rows={4}
                autoFocus
                className="w-full p-3 text-xs text-stone-800 bg-[#FAF8F5] rounded-2xl border border-stone-200 focus:outline-none focus:border-amber-400 focus:bg-white transition-all resize-none leading-relaxed"
              />

              {/* 快捷灵感词标签 */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-stone-400 font-medium">快捷灵感词：</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    '笑得特别开心 🥰',
                    '好奇东张西望 👀',
                    '专注抓握很久 🤲',
                    '听到声音立刻转头 🎵',
                    '配合度超高 🌟',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setNoteInput((prev) => {
                          const trimmed = prev.trim();
                          return trimmed ? `${trimmed}，${tag}` : tag;
                        });
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50/80 text-amber-800 hover:bg-amber-100 transition-colors border border-amber-200/50 cursor-pointer"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="flex-1 h-10 rounded-xl bg-stone-100 text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveNoteModal}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:opacity-95 text-xs font-bold text-white shadow-sm shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                保存手记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
