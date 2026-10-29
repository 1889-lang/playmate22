/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BabyProfile } from '../types';
import { Baby, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

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
    if (saved) return;
    const newProfile: BabyProfile = {
      name: name.trim() || '宝藏宝宝',
      birthMonth: profile?.birthMonth || '2025-08',
      currentMonths: Number(months) || 6,
      favoriteCategories: profile?.favoriteCategories || ['感官认知', '大运动'],
    };
    onUpdateProfile(newProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-12 max-w-lg mx-auto animate-in fade-in duration-200 px-3.5 sm:px-4">
      {/* 紧凑名片：直接居中展示宝宝专属成长档案 */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F3EDE2] shadow-[0_10px_30px_-10px_rgba(44,34,30,0.05)] space-y-4">
        <div className="flex items-center gap-3.5 pb-3.5 border-b border-[#F3EDE2]">
          <div className="relative w-12 h-12 shrink-0">
            {profile && isVip && (
              <span className="absolute -top-1.5 -left-1 text-base leading-none transform -rotate-[12deg] select-none filter drop-shadow-xs z-10 pointer-events-none">
                👑
              </span>
            )}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              profile && isVip ? 'bg-amber-100 text-amber-700 border border-amber-200/80' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <Baby className="w-6 h-6" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm sm:text-base font-bold text-[#2C221E] truncate">
                {profile ? `${profile.name} 的专属成长名片` : '建立宝宝成长档案'}
              </h3>
              {profile && isVip ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 font-medium inline-flex items-center gap-1 shrink-0">
                  👑 VIP年卡 · 至2027年10月
                </span>
              ) : profile ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium inline-flex items-center shrink-0">
                  成长体验中
                </span>
              ) : null}
            </div>
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

        <button
          type="submit"
          disabled={saved}
          className={`w-full h-12 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            saved
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 cursor-default'
              : 'bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 hover:opacity-95 text-white shadow-md shadow-orange-500/25 active:scale-[0.98] cursor-pointer'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0 animate-in zoom-in-75 duration-200" />
              <span>已成功保存</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>保存档案设置</span>
            </>
          )}
        </button>

        {!isVip && (
          <div
            onClick={onUpgradeVip}
            className="bg-gradient-to-r from-amber-50 to-orange-50/40 rounded-2xl p-3 border border-amber-100 flex items-center justify-between mt-4 cursor-pointer hover:shadow-xs transition-shadow"
          >
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <span>👑</span> 升级 VIP 年卡会员
              </p>
              <p className="text-[11px] text-amber-700/80 truncate mt-0.5">
                解锁 0-3 岁 300+ 专属脑发育陪伴游戏
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpgradeVip();
              }}
              className="text-xs font-bold text-orange-600 bg-white px-2.5 py-1 rounded-full shadow-sm border border-amber-200/50 hover:bg-orange-50/60 shrink-0 transition-colors"
            >
              立即开通 →
            </button>
          </div>
        )}
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
