/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Activity } from '../types';
import { X, Download, CheckCircle2 } from 'lucide-react';

interface PolaroidModalProps {
  activity: Activity;
  durationMinutes: number;
  date: string;
  babyState?: string;
  photoUrl?: string;
  babyName?: string;
  onClose: () => void;
}

export const PolaroidModal: React.FC<PolaroidModalProps> = ({
  activity,
  durationMinutes,
  date,
  babyState = 'happy',
  photoUrl,
  babyName = '宝宝',
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Map state to label and emoji
  const stateMeta = (() => {
    switch (babyState) {
      case 'calm':
      case '平静':
      case '平静探索':
        return { emoji: '😊', label: '平静探索' };
      case 'tired':
      case '累了':
      case '容易疲劳':
        return { emoji: '🥱', label: '有点累了' };
      case 'happy':
      case '开心':
      case '开心专注':
      default:
        return { emoji: '😍', label: '开心专注' };
    }
  })();

  useEffect(() => {
    let isCancelled = false;

    const renderPoster = async () => {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 640x840 px (2x Retina scale of 320x420)
      const width = 640;
      const height = 840;
      canvas.width = width;
      canvas.height = height;

      // 1. 米白拍立得相纸底色
      ctx.fillStyle = '#FFFDF9';
      ctx.fillRect(0, 0, width, height);

      // 相纸精致柔和边框
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#EFE8DE';
      ctx.strokeRect(6, 6, width - 12, height - 12);

      // 2. 画面区域（相框内嵌）
      const photoX = 36;
      const photoY = 36;
      const photoW = width - 72;
      const photoH = 520;

      if (photoUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = photoUrl;
          });

          if (!isCancelled) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(photoX, photoY, photoW, photoH, 16);
            ctx.clip();

            // Cover aspect fit
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
          drawDefaultPhotoPlaceholder(ctx, photoX, photoY, photoW, photoH, babyName, stateMeta);
        }
      } else {
        drawDefaultPhotoPlaceholder(ctx, photoX, photoY, photoW, photoH, babyName, stateMeta);
      }

      // 相框轻柔内描边
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#E8DFD5';
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 16);
      ctx.stroke();

      // 3. 画面下方展示活动名称
      ctx.fillStyle = '#2C221E';
      ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activity.title, width / 2, 620);

      // 玩法分类小胶囊
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#C2410C';
      ctx.fillText(`✨ ${activity.category} · 宝宝状态：${stateMeta.emoji} ${stateMeta.label}`, width / 2, 665);

      // 亲子趣味提示
      const promptText = activity.parentPrompt
        ? `“${activity.parentPrompt.replace(/^["'“”]+|["'“”]+$/g, '')}”`
        : '“真正陪孩子玩一会儿，留下珍贵的成长片段”';
      ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#786F6A';
      ctx.fillText(promptText, width / 2, 715);

      // 4. 底部区域展示“专注陪伴 X 分钟 · 日期 · 玩伴日历”
      ctx.strokeStyle = '#F1EDE6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(photoX, 755);
      ctx.lineTo(photoX + photoW, 755);
      ctx.stroke();

      ctx.fillStyle = '#8C827A';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`专注陪伴 ${durationMinutes} 分钟 · ${date} · 玩伴日历`, width / 2, 795);

      if (!isCancelled) {
        setRenderedImageUrl(canvas.toDataURL('image/png'));
        setIsGenerating(false);
      }
    };

    renderPoster();

    return () => {
      isCancelled = true;
    };
  }, [activity, durationMinutes, date, babyState, photoUrl, babyName]);

  const handleDownload = () => {
    if (!renderedImageUrl) return;
    const link = document.createElement('a');
    link.href = renderedImageUrl;
    link.download = `玩伴日历-拍立得-${activity.title}-${date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#F3EDE2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base">📸</span>
            <h3 className="text-sm font-bold text-stone-900">拍立得陪伴手账</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scrollable Preview Area */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-stone-100/50">
          {isGenerating ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-500">正在绘制暖色拍立得卡片...</p>
            </div>
          ) : (
            renderedImageUrl && (
              <div className="space-y-2.5 w-full flex flex-col items-center">
                <div className="w-[300px] h-[393px] rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 bg-[#FFFDF9]">
                  <img
                    src={renderedImageUrl}
                    alt="拍立得陪伴手账海报"
                    className="w-full h-full object-contain block select-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400 text-center">
                  💡 手机端可长按上方图片直接保存到系统相册
                </p>
              </div>
            )
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-white border-t border-[#F3EDE2] space-y-2 shrink-0">
          <button
            type="button"
            disabled={isGenerating || !renderedImageUrl}
            onClick={handleDownload}
            className={`w-full h-12 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 active:scale-[0.99]'
            }`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>✓ 已保存海报到下载相册</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>📥 保存海报图片</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-9 py-1 bg-transparent border-none text-xs text-stone-400 hover:text-stone-600 transition-colors text-center font-normal cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper: draw default warm pattern photo when user hasn't uploaded photo
function drawDefaultPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  babyName: string,
  stateMeta: { emoji: string; label: string }
) {
  // Gradient backdrop
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#FFF5EB');
  grad.addColorStop(0.5, '#FEF3C7');
  grad.addColorStop(1, '#FFE4E6');

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.clip();
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Decorative dots/stars
  ctx.fillStyle = '#FDBA74';
  ctx.beginPath();
  ctx.arc(x + 40, y + 50, 5, 0, Math.PI * 2);
  ctx.arc(x + w - 50, y + 60, 6, 0, Math.PI * 2);
  ctx.arc(x + 80, y + h - 60, 4, 0, Math.PI * 2);
  ctx.arc(x + w - 60, y + h - 50, 5, 0, Math.PI * 2);
  ctx.fill();

  // Big Emoji in center
  ctx.font = '110px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stateMeta.emoji, x + w / 2, y + h / 2 + 10);

  // Baby caption
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${babyName} · ${stateMeta.label}时光`, x + w / 2, y + h / 2 + 75);

  ctx.restore();
}
