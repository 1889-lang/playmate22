/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BabyProfile } from '../types';
import { Baby, Sparkles, ShieldCheck, CheckCircle2, RotateCcw, Crown, Zap } from 'lucide-react';

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
    <div className="space-y-6 pb-24 md:pb-12 max-w-xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#45433F] tracking-tight">宝宝档案与会员权益</h2>
        <p className="text-xs text-[#858078]">轻松调整宝宝昵称与月龄，管理您的玩伴年卡 VIP 尊贵身份与云端权益</p>
      </div>

      {/* VIP Membership Status Card */}
      <div className={`rounded-3xl p-6 border shadow-xs relative overflow-hidden ${
        isVip
          ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400'
          : 'bg-white border-[#F1EAE0] text-[#45433F]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              isVip ? 'bg-white/20 text-amber-200 backdrop-blur-sm' : 'bg-amber-100 text-amber-700'
            }`}>
              <Crown className={`w-7 h-7 ${isVip ? 'fill-amber-200 text-amber-100 animate-pulse' : 'text-amber-600'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold ${isVip ? 'text-white' : 'text-[#45433F]'}`}>
                  {isVip ? '👑 玩伴年卡尊贵 VIP 会员' : '当前为免费体验版用户'}
                </h3>
              </div>
              <p className={`text-xs mt-0.5 ${isVip ? 'text-amber-100' : 'text-[#858078]'}`}>
                {isVip ? '有效期至：2027年10月28日 · 全阶段 300+ 专家活动无限畅玩' : '升级陪伴年卡，解锁全部专家活动库与拍立得裂变海报'}
              </p>
            </div>
          </div>

          {!isVip ? (
            <button
              onClick={onUpgradeVip}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#F28C45] to-[#E07B36] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer shrink-0"
            >
              立即开通年卡
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 fill-white" /> 权益全开
            </div>
          )}
        </div>
      </div>

      {/* Profile Growth Card */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-[#F1EAE0] shadow-xs space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-[#F1EAE0]">
          <div className="w-14 h-14 rounded-2xl bg-[#A8B9A0]/20 flex items-center justify-center text-[#54704B]">
            <Baby className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#45433F]">
              {profile ? `${profile.name} 的专属成长空间` : '建立您的第一份宝宝档案'}
            </h3>
            <p className="text-xs text-[#858078]">
              {profile 
                ? `${profile.currentMonths}个月宝宝：可以多陪他听声音、学发音、玩拍手，享受温馨快乐的亲子互动。`
                : '请在下方填写宝宝昵称与月龄，开启专属脑发育陪伴计划。'
              }
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#45433F] uppercase tracking-wider">宝宝昵称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入宝宝昵称（如：小汤圆）"
              className="w-full h-12 px-4 rounded-2xl bg-[#FAF7F2] border border-[#F1EAE0] text-xs text-[#45433F] focus:outline-none focus:border-[#F28C45]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#45433F] uppercase tracking-wider">当前月龄 (个月)</label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full h-12 px-4 rounded-2xl bg-[#FAF7F2] border border-[#F1EAE0] text-xs text-[#45433F] focus:outline-none focus:border-[#F28C45]"
            >
              {[...Array(36)].map((_, i) => {
                const m = i + 1;
                return (
                  <option key={m} value={m}>
                    {m} 个月
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-2xl bg-[#A8B9A0]/20 text-[#54704B] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> 已成功保存宝宝档案并更新本地存储！
          </div>
        )}

        <button
          type="submit"
          className="w-full h-12 rounded-2xl bg-[#F28C45] hover:bg-[#e07b36] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#F28C45]/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> {profile ? '保存档案设置' : '创建宝宝档案'}
        </button>
      </form>

      {/* Safety & Privacy Notice */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#F1EAE0] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#45433F]">
          <ShieldCheck className="w-4 h-4 text-[#A8B9A0]" /> 隐私与数据安全承诺
        </div>
        <p className="text-[11px] text-[#858078] leading-relaxed">
          您的宝宝档案与陪玩记录均安全加密保存在本地浏览器中，绝不上传云端，保障儿童隐私。
        </p>
      </div>

      {/* Reset Data Section */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (window.confirm('确定要清空所有档案、记录并恢复初始状态吗？')) {
              onResetAllData();
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 恢复初始状态（清空全部数据）
        </button>
      </div>

    </div>
  );
};
