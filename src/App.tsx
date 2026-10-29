/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, PlayRecord, BabyProfile } from './types';
import { INITIAL_ACTIVITIES } from './data/activities';
import { Navbar } from './components/Navbar';
import { TabBar } from './components/TabBar';
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { CoachModeModal } from './components/CoachModeModal';
import { PlayFeedbackModal } from './components/PlayFeedbackModal';
import { safeStorage } from './utils/storage';
import { Crown, X, Check, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('today');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{ activityId: string; time: number } | null>(null);

  // Quick onboarding modal state for unregistered users clicking start play
  const [quickProfileModalAct, setQuickProfileModalAct] = useState<Activity | null>(null);
  const [quickName, setQuickName] = useState('宝宝');
  const [quickMonths, setQuickMonths] = useState(6);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };
  
  // SafeStorage state for records
  const [records, setRecords] = useState<PlayRecord[]>(() => {
    return safeStorage.get<PlayRecord[]>('playmate_records', []);
  });

  // SafeStorage state for baby profile (null when unregistered)
  const [profile, setProfile] = useState<BabyProfile | null>(() => {
    return safeStorage.get<BabyProfile | null>('playmate_profile', null);
  });

  // SafeStorage state for VIP membership
  const [isVip, setIsVip] = useState<boolean>(() => {
    return safeStorage.get<boolean>('playmate_is_vip', false);
  });

  const [showMembershipModal, setShowMembershipModal] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<'monthly' | 'yearly' | 'family'>('yearly');

  const handleUpgradeVip = () => {
    setIsVip(true);
    setShowMembershipModal(false);
    showToast('✨ 【内测体验版已激活】已为您解锁当前全部进阶全脑互动与专家锦囊');
  };

  useEffect(() => {
    const res = safeStorage.setWithStatus('playmate_records', records);
    if (!res.success) {
      showToast('⚠️ 本地存储受限，足迹可能未永久保存');
    }
  }, [records]);

  useEffect(() => {
    if (profile) {
      const res = safeStorage.setWithStatus('playmate_profile', profile);
      if (!res.success) {
        showToast('⚠️ 本地存储受限，档案可能未永久保存');
      }
    } else {
      safeStorage.remove('playmate_profile');
    }
  }, [profile]);

  useEffect(() => {
    safeStorage.setWithStatus('playmate_is_vip', isVip);
  }, [isVip]);

  // Modals state
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [playingActivity, setPlayingActivity] = useState<Activity | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<{ activity: Activity; durationMinutes: number; status: 'completed' | 'interrupted' } | null>(null);

  const handleStartPlayAttempt = (act: Activity) => {
    if (profile === null) {
      setQuickProfileModalAct(act);
    } else {
      setPlayingActivity(act);
    }
  };

  const handleQuickProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: BabyProfile = {
      name: quickName.trim() || '宝宝',
      birthMonth: '2025-08',
      currentMonths: Number(quickMonths) || 6,
      favoriteCategories: ['感官认知', '大运动'],
    };
    setProfile(newProfile);
    const actToPlay = quickProfileModalAct;
    setQuickProfileModalAct(null);
    if (actToPlay) {
      setPlayingActivity(actToPlay);
    }
    showToast('✨ 宝宝档案已建立，为您匹配专属适龄游戏！');
  };

  const handleSaveRecord = (record: PlayRecord) => {
    // 防重提交与幂等性校验
    if (!record.activityTitle || !record.date || !record.activityId) {
      showToast('⚠️ 打卡记录信息不完整，无法保存');
      return;
    }
    const now = Date.now();
    if (lastSubmission && lastSubmission.activityId === record.activityId && now - lastSubmission.time < 3000) {
      showToast('⚠️ 请勿在3秒内重复提交相同活动打卡');
      return;
    }
    setLastSubmission({ activityId: record.activityId, time: now });
    setRecords((prev) => [record, ...prev]);
    setPendingFeedback(null);
    showToast('✨ 陪伴足迹已安全保存');
  };

  const handleClearHistory = () => {
    setRecords([]);
    showToast('已清空陪玩历史足迹');
  };

  const handleResetAllData = () => {
    localStorage.removeItem('playmate_records');
    localStorage.removeItem('playmate_profile');
    localStorage.removeItem('playmate_is_vip');
    setRecords([]);
    setIsVip(false);
    setProfile(null);
    setCurrentTab('today');
    showToast('已重置所有本地数据');
  };

  const handleSelectActivityById = (activityId: string) => {
    const found = INITIAL_ACTIVITIES.find((a) => a.id === activityId);
    if (found) {
      setSelectedActivity(found);
      setCurrentTab('library');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C221E] font-sans antialiased selection:bg-orange-100 selection:text-orange-900">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isVip={isVip}
        onOpenMembership={() => setShowMembershipModal(true)}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {currentTab === 'today' && (
          <HomeView
            activities={INITIAL_ACTIVITIES}
            records={records}
            profile={profile}
            onSelectTab={setCurrentTab}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onStartPlay={(act) => handleStartPlayAttempt(act)}
          />
        )}

        {currentTab === 'library' && (
          <LibraryView
            activities={INITIAL_ACTIVITIES}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onStartPlay={(act) => handleStartPlayAttempt(act)}
            isVip={isVip}
            onUpgradeVip={() => setShowMembershipModal(true)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            records={records}
            onClearHistory={handleClearHistory}
            onSelectActivityById={handleSelectActivityById}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={(newProfile) => setProfile(newProfile)}
            onResetAllData={handleResetAllData}
            isVip={isVip}
            onUpgradeVip={() => setShowMembershipModal(true)}
          />
        )}
      </main>

      {/* Bottom Mobile TabBar */}
      <TabBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onStartPlay={(act) => {
            setSelectedActivity(null);
            handleStartPlayAttempt(act);
          }}
        />
      )}

      {/* Coach Mode Modal (Timer & Step-by-step guidance) */}
      {playingActivity && (
        <CoachModeModal
          activity={playingActivity}
          onClose={() => setPlayingActivity(null)}
          onFinishPlay={(act, durationMin, status) => {
            setPlayingActivity(null);
            setPendingFeedback({ activity: act, durationMinutes: durationMin, status });
          }}
        />
      )}

      {/* Play Feedback Modal (Polaroid Poster Generator) */}
      {pendingFeedback && (
        <PlayFeedbackModal
          activity={pendingFeedback.activity}
          durationMinutes={pendingFeedback.durationMinutes}
          status={pendingFeedback.status}
          profile={profile || undefined}
          onClose={() => setPendingFeedback(null)}
          onSaveRecord={handleSaveRecord}
        />
      )}

      {/* Quick Profile Semi-Modal Modal for Unregistered Users Clicking Start Play */}
      {quickProfileModalAct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#F3EDE2] shadow-[0_20px_40px_-15px_rgba(44,34,30,0.15)] space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* Top Title Bar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600">
                ✨ 完善宝宝档案
              </span>
              <button onClick={() => setQuickProfileModalAct(null)} className="text-[#786F6A] hover:text-[#2C221E] cursor-pointer">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#2C221E]">请先填入宝宝信息</h3>
              <p className="text-xs text-[#786F6A] leading-relaxed">
                请先填入宝宝信息，以便为你匹配适龄玩法与生成打卡海报
              </p>
            </div>

            <form onSubmit={handleQuickProfileSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C221E]">宝宝小名（可选填）</label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="例如：小宝 / 汤圆"
                  className="w-full h-12 px-4 rounded-2xl bg-[#FAF8F5] border border-[#F3EDE2] text-xs text-[#2C221E] placeholder-[#786F6A]/50 focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C221E]">宝宝月龄（快速选择）</label>
                <select
                  value={quickMonths}
                  onChange={(e) => setQuickMonths(Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-2xl bg-[#FAF8F5] border border-[#F3EDE2] text-xs text-[#2C221E] focus:outline-none focus:border-orange-400"
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

              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 mt-2"
              >
                完成并开始今日陪玩
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global Lightweight Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#2C221E] text-[#FAF8F5] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIP Membership Upgrade Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#F3EDE2] shadow-[0_20px_40px_-15px_rgba(44,34,30,0.15)] space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* Top Title Bar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600">
                <Crown className="w-3.5 h-3.5"/> 【内测体验版已激活】特权专区
              </span>
              <button onClick={() => setShowMembershipModal(false)} className="text-[#786F6A] hover:text-[#2C221E] cursor-pointer">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#2C221E]">解锁玩伴日历全部专家特权</h3>
              <p className="text-xs text-[#786F6A]">已为您解锁当前全部进阶全脑互动与专家锦囊，开启高质量专注陪伴。</p>
            </div>

            {/* Pricing Tiers */}
            <div className="space-y-2.5">
              <div 
                onClick={() => setSelectedTier('monthly')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedTier === 'monthly' ? 'bg-orange-50/60 border-orange-400 ring-1 ring-orange-400/30' : 'bg-[#FAF8F5] border-[#F3EDE2]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#2C221E]">月度陪伴体验版</div>
                  <div className="text-[10px] text-[#786F6A]">体验期全功能解锁</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-orange-600">内测免费</div>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTier('yearly')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                  selectedTier === 'yearly' ? 'bg-orange-50/60 border-orange-400 ring-1 ring-orange-400/30' : 'bg-[#FAF8F5] border-[#F3EDE2]'
                }`}
              >
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-xl">
                  推荐 · 内测专享
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2C221E]">年度陪伴尊享版</div>
                  <div className="text-[10px] text-[#786F6A]">全月龄 0-3岁畅玩 · 专家指导</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-orange-600">内测免费</div>
                </div>
              </div>
            </div>

            {/* Perks bullet list */}
            <div className="bg-[#FAF8F5] rounded-2xl p-3 space-y-1.5 text-[11px] text-[#2C221E]">
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-500" /> 进阶动作库随心选（0-3岁全覆盖）</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-500" /> 儿科专家敏感期解读与陪伴锦囊</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-500" /> 高清拍立得海报无限制本地导出</div>
            </div>

            <button
              onClick={handleUpgradeVip}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/25 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-white" /> 立即激活内测特权版
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
