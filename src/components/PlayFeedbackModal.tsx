/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { Activity, BabyProfile, PlayRecord, BabyReaction } from '../types';
import { CheckCircle2, Download, X, Sparkles, Heart, Share2 } from 'lucide-react';
import { getLocalDateString } from '../utils/date';

interface PlayFeedbackModalProps {
  activity: Activity;
  durationMinutes: number;
  status?: 'completed' | 'interrupted';
  profile?: BabyProfile;
  onClose: () => void;
  onSubmit?: (data: {
    activityId: string;
    activityTitle: string;
    category: string;
    durationMinutes: number;
    babyReaction: 'happy' | 'calm' | 'tired';
    note: string;
    status: 'completed' | 'interrupted';
  }) => void;
  onSaveRecord?: (record: PlayRecord) => void;
}

export const PlayFeedbackModal: React.FC<PlayFeedbackModalProps> = ({
  activity,
  durationMinutes,
  status = 'completed',
  profile,
  onClose,
  onSubmit,
  onSaveRecord,
}) => {
  const [reaction, setReaction] = useState<'happy' | 'calm' | 'tired'>(status === 'interrupted' ? 'tired' : 'happy');
  const [note, setNote] = useState('');
  const [isPosterGenerated, setIsPosterGenerated] = useState(false);
  const [posterImageUrl, setPosterImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSavedRef = useRef(false);

  const reactions = [
    { key: 'happy', emoji: '😍', label: '开心专注', desc: '积极参与，笑声不断' },
    { key: 'calm', emoji: '😊', label: '平静探索', desc: '好奇打量，配合互动' },
    { key: 'tired', emoji: '🥱', label: '有点累了', desc: '注意力转移，已休息' },
  ] as const;

  // 立即保存打卡记录（打卡即时生效，点亮成长足迹与连续陪伴天数）
  const triggerInstantSave = () => {
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    const recordData = {
      activityId: activity.id,
      activityTitle: activity.title,
      category: activity.category,
      durationMinutes,
      babyReaction: reaction,
      note,
      status,
    };
    if (onSubmit) {
      onSubmit(recordData);
    }
    if (onSaveRecord) {
      const mappedReaction: BabyReaction =
        reaction === 'happy' ? '开心专注' : reaction === 'calm' ? '平静探索' : '容易疲劳';
      onSaveRecord({
        id: 'rec_' + Date.now(),
        activityId: activity.id,
        activityTitle: activity.title,
        category: activity.category,
        date: getLocalDateString(),
        durationMinutes,
        reaction: mappedReaction,
        difficulty: '刚好合适',
        completed: status === 'completed',
        notes: note ? `${note}${status === 'interrupted' ? ' (中途休息)' : ''}` : (status === 'interrupted' ? '中途休息' : ''),
      });
    }
  };

  // 使用原生 Canvas 生成真实拍立得海报
  const generatePolaroidImage = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // 核心：打卡即时生效
    triggerInstantSave();

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsSubmitting(false);
      return;
    }

    // 1. 拍立得白色卡纸外框
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 840);

    ctx.strokeStyle = '#EAE2D7';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 592, 832);

    // 2. 拍立得内部照片区域（夏目米纸色背景）
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(40, 40, 520, 560);
    ctx.strokeStyle = '#F3EDE2';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 520, 560);

    // 装饰圆与图标
    ctx.fillStyle = status === 'interrupted' ? '#E8B58D' : '#F28C45';
    ctx.beginPath();
    ctx.arc(300, 200, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(status === 'interrupted' ? '🧸' : '🐾', 300, 215);

    // 照片区域顶部标签
    ctx.fillStyle = '#786F6A';
    ctx.font = 'bold 22px sans-serif';
    const localDateStr = getLocalDateString().replace(/-/g, '.');
    const babyNameStr = profile?.name ? `${profile.name} · ${profile.currentMonths}个月` : '亲子陪伴手帐';
    ctx.fillText(`${localDateStr} · ${babyNameStr}`, 300, 110);

    // 照片区域活动大标题
    ctx.fillStyle = '#2C221E';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(activity.title, 300, 310);

    // 分类与时长徽标
    ctx.fillStyle = '#B86834';
    ctx.font = 'bold 24px sans-serif';
    const durationLabel = status === 'interrupted' ? `[${activity.category}]  •  温馨陪伴 ${durationMinutes} 分钟（中途小憩）` : `[${activity.category}]  •  专注陪伴 ${durationMinutes} 分钟`;
    ctx.fillText(durationLabel, 300, 370);

    // 状态标签
    ctx.fillStyle = status === 'interrupted' ? '#B86834' : '#54704B';
    ctx.font = '22px sans-serif';
    const reactionText = status === 'interrupted' 
      ? '陪伴状态：🧸 片刻温馨陪伴（顺应宝宝节奏）' 
      : reaction === 'happy' ? '宝宝状态：😍 开心专注' : reaction === 'calm' ? '宝宝状态：😊 平静探索' : '宝宝状态：🥱 适度放松';
    ctx.fillText(reactionText, 300, 430);

    // 用户笔记（若有）
    if (note.trim()) {
      ctx.fillStyle = '#6B665F';
      ctx.font = 'italic 20px sans-serif';
      ctx.fillText(`“${note.trim().slice(0, 22)}${note.length > 22 ? '...' : ''}”`, 300, 490);
    }

    // 3. 拍立得留白手写区域（底部）
    ctx.fillStyle = '#F28C45';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(status === 'interrupted' ? '✨ 虽然提前休息，但陪伴同样珍贵 ✨' : '✨ 陪伴小宝健康快乐成长每一天 ✨', 300, 680);

    ctx.fillStyle = '#786F6A';
    ctx.font = '20px sans-serif';
    ctx.fillText('爱是高质量的专注陪伴 · 玩伴日历', 300, 730);

    const dataUrl = canvas.toDataURL('image/png');
    setPosterImageUrl(dataUrl);
    setIsPosterGenerated(true);
    setIsSubmitting(false);
  };

  // 触发真实文件下载
  const handleDownloadImage = () => {
    if (!posterImageUrl) return;
    const downloadLink = document.createElement('a');
    const fileName = `玩伴日历_陪伴拍立得_${getLocalDateString()}.png`;
    downloadLink.href = posterImageUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // 分享给好友（非强制，副操作）
  const handleShare = async () => {
    if (navigator.share && posterImageUrl) {
      try {
        await navigator.share({
          title: `玩伴日历 - ${activity.title}`,
          text: `我和宝宝刚刚完成了【${activity.title}】亲子游戏，专注陪伴 ${durationMinutes} 分钟！`,
          url: window.location.href,
        });
      } catch (e) {
        // Fallback or user cancel
      }
    } else {
      alert('已为您准备好专属陪伴海报，点击“保存海报到相册”即可发送给好友或家人哦！');
    }
  };

  // 关闭弹窗并返回首页（状态已即时保存）
  const handleDone = () => {
    triggerInstantSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#F3EDE2] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 顶部标题栏（明确的完成 / ✕ 按钮） */}
        <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#F3EDE2] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500"/>
            <h3 className="text-sm font-bold text-[#2C221E]">
              {isPosterGenerated ? '成长拍立得已生成' : (status === 'interrupted' ? '本次陪伴小结（中途休息）' : '记录今天的亲子时光')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDone}
              className="px-3 py-1 rounded-full bg-white border border-[#F3EDE2] text-xs font-bold text-[#2C221E] hover:bg-[#F3EDE2] shadow-xs cursor-pointer"
            >
              完成 / ✕
            </button>
          </div>
        </div>

        {/* 阶段 1：打卡记录表单 */}
        {!isPosterGenerated ? (
          <div className="p-5 space-y-4">
            {status === 'interrupted' ? (
              <div className="bg-[#FFF9F3] border border-orange-200/60 rounded-2xl p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-orange-700">
                  <Heart className="w-4 h-4 fill-orange-500 text-orange-500" /> 虽然提前休息，但陪伴同样珍贵
                </div>
                <p className="text-[11px] text-[#786F6A]">顺应宝宝节奏，已为您记录已专注陪伴的 <span className="font-bold text-[#2C221E] font-mono">{durationMinutes}</span> 分钟</p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <span className="text-xs text-[#786F6A]">刚才愉快陪伴了宝宝</span>
                <div className="text-2xl font-black text-orange-600 font-mono">{durationMinutes} 分钟</div>
                <p className="text-xs font-bold text-[#2C221E]">{activity.title}</p>
              </div>
            )}

            {/* 宝宝反应选择 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#786F6A]">宝宝今天状态如何？</label>
              <div className="grid grid-cols-3 gap-2">
                {reactions.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setReaction(r.key as any)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      reaction === r.key
                        ? 'bg-white border-orange-400 ring-2 ring-orange-400/20 shadow-xs'
                        : 'bg-white/60 border-[#F3EDE2] hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="text-xs font-bold text-[#2C221E]">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 随手手帐笔记 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#786F6A]">随手记一句（选填）</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={status === 'interrupted' ? "宝宝玩累了，先休息一会~" : "宝宝抓握特别有力，笑得手舞足蹈~"}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#F3EDE2] text-xs text-[#2C221E] placeholder-[#786F6A]/50 focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* 下一步：生成海报按钮（打卡即时生效） */}
            <button
              onClick={generatePolaroidImage}
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-white"/>
              生成今日成长拍立得
            </button>
          </div>
        ) : (
          /* 阶段 2：真实拍立得海报展示与下载保存（降压操作，无强制分享） */
          <div className="p-5 space-y-4 flex flex-col items-center">
            <div className="w-full max-w-[280px] bg-white p-2.5 rounded-2xl shadow-md border border-[#EAE2D7] transition-transform hover:scale-[1.01]">
              {posterImageUrl && (
                <img
                  src={posterImageUrl}
                  alt="成长拍立得海报"
                  className="w-full h-auto rounded-xl object-contain select-none"
                />
              )}
            </div>

            <p className="text-[11px] text-[#786F6A] text-center">
              💡 <strong className="text-[#2C221E]">打卡已即时生效</strong>，足迹与连续天数已点亮
            </p>

            {/* 核心操作按钮组（降压：主按钮保存，副链接分享） */}
            <div className="w-full space-y-2 pt-1">
              <button
                onClick={handleDownloadImage}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <Download className="w-4 h-4"/>
                保存海报到相册
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleShare}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer py-1"
                >
                  <Share2 className="w-3.5 h-3.5"/> 分享给好友
                </button>

                <button
                  onClick={handleDone}
                  className="text-xs text-[#786F6A] hover:text-[#2C221E] font-semibold cursor-pointer py-1"
                >
                  完成并返回足迹 →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
