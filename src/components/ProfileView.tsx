/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BabyProfile } from '../types';
import { Baby, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

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
  const [name, setName] = useState(profile ? profile.name : '');
  const [babyAge, setBabyAge] = useState<number | null>(
    profile && typeof profile.currentMonths === 'number' ? profile.currentMonths : null
  );

  const [showAgePickerModal, setShowAgePickerModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const customerWeChat = 'wanbandaili_helper';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // 核心档案保存与持久化函数（供防抖与即时触发）
  const saveProfile = useCallback(
    (nameToSave: string, ageToSave: number | null) => {
      if (ageToSave === null || ageToSave === undefined) return;
      const newProfile: BabyProfile = {
        name: nameToSave.trim() || '宝宝',
        currentMonths: ageToSave,
        favoriteCategories: profile?.favoriteCategories || ['感官认知', '大运动'],
      };
      onUpdateProfile(newProfile);
    },
    [onUpdateProfile, profile?.favoriteCategories]
  );

  // 1. 昵称防抖自动保存 (停止输入 500ms 后自动保存)
  useEffect(() => {
    if (babyAge === null || babyAge === undefined) return;
    const timer = setTimeout(() => {
      saveProfile(name, babyAge);
    }, 500);

    return () => clearTimeout(timer);
  }, [name, babyAge, saveProfile]);

  // 输入框失焦时的兜底保存
  const handleNameBlur = () => {
    saveProfile(name, babyAge);
  };

  // 2. 选择月龄时即时生效并自动保存
  const handleSelectAge = (selectedMonth: number) => {
    setBabyAge(selectedMonth);
    setShowAgePickerModal(false);
    saveProfile(name, selectedMonth);
  };

  const handleCopyWeChat = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(customerWeChat).then(() => {
        showToast('微信号已复制');
      }).catch(() => {
        showToast(`微信号：${customerWeChat}`);
      });
    } else {
      showToast(`微信号：${customerWeChat}`);
    }
  };

  const handleReset = () => {
    setBabyAge(null);
    setName('');
    setShowResetConfirm(false);
    onResetAllData();
  };

  const displayBabyHeader = () => {
    const displayName = name.trim() || profile?.name || '宝宝';
    if (babyAge !== null && babyAge !== undefined) {
      return `${displayName} · ${babyAge}个月大`;
    }
    return `${displayName} · 暂未选择月龄`;
  };

  return (
    <div className="space-y-4 pb-24 md:pb-12 max-w-lg mx-auto animate-in fade-in duration-200 px-3.5 sm:px-4 relative pt-1">
      {/* 提示反馈 Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[90] bg-[#45483F] text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-[#62AD78] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. 宝宝成长档案卡片（合并顶部身份展现与基础设置） */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EDF4E9] shadow-xs space-y-5">
        {/* 上半部分：宝宝身份展示（即时同步昵称/月龄输入） */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#EDF4E9]">
          <div className="w-12 h-12 rounded-2xl bg-[#EDF4E9] text-[#3F8054] flex items-center justify-center shrink-0 shadow-xs">
            <Baby className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#45483F] tracking-tight truncate">
              {displayBabyHeader()}
            </h2>
            <p className="text-xs text-[#85877B] mt-0.5 font-normal">
              在爱与游戏中慢慢长大
            </p>
          </div>
        </div>

        {/* 下半部分：档案设置 */}
        <div className="space-y-4">
          {/* 宝宝昵称输入框 (即时展现 + 500ms防抖自动保存 + 失焦兜底) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#45483F] block">宝宝昵称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="例如：小汤圆"
              className="w-full h-12 px-4 rounded-xl bg-[#FAF9F2] border border-[#EDF4E9] text-base text-[#45483F] placeholder-[#85877B] focus:outline-none focus:border-[#62AD78] transition-colors"
            />
          </div>

          {/* 宝宝月龄选择框 (点击后确认即时生效与自动保存) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#45483F] block">宝宝目前多大</label>
            <div
              onClick={() => setShowAgePickerModal(true)}
              className="w-full h-12 px-4 rounded-xl bg-[#FAF9F2] border border-[#EDF4E9] hover:border-[#62AD78] focus:border-[#62AD78] flex items-center justify-between transition-colors cursor-pointer select-none"
            >
              <span className="text-base font-medium text-[#45483F]">
                {babyAge !== null && babyAge !== undefined ? (
                  <span className="font-bold text-[#3F8054]">
                    {babyAge} 个月大
                  </span>
                ) : (
                  <span className="text-[#85877B] font-normal">
                    请选择宝宝月龄 (0-36个月)
                  </span>
                )}
              </span>
              <span className="text-[#85877B] text-sm font-bold">&gt;</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 育儿顾问与支持卡片 */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EDF4E9] shadow-xs space-y-2">
        <h3 className="text-sm font-bold text-[#45483F]">🌿 育儿顾问与支持</h3>
        <p className="text-xs text-[#85877B] mt-1 mb-3">1 对 1 陪伴答疑，交流更多月龄适龄玩法。</p>
        <div className="bg-[#FAF9F2] border border-[#EDF4E9] rounded-xl p-2.5 flex items-center justify-between">
          <span className="text-xs font-mono text-[#45483F] font-medium">微信：{customerWeChat}</span>
          <button
            type="button"
            onClick={handleCopyWeChat}
            className="px-3 py-1 bg-[#62AD78] hover:bg-[#3F8054] text-white rounded-lg text-xs font-medium cursor-pointer active:scale-95 transition-all"
          >
            复制
          </button>
        </div>
      </div>

      {/* 4. 底部重置操作 */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#85877B] hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 恢复初始状态（清空全部数据）
        </button>
      </div>

      {/* 月龄选择弹层 (0-36个月) */}
      {showAgePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-[#EDF4E9] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF4E9]">
              <h3 className="text-base font-bold text-[#45483F]">选择宝宝月龄 (0-36个月)</h3>
              <button
                type="button"
                onClick={() => setShowAgePickerModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF9F2] text-[#45483F] flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-[#EDF4E9]"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {/* 0-6个月 */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-[#3F8054]">🌱 0-6个月（新生萌宝）</div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectAge(m)}
                      className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        babyAge === m
                          ? 'bg-[#62AD78] text-white shadow-xs'
                          : 'bg-[#EDF4E9]/60 hover:bg-[#EDF4E9] text-[#45483F] border border-[#62AD78]/20'
                      }`}
                    >
                      {m === 0 ? '新生儿(0月)' : `${m}个月`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7-12个月 */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-[#3F8054]">🧸 7-12个月（坐立爬行）</div>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 8, 9, 10, 11, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectAge(m)}
                      className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        babyAge === m
                          ? 'bg-[#62AD78] text-white shadow-xs'
                          : 'bg-[#EDF4E9]/60 hover:bg-[#EDF4E9] text-[#45483F] border border-[#62AD78]/20'
                      }`}
                    >
                      {m}个月
                    </button>
                  ))}
                </div>
              </div>

              {/* 13-24个月 */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-[#3F8054]">🎈 13-24个月（学步幼儿）</div>
                <div className="grid grid-cols-4 gap-2">
                  {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectAge(m)}
                      className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        babyAge === m
                          ? 'bg-[#62AD78] text-white shadow-xs'
                          : 'bg-[#EDF4E9]/60 hover:bg-[#EDF4E9] text-[#45483F] border border-[#62AD78]/20'
                      }`}
                    >
                      {m}个月
                    </button>
                  ))}
                </div>
              </div>

              {/* 25-36个月 */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-[#3F8054]">🚀 25-36个月（活力宝贝）</div>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectAge(m)}
                      className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        babyAge === m
                          ? 'bg-[#62AD78] text-white shadow-xs'
                          : 'bg-[#EDF4E9]/60 hover:bg-[#EDF4E9] text-[#45483F] border border-[#62AD78]/20'
                      }`}
                    >
                      {m}个月
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 确认清空所有数据弹窗 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-[#EDF4E9]">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900">恢复初始状态确认</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              确定要清空所有档案、记录并恢复初始状态吗？此操作不可撤销。
            </p>
            <div className="flex flex-col gap-1.5 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="mx-auto w-3/5 max-w-[200px] h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-xs font-medium text-white shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                确认恢复
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="text-stone-400 hover:text-stone-600 text-xs py-2 block text-center transition-colors cursor-pointer"
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
