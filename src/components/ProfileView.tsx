/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
}) => {
  const [name, setName] = useState(profile ? profile.name : '');
  const [babyAge, setBabyAge] = useState<number | null>(
    profile && typeof profile.currentMonths === 'number' ? profile.currentMonths : null
  );

  const [showAgePickerModal, setShowAgePickerModal] = useState(false);
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

    if (babyAge === null || babyAge === undefined) {
      showToast('⚠️ 请选择宝宝月龄');
      return;
    }

    const newProfile: BabyProfile = {
      name: name.trim() || '宝宝',
      currentMonths: babyAge,
      favoriteCategories: profile?.favoriteCategories || ['感官认知', '大运动'],
    };
    onUpdateProfile(newProfile);

    setSaved(true);
    showToast('✓ 保存完成');

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleReset = () => {
    setBabyAge(null);
    setName('');
    setShowResetConfirm(false);
    onResetAllData();
  };

  return (
    <div className="space-y-4 pb-24 md:pb-12 max-w-lg mx-auto animate-in fade-in duration-200 px-3.5 sm:px-4 relative">
      {/* 提示反馈 Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 极简大卡片 */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F3EDE2] shadow-xs space-y-6">
        {/* 标题 */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#F3EDE2]">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">👶 宝宝档案</h3>
          </div>
        </div>

        {/* 1. 宝宝昵称 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-900 block">宝宝昵称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：小汤圆"
            className="w-full h-12 px-4 rounded-2xl bg-[#FAF8F5] border border-[#F3EDE2] text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* 2. 宝宝目前多大 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-900 block">宝宝目前多大</label>
          <div
            onClick={() => setShowAgePickerModal(true)}
            className="w-full h-14 bg-amber-50/50 rounded-2xl border border-amber-200/60 flex items-center justify-between px-4 hover:border-amber-400 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-stone-700 text-sm font-medium">
              <span>👶</span>
              {babyAge !== null && babyAge !== undefined ? (
                <span className="text-base font-bold text-amber-900">
                  {babyAge} 个月大
                </span>
              ) : (
                <span className="text-stone-400">
                  请选择宝宝月龄 (0-36个月)
                </span>
              )}
            </div>
            <div className="text-stone-400 text-base font-bold flex items-center gap-1.5">
              <span className="text-stone-400 font-normal">&gt;</span>
            </div>
          </div>
        </div>

        {/* 3. 保存按钮（Primary 精致居中胶囊，严禁通栏满宽） */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saved}
            className={`mx-auto w-3/5 max-w-[200px] h-11 text-white font-medium text-sm rounded-full shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              saved
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-400'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>保存完成</span>
              </>
            ) : (
              <span>保存完成</span>
            )}
          </button>
        </div>
      </form>

      {/* 底部重置操作 */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 恢复初始状态（清空全部数据）
        </button>
      </div>

      {/* 月龄选择弹层 (0-36个月) */}
      {showAgePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-stone-200/70 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">👶 选择宝宝月龄 (0-36个月)</h3>
              <button
                type="button"
                onClick={() => setShowAgePickerModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {/* 0-6个月 */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-amber-800">🌱 0-6个月（新生萌宝）</div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setBabyAge(m);
                        setShowAgePickerModal(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        babyAge === m
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-amber-50/60 hover:bg-amber-100/80 text-stone-700 border border-amber-200/50'
                      }`}
                    >
                      {m === 0 ? '新生儿(0月)' : `${m}个月`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7-12个月 */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-amber-800">🧸 7-12个月（坐立爬行）</div>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 8, 9, 10, 11, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setBabyAge(m);
                        setShowAgePickerModal(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        babyAge === m
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-amber-50/60 hover:bg-amber-100/80 text-stone-700 border border-amber-200/50'
                      }`}
                    >
                      {m}个月
                    </button>
                  ))}
                </div>
              </div>

              {/* 13-24个月 */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-amber-800">🎈 13-24个月（学步幼儿）</div>
                <div className="grid grid-cols-4 gap-2">
                  {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setBabyAge(m);
                        setShowAgePickerModal(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        babyAge === m
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-amber-50/60 hover:bg-amber-100/80 text-stone-700 border border-amber-200/50'
                      }`}
                    >
                      {m}个月
                    </button>
                  ))}
                </div>
              </div>

              {/* 25-36个月 */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-amber-800">🚀 25-36个月（活力宝贝）</div>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setBabyAge(m);
                        setShowAgePickerModal(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        babyAge === m
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-amber-50/60 hover:bg-amber-100/80 text-stone-700 border border-amber-200/50'
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
            <div className="flex flex-col gap-1.5 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="mx-auto w-3/5 max-w-[200px] h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-xs font-medium text-white shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center"
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
