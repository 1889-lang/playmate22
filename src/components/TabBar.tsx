/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, BookOpen, History, User } from 'lucide-react';

interface TabBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'today', label: '今日推荐', icon: Calendar },
    { id: 'library', label: '活动宝库', icon: BookOpen },
    { id: 'history', label: '成长足迹', icon: History },
    { id: 'profile', label: '宝宝档案', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F2]/95 backdrop-blur-md border-t border-[#EDF4E9] px-2 py-1 shadow-xs">
      <div className="grid grid-cols-4 items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all cursor-pointer ${
                isActive ? 'text-[#3F8054] font-bold' : 'text-[#85877B] hover:text-[#45483F]'
              }`}
            >
              <div className={`p-1.5 rounded-2xl transition-colors ${isActive ? 'bg-[#EDF4E9] text-[#3F8054]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#3F8054]' : 'text-[#85877B]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
