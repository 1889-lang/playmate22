/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity, PlayRecord, BabyProfile, BabyReaction } from './types';
import { INITIAL_ACTIVITIES } from './data/activities';
import { TabBar } from './components/TabBar';
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { PlaySessionModal } from './components/PlaySessionModal';
import { safeStorage } from './utils/storage';
import { calculateMonthsFromBirthMonth, getLocalDateString } from './utils/date';
import { isActivityReviewed } from './utils/activity';
import { Crown, X, Check, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('today');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{ activityId: string; time: number } | null>(null);

  const [quickProfileModalAct, setQuickProfileModalAct] = useState<Activity | null>(null);
  const [quickName, setQuickName] = useState('宝宝');
  const [quickMonths, setQuickMonths] = useState(6);
  const [quickAgePhase, setQuickAgePhase] = useState<'0-6' | '7-12' | '1-3'>('0-6');

  const showToast = (msg: string, durationMs: number = 2500) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, durationMs);
  };
  
  // SafeStorage state for records
  const [records, setRecords] = useState<PlayRecord[]>(() => {
    return safeStorage.get<PlayRecord[]>('playmate_records', []);
  });

  // SafeStorage state for baby profile (null when unregistered, strictly avoids fake profile creation)
  const [profile, setProfile] = useState<BabyProfile | null>(() => {
    const raw = safeStorage.get<BabyProfile | null>('playmate_profile', null);
    if (!raw) return null;
    if (!raw.ageSource) {
      if (raw.birthMonth && raw.birthMonth !== '2025-08') {
        const calculated = calculateMonthsFromBirthMonth(raw.birthMonth);
        return {
          ...raw,
          currentMonths: calculated !== null ? calculated : raw.currentMonths,
          ageSource: 'birth_month',
        };
      } else {
        return {
          ...raw,
          birthMonth: undefined,
          ageSource: 'estimated',
        };
      }
    }
    return raw;
  });

  // SafeStorage state for VIP membership
  const [isVip, setIsVip] = useState<boolean>(() => {
    return safeStorage.get<boolean>('playmate_is_vip', false);
  });

  const [showMembershipModal, setShowMembershipModal] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<'monthly' | 'yearly' | 'family'>('yearly');

  const handleUpgradeVip = () => {
    setIsVip(true);
    safeStorage.set('playmate_is_vip', true);
    window.dispatchEvent(new Event('playmate_vip_changed'));
    setShowMembershipModal(false);
    showToast('✨ 【内测体验版已激活】已为您解锁当前全部进阶趣味互动与贴心锦囊');
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
    window.dispatchEvent(new Event('playmate_vip_changed'));
  }, [isVip]);

  // Modals state & Single Session Flow state
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [playingActivity, setPlayingActivity] = useState<Activity | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const settledSessionIdsRef = useRef<Set<string>>(new Set());

  const handleStartPlayAttempt = (act: Activity) => {
    const isActVip = Boolean(act.isVip);
    if (!isActivityReviewed(act) && !(isActVip && isVip)) {
      showToast('⚠️ 该活动尚未通过专业安全审核，已临时隔离，暂不支持体验', 3000);
      return;
    }

    const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    setCurrentSessionId(newSessionId);

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
      currentMonths: Number(quickMonths) || 6,
      favoriteCategories: ['感官认知', '大运动'],
      ageSource: 'estimated',
    };
    setProfile(newProfile);
    const actToPlay = quickProfileModalAct;
    setQuickProfileModalAct(null);
    if (actToPlay) {
      setPlayingActivity(actToPlay);
    }
    showToast('✨ 宝宝档案已建立，为您匹配专属适龄游戏！');
  };

  const handleSkipQuickProfile = () => {
    const actToPlay = quickProfileModalAct;
    setQuickProfileModalAct(null);
    showToast('已开启访客体验模式（未建档），随时可在【档案】中设置月龄', 3000);
    if (actToPlay) {
      setPlayingActivity(actToPlay);
    }
  };

  /**
   * 统一陪玩记录保存逻辑：
   * 1. 内部保存真实累计秒数 durationSeconds，接收用户点选的心情 reaction 与照片 photoUrl。
   * 2. 必须且仅当实际陪伴时长严格大于 60 秒 (elapsedSecs > 60) 时，才生成一条成长记录（60秒整不生成）。
   * 3. 展现完整分钟数时严格【向下取整】（Math.floor(elapsedSecs / 60)）。
   * 4. 基于唯一 sessionId 防重复机制（同一个 sessionId 最多生成一条成长记录）。
   * 5. 保存成功后，展示轻量微提示 `✨ 已收录至今日足迹` 并关闭弹窗。
   */
  const handleFinishPlaySession = (
    act: Activity,
    elapsedSecs: number,
    reaction: BabyReaction = '开心专注',
    photoUrl?: string,
    sessId?: string
  ) => {
    setPlayingActivity(null);
    setCurrentSessionId(null);

    const effectiveSessId = sessId || 'sess_' + Date.now();

    // 同一 sessionId 幂等防护
    if (settledSessionIdsRef.current.has(effectiveSessId)) {
      return;
    }
    settledSessionIdsRef.current.add(effectiveSessId);

    // 只有实际累计时长严格大于 60 秒，才生成成长记录（60秒整不生成记录）
    if (elapsedSecs > 60) {
      const durationMinutes = Math.floor(elapsedSecs / 60); // 严格向下取整
      const recordId = 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const newRecord: PlayRecord = {
        id: recordId,
        activityId: act.id,
        activityTitle: act.title,
        category: act.category,
        date: getLocalDateString(),
        durationMinutes,
        durationSeconds: elapsedSecs,
        sessionId: effectiveSessId,
        reaction,
        difficulty: '刚好合适',
        completed: true,
        notes: '',
        photoUrl,
      };

      setRecords((prev) => [newRecord, ...prev]);
      showToast('✨ 已收录至今日足迹', 2500);
    }
  };

  const handleClearHistory = () => {
    setRecords([]);
    showToast('已清空陪玩历史足迹');
  };

  const handleUpdateRecordNotes = (recordId: string, newNotes: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, notes: newNotes } : r))
    );
    showToast('✨ 亲子手记已保存');
  };

  const handleResetAllData = () => {
    localStorage.removeItem('playmate_records');
    localStorage.removeItem('playmate_profile');
    localStorage.removeItem('playmate_user_profile');
    localStorage.removeItem('playmate_is_vip');
    localStorage.removeItem('playmate_paused_session');
    window.dispatchEvent(new Event('playmate_vip_changed'));
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
    <div className="min-h-screen bg-[#FAF9F2] text-[#45483F] font-sans antialiased selection:bg-[#EDF4E9] selection:text-[#3F8054]">
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
            isVip={isVip}
          />
        )}

        {currentTab === 'library' && (
          <LibraryView
            activities={INITIAL_ACTIVITIES}
            profile={profile}
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
            onNavigateToToday={() => setCurrentTab('today')}
            onNavigateToLibrary={() => setCurrentTab('library')}
            onUpdateRecordNotes={handleUpdateRecordNotes}
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
          isVip={isVip}
          onUpgradeVip={() => {
            setSelectedActivity(null);
            setShowMembershipModal(true);
          }}
          onClose={() => setSelectedActivity(null)}
          onStartPlay={(act) => {
            setSelectedActivity(null);
            handleStartPlayAttempt(act);
          }}
        />
      )}

      {/* PlaySessionModal 陪伴弹窗 (全流程单一弹窗，原地平滑切换手账结算与分享视图) */}
      {playingActivity && (
        <PlaySessionModal
          activity={playingActivity}
          sessionId={currentSessionId || undefined}
          onFinishPlay={(act, elapsedSecs, reaction, photoUrl, sessId) => {
            handleFinishPlaySession(act, elapsedSecs, reaction, photoUrl, sessId);
          }}
          onClose={() => {
            setPlayingActivity(null);
            setCurrentSessionId(null);
          }}
        />
      )}

      {/* Quick Profile Semi-Modal Modal for Unregistered Users Clicking Start Play */}
      {quickProfileModalAct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#EDF4E9] shadow-lg space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* Top Title Bar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EDF4E9] text-[#3F8054]">
                ✨ 完善宝宝档案
              </span>
              <button
                onClick={handleSkipQuickProfile}
                className="p-1 rounded-full text-[#85877B] hover:text-[#45483F] hover:bg-[#EDF4E9] transition-colors cursor-pointer"
                title="跳过建档，直接体验"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#45483F]">请先填入宝宝信息</h3>
              <p className="text-xs text-[#85877B] leading-relaxed">
                简单选择宝宝月龄，以便为您匹配适龄玩法与生成打卡海报
              </p>
            </div>

            <form onSubmit={handleQuickProfileSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#45483F]">宝宝小名（可选填）</label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="例如：小宝 / 汤圆"
                  className="w-full h-12 px-4 rounded-xl bg-[#FAF9F2] border border-[#EDF4E9] text-base text-[#45483F] placeholder-[#85877B] focus:outline-none focus:border-[#62AD78] transition-colors"
                />
              </div>

              {/* 分阶段月龄直觉点选 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#45483F]">宝宝月龄</label>
                  <span className="text-xs font-bold text-[#3F8054] bg-[#EDF4E9] px-2 py-0.5 rounded-md border border-[#62AD78]/30">
                    当前选择：{quickMonths} 个月
                  </span>
                </div>

                {/* 阶段选择 Tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF9F2] rounded-xl border border-[#EDF4E9]">
                  {(['0-6', '7-12', '1-3'] as const).map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setQuickAgePhase(phase)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        quickAgePhase === phase
                          ? 'bg-white text-[#3F8054] shadow-xs font-bold'
                          : 'text-[#85877B] hover:text-[#45483F]'
                      }`}
                    >
                      {phase === '0-6' ? '0-6个月' : phase === '7-12' ? '7-12个月' : '1-3岁'}
                    </button>
                  ))}
                </div>

                {/* 快捷月龄按钮网格 */}
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {quickAgePhase === '0-6' &&
                    [1, 2, 3, 4, 5, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setQuickMonths(m)}
                        className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          quickMonths === m
                            ? 'bg-[#62AD78] text-white shadow-xs'
                            : 'bg-[#FAF9F2] text-[#45483F] border border-[#EDF4E9] hover:bg-white'
                        }`}
                      >
                        {m}月
                      </button>
                    ))}
                  {quickAgePhase === '7-12' &&
                    [7, 8, 9, 10, 11, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setQuickMonths(m)}
                        className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          quickMonths === m
                            ? 'bg-[#62AD78] text-white shadow-xs'
                            : 'bg-[#FAF9F2] text-[#45483F] border border-[#EDF4E9] hover:bg-white'
                        }`}
                      >
                        {m}月
                      </button>
                    ))}
                  {quickAgePhase === '1-3' &&
                    [15, 18, 24, 30, 36].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setQuickMonths(m)}
                        className={`col-span-1 h-9 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          quickMonths === m
                            ? 'bg-[#62AD78] text-white shadow-xs'
                            : 'bg-[#FAF9F2] text-[#45483F] border border-[#EDF4E9] hover:bg-white'
                        }`}
                      >
                        {m}月
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center">
                <button
                  type="submit"
                  className="w-3/5 max-w-[200px] h-11 bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>开始今日陪玩</span>
                </button>
                <button
                  type="button"
                  onClick={handleSkipQuickProfile}
                  className="text-[#85877B] hover:text-[#45483F] text-xs py-2 block text-center transition-colors cursor-pointer w-full mt-1"
                >
                  暂不建档，返回继续浏览
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Lightweight Toast - 页面中央上方轻量非阻塞 Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-[#45483F]/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIP Membership Upgrade Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#EDF4E9] shadow-lg space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* Top Title Bar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EDF4E9] text-[#3F8054]">
                <Crown className="w-3.5 h-3.5"/> 【内测体验版已激活】特权专区
              </span>
              <button onClick={() => setShowMembershipModal(false)} className="text-[#85877B] hover:text-[#45483F] cursor-pointer">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#45483F]">解锁玩伴日历全部进阶特权</h3>
              <p className="text-xs text-[#85877B]">已为您解锁当前全部进阶趣味互动与贴心锦囊，开启轻松愉快的亲子陪伴。</p>
            </div>

            {/* Pricing Tiers */}
            <div className="space-y-2.5">
              <div 
                onClick={() => setSelectedTier('monthly')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedTier === 'monthly' ? 'bg-[#EDF4E9]/80 border-[#62AD78] ring-1 ring-[#62AD78]/30' : 'bg-[#FAF9F2] border-[#EDF4E9]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#45483F]">月度陪伴体验版</div>
                  <div className="text-[10px] text-[#85877B]">体验期全功能解锁</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#3F8054]">内测免费</div>
                </div>
              </div>

              <div 
                onClick={() => setSelectedTier('yearly')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                  selectedTier === 'yearly' ? 'bg-[#EDF4E9]/80 border-[#62AD78] ring-1 ring-[#62AD78]/30' : 'bg-[#FAF9F2] border-[#EDF4E9]'
                }`}
              >
                <div className="absolute top-0 right-0 bg-[#62AD78] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-xl">
                  推荐 · 内测专享
                </div>
                <div>
                  <div className="text-xs font-bold text-[#45483F]">年度陪伴尊享版</div>
                  <div className="text-[10px] text-[#85877B]">全月龄 0-3岁畅玩 · 玩法贴心提醒</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#3F8054]">内测免费</div>
                </div>
              </div>
            </div>

            {/* Perks bullet list */}
            <div className="bg-[#FAF9F2] rounded-2xl p-3 space-y-1.5 text-[11px] text-[#45483F]">
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#62AD78]" /> 进阶动作库随心选（0-3岁全覆盖）</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#62AD78]" /> 月龄小贴士与陪伴锦囊</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#62AD78]" /> 高清拍立得海报无限制本地导出</div>
            </div>

            <button
              onClick={handleUpgradeVip}
              className="w-full h-11 rounded-full bg-[#62AD78] hover:bg-[#3F8054] text-white text-xs font-bold shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-white" /> 立即激活内测特权版
            </button>
            <button
              onClick={() => setShowMembershipModal(false)}
              className="w-full h-9 py-2 bg-transparent border-0 shadow-none text-xs text-[#85877B] hover:text-[#45483F] active:opacity-60 transition-colors text-center font-normal tracking-wide cursor-pointer flex items-center justify-center mt-1"
            >
              暂不需要
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
