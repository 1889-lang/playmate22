/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, PlayRecord } from '../types';
import { Lock, Crown } from 'lucide-react';
import { getLocalDateString } from '../utils/date';
import { getActivityCoverImage } from '../utils/activity';

interface ActivityItemCardProps {
  activity: Activity;
  onClick: () => void;
  isVipUser?: boolean;
  records?: PlayRecord[];
}

const ActivityMiniIllustration: React.FC<{ category: string; title: string }> = ({ category }) => {
  switch (category) {
    case '大运动':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="12" fill="#FFF7ED" />
          <circle cx="62" cy="22" r="12" fill="#FED7AA" opacity="0.8" />
          <path d="M0 64 Q25 46 50 56 T80 50 L80 80 L0 80 Z" fill="#FDBA74" opacity="0.35" />
          <path d="M22 42 Q32 30 52 35" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="2 3" strokeLinecap="round" />
          <g transform="translate(36, 26) rotate(15)">
            <path d="M0 8 L18 0 L14 12 Z" fill="#F97316" />
          </g>
        </svg>
      );
    case '精细动作':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="12" fill="#FFF1F2" />
          <rect x="22" y="44" width="22" height="20" rx="4" fill="#FDA4AF" />
          <rect x="38" y="32" width="20" height="20" rx="4" fill="#F43F5E" opacity="0.75" />
          <circle cx="30" cy="30" r="10" fill="#FB7185" opacity="0.5" />
        </svg>
      );
    case '感官认知':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="12" fill="#F0FDF4" />
          <path d="M14 18 Q28 42 22 66" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <path d="M28 14 Q44 38 38 64" stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <circle cx="58" cy="28" r="8" fill="#BBF7D0" />
        </svg>
      );
    case '社会情绪':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="12" fill="#EEF2FF" />
          <circle cx="40" cy="40" r="22" fill="#C7D2FE" opacity="0.6" />
          <path d="M33 36 Q36 33 38 36" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M42 36 Q44 33 47 36" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M35 43 Q40 48 45 43" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case '语言交流':
    default:
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect width="80" height="80" rx="12" fill="#FAF5FF" />
          <path d="M20 48 Q38 42 40 58 Q42 42 60 48 L60 28 Q42 22 40 38 Q38 22 20 28 Z" fill="#E9D5FF" />
        </svg>
      );
  }
};

const cleanTitle = (title: string): string => {
  if (!title) return '';
  return title.replace(/[(（][^)）]*[)）]/g, '').trim();
};

export const ActivityItemCard: React.FC<ActivityItemCardProps> = ({
  activity,
  onClick,
  isVipUser = false,
  records = [],
}) => {
  const isLocked = Boolean(activity.isVip && !isVipUser);

  const formatSuggestedDuration = (durationStr: string): string => {
    if (!durationStr) return '约5分钟';
    const match = durationStr.match(/(\d+)/);
    const mins = match ? match[1] : '5';
    return `约${mins}分钟`;
  };

  const formattedDuration = formatSuggestedDuration(activity.duration);

  const todayStr = getLocalDateString();
  const todayActivityRecords = records.filter((r) => r.date === todayStr && r.activityId === activity.id);
  const todayActivityCount = todayActivityRecords.length;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-3 border border-[#EDF4E9] shadow-xs transition-all active:scale-[0.99] cursor-pointer flex items-center gap-3 hover:shadow-md hover:border-[#62AD78]/50"
    >
      {/* 1. 左侧 w-16 h-16 rounded-xl object-cover 绘本小插画 */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#EDF4E9]/60 flex-shrink-0 flex items-center justify-center border border-[#EDF4E9] shadow-xs relative group-hover:scale-102 transition-transform">
        <img
          src={getActivityCoverImage(activity)}
          alt={cleanTitle(activity.title)}
          className="w-full h-full object-cover rounded-xl transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* 2. 右侧信息区 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-16 py-0.5">
        {/* 第一行：玩法名称 + 预计时长 / VIP 解锁 */}
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[#45483F] font-bold text-sm truncate group-hover:text-[#3F8054] transition-colors">
            {cleanTitle(activity.title)}
          </h4>

          {activity.isVip ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 whitespace-nowrap ${
                isLocked
                  ? 'bg-[#EDF4E9] text-[#3F8054] border-[#62AD78]/30'
                  : 'bg-[#EDF4E9] text-[#3F8054] border-[#62AD78]/30'
              }`}
            >
              {isLocked ? (
                <Lock className="w-2.5 h-2.5 text-[#3F8054]" />
              ) : (
                <Crown className="w-2.5 h-2.5 text-[#3F8054]" />
              )}
              <span>{isLocked ? 'VIP 解锁' : 'VIP 专享'}</span>
            </span>
          ) : (
            <span className="text-xs text-[#85877B] font-medium shrink-0 whitespace-nowrap">
              <span>{formattedDuration}</span>
            </span>
          )}
        </div>

        {/* 第二行：生活化短句玩法指引 */}
        <p className="text-xs text-[#85877B] line-clamp-1 mt-0.5 leading-relaxed">
          {activity.subtitle}
        </p>

        {/* 第三行：1~2个浅色轻量小标签 */}
        <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto scrollbar-none">
          <span className="bg-[#EDF4E9] text-[#3F8054] text-[10px] px-2 py-0.5 rounded-md font-medium border border-[#62AD78]/20 shrink-0">
            #{activity.category}
          </span>
          <span className="bg-[#EDF4E9] text-[#3F8054] text-[10px] px-2 py-0.5 rounded-md font-medium border border-[#62AD78]/20 shrink-0">
            亲子互动
          </span>
          {todayActivityCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF4E9] text-[#3F8054] border border-[#62AD78]/30 shrink-0">
              今日陪玩 {todayActivityCount} 次
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
