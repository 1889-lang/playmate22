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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#F3EDE2] px-2 py-1 shadow-[0_-4px_20px_rgba(44,34,30,0.05)]">
      <div className="grid grid-cols-4 items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all cursor-pointer ${
                isActive ? 'text-[#2C221E] font-bold' : 'text-[#786F6A] hover:text-[#2C221E]'
              }`}
            >
              <div className={`p-1.5 rounded-2xl transition-colors ${isActive ? 'bg-orange-100/60 text-orange-600' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-[#786F6A]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
