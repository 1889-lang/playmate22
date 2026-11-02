/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Activity } from '../types';
import { X, Download, CheckCircle2, Camera, Sparkles } from 'lucide-react';

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
}

export const PolaroidModal: React.FC<PolaroidModalProps> = ({
  activity,
  durationMinutes,
  date,
  babyState = '开心',
  photoUrl,
  babyName = '宝宝',
  onClose,
  onUpdateBabyState,
  onUpdatePhotoUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  const [currentBabyState, setCurrentBabyState] = useState<string>(babyState);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(photoUrl);

  const reactionOptions = [
    { key: '很喜欢', emoji: '😍', label: '很喜欢' },
    { key: '挺开心', emoji: '😊', label: '挺开心' },
    { key: '一般', emoji: '😐', label: '一般' },
    { key: '不太感兴趣', emoji: '😣', label: '不太感兴趣' },
  ];

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

  useEffect(() => {
    let isCancelled = false;

    const renderPoster = async () => {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 640x920 px (2x Retina scale for Scandinavian Editorial Scrapbook Polaroid)
      const width = 640;
      const height = 920;
      canvas.width = width;
      canvas.height = height;

      // 1. 拍立得卡片底色 (#FAF7F2 背景外框，纸张 #FFFFFF)
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, width, height);

      // 纸张主体
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(24, 24, width - 48, height - 48, 20);
      ctx.shadowColor = 'rgba(69, 67, 63, 0.12)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      ctx.fill();
      ctx.shadowColor = 'transparent'; // reset

      // 纸张精致边框
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#F1EAE0';
      ctx.strokeRect(24, 24, width - 48, height - 48);

      // 2. 顶部微型手账日期标签
      ctx.fillStyle = '#858078';
      ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✨ ${date} · 玩伴日历成长手账`, width / 2, 62);

      // 3. 中间视觉主体区（Square Photo Area: 560 x 560 px）
      const photoX = 40;
      const photoY = 88;
      const photoW = 560;
      const photoH = 560;

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
            ctx.roundRect(photoX, photoY, photoW, photoH, 14);
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

      // 照片内边框
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#E8DFD5';
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 14);
      ctx.stroke();

      // 4. 底部记录区（清晰排版：活动名称 28px，时长与宝宝状态 17px）
      // ① 活动名称
      ctx.fillStyle = '#45433F';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activity.title, width / 2, 705);

      // ② 实际陪玩时长、宝宝状态与成长领域
      const emojiMap: Record<string, string> = {
        '很喜欢': '😍 很喜欢',
        '挺开心': '😊 挺开心',
        '一般': '😐 一般',
        '不太感兴趣': '😣 不太感兴趣',
        '开心': '😍 很喜欢',
        '平静': '😊 挺开心',
        '累了': '🥱 累了',
      };
      const stateText = emojiMap[currentBabyState] || `✨ ${currentBabyState}`;
      ctx.fillStyle = '#858078';
      ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`⏱️ ${durationMinutes}分钟 · ${stateText} · 🌱 ${activity.category}`, width / 2, 755);

      // ③ 温馨短句 / 手记（若有 parentPrompt 则展示，字号 15px 确保清晰）
      if (activity.parentPrompt) {
        const cleanPrompt = `“${activity.parentPrompt.replace(/^["'“”]+|["'“”]+$/g, '')}”`;
        ctx.fillStyle = '#858078';
        ctx.font = 'italic 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const displayPrompt = cleanPrompt.length > 38 ? cleanPrompt.slice(0, 37) + '…”' : cleanPrompt;
        ctx.fillText(displayPrompt, width / 2, 805);
      }

      // ④ 底部纤细装饰分割线与手账印章
      ctx.strokeStyle = '#F1EAE0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(photoX + 24, 840);
      ctx.lineTo(photoX + photoW - 24, 840);
      ctx.stroke();

      ctx.fillStyle = '#A8A29E';
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`宝宝档案：${babyName} · 玩伴日历成长印记`, width / 2, 872);

      if (!isCancelled) {
        setRenderedImageUrl(canvas.toDataURL('image/png'));
        setIsGenerating(false);
      }
    };

    renderPoster();

    return () => {
      isCancelled = true;
    };
  }, [activity, durationMinutes, date, currentBabyState, currentPhotoUrl, babyName]);

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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#F1EAE0] overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#F1EAE0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <h3 className="text-sm font-bold text-[#45433F]">陪伴完成 · 拍立得手账已生成</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="返回首页"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scrollable Preview Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-[#FAF7F2] space-y-3">
          
          {/* 可选补充反馈：宝宝状态与拍照快捷栏 */}
          <div className="w-full bg-white/85 rounded-2xl p-3 border border-[#F1EAE0] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#858078] font-medium px-1">
              <span>宝宝状态（可随时调整）</span>
              <span className="text-orange-600 font-semibold">足迹已自动保存</span>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5">
              {reactionOptions.map((opt) => {
                const isSelected = currentBabyState === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setCurrentBabyState(opt.key);
                      if (onUpdateBabyState) onUpdateBabyState(opt.key);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-stone-600 border border-[#F1EAE0] hover:bg-stone-100'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 上传照片快捷按钮 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-8 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-amber-200/50"
            >
              <Camera className="w-3.5 h-3.5 text-orange-500" />
              <span>{currentPhotoUrl ? '更换相纸照片' : '📷 上传一张宝宝玩耍照片（选填）'}</span>
            </button>
          </div>

          {/* 拍立得预览大图 */}
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-500">正在生成北欧手账拍立得...</p>
            </div>
          ) : (
            renderedImageUrl && (
              <div className="space-y-2 w-full flex flex-col items-center">
                <div className="w-[280px] h-[402px] rounded-2xl overflow-hidden shadow-xl border border-[#F1EAE0] bg-white">
                  <img
                    src={renderedImageUrl}
                    alt="拍立得成长手账海报"
                    className="w-full h-full object-contain block select-none"
                  />
                </div>
                <p className="text-[11px] text-[#858078] text-center font-medium">
                  💡 手机端可长按上方图片直接保存到相册
                </p>
              </div>
            )
          )}
        </div>

        {/* Bottom Actions: 必须保留「保存拍立得」作为主要操作，「返回首页」作为次要操作 */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#F1EAE0] space-y-2 shrink-0">
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
                <span>✓ 已保存拍立得海报到相册</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>保存拍立得</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 rounded-2xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};


// Helper: 绘制分类专属北欧温暖主题插画 (Scandinavian Editorial Illustration)
function drawThemeIllustration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  activity: Activity
) {
  const cat = activity.category;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
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
    // 语言交流
    grad.addColorStop(0, '#F0F9FF');
    grad.addColorStop(1, '#BAE6FD');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  const cx = x + w / 2;
  const cy = y + h / 2;

  // 2. 根据不同活动类别绘制精美矢量儿童绘本插画
  if (cat.includes('大运动')) {
    // 太阳与草地
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

    // 小脚丫印记与运动符号
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.ellipse(cx - 60, cy + 40, 24, 14, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + 20, cy + 10, 24, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 活跃小球
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx + 110, cy - 20, 28, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('精细')) {
    // 积木与抓握
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

    // 星光点缀
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx - 30, cy - 90, 12, 0, Math.PI * 2);
    ctx.arc(cx + 50, cy - 70, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('感官')) {
    // 感知波纹同心圆
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

    // 中心摇铃
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 12, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (cat.includes('社会')) {
    // 温暖拥抱
    ctx.fillStyle = '#C7D2FE';
    ctx.beginPath();
    ctx.arc(cx - 70, cy + 10, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.arc(cx + 50, cy + 30, 60, 0, Math.PI * 2);
    ctx.fill();

    // 飘动红心
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 70, 18, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy - 70, 18, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 语言交流：书本与对话
    ctx.fillStyle = '#E9D5FF';
    ctx.beginPath();
    ctx.roundRect(cx - 130, cy - 40, 120, 110, 14);
    ctx.roundRect(cx + 10, cy - 40, 120, 110, 14);
    ctx.fill();

    // 对话气泡
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

  // 3. 顶部微型分类标签（精致排版）
  ctx.fillStyle = '#FFFFFFE6';
  ctx.beginPath();
  ctx.roundRect(cx - 90, y + 24, 180, 38, 19);
  ctx.fill();

  ctx.fillStyle = '#45433F';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`✨ ${activity.category}`, cx, y + 49);

  ctx.restore();
}
