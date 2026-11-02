/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BabyProfile } from '../types';
import { Baby, Sparkles, CheckCircle2, RotateCcw, AlertTriangle, Minus, Plus, Calendar, Hash } from 'lucide-react';
import { calculateMonthsFromBirthMonth } from '../utils/date';

interface ProfileViewProps {
  profile: BabyProfile | null;
  onUpdateProfile: (profile: BabyProfile) => void;
  onResetAllData: () => void;
  isVip: boolean;
  onUpgradeVip?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onResetAllData,
  isVip,
}) => {
  const currentYear = new Date().getFullYear();

  const [name, setName] = useState(profile ? profile.name : '');

  // 模式：birth_month（真实出生年月精准计算）或 estimated（快速估算月龄）
  const [profileMode, setProfileMode] = useState<'birth_month' | 'estimated'>(() => {
    if (profile?.ageSource === 'birth_month' && profile.birthMonth) return 'birth_month';
    if (profile?.birthMonth && profile.birthMonth !== '2025-08') return 'birth_month';
    return 'estimated';
  });

  // 出生年月选择器状态（默认推算合理初始值）
  const [birthYear, setBirthYear] = useState<number>(() => {
    if (profile?.birthMonth && profile.birthMonth.includes('-')) {
      return parseInt(profile.birthMonth.split('-')[0], 10) || currentYear;
    }
    const d = new Date();
    d.setMonth(d.getMonth() - (profile?.currentMonths || 6));
    return d.getFullYear();
  });

  const [birthMonth, setBirthMonth] = useState<number>(() => {
    if (profile?.birthMonth && profile.birthMonth.includes('-')) {
      return parseInt(profile.birthMonth.split('-')[1], 10) || 1;
    }
    const d = new Date();
    d.setMonth(d.getMonth() - (profile?.currentMonths || 6));
    return d.getMonth() + 1;
  });

  // 动态由出生年月精准计算出的月龄
  const formattedBirthMonthStr = `${birthYear}-${String(birthMonth).padStart(2, '0')}`;
  const calculatedMonths = useMemo(() => {
    return calculateMonthsFromBirthMonth(formattedBirthMonthStr);
  }, [formattedBirthMonthStr]);

  const isFutureDate = calculatedMonths === null;

  // 快速估算月龄模式状态
  const [estimatedMonths, setEstimatedMonths] = useState<number>(profile ? profile.currentMonths : 6);
  const [activePhase, setActivePhase] = useState<'0-6' | '7-12' | '1-3'>(() => {
    const m = profile ? profile.currentMonths : 6;
    if (m <= 6) return '0-6';
    if (m <= 12) return '7-12';
    return '1-3';
  });

  const handleStepEstimatedMonth = (delta: number) => {
    const next = Math.max(1, Math.min(36, estimatedMonths + delta));
    setEstimatedMonths(next);
    if (next <= 6) setActivePhase('0-6');
    else if (next <= 12) setActivePhase('7-12');
    else setActivePhase('1-3');
  };

  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (saved) return;

    if (profileMode === 'birth_month') {
      if (calculatedMonths === null) {
        showToast('⚠️ 出生年月不能晚于当前时间，请重新核对');
        return;
      }
      const newProfile: BabyProfile = {
        name: name.trim() || '宝藏宝宝',
        birthMonth: formattedBirthMonthStr,
        currentMonths: calculatedMonths,
        favoriteCategories: profile?.favoriteCategories || ['感官认知', '大运动'],
        ageSource: 'birth_month',
      };
      onUpdateProfile(newProfile);
    } else {
      const newProfile: BabyProfile = {
        name: name.trim() || '宝藏宝宝',
        birthMonth: undefined, // 严格杜绝伪造虚构出生年月
        currentMonths: Number(estimatedMonths) || 6,
        favoriteCategories: profile?.favoriteCategories || ['感官认知', '大运动'],
        ageSource: 'estimated',
      };
      onUpdateProfile(newProfile);
    }

    setSaved(true);
    showToast('✓ 宝宝档案已成功保存');

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-12 max-w-lg mx-auto animate-in fade-in duration-200 px-3.5 sm:px-4 relative">
      {/* 非阻塞浮动轻量 Toast 提示 */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 紧凑名片：直接居中展示宝宝专属成长档案 */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F3EDE2] shadow-xs space-y-4">
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
              <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                {profile ? `${profile.name} 的成长档案` : '建立宝宝成长档案'}
              </h3>
              {profile && isVip ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 font-medium inline-flex items-center gap-1 shrink-0">
                  👑 VIP年卡
                </span>
              ) : profile ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium inline-flex items-center shrink-0">
                  {profile.ageSource === 'birth_month' ? '精确月龄' : '估算月龄'}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-stone-500 truncate">
              真实月龄是保证亲子游戏适龄与安全的核心基础
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">宝宝昵称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入宝宝小名（如：小汤圆）"
              className="w-full h-11 px-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F3EDE2] text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400"
            />
          </div>

          {/* 模式切换：真实出生年月（推荐） vs 快速估算月龄 */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">
              月龄设置方式
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] rounded-2xl border border-[#F3EDE2]">
              <button
                type="button"
                onClick={() => setProfileMode('birth_month')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  profileMode === 'birth_month'
                    ? 'bg-white text-orange-600 shadow-xs font-bold border border-orange-200/60'
                    : 'text-[#786F6A] hover:text-[#2C221E]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>真实出生年月（精准）</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileMode('estimated')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  profileMode === 'estimated'
                    ? 'bg-white text-orange-600 shadow-xs font-bold border border-orange-200/60'
                    : 'text-[#786F6A] hover:text-[#2C221E]'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>直接选择月龄（估算）</span>
              </button>
            </div>
          </div>

          {/* 模式 1：真实出生年月精确联动 */}
          {profileMode === 'birth_month' && (
            <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#F3EDE2] animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">选择宝宝出生年月</span>
                {isFutureDate ? (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    不可选未来日期
                  </span>
                ) : (
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60">
                    计算当前月龄：{calculatedMonths} 个月
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] text-stone-500 font-medium">出生年份</span>
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#F3EDE2] text-xs font-medium text-stone-800 focus:outline-none focus:border-orange-400 cursor-pointer"
                  >
                    {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((y) => (
                      <option key={y} value={y}>
                        {y} 年
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-stone-500 font-medium">出生月份</span>
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#F3EDE2] text-xs font-medium text-stone-800 focus:outline-none focus:border-orange-400 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {m} 月
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isFutureDate && (
                <p className="text-[11px] text-rose-600 pt-1">
                  ⚠️ 选择的出生月份晚于当前时间，无法计算月龄，请选择正确的出生年月。
                </p>
              )}
            </div>
          )}

          {/* 模式 2：快速分阶段月龄点选（不伪造虚假出生日期） */}
          {profileMode === 'estimated' && (
            <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#F3EDE2] animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  当前估算月龄（不绑定虚假出生年月）
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStepEstimatedMonth(-1)}
                    disabled={estimatedMonths <= 1}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-stone-700 transition-colors cursor-pointer border border-[#F3EDE2]"
                    title="减少1个月"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/60 min-w-[58px] text-center">
                    {estimatedMonths} 个月
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStepEstimatedMonth(1)}
                    disabled={estimatedMonths >= 36}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-stone-700 transition-colors cursor-pointer border border-[#F3EDE2]"
                    title="增加1个月"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 阶段选择 Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-xl border border-[#F3EDE2]">
                {(['0-6', '7-12', '1-3'] as const).map((phase) => (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => {
                      setActivePhase(phase);
                      if (phase === '0-6' && estimatedMonths > 6) setEstimatedMonths(6);
                      if (phase === '7-12' && (estimatedMonths < 7 || estimatedMonths > 12)) setEstimatedMonths(9);
                      if (phase === '1-3' && estimatedMonths < 13) setEstimatedMonths(18);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePhase === phase
                        ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200/50'
                        : 'text-[#786F6A] hover:text-[#2C221E]'
                    }`}
                  >
                    {phase === '0-6' ? '0-6个月' : phase === '7-12' ? '7-12个月' : '1-3岁'}
                  </button>
                ))}
              </div>

              {/* 快捷月龄按钮网格 */}
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {activePhase === '0-6' &&
                  [1, 2, 3, 4, 5, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEstimatedMonths(m)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        estimatedMonths === m
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white text-stone-700 border border-[#F3EDE2] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {m}月
                    </button>
                  ))}
                {activePhase === '7-12' &&
                  [7, 8, 9, 10, 11, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEstimatedMonths(m)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        estimatedMonths === m
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white text-stone-700 border border-[#F3EDE2] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {m}月
                    </button>
                  ))}
                {activePhase === '1-3' &&
                  [15, 18, 24, 30, 36].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEstimatedMonths(m)}
                      className={`col-span-1 h-9 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        estimatedMonths === m
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white text-stone-700 border border-[#F3EDE2] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {m}月
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 保存按钮：原地微状态反馈，尺寸绝对稳定 */}
        <button
          type="submit"
          disabled={saved || (profileMode === 'birth_month' && isFutureDate)}
          className={`w-full h-12 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            saved
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 cursor-default'
              : profileMode === 'birth_month' && isFutureDate
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 hover:opacity-95 text-white shadow-md shadow-orange-500/25 active:scale-[0.98] cursor-pointer'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0 animate-in zoom-in-75 duration-200" />
              <span>✓ 已成功保存</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>保存档案设置</span>
            </>
          )}
        </button>
      </form>

      {/* 重置数据与单行浅灰隐私承诺 */}
      <div className="pt-2 space-y-2.5 text-center">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 恢复初始状态（清空全部数据）
        </button>

        <p className="text-[11px] text-stone-400">
          玩伴日历 · 帮家长每天轻松陪玩的小工具
        </p>

        <p className="text-[10px] text-stone-400/80">
          🔒 本地端安全存储 · 绝不上传云端 · 严格保护儿童隐私
        </p>
      </div>

      {/* 确认清空所有数据弹窗 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-stone-200/70">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900">恢复初始状态确认</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              确定要清空所有档案、记录并恢复初始状态吗？此操作不可撤销。
            </p>
            <div className="flex flex-col gap-1 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetAllData();
                }}
                className="w-full h-11 rounded-2xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center"
              >
                确认恢复
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="w-full h-9 py-2 bg-transparent border-0 shadow-none text-xs text-stone-400 hover:text-stone-600 active:opacity-60 transition-colors text-center font-normal tracking-wide cursor-pointer flex items-center justify-center mt-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
