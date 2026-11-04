/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Activity } from '../types';
import { X } from 'lucide-react';

interface TextGuideDrawerProps {
  activity: Activity;
  onClose: () => void;
}

export const TextGuideDrawer: React.FC<TextGuideDrawerProps> = ({ activity, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[85vh] bg-[#FAF9F2] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* 1. 顶部固定 Header */}
        <div className="px-5 py-3.5 bg-[#FAF9F2] border-b border-[#EDF4E9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#45483F]">玩法图文指南</h3>
            <span className="text-xs text-[#85877B]">({activity.title})</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#45483F] shadow-xs transition-colors"
            aria-label="关闭指南"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. 可滚动内容区（添加充足的 pt-4，彻底解决首行遮挡） */}
        <div className="p-5 pt-4 overflow-y-auto space-y-5 pb-10">
          {/* 所需材料：正常流式排列，绝不被 Header 遮盖 */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#85877B] flex items-center gap-1.5">
              <span>🎒 所需安全材料</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.materials.map((m: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-[#EDF4E9] border border-[#62AD78]/30 text-xs font-medium text-[#3F8054] shadow-xs"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* 完整操作步骤：左侧连贯时间轴，最后一个步骤不显示连接线 */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#85877B]">
              📋 完整操作步骤
            </div>
            <div className="space-y-0">
              {activity.steps.map((step: any, idx: number) => {
                const isLast = idx === activity.steps.length - 1;
                return (
                  <div key={step.stepNumber} className="flex items-start gap-3 relative">
                    {/* 轴线区 */}
                    <div className="flex flex-col items-center self-stretch">
                      <div className="w-5 h-5 rounded-full bg-[#62AD78] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs z-10">
                        {step.stepNumber}
                      </div>
                      {!isLast && (
                        <div className="w-[2px] bg-[#62AD78]/30 grow my-1 min-h-[32px]" />
                      )}
                    </div>
                    {/* 步骤内容区 */}
                    <div className={`pb-4 space-y-0.5 ${isLast ? 'pb-0' : ''}`}>
                      <div className="text-sm font-bold text-[#45483F]">{step.title}</div>
                      <p className="text-xs text-[#85877B] leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 示范话术 */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#85877B]">
              💬 示范话术
            </div>
            <div className="bg-[#EDF4E9]/80 border border-[#62AD78]/30 rounded-2xl p-3.5 text-xs text-[#3F8054] font-medium leading-relaxed shadow-xs">
              {activity.parentPrompt
                ? activity.parentPrompt.replace(/^["'“”]+|["'“”]+$/g, '')
                : '咚咚咚，小鼓敲起来，宝宝也来敲一敲！'}
            </div>
          </div>

          {/* 观察与提醒（清洗文末双句号） */}
          <div className="bg-white border border-[#EDF4E9] rounded-2xl p-3.5 space-y-1.5 shadow-xs">
            <div className="text-xs font-bold text-[#3F8054] flex items-center gap-1">
              <span>💡 观察与提醒</span>
            </div>
            <p className="text-xs text-[#85877B] leading-relaxed">
              {(activity.observationTips?.[0] || '观察宝宝对节奏与声响的反应').replace(/[。.]+$/, '')}。
              {(activity.safetyReminder || '注意安全，适时休息').replace(/[。.]+$/, '')}。
            </p>
          </div>

          {/* 来源 */}
          {activity.source && (
            <div className="text-[11px] text-[#85877B]/70 text-center pt-1">
              来源：{activity.source}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
