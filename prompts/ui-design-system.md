# 玩伴日历 UI 设计规范与交互规则 (V1.0)

### 一、交互逻辑修复（点击开玩拦截）
1. **档案校验逻辑**：
   - 用户点击“直接开玩”按钮时进行校验。
   - 若本地（localStorage）无宝宝档案数据，严禁直接进入游戏页面。
   - 拦截并自动唤起“完善宝宝档案”半模态弹窗，提示：“请先填入宝宝信息，以便为你匹配适龄玩法与生成打卡海报”。
   - 建档成功后，重新计算匹配月龄并自动进入今日游戏。

### 二、全局视觉风格（Design System）重构
1. **色彩与质感体系**：
   - 全局背景：温暖柔和的奶白/米黄色调（`#FAF8F5`），去除生硬冷白。
   - 文本配色：主标题深暖咖色（`#2C221E`），辅助与次级说明文字柔和燕麦暖灰（`#786F6A`），禁用纯黑 `#000000`。
   - 辅助功能标签：马卡龙微透胶囊色（感官认知：淡薄荷绿；大运动：柔鹅黄；精细动作：暖珊瑚粉）。
   - 阴影与边框：扩散式暖调微阴影（`0 10px 30px -10px rgba(234, 138, 92, 0.08)`）。
2. **圆角与空间节奏**：
   - 容器与卡片统一大圆角（`rounded-3xl`，约 24px - 28px）。
   - 按钮与标签统一胶囊形或丰润中圆角（`rounded-2xl` / `rounded-full`）。
3. **核心模块重做**：
   - 顶部未建档栏：重构为“定制礼包卡”，暖色渐变底色配微光泽。
   - 主玩法推荐卡片：封面增强场景感，属性（耗时、材料）抽离为图标小胶囊，高亮核心育儿价值点。
   - 核心行动按钮：暖日落橙微渐变（`from-orange-400 to-amber-500`），主副文案排版（主：“开始 5 分钟游戏”，副：“免准备 · 随手即玩”）。
   - 底部导航栏：磨砂毛玻璃半透明（`backdrop-blur-md bg-white/85`），选中态配小圆点指示。

---

# 玩伴日历 Design System & 交互规范 (V1.1)

### 一、全局设计基底与色彩收敛 (Global Base & Color Tokens)
1. **背景底色**：
   - 全局背景统一采用暖米白底色（`bg-[#FFFDF9]` / `stone-50`），彻底摒弃生冷纯白与高饱和黄色。
2. **文字阶梯**：
   - 主标题：`text-stone-900 font-bold`（深暖石墨黑，温润清晰）
   - 正文与说明：`text-stone-600`（温和舒适可读性）
   - 时间/辅助信息：`text-stone-400 text-xs`
3. **领域标签系统（马卡龙柔色胶囊）**：
   - 统一尺寸：`rounded-full px-2 py-0.5 text-[11px] font-medium border`
   - 大运动（橙）：`bg-orange-50 text-orange-700 border-orange-200/60`
   - 精细动作（黄/琥珀）：`bg-amber-50 text-amber-800 border-amber-200/60`
   - 感官认知（绿）：`bg-emerald-50 text-emerald-700 border-emerald-200/60`
   - 语言社交（蓝）：`bg-sky-50 text-sky-700 border-sky-200/60`
   - 社会情绪（紫）：`bg-purple-50 text-purple-700 border-purple-200/60`

---

### 二、卡片与列表组件全面并轨 (Component Unification)
1. **通用活动卡片（ActivityItemCard）**：
   - **复用范围**：首页底部备选推荐卡与【活动宝库】列表卡全面统一复用。
   - **布局结构**：统一为“左图右文·绘本杂志规范”。
     * 左侧插画封面：`w-[76px] h-[76px] rounded-2xl overflow-hidden bg-amber-50/80 flex-shrink-0 flex items-center justify-center border border-amber-100/50 shadow-xs`
     * 右侧精炼呈现：
       - 顶行：玩法标题（`text-stone-900 font-bold text-sm truncate`） + 极简耗时（`⏱ 5分`，`text-xs text-stone-400`）
       - 中行：一句话核心发育启发亮点（`text-xs text-stone-600 line-clamp-1`）
       - 底行：柔色马卡龙领域徽章 + 适龄月龄胶囊
   - **交互原则**：整卡均为点击热区，彻底移除宝库卡片中冗余的“开始玩”橙色按键与分割横线。
2. **成长足迹卡片（RecordCard）**：
   - **左侧时光徽章**：`rounded-2xl w-12 h-12 bg-amber-100/60 flex items-center justify-center text-amber-800 text-lg shrink-0`
   - **右上角时间戳**：`text-xs text-stone-400 font-medium`（如 `10月28日 · 5分钟`）
   - **去伪存真**：彻底移除“✓已打卡”字样徽章。
   - **动态评语便签**：
     * 无真实手记时：严禁展示占位长句或空便签气泡，卡片高度紧凑自适应，右下角提供次级引导 `✏️ 补写手记`。
     * 有真实手记时：展示温暖奶黄随笔便签（`bg-amber-50/80 rounded-xl p-2.5 text-xs text-stone-600 border border-amber-100/50`）。

---

### 三、弹窗双按钮系统规范 (Modal Action Button Standard)
陪玩弹窗（CoachModeModal）与打卡记录弹窗（PlayFeedbackModal）底部双按钮严格并轨：
1. **主操作按钮（Primary Action）**：
   - **容器规范**：`w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all`
   - **陪玩弹窗文案**：`🎉 完成陪伴，去打卡`
   - **打卡弹窗文案**：`✓ 记录这次陪伴`（严格单对勾规范）
2. **次操作按钮（Secondary Action）**：
   - **容器规范**：`w-full h-11 rounded-2xl bg-stone-50/70 hover:bg-stone-100 text-stone-600 border border-stone-200/50 text-xs font-medium flex items-center justify-center gap-1.5 mt-2.5 active:scale-[0.99] transition-all`
   - **陪玩弹窗文案**：`稍后再玩 · 保存进度`
   - **打卡弹窗文案**：`📷 生成拍立得手账海报`

---

### 四、去营销感与去骚扰化规范 (Calm & Respectful UX)
1. **宝宝档案（ProfileView）**：
   - 彻底移除大阴影 VIP 营销横幅；
   - 会员身份降维收敛为宝宝昵称右侧的精致内嵌标签（`👑 VIP年卡`）；
   - 保存反馈：采用非阻塞的顶部轻量浮动 Toast 提示（1.5秒自动淡出），严禁挤压或位移表单 DOM。
2. **活动宝库（LibraryView）**：
   - 搜索栏右侧移除突兀的 “👑 VIP” 按钮框，搜索输入框全宽铺满。
3. **陪玩弹窗（CoachModeModal）顶栏防爆框**：
   - 计时器暂停时：图标切换 `⏸` 到 `▶`，数字保持 `00:23` 呼吸动效，严禁在胶囊内追加汉字（如“【已暂停】”）；
   - 顶栏所有子项强制声明 `whitespace-nowrap flex-shrink-0`，杜绝折行变形。
4. **未建档状态（!activeProfile）**：
   - 隐藏右下角悬浮时钟挂件；
   - 保持全宽 Hero 推荐卡片标准骨架，移除“本次启蒙重点”框与封面右上角“换一个”按钮。

---

### 五、品牌标语（Brand Slogan）体系
1. **首页顶部副标**：`每天轻松找玩法 · 真正陪孩子玩一会儿`（`text-xs text-stone-500/80`）
2. **成长足迹空状态**：`真正陪孩子玩一会儿，在这里留下珍贵的成长片段吧`
3. **宝宝档案底端初心**：`玩伴日历 · 帮家长每天轻松陪玩的小工具`（`text-[11px] text-stone-400`）

