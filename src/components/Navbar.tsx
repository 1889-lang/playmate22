/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isVip?: boolean;
  onOpenMembership?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#F3EDE2] px-4 py-3 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(44,34,30,0.03)]">
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('today')}>
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-[#2C221E] tracking-tight flex items-center gap-1.5">
            玩伴日历 <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">V1.0</span>
          </h1>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#786F6A]">
        <button onClick={() => onSelectTab('today')} className={`hover:text-[#2C221E] transition-colors cursor-pointer ${currentTab === 'today' ? 'font-bold text-[#2C221E]' : ''}`}>今日推荐</button>
        <button onClick={() => onSelectTab('library')} className={`hover:text-[#2C221E] transition-colors cursor-pointer ${currentTab === 'library' ? 'font-bold text-[#2C221E]' : ''}`}>活动宝库</button>
        <button onClick={() => onSelectTab('history')} className={`hover:text-[#2C221E] transition-colors cursor-pointer ${currentTab === 'history' ? 'font-bold text-[#2C221E]' : ''}`}>成长足迹</button>
        <button onClick={() => onSelectTab('profile')} className={`hover:text-[#2C221E] transition-colors cursor-pointer ${currentTab === 'profile' ? 'font-bold text-[#2C221E]' : ''}`}>宝宝档案</button>
      </div>
    </header>
  );
};
