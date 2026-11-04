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
    <header className="sticky top-0 z-30 bg-[#FAF9F2]/90 backdrop-blur-md border-b border-[#EDF4E9] px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('today')}>
        <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-xs border border-[#3F8054]/20 shrink-0 bg-[#62AD78] flex items-center justify-center">
          <img src="/icon.svg" alt="玩伴日历 Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-[#45483F] tracking-tight flex items-center gap-1.5">
            玩伴日历 <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDF4E9] text-[#3F8054]">V2.0</span>
          </h1>
          <p className="text-xs text-[#85877B] font-normal mt-0.5 tracking-tight">
            每天轻松找玩法 · 真正陪孩子玩一会儿
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#85877B]">
        <button onClick={() => onSelectTab('today')} className={`hover:text-[#3F8054] transition-colors cursor-pointer ${currentTab === 'today' ? 'font-bold text-[#3F8054]' : ''}`}>今日推荐</button>
        <button onClick={() => onSelectTab('library')} className={`hover:text-[#3F8054] transition-colors cursor-pointer ${currentTab === 'library' ? 'font-bold text-[#3F8054]' : ''}`}>活动宝库</button>
        <button onClick={() => onSelectTab('history')} className={`hover:text-[#3F8054] transition-colors cursor-pointer ${currentTab === 'history' ? 'font-bold text-[#3F8054]' : ''}`}>成长足迹</button>
        <button onClick={() => onSelectTab('profile')} className={`hover:text-[#3F8054] transition-colors cursor-pointer ${currentTab === 'profile' ? 'font-bold text-[#3F8054]' : ''}`}>宝宝档案</button>
      </div>
    </header>
  );
};
