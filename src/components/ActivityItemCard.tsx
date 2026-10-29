/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity } from '../types';
import { Lock, Crown } from 'lucide-react';

interface ActivityItemCardProps {
  activity: Activity;
  onClick: () => void;
  isVipUser?: boolean;
}

// 柔和马卡龙微缩插画生成器，呈现亲子绘本与治愈画风
const ActivityMiniIllustration: React.FC<{ category: string; title: string }> = ({ category }) => {
  switch (category) {
    case '大运动':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="16" fill="#FFF7ED" />
          {/* 阳光与小丘陵 */}
          <circle cx="62" cy="22" r="12" fill="#FED7AA" opacity="0.8" />
          <circle cx="62" cy="22" r="7" fill="#FDBA74" />
          <path d="M0 64 Q25 46 50 56 T80 50 L80 80 L0 80 Z" fill="#FDBA74" opacity="0.35" />
          <path d="M0 68 Q30 55 60 62 T80 58 L80 80 L0 80 Z" fill="#FB923C" opacity="0.2" />
          {/* 小飞机与运动轨迹 */}
          <path d="M22 42 Q32 30 52 35" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="2 3" strokeLinecap="round" />
          <g transform="translate(36, 26) rotate(15)">
            <path d="M0 8 L18 0 L14 12 Z" fill="#F97316" />
            <path d="M5 8 L10 14 L14 12 Z" fill="#EA580C" />
          </g>
          {/* 小萌星 */}
          <circle cx="20" cy="28" r="2" fill="#F97316" opacity="0.6" />
        </svg>
      );
    case '精细动作':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="16" fill="#FFF1F2" />
          {/* 温润积木与套圈 */}
          <rect x="22" y="44" width="22" height="20" rx="4" fill="#FDA4AF" />
          <rect x="38" y="32" width="20" height="20" rx="4" fill="#F43F5E" opacity="0.75" />
          <circle cx="30" cy="30" r="10" fill="#FB7185" opacity="0.5" />
          <circle cx="30" cy="30" r="5" fill="#FFE4E6" />
          {/* 小抓手/小星点 */}
          <circle cx="58" cy="24" r="3" fill="#E11D48" opacity="0.4" />
          <path d="M16 68 Q40 60 68 66" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case '感官认知':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="16" fill="#F0FDF4" />
          {/* 彩色飘带与彩铃 */}
          <path d="M14 18 Q28 42 22 66" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <path d="M28 14 Q44 38 38 64" stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M42 20 Q56 46 52 68" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          {/* 声波与闪烁光芒 */}
          <circle cx="58" cy="28" r="8" fill="#BBF7D0" />
          <circle cx="58" cy="28" r="4" fill="#16A34A" />
          <path d="M52 14 L55 19 L60 20 L56 24 L57 29 L52 26 L47 29 L48 24 L44 20 L49 19 Z" fill="#86EFAC" opacity="0.6" transform="translate(4, -2) scale(0.6)" />
        </svg>
      );
    case '社会情绪':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="16" fill="#EEF2FF" />
          {/* 温馨笑脸与心形 */}
          <circle cx="40" cy="40" r="22" fill="#C7D2FE" opacity="0.6" />
          <circle cx="40" cy="40" r="17" fill="#E0E7FF" />
          {/* 弯弯笑眼与微笑 */}
          <path d="M33 36 Q36 33 38 36" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M42 36 Q44 33 47 36" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M35 43 Q40 48 45 43" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* 小粉红脸颊 */}
          <circle cx="32" cy="42" r="2" fill="#F43F5E" opacity="0.5" />
          <circle cx="48" cy="42" r="2" fill="#F43F5E" opacity="0.5" />
          {/* 飘动的小心心 */}
          <path d="M58 20 C58 17 54 15 52 18 C50 15 46 17 46 20 C46 24 52 27 52 27 C52 27 58 24 58 20 Z" fill="#818CF8" />
        </svg>
      );
    case '语言交流':
    default:
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="16" fill="#FAF5FF" />
          {/* 绘本与对话气泡 */}
          <path d="M20 48 Q38 42 40 58 Q42 42 60 48 L60 28 Q42 22 40 38 Q38 22 20 28 Z" fill="#E9D5FF" />
          <path d="M40 38 L40 58" stroke="#C084FC" strokeWidth="1.5" />
          {/* 对话音符与小气泡 */}
          <circle cx="54" cy="20" r="8" fill="#F3E8FF" stroke="#A855F7" strokeWidth="1.2" />
          <path d="M50 25 L48 29 L53 27 Z" fill="#F3E8FF" />
          <circle cx="52" cy="19" r="1.5" fill="#9333EA" />
          <circle cx="56" cy="19" r="1.5" fill="#9333EA" />
          <circle cx="24" cy="20" r="2" fill="#C084FC" />
        </svg>
      );
  }
};

export const ActivityItemCard: React.FC<ActivityItemCardProps> = ({
  activity,
  onClick,
  isVipUser = false,
}) => {
  const isLocked = Boolean(activity.isVip && !isVipUser);

  // 柔和马卡龙领域徽章体系
  const categoryConfig: Record<string, { bg: string; text: string; border: string }> = {
    '感官认知': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60' },
    '大运动': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60' },
    '精细动作': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60' },
    '社会情绪': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/60' },
    '语言交流': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/60' },
  };

  const cfg = categoryConfig[activity.category] || {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200/60',
  };

  // 格式化时长：如 "5-8分钟" -> "⏱ 5-8分"
  const formattedDuration = activity.duration ? activity.duration.replace('分钟', '分') : '5分';

  // 格式化月龄：如 "6-8个月" -> "6-8月"
  const formattedAge = activity.ageRange ? activity.ageRange.replace('个月', '月') : '6-8月';

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl p-3 sm:p-3.5 shadow-sm border transition-all active:scale-[0.99] cursor-pointer flex items-center gap-3.5 hover:shadow-md hover:border-orange-200/80 ${
        isLocked
          ? 'border-amber-200/70 bg-gradient-to-r from-amber-50/20 to-white'
          : 'border-amber-100/50'
      }`}
    >
      {/* 1. 左侧微缩插画封面（w-20 h-20 绘本风格） */}
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-50/80 flex-shrink-0 flex items-center justify-center border border-amber-100/50 shadow-xs relative group-hover:scale-[1.02] transition-transform">
        <ActivityMiniIllustration category={activity.category} title={activity.title} />
      </div>

      {/* 2. 右侧内容排版（flex-1 min-w-0 flex flex-col justify-between py-0.5） */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5 space-y-1">
        {/* 顶行：玩法标题 + 极简耗时 / VIP 解锁 */}
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-stone-900 font-bold text-sm truncate group-hover:text-orange-600 transition-colors">
            {activity.title}
          </h4>

          {activity.isVip ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 whitespace-nowrap ${
                isLocked
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200/60'
              }`}
            >
              {isLocked ? (
                <Lock className="w-2.5 h-2.5 text-amber-700" />
              ) : (
                <Crown className="w-2.5 h-2.5 text-amber-600" />
              )}
              <span>{isLocked ? 'VIP 解锁' : 'VIP 专享'}</span>
            </span>
          ) : (
            <span className="text-xs text-stone-400 font-medium flex items-center gap-0.5 shrink-0 whitespace-nowrap">
              <span>⏱</span>
              <span>{formattedDuration}</span>
            </span>
          )}
        </div>

        {/* 中行：核心发育启发简述 */}
        <p className="text-xs text-stone-500 line-clamp-1 leading-relaxed">
          {activity.subtitle}
        </p>

        {/* 底行：柔和马卡龙领域徽章与适龄月龄并列 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}
          >
            {activity.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] text-stone-500 bg-stone-100/70 border border-stone-200/50 shrink-0">
            👶 {formattedAge}
          </span>
          {activity.materials && activity.materials.length > 0 && (
            <span className="hidden sm:inline-block text-[10px] text-stone-400 truncate max-w-[100px]">
              📦 {activity.materials[0].length > 5 ? activity.materials[0].slice(0, 5) + '…' : activity.materials[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
