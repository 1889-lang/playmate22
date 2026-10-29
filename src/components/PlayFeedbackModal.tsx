/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Activity, BabyProfile, PlayRecord, BabyReaction } from '../types';
import { CheckCircle2, Download, X, Sparkles, Heart } from 'lucide-react';
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

  const reactions = [
    { key: 'happy', emoji: '😍', label: '开心专注', desc: '积极参与，笑声不断' },
    { key: 'calm', emoji: '😊', label: '平静探索', desc: '好奇打量，配合互动' },
    { key: 'tired', emoji: '🥱', label: '有点累了', desc: '注意力转移，已休息' },
  ] as const;

  // 使用原生 Canvas 生成真实拍立得海报（根除 UTC 日期漂移，采用 getLocalDateString）
  const generatePolaroidImage = () => {
    if (isSubmitting) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. 拍立得白色卡纸外框
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 840);

    ctx.strokeStyle = '#EAE2D7';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 592, 832);

    // 2. 拍立得内部照片区域（夏目米纸色背景）
    ctx.fillStyle = '#FAF7F2';
    ctx.fillRect(40, 40, 520, 560);
    ctx.strokeStyle = '#EFE5D8';
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

    // 照片区域顶部标签（本地日期，无 UTC 漂移）
    ctx.fillStyle = '#858078';
    ctx.font = 'bold 22px sans-serif';
    const localDateStr = getLocalDateString().replace(/-/g, '.');
    const babyNameStr = profile?.name ? `${profile.name} · ${profile.currentMonths}个月` : '亲子陪伴手帐';
    ctx.fillText(`${localDateStr} · ${babyNameStr}`, 300, 110);

    // 照片区域活动大标题
    ctx.fillStyle = '#45433F';
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

    ctx.fillStyle = '#858078';
    ctx.font = '20px sans-serif';
    ctx.fillText('爱是高质量的专注陪伴 · 玩伴日历', 300, 730);

    const dataUrl = canvas.toDataURL('image/png');
    setPosterImageUrl(dataUrl);
    setIsPosterGenerated(true);
  };

  // 触发真实文件下载（本地日期命名）
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

  // 最终确认提交并关闭（防连击保护）
  const handleFinalSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

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
        date: getLocalDateString(), // 本地日历日期，无 UTC 漂移
        durationMinutes,
        reaction: mappedReaction,
        difficulty: '刚好合适',
        completed: status === 'completed',
        notes: note ? `${note}${status === 'interrupted' ? ' (中途休息)' : ''}` : (status === 'interrupted' ? '中途休息' : ''),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#F1EAE0] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 顶部标题栏 */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#F1EAE0] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#F28C45]"/>
            <h3 className="text-sm font-bold text-[#45433F]">
              {isPosterGenerated ? '成长拍立得已生成' : (status === 'interrupted' ? '本次陪伴小结（中途休息）' : '记录今天的亲子时光')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#858078] hover:text-[#45433F] shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* 阶段 1：打卡记录表单 */}
        {!isPosterGenerated ? (
          <div className="p-5 space-y-4">
            {status === 'interrupted' ? (
              <div className="bg-[#FFF9F3] border border-[#E8B58D]/40 rounded-2xl p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#B86834]">
                  <Heart className="w-4 h-4 fill-[#F28C45] text-[#F28C45]" /> 虽然提前休息，但陪伴同样珍贵
                </div>
                <p className="text-[11px] text-[#858078]">顺应宝宝节奏，已为您记录已专注陪伴的 <span className="font-bold text-[#45433F] font-mono">{durationMinutes}</span> 分钟</p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <span className="text-xs text-[#858078]">刚才愉快陪伴了宝宝</span>
                <div className="text-2xl font-black text-[#F28C45] font-mono">{durationMinutes} 分钟</div>
                <p className="text-xs font-bold text-[#45433F]">{activity.title}</p>
              </div>
            )}

            {/* 宝宝反应选择 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#858078]">宝宝今天状态如何？</label>
              <div className="grid grid-cols-3 gap-2">
                {reactions.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setReaction(r.key as any)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      reaction === r.key
                        ? 'bg-white border-[#F28C45] ring-2 ring-[#F28C45]/20 shadow-xs'
                        : 'bg-white/60 border-[#F1EAE0] hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="text-xs font-bold text-[#45433F]">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 随手手帐笔记 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#858078]">随手记一句（选填）</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={status === 'interrupted' ? "宝宝玩累了，先休息一会~" : "宝宝抓握特别有力，笑得手舞足蹈~"}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#E8B58D]/30 text-xs text-[#45433F] placeholder-[#858078]/50 focus:outline-none focus:ring-2 focus:ring-[#F28C45]/30"
              />
            </div>

            {/* 下一步：生成真实海报按钮 */}
            <button
              onClick={generatePolaroidImage}
              disabled={isSubmitting}
              className="w-full h-11 rounded-full bg-gradient-to-r from-[#F28C45] to-[#E5762F] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#F28C45]/30 cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-white"/>
              生成今日成长拍立得
            </button>
          </div>
        ) : (
          /* 阶段 2：真实拍立得海报展示与下载保存 */
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

            <p className="text-[11px] text-[#858078] text-center">
              💡 手机端可直接<strong className="text-[#45433F]">长按图片</strong>保存到系统相册
            </p>

            {/* 真实操作按钮组（防连击保护） */}
            <div className="w-full space-y-2 pt-1">
              <button
                onClick={handleDownloadImage}
                className="w-full h-11 rounded-full bg-[#F28C45] hover:bg-[#e07b36] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#F28C45]/30 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <Download className="w-4 h-4"/>
                保存图片到手机 / 电脑
              </button>

              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full h-10 rounded-full bg-white border border-[#E8B58D]/40 text-[#B86834] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FFF9F3] cursor-pointer transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-[#F28C45]"/>
                {isSubmitting ? '正在保存...' : '完成记录并返回足迹'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
