/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { PlayRecord, Activity } from '../types';
import { X, Share2, CheckCircle2 } from 'lucide-react';
import { INITIAL_ACTIVITIES } from '../data/activities';
import { drawThemeIllustration } from './PolaroidModal';

interface PolaroidDetailModalProps {
  records: PlayRecord[];
  currentIndex: number;
  onSwitchRecord: (index: number) => void;
  onClose: () => void;
}

const cleanTitle = (title: string): string => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

const getReactionEmoji = (reaction?: string): string => {
  if (!reaction) return '😍';
  if (reaction.includes('喜欢') || reaction.includes('开心') || reaction.includes('happy') || reaction.includes('😍')) return '😍';
  if (reaction.includes('一般') || reaction.includes('平静') || reaction.includes('neutral') || reaction.includes('🙂')) return '🙂';
  if (reaction.includes('累') || reaction.includes('疲劳')) return '🥱';
  if (reaction.includes('不太') || reaction.includes('哭') || reaction.includes('sad') || reaction.includes('😢')) return '😢';
  return '😍';
};

export const PolaroidDetailModal: React.FC<PolaroidDetailModalProps> = ({
  records,
  currentIndex,
  onSwitchRecord,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Touch & Mouse Drag Gesture state & refs
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragEndX = useRef<number | null>(null);

  const currentRecord: PlayRecord | undefined = records[currentIndex] || records[0];

  // Match corresponding activity template for fallback illustration
  const activity: Activity = useMemo(() => {
    if (!currentRecord) {
      return INITIAL_ACTIVITIES[0];
    }
    const found = INITIAL_ACTIVITIES.find((a) => a.id === currentRecord.activityId);
    if (found) return found;
    return {
      id: currentRecord.activityId,
      title: currentRecord.activityTitle,
      subtitle: '',
      ageRange: '6-8个月',
      category: (currentRecord.category as any) || '感官认知',
      duration: `${currentRecord.durationMinutes || 15}分钟`,
      materials: [],
      prerequisite: '',
      steps: [],
      parentPrompt: '',
      observationTips: [],
      alternativePlay: '',
      developmentalDomain: currentRecord.category || '感官认知',
      safetyReminder: '',
      stopCondition: '',
      source: '日常陪伴',
      isReviewed: true,
      accentColor: 'apricot',
    };
  }, [currentRecord]);

  const displayTitle = cleanTitle(currentRecord?.activityTitle || activity.title);
  const reactionEmoji = getReactionEmoji(currentRecord?.reaction);
  const reactionLabel = currentRecord?.reaction || '开心专注';
  const durationText = currentRecord?.durationMinutes ? `累计 ${currentRecord.durationMinutes} 分钟` : '亲子陪伴';
  const stampText = `${reactionEmoji} ${reactionLabel} · ${durationText}`;

  // Drag Gesture Handlers
  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
    dragEndX.current = clientX;
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    dragEndX.current = clientX;
  };

  const handleDragEnd = () => {
    if (!isDragging || dragStartX.current === null || dragEndX.current === null) {
      setIsDragging(false);
      return;
    }
    const distance = dragStartX.current - dragEndX.current;
    const minSwipeDistance = 30;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next record
      if (currentIndex < records.length - 1) {
        onSwitchRecord(currentIndex + 1);
      }
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous record
      if (currentIndex > 0) {
        onSwitchRecord(currentIndex - 1);
      }
    }

    dragStartX.current = null;
    dragEndX.current = null;
    setIsDragging(false);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentIndex < records.length - 1) {
          onSwitchRecord(currentIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentIndex > 0) {
          onSwitchRecord(currentIndex - 1);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, records.length, onSwitchRecord, onClose]);

  // Generate category illustration Data URL for picture slot fallback when photoUrl is missing
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

  // Canvas drawing for export PNG card
  useEffect(() => {
    let isCancelled = false;

    const renderExportCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !currentRecord) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 600;
      const height = 750;
      canvas.width = width;
      canvas.height = height;

      // Card Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#EDF4E9';
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // 1. Date
      ctx.fillStyle = '#85877B';
      ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentRecord.date, width / 2, 44);

      // 2. Picture Area
      const photoX = 40;
      const photoY = 64;
      const photoW = 520;
      const photoH = 500;

      if (currentRecord.photoUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = currentRecord.photoUrl!;
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

      // 3. Activity Title
      ctx.fillStyle = '#292524';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(displayTitle, width / 2, 615);

      // 4. Stamp
      ctx.save();
      ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textMetrics = ctx.measureText(stampText);
      const badgeW = textMetrics.width + 28;
      const badgeH = 32;
      const badgeX = (width - badgeW) / 2;
      const badgeY = 645;

      ctx.fillStyle = '#FFFBEB';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();

      ctx.fillStyle = '#92400E';
      ctx.textAlign = 'center';
      ctx.fillText(stampText, width / 2, badgeY + 21);
      ctx.restore();

      if (!isCancelled) {
        setExportImageUrl(canvas.toDataURL('image/png'));
      }
    };

    renderExportCard();

    return () => {
      isCancelled = true;
    };
  }, [currentRecord, activity, displayTitle, stampText]);

  const handleShare = () => {
    if (!exportImageUrl || !currentRecord) return;
    const link = document.createElement('a');
    link.href = exportImageUrl;
    link.download = `陪伴手账-${displayTitle}-${currentRecord.date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  if (!currentRecord) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-between bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div
        className="w-full max-w-sm flex items-center justify-between px-2 pt-2 pb-2 shrink-0 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-white tracking-tight">
          历史陪伴手账
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Card Container flanked by prev/next navigation arrows */}
      <div
        className="w-full max-w-sm flex items-center justify-center gap-2 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {records.length > 1 && (
          <button
            type="button"
            onClick={() => currentIndex > 0 && onSwitchRecord(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-stone-200/70 shadow-xs flex items-center justify-center text-stone-700 text-lg transition-all cursor-pointer active:scale-95 shrink-0 ${
              currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:text-stone-950'
            }`}
            aria-label="上一张"
          >
            ‹
          </button>
        )}

        {/* Main Polaroid Card Container — Supports Touch & Mouse Dragging */}
        <div
          onTouchStart={(e) => handleDragStart(e.targetTouches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.targetTouches[0].clientX)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          className="w-full max-w-[280px] sm:max-w-[310px] bg-white rounded-2xl shadow-xl border border-stone-100 p-4 flex flex-col space-y-2.5 relative shrink-0 transition-transform duration-150 active:scale-[0.99] cursor-grab active:cursor-grabbing select-none"
        >
          {/* 1. Archived Date */}
          <div className="text-center text-xs font-mono text-[#85877B] font-medium tracking-wide pt-0.5">
            {currentRecord.date}
          </div>

          {/* 2. Photo / Theme Illustration Slot */}
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#FAF9F2] border border-[#EDF4E9] relative shadow-inner flex items-center justify-center">
            <img
              src={currentRecord.photoUrl || illustrationUrl}
              alt={currentRecord.photoUrl ? '陪伴记录照片' : '活动插画'}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* 3. Activity Title */}
          <h2 className="text-center text-base font-bold text-stone-800 mt-2 mb-0.5 tracking-tight">
            {displayTitle}
          </h2>

          {/* 4. Archived Status & Duration Stamp */}
          <div className="flex items-center justify-center pt-0.5">
            <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full inline-block mx-auto font-medium shadow-2xs">
              {stampText}
            </span>
          </div>
        </div>

        {/* Next Button */}
        {records.length > 1 && (
          <button
            type="button"
            onClick={() => currentIndex < records.length - 1 && onSwitchRecord(currentIndex + 1)}
            disabled={currentIndex === records.length - 1}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-stone-200/70 shadow-xs flex items-center justify-center text-stone-700 text-lg transition-all cursor-pointer active:scale-95 shrink-0 ${
              currentIndex === records.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:text-stone-950'
            }`}
            aria-label="下一张"
          >
            ›
          </button>
        )}
      </div>

      {/* 极简居中数字页码（无密集小圆点） */}
      {records.length > 1 && (
        <div
          className="text-xs text-stone-300 font-medium tracking-widest text-center py-2 mt-1 select-none shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {currentIndex + 1} / {records.length}
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div
        className="w-full max-w-sm flex flex-col items-center gap-2 shrink-0 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleShare}
          className={`w-3/5 max-w-[200px] h-11 text-white font-medium text-sm rounded-full shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            shareSuccess ? 'bg-[#3F8054]' : 'bg-[#62AD78] hover:bg-[#3F8054]'
          }`}
        >
          {shareSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>已保存分享相纸</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 shrink-0" />
              <span>📤 分享给家人</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-stone-300 hover:text-white text-xs py-1.5 block text-center transition-colors cursor-pointer w-full"
        >
          关闭
        </button>
      </div>
    </div>
  );
};
