/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { Activity, BabyProfile, PlayRecord, BabyReaction } from '../types';
import { X, Sparkles, Camera } from 'lucide-react';
import { getLocalDateString } from '../utils/date';
import { PolaroidModal } from './PolaroidModal';

interface PlayFeedbackModalProps {
  activity: Activity;
  durationMinutes: number;
  status?: 'completed' | 'interrupted';
  profile?: BabyProfile;
  onClose: () => void;
  onSubmit?: (data: {
    activityId: string;
    activityTitle: string;
    category: string;
    durationMinutes: number;
    babyReaction: 'happy' | 'calm' | 'tired';
    note: string;
    status: 'completed' | 'interrupted';
    photoUrl?: string;
  }) => void;
  onSaveRecord?: (record: PlayRecord) => void;
  onGeneratePoster?: (data: {
    activity: Activity;
    durationMinutes: number;
    date: string;
    babyState: string;
    photoUrl?: string;
    notes?: string;
  }) => void;
}

export const PlayFeedbackModal: React.FC<PlayFeedbackModalProps> = ({
  activity,
  durationMinutes,
  status = 'completed',
  profile,
  onClose,
  onSubmit,
  onSaveRecord,
  onGeneratePoster,
}) => {
  const [reaction, setReaction] = useState<'happy' | 'calm' | 'tired'>(
    status === 'interrupted' ? 'tired' : 'happy'
  );
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [showPolaroid, setShowPolaroid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reactionCards = [
    { key: 'happy', emoji: '😍', label: '开心' },
    { key: 'calm', emoji: '😊', label: '平静' },
    { key: 'tired', emoji: '🥱', label: '累了' },
  ] as const;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (withPoster: boolean = false) => {
    const mappedReaction: BabyReaction =
      reaction === 'happy' ? '开心专注' : reaction === 'calm' ? '平静探索' : '容易疲劳';

    const effectiveNotes = status === 'interrupted' ? '中途休息' : '';

    if (onSubmit) {
      onSubmit({
        activityId: activity.id,
        activityTitle: activity.title,
        category: activity.category,
        durationMinutes,
        babyReaction: reaction,
        note: effectiveNotes,
        status,
        photoUrl: photoDataUrl || undefined,
      });
    }

    if (onSaveRecord) {
      onSaveRecord({
        id: 'rec_' + Date.now(),
        activityId: activity.id,
        activityTitle: activity.title,
        category: activity.category,
        date: getLocalDateString(),
        durationMinutes,
        reaction: mappedReaction,
        difficulty: '刚好合适',
        completed: status === 'completed',
        notes: effectiveNotes,
        photoUrl: photoDataUrl || undefined,
      });
    }

    if (withPoster) {
      if (onGeneratePoster) {
        onGeneratePoster({
          activity,
          durationMinutes,
          date: getLocalDateString(),
          babyState: reaction,
          photoUrl: photoDataUrl || undefined,
        });
      } else {
        setShowPolaroid(true);
      }
    } else {
      onClose();
    }
  };

  if (showPolaroid) {
    return (
      <PolaroidModal
        activity={activity}
        durationMinutes={durationMinutes}
        date={getLocalDateString()}
        babyState={reaction}
        photoUrl={photoDataUrl || undefined}
        babyName={profile?.name || '宝宝'}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#FAF9F2] rounded-3xl shadow-2xl border border-[#EDF4E9] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 顶部标题栏 */}
        <div className="px-5 py-3.5 bg-[#FAF9F2] border-b border-[#EDF4E9] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#62AD78]" />
            <h3 className="text-sm font-bold text-[#45483F]">
              记录今天的亲子时光
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#85877B] hover:text-[#45483F] hover:bg-[#EDF4E9] transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 核心轻量三步闭环 */}
        <div className="p-5 space-y-4">
          {/* 顶部战报胶囊 */}
          <div className="bg-[#EDF4E9]/80 border border-[#62AD78]/30 rounded-2xl p-3.5 text-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EDF4E9] text-[#3F8054]">
              ⏱️ 陪伴 {durationMinutes} 分钟
            </span>
            <p className="text-xs font-bold text-[#45483F] line-clamp-1 mt-1.5">
              {activity.title}
            </p>
          </div>

          {/* 第一项：宝宝状态（3 个大触控卡片） */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#85877B]">宝宝状态</label>
            <div className="grid grid-cols-3 gap-2.5">
              {reactionCards.map((r) => {
                const isSelected = reaction === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setReaction(r.key)}
                    className={`h-20 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#62AD78] bg-[#EDF4E9]/80 shadow-xs'
                        : 'border border-[#EDF4E9] bg-white hover:bg-[#FAF9F2] text-[#85877B]'
                    }`}
                  >
                    <span className="text-2xl select-none leading-none">{r.emoji}</span>
                    <span
                      className={`text-sm font-bold ${
                        isSelected ? 'text-[#3F8054]' : 'text-[#45483F]'
                      }`}
                    >
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 第二项：拍照记录（图片上传组件） */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#85877B]">拍照记录</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={handleUploadClick}
              className="border-2 border-dashed border-[#62AD78]/30 bg-[#EDF4E9]/30 rounded-xl p-4 text-center cursor-pointer hover:bg-[#EDF4E9]/60 transition-all"
            >
              {!photoDataUrl ? (
                <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-[#3F8054] font-medium">
                  <Camera className="w-4 h-4 text-[#62AD78]" />
                  <span>拍张宝宝玩耍照片（选填）</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-xs border border-[#62AD78]/30">
                    <img
                      src={photoDataUrl}
                      alt="宝宝玩耍照片"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoDataUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="删除照片"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="text-[11px] text-[#3F8054] font-medium hover:text-[#3F8054]">
                    点击可更换照片
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 第四项：底部操作栏（Primary 居中胶囊 + Secondary + Ghost 纯文本） */}
          <div className="pt-2 space-y-2.5 flex flex-col items-center">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="w-3/5 max-w-[200px] h-11 bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>保存手账相片</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="h-10 px-5 rounded-full bg-[#EDF4E9] border border-[#62AD78]/30 text-[#3F8054] font-medium text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center hover:bg-[#62AD78]/10"
            >
              <span>仅完成打卡</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-[#85877B] hover:text-[#45483F] text-xs py-1.5 block text-center transition-colors cursor-pointer w-full"
            >
              直接关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PlayFeedbackModal as RecordSessionModal };
