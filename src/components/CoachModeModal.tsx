/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import { X, Clock, BookOpen, Pause, Play, AlertCircle } from 'lucide-react';
import { TextGuideDrawer } from './TextGuideDrawer';
import { getRecommendedMinutes, checkIsCompletedByDuration } from '../utils/activity';

interface CoachModeModalProps {
  activity: Activity;
  initialSeconds?: number;
  onClose: () => void;
  onSaveAndExit: (activity: Activity, elapsedSeconds: number) => void;
  onFinishPlay: (activity: Activity, durationMinutes: number, status: 'completed' | 'interrupted') => void;
}

export const CoachModeModal: React.FC<CoachModeModalProps> = ({
  activity,
  initialSeconds = 0,
  onClose,
  onSaveAndExit,
  onFinishPlay,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const timerRef = useRef<any>(null);

  // 停止语音朗读的辅助函数
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // 组件卸载时确保停止语音朗读，防止后台漏音
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // 串联口语化语音朗读文案
  const buildSpeechText = () => {
    const stepsText = activity.steps
      .map((step: any, idx: number) => `第${idx + 1}步：${step.title}。${step.description}`)
      .join('。');
    const promptText = activity.parentPrompt
      ? `温馨互动示范：${activity.parentPrompt.replace(/^["'“”]+|["'“”]+$/g, '')}`
      : '';
    return `${activity.title}。${activity.subtitle || ''}。陪玩三步法：${stepsText}。${promptText}`;
  };

  // 切换语音播放与暂停
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    // 先清除可能残留的朗读队列
    window.speechSynthesis.cancel();

    const text = buildSpeechText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

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
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    const isCompleted = checkIsCompletedByDuration(elapsedSeconds, activity.duration);

    if (isCompleted) {
      onFinishPlay(activity, durationMins, 'completed');
    } else {
      setShowThresholdModal(true);
    }
  };

  const handleConfirmInterrupted = () => {
    setShowThresholdModal(false);
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    onFinishPlay(activity, durationMins, 'interrupted');
  };

  const handleSaveProgress = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    onSaveAndExit(activity, elapsedSeconds);
  };

  const handleCloseX = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    onSaveAndExit(activity, elapsedSeconds);
  };

  // 分类专属手绘插画映射函数
  const renderActivityIllustration = (cat: string) => {
    switch (cat) {
      case '大运动':
        return (
          <svg viewBox="0 0 340 180" className="w-full h-full object-contain overflow-visible" aria-label="大运动插画">
            <rect x="0" y="0" width="340" height="180" fill="#FAF8F5" rx="16" />
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
            <rect x="0" y="0" width="340" height="180" fill="#FAF8F5" rx="16" />
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
            <rect x="0" y="0" width="340" height="180" fill="#FAF8F5" rx="16" />
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
            <rect x="0" y="0" width="340" height="180" fill="#FAF8F5" rx="16" />
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
      <div className="w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#F3EDE2] animate-in fade-in zoom-in-95 duration-200 max-h-[86vh] h-[86vh]">
        
        {/* 1. 顶部 Header 状态栏 (Sticky Header) */}
        <div className="px-5 py-3 bg-[#FAF8F5] flex items-center justify-between border-b border-[#F3EDE2] shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200/60 whitespace-nowrap flex-shrink-0">
              {activity.category}
            </span>
            <div className={`flex items-center justify-center min-w-[90px] px-2.5 py-1 rounded-xl border border-[#F3EDE2] shadow-xs whitespace-nowrap flex-shrink-0 transition-all ${isPaused ? 'bg-amber-50/80 border-amber-200/70' : 'bg-white'}`}>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#2C221E] hover:text-orange-600 cursor-pointer w-full"
                title={isPaused ? "点击继续计时" : "点击暂停计时"}
              >
                {isPaused ? (
                  <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600 flex-shrink-0" />
                ) : (
                  <Pause className="w-3.5 h-3.5 text-orange-500 fill-orange-500 flex-shrink-0" />
                )}
                <span className={`font-mono transition-opacity ${isPaused ? 'opacity-80 text-amber-900 animate-pulse' : ''}`}>
                  {formatTimer(elapsedSeconds)}
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowGuide(true)}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#2C221E] flex items-center gap-1 border border-[#F3EDE2] shadow-xs transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <span>指南</span>
            </button>
            <button
              onClick={handleCloseX}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#FAF8F5] flex items-center justify-center text-[#2C221E] shadow-xs transition-colors cursor-pointer flex-shrink-0"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. 中间独立滚动内容区域 (Flex-1 Overflow-Y-Auto) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* 活动标题 */}
          <div className="text-center px-2">
            <h2 className="text-base sm:text-lg font-black text-[#2C221E] tracking-tight">{activity.title}</h2>
            <p className="text-xs text-[#786F6A] mt-0.5 line-clamp-1">{activity.subtitle}</p>
          </div>

          {/* 插画容器（压缩高度至 130px） */}
          <div className="w-full bg-[#FAF8F5] rounded-2xl border border-[#F3EDE2] p-2 flex flex-col items-center gap-1.5 shadow-inner">
            <div className="w-full h-[130px] flex items-center justify-center">
              {renderActivityIllustration(activity.category)}
            </div>

            {/* 示范话术气泡 */}
            <div className="w-full bg-white/95 border border-orange-200/50 rounded-xl px-3 py-1.5 text-center shadow-xs">
              <span className="text-xs text-orange-800 font-medium leading-relaxed">
                💬 {activity.parentPrompt ? activity.parentPrompt.replace(/^["'“”]+|["'“”]+$/g, '') : '咚咚咚，小鼓敲起来，宝宝也来敲一敲！'}
              </span>
            </div>
          </div>

          {/* 3. 陪玩三步法（紧凑化间距 space-y-2） */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#F3EDE2] shadow-[0_4px_15px_rgba(44,34,30,0.03)] space-y-2.5">
            <div className="flex items-center justify-between pb-0.5">
              <span className="text-xs font-bold text-[#786F6A] flex items-center gap-1.5">
                📋 陪玩三步法
              </span>
              <button
                type="button"
                onClick={toggleSpeech}
                className={
                  isSpeaking
                    ? "rounded-full px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold flex items-center gap-1 animate-pulse cursor-pointer shadow-xs transition-all"
                    : "rounded-full px-3 py-1 bg-amber-100/70 hover:bg-amber-100 text-amber-900 text-xs font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                }
                title={isSpeaking ? "点击暂停朗读" : "点击听语音引导"}
                aria-label={isSpeaking ? "正在朗读" : "听怎么玩"}
              >
                {isSpeaking ? (
                  <>
                    <span>⏸</span>
                    <span>正在朗读</span>
                  </>
                ) : (
                  <>
                    <span>🔊</span>
                    <span>听怎么玩</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-2.5">
              {activity.steps.map((step: any) => (
                <div key={step.stepNumber} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#2C221E]">{step.title}</div>
                    <p className="text-[11px] text-[#786F6A] leading-relaxed font-normal">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. 底部常驻固定操作栏 (Fixed/Sticky Bottom with Frosted Glass Shading) */}
        <div className="shrink-0 p-4 bg-white/95 backdrop-blur-md border-t border-[#F3EDE2] shadow-[0_-10px_25px_rgba(44,34,30,0.06)] flex flex-col">
          <button
            onClick={handleComplete}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            🎉 完成陪伴，去打卡
          </button>
          
          <button
            onClick={handleSaveProgress}
            className="w-full h-9 py-2 bg-transparent border-0 shadow-none text-xs text-stone-400 hover:text-stone-600 active:opacity-60 transition-colors text-center font-normal tracking-wide flex items-center justify-center gap-1 mt-1 cursor-pointer"
          >
            稍后再玩 · 保存进度
          </button>
        </div>

        {/* 抽屉指南组件接入 */}
        {showGuide && (
          <TextGuideDrawer activity={activity} onClose={() => setShowGuide(false)} />
        )}

        {/* 未达到建议时长 80% 门槛提示弹窗 */}
        {showThresholdModal && (
          <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h4 className="text-sm font-bold text-stone-900">未达到完成建议门槛</h4>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                当前陪伴时间为 <span className="font-bold text-stone-900">{Math.floor(elapsedSeconds / 60)}分{elapsedSeconds % 60}秒</span>（活动建议时长：<span className="font-bold text-stone-900">{activity.duration}</span>，需达到 80% 门槛方可打卡完成）。
              </p>
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setShowThresholdModal(false);
                    if (!isPaused) {
                      timerRef.current = setInterval(() => {
                        setElapsedSeconds((prev) => prev + 1);
                      }, 1000);
                    }
                  }}
                  className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  继续陪玩
                </button>
                <button
                  onClick={handleConfirmInterrupted}
                  className="w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer transition-all"
                >
                  保存实际时长并结束（记录为片刻陪伴）
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export { CoachModeModal as PlaySessionModal };
