/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BabyProfile } from '../types';
import { Baby } from 'lucide-react';

interface FloatingWidgetProps {
  isVip?: boolean | string | number | null;
  profile?: BabyProfile | null;
  todayTotalMinutes?: number;
  onClick?: () => void;
}

/**
 * 严格校验并解析 VIP 状态：
 * 兼容布尔值 true、字符串 'true'、数字 1、以及有效期判定（new Date(expireDate) > new Date()）
 */
function resolveVipStatus(
  propVip: unknown,
  propProfile?: BabyProfile | null
): boolean {
  // 1. 先校验传入的 prop
  if (propVip === true || propVip === 'true' || propVip === 1 || propVip === '1') {
    return true;
  }

  // 2. 校验 profile 对象内可能包含的 VIP 标识及过期时间
  if (propProfile && typeof propProfile === 'object') {
    const p = propProfile as unknown as Record<string, unknown>;
    if (p.isVip === true || p.isVip === 'true' || p.isVip === 1) {
      return true;
    }
    const expire = p.vipExpireDate || p.vipExpiresAt || p.expireDate;
    if (expire && typeof expire === 'string') {
      const expDate = new Date(expire);
      if (!isNaN(expDate.getTime()) && expDate.getTime() > Date.now()) {
        return true;
      }
    }
  }

  // 3. 从 localStorage 兜底读取（兼容多种常见存储键）
  try {
    const rawVip = localStorage.getItem('playmate_is_vip');
    if (rawVip !== null) {
      try {
        const parsed = JSON.parse(rawVip);
        if (parsed === true || parsed === 'true' || parsed === 1) return true;
      } catch {
        if (rawVip === 'true' || rawVip === '1') return true;
      }
    }

    const rawProfile = localStorage.getItem('playmate_user_profile') || localStorage.getItem('playmate_profile');
    if (rawProfile) {
      try {
        const profileObj = JSON.parse(rawProfile);
        if (profileObj.isVip === true || profileObj.isVip === 'true' || profileObj.isVip === 1) {
          return true;
        }
        const expire = profileObj.vipExpireDate || profileObj.vipExpiresAt || profileObj.expireDate;
        if (expire && typeof expire === 'string') {
          const expDate = new Date(expire);
          if (!isNaN(expDate.getTime()) && expDate.getTime() > Date.now()) {
            return true;
          }
        }
      } catch {
        // ignore parse error
      }
    }
  } catch {
    // ignore storage security errors
  }

  return false;
}

export const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  isVip: propIsVip,
  profile,
  todayTotalMinutes = 0,
  onClick,
}) => {
  const [effectiveIsVip, setEffectiveIsVip] = useState<boolean>(() =>
    resolveVipStatus(propIsVip, profile)
  );

  const checkStatus = useCallback(() => {
    setEffectiveIsVip(resolveVipStatus(propIsVip, profile));
  }, [propIsVip, profile]);

  // 当传入的 prop 变化时同步更新
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // 监听跨标签页 storage 事件与同页面自定义 VIP 更新事件
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'playmate_is_vip' ||
        e.key === 'playmate_user_profile' ||
        e.key === 'playmate_profile'
      ) {
        checkStatus();
      }
    };

    const handleCustomVipChange = () => {
      checkStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('playmate_vip_changed', handleCustomVipChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('playmate_vip_changed', handleCustomVipChange);
    };
  }, [checkStatus]);

  // 当用户未录入婴儿档案时，严禁渲染悬浮挂件，避免未建档却有头像的穿帮感
  if (!profile) {
    return null;
  }

  return (
    <div
      onClick={onClick}
      className={`fixed right-4 bottom-20 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        effectiveIsVip
          ? 'bg-gradient-to-r from-amber-50/95 via-orange-50/95 to-amber-50/90 backdrop-blur-md shadow-[0_4px_16px_rgba(245,158,11,0.25)] border border-amber-300/80 ring-1 ring-amber-300/40'
          : 'bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(251,146,60,0.18)] border border-orange-100/80'
      }`}
      title={
        profile
          ? `${profile.name}的成长档案 · ${effectiveIsVip ? '👑 VIP尊享中' : '点击查看'}`
          : '点击查看宝宝档案与会员状态'
      }
    >
      {/* 
        头像外层定位容器：
        ⚠️ 绝不设置 overflow-hidden，确保突出的皇冠不会被截断裁切！
      */}
      <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
        {effectiveIsVip && (
          <span
            className="absolute -top-2 -left-1 text-sm leading-none transform -rotate-12 z-20 select-none pointer-events-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
            title="VIP 年卡会员"
            aria-label="VIP会员"
          >
            👑
          </span>
        )}

        {/* 内层头像容器：裁切为正圆形 */}
        <div
          className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-bold shadow-xs transition-colors ${
            effectiveIsVip
              ? 'bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300/90 text-amber-800'
              : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
          }`}
        >
          <Baby
            className={`w-4 h-4 ${
              effectiveIsVip ? 'text-amber-700' : 'text-emerald-700'
            }`}
          />
        </div>
      </div>

      {/* 陪伴计时显示 */}
      <div className="flex items-center gap-1.5 pr-0.5">
        <span className="text-xs">⏰</span>
        <span className="text-xs font-extrabold text-orange-600 font-mono">
          {todayTotalMinutes}m
        </span>
      </div>
    </div>
  );
};
