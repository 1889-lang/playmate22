# 玩伴日历（Playmate Calendar）亲子活动内容库权威数据源与安全专项审计报告

## 一、概述 (Overview)

本文档归档玩伴日历 0–36 个月亲子活动内容库（全量 52 条活动）的公共权威数据源、52条活动质量与安全专项审计结果、0–36 个月逐月覆盖矩阵以及工程化安全审核隔离机制。

为了确保给婴儿及幼儿照护者提供科学、安全、零门槛且无过度医疗化/夸大宣传的亲子互动玩法，玩伴日历所有活动均遵循国际主流儿童发展与保健权威指南进行去医疗化重构与硬性风险隔离。

---

## 二、公共权威参考数据源 (Public Reference Sources)

所有活动内容的动作设计、月龄划分与里程碑依据均参考以下公开且可信的机构指引：

1. **UNICEF & LEGO Foundation Early Childhood Development Guidelines**
   - 官方指引：早期感官探索、家庭游戏与亲子互动指南
   - 网址引用：https://www.unicef.org/early-childhood-development
2. **Pathways.org Baby Motor & Sensory Milestones**
   - 官方指引：0–36个月婴幼儿大运动、精细动作与感官里程碑
   - 网址引用：https://pathways.org/milestones
3. **CDC's Developmental Milestones (Centers for Disease Control and Prevention)**
   - 官方指引：2, 4, 6, 9, 12, 18, 24, 30, 36 个月发育观察指标
   - 网址引用：https://www.cdc.gov/ncbddd/childdevelopment/milestones
4. **AAP HealthyChildren Parent Guides (American Academy of Pediatrics)**
   - 官方指引：居家安全防范、小零件防梗阻、水安全及安全游戏边界指引
   - 网址引用：https://www.healthychildren.org
5. **NHS UK Baby & Toddler Play & Learn Resources**
   - 官方指引：日常居家物品无成本互动探索与儿童安全手册
   - 网址引用：https://www.nhs.uk/conditions/baby/babys-development

---

## 三、重点安全审查与去医疗化修正 (Special Safety Audit & De-medicalization)

已对全库 52 条活动（重点针对新增 `act-23` 至 `act-52`）进行去过度医疗化表达修正与硬性安全预警增强：

1. **去夸大/去医疗化修改**:
   - 彻底删除“刺激黄斑区发育”、“激活听觉皮层”、“促进前庭觉”、“神经神经元连接”等医学或生理功效宣称。
   - 改为客观、生活化、可观察的表达（例如：“练习集中注视与慢速视觉追随，感受黑白线条变化”；“在温暖陪伴下练习趴卧抬头，感受颈部肌力”）。

2. **高风险玩法安全预警与风险评估**:
   - **`act-30` 水中脚丫踩水花**: 明确水深限定 2-3 cm，须用手腕测试 37-38 度温水，要求双手稳稳托住腋下、一秒不离眼看护，严防滑落与溺水；地面铺设防滑干毛巾。*（建议：因涉及婴幼儿水觉环境，单靠文案提醒无法消除人误风险，保持隔离，建议儿保专家现场复核）。*
   - **`act-34` 食指拇指捏取小面包粒**: 增加前置判定条件（必须满6个月且具备成熟辅食吞咽能力与餐椅坐稳能力），食物颗粒必须蒸至极度软烂（一捏即化）且切成扁平薄片，严防气管梗阻与窒息。*（建议：因噎食风险极高，保留待审核隔离）。*
   - **`act-35` 纸盒抽抽乐与寻找隐藏物**: 限制棉布条单条长度在 15 cm 以内，严禁使用任何细绳、缎带或长布巾，防止缠绕颈部或手指；藏入玩偶须大于 5 cm 无脱落小部件。
   - **`act-39` 柔软纸巾撕撕乐**: 限制必须使用食品级无尘柔纸巾，严禁使用硬报纸或易掉渣纸，全程监控严防纸碎片塞入口鼻耳道。
   - **`act-44` 自制无毒面团揉捏**: 明确面团虽由食用面粉与水自制无毒，但仅供手部揉塑捏拍，严禁食用或塞入口鼻耳道。
   - **`act-45` 摇摇罐声音对比猜猜看**: 要求塑料罐瓶盖必须用强力胶封固并用宽胶带多层包裹包扎，绝对防止红豆散落造成气管异物梗阻窒息！*（建议：因破损撒漏误吞风险大，建议重新设计为整块摇铃代替）。*
   - **`act-48` 踩胶带直线平衡走**: 必须在防滑地面贴胶带，2米内清空带有尖角硬质家具，宝宝赤足或穿防滑袜，全程成人近距离保护防滑倒跌伤。
   - **`act-49` 吸管段大孔穿线**: 粗吸管剪段长度必须严格大于 3 cm（超过儿童防误吞测试规标准），彩绳末端打大结，严禁使用细绳或小珠子，全程成人一对一看护。

---

## 四、0–36 个月逐月覆盖矩阵 (0–36 Month-by-Month Matrix)

下表展示从 Month 0 到 Month 36（共37行）的匹配活动数量及分类分布（界限口径：活动按其真实适龄区间如 `0-3个月` 匹配 Month 0, 1, 2, 3；`4-6个月` 匹配 Month 4, 5, 6；`6-8个月` 匹配 Month 6, 7, 8；`9-12个月` 匹配 Month 9, 10, 11, 12；`13-18个月` 匹配 Month 13-18；`19-24个月` 匹配 Month 19-24；`25-36个月` 匹配 Month 25-36）：

| 月龄 (Month) | 适龄活动数 | 已审核通过 | 待审核隔离 | 大运动 | 精细动作 | 感官认知 | 社会情绪 | 语言交流 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **1 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **2 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **3 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **4 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **5 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **6 月** | 25 | 12 | 13 | 5 | 5 | 7 | 5 | 3 |
| **7 月** | 20 | 12 | 8 | 4 | 4 | 6 | 4 | 2 |
| **8 月** | 20 | 12 | 8 | 4 | 4 | 6 | 4 | 2 |
| **9 月** | 7 | 0 | 7 | 2 | 2 | 1 | 1 | 1 |
| **10 月** | 7 | 0 | 7 | 2 | 2 | 1 | 1 | 1 |
| **11 月** | 7 | 0 | 7 | 2 | 2 | 1 | 1 | 1 |
| **12 月** | 7 | 0 | 7 | 2 | 2 | 1 | 1 | 1 |
| **13 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **14 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **15 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **16 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **17 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **18 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **19 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **20 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **21 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **22 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **23 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **24 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **25 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **26 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **27 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **28 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **29 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **30 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **31 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **32 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **33 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **34 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **35 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |
| **36 月** | 5 | 0 | 5 | 1 | 1 | 1 | 1 | 1 |

*注：第 6 个月为 `4-6个月` 与 `6-8个月` 的区间交界月，属于自然的适龄匹配交集，全库唯一活动总数严格为 52。*

---

## 五、全量52条活动内容来源追溯表 (Activity Traceability Matrix)

| 活动ID | 参考机构与来源 | 来源链接 | 机构依据要点 | 自行改编与安全加固 | 临床/复核状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `act-01` | UNICEF Early Play | unicef.org/ecd | 声音追随与抓握 | 纸条高挂悬空，防扯落吞咽 | 历史已审核 |
| `act-02` | Pathways.org Motor | pathways.org/milestones | 俯卧肌肉力量 | 腹部轻托离地 | 待儿保复核 |
| `act-03` | NHS Play Guide | nhs.uk/conditions/baby | 触觉材质探索 | 触觉盒平铺 | 待儿保复核 |
| `act-04` | CDC Milestones | cdc.gov/milestones | 镜中自我表达 | 塑料安全镜互动 | 历史已审核 |
| `act-05` | Pathways.org Cognitive | pathways.org/milestones | 遮盖寻找物体 | 轻薄纱巾躲猫猫 | 历史已审核 |
| `act-06` | AAP Safety Guide | healthychildren.org | 视觉追随 | 封固塑料瓶观察 | 待儿保复核 |
| `act-07` | NHS Play Guide | nhs.uk/conditions/baby | 敲击声音因果 | 倒扣塑料盆拍打 | 历史已审核 |
| `act-08` | Pathways.org Motor | pathways.org/milestones | 双手抱抓物体 | 10cm软球或卷袜子 | 历史已审核 |
| `act-09` | CDC Communication | cdc.gov/milestones | 语音轮流模仿 | 面对面元音互动 | 历史已审核 |
| `act-10` | Pathways.org Motor | pathways.org/milestones | 坐姿力量与前倾 | 纸箱推动 | 待儿保复核 |
| `act-11` | NHS Toddler Talk | nhs.uk/conditions/baby | 拟声词引导 | 动物叫声模仿 | 历史已审核 |
| `act-12` | UNICEF Fine Motor | unicef.org/ecd | 抽取与精细捏 | 抽纸盒拉手绢 | 历史已审核 |
| `act-13` | CDC Milestones | cdc.gov/milestones | 身体部位感知 | 仰卧抓脚趾 | 历史已审核 |
| `act-14` | AAP Social Play | healthychildren.org | 玩偶依恋互动 | 布偶倾听故事 | 待儿保复核 |
| `act-15` | Pathways.org Sensory | pathways.org/milestones | 倾倒出容器 | 水杯倾斜探索 | 待儿保复核 |
| `act-16` | UNICEF Fine Motor | unicef.org/ecd | 物品挪动与抓 | 软积木搬运 | 历史已审核 |
| `act-17` | NHS Music Play | nhs.uk/conditions/baby | 节奏音乐感知 | 舒缓音乐摇摆 | 待儿保复核 |
| `act-18` | CDC Social | cdc.gov/milestones | 动作社交模仿 | 鼓掌拍手互动 | 历史已审核 |
| `act-19` | AAP Sensory Guide | healthychildren.org | 自然气味感知 | 果皮温和散香 | 待儿保复核 |
| `act-20` | Pathways.org Motor | pathways.org/milestones | 腹部蠕动向前 | 爬行垫前方逗引 | 历史已审核 |
| `act-21` | Pathways.org Walking | pathways.org/milestones | 扶站学步 | 沙发边扶站 | 待儿保复核 |
| `act-22` | UNICEF Fine Motor | unicef.org/ecd | 对击与嵌入 | 积木插板 | 待儿保复核 |
| `act-23` | UNICEF Sensory Guide | unicef.org/ecd | 新生儿慢速追视 | 黑白卡慢平移 | 待儿保复核 |
| `act-24` | Pathways.org Tummy Time | pathways.org/milestones | 趴卧抬头 | 胸口趴卧呼唤 | 待儿保复核 |
| `act-25` | CDC Milestones (0-3m) | cdc.gov/milestones | 掌心触碰抓握 | 干净手指轻抚 | 待儿保复核 |
| `act-26` | AAP Infant Attachment | healthychildren.org | 眼神与轻抚 | 背部温和按抚 | 待儿保复核 |
| `act-27` | NHS Baby Language | nhs.uk/conditions/baby | 韵律语调 | 父母语元音 | 待儿保复核 |
| `act-28` | Pathways.org Motor | pathways.org/milestones | 侧卧与躯干旋转 | 摇铃侧向逗引 | 待儿保复核 |
| `act-29` | UNICEF Fine Motor | unicef.org/ecd | 中线汇聚抓握 | 毛巾轻按抓取 | 待儿保复核 |
| `act-30` | NHS Water Play | nhs.uk/conditions/baby | 水觉脚踏体验 | 限深2cm温水踩 | 待儿保复核 |
| `act-31` | CDC Social Milestones | cdc.gov/milestones | 社会性微笑 | 遮脸露脸躲猫猫 | 待儿保复核 |
| `act-32` | AAP Speech Guide | healthychildren.org | 唇型噗噗模仿 | 嘴唇吹气泡 | 待儿保复核 |
| `act-33` | Pathways.org Crawling | pathways.org/milestones | 越障爬行 | 靠垫小山丘 | 待儿保复核 |
| `act-34` | AAP Self-Feeding | healthychildren.org | 钳式捏取进食 | 软胡萝卜粒捏 | 待儿保复核 |
| `act-35` | UNICEF Exploration | unicef.org/ecd | 藏物抽取 | 15cm短布条抽取 | 待儿保复核 |
| `act-36` | CDC Social Indicators | cdc.gov/milestones | 挥手拜拜 | 肢体动作模仿 | 待儿保复核 |
| `act-37` | NHS Speech Guide | nhs.uk/conditions/baby | 身体指认 | 点点小鼻子 | 待儿保复核 |
| `act-38` | Pathways.org Walking | pathways.org/milestones | 独立迈步 | 张臂欢迎向前走 | 待儿保复核 |
| `act-39` | UNICEF Fine Motor | unicef.org/ecd | 双手反向撕 | 柔纸巾撕扯 | 待儿保复核 |
| `act-40` | CDC Cognitive | cdc.gov/milestones | 大小嵌套 | 塑料碗抱大碗 | 待儿保复核 |
| `act-41` | AAP Social Play | healthychildren.org | 照料模仿 | 假装勺子喂玩偶 | 待儿保复核 |
| `act-42` | NHS Reading Guide | nhs.uk/conditions/baby | 绘本图文 | 纸板书名词指认 | 待儿保复核 |
| `act-43` | Pathways.org Motor | pathways.org/milestones | 起跳与绕障 | 垫上双手拉微跳 | 待儿保复核 |
| `act-44` | UNICEF Fine Motor | unicef.org/ecd | 揉压面团 | 天然纯面团按压 | 待儿保复核 |
| `act-45` | CDC Sensory | cdc.gov/milestones | 听觉强弱对比 | 胶带封死摇摇罐 | 待儿保复核 |
| `act-46` | AAP Self-Care | healthychildren.org | 玩具归位 | 收纳筐整理合作 | 待儿保复核 |
| `act-47` | NHS Speech Guide | nhs.uk/conditions/baby | 连续指令 | 双重简单生活指令 | 待儿保复核 |
| `act-48` | Pathways.org Motor | pathways.org/milestones | 踩线走 | 美纹胶带踩线走 | 待儿保复核 |
| `act-49` | UNICEF Fine Motor | unicef.org/ecd | 穿插大孔 | >3cm粗吸管穿线 | 待儿保复核 |
| `act-50` | CDC Cognitive | cdc.gov/milestones | 颜色分类 | 盘子归类小车 | 待儿保复核 |
| `act-51` | AAP Social Sharing | healthychildren.org | 轮流游戏 | 搭积木一人一块 | 待儿保复核 |
| `act-52` | NHS Speech Guide | nhs.uk/conditions/baby | 短句交流 | 日常三字短句扩展 | 待儿保复核 |

---

## 六、工程安全隔离与入口审核覆盖排查

在不修改推荐算法与展示规则前提下，对现有代码中所有活动获取与展示入口进行检查：

1. **入口1：首页今日精选卡片 (`getTodayFeaturedActivity`)**:
   - 位置：`src/utils/activity.ts`
   - 规则：调用 `getReviewedActivities(allActivities)`，严格校验 `isActivityReviewed(act)`，待审核活动 **100% 无法进入**。
2. **入口2：首页推荐列表与全量活动库 (`getAgeEligibleActivities` & `LibraryView`)**:
   - 位置：`src/components/LibraryView.tsx` & `src/utils/activity.ts`
   - 规则：`LibraryView` 的 `filteredActivities` 显式判断 `if (!isActivityReviewed(act)) return false;`，待审核活动 **100% 无法在列表渲染**。
3. **入口3：通过活动 ID 直达 (代码隐患排查报告)**:
   - **排查位置**：`src/App.tsx` 中的 `handleSelectActivityById` 函数（第 233 行）。
   - **复现代码**：
     ```ts
     const handleSelectActivityById = (activityId: string) => {
       const found = INITIAL_ACTIVITIES.find((a) => a.id === activityId);
       if (found) {
         setSelectedActivity(found);
         setCurrentTab('library');
       }
     };
     ```
   - **风险判定**：若未来有外部链接或 URL 参数直接传入待审核的 `activityId`（如 `act-30`），该函数仅按 ID 查找，**未调用 `isActivityReviewed(found)` 校验**，会将未审核活动直接赋给 `selectedActivity` 并打响展示！
   - **处理建议**：在后续开发中，需在该函数中补齐 `if (!isActivityReviewed(found)) return;` 准入判断。本轮**遵照指令，仅报告此问题，未擅自修改 App.tsx 代码**。

---

## 七、测试与构建验证结果

1. **完整测试套件执行结果**:
   - 执行 `npx tsx scripts/verify-p0.ts`：**38 PASS，0 FAIL**。
   - 执行 `npx tsx scripts/verify-duration-threshold.ts`：**13 PASS，0 FAIL**。
   - 执行 `npx tsx scripts/verify-stage1-supplementary.ts`：**32 PASS，0 FAIL**。
   - 执行 `npx tsx scripts/verify-v02.ts`：**5 PASS，0 FAIL**。
   - *(注：历史遗留脚本 `verify-stage2-p1.ts` 中涉及早期重构前旧函数名的 4 项测试未维护，主业务逻辑 88 项关键测试全部绿灯)*。
2. **TypeScript 类型校验 (`npm run lint` / `tsc --noEmit`)**:
   - 零类型报错，通过！
3. **应用生产构建打包 (`npm run build`)**:
   - Vite 生产环境构建打包一次性成功！

---

### 🛑 审计完成暂停提示
第二轮专项复核、数据纠错与安全审计报告已全面完成。现已**立即暂停**，等待您的验收与指示！
