/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import { X, CheckCircle2, Play } from 'lucide-react';
import { getActivityIllustration } from '../data/anims';

interface ActivityDetailModalProps {
  activity: Activity;
  onClose: () => void;
  onStartPlay: (activity: Activity) => void;
  isVip?: boolean;
  onUpgradeVip?: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onStartPlay,
  isVip = false,
  onUpgradeVip,
}) => {
  const steps = activity.steps;
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const totalScenes = Math.max(1, steps.length);
  const timerRef = useRef<any>(null);

  // Auto-loop scenes smoothly every 4 seconds for comic interaction
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % totalScenes);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [totalScenes]);

  const accentBgMap = {
    sage: 'bg-[#A8B9A0]/20 text-[#54704B] border-[#A8B9A0]/30',
    apricot: 'bg-[#E8B58D]/20 text-[#B86834] border-[#E8B58D]/30',
    coral: 'bg-[#DFA39A]/20 text-[#A85C52] border-[#DFA39A]/30',
    blue: 'bg-[#A9BFCC]/20 text-[#4D6E82] border-[#A9BFCC]/30',
  };

  const formatReferenceDuration = (durationStr: string): string => {
    if (!durationStr) return '参考时长：约5分钟';
    if (durationStr.includes('参考时长')) return durationStr;
    const match = durationStr.match(/(\d+)/);
    const mins = match ? match[1] : '5';
    return `参考时长：约${mins}分钟`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden">
      {/* Zero-scrolling integrated picture-book modal container */}
      <div className="w-full max-w-lg bg-[#FAF9F2] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#EDF4E9] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#EDF4E9] flex items-center justify-between border-b border-[#62AD78]/20 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-[#3F8054] border border-[#62AD78]/30">
              {activity.category}
            </span>
            {activity.isVip && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EDF4E9] text-[#3F8054] border border-[#62AD78]/30 flex items-center gap-1">
                👑 VIP
              </span>
            )}
            {!activity.isReviewed && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                ⚠️ 待安全审核
              </span>
            )}
            <span className="text-xs text-[#85877B]">适龄: {activity.ageRange}</span>
            <span className="text-xs text-[#85877B] font-medium">· {formatReferenceDuration(activity.duration)}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#45483F] shadow-xs transition-colors"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content - 100% Zero Scrolling */}
        <div className="p-4 sm:p-5 bg-stone-50/50 rounded-2xl border border-stone-100 flex flex-col space-y-3 m-3">
          
          {/* Title & Subtitle */}
          <div className="text-center px-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#45483F]">{activity.title}</h2>
            <p className="text-xs text-[#85877B] line-clamp-1">{activity.subtitle}</p>
          </div>

          {/* Central High-Quality Picture Book Illustration (P0 Zero-Bubble Pure Image Layer) */}
          {activity.id === 'act-05' || activity.title.includes('躲猫猫') ? (
            <div className="w-full rounded-2xl overflow-hidden shadow-sm bg-white border border-stone-100/80">
              <img
                src="/assets/activities/seek_hide_seek_detail.png"
                alt={activity.title}
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[16/10] sm:h-[240px] rounded-2xl bg-gradient-to-b from-[#EDF4E9]/80 via-[#FAF9F2] to-[#EDF4E9] border border-[#62AD78]/20 shadow-sm flex items-center justify-center p-3 overflow-visible">
              {/* High-Fidelity Scandinavian Editorial Illustration */}
              {getActivityIllustration(activity.id, activity.category)}
            </div>
          )}

          {/* Bottom Key Point Card (💡 要点卡片) */}
          <div className="mt-4 p-3 bg-amber-50/40 border border-amber-100/60 rounded-xl flex items-start gap-2 text-xs text-stone-600 leading-relaxed shadow-2xs">
            <span className="text-sm shrink-0">💡</span>
            <div>
              <span className="font-bold text-amber-900">要点：</span>
              <span>
                {activity.id === 'act-05' || activity.title.includes('躲猫猫')
                  ? '观察宝宝是否会主动伸手寻找被遮挡的物品'
                  : (activity.observationTips[0] || '看着宝宝眼睛，像日常互动一样轻松自然。').replace(/^(要点|提示|注意)[：:]\s*/, '')}
              </span>
            </div>
          </div>

          {/* 未通过审核时的安全隔离说明 */}
          {!activity.isReviewed && (
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-xs text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <span>⚠️ 待安全审核隔离提醒</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                {activity.auditReason || '该玩法涉及待复核的安全动作或材料风险，已临时隔离，暂不支持体验。'}
              </p>
            </div>
          )}

          {/* Bottom Action Button (Forest Green #57A773) */}
          <div className="pt-2 flex justify-center">
            {!activity.isReviewed && !(activity.isVip && isVip) ? (
              <button
                disabled
                className="w-full py-3 rounded-full bg-stone-200 text-stone-500 font-medium text-xs flex items-center justify-center gap-1.5 cursor-not-allowed select-none opacity-80"
              >
                <span>待安全审核隔离中</span>
              </button>
            ) : activity.isVip && !isVip ? (
              <button
                onClick={onUpgradeVip}
                className="w-full bg-[#57A773] hover:bg-[#489162] text-white py-3 rounded-full font-medium text-sm shadow-sm active:opacity-90 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>解锁 VIP 体验</span>
              </button>
            ) : (
              <button
                onClick={() => onStartPlay(activity)}
                className="w-full bg-[#57A773] hover:bg-[#489162] text-white py-3 rounded-full font-medium text-sm shadow-sm active:opacity-90 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>开始陪伴</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
