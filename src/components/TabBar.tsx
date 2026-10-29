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
    { id: 'library', label: '活动库', icon: BookOpen },
    { id: 'history', label: '成长足迹', icon: History },
    { id: 'profile', label: '宝宝档案', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#F1EAE0] px-2 py-1 shadow-lg">
      <div className="grid grid-cols-4 items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all ${
                isActive ? 'text-[#45433F] font-bold' : 'text-[#45433F]/60 hover:text-[#45433F]'
              }`}
            >
              <div className={`p-1 rounded-full transition-colors ${isActive ? 'bg-[#F1EAE0]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#45433F]' : 'text-[#45433F]/60'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
