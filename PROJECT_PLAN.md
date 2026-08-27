# 《星屿》项目计划书 · 技术实现版

> 本文档说明《星屿》第一版「每个模块的技术功能用什么技术实现」，作为开发的唯一技术依据。
> 需求依据：`大白话需求.md`。本文档假设技术落地方式已定为 **纯前端 + 浏览器本地存储（无后端）**。

---

## 1. 技术总览

### 1.1 核心结论

《星屿》第一版是一个 **纯前端单页应用（SPA）**，无后端服务，数据全部存在浏览器本地。手机/平板浏览器打开即用，可进一步做成 PWA 安装到桌面、离线使用。

```
┌─────────────────────────────────────────────┐
│                 浏览器（手机/平板）            │
│                                              │
│   Vue 3 + Vite 前端                          │
│   ├── Vue Router（hash 路由，5 个 Tab）       │
│   ├── Pinia（状态管理，5 个模块 store）        │
│   ├── Dexie.js（IndexedDB 本地数据库）         │
│   ├── ECharts（全部图表）                      │
│   ├── 原生 SVG（成长年轮树）                   │
│   └── 手写 CSS 变量（圆润柔和儿童风格）         │
│                                              │
│   IndexedDB（浏览器本地存储，无云端）           │
└─────────────────────────────────────────────┘
```

### 1.2 技术选型总表

| 技术 | 用途 | 为什么选它 |
| :-- | :-- | :-- |
| Vue 3 + Vite | 前端框架 + 构建 | 组件化、生态成熟、启动快 |
| Vue Router（hash 模式） | 5 个 Tab 路由切换 | hash 模式在静态部署下刷新不会 404 |
| Pinia | 状态管理 | 轻量、对 Vue3 友好，按模块拆 store |
| Dexie.js | 本地数据持久化 | IndexedDB 的友好封装，比手写 IndexedDB 简洁得多 |
| ECharts | 全部图表 | 折线/柱状/饼图/气泡/关系网/词云一个库全覆盖 |
| echarts-wordcloud | 周报关键词云 | ECharts 官方词云插件 |
| 原生 CSS + CSS 变量 | 样式与配色 | 设计规范有明确色值，变量集中管理，移动端优先 |
| 原生 JS Date / setInterval | 日历、学习计时器 | 无需额外依赖 |
| html2canvas | 导出汇总长图 | 把周报/汇总页面截图成图片给哥哥 |
| vite-plugin-pwa（第二阶段可选） | PWA 安装/离线/推送 | 第一版先普通网页，稳定后再加 |

**编程语言**：JavaScript（与原始方案一致，保持简单；如需可后续迁 TypeScript）。

---

## 2. 目录结构

```
xingyu/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
├── PROJECT_PLAN.md              # 本文档
├── 大白话需求.md                 # 需求依据
├── public/
│   └── icons/                   # PWA 图标（第二阶段）
└── src/
    ├── main.js                  # 入口，挂载 Vue + Pinia + Router
    ├── App.vue                  # 根组件：布局 + TabBar + 路由出口
    ├── router/
    │   └── index.js             # 5 个路由（hash 模式）
    ├── stores/                  # Pinia store（对应 5 大模块）
    │   ├── mood.js              # 心情
    │   ├── health.js            # 健康打卡
    │   ├── diary.js             # 点滴
    │   ├── knowledge.js         # 知识库
    │   ├── contacts.js          # 通讯录
    │   └── config.js            # 配置/管理员物料/密码
    ├── db/
    │   └── index.js             # Dexie 数据库定义 + 种子数据初始化
    ├── utils/
    │   ├── stats.js             # 聚合计算（周报/连续天数/掌握度等）
    │   ├── date.js              # 日期工具（日历网格、周/月范围）
    │   └── export.js            # 导出汇总（JSON + 长图）
    ├── styles/
    │   ├── variables.css        # 色彩/圆角/间距 CSS 变量
    │   └── global.css           # 全局样式、移动端优先
    ├── components/
    │   ├── TabBar.vue           # 底部导航
    │   ├── MoodCalendar.vue     # 情绪彩虹月历
    │   ├── CloverHealth.vue     # 四叶草健康环
    │   ├── SubjectBubbles.vue   # 学科气泡图
    │   ├── TrendChart.vue       # 通用趋势图（折线/柱状）
    │   ├── GrowthTree.vue       # 成长年轮树（SVG）
    │   ├── RelationGraph.vue    # 关系网可视化
    │   ├── QuickActions.vue     # 底部悬浮快捷打卡
    │   └── pickers/             # 各类打卡弹层
    │       ├── MoodPicker.vue
    │       ├── MealPicker.vue
    │       ├── SleepPicker.vue
    │       ├── PlayPicker.vue
    │       └── StudyPicker.vue
    └── views/
        ├── LivingRoom.vue       # 客厅（首页）
        ├── Diary.vue            # 点滴
        ├── Knowledge.vue        # 知识库
        ├── Contacts.vue         # 通讯录
        └── Profile.vue          # 我的
```

---

## 3. 数据层设计（IndexedDB，Dexie 封装）

### 3.1 数据库与表

```js
// src/db/index.js（示意）
import Dexie from 'dexie'
export const db = new Dexie('xingyu')
db.version(1).stores({
  moods:     '++id, date, createdAt',
  health:    '++id, date, type, createdAt',
  diary:     '++id, type, date, createdAt',
  knowledge: '++id, category, subject, createdAt',
  contacts:  '++id, tag, name',
  config:    'key',
})
```

### 3.2 各表字段

| 表 | 存储内容 | 关键字段 |
| :-- | :-- | :-- |
| `moods` | 心情记录 | `emoji`、`score`(1-10)、`date`、`createdAt` |
| `health` | 健康打卡 | `type`(water/sleep/meal/play)、`value`(杯数/时长/顿数)、`date` |
| `diary` | 点滴记录 | `type`(insight/inspiration/skill/milestone/body)、`content`、`images`、`date` |
| `knowledge` | 知识库 | `category`(study/fact/skill)、`subject`(语文/数学/英语)、`star`(掌握度)、`content` |
| `contacts` | 通讯录 | `tag`(family/relative/friend/custom)、`name`、`info`、`health`、`mood`、`funStories`、`whisper` |
| `config` | 配置与物料 | 管理员密码、提醒开关、每日一问 30 题、冷知识、知识树骨架、家人种子档案 |

### 3.3 种子数据初始化

首次打开 App 时（`db.on('populate')` 或版本升级钩子）自动写入：

- 家人 3 人（爸爸、妈妈、哥哥）
- 每日一问 30 题、冷知识 10 条
- 知识树骨架（先一个章节）
- 哥哥的悄悄话初始内容
- 默认配置（管理员密码、提醒开关）

---

## 4. 模块 → 技术实现映射（核心）

> 这是本文档重点：每个功能点「用什么技术实现、关键思路是什么」。

### 4.1 客厅（首页）

| 功能点 | 用什么实现 | 关键思路 |
| :-- | :-- | :-- |
| 今日状态卡片 | Pinia 聚合 + computed | 从 mood/health/knowledge store 读今日数据，一句话总结按心情值映射文案 |
| 连续打卡天数 | `utils/stats.js` | 从 moods 按日期倒推连续有记录的天数 |
| 情绪彩虹月历 | 自研 `MoodCalendar.vue` | 用 `utils/date.js` 算出当月网格；每天格子按心情 emoji 渲染，背景色用 CSS 根据 score 从浅黄渐变到深橙 |
| 本周情绪趋势 | ECharts 折线图 | 近 7 天心情平均值，X=周几，Y=分值 |
| 四叶草健康环 | ECharts 4 个环形仪表盘 或 自研 SVG | 每瓣对应水/睡/餐/玩进度；全满触发 CSS 发光旋转动画 |
| 学科气泡图 | ECharts scatter | 3 个气泡，`symbolSize` 按学习总时长，颜色按学科主题色 |
| 本周学习趋势 | ECharts 柱状图（堆叠） | X=周几，Y=时长，按学科堆叠颜色 |
| 每日一问 / 每日冷知识 | config 表按日期轮替 | 用 `date` 取模 30/10 选当天题目/冷知识 |
| 最近动态 | 跨 store 聚合 | 取各表最新记录，按 `createdAt` 排序取前 5 条 |
| 底部悬浮快捷打卡 | `QuickActions.vue` 固定定位 + picker 弹层 | 6 个按钮，喝水量接累加不弹窗，其余弹对应 picker |

### 4.2 点滴

| 功能点 | 用什么实现 | 关键思路 |
| :-- | :-- | :-- |
| 时光时间线 | 自研列表组件 | diary 表按 `date` groupBy 倒序；不同类型左侧边框不同色 |
| 身体成长曲线 | ECharts 折线图 | 身高/体重/视力三张图或切换，带数据点标注 |
| 写点滴面板 | 表单 + 类型选择 | 4 种类型（见闻/灵感/技能/里程碑），保存写入 diary 表 |

### 4.3 知识库

| 功能点 | 用什么实现 | 关键思路 |
| :-- | :-- | :-- |
| 三大分类切换 | 顶部 Tab | 学科学习 / 常识科普 / 技能学习 |
| 知识树 | 自研递归树组件 | 章节→知识点→星星，树结构来自 config 里的知识树骨架 |
| 星星掌握度 | 点击切换 4 级状态 | ⚪未知 🟡了解 🟢掌握 🔵可教，状态写 knowledge 表 |
| 学习日志 | 表单 | 学科/时长/内容/收获，写 knowledge 表 |
| 学习计时器 | 原生 `setInterval` + Date | 正计时，可暂停/停止/手动调整，结束写入日志 |
| 冷知识收藏夹 | 列表 | 从客厅收藏的冷知识写入 knowledge 表 |
| 技能清单 | 列表 | 聚合 diary 表 `type=skill` + 手动新增 |

### 4.4 通讯录

| 功能点 | 用什么实现 | 关键思路 |
| :-- | :-- | :-- |
| 标签分组列表 | 仿微信列表 | contacts 表按 `tag` 分组，顶部标签切换 |
| 联系人详情 | 分区卡片 | 个人信息/健康/心情/趣事分区展示 |
| 悄悄话 | 详情页底部只读区 | 仅「我」（哥哥）有，管理员模式下可编辑 |
| 关系网可视化 | ECharts graph（力导向图） | 妹妹中心 + 最近互动最多 3 人连线 |

### 4.5 我的

| 功能点 | 用什么实现 | 关键思路 |
| :-- | :-- | :-- |
| 周报 | `utils/stats.js` 聚合 + ECharts | 本周情绪曲线、学习时长、打卡率、新增知识 |
| 关键词云 | echarts-wordcloud | 统计本周记录高频词，大小/颜色按词频 |
| 成长年轮树 | 自研 SVG `GrowthTree.vue` | 递归画树；果实=身高数据条数，年轮刻痕=里程碑数 |
| 管理员模式 | 密码校验 + 物料录入表单 | 密码散列后存 config 表；进入后显示物料录入 + 汇总视图 |
| 导出汇总 | `utils/export.js`（JSON + html2canvas） | 只导汇总数据/长图，**不含日记原文** |

---

## 5. 权限与隐私实现

| 需求 | 实现方式 |
| :-- | :-- |
| 妹妹无密码锁、打开即用 | 无全局锁屏，直接进 App |
| 管理员模式（哥哥密码） | 「我的」页隐藏入口，输对密码进入管理员界面 |
| 管理员能录物料 + 看汇总、看不到原文 | 管理员界面只渲染「物料表单 + 汇总图表」，不提供 diary 原文列表 |
| 导出只含汇总 | export.js 只序列化统计结果，不导出 diary/moods 原文字段 |

> 说明：纯前端本地存储下，「管理员密码」和「妹妹无锁」只是界面层约束——技术上懂行的人仍可打开浏览器开发者工具看 IndexedDB。这是「本地单设备」方案的天性，真正的隐私边界靠「这是妹妹自己的设备 + 哥哥的自觉」维护。若未来要更强隔离，需在第二阶段引入独立管理员设备/账号。

---

## 6. 提醒功能（睡前温柔提醒）

| 方案 | 实现 |
| :-- | :-- |
| 第一阶段（简单） | 打开 App 时判断时间在晚上区间，顶部显示一句温柔提醒条，不强制 |
| 第二阶段（PWA） | 用 Notification API + 定时任务，PWA 安装后可推送系统通知 |

---

## 7. 开发里程碑

| 阶段 | 内容 | 说明 |
| :-- | :-- | :-- |
| M0 | 项目骨架 | Vite 初始化、路由、Pinia、Dexie、CSS 变量、TabBar |
| M1 | 数据层 + 种子数据 | 建表、种子数据初始化、utils |
| M2 | 客厅 | 状态卡片、月历、四叶草、气泡图、快捷打卡 |
| M3 | 点滴 | 时间线、身体曲线、写点滴 |
| M4 | 知识库 | 知识树、星星、学习日志、计时器、收藏、技能 |
| M5 | 通讯录 | 标签列表、详情、悄悄话、关系网 |
| M6 | 我的 | 周报、关键词云、年轮树、管理员模式、导出 |
| M7 | 提醒 + 集成验证 | 睡前提醒、边界处理、验收 |

---

## 8. 风险与待定

| 风险/待定 | 说明 |
| :-- | :-- |
| 本地存储上限 | IndexedDB 容量足够日常文字记录；大量图片需后续压缩或配额管理 |
| 图片存储 | 第一版图片存为 base64 进 IndexedDB，量大后再优化 |
| 数据备份 | 第一版「暂时不管」，后续加一键导出/备份 |
| 隐私的界面层局限 | 见第 5 节说明，真正的强隔离属第二阶段 |
| PWA | 第一版普通网页，稳定后再加 PWA/推送 |
