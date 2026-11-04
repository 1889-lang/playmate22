# 玩伴日历 UI 视觉设计规范与交互规则 (V2.0)

## 一、产品视觉定位与设计目标

### 1.1 视觉定位
**自然绘本风 × 北欧生活方式 × 明亮鲜活的生命力**

使年轻父母和家庭长辈打开产品时感受到：
- **温暖、自然、轻松、有生命力**：犹如和宝宝一起探索世界的小花园。
- **品质感与轻盈感**：去商业化、去营销感、去骚扰化，摒弃保险与广告促销式的强刺激视觉。
- **直觉可读与无门槛**：全人群（包括长辈）都能毫秒级轻松理解并流畅使用。

### 1.2 颜色主次比例 (60 - 30 - 10 法则)
- **60% 主画布背景**：阳光奶油白（`#FAF9F2`）与纯净白色（`#FFFFFF`），保持整体明亮透气。
- **30% 结构与分区**：浅植物绿（`#EDF4E9`）、自然深灰（`#45483F`）与柔和灰（`#85877B`），构建层次分明而温润的容器与文本。
- **10% 品牌与高亮**：鲜活植物绿（`#62AD78`）作为主品牌色与核心操作点，辅助珊瑚/阳光黄/晴空蓝/柔和粉作为语义化微强调。

---

## 二、完整颜色体系 (Color Palette Tokens)

| 角色 | 颜色名称 | HEX 色值 | Tailwind / CSS Token | 核心使用场景 |
|---|---|---|---|---|
| **页面主背景** | 阳光奶油白 | `#FAF9F2` | `bg-[#FAF9F2]` | 全局页面背景、模态框底层 |
| **品牌主色** | 鲜活植物绿 | `#62AD78` | `bg-[#62AD78]` / `text-[#62AD78]` | 品牌标识、主行动按钮（Primary）、选中导航 |
| **品牌深色** | 森林绿 | `#3F8054` | `bg-[#3F8054]` / `text-[#3F8054]` | 按钮 Hover/Active 悬停态、深绿文字 |
| **辅助色 1** | 活力珊瑚 | `#F17D70` | `bg-[#F17D70]` / `text-[#F17D70]` | 情绪反馈、少量暖意强调 |
| **辅助色 2** | 阳光黄 | `#F5CF65` | `bg-[#F5CF65]` / `text-[#F5CF65]` | 贴士徽章、小面积装饰 |
| **辅助色 3** | 晴空蓝 | `#8DC6D5` | `bg-[#8DC6D5]` / `text-[#8DC6D5]` | 探索类内容、辅助说明 |
| **辅助色 4** | 柔和粉 | `#E9A9B0` | `bg-[#E9A9B0]` / `text-[#E9A9B0]` | 亲子互动、情绪与喜好场景 |
| **卡片背景** | 温暖白 | `#FFFFFF` | `bg-white` | 各种功能与内容卡片背景 |
| **柔和分区** | 浅植物绿 | `#EDF4E9` | `bg-[#EDF4E9]` | 轻量内容分区、次级按钮背景 |
| **主要文字** | 自然深灰 | `#45483F` | `text-[#45483F]` | 页面标题、主卡片标题、正文 |
| **次要文字** | 柔和灰 | `#85877B` | `text-[#85877B]` | 副标题、时间戳、辅助说明文案 |

### 2.1 颜色使用硬性禁忌
- **禁止纯黑 `#000000`**：统一使用自然深灰 `#45483F`，避免视觉刺眼。
- **禁止高饱和霸屏大橙条/大红条**：植物绿取代橙色作为主要操作色。
- **禁止脏橙色、灰黄色与大面积深棕**：确保界面干净透亮。
- **禁止荧光色与无语义色彩堆叠**：标签颜色需有明确的月龄或分类语义。

---

## 三、组件设计规范 (Component Specifications)

### 3.1 3 级按钮设计规范（严禁通栏霸屏）

1. **Primary（主行动点）**：
   - **应用场景**：首页【开始陪伴】、档案页【保存完成】、打卡页【保存手账相片】、陪玩【结束陪伴】等核心提交点。
   - **尺寸与对齐**：高度统一 `h-11`（约 44px 舒适防误触），宽度居中胶囊 `w-3/5 max-w-[200px] mx-auto`。
   - **样式类**：`bg-[#62AD78] hover:bg-[#3F8054] text-white font-medium text-sm rounded-full shadow-xs active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer`

2. **Secondary（次级/完成态操作）**：
   - **应用场景**：首页【去活动宝库浏览】、打卡【仅完成打卡】、陪玩【稍后再玩】。
   - **尺寸与对齐**：`h-10 px-5 rounded-full font-medium text-xs`，自适应内容宽度。
   - **样式类**：`bg-[#EDF4E9] text-[#3F8054] border border-[#62AD78]/30 hover:bg-[#62AD78]/10 active:scale-95 flex items-center justify-center transition-all cursor-pointer`

3. **Ghost / Link（轻量文本链接）**：
   - **应用场景**：【暂不建档，返回继续】、【跳过】、【查看全部】。
   - **样式类**：`text-[#85877B] hover:text-[#45483F] text-xs py-1.5 transition-colors cursor-pointer`

### 3.2 卡片与列表规范 (Card Standard)
- **通用卡片容器**：大圆角 `rounded-3xl` 或 `rounded-2xl`，背景 `bg-white`，轻量暖边框 `border border-[#F1EAE0]`，微阴影 `shadow-xs`。
- **活动列表卡片（ActivityItemCard）**：
  - 左侧插画：`w-16 h-16 rounded-xl bg-[#EDF4E9]/60 flex-shrink-0 flex items-center justify-center`
  - 右侧标题：`text-[#45483F] font-bold text-sm truncate`
  - 试玩耗时与适龄：`text-xs text-[#85877B]` Clean Inline Text。

### 3.3 标签与状态 (Tags & Status Badges)
- **月龄与分类筛选 Tabs**：
  - Active 选中态：`bg-[#62AD78] text-white font-bold shadow-xs`
  - Inactive 未选中态：`bg-white text-[#45483F] border border-[#F1EAE0] hover:bg-[#EDF4E9]/50`
- **领域轻量标签**：
  - 统一为软调文本轻量封装，避免粗暴荧光色。

### 3.4 导航与交互 (Navigation & Hotspots)
- **顶部 Navbar & 底部 TabBar**：
  - 背景：`bg-[#FAF9F2]/95 backdrop-blur-md border-[#F1EAE0]`
  - 选中态：图标与文字均为植物绿 `text-[#62AD78]`，辅以浅绿微透地盘 `bg-[#EDF4E9]`。
  - 未选中态：`text-[#85877B]`
- **可点击区域**：所有交互控件热区 $\ge 44\times 44\text{px}$，优先 $48\times 48\text{px}$。

### 3.5 表单控件与交互组件规范 (Form Controls & Input Specifications)

#### 3.5.1 基础几何尺寸与排版规范
所有普通单行文本输入框（`<input type="text">`）、选择框（`<select>` 或自定义下拉触发框）、多行输入框与搜索框统一使用以下物理参数：

| 规格属性 | 统一设计 Token / CSS Class | 具体数值说明 |
|---|---|---|
| **控件高度** | `h-12` | 48px 统一基础高度（保障移动端舒适触控与高品质连贯性） |
| **圆角** | `rounded-xl` | 12px 统一圆角（与卡片 16/24px 形成优雅的层次阶梯） |
| **左右内边距** | `px-4` | 16px 水平内边距 |
| **边框粗细与颜色** | `border border-[#EDF4E9]` | 1px 浅植物绿边框（严禁使用高饱和黄色或粗暴黑灰边框） |
| **背景色** | `bg-[#FAF9F2]` | 阳光奶油白背景（保持整体温暖舒缓质感） |
| **文字字号与行高** | `text-base` / `leading-none` | 16px 字号（规避移动端/iOS 输入框聚焦页面自动强行放大） |
| **文字基线与垂直对齐** | `flex items-center` / `leading-normal` | 垂直居中，基线对齐 |
| **图标尺寸与间距** | 图标 `w-4.5 h-4.5` (18-20px)，间距 `gap-2.5` | 8-10px 间距，垂直居中对齐 |

#### 3.5.2 控件五大交互状态 (Interactive States)
1. **Default（默认态）**：
   - 样式：`bg-[#FAF9F2] border border-[#EDF4E9] text-[#45483F]`
   - Placeholder：`placeholder-[#85877B] text-base`（柔和自然灰，兼顾对比度与透气感）
2. **Focus / Hover（聚焦/悬停态）**：
   - 样式：`focus:outline-none focus:border-[#62AD78] hover:border-[#62AD78]/60 transition-colors`
   - 说明：高亮品牌植物绿边框，提供即时、顺滑的响应反馈。
3. **Selected（已选/选中态）**：
   - 样式：`bg-[#EDF4E9] border border-[#62AD78]/40 text-[#3F8054] font-bold`
   - 说明：用于下拉/网格选中项或月龄选择框已填状态，清晰辨识。
4. **Disabled（禁用态）**：
   - 样式：`bg-[#F5F5F0] border border-[#E5E5E0] text-[#A0A098] cursor-not-allowed opacity-60`
   - 说明：降低对比度同时确保文案可读性。
5. **Error（错误/校验失败态）**：
   - 样式：`border-[#F17D70] bg-[#FFF5F5] text-[#45483F]`
   - 说明：使用克制的活力珊瑚红 `#F17D70` 配合下方显式文字提示 `text-[#F17D70] text-xs mt-1 flex items-center gap-1`，不单依赖颜色表达错误。

#### 3.5.3 控件分类详述
- **普通文本输入框 (`Input`)**：如昵称、小名、搜索。统一 `w-full h-12 px-4 rounded-xl bg-[#FAF9F2] border border-[#EDF4E9] text-base text-[#45483F] placeholder-[#85877B] focus:outline-none focus:border-[#62AD78]`。
- **选择框与模拟下拉 (`Select / Picker Trigger`)**：如「宝宝目前多大」月龄触发框。外观与 Input 完全一致，高度 48px，`rounded-xl`，背景 `#FAF9F2`，右侧配 chevron 图标 ` text-[#85877B]`，选中展示深绿粗体 `#3F8054`。
- **多行文本域 (`Textarea`)**：如备注、手账心得。保持 `rounded-xl`，`p-3.5`，`bg-[#FAF9F2]`，`border border-[#EDF4E9]`，最小高度 `min-h-[96px]` (2 倍 48px)。
- **特殊选择网格/ Tabs (`Special Selection Controls`)**：如 0-36 月龄网格按钮、状态情绪卡片。统一 `rounded-xl` 圆角，高 `h-11` 或 `h-12`，选中态 `bg-[#62AD78] text-white shadow-xs`。

#### 3.5.4 移动端触控与响应式规范
- **最小热区**：所有独立点击点与图标按钮热区 $\ge 44 \times 44\text{px}$，输入框与触发框保持 $48\text{px}$ 高度。
- **窄屏适配**：`w-full` 自适应父容器，无横向溢出，Placeholder 与选中内容不被裁剪（必要时搭配 `truncate` 或 `line-clamp-1`）。
- **新组件强约束**：后续所有新增页面、组件与模态框表单控件，必须强制继承本规范，严禁私自声明 `h-14`、`h-10` 或高饱和度外边框。

### 3.6 陪玩进行中与拍立得结果页规范 (In-Play & Polaroid Result Modal Specifications)

#### 3.6.1 陪玩进行中页面规范 (`CoachModeModal.tsx`)
1. **顶部区域 (Top Header)**：
   - 移除冗余的「指南」按钮与分类标签。
   - 居中展示轻量状态提示：`陪伴互动中...` (`px-3 py-1 rounded-full bg-[#EDF4E9] border border-[#62AD78]/30 text-xs font-semibold text-[#3F8054]`)。
   - 右侧保留安全的关闭按钮 `✕`。
2. **中间插画与玩法说明**：
   - 保留精美绘本插画，删除下方独立气泡卡片，玩法引导文字直接以透气自然文本展示在插画上方/下方。
3. **陪玩三步法 (Three-Step Guidance)**：
   - 彻底去卡片化，禁止嵌套多层外框与独立小卡片。
   - 采用清爽的 3 行文字列表，左侧统一为序号加粗绿字 (`1. 看一看：...`)，右侧为自然正文。
4. **底部操作区域 (Bottom Actions)**：
   - 删除「稍后再玩 · 保存进度」冗余入口与计时器展示。
   - 保持唯一的Primary品牌植物绿 `#62AD78` 居中胶囊按钮：「结束陪伴」(`w-3/5 max-w-[200px] h-11 rounded-full`)。

#### 3.6.2 拍立得成长纪念卡规范 V2 (`PolaroidModal.tsx`)
1. **三大区域架构 (Three-Region Structure)**：
   - **顶部**：页面导航 `陪伴完成 · 成长手账` + 右侧关闭 `✕`。
   - **中间**：唯一的成长纪念相纸（`w-full max-w-[310px] sm:max-w-[330px]`），无多层外框与浅灰内衬。
   - **底部**：`保存` (Primary 植物绿胶囊 `#62AD78`) + `返回` (Ghost 轻链接)。
2. **相纸内部布局 (Inside Card)**：
   - 顺序：日期 (仅数字 `2026-11-03`) ➔ 清洁活动名 (去括号备注) ➔ 图片区域 (点击触发照片上传/更换隐形入口) ➔ 活动分类 (仅显示 1 次) ➔ 横向 3 表情互动行 (`😍`, `🙂`, `😢`) ➔ 陪伴记录短句。
   - 彻底删除：陪玩时长、重复分类、重复状态、"宝宝档案：宝宝"、"玩伴日历成长印记/手账" 水印。
3. **图像导出规则 (Export Spec)**：
   - 点击「保存」导出的 PNG 海报仅包含相纸本身，若用户选择了表情则在海报上仅绘制单只选中表情，未选择则不绘制。不导出页面背景与编辑按钮。

---

## 四、字体、字号与间距规范

- **字号阶梯**：
  - Hero Display 标题：`text-xl` (20px) ~ `text-2xl` (24px) font-bold
  - 模块 / 卡片标题：`text-base` (16px) ~ `text-lg` (18px) font-bold
  - 正文 / 按钮：`text-sm` (14px) / `text-xs` (12px)
  - 辅助说明 / 时间戳：`text-[11px]` (11px) / `text-[10px]` (10px)
- **圆角阶梯**：
  - 页面大卡片 / 模态框：`rounded-3xl` (24px)
  - 普通卡片 / 图像容器：`rounded-2xl` (16px)
  - 按钮与标签：`rounded-full` (9999px) / `rounded-xl` (12px)

---

## 五、更新历史与版本记录

- **V1.0 (2026-10-20)**：初始日落橙 UI 规范建立。
- **V1.1 (2026-10-28)**：组件与弹窗双按钮初次并轨。
- **V2.0 (2026-11-03)**：全面升级为《北欧自然绘本风 V1》，以植物绿 `#62AD78` 为品牌主色，阳光奶油白 `#FAF9F2` 为全局背景，全组件并轨 3 级温润胶囊按钮标准。
- **V2.1 (2026-11-03)**：完成全局表单控件一致性检查与修复，新增《3.5 表单控件与交互组件规范》，统一 48px 高度、12px 圆角、16px 内边距、16px 字号与奶油白背景连贯标准。
- **V2.2 (2026-11-03)**：完成陪玩进行中与拍立得结果页精简重构，新增《3.6 陪玩进行中与拍立得结果页规范》，彻底消除多层卡片嵌套与页面穿模裁切问题。
- **V2.3 (2026-11-03)**：完成拍立得成长手账页面重新整理 V2，重构为单一成长纪念卡，融入隐形照片上传入口与 3 表情互动行，更新《3.6.2 拍立得成长纪念卡规范 V2》。
