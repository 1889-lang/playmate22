/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, PlayRecord, BabyProfile } from './types';
import { INITIAL_ACTIVITIES } from './data/activities';
import { TabBar } from './components/TabBar';
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { CoachModeModal } from './components/CoachModeModal';
import { PlayFeedbackModal } from './components/PlayFeedbackModal';
import { PolaroidModal } from './components/PolaroidModal';
import { PausedSession } from './components/FloatingWidget';
import { safeStorage } from './utils/storage';
import { calculateMonthsFromBirthMonth, getLocalDateString } from './utils/date';
import { isActivityReviewed } from './utils/activity';
import { Crown, X, Check, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('today');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{ activityId: string; time: number } | null>(null);

  // Paused session state for tracking in-progress play
  const [pausedSession, setPausedSession] = useState<PausedSession | null>(() => {
    return safeStorage.get<PausedSession | null>('playmate_paused_session', null);
  });

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
    // 兼容迁移已有老数据：若没有 ageSource，进行平滑迁移
    if (!raw.ageSource) {
      if (raw.birthMonth && raw.birthMonth !== '2025-08') {
        const calculated = calculateMonthsFromBirthMonth(raw.birthMonth);
        return {
          ...raw,
          currentMonths: calculated !== null ? calculated : raw.currentMonths,
          ageSource: 'birth_month',
        };
      } else {
        // 如果旧数据为硬编码 2025-08，移除虚假出生月份并标记为估算月龄模式
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

  // Modals state
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [playingActivity, setPlayingActivity] = useState<Activity | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<{ activity: Activity; durationMinutes: number; status: 'completed' | 'interrupted' } | null>(null);
  const [polaroidData, setPolaroidData] = useState<{
    activity: Activity;
    durationMinutes: number;
    date: string;
    babyState?: string;
    photoUrl?: string;
  } | null>(null);

  const handleStartPlayAttempt = (act: Activity) => {
    const isActVip = Boolean(act.isVip);
    // 严格安全准入校验：未通过审核的活动在常规状态下绝不允许进入陪玩流程；VIP内测状态下支持内测体验核验
    if (!isActivityReviewed(act) && !(isActVip && isVip)) {
      showToast('⚠️ 该活动尚未通过专业安全审核，已临时隔离，暂不支持体验', 3000);
      return;
    }

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
      ageSource: 'estimated', // 明确为估算月龄模式，不伪造虚构出生年月
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
    // P0-03 核心规范：
    // 用户点击跳过时，profile 严格保持 null！不得创建默认档案，不得写入 playmate_profile
    showToast('已开启访客体验模式（未建档），随时可在【档案】中设置月龄', 3000);
    if (actToPlay) {
      setPlayingActivity(actToPlay);
    }
  };

  const handleSaveAndExit = (act: Activity, elapsedSecs: number) => {
    const sessionData: PausedSession = {
      activity: act,
      elapsedSeconds: elapsedSecs,
      updatedAt: Date.now(),
    };
    setPausedSession(sessionData);
    safeStorage.set('playmate_paused_session', sessionData);
    setPlayingActivity(null);
    // 严格确保不呼起打卡弹窗，仅弹出 1.5s 提示
    showToast('✓ 已暂存陪伴时长，随时可继续', 1500);
  };

  const handleFinishPlay = (act: Activity, durationMinutes: number, status: 'completed' | 'interrupted' = 'completed') => {
    const mappedReaction = status === 'interrupted' ? '容易疲劳' : '开心专注';
    const record: PlayRecord = {
      id: 'rec_' + Date.now(),
      activityId: act.id,
      activityTitle: act.title,
      category: act.category,
      date: getLocalDateString(),
      durationMinutes,
      reaction: mappedReaction,
      difficulty: '刚好合适',
      completed: status === 'completed',
      notes: status === 'interrupted' ? '中途休息' : '',
    };

    // 自动保存本次陪玩记录（仅保存一次）
    handleSaveRecord(record);

    // 关闭陪玩计时弹窗并清理暂存
    setPlayingActivity(null);
    setPausedSession(null);
    safeStorage.remove('playmate_paused_session');

    // 确保弹窗平滑切换，自动打开拍立得结果页面
    setTimeout(() => {
      setPolaroidData({
        activity: act,
        durationMinutes,
        date: getLocalDateString(),
        babyState: status === 'interrupted' ? '累了' : '开心',
        photoUrl: undefined,
      });
    }, 60);
  };

  const handleResumeSession = (session: PausedSession) => {
    setPlayingActivity(session.activity);
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

    // 每次独立陪玩从开始到结束，均记录为 1 次（不合并同日多次记录）
    setRecords((prev) => [record, ...prev]);
    showToast('✨ 陪伴足迹已安全保存');

    setPausedSession(null);
    safeStorage.remove('playmate_paused_session');
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
    setPausedSession(null);
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
            pausedSession={pausedSession}
            onResumeSession={handleResumeSession}
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

      {/* Coach Mode Modal (Timer & Step-by-step guidance) */}
      {playingActivity && (
        <CoachModeModal
          activity={playingActivity}
          initialSeconds={
            pausedSession && pausedSession.activity.id === playingActivity.id
              ? pausedSession.elapsedSeconds
              : 0
          }
          onClose={() => setPlayingActivity(null)}
          onSaveAndExit={handleSaveAndExit}
          onFinishPlay={handleFinishPlay}
        />
      )}

      {/* Polaroid Poster Modal (Direct Result View) */}
      {polaroidData && (
        <PolaroidModal
          activity={polaroidData.activity}
          durationMinutes={polaroidData.durationMinutes}
          date={polaroidData.date}
          babyState={polaroidData.babyState}
          photoUrl={polaroidData.photoUrl}
          babyName={profile?.name || '宝宝'}
          onUpdateBabyState={(newState) => {
            setPolaroidData((prev) => (prev ? { ...prev, babyState: newState } : null));
            const mappedReaction = newState === '开心' ? '开心专注' : newState === '平静' ? '平静探索' : '容易疲劳';
            setRecords((prev) => {
              if (prev.length === 0) return prev;
              const copy = [...prev];
              copy[0] = { ...copy[0], reaction: mappedReaction };
              return copy;
            });
          }}
          onUpdatePhotoUrl={(newUrl) => {
            setPolaroidData((prev) => (prev ? { ...prev, photoUrl: newUrl } : null));
            setRecords((prev) => {
              if (prev.length === 0) return prev;
              const copy = [...prev];
              copy[0] = { ...copy[0], photoUrl: newUrl };
              return copy;
            });
          }}
          onClose={() => {
            setPolaroidData(null);
            setCurrentTab('today');
          }}
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
              <button
                onClick={handleSkipQuickProfile}
                className="p-1 rounded-full text-[#786F6A] hover:text-[#2C221E] hover:bg-stone-100 transition-colors cursor-pointer"
                title="跳过建档，直接体验"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#2C221E]">请先填入宝宝信息</h3>
              <p className="text-xs text-[#786F6A] leading-relaxed">
                简单选择宝宝月龄，以便为您匹配适龄玩法与生成打卡海报
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
                  className="w-full h-11 px-4 rounded-2xl bg-[#FAF8F5] border border-[#F3EDE2] text-xs text-[#2C221E] placeholder-[#786F6A]/50 focus:outline-none focus:border-orange-400"
                />
              </div>

              {/* 分阶段月龄直觉点选（彻底告别36项长单列select） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C221E]">宝宝月龄</label>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50">
                    当前选择：{quickMonths} 个月
                  </span>
                </div>

                {/* 阶段选择 Tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-[#F3EDE2]">
                  {(['0-6', '7-12', '1-3'] as const).map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setQuickAgePhase(phase)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        quickAgePhase === phase
                          ? 'bg-white text-orange-600 shadow-xs font-bold'
                          : 'text-[#786F6A] hover:text-[#2C221E]'
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
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-[#FAF8F5] text-stone-700 border border-[#F3EDE2] hover:bg-white'
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
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-[#FAF8F5] text-stone-700 border border-[#F3EDE2] hover:bg-white'
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
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-[#FAF8F5] text-stone-700 border border-[#F3EDE2] hover:bg-white'
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
                  className="w-3/5 max-w-[200px] h-11 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-medium text-sm rounded-full shadow-sm active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>开始今日陪玩</span>
                </button>
                <button
                  type="button"
                  onClick={handleSkipQuickProfile}
                  className="text-stone-400 hover:text-stone-600 text-xs py-2 block text-center transition-colors cursor-pointer w-full mt-1"
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
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-stone-900/90 backdrop-blur-md text-stone-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
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
              <h3 className="text-lg font-bold text-[#2C221E]">解锁玩伴日历全部进阶特权</h3>
              <p className="text-xs text-[#786F6A]">已为您解锁当前全部进阶趣味互动与贴心锦囊，开启轻松愉快的亲子陪伴。</p>
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
                  <div className="text-[10px] text-[#786F6A]">全月龄 0-3岁畅玩 · 玩法贴心提醒</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-orange-600">内测免费</div>
                </div>
              </div>
            </div>

            {/* Perks bullet list */}
            <div className="bg-[#FAF8F5] rounded-2xl p-3 space-y-1.5 text-[11px] text-[#2C221E]">
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-500" /> 进阶动作库随心选（0-3岁全覆盖）</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-500" /> 月龄小贴士与陪伴锦囊</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-500" /> 高清拍立得海报无限制本地导出</div>
            </div>

            <button
              onClick={handleUpgradeVip}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-white" /> 立即激活内测特权版
            </button>
            <button
              onClick={() => setShowMembershipModal(false)}
              className="w-full h-9 py-2 bg-transparent border-0 shadow-none text-xs text-stone-400 hover:text-stone-600 active:opacity-60 transition-colors text-center font-normal tracking-wide cursor-pointer flex items-center justify-center mt-1"
            >
              暂不需要
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
