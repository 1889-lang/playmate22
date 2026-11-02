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
      const photoW = width - 72; // 568
      const photoH = 500;

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
          drawDefaultPhotoPlaceholder(ctx, photoX, photoY, photoW, photoH, babyName, stateMeta, activity);
        }
      } else {
        drawDefaultPhotoPlaceholder(ctx, photoX, photoY, photoW, photoH, babyName, stateMeta, activity);
      }

      // 相框轻柔内描边
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#E8DFD5';
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 16);
      ctx.stroke();

      // 3. 画面下方展示活动名称
      ctx.fillStyle = '#2C221E';
      ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activity.title, width / 2, 580);

      // 玩法分类与陪伴标签
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#C2410C';
      ctx.fillText(`✨ ${activity.category} · 适龄 ${activity.ageRange} · 宝宝状态：${stateMeta.label}`, width / 2, 620);

      // 活动副标题 / 发育指引
      const promptText = activity.parentPrompt
        ? `“${activity.parentPrompt.replace(/^["'“”]+|["'“”]+$/g, '')}”`
        : '“真正陪孩子玩一会儿，留下珍贵的成长片段”';
      ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#786F6A';
      const displayPrompt = promptText.length > 30 ? promptText.slice(0, 29) + '…”' : promptText;
      ctx.fillText(displayPrompt, width / 2, 680);

      // 4. 底部区域展示“专注陪伴 X 分钟 · 日期 · 玩伴日历”
      ctx.strokeStyle = '#F1EDE6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(photoX + 20, 745);
      ctx.lineTo(photoX + photoW - 20, 745);
      ctx.stroke();

      ctx.fillStyle = '#8C827A';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`专注陪伴 ${durationMinutes} 分钟 · ${date} · 玩伴日历`, width / 2, 785);

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

// Helper: draw default theme-matched picture-book scene when user hasn't uploaded photo
function drawDefaultPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  babyName: string,
  stateMeta: { emoji: string; label: string },
  activity: Activity
) {
  const cat = activity.category;

  // 1. 温润绘本渐变底色
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (cat.includes('大运动') || cat.includes('运动')) {
    grad.addColorStop(0, '#FFF7ED');
    grad.addColorStop(1, '#FED7AA');
  } else if (cat.includes('精细')) {
    grad.addColorStop(0, '#FFF1F2');
    grad.addColorStop(1, '#FECDD3');
  } else if (cat.includes('感官') || cat.includes('认知')) {
    grad.addColorStop(0, '#F0FDF4');
    grad.addColorStop(1, '#BBF7D0');
  } else if (cat.includes('社会') || cat.includes('情绪')) {
    grad.addColorStop(0, '#FAF5FF');
    grad.addColorStop(1, '#DDD6FE');
  } else {
    // 语言交流
    grad.addColorStop(0, '#F0F9FF');
    grad.addColorStop(1, '#BAE6FD');
  }

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.clip();
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // 2. 顶部胶囊标签
  const tagW = 160;
  const tagH = 34;
  const tagX = x + (w - tagW) / 2;
  const tagY = y + 26;
  ctx.fillStyle = '#FFFFFFD9';
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 17);
  ctx.fill();
  ctx.fillStyle = '#9A3412';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`✨ ${activity.category}`, tagX + tagW / 2, tagY + 22);

  // 3. 中心专属分类绘本矢量图形（纯 Canvas 2D 绘制，绝无异常字符或三角形沙漏）
  const cx = x + w / 2;
  const cy = y + 210;

  if (cat.includes('大运动') || cat.includes('运动')) {
    // 暖阳
    ctx.fillStyle = '#FDBA74';
    ctx.beginPath();
    ctx.arc(cx + 80, cy - 70, 32, 0, Math.PI * 2);
    ctx.fill();

    // 绿色草坡
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(cx - 180, cy + 90);
    ctx.quadraticCurveTo(cx - 30, cy + 20, cx + 180, cy + 70);
    ctx.lineTo(cx + 180, cy + 120);
    ctx.lineTo(cx - 180, cy + 120);
    ctx.closePath();
    ctx.fill();

    // 双脚迈步小脚丫印
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.ellipse(cx - 50, cy + 65, 12, 7, -0.2, 0, Math.PI * 2);
    ctx.ellipse(cx - 10, cy + 55, 12, 7, 0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + 30, cy + 60, 12, 7, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 弹跳小皮球
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx + 80, cy + 40, 20, 0, Math.PI * 2);
    ctx.fill();

    // 守护大手与宝宝
    ctx.fillStyle = '#E8B58D';
    ctx.beginPath();
    ctx.arc(cx - 60, cy - 20, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DFA39A';
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 5, 18, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('精细')) {
    // 彩色积木方块
    ctx.fillStyle = '#FDA4AF';
    ctx.beginPath();
    ctx.roundRect(cx - 85, cy + 15, 50, 50, 10);
    ctx.fill();

    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.roundRect(cx - 20, cy - 25, 50, 50, 10);
    ctx.fill();

    ctx.fillStyle = '#6EE7B7';
    ctx.beginPath();
    ctx.roundRect(cx + 45, cy + 15, 50, 50, 10);
    ctx.fill();

    // 积木圆孔
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 60, cy + 40, 10, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy, 10, 0, Math.PI * 2);
    ctx.arc(cx + 70, cy + 40, 10, 0, Math.PI * 2);
    ctx.fill();

    // 抓握小星光
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx, cy - 70, 9, 0, Math.PI * 2);
    ctx.arc(cx - 16, cy - 60, 6, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 60, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('感官') || cat.includes('认知')) {
    // 感知波纹同心圆
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FDBA74';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 中心发声摇铃
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // 点缀星芒
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(cx - 90, cy - 40, 6, 0, Math.PI * 2);
    ctx.arc(cx + 90, cy - 30, 8, 0, Math.PI * 2);
    ctx.arc(cx + 70, cy + 60, 5, 0, Math.PI * 2);
    ctx.arc(cx - 70, cy + 50, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('社会') || cat.includes('情绪')) {
    // 温暖微笑亲子
    ctx.fillStyle = '#C7D2FE';
    ctx.beginPath();
    ctx.arc(cx - 45, cy, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.arc(cx + 35, cy + 15, 38, 0, Math.PI * 2);
    ctx.fill();

    // 弯弯笑眼与微笑
    ctx.strokeStyle = '#4338CA';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - 58, cy - 6, 8, Math.PI, 0);
    ctx.arc(cx - 32, cy - 6, 8, Math.PI, 0);
    ctx.stroke();

    ctx.strokeStyle = '#9A3412';
    ctx.beginPath();
    ctx.arc(cx + 25, cy + 8, 6, Math.PI, 0);
    ctx.arc(cx + 45, cy + 8, 6, Math.PI, 0);
    ctx.stroke();

    // 飘动暖心红心
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 55, 12, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy - 55, 12, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 语言交流：翻开的书本与欢快对话
    ctx.fillStyle = '#E9D5FF';
    ctx.beginPath();
    ctx.roundRect(cx - 90, cy - 30, 85, 75, 10);
    ctx.roundRect(cx + 5, cy - 30, 85, 75, 10);
    ctx.fill();

    ctx.strokeStyle = '#C084FC';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 35);
    ctx.lineTo(cx, cy + 50);
    ctx.stroke();

    // 对话气泡
    ctx.fillStyle = '#FAF5FF';
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 50, cy - 80, 100, 38, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#7E22CE';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♪ 咿呀~ ♫', cx, cy - 55);
  }

  // 4. 下方半透明手账卡片：展示宝宝状态及手记
  const chipW = w - 48;
  const chipH = 92;
  const chipX = x + 24;
  const chipY = y + h - chipH - 18;

  ctx.fillStyle = '#FFFFFFE6';
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 14);
  ctx.fill();
  ctx.strokeStyle = '#F1E8DC';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 宝宝状态小胶囊
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`🌟 ${babyName} · ${stateMeta.label}时光`, cx, chipY + 28);

  // 展示活动副标题
  const noteToShow = activity.subtitle;
  ctx.fillStyle = '#57534E';
  ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const displayNoteToShow = noteToShow.length > 28 ? noteToShow.slice(0, 27) + '…' : noteToShow;
  ctx.fillText(displayNoteToShow, cx, chipY + 62);

  ctx.restore();
}
