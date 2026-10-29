/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import { X, CheckCircle2, Clock, BookOpen, Pause, Play } from 'lucide-react';
import { TextGuideDrawer } from './TextGuideDrawer';

interface CoachModeModalProps {
  activity: Activity;
  onClose: () => void;
  onFinishPlay: (activity: Activity, durationMinutes: number, status: 'completed' | 'interrupted') => void;
}

export const CoachModeModal: React.FC<CoachModeModalProps> = ({
  activity,
  onClose,
  onFinishPlay,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    onFinishPlay(activity, durationMins, 'completed');
  };

  const handleInterrupted = () => {
    const durationMins = Math.max(0, Math.round(elapsedSeconds / 60));
    onFinishPlay(activity, durationMins, 'interrupted');
  };

  const handleCloseX = () => {
    if (elapsedSeconds > 10) {
      const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
      onFinishPlay(activity, durationMins, 'interrupted');
    } else {
      onClose();
    }
  };

  // 分类专属手绘插画映射函数
  const renderActivityIllustration = (cat: string) => {
    switch (cat) {
      case '大运动':
        return (
          <svg viewBox="0 0 340 180" className="w-full h-full object-contain overflow-visible" aria-label="大运动插画">
            <rect x="0" y="0" width="340" height="180" fill="#FAF7F2" rx="16" />
            <rect x="10" y="130" width="320" height="40" fill="#EFE5D8" rx="12" />
            <ellipse cx="170" cy="142" rx="120" ry="10" fill="#E2D4C3" opacity="0.6" />
            <g transform="translate(100, 40)">
              <circle cx="32" cy="20" r="14" fill="#DDB896" />
              <path d="M12 45 Q32 30 52 40 L60 90 Q32 100 4 90 Z" fill="#E8B58D" />
            </g>
            <g transform="translate(160, 30) rotate(-15)">
              <circle cx="28" cy="16" r="12" fill="#DDB896" />
              <path d="M12 28 Q28 20 44 28 L50 65 Q28 72 6 65 Z" fill="#DFA39A" />
            </g>
            <path d="M140 90 Q170 70 200 90" stroke="#F28C45" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          </svg>
        );
      case '语言交流':
        return (
          <svg viewBox="0 0 340 180" className="w-full h-full object-contain overflow-visible" aria-label="语言交流插画">
            <rect x="0" y="0" width="340" height="180" fill="#FAF7F2" rx="16" />
            <rect x="10" y="130" width="320" height="40" fill="#EFE5D8" rx="12" />
            <ellipse cx="170" cy="142" rx="120" ry="10" fill="#E2D4C3" opacity="0.6" />
            <g transform="translate(90, 45)">
              <circle cx="28" cy="18" r="14" fill="#DDB896" />
              <path d="M12 40 Q28 25 44 35 L50 85 Q28 95 6 85 Z" fill="#A8B9A0" />
            </g>
            <g transform="translate(190, 45)">
              <circle cx="28" cy="18" r="14" fill="#DDB896" />
              <path d="M12 40 Q28 25 44 35 L50 85 Q28 95 6 85 Z" fill="#E8B58D" />
            </g>
            <text x="170" y="80" textAnchor="middle" fill="#F28C45" fontSize="20" fontWeight="bold">💬</text>
          </svg>
        );
      case '精细动作':
        return (
          <svg viewBox="0 0 340 180" className="w-full h-full object-contain overflow-visible" aria-label="精细动作插画">
            <rect x="0" y="0" width="340" height="180" fill="#FAF7F2" rx="16" />
            <rect x="10" y="130" width="320" height="40" fill="#EFE5D8" rx="12" />
            <ellipse cx="170" cy="142" rx="120" ry="10" fill="#E2D4C3" opacity="0.6" />
            <g transform="translate(130, 60)">
              <rect x="20" y="20" width="40" height="40" rx="6" fill="#E8B58D" />
              <circle cx="15" cy="40" r="12" fill="#DDB896" />
              <circle cx="75" cy="40" r="12" fill="#DDB896" />
            </g>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 340 180" className="w-full h-full object-contain overflow-visible" aria-label="感官认知插画">
            <rect x="0" y="0" width="340" height="180" fill="#FAF7F2" rx="16" />
            <rect x="10" y="130" width="320" height="40" fill="#EFE5D8" rx="12" />
            <ellipse cx="170" cy="142" rx="120" ry="10" fill="#E2D4C3" opacity="0.6" />
            <g transform="translate(145, 105)">
              <rect x="0" y="6" width="50" height="26" rx="8" fill="#F28C45" />
              <ellipse cx="25" cy="6" rx="25" ry="7" fill="#FFAA6C" />
            </g>
            <g transform="translate(65, 28)">
              <circle cx="32" cy="18" r="15" fill="#DDB896" />
              <path d="M12 40 Q32 25 52 35 L60 95 Q32 105 4 95 Z" fill="#E8B58D" />
            </g>
            <g transform="translate(210, 46)">
              <circle cx="28" cy="20" r="14" fill="#DDB896" />
              <path d="M14 38 Q28 30 42 38 L46 72 Q28 80 10 72 Z" fill="#DFA39A" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
      <div className="w-full max-w-md bg-[#FAF7F2] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#F1EAE0] animate-in fade-in zoom-in-95 duration-200 max-h-[92vh]">
        
        {/* 1. 顶部 Header 状态栏 */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] flex items-center justify-between border-b border-[#F1EAE0] shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8B58D]/25 text-[#B86834] border border-[#E8B58D]/40">
              {activity.category}
            </span>
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#F1EAE0] shadow-xs">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-1 text-xs font-bold text-[#45433F] hover:text-[#F28C45] cursor-pointer"
                title={isPaused ? "点击继续计时" : "点击暂停计时"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> : <Pause className="w-3.5 h-3.5 text-[#F28C45] fill-[#F28C45]" />}
                <span className="font-mono">{formatTimer(elapsedSeconds)}</span>
                {isPaused && <span className="text-[10px] text-amber-600 font-semibold ml-0.5">【已暂停】</span>}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#F1EAE0] text-xs font-bold text-[#45433F] flex items-center gap-1 border border-[#F1EAE0] shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F28C45]" /> 指南
            </button>
            <button
              onClick={handleCloseX}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#F1EAE0] flex items-center justify-center text-[#45433F] shadow-xs transition-colors cursor-pointer"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. 核心内容区域 */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* 活动标题 */}
          <div className="text-center px-2">
            <h2 className="text-lg font-black text-[#45433F] tracking-tight">{activity.title}</h2>
            <p className="text-xs text-[#858078] mt-0.5 line-clamp-1">{activity.subtitle}</p>
          </div>

          {/* 插画容器 */}
          <div className="w-full bg-[#FAF7F2] rounded-2xl border border-[#E8B58D]/30 p-2.5 flex flex-col items-center gap-2 shadow-inner">
            <div className="w-full h-[145px] flex items-center justify-center">
              {renderActivityIllustration(activity.category)}
            </div>

            {/* 示范话术气泡 */}
            <div className="w-full bg-white/95 border border-[#E8B58D]/40 rounded-xl px-3 py-2 text-center shadow-xs">
              <span className="text-xs text-[#B86834] font-medium leading-relaxed">
                💬 {activity.parentPrompt ? activity.parentPrompt.replace(/^["'“”]+|["'“”]+$/g, '') : '咚咚咚，小鼓敲起来，宝宝也来敲一敲！'}
              </span>
            </div>
          </div>

          {/* 3. 陪玩三步法 */}
          <div className="bg-white rounded-2xl p-4 border border-[#F1EAE0] shadow-xs space-y-3">
            <div className="text-xs font-bold text-[#858078] flex items-center gap-1.5 pb-1">
              <span>📋 陪玩三步法</span>
            </div>
            
            <div className="space-y-3">
              {activity.steps.map((step: any) => (
                <div key={step.stepNumber} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F28C45] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#45433F]">{step.title}</div>
                    <p className="text-xs text-[#6B665F] leading-relaxed font-normal">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 底部双状态结束操作区 */}
          <div className="pt-2 pb-1 flex flex-col items-center gap-2">
            <button
              onClick={handleComplete}
              className="w-full h-11 rounded-full bg-gradient-to-r from-[#F28C45] to-[#E5762F] hover:opacity-95 active:scale-[0.98] transition-all text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#F28C45]/30 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 fill-white text-[#F28C45]" />
              <span>愉快完成，去打卡</span>
            </button>
            
            <button
              onClick={handleInterrupted}
              className="w-full h-10 rounded-full bg-[#FAF7F2] hover:bg-[#F1EAE0] border border-[#F1EAE0] text-[#858078] hover:text-[#45433F] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>🥱 宝宝累了 / 中途退出（保存当前时长）</span>
            </button>
          </div>
        </div>

        {/* 抽屉指南组件接入 */}
        {showGuide && (
          <TextGuideDrawer activity={activity} onClose={() => setShowGuide(false)} />
        )}
      </div>
    </div>
  );
};
