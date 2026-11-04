/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import { X, CheckCircle2, Play } from 'lucide-react';

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
        <div className="p-4 sm:p-5 flex flex-col space-y-3">
          
          {/* Title & Subtitle */}
          <div className="text-center px-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#45483F]">{activity.title}</h2>
            <p className="text-xs text-[#85877B] line-clamp-1">{activity.subtitle}</p>
          </div>

          {/* Central Comic Bubble Interactive Scene Container (~55-60% height, zero scroll) */}
          {(() => {
            const cat = activity.category;
            let adultBubble = '🙋 “宝宝在说什么？原来是这样呀~”';
            let babyBubble = '👶 “啊~ 咿~ ♪”';
            let focusTip = '⏳ 重点：停顿 3 秒等宝宝回应（双向轮流交流）';
            let sceneType = 'language';

            if (cat.includes('大运动') || cat.includes('运动')) {
              adultBubble = '🙋 “双手扶好，迈开小步探索新天地！”';
              babyBubble = '👶 “蹬蹬蹬 · 踩稳迈步！”';
              focusTip = '🌟 重点：双手身后全程轻护防跌倒，多给正向鼓励';
              sceneType = 'motor';
            } else if (cat.includes('精细')) {
              adultBubble = '🙋 “看小手抓住什么啦，轻轻放这儿~”';
              babyBubble = '👶 “抓到啦 · 捏一捏 ♪”';
              focusTip = '🌟 重点：顺应抓握节奏，鼓励双侧小手轻松配合';
              sceneType = 'fine';
            } else if (cat.includes('感官') || cat.includes('认知')) {
              adultBubble = '🙋 “看一看，听一听，小眼睛跟过来啦~”';
              babyBubble = '👶 “好奇注视 · 眼睛亮亮的 ✨”';
              focusTip = '🌟 重点：跟随宝宝视线互动，保持温和光线与声音';
              sceneType = 'sensory';
            } else if (cat.includes('社会') || cat.includes('情绪')) {
              adultBubble = '🙋 “给宝宝一个大大的笑脸和抱抱~”';
              babyBubble = '👶 “咯咯笑 · 扑进怀抱 😊”';
              focusTip = '🌟 重点：温暖眼神注视，传递满满的安全感与回应';
              sceneType = 'social';
            }

            return (
              <div className="relative w-full aspect-[16/10] sm:h-[240px] rounded-2xl bg-gradient-to-b from-[#EDF4E9]/80 via-[#FAF9F2] to-[#EDF4E9] border border-[#62AD78]/20 shadow-inner flex items-center justify-center p-3 overflow-visible">
                {/* Adult Comic Bubble */}
                <div className="absolute top-3 left-4 z-20 bg-[#62AD78] text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-xs flex items-center gap-1.5 max-w-[62%]">
                  <span>{adultBubble}</span>
                </div>

                {/* Baby Comic Bubble */}
                <div className="absolute top-[52px] right-4 z-10 bg-[#EDF4E9] text-[#3F8054] text-xs font-bold px-3 py-1.5 rounded-2xl shadow-xs border border-[#62AD78]/30 flex items-center gap-1.5">
                  <span>{babyBubble}</span>
                </div>

                {/* Category-Specific SVG Illustration */}
                <svg viewBox="0 0 360 190" className="w-full h-full object-contain overflow-visible" aria-label="亲子陪伴漫画场景">
                  {/* Background Floor */}
                  <rect x="0" y="0" width="360" height="190" fill="#FAF9F2" rx="16" />
                  <rect x="0" y="140" width="360" height="50" fill="#EDF4E9" />
                  <ellipse cx="180" cy="152" rx="110" ry="10" fill="#A8B9A0" opacity="0.4" />

                  {sceneType === 'motor' && (
                    <g id="motor-scene">
                      <rect x="30" y="90" width="100" height="60" rx="8" fill="#A8B9A0" opacity="0.8" />
                      <rect x="40" y="75" width="80" height="20" rx="6" fill="#62AD78" opacity="0.9" />
                      <ellipse cx="170" cy="150" rx="8" ry="4" fill="#62AD78" opacity="0.7" />
                      <ellipse cx="195" cy="148" rx="8" ry="4" fill="#62AD78" opacity="0.7" />
                      <g transform="translate(140, 45)">
                        <circle cx="35" cy="12" r="14" fill="#F5CF65" />
                        <path d="M15 28 Q35 15 55 28 L62 85 Q35 95 8 85 Z" fill="#62AD78" />
                        <path d="M45 45 Q70 55 90 70" fill="none" stroke="#F5CF65" strokeWidth="6" strokeLinecap="round" />
                      </g>
                      <g transform="translate(210, 68)">
                        <circle cx="25" cy="14" r="13" fill="#F5CF65" />
                        <path d="M12 26 Q25 18 38 26 L44 60 Q25 66 6 60 Z" fill="#E9A9B0" />
                        <rect x="12" y="60" width="6" height="16" rx="3" fill="#45483F" opacity="0.7" />
                        <rect x="26" y="60" width="6" height="16" rx="3" fill="#45483F" opacity="0.7" />
                      </g>
                    </g>
                  )}

                  {sceneType === 'fine' && (
                    <g id="fine-scene">
                      <rect x="130" y="115" width="100" height="35" rx="6" fill="#A8B9A0" />
                      <circle cx="160" cy="108" r="8" fill="#F17D70" />
                      <rect x="180" y="100" width="16" height="16" rx="3" fill="#62AD78" />
                      <g transform="translate(70, 50)">
                        <circle cx="32" cy="10" r="14" fill="#F5CF65" />
                        <path d="M15 28 Q32 15 49 28 L56 80 Q32 90 8 80 Z" fill="#62AD78" />
                      </g>
                      <g transform="translate(230, 65)">
                        <circle cx="25" cy="14" r="12" fill="#F5CF65" />
                        <path d="M10 26 Q25 18 40 26 L46 60 Q25 68 4 60 Z" fill="#8DC6D5" />
                        <path d="M12 36 Q-5 45 -20 42" fill="none" stroke="#F5CF65" strokeWidth="4" strokeLinecap="round" />
                      </g>
                    </g>
                  )}

                  {sceneType === 'sensory' && (
                    <g id="sensory-scene">
                      <circle cx="180" cy="90" r="28" fill="none" stroke="#62AD78" strokeWidth="1.5" strokeDasharray="4,4" className="animate-ping" opacity="0.4" />
                      <circle cx="180" cy="90" r="16" fill="#62AD78" opacity="0.85" />
                      <circle cx="180" cy="90" r="7" fill="#FAF9F2" />
                      <g transform="translate(80, 50)">
                        <circle cx="30" cy="10" r="14" fill="#F5CF65" />
                        <path d="M15 28 Q30 15 45 28 L52 80 Q30 90 8 80 Z" fill="#62AD78" />
                      </g>
                      <g transform="translate(225, 65)">
                        <circle cx="25" cy="14" r="12" fill="#F5CF65" />
                        <path d="M10 26 Q25 18 40 26 L46 60 Q25 68 4 60 Z" fill="#E9A9B0" />
                        <circle cx="20" cy="13" r="2" fill="#45483F" />
                        <circle cx="26" cy="13" r="2" fill="#45483F" />
                      </g>
                    </g>
                  )}

                  {(sceneType === 'social' || sceneType === 'language') && (
                    <g id="interactive-scene">
                      <g transform="translate(90, 50)">
                        <path d="M15 25 Q30 10 50 20 L58 75 Q35 85 8 75 Z" fill="#62AD78" />
                        <circle cx="32" cy="5" r="14" fill="#F5CF65" />
                        <path d="M20 2 Q32 -5 45 2 Q40 15 22 15 Z" fill="#3F8054" />
                        <path d="M28 7 Q32 11 36 7" fill="none" stroke="#45483F" strokeWidth="2" strokeLinecap="round" />
                      </g>

                      <g transform="translate(210, 65)">
                        <ellipse cx="30" cy="45" rx="24" ry="7" fill="#A8B9A0" opacity="0.4" />
                        <circle cx="30" cy="18" r="12" fill="#F5CF65" />
                        <path d="M15 28 Q30 20 45 28 L52 55 Q30 65 8 55 Z" fill="#E9A9B0" />
                        <circle cx="26" cy="16" r="2" fill="#45483F" />
                        <circle cx="34" cy="16" r="2" fill="#45483F" />
                      </g>

                      <path d="M130 60 Q170 40 210 65" fill="none" stroke="#62AD78" strokeWidth="2.5" strokeDasharray="5,5" className="animate-pulse" />
                    </g>
                  )}
                </svg>

                {/* Comic Bubble 3: Turn-taking Timer / Ruler */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 text-[#45483F] text-[11px] font-bold px-3.5 py-1 rounded-full shadow-xs border border-[#62AD78]/30 flex items-center gap-1.5 whitespace-nowrap">
                  <span>{focusTip}</span>
                </div>
              </div>
            );
          })()}

          {/* Bottom Concise Wrap-up: Single Warm Tip Capsule */}
          <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-[#EDF4E9] shadow-xs flex items-center gap-2">
            <span className="text-sm shrink-0">💡</span>
            <div className="text-xs text-[#45483F] font-medium leading-snug">
              <span className="font-bold text-[#3F8054]">要点：</span>
              {(activity.observationTips[0] || '看着宝宝眼睛，像日常互动一样轻松自然。').replace(/^(要点|提示|注意)[：:]\s*/, '')}
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

          {/* Bottom Action Button (Primary 精致居中胶囊规范) */}
          <div className="pt-2 flex justify-center">
            {!activity.isReviewed && !(activity.isVip && isVip) ? (
              <button
                disabled
                className="w-full h-11 rounded-full bg-stone-200 text-stone-500 font-medium text-xs flex items-center justify-center gap-1.5 cursor-not-allowed select-none opacity-80"
              >
                <span>待安全审核隔离中</span>
              </button>
            ) : activity.isVip && !isVip ? (
              <button
                onClick={onUpgradeVip}
                className="mx-auto w-3/5 max-w-[200px] h-11 bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>解锁 VIP 体验</span>
              </button>
            ) : (
              <button
                onClick={() => onStartPlay(activity)}
                className="mx-auto w-3/5 max-w-[200px] h-11 bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
