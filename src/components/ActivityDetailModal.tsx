/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import { X, CheckCircle2 } from 'lucide-react';

interface ActivityDetailModalProps {
  activity: Activity;
  onClose: () => void;
  onStartPlay: (activity: Activity) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onStartPlay,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden">
      {/* Zero-scrolling integrated picture-book modal container */}
      <div className="w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#F1EAE0] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#F1EAE0] flex items-center justify-between border-b border-[#E8B58D]/25 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${accentBgMap[activity.accentColor]}`}>
              {activity.category}
            </span>
            <span className="text-xs text-[#858078]">适龄: {activity.ageRange}</span>
            <span className="text-xs text-[#858078] font-mono">· {activity.duration}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#45433F] shadow-xs transition-colors"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content - 100% Zero Scrolling */}
        <div className="p-4 sm:p-5 flex flex-col space-y-3">
          
          {/* Title & Subtitle */}
          <div className="text-center px-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#45433F]">{activity.title}</h2>
            <p className="text-xs text-[#858078] line-clamp-1">{activity.subtitle}</p>
          </div>

          {/* Central Comic Bubble Interactive Scene Container (~55-60% height, zero scroll) */}
          <div className="relative w-full aspect-[16/10] sm:h-[240px] rounded-2xl bg-gradient-to-b from-[#F1EAE0]/80 via-[#FAF7F2] to-[#F1EAE0] border border-[#E8B58D]/30 shadow-inner flex items-center justify-center p-3 overflow-visible">
            
            {/* Adult Comic Bubble (Orange, Left Top Staggered) */}
            <div className="absolute top-3 left-4 z-20 bg-[#F28C45]/95 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-md border border-orange-300 flex items-center gap-1.5 max-w-[58%]">
              <span>🙋 “啊——！原来是这样呀”</span>
            </div>

            {/* Baby Comic Bubble (Light Blue, Right Upper-Middle Staggered) */}
            <div className="absolute top-[52px] right-4 z-10 bg-sky-100/95 text-sky-900 text-xs font-bold px-3 py-1.5 rounded-2xl shadow-sm border border-sky-200 flex items-center gap-1.5">
              <span>👶 “啊~ ♪”</span>
            </div>

            {/* Central SVG Illustration */}
            <svg viewBox="0 0 360 190" className="w-full h-full object-contain overflow-visible" aria-label="漫画气泡互动场景">
              {/* Background Floor */}
              <rect x="0" y="0" width="360" height="190" fill="#FAF7F2" rx="16" />
              <rect x="0" y="140" width="360" height="50" fill="#EFE5D8" />
              <ellipse cx="180" cy="152" rx="110" ry="10" fill="#E2D4C3" opacity="0.6" />
              <path d="M60 115 Q180 95 300 115 L320 145 Q180 160 40 145 Z" fill="#A8B9A0" opacity="0.25" />

              {/* Adult Character (Left) */}
              <g transform="translate(90, 50)">
                <path d="M15 25 Q30 10 50 20 L58 75 Q35 85 8 75 Z" fill="#E8B58D" />
                <circle cx="32" cy="5" r="14" fill="#DDB896" />
                <path d="M20 2 Q32 -5 45 2 Q40 15 22 15 Z" fill="#45433F" opacity="0.8" />
                <path d="M28 7 Q32 11 36 7" fill="none" stroke="#45433F" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Baby Character (Right) */}
              <g transform="translate(210, 65)">
                <ellipse cx="30" cy="45" rx="24" ry="7" fill="#C5B5A2" opacity="0.4" />
                <circle cx="30" cy="18" r="12" fill="#DDB896" />
                <path d="M15 28 Q30 20 45 28 L52 55 Q30 65 8 55 Z" fill="#DFA39A" />
                <circle cx="26" cy="16" r="2" fill="#45433F" />
                <circle cx="34" cy="16" r="2" fill="#45433F" />
              </g>

              {/* Interaction Wave / Heart */}
              <path d="M130 60 Q170 40 210 65" fill="none" stroke="#F28C45" strokeWidth="2.5" strokeDasharray="5,5" className="animate-pulse" />
            </svg>

            {/* Comic Bubble 3: Turn-taking Timer / Ruler (Bottom Center, bottom-3) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 text-[#45433F] text-[11px] font-bold px-3.5 py-1 rounded-full shadow-sm border border-[#E8B58D]/40 flex items-center gap-1.5 whitespace-nowrap">
              <span>⏳ 停顿 3 秒等他回应（轮流对话）</span>
            </div>
          </div>

          {/* Bottom Concise Wrap-up: Single Warm Tip Capsule (No truncation, normal wrap) */}
          <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-[#F1EAE0] shadow-xs flex items-center gap-2">
            <span className="text-sm shrink-0">💡</span>
            <div className="text-xs text-[#45433F] font-medium leading-snug">
              <span className="font-bold text-[#B86834]">要点：</span>
              {activity.observationTips[0] || '看着宝宝眼睛，像聊天一样一问一答。'}
            </div>
          </div>

          {/* Bottom Full-Width Warm Orange Action Button (#F28C45) */}
          <div className="pt-0.5">
            <button
              onClick={() => onStartPlay(activity)}
              className="w-full h-12 rounded-2xl bg-[#F28C45] hover:bg-[#e07b36] active:scale-[0.98] transition-all text-white font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-[#F28C45]/25"
            >
              <CheckCircle2 className="w-5 h-5 fill-white text-[#F28C45]" /> 完成本次陪玩
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
