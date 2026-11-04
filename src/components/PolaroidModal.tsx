/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Activity } from '../types';
import { X, Download, CheckCircle2, Camera } from 'lucide-react';

interface PolaroidModalProps {
  activity: Activity;
  durationMinutes: number;
  date: string;
  babyState?: string;
  photoUrl?: string;
  babyName?: string;
  onClose: () => void;
  onUpdateBabyState?: (state: string) => void;
  onUpdatePhotoUrl?: (url: string | undefined) => void;
  // Multi-record switcher support
  totalRecordsCount?: number;
  currentRecordIndex?: number;
  onSwitchRecord?: (index: number) => void;
}

const cleanTitle = (title: string): string => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

const cleanPromptText = (prompt?: string): string => {
  if (!prompt) return '';
  return prompt.replace(/^["'“”]+|["'“”]+$/g, '').trim();
};

type ReactionKey = 'happy' | 'neutral' | 'sad';

export const PolaroidModal: React.FC<PolaroidModalProps> = ({
  activity,
  date,
  babyState,
  photoUrl,
  onClose,
  onUpdateBabyState,
  onUpdatePhotoUrl,
  totalRecordsCount,
  currentRecordIndex,
  onSwitchRecord,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Reaction state: NULL if not explicitly selected
  const [selectedReaction, setSelectedReaction] = useState<ReactionKey | null>(() => {
    if (!babyState) return null;
    if (babyState === '很喜欢' || babyState === '开心' || babyState === 'happy' || babyState === '😍') return 'happy';
    if (babyState === '一般' || babyState === '平静' || babyState === 'neutral' || babyState === '🙂') return 'neutral';
    if (babyState === '不太喜欢' || babyState === '累了' || babyState === 'sad' || babyState === '😢') return 'sad';
    return null;
  });

  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(photoUrl);

  // Sync photoUrl state when prop changes due to record switching
  useEffect(() => {
    setCurrentPhotoUrl(photoUrl);
  }, [photoUrl]);

  // Sync babyState when prop changes due to record switching
  useEffect(() => {
    if (!babyState) {
      setSelectedReaction(null);
    } else if (babyState === '很喜欢' || babyState === '开心' || babyState === 'happy' || babyState === '😍') {
      setSelectedReaction('happy');
    } else if (babyState === '一般' || babyState === '平静' || babyState === 'neutral' || babyState === '🙂') {
      setSelectedReaction('neutral');
    } else if (babyState === '不太喜欢' || babyState === '累了' || babyState === 'sad' || babyState === '😢') {
      setSelectedReaction('sad');
    } else {
      setSelectedReaction(null);
    }
  }, [babyState]);

  const reactionButtons: { key: ReactionKey; emoji: string; label: string }[] = [
    { key: 'happy', emoji: '😍', label: '很喜欢' },
    { key: 'neutral', emoji: '🙂', label: '一般' },
    { key: 'sad', emoji: '😢', label: '不太喜欢' },
  ];

  const handleSelectReaction = (key: ReactionKey) => {
    const nextValue = selectedReaction === key ? null : key;
    setSelectedReaction(nextValue);
    if (onUpdateBabyState) {
      const mappedText = nextValue === 'happy' ? '很喜欢' : nextValue === 'neutral' ? '一般' : nextValue === 'sad' ? '不太喜欢' : '';
      onUpdateBabyState(mappedText);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCurrentPhotoUrl(reader.result);
        if (onUpdatePhotoUrl) onUpdatePhotoUrl(reader.result);
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

  const displayTitle = cleanTitle(activity.title);
  const promptText = cleanPromptText(activity.parentPrompt);

  // Canvas drawing for export PNG (Renders the single clean Polaroid card)
  useEffect(() => {
    let isCancelled = false;

    const renderExportCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Card Canvas dimensions: 600 x 780 px
      const width = 600;
      const height = 780;
      canvas.width = width;
      canvas.height = height;

      // Card Background (Pure White Paper)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Outer Hairline Border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#EDF4E9';
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // 1. Date (Top Center)
      ctx.fillStyle = '#85877B';
      ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(date, width / 2, 44);

      // 2. Picture Area (x: 40, y: 64, w: 520, h: 520)
      const photoX = 40;
      const photoY = 64;
      const photoW = 520;
      const photoH = 520;

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

      // Picture inner border
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#EDF4E9';
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 16);
      ctx.stroke();

      // 3. Clean Activity Title
      ctx.fillStyle = '#45483F';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(displayTitle, width / 2, 626);

      // 4. Companion Sentence (if present)
      let nextY = 662;
      if (promptText) {
        ctx.fillStyle = '#85877B';
        ctx.font = '400 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const displayPrompt = promptText.length > 36 ? promptText.slice(0, 35) + '…' : promptText;
        ctx.fillText(displayPrompt, width / 2, nextY);
        nextY += 38;
      }

      // 5. Selected Baby Reaction Stamp (ONLY if user selected a reaction)
      if (selectedReaction) {
        const selectedBtn = reactionButtons.find((b) => b.key === selectedReaction);
        if (selectedBtn) {
          const stampText = `${selectedBtn.emoji} ${selectedBtn.label}`;
          ctx.fillStyle = '#3F8054';
          ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          
          // Draw subtle background capsule for status stamp
          ctx.save();
          const textMetrics = ctx.measureText(stampText);
          const badgeW = textMetrics.width + 24;
          const badgeH = 30;
          const badgeX = (width - badgeW) / 2;
          const badgeY = nextY - 20;

          ctx.fillStyle = '#EDF4E9';
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 15);
          ctx.fill();

          ctx.fillStyle = '#3F8054';
          ctx.fillText(stampText, width / 2, nextY);
          ctx.restore();
        }
      }

      if (!isCancelled) {
        setExportImageUrl(canvas.toDataURL('image/png'));
      }
    };

    renderExportCard();

    return () => {
      isCancelled = true;
    };
  }, [activity, date, selectedReaction, currentPhotoUrl, displayTitle, promptText]);

  const handleDownload = () => {
    if (!exportImageUrl) return;
    const link = document.createElement('a');
    link.href = exportImageUrl;
    link.download = `陪伴手账-${displayTitle}-${date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const selectedBtnInfo = reactionButtons.find((b) => b.key === selectedReaction);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-between bg-[#FAF9F2] p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Region 1: Top Navigation Header with Multi-Record Switcher */}
      <div className="w-full max-w-sm flex items-center justify-between py-2 shrink-0">
        <h3 className="text-sm font-bold text-[#45483F]">
          陪伴手账
        </h3>

        {/* Multi-record Pagination Switcher */}
        {totalRecordsCount && totalRecordsCount > 1 && onSwitchRecord && currentRecordIndex !== undefined && (
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#EDF4E9] text-xs shadow-xs">
            <button
              type="button"
              disabled={currentRecordIndex === 0}
              onClick={() => onSwitchRecord(currentRecordIndex - 1)}
              className="text-[#3F8054] disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer hover:scale-110 transition-all select-none"
              title="上一次陪伴"
            >
              ‹
            </button>
            <span className="text-[#85877B] font-mono text-[11px] select-none">
              {currentRecordIndex + 1} / {totalRecordsCount} 次陪伴
            </span>
            <button
              type="button"
              disabled={currentRecordIndex === totalRecordsCount - 1}
              onClick={() => onSwitchRecord(currentRecordIndex + 1)}
              className="text-[#3F8054] disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer hover:scale-110 transition-all select-none"
              title="下一次陪伴"
            >
              ›
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white hover:bg-[#EDF4E9] flex items-center justify-center text-[#85877B] hover:text-[#45483F] transition-colors cursor-pointer shadow-xs border border-[#EDF4E9]"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Region 2: Middle Hero Visual — Single Pure White Polaroid Card */}
      <div className="w-full max-w-[280px] sm:max-w-[310px] bg-white rounded-2xl shadow-md border border-[#EDF4E9]/80 p-4 flex flex-col space-y-3 relative shrink-0 my-auto">
        
        {/* 1. Date */}
        <div className="text-center text-xs font-mono text-[#85877B] font-medium tracking-wide">
          {date}
        </div>

        {/* 2. Main Picture Area (Clean & Intact: Photo or Illustration) */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-square rounded-xl overflow-hidden bg-[#FAF9F2] border border-[#EDF4E9] relative cursor-pointer group shadow-inner flex items-center justify-center"
          title={currentPhotoUrl ? '点击更换照片' : '点击上传照片'}
        >
          <img
            src={currentPhotoUrl || illustrationUrl}
            alt={currentPhotoUrl ? '宝宝照片' : '活动插画'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
        </div>

        {/* 3. Activity Title */}
        <h2 className="text-center text-base font-bold text-[#45483F] tracking-tight pt-0.5">
          {displayTitle}
        </h2>

        {/* 4. Companion Sentence */}
        {promptText && (
          <p className="text-center text-xs text-[#85877B] leading-relaxed line-clamp-2 px-1">
            {promptText}
          </p>
        )}

        {/* 5. Baby Status Stamp (ONLY shown if user selected a reaction) */}
        {selectedBtnInfo && (
          <div className="flex items-center justify-center pt-0.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EDF4E9] text-[#3F8054] text-xs font-medium rounded-full">
              <span>{selectedBtnInfo.emoji}</span>
              <span>{selectedBtnInfo.label}</span>
            </span>
          </div>
        )}
      </div>

      {/* Region 3: Single Row Lightweight Edit Bar directly below card */}
      <div className="w-full max-w-sm flex items-center justify-center gap-2 py-2 select-none shrink-0">
        {/* Expression Toggle */}
        <div className="flex items-center gap-1.5">
          {reactionButtons.map((btn) => {
            const isSelected = selectedReaction === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => handleSelectReaction(btn.key)}
                className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full text-xl flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EDF4E9] text-[#3F8054] shadow-xs scale-105'
                    : 'bg-white/80 hover:bg-white text-[#85877B] opacity-75 hover:opacity-100 border border-transparent hover:border-[#EDF4E9]'
                }`}
                title={btn.label}
                aria-label={btn.label}
              >
                <span>{btn.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-[#85877B]/20 mx-1 shrink-0" />

        {/* Photo Entrance */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] px-2.5 text-xs font-medium text-[#45483F] hover:text-[#3F8054] flex items-center gap-1.5 transition-colors cursor-pointer rounded-lg hover:bg-white/60"
        >
          <Camera className="w-4 h-4 text-[#62AD78]" />
          <span>{currentPhotoUrl ? '更换照片' : '添加照片'}</span>
        </button>
      </div>

      {/* Region 4: Bottom Action Buttons */}
      <div className="w-full max-w-sm flex flex-col items-center gap-2 shrink-0 py-2">
        <button
          type="button"
          disabled={!exportImageUrl}
          onClick={handleDownload}
          className={`w-3/5 max-w-[200px] h-11 text-white font-medium text-sm rounded-full shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            downloadSuccess
              ? 'bg-[#3F8054]'
              : 'bg-[#62AD78] hover:bg-[#3F8054]'
          }`}
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>已保存</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 shrink-0" />
              <span>保存</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-[#85877B] hover:text-[#45483F] text-xs py-1.5 block text-center transition-colors cursor-pointer w-full"
        >
          返回
        </button>
      </div>
    </div>
  );
};

// Helper: 绘制分类专属北欧温暖主题插画 (Scandinavian Editorial Illustration)
export function drawThemeIllustration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  activity: Activity
) {
  const cat = activity.category || '';

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.clip();

  // 1. 北欧暖调渐变背景
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (cat.includes('大运动')) {
    grad.addColorStop(0, '#FEF3E2');
    grad.addColorStop(1, '#FED7AA');
  } else if (cat.includes('精细')) {
    grad.addColorStop(0, '#FFF1F2');
    grad.addColorStop(1, '#FECDD3');
  } else if (cat.includes('感官')) {
    grad.addColorStop(0, '#F0FDF4');
    grad.addColorStop(1, '#BBF7D0');
  } else if (cat.includes('社会')) {
    grad.addColorStop(0, '#FAF5FF');
    grad.addColorStop(1, '#DDD6FE');
  } else {
    grad.addColorStop(0, '#F0F9FF');
    grad.addColorStop(1, '#BAE6FD');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  const cx = x + w / 2;
  const cy = y + h / 2;

  // 2. 根据不同活动类别绘制矢量儿童绘本插画
  if (cat.includes('大运动')) {
    ctx.fillStyle = '#FDBA74';
    ctx.beginPath();
    ctx.arc(cx + 120, cy - 120, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(x - 50, cy + 180);
    ctx.quadraticCurveTo(cx, cy + 80, x + w + 50, cy + 140);
    ctx.lineTo(x + w + 50, h + y);
    ctx.lineTo(x - 50, h + y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.ellipse(cx - 60, cy + 40, 24, 14, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + 20, cy + 10, 24, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx + 110, cy - 20, 28, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('精细')) {
    ctx.fillStyle = '#FDA4AF';
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy + 20, 80, 80, 16);
    ctx.fill();

    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.roundRect(cx - 20, cy - 40, 80, 80, 16);
    ctx.fill();

    ctx.fillStyle = '#6EE7B7';
    ctx.beginPath();
    ctx.roundRect(cx + 40, cy + 40, 70, 70, 16);
    ctx.fill();

    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx - 30, cy - 90, 12, 0, Math.PI * 2);
    ctx.arc(cx + 50, cy - 70, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('感官')) {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 5;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.arc(cx, cy, 130, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FDBA74';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 12, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('社会')) {
    ctx.fillStyle = '#C7D2FE';
    ctx.beginPath();
    ctx.arc(cx - 70, cy + 10, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.arc(cx + 50, cy + 30, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 70, 18, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy - 70, 18, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#E9D5FF';
    ctx.beginPath();
    ctx.roundRect(cx - 130, cy - 40, 120, 110, 14);
    ctx.roundRect(cx + 10, cy - 40, 120, 110, 14);
    ctx.fill();

    ctx.fillStyle = '#FAF5FF';
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 90, cy - 120, 180, 56, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#7E22CE';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪ 咿呀~ ♫', cx, cy - 92);
  }

  ctx.restore();
}
