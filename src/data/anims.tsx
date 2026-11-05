/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * 玩伴日历 - 北欧轻拟真绘本风格动画切片 (Scandinavian Editorial Illustration for Early Childhood)
 * 
 * 核心设计规范：
 * 1. 色彩继承自系统原生 Palette：
 *    - #FAF7F2 (画布背景)
 *    - #F1EAE0 (暖调木地板/衬底)
 *    - #A8B9A0 (鼠尾草绿)
 *    - #E8B58D (温暖皮肤/木质/暖橘)
 *    - #DFA39A (柔和珊瑚红/腮红)
 *    - #A9BFCC (灰蓝)
 *    - #45433F (发丝/眼睛/轮廓线)
 *    - #858078 (中灰细节与阴影)
 * 2. 角色形态：
 *    - 大人与宝宝具备完整的头部、面部五官（有神的黑眸、双眼皮/睫毛、鼻尖、笑嘴、粉嫩腮红）、肢体关节与5指掌手。
 *    - 宝宝头身比为符合月龄的 1:3 萌系比例，双手双脚有婴儿褶皱细节。
 * 3. 动画连续性：
 *    - 纯 CSS / SVG Keyframe 矢量平滑帧动画，表达“动作准备 -> 动作触发 -> 交互反馈”的完整过程。
 */

/**
 * 4帧交互示范切片组件 (支持【帧1：大人示范，宝宝看】->【帧2：手部对拍，互动】->【帧3：一起欢呼鼓掌】->【帧4：微笑贴贴】)
 */
export const FourFrameInteractiveIllustration: React.FC<{
  className?: string;
  selectedFrame?: number;
  onSelectFrame?: (frameIdx: number) => void;
}> = ({ className = 'w-full h-full', selectedFrame, onSelectFrame }) => {
  const [internalFrame, setInternalFrame] = React.useState(0);

  const activeFrame = selectedFrame !== undefined ? selectedFrame : internalFrame;

  // Auto-play loop every 2.8 seconds if uncontrolled
  React.useEffect(() => {
    if (selectedFrame !== undefined) return;
    const timer = setInterval(() => {
      setInternalFrame((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, [selectedFrame]);

  const frameLabels = [
    { title: '帧 1：大人示范，宝宝看', icon: '👁️' },
    { title: '帧 2：手部对拍，互动', icon: '🤝' },
    { title: '帧 3：一起欢呼鼓掌', icon: '👏' },
    { title: '帧 4：微笑贴贴', icon: '🥰' },
  ];

  return (
    <div className={`relative flex flex-col items-center justify-between w-full h-full ${className}`}>
      {/* 4帧状态胶囊指示器 */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-full border border-[#62AD78]/30 shadow-xs max-w-[94%]">
        {frameLabels.map((lbl, idx) => {
          const isActive = activeFrame === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (onSelectFrame) onSelectFrame(idx);
                else setInternalFrame(idx);
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-0.5 ${
                isActive
                  ? 'bg-[#62AD78] text-white shadow-2xs scale-105'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{lbl.icon}</span>
              <span className="hidden sm:inline">{lbl.title.split('：')[1] || lbl.title}</span>
              <span className="sm:hidden">F{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* SVG 画布 */}
      <svg viewBox="0 0 400 240" className="w-full h-full object-contain overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="亲子四帧平滑切片动画">
        <defs>
          <style>{`
            @keyframes pulseSparkle {
              0%, 100% { opacity: 0.3; transform: scale(0.9); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes clapWave {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15) rotate(5deg); }
            }
            @keyframes cuddleSway {
              0%, 100% { transform: rotate(-1deg); }
              50% { transform: rotate(1.5deg) translateY(-2px); }
            }
            .anim-sparkle { animation: pulseSparkle 1.8s ease-in-out infinite; }
            .anim-clap { animation: clapWave 1.2s ease-in-out infinite; transform-origin: 200px 120px; }
            .anim-cuddle { animation: cuddleSway 2.5s ease-in-out infinite; transform-origin: 200px 160px; }
          `}</style>
        </defs>

        {/* 基础背景 */}
        <rect x="0" y="0" width="400" height="175" fill="#FAF7F2" />
        <rect x="0" y="175" width="400" height="65" fill="#F1EAE0" />
        <line x1="0" y1="175" x2="400" y2="175" stroke="#858078" strokeWidth="1" strokeOpacity="0.3" />
        <ellipse cx="200" cy="195" rx="160" ry="25" fill="#A8B9A0" opacity="0.35" />

        {/* =================================================================== */}
        {/* 【帧 1：大人示范，宝宝看】 */}
        {/* =================================================================== */}
        {activeFrame === 0 && (
          <g id="frame-1-demonstrate">
            {/* 左侧：大人示范做动作 */}
            <g transform="translate(65, 50)">
              {/* 大人躯干 */}
              <path d="M20 135 C30 95, 75 85, 105 100 L115 155 Z" fill="#A8B9A0" stroke="#45433F" strokeWidth="1.5" />
              {/* 大人头部 */}
              <ellipse cx="68" cy="55" rx="22" ry="26" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
              <path d="M48 45 Q68 32 88 42 C78 62, 58 62, 48 45 Z" fill="#45433F" />
              {/* 五官：生动眼神看宝宝，嘴巴示范发声 */}
              <ellipse cx="76" cy="54" rx="3.5" ry="4.5" fill="#45483F" />
              <circle cx="77.5" cy="52.5" r="1.2" fill="#FAF7F2" />
              <path d="M72 49 Q76 47 80 49" stroke="#45483F" strokeWidth="1.2" fill="none" />
              <ellipse cx="76" cy="65" rx="4" ry="5" fill="#DFA39A" stroke="#45433F" strokeWidth="1" />
              <ellipse cx="80" cy="60" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />

              {/* 大人手臂伸出向中间示范 */}
              <path d="M80 100 Q120 105 145 100" stroke="#E8B58D" strokeWidth="9" strokeLinecap="round" fill="none" />
              <path d="M80 100 Q120 105 145 100" stroke="#A8B9A0" strokeWidth="7" strokeLinecap="round" fill="none" />
              <circle cx="148" cy="100" r="5" fill="#E8B58D" />
            </g>

            {/* 右侧：宝宝坐着专注注视 */}
            <g transform="translate(245, 65)">
              <path d="M30 150 Q45 165 70 158" stroke="#E8B58D" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path d="M20 115 C30 105, 55 105, 65 120 L60 155 L20 150 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1.2" />
              <ellipse cx="38" cy="90" rx="20" ry="22" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
              <path d="M34 68 Q38 60 42 66 Q46 60 49 67" stroke="#45433F" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* 宝宝眼睛闪亮充满好奇 */}
              <ellipse cx="30" cy="88" rx="4" ry="5" fill="#45483F" />
              <circle cx="31.5" cy="86" r="1.5" fill="#FAF7F2" />
              <path d="M32 98 Q38 103 44 98" stroke="#45433F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <ellipse cx="23" cy="94" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />

              {/* 小手臂放在膝盖上 */}
              <path d="M28 118 Q12 125 5 130" stroke="#E8B58D" strokeWidth="6" strokeLinecap="round" fill="none" />
              <circle cx="4" cy="130" r="3.5" fill="#E8B58D" />
            </g>

            {/* 眼神注视虚线弧线 */}
            <path d="M150 110 Q190 95 265 150" stroke="#62AD78" strokeWidth="2" strokeDasharray="5,4" className="animate-pulse" fill="none" />
            <text x="180" y="98" fill="#3F8054" fontSize="11" fontWeight="bold">你看，像这样~</text>
          </g>
        )}

        {/* =================================================================== */}
        {/* 【帧 2：手部对拍，互动】 */}
        {/* =================================================================== */}
        {activeFrame === 1 && (
          <g id="frame-2-touch">
            {/* 大人侧倾身 */}
            <g transform="translate(80, 50)">
              <path d="M20 135 C30 95, 75 85, 105 100 L115 155 Z" fill="#A8B9A0" stroke="#45433F" strokeWidth="1.5" />
              <ellipse cx="78" cy="55" rx="22" ry="26" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
              <path d="M58 45 Q78 32 98 42 C88 62, 68 62, 58 45 Z" fill="#45433F" />
              <ellipse cx="86" cy="54" rx="3" ry="4" fill="#45483F" />
              <path d="M82 65 Q88 72 94 65" stroke="#45433F" strokeWidth="1.5" fill="none" />
              <ellipse cx="90" cy="60" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />

              {/* 手臂伸向中央接触点 */}
              <path d="M85 100 Q120 105 155 110" stroke="#E8B58D" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path d="M85 100 Q120 105 155 110" stroke="#A8B9A0" strokeWidth="8" strokeLinecap="round" fill="none" />
            </g>

            {/* 宝宝倾身 */}
            <g transform="translate(210, 60)">
              <path d="M40 150 Q55 165 80 158" stroke="#E8B58D" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path d="M30 115 C40 105, 65 105, 75 120 L70 155 L30 150 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1.2" />
              <ellipse cx="42" cy="90" rx="20" ry="22" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
              <ellipse cx="34" cy="88" rx="3.5" ry="4.5" fill="#45483F" />
              <path d="M34 98 Q40 103 46 98" stroke="#45433F" strokeWidth="1.5" fill="none" />
              <ellipse cx="28" cy="94" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />

              {/* 宝宝手臂伸向中央 */}
              <path d="M35 118 Q15 118 -15 112" stroke="#E8B58D" strokeWidth="7" strokeLinecap="round" fill="none" />
            </g>

            {/* 核心对拍触碰点 (x=200, y=160) */}
            <g transform="translate(200, 160)">
              {/* 大人掌心 */}
              <ellipse cx="-5" cy="0" rx="7" ry="9" fill="#E8B58D" stroke="#45433F" strokeWidth="1" />
              {/* 宝宝小掌心与5指 */}
              <circle cx="5" cy="0" r="5" fill="#E8B58D" stroke="#45433F" strokeWidth="1" />
              <circle cx="9" cy="-4" r="1.5" fill="#E8B58D" />
              <circle cx="11" cy="-1" r="1.5" fill="#E8B58D" />
              <circle cx="11" cy="2" r="1.5" fill="#E8B58D" />
              <circle cx="9" cy="5" r="1.5" fill="#E8B58D" />

              {/* 碰撞动感线条与音符 */}
              <path d="M0 -15 L0 -22 M-12 -12 L-18 -17 M12 -12 L18 -17 M-14 6 L-20 10 M14 6 L20 10" stroke="#62AD78" strokeWidth="2" strokeLinecap="round" className="anim-sparkle" />
              <text x="-16" y="-26" fill="#3F8054" fontSize="12" fontWeight="bold">啪嗒！🤝</text>
            </g>
          </g>
        )}

        {/* =================================================================== */}
        {/* 【帧 3：一起欢呼鼓掌】 */}
        {/* =================================================================== */}
        {activeFrame === 2 && (
          <g id="frame-3-cheer" className="anim-clap">
            {/* 左侧：大人欢呼鼓掌 */}
            <g transform="translate(80, 50)">
              <path d="M20 135 C30 95, 75 85, 105 100 L115 155 Z" fill="#A8B9A0" stroke="#45433F" strokeWidth="1.5" />
              <ellipse cx="68" cy="55" rx="22" ry="26" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
              <path d="M48 45 Q68 32 88 42 C78 62, 58 62, 48 45 Z" fill="#45433F" />
              <ellipse cx="60" cy="52" rx="3.5" ry="2.5" fill="#45483F" />
              <ellipse cx="76" cy="52" rx="3.5" ry="2.5" fill="#45483F" />
              <path d="M62 64 Q68 74 74 64 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1" />
              <ellipse cx="54" cy="58" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />
              <ellipse cx="82" cy="58" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />

              {/* 大人双手在胸前鼓掌 */}
              <path d="M68 95 Q85 85 95 90" stroke="#E8B58D" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M68 100 Q85 105 95 98" stroke="#E8B58D" strokeWidth="8" strokeLinecap="round" fill="none" />
              <ellipse cx="96" cy="94" rx="6" ry="7" fill="#E8B58D" stroke="#45433F" strokeWidth="1" />
            </g>

            {/* 右侧：宝宝双脚踢踢，双手鼓掌 */}
            <g transform="translate(230, 60)">
              <path d="M30 150 Q45 165 70 158" stroke="#E8B58D" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path d="M20 115 C30 105, 55 105, 65 120 L60 155 L20 150 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1.2" />
              <ellipse cx="38" cy="90" rx="20" ry="22" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
              <ellipse cx="30" cy="88" rx="3" ry="4" fill="#45483F" />
              <ellipse cx="46" cy="88" rx="3" ry="4" fill="#45483F" />
              {/* 大笑口型 */}
              <path d="M32 98 Q38 107 44 98 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1" />
              <ellipse cx="24" cy="93" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />
              <ellipse cx="52" cy="93" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />

              {/* 宝宝双手鼓掌 */}
              <path d="M28 118 Q12 110 0 112" stroke="#E8B58D" strokeWidth="6" strokeLinecap="round" fill="none" />
              <circle cx="-2" cy="112" r="4.5" fill="#E8B58D" stroke="#45433F" strokeWidth="1" />
            </g>

            {/* 鼓掌音乐符与星星散落 */}
            <g className="anim-sparkle">
              <text x="180" y="100" fill="#E8B58D" fontSize="16">👏 🎶</text>
              <text x="190" y="130" fill="#3F8054" fontSize="13" fontWeight="bold">棒棒哒！</text>
              <path d="M170 120 L173 126 L180 127 L175 132 L176 138 L170 135 L164 138 L165 132 L160 127 L167 126 Z" fill="#F5CF65" />
            </g>
          </g>
        )}

        {/* =================================================================== */}
        {/* 【帧 4：微笑贴贴】 */}
        {/* =================================================================== */}
        {activeFrame === 3 && (
          <g id="frame-4-cuddle" className="anim-cuddle">
            {/* 核心贴贴造型 (大人怀抱宝宝，脸贴脸 x=200, y=140) */}
            <g transform="translate(130, 45)">
              {/* 大人躯干 */}
              <path d="M40 145 C50 115, 110 110, 140 125 L150 175 L30 175 Z" fill="#A8B9A0" stroke="#45433F" strokeWidth="1.5" />

              {/* 大人头部 (左侧，稍微倾斜) */}
              <g transform="translate(45, 45) rotate(12)">
                <ellipse cx="30" cy="35" rx="22" ry="26" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
                <path d="M10 25 Q30 12 50 22 C40 42, 20 42, 10 25 Z" fill="#45433F" />
                {/* 幸福新月弯弯眼 */}
                <path d="M18 36 Q23 32 28 36" stroke="#45433F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <path d="M22 46 Q28 52 34 46" stroke="#45433F" strokeWidth="1.5" fill="none" />
                <ellipse cx="14" cy="42" rx="5" ry="3" fill="#DFA39A" opacity="0.8" />
              </g>

              {/* 宝宝头部 (右侧，紧贴大人脸颊) */}
              <g transform="translate(95, 60) rotate(-8)">
                <ellipse cx="25" cy="25" rx="20" ry="22" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
                <path d="M20 5 Q24 -2 28 4 Q32 -2 35 5" stroke="#45433F" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* 幸福新月弯弯眼 */}
                <path d="M16 24 Q21 20 26 24" stroke="#45433F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <path d="M30 24 Q35 20 40 24" stroke="#45433F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <path d="M23 32 Q28 37 33 32" stroke="#45433F" strokeWidth="1.5" fill="none" />
                <ellipse cx="12" cy="28" rx="4.5" ry="3" fill="#DFA39A" opacity="0.85" />
                <ellipse cx="38" cy="28" rx="4.5" ry="3" fill="#DFA39A" opacity="0.85" />
              </g>

              {/* 怀抱手臂围成圆环 */}
              <path d="M35 140 Q85 165 145 135" stroke="#E8B58D" strokeWidth="11" strokeLinecap="round" fill="none" />
              <path d="M35 140 Q85 165 145 135" stroke="#A8B9A0" strokeWidth="9" strokeLinecap="round" fill="none" />
            </g>

            {/* 漂浮的小爱心与贴贴提示 */}
            <g className="anim-sparkle">
              <path d="M195 70 C195 65 190 60 185 65 C180 60 175 65 175 70 C175 78 185 84 185 86 C185 84 195 78 195 70 Z" fill="#DFA39A" />
              <path d="M225 60 C225 56 221 52 217 56 C213 52 209 56 209 60 C209 66 217 71 217 73 C217 71 225 66 225 60 Z" fill="#DFA39A" transform="scale(0.8)" />
              <text x="180" y="105" fill="#A85C52" fontSize="12" fontWeight="bold">暖暖贴贴 🥰</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

// 描述：大人怀抱宝宝坐在镜前，双手举起安全镜，大人做吐舌张眼鬼脸，宝宝看着镜中反射露出咯咯笑
// ============================================================================
export const MirrorFaceIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg viewBox="0 0 400 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="照镜子做鬼脸轻拟真绘本动画">
      <defs>
        <style>{`
          @keyframes adultPeek {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-3deg) translateY(-2px); }
          }
          @keyframes babyBounce {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-4px) rotate(2deg); }
          }
          @keyframes mirrorGlint {
            0%, 100% { opacity: 0.3; transform: translateX(-10px); }
            50% { opacity: 0.7; transform: translateX(15px); }
          }
          @keyframes tonguePop {
            0%, 100% { transform: scale(0.9); }
            50% { transform: scale(1.15) translateY(1px); }
          }
          .anim-adult { animation: adultPeek 3.5s ease-in-out infinite; transform-origin: 120px 140px; }
          .anim-baby { animation: babyBounce 2.8s ease-in-out infinite; transform-origin: 180px 150px; }
          .anim-glint { animation: mirrorGlint 3s ease-in-out infinite; }
          .anim-tongue { animation: tonguePop 1.8s ease-in-out infinite; transform-origin: 130px 96px; }
        `}</style>
        <clipPath id="mirror-clip">
          <ellipse cx="270" cy="110" rx="55" ry="70" />
        </clipPath>
        <linearGradient id="mirror-glare" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#A9BFCC" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* 1. 房间墙面与木质地板背景 */}
      <rect x="0" y="0" width="400" height="180" fill="#FAF7F2" />
      <rect x="0" y="180" width="400" height="60" fill="#F1EAE0" />
      <line x1="0" y1="180" x2="400" y2="180" stroke="#858078" strokeWidth="1" strokeOpacity="0.3" />
      
      {/* 2. 鼠尾草绿地毯 */}
      <ellipse cx="200" cy="200" rx="160" ry="25" fill="#A8B9A0" opacity="0.35" />

      {/* 3. 大人角色 (妈妈/爸爸 - 怀抱姿势) */}
      <g className="anim-adult">
        {/* 大人发型 (后发) */}
        <path d="M75 80 C60 100, 65 140, 80 160 L140 160 C155 130, 150 90, 135 80 Z" fill="#45433F" />

        {/* 大人躯干与衣服 */}
        <path d="M70 145 C80 130, 110 125, 140 130 L160 210 L60 210 Z" fill="#A8B9A0" stroke="#45433F" strokeWidth="1.5" strokeLinejoin="round" />
        
        {/* 大人颈部 */}
        <rect x="105" y="105" width="18" height="20" rx="6" fill="#E8B58D" />

        {/* 大人面部 */}
        <ellipse cx="114" cy="90" rx="26" ry="30" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />

        {/* 大人前额刘海 */}
        <path d="M90 75 Q114 60 138 72 Q125 90 90 75 Z" fill="#45433F" />

        {/* 大人五官 */}
        {/* 眼睛与睫毛 */}
        <ellipse cx="104" cy="88" rx="3" ry="4" fill="#45433F" />
        <ellipse cx="124" cy="88" rx="3" ry="4" fill="#45433F" />
        <circle cx="105" cy="87" r="1" fill="#FAF7F2" />
        <circle cx="125" cy="87" r="1" fill="#FAF7F2" />
        <path d="M100 82 Q104 80 108 82" stroke="#45433F" strokeWidth="1.2" fill="none" />
        <path d="M120 82 Q124 80 128 82" stroke="#45433F" strokeWidth="1.2" fill="none" />

        {/* 鼻子 */}
        <path d="M113 90 Q116 94 113 96" stroke="#858078" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* 面部表情：做鬼脸吐舌头 */}
        <path d="M106 100 Q114 108 122 100" stroke="#45433F" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path className="anim-tongue" d="M111 101 C111 107, 117 107, 117 101 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1" />

        {/* 腮红 */}
        <ellipse cx="98" cy="95" rx="5" ry="3" fill="#DFA39A" opacity="0.6" />
        <ellipse cx="130" cy="95" rx="5" ry="3" fill="#DFA39A" opacity="0.6" />

        {/* 大人手臂（怀抱宝宝并持镜） */}
        <path d="M75 140 Q110 160 165 145" stroke="#E8B58D" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M75 140 Q110 160 165 145" stroke="#A8B9A0" strokeWidth="10" strokeLinecap="round" fill="none" />
        {/* 大人手掌结构 */}
        <ellipse cx="168" cy="144" rx="7" ry="6" fill="#E8B58D" />
      </g>

      {/* 4. 宝宝角色 (6-8月龄，坐在大人怀里) */}
      <g className="anim-baby">
        {/* 宝宝腿部连体衣 */}
        <path d="M150 170 Q170 190 200 180" stroke="#E8B58D" strokeWidth="10" strokeLinecap="round" fill="none" />
        {/* 宝宝脚丫 */}
        <ellipse cx="204" cy="180" rx="6" ry="4" fill="#E8B58D" />
        <circle cx="208" cy="178" r="1.2" fill="#E8B58D" />
        <circle cx="206" cy="176" r="1" fill="#E8B58D" />

        {/* 宝宝身体连体衣 */}
        <path d="M145 145 C155 135, 185 135, 195 150 L190 180 L145 175 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1.2" />

        {/* 宝宝脖子与小领口 */}
        <path d="M158 136 Q168 142 178 136" stroke="#FAF7F2" strokeWidth="3" fill="none" />

        {/* 宝宝头部 (1:3 萌系比例) */}
        <ellipse cx="168" cy="115" rx="22" ry="24" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />

        {/* 宝宝发型 (头顶呆萌小毛发) */}
        <path d="M165 91 Q168 83 172 89 Q175 80 178 90" stroke="#45433F" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* 宝宝五官：大黑睛好奇注视 */}
        <ellipse cx="160" cy="114" rx="3.5" ry="4.5" fill="#45433F" />
        <ellipse cx="176" cy="114" rx="3.5" ry="4.5" fill="#45433F" />
        <circle cx="161.5" cy="112.5" r="1.2" fill="#FAF7F2" />
        <circle cx="177.5" cy="112.5" r="1.2" fill="#FAF7F2" />
        <path d="M156 107 Q160 105 164 107" stroke="#45433F" strokeWidth="1" fill="none" />
        <path d="M172 107 Q176 105 180 107" stroke="#45433F" strokeWidth="1" fill="none" />

        {/* 小鼻子 */}
        <circle cx="168" cy="118" r="1" fill="#858078" />

        {/* 宝宝开心笑嘴 */}
        <path d="M162 124 Q168 131 174 124 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1" />

        {/* 宝宝圆鼓鼓腮红 */}
        <ellipse cx="154" cy="120" rx="4.5" ry="3" fill="#DFA39A" opacity="0.65" />
        <ellipse cx="182" cy="120" rx="4.5" ry="3" fill="#DFA39A" opacity="0.65" />

        {/* 宝宝手臂伸向镜子 */}
        <path d="M182 145 Q210 135 225 125" stroke="#E8B58D" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* 宝宝小抓握手掌 (5指微张) */}
        <circle cx="227" cy="124" r="4" fill="#E8B58D" />
        <circle cx="229" cy="121" r="1" fill="#E8B58D" />
        <circle cx="231" cy="123" r="1" fill="#E8B58D" />
        <circle cx="230" cy="126" r="1" fill="#E8B58D" />
      </g>

      {/* 5. 镜子与反射画面（核心道具与手部接触关系） */}
      <g id="mirror-group">
        {/* 镜子手柄与边缘手持 */}
        <path d="M250 170 L235 200" stroke="#E8B58D" strokeWidth="8" strokeLinecap="round" />
        
        {/* 镜框木质外轮廓 */}
        <ellipse cx="270" cy="110" rx="60" ry="75" fill="#E8B58D" stroke="#45433F" strokeWidth="2" />
        <ellipse cx="270" cy="110" rx="55" ry="70" fill="#A9BFCC" />

        {/* 镜面反射图像 (Clip-path 限制在镜面内) */}
        <g clipPath="url(#mirror-clip)">
          <rect x="210" y="35" width="120" height="150" fill="#E8B58D" opacity="0.15" />
          
          {/* 镜中反射：大人的笑脸鬼脸 */}
          <ellipse cx="255" cy="95" rx="18" ry="22" fill="#E8B58D" stroke="#45433F" strokeWidth="1" />
          <ellipse cx="250" cy="93" rx="2" ry="3" fill="#45483F" />
          <ellipse cx="262" cy="93" rx="2" ry="3" fill="#45483F" />
          <path d="M251 103 Q256 109 261 103" stroke="#45483F" strokeWidth="1.2" fill="none" />
          <path d="M254 104 Q256 109 258 104" fill="#DFA39A" />

          {/* 镜中反射：宝宝兴奋的笑脸 */}
          <ellipse cx="285" cy="120" rx="16" ry="18" fill="#E8B58D" stroke="#45433F" strokeWidth="1" />
          <circle cx="280" cy="118" r="2" fill="#45483F" />
          <circle cx="290" cy="118" r="2" fill="#45483F" />
          <path d="M280 125 Q285 130 290 125 Z" fill="#DFA39A" />

          {/* 镜面反光流光线 */}
          <line className="anim-glint" x1="230" y1="60" x2="310" y2="160" stroke="url(#mirror-glare)" strokeWidth="16" strokeLinecap="round" />
        </g>

        {/* 大人握持镜子边缘的手指 */}
        <path d="M212 110 Q215 102 222 108" stroke="#E8B58D" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M213 120 Q217 114 223 118" stroke="#E8B58D" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

// ============================================================================
// 样例 2：抓握动作类 - act-08【小手抓大球】
// 描述：宝宝趴/坐在地毯上，双手张开抓握滚来的彩色软球，大人在对面微笑着推球互动
// ============================================================================
export const BallGraspIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg viewBox="0 0 400 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="小手抓大球轻拟真绘本动画">
      <defs>
        <style>{`
          @keyframes ballRoll {
            0% { transform: translateX(-15px) rotate(0deg); }
            50% { transform: translateX(12px) rotate(45deg); }
            100% { transform: translateX(-15px) rotate(0deg); }
          }
          @keyframes babyReach {
            0%, 100% { transform: translateX(0px) rotate(0deg); }
            50% { transform: translateX(-6px) rotate(-2deg); }
          }
          @keyframes adultGuide {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          .anim-ball { animation: ballRoll 3.2s ease-in-out infinite; transform-origin: 200px 145px; }
          .anim-baby-reach { animation: babyReach 3.2s ease-in-out infinite; transform-origin: 280px 140px; }
          .anim-adult-guide { animation: adultGuide 3.2s ease-in-out infinite; transform-origin: 80px 120px; }
        `}</style>
      </defs>

      {/* 1. 居家温馨木地板 */}
      <rect x="0" y="0" width="400" height="175" fill="#FAF7F2" />
      <rect x="0" y="175" width="400" height="65" fill="#F1EAE0" />
      <line x1="0" y1="175" x2="400" y2="175" stroke="#858078" strokeWidth="1" strokeOpacity="0.3" />

      {/* 2. 圆形暖黄编织地毯 */}
      <ellipse cx="200" cy="190" rx="170" ry="30" fill="#A8B9A0" opacity="0.3" />

      {/* 3. 大人侧（左侧，俯身推球指导） */}
      <g className="anim-adult-guide">
        {/* 大人盘腿躯干 */}
        <path d="M20 185 C30 140, 70 120, 100 135 L120 195 Z" fill="#A9BFCC" stroke="#45433F" strokeWidth="1.5" />
        
        {/* 大人头部 */}
        <ellipse cx="75" cy="85" rx="22" ry="26" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
        <path d="M55 75 Q75 60 95 72 C85 95, 65 95, 55 75 Z" fill="#45433F" />

        {/* 五官：温和注视宝宝 */}
        <ellipse cx="82" cy="84" rx="2.5" ry="3.5" fill="#45483F" />
        <circle cx="83" cy="83" r="0.8" fill="#FAF7F2" />
        <path d="M78 79 Q82 77 86 79" stroke="#45483F" strokeWidth="1" fill="none" />
        <path d="M80 92 Q85 97 90 92" stroke="#45483F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="86" cy="89" rx="4" ry="2.5" fill="#DFA39A" opacity="0.5" />

        {/* 大人伸出的双手（推球轨迹） */}
        <path d="M85 135 Q120 145 155 150" stroke="#E8B58D" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M85 135 Q120 145 155 150" stroke="#A9BFCC" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* 手掌推球轮廓 */}
        <ellipse cx="158" cy="151" rx="6" ry="5" fill="#E8B58D" />
      </g>

      {/* 4. 核心道具：10cm 彩色拼接软质布球 (具有旋转滚动动画) */}
      <g className="anim-ball">
        {/* 阴影 */}
        <ellipse cx="200" cy="178" rx="28" ry="7" fill="#858078" opacity="0.3" />

        {/* 球体主轮廓 */}
        <circle cx="200" cy="148" r="30" fill="#DFA39A" stroke="#45433F" strokeWidth="1.8" />

        {/* 布球色块拼接 (北欧配色：鼠尾草绿、灰蓝、暖橘) */}
        <path d="M200 118 A30 30 0 0 0 170 148 L200 148 Z" fill="#A8B9A0" />
        <path d="M200 148 L230 148 A30 30 0 0 0 200 118 Z" fill="#A9BFCC" />
        <path d="M170 148 A30 30 0 0 0 200 178 L200 148 Z" fill="#E8B58D" />

        {/* 球面接缝针脚缝线细节 */}
        <path d="M170 148 Q200 148 230 148" stroke="#FAF7F2" strokeWidth="1.5" strokeDasharray="3,3" />
        <path d="M200 118 Q200 148 200 178" stroke="#FAF7F2" strokeWidth="1.5" strokeDasharray="3,3" />
      </g>

      {/* 5. 宝宝侧 (右侧，双手向前抱抓大球) */}
      <g className="anim-baby-reach">
        {/* 宝宝腿部坐在垫子上 */}
        <path d="M290 175 Q310 188 335 180" stroke="#E8B58D" strokeWidth="11" strokeLinecap="round" fill="none" />
        <ellipse cx="338" cy="180" rx="6" ry="4.5" fill="#E8B58D" />

        {/* 宝宝躯干 */}
        <path d="M270 135 C280 125, 310 125, 320 140 L315 178 L270 175 Z" fill="#E8B58D" stroke="#45433F" strokeWidth="1.2" />

        {/* 宝宝领口 */}
        <path d="M276 130 Q284 135 292 130" stroke="#FAF7F2" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* 宝宝头部 */}
        <ellipse cx="282" cy="108" rx="21" ry="23" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />

        {/* 宝宝呆萌发型 */}
        <path d="M278 85 Q282 78 286 84 Q290 77 293 85" stroke="#45433F" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* 五官：专注注视大球、嘴巴张开喜悦 */}
        <ellipse cx="273" cy="107" rx="3.5" ry="4.5" fill="#45483F" />
        <ellipse cx="288" cy="107" rx="3.5" ry="4.5" fill="#45483F" />
        <circle cx="271.5" cy="105.5" r="1.2" fill="#FAF7F2" />
        <circle cx="286.5" cy="105.5" r="1.2" fill="#FAF7F2" />

        <circle cx="280" cy="112" r="1" fill="#858078" />

        {/* 张嘴欢呼发声 O 型口型 */}
        <ellipse cx="280" cy="119" rx="3.5" ry="4.5" fill="#DFA39A" stroke="#45433F" strokeWidth="1" />

        {/* 腮红 */}
        <ellipse cx="268" cy="113" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />
        <ellipse cx="293" cy="113" rx="4" ry="2.5" fill="#DFA39A" opacity="0.6" />

        {/* 双手向左延伸包裹球体（核心抓握动作结构） */}
        {/* 左手臂 */}
        <path d="M272 136 Q245 138 226 142" stroke="#E8B58D" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* 右手臂 */}
        <path d="M278 142 Q250 148 228 152" stroke="#E8B58D" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* 宝宝双手5指张开抱球控制结构 */}
        <g id="baby-left-hand">
          <circle cx="225" cy="142" r="4.5" fill="#E8B58D" />
          <path d="M222 138 C220 135, 217 137, 220 140" stroke="#E8B58D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M221 142 C218 140, 216 143, 219 144" stroke="#E8B58D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M222 145 C219 145, 218 148, 221 147" stroke="#E8B58D" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <g id="baby-right-hand">
          <circle cx="227" cy="152" r="4.5" fill="#E8B58D" />
          <path d="M224 149 C221 147, 220 150, 222 151" stroke="#E8B58D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M223 154 C220 153, 220 156, 223 155" stroke="#E8B58D" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
};

// ============================================================================
// 样例 3：物体观察/遮挡类 - act-05【寻找躲猫猫】
// 描述：大人用透气柔和纱巾轻轻挡住玩偶熊，宝宝低头专注掀开纱巾，露出隐藏玩偶并发出惊喜笑容
// ============================================================================
export const PeekabooIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg viewBox="0 0 400 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="寻找躲猫猫轻拟真绘本动画">
      <defs>
        <style>{`
          @keyframes scarfLift {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.85; }
            50% { transform: translateY(-16px) rotate(-6deg); opacity: 0.65; }
          }
          @keyframes babyPeek {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-4px) rotate(-3deg); }
          }
          @keyframes bearSurprise {
            0%, 100% { transform: scale(0.95); }
            50% { transform: scale(1.08) translateY(-2px); }
          }
          .anim-scarf { animation: scarfLift 3.6s ease-in-out infinite; transform-origin: 200px 120px; }
          .anim-baby-peek { animation: babyPeek 3.6s ease-in-out infinite; transform-origin: 110px 130px; }
          .anim-bear { animation: bearSurprise 3.6s ease-in-out infinite; transform-origin: 210px 140px; }
        `}</style>
      </defs>

      {/* 1. 房间墙面与柔和木地板 */}
      <rect x="0" y="0" width="400" height="170" fill="#FAF7F2" />
      <rect x="0" y="170" width="400" height="70" fill="#F1EAE0" />
      <line x1="0" y1="170" x2="400" y2="170" stroke="#858078" strokeWidth="1" strokeOpacity="0.3" />

      {/* 2. 北欧米黄色软地毯 */}
      <ellipse cx="200" cy="190" rx="165" ry="28" fill="#F1EAE0" stroke="#E8B58D" strokeWidth="1" strokeDasharray="4,4" />

      {/* 3. 大人侧（右侧，倾身鼓励掀开） */}
      <g transform="translate(260, 55)">
        <path d="M40 130 C50 90, 80 80, 110 95 L120 155 Z" fill="#A8B9A0" stroke="#45433F" strokeWidth="1.5" />
        <ellipse cx="75" cy="55" rx="20" ry="24" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />
        <path d="M58 48 Q75 35 92 45 C82 65, 62 65, 58 48 Z" fill="#45433F" />

        <ellipse cx="70" cy="54" rx="2.5" ry="3.5" fill="#45483F" />
        <circle cx="71" cy="53" r="0.8" fill="#FAF7F2" />
        <path d="M66 49 Q70 47 74 49" stroke="#45483F" strokeWidth="1" fill="none" />
        <path d="M67 62 Q72 67 77 62" stroke="#45483F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="74" cy="59" rx="3.5" ry="2" fill="#DFA39A" opacity="0.5" />

        {/* 大人手指轻扶边角 */}
        <path d="M60 95 Q30 105 -10 105" stroke="#E8B58D" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M60 95 Q30 105 -10 105" stroke="#A8B9A0" strokeWidth="5" strokeLinecap="round" fill="none" />
        <ellipse cx="-12" cy="105" rx="5" ry="4" fill="#E8B58D" />
      </g>

      {/* 4. 隐藏的惊喜：毛绒小熊玩偶 (Bear Toy) */}
      <g className="anim-bear" transform="translate(185, 110)">
        <ellipse cx="25" cy="45" rx="22" ry="18" fill="#E8B58D" stroke="#45433F" strokeWidth="1.2" />
        {/* 熊耳朵 */}
        <circle cx="10" cy="12" r="7" fill="#E8B58D" stroke="#45433F" strokeWidth="1.2" />
        <circle cx="10" cy="12" r="4" fill="#DFA39A" />
        <circle cx="40" cy="12" r="7" fill="#E8B58D" stroke="#45433F" strokeWidth="1.2" />
        <circle cx="40" cy="12" r="4" fill="#DFA39A" />

        {/* 熊头 */}
        <circle cx="25" cy="22" r="17" fill="#E8B58D" stroke="#45433F" strokeWidth="1.2" />
        <ellipse cx="25" cy="25" rx="7" ry="5" fill="#FAF7F2" />
        <circle cx="25" cy="23" r="2" fill="#45483F" />
        <path d="M25 25 L25 27 Q23 29 21 28 M25 27 Q27 29 29 28" stroke="#45483F" strokeWidth="1" fill="none" />
        <circle cx="19" cy="21" r="2" fill="#45483F" />
        <circle cx="31" cy="21" r="2" fill="#45483F" />
      </g>

      {/* 5. 核心遮挡物：灰蓝天蓝色轻薄透气纱巾 (具有升起/掀开动画) */}
      <g className="anim-scarf">
        <path
          d="M160 115 C180 100, 230 100, 250 118 C260 135, 240 165, 210 162 C180 160, 150 145, 160 115 Z"
          fill="#A9BFCC"
          fillOpacity="0.75"
          stroke="#45433F"
          strokeWidth="1.2"
          strokeDasharray="4,2"
        />
        {/* 纱巾褶皱纹理 */}
        <path d="M175 125 Q205 120 235 130" stroke="#FAF7F2" strokeWidth="1.5" fill="none" opacity="0.8" />
        <path d="M170 140 Q200 138 230 148" stroke="#FAF7F2" strokeWidth="1.5" fill="none" opacity="0.8" />
      </g>

      {/* 6. 宝宝侧（左侧，伸手主动掀开纱巾，露脸惊喜） */}
      <g className="anim-baby-peek">
        {/* 宝宝腿部 */}
        <path d="M80 170 Q60 185 35 178" stroke="#E8B58D" strokeWidth="10" strokeLinecap="round" fill="none" />
        <ellipse cx="32" cy="178" rx="5.5" ry="4" fill="#E8B58D" />

        {/* 宝宝躯干连体衣 */}
        <path d="M90 130 C80 120, 50 120, 40 135 L45 175 L90 170 Z" fill="#A8B9A0" stroke="#45433F" strokeWidth="1.2" />

        {/* 宝宝领口 */}
        <path d="M80 125 Q72 130 64 125" stroke="#FAF7F2" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* 宝宝头部 */}
        <ellipse cx="76" cy="102" rx="20" ry="22" fill="#E8B58D" stroke="#45433F" strokeWidth="1.5" />

        {/* 宝宝发型 */}
        <path d="M72 80 Q76 73 80 79 Q84 72 87 80" stroke="#45433F" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* 宝宝五官：大睁眼睛、惊喜露笑容 */}
        <ellipse cx="70" cy="100" rx="3.5" ry="4.5" fill="#45483F" />
        <ellipse cx="84" cy="100" rx="3.5" ry="4.5" fill="#45483F" />
        <circle cx="68.5" cy="98.5" r="1.2" fill="#FAF7F2" />
        <circle cx="82.5" cy="98.5" r="1.2" fill="#FAF7F2" />

        <circle cx="77" cy="105" r="1" fill="#858078" />

        {/* 惊喜发声张嘴 */}
        <path d="M72 112 Q77 119 82 112 Z" fill="#DFA39A" stroke="#45433F" strokeWidth="1" />

        {/* 腮红 */}
        <ellipse cx="64" cy="107" rx="4" ry="2.5" fill="#DFA39A" opacity="0.65" />
        <ellipse cx="89" cy="107" rx="4" ry="2.5" fill="#DFA39A" opacity="0.65" />

        {/* 宝宝伸出小手捏住纱巾角掀开 (关键动作表达) */}
        <path d="M82 132 Q120 122 158 116" stroke="#E8B58D" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        {/* 小手指捏住纱巾 */}
        <circle cx="160" cy="116" r="4" fill="#E8B58D" />
        <path d="M158 113 Q162 112 163 115" stroke="#45433F" strokeWidth="1" fill="none" />
      </g>
    </svg>
  );
};

/**
 * 通用活动动画映射器 (根据活动 ID 或分类返回轻拟真绘本插画)
 */
export const getActivityIllustration = (activityId: string, category: string) => {
  if (activityId === 'act-04' || category.includes('社会') || category.includes('情绪') || category.includes('语言')) {
    return <FourFrameInteractiveIllustration />;
  }
  if (activityId === 'act-08') {
    return <BallGraspIllustration />;
  }
  if (activityId === 'act-05') {
    return <PeekabooIllustration />;
  }

  // 默认根据分类返回四大核心模组之一作为优雅兜底
  if (category.includes('精细')) {
    return <BallGraspIllustration />;
  }
  if (category.includes('感官') || category.includes('认知')) {
    return <PeekabooIllustration />;
  }
  return <FourFrameInteractiveIllustration />;
};
