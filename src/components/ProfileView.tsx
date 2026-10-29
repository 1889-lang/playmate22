/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BabyProfile } from '../types';
import { Baby, Sparkles, CheckCircle2, RotateCcw, Crown, Zap } from 'lucide-react';

interface ProfileViewProps {
  profile: BabyProfile | null;
  onUpdateProfile: (profile: BabyProfile) => void;
  onResetAllData: () => void;
  isVip: boolean;
  onUpgradeVip: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onResetAllData,
  isVip,
  onUpgradeVip,
}) => {
  const [name, setName] = useState(profile ? profile.name : '');
  const [months, setMonths] = useState(profile ? profile.currentMonths : 6);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: BabyProfile = {
      name: name.trim() || '宝藏宝宝',
      birthMonth: profile?.birthMonth || '2025-08',
      currentMonths: Number(months) || 6,
      favoriteCategories: profile?.favoriteCategories || ['感官认知', '大运动'],
    };
    onUpdateProfile(newProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-12 max-w-lg mx-auto animate-in fade-in duration-200 px-3.5 sm:px-4">
      
      {/* 1. VIP 权益精简为顶部的一行小金卡条 */}
      <div className={`rounded-2xl px-4 py-3 border shadow-xs flex items-center justify-between gap-3 ${
        isVip
          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400'
          : 'bg-white border-[#F3EDE2] text-[#2C221E]'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isVip ? 'bg-white/20 text-amber-200' : 'bg-amber-100 text-amber-700'
          }`}>
            <Crown className={`w-4 h-4 ${isVip ? 'fill-amber-200 text-amber-100' : 'text-amber-600'}`} />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold truncate">
              {isVip ? '👑 VIP 年卡会员至 2027-10-28' : '免费体验版 · 解锁全阶段 300+ 专家活动'}
            </div>
          </div>
        </div>

        {!isVip ? (
          <button
            onClick={onUpgradeVip}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            开通年卡
          </button>
        ) : (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/25 text-white text-[11px] font-semibold shrink-0 whitespace-nowrap">
            <Zap className="w-3 h-3 fill-white" /> 权益全开
          </div>
        )}
      </div>

      {/* 2. 紧凑名片：将宝宝信息与保存按钮合二为一，首屏内闭环 */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F3EDE2] shadow-[0_10px_30px_-10px_rgba(44,34,30,0.05)] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F3EDE2]">
          <div className="relative w-12 h-12 shrink-0">
            {isVip && (
              <span className="absolute -top-1.5 -left-1 text-base leading-none transform -rotate-[12deg] select-none filter drop-shadow-xs z-10 pointer-events-none">
                👑
              </span>
            )}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isVip ? 'bg-amber-100 text-amber-700 border border-amber-200/80' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <Baby className="w-6 h-6" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-[#2C221E] truncate">
              {profile ? `${profile.name} 的专属成长名片` : '建立宝宝成长档案'}
            </h3>
            <p className="text-[11px] text-[#786F6A] truncate">
              个性化匹配 0-3 岁脑发育科学亲子游戏
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#2C221E] uppercase tracking-wider">宝宝昵称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入宝宝小名（如：小汤圆）"
              className="w-full h-11 px-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F3EDE2] text-xs text-[#2C221E] placeholder-[#786F6A]/50 focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#2C221E] uppercase tracking-wider">当前月龄 (个月)</label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full h-11 px-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F3EDE2] text-xs text-[#2C221E] focus:outline-none focus:border-orange-400"
            >
              {[...Array(36)].map((_, i) => {
                const m = i + 1;
                return (
                  <option key={m} value={m}>
                    {m} 个月 {m === 6 ? '(黄金发育期)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {saved && (
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> 已成功保存宝宝档案！
          </div>
        )}

        <button
          type="submit"
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> 保存档案设置
        </button>
      </form>

      {/* 3. 重置数据与单行浅灰隐私承诺 */}
      <div className="pt-2 space-y-3 text-center">
        <button
          onClick={() => {
            if (window.confirm('确定要清空所有档案、记录并恢复初始状态吗？')) {
              onResetAllData();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 恢复初始状态（清空全部数据）
        </button>

        <p className="text-[10px] text-[#786F6A]/70">
          🔒 本地端安全存储 · 绝不上传云端 · 严格保护儿童隐私
        </p>
      </div>

    </div>
  );
};
