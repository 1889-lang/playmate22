/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Activity, BabyReaction } from '../types';
import { X, Volume2, VolumeX, Camera, Share2, CheckCircle2, Sparkles } from 'lucide-react';
import { getLocalDateStr } from '../utils/date';
import { drawThemeIllustration } from './PolaroidModal';

const cleanTitle = (title: string): string => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

interface PlaySessionModalProps {
  activity: Activity;
  sessionId?: string;
  initialSeconds?: number;
  onFinishPlay: (
    activity: Activity,
    elapsedSeconds: number,
    reaction: BabyReaction,
    photoUrl?: string,
    sessionId?: string
  ) => void;
  onClose: () => void;
}

type ReactionKey = 'happy' | 'focused' | 'tired';

export const PlaySessionModal: React.FC<PlaySessionModalProps> = ({
  activity,
  sessionId,
  initialSeconds = 0,
  onFinishPlay,
  onClose,
}) => {
  const [step, setStep] = useState<'playing' | 'settle'>('playing');
  const [activeSessionId] = useState<string>(
    () => sessionId || 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<ReactionKey>('happy');
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(undefined);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const timerRef = useRef<any>(null);
  const isSettledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reactionButtons = [
    { key: 'happy', emoji: '😍', label: '开心', text: '开心专注' as BabyReaction },
    { key: 'focused', emoji: '😊', label: '专注', text: '平静探索' as BabyReaction },
    { key: 'tired', emoji: '🥱', label: '累了', text: '容易疲劳' as BabyReaction },
  ] as const;

  // Stop speech synthesis helper
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (step === 'playing') {
      timerRef.current = setInterval(() => {
        if (!document.hidden) {
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const displayTitle = cleanTitle(activity.title);
  const dateStr = getLocalDateStr();

  // Voice speech guide generator
  const buildSpeechText = () => {
    const stepsText = (activity.steps || [])
      .map((st: any, idx: number) => `第${idx + 1}步：${st.title}。${st.description}`)
      .join('。');
    const rhymeText = activity.parentPrompt ? `亲子口诀：${activity.parentPrompt}` : '';
    return `${displayTitle}。${activity.subtitle || ''}。${rhymeText}。玩法介绍：${stepsText}`;
  };

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    window.speechSynthesis.cancel();
    const text = buildSpeechText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Transition from 'playing' to 'settle'
  const handleTransitionToSettle = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('settle');
  };

  // Direct exit in playing stage (e.g. clicking X)
  const handleExitInPlaying = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    const selectedBtn = reactionButtons.find((b) => b.key === selectedReaction);
    const mappedReaction = selectedBtn ? selectedBtn.text : '开心专注';
    onFinishPlay(activity, elapsedSeconds, mappedReaction, currentPhotoUrl, activeSessionId);
    onClose();
  };

  // Save & Close in settle stage
  const handleSaveAndClose = () => {
    if (isSettledRef.current) return;
    isSettledRef.current = true;

    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);

    const selectedBtn = reactionButtons.find((b) => b.key === selectedReaction);
    const mappedReaction = selectedBtn ? selectedBtn.text : '开心专注';

    onFinishPlay(activity, elapsedSeconds, mappedReaction, currentPhotoUrl, activeSessionId);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCurrentPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate category illustration Data URL for picture slot fallback
  const illustrationUrl = useMemo(() => {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = 520;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawThemeIllustration(ctx, 0, 0, 520, 520, activity);
    }
    return canvas.toDataURL('image/png');
  }, [activity]);

  // Export card canvas rendering for Polaroid PNG
  useEffect(() => {
    if (step !== 'settle') return;
    let isCancelled = false;

    const renderExportCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 600;
      const height = 750;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#EDF4E9';
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // Date
      ctx.fillStyle = '#85877B';
      ctx.font = '500 16px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dateStr, width / 2, 44);

      // Photo / Illustration
      const photoX = 40, photoY = 64, photoW = 520, photoH = 500;
      if (currentPhotoUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = currentPhotoUrl;
          });
          if (!isCancelled) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoW, photoH, 16);
            ctx.clip();
            const imgRatio = img.width / img.height;
            const targetRatio = photoW / photoH;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (imgRatio > targetRatio) {
              sw = img.height * targetRatio;
              sx = (img.width - sw) / 2;
            } else {
              sh = img.width / targetRatio;
              sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
            ctx.restore();
          }
        } catch {
          drawThemeIllustration(ctx, photoX, photoY, photoW, photoH, activity);
        }
      } else {
        drawThemeIllustration(ctx, photoX, photoY, photoW, photoH, activity);
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = '#EDF4E9';
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 16);
      ctx.stroke();

      // Title
      ctx.fillStyle = '#292524';
      ctx.font = 'bold 26px -apple-system, sans-serif';
      ctx.fillText(displayTitle, width / 2, 615);

      // Stamp
      const selectedBtn = reactionButtons.find((b) => b.key === selectedReaction);
      const displayMins = Math.max(1, Math.floor(elapsedSeconds / 60));
      const stampText = `${selectedBtn ? selectedBtn.emoji + ' ' + selectedBtn.label : '😍 开心'} · 陪伴 ${displayMins} 分钟`;

      ctx.save();
      ctx.font = '500 16px -apple-system, sans-serif';
      const textMetrics = ctx.measureText(stampText);
      const badgeW = textMetrics.width + 28;
      const badgeH = 32;
      const badgeX = (width - badgeW) / 2;
      const badgeY = 645;

      ctx.fillStyle = '#ECFDF5';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();

      ctx.fillStyle = '#065F46';
      ctx.textAlign = 'center';
      ctx.fillText(stampText, width / 2, badgeY + 21);
      ctx.restore();

      if (!isCancelled) {
        setExportImageUrl(canvas.toDataURL('image/png'));
      }
    };

    renderExportCard();
    return () => { isCancelled = true; };
  }, [step, currentPhotoUrl, selectedReaction, displayTitle, dateStr, elapsedSeconds]);

  const handleShare = () => {
    if (exportImageUrl) {
      const link = document.createElement('a');
      link.href = exportImageUrl;
      link.download = `陪伴足迹-${displayTitle}-${dateStr}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const categories = useMemo(() => {
    if (!activity.category) return [];
    if (Array.isArray(activity.category)) return activity.category;
    return [activity.category];
  }, [activity.category]);

  const steps = activity.steps || [];
  const hasTips = activity.observationTips && activity.observationTips.length > 0;
  const selectedBtnInfo = reactionButtons.find((b) => b.key === selectedReaction);
  const displayMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 select-none transition-all duration-300">
        {step === 'playing' ? (
          /* --- STEP 1: PLAYING 陪伴中 --- */
          <>
            {/* Header */}
            <div className="px-4 py-3 bg-[#EDF4E9] flex items-center justify-between border-b border-[#62AD78]/20 shrink-0">
              <div className="flex-1 min-w-0 pr-2 space-y-1">
                <h2 className="text-base font-bold text-[#45483F] tracking-tight truncate">
                  {displayTitle}
                </h2>
                {categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="bg-[#EDF4E9] text-[#3F8054] text-[11px] px-2.5 py-0.5 rounded-md font-medium border border-[#62AD78]/20"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    isSpeaking ? 'bg-[#3F8054] text-white shadow-xs animate-pulse' : 'bg-white text-[#3F8054] hover:bg-[#EDF4E9]'
                  }`}
                  title={isSpeaking ? '关闭语音讲解' : '播放语音讲解'}
                >
                  {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleExitInPlaying}
                  className="p-1 rounded-full bg-white/80 text-[#85877B] hover:text-[#45483F] hover:bg-white transition-colors cursor-pointer"
                  title="退出陪伴"
                  aria-label="退出"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-3.5 overflow-y-auto space-y-2.5 flex-1">
              {/* 核心玩法动作示范插画 (P0 视觉聚焦) */}
              <div className="w-full h-32 sm:h-36 bg-amber-50/60 rounded-2xl overflow-hidden flex items-center justify-center border border-amber-100/80 shrink-0 shadow-inner">
                <img
                  src={illustrationUrl}
                  alt="核心玩法动作示范插画"
                  className="w-full h-full object-contain p-1.5"
                />
              </div>

              {/* 1. 极简三步法 (置于插画下方) */}
              {steps.length > 0 && (
                <div className="p-3 bg-stone-50/80 rounded-xl space-y-1.5 border border-stone-200/50">
                  <span className="text-[10px] font-bold text-[#45483F] block mb-0.5">极简三步法</span>
                  <div className="space-y-1.5">
                    {steps.map((st, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-[#62AD78] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="text-[#45483F] leading-normal flex-1">
                          <span className="font-bold mr-1">{st.title}：</span>
                          <span className="text-[#85877B]">{st.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. 陪伴互动锦囊（无双引号纯净排版便签） */}
              {(activity.parentPrompt || hasTips) && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/50 rounded-2xl space-y-1.5">
                  <div className="text-xs font-medium text-amber-800 flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>✨ 陪伴互动锦囊</span>
                  </div>

                  {activity.parentPrompt && (
                    <span className="text-xs font-normal text-stone-600 leading-relaxed block">
                      {activity.parentPrompt.replace(/^["'“”]+|["'“”]+$/g, '').trim()}
                    </span>
                  )}

                  <span className="text-xs font-normal text-stone-600 leading-relaxed block mt-1.5">
                    {hasTips && activity.observationTips[0]
                      ? activity.observationTips[0]
                      : '动作轻柔一些，多用微笑鼓励宝宝跟着模仿哦。'}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="shrink-0 p-3.5 bg-white border-t border-[#EDF4E9] shadow-xs flex justify-center">
              <button
                type="button"
                onClick={handleTransitionToSettle}
                className="w-3/5 max-w-[200px] h-10 bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>结束陪伴</span>
              </button>
            </div>
          </>
        ) : (
          /* --- STEP 2: SETTLE 手账结算与分享视图 --- */
          <>
            {/* Header */}
            <div className="p-4 bg-[#EDF4E9] flex items-center justify-between border-b border-[#62AD78]/20 shrink-0 relative">
              <h2 className="text-base font-bold text-stone-800 tracking-tight text-center w-full">
                🎉 太棒了！完成了本次陪伴
              </h2>
              <button
                type="button"
                onClick={handleSaveAndClose}
                className="p-1.5 rounded-full bg-white/80 text-[#85877B] hover:text-[#45483F] hover:bg-white transition-colors cursor-pointer absolute right-4"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Polaroid Hero Card */}
              <div className="w-full max-w-[280px] sm:max-w-[310px] mx-auto bg-white rounded-2xl border border-[#EDF4E9] p-4 flex flex-col space-y-2.5 shadow-md">
                <div className="text-center text-xs font-mono text-[#85877B] font-medium">
                  {dateStr}
                </div>

                {/* Photo / Illustration Slot */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square rounded-xl overflow-hidden bg-[#FAF9F2] border border-[#EDF4E9] relative cursor-pointer group shadow-inner flex items-center justify-center"
                  title={currentPhotoUrl ? '点击更换照片' : '点击上传照片'}
                >
                  <img
                    src={currentPhotoUrl || illustrationUrl}
                    alt="手账卡片"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-xs opacity-80 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-center text-base font-bold text-stone-800 pt-1 tracking-tight">
                  {displayTitle}
                </h3>

                {/* Stamp Badge */}
                <div className="flex items-center justify-center pt-0.5">
                  <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full inline-block mx-auto font-medium border border-emerald-200/60 shadow-2xs">
                    {selectedBtnInfo ? `${selectedBtnInfo.emoji} ${selectedBtnInfo.label}` : '😍 开心'} · 陪伴 {displayMinutes} 分钟
                  </span>
                </div>
              </div>

              {/* Mood Selection Pills (3 药丸快选) */}
              <div className="flex items-center justify-center gap-2 py-1">
                {reactionButtons.map((btn) => {
                  const isSelected = selectedReaction === btn.key;
                  return (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setSelectedReaction(btn.key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-400 shadow-2xs scale-105 font-bold'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                      }`}
                    >
                      <span className="text-sm">{btn.emoji}</span>
                      <span>{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="shrink-0 p-4 bg-white border-t border-[#EDF4E9] shadow-xs flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="w-full max-w-[240px] h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>已保存今日陪伴足迹</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 shrink-0" />
                    <span>📤 分享今日陪伴足迹</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveAndClose}
                className="text-xs text-stone-400 hover:text-stone-600 py-2.5 block text-center transition-colors cursor-pointer w-full"
              >
                收入成长足迹并关闭
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { PlaySessionModal as CoachModeModal };
