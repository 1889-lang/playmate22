/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Crown } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isVip: boolean;
  onOpenMembership: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, isVip, onOpenMembership }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#F1EAE0] px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectTab('today')}>
        <div className="w-8 h-8 rounded-xl bg-[#A8B9A0] flex items-center justify-center text-white shadow-xs">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-[#45433F] tracking-tight flex items-center gap-1.5">
            玩伴日历 <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-[#F1EAE0] text-[#45433F]">V1.0</span>
          </h1>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#45433F]/80">
        <button onClick={() => onSelectTab('today')} className={`hover:text-[#45433F] transition-colors cursor-pointer ${currentTab === 'today' ? 'font-bold text-[#45433F]' : ''}`}>今日推荐</button>
        <button onClick={() => onSelectTab('library')} className={`hover:text-[#45433F] transition-colors cursor-pointer ${currentTab === 'library' ? 'font-bold text-[#45433F]' : ''}`}>活动库</button>
        <button onClick={() => onSelectTab('history')} className={`hover:text-[#45433F] transition-colors cursor-pointer ${currentTab === 'history' ? 'font-bold text-[#45433F]' : ''}`}>成长足迹</button>
        <button onClick={() => onSelectTab('profile')} className={`hover:text-[#45433F] transition-colors cursor-pointer ${currentTab === 'profile' ? 'font-bold text-[#45433F]' : ''}`}>宝宝档案</button>
      </div>

      <div className="flex items-center gap-2">
        {isVip ? (
          <div className="px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1 shadow-xs">
            <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-600" />
            <span>VIP年卡尊享中</span>
          </div>
        ) : (
          <button
            onClick={onOpenMembership}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:opacity-95 transition-all cursor-pointer animate-pulse"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
            <span>开通VIP年卡</span>
          </button>
        )}
      </div>
    </header>
  );
};
