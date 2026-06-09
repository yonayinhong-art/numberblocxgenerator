# Numberblocxgenerator.com Design Spec

**Date:** 2026-06-09
**Status:** Draft — pending implementation
**Project codename:** numberblocxgenerator
**Domain:** `numberblocxgenerator.com`
**Prototype:** `/Users/yona/numberblocks-prototype/index.html`

---

## 1. 项目背景与立项依据

### 1.1 触发信号
- `numberblocks generator` 出现在 Trends Rising #1（+170%）
- Semrush KD = 6，月搜量 V=0（早期窗口）
- YouTube 证据：观众疯狂追"任意大数字的 numberblock 长什么样"（视频缩略图示例 9710 / 1B / ∞）
- Scratch 上原型项目 200+ 评论，主诉求：**性能差（lag/crash）+ 想看更大数字 + Clubs 分类**

### 1.2 立项判断
- ✅ 真需求（视频热度 + Trends rising 双佐证）
- ✅ SEO 早期窗口
- ⚠️ IP 风险（已设计防御方案见 §9）
- ⚠️ Child-directed AdSense RPM 低（已接受变现下限）

### 1.3 锁定路线
| 维度 | 选择 | 理由 |
|---|---|---|
| 变现 | **路线 ① 免费 + AdSense** | SaaS 路有 IP 风险；去 IP 路失关键词 |
| IP 视觉 | **方案甲 = 用原 IP 视觉** | 流量上限大，配合防御包减损 |
| 命名 | **numberblocxgenerator.com**（'x' 替 'k'） | 软化 trademark + SEO 仍命中 |
| 部署 | **Cloudflare Pages** | DMCA 14 天反应期 |

---

## 2. 产品定位

**Tagline:** Faster than Scratch · Big Numbers · Clubs

**核心卖点（vs Scratch 原项目）：**
1. **No lag** — Canvas 原生渲染替代 Scratch 引擎，首屏 < 1s，输入到出图 < 100ms
2. **Big numbers** — 分级渲染策略支持任意数字到 ∞，不真画 10000+ 方块所以不卡
3. **Clubs 可见** — 8 类数学分类右侧 panel 实时展示

**目标用户：**
- Primary: 4-12 岁英语圈儿童 + 陪看家长
- 流量来源: Google 搜索 `numberblocks generator` 及长尾词

**显式不做：**
- 不复刻 Scratch 原项目的 Figured-Out Frenzy / Perfect Numbers Band / Heroes With Zeroes 等粉丝宇宙
- 不做用户注册 / email list / 评论系统（COPPA 限制）
- 不做付费 SaaS（IP 风险）

---

## 3. 功能范围（首版 4 件套）

### 3.1 In scope (v1)
**A. 输入数字 → 即时渲染（分级）**
- 输入框 + −1/+1 步进 + Enter 提交
- 支持整数 1 到 Number.MAX_SAFE_INTEGER 及 `infinity`

**B. Clubs 面板（8 类）**
- Even / Odd / Prime / Square / Cube / Triangular / Power of 2 / Multiple of 10
- 实时显示 ✅ / ❓ / —
- 大数字标 "too big to verify"

**C. 大数字快捷跳转**
- Quick jumps: 10 / 100 / 1K / 1M / 1B / 1T / ∞
- Step: ±10 / ±100
- 🎲 Random（从预设有趣数字中抽）

**D. 移动端 + 性能**
- 375px 起步宽度无溢出
- FCP < 1s, 输入到出图 P95 < 100ms
- Lighthouse Performance ≥ 90 (mobile)

**E. Share + Save**
- "Copy Link" → 当前 URL（含 `?n=X`）写剪贴板
- "Save PNG" → canvas.toDataURL 导出

### 3.2 Out of scope (v2 backlog)
- 自定义脸 / 颜色
- 用户历史 / 收藏
- AUTO 自动计数
- EXP 数学模式（10^99 以上）
- Fibonacci / Perfect / Highly Composite clubs
- 多语言

---

## 4. 技术架构

### 4.1 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | **Astro 4.x** | SSG，首屏 SEO 友好，包体小 |
| 客户端 | **React island** | 仅 Generator 组件需要 hydration |
| 样式 | **Tailwind CSS** | 快速布局 + utility |
| 渲染 | **Canvas 2D** | 性能优于 SVG/DOM（千级方块场景） |
| 大数 | **JS Number + BigInt fallback** | Number 安全到 1e15，超出用 BigInt |
| 状态 | **useState + URL searchParams** | 分享天然支持 |
| 托管 | **Cloudflare Pages** | 免费 + DMCA 14 天反应期 |
| Analytics | **GA4**（child-directed 模式） | Ad personalization off |
| 广告 | **AdSense**（单独 Google 账号） | 隔离风险 |

### 4.2 仓库结构
```
numberblocxgenerator/
├── src/
│   ├── pages/
│   │   ├── index.astro          ← 主游戏页
│   │   ├── clubs.astro          ← Clubs 解释
│   │   ├── faq.astro
│   │   └── about.astro          ← IP disclaimer
│   ├── components/
│   │   ├── Generator.tsx        ← React island 入口
│   │   ├── Canvas.tsx           ← 渲染层
│   │   ├── ClubsPanel.tsx
│   │   ├── QuickJump.tsx
│   │   ├── InputBar.tsx
│   │   └── ShareBar.tsx
│   ├── lib/
│   │   ├── render.ts            ← 分级渲染调度
│   │   ├── tier1.ts ... tier5.ts ← 各 tier 渲染器
│   │   ├── layout.ts            ← N → (cols, rows) 算法
│   │   ├── clubs.ts             ← 8 个 club 算法
│   │   ├── bigmath.ts           ← BigInt isqrt / Miller-Rabin
│   │   └── colors.ts            ← 配色表
│   └── data/
│       └── named-numbers.json   ← 特殊数字别名（million, billion 等）
├── public/
│   ├── characters/
│   │   ├── 1.png … 30.png       ← 主角色 1-30
│   │   ├── 100.png 1000.png ...  ← 大数字角色
│   │   └── infinity.png         ← 自创或抽象图标
│   ├── robots.txt
│   └── sitemap.xml
├── astro.config.mjs
└── package.json
```

---

## 5. 渲染策略（5 层 tier）

按 N 自动切换，**用户无感**（性能 budget 内静默切换，tier badge 仅 dev 模式可见）。

| Tier | N 范围 | 渲染方式 | 性能预算 | 资源 |
|---|---|---|---|---|
| 1 | **1-30** | 直接显示 BBC 角色图 + 程序化数字 label | < 30ms | `public/characters/{n}.png` |
| 2 | **31-99** | 自画方块阵列 + 通用脸 + 程序布局 | < 40ms | Canvas only |
| 3 | **100-9999** | 压缩网格 + 大脸 + 数字 label。**特殊覆盖：100 用 BBC 图** | < 50ms | Canvas + optional `100.png` |
| 4 | **10K-1B** | 抽象大方块 + 网格纹理 + 脸。**特殊覆盖：1K/1M/1B 用 BBC 图（如有）** | < 80ms | Canvas + optional images |
| 5 | **> 1B / ∞** | 紫色星空背景 + 大字 + 数字属性 | < 80ms | Canvas |

**渲染调度伪码：**
```ts
function render(n) {
  if (n === Infinity) return renderTier5_infinity();
  if (hasCharacterImage(n)) return renderImage(n); // 1-30, 100, 1K, 1M, ...
  if (n <= 99) return renderTier2(n);
  if (n <= 9999) return renderTier3(n);
  if (n <= 1e9) return renderTier4(n);
  return renderTier5_huge(n);
}
```

### 5.1 自画方块阵列布局规则（Tier 2-3）
- 1-10：手调（如 4=2×2, 5=1×5, 10=2×5）
- 11+：找最接近 √N 的因子对；prime/奇数用 `ceil(√N)` 宽度，顶行不满居中
- 颜色：N ≤ 10 直接取；N > 10 按 `(N % 10) → 颜色`（粉丝设定）
- 脸位置：顶层方块中央

### 5.2 颜色规则
1-10 配色对应 BBC 动画（红/橙/黄/绿/青/紫/粉/深灰/粉红/蓝），>10 按个位循环。具体 hex 值在 `lib/colors.ts`。

---

## 6. Clubs 引擎

### 6.1 8 类算法

| Club | 算法 | 性能预算 |
|---|---|---|
| Even / Odd | `n % 2` | < 0.1ms |
| Prime | trial division to √n；n > 1e10 用 Miller-Rabin（6 轮确定性 64-bit） | < 5ms |
| Square | `floor(√n)² === n` | < 1ms |
| Cube | `round(∛n)³ === n` | < 1ms |
| Triangular | `8n+1` 是 perfect square | < 1ms |
| Power of 2 | `n & (n-1) === 0` | < 0.1ms |
| Multiple of 10 | `n % 10 === 0` | < 0.1ms |

**总 panel 计算 P95 < 10ms**（远低于 50ms 预算）

### 6.2 大数字策略
- N ≤ 1e10：全 club 精确判断
- N > 1e10：Prime / Triangular / Square / Cube 用 BigInt 算（仍精确），Power of 2 始终能算
- N > 1e15（EXP）：Prime 标 "❓ too big to verify"，其他仍算

### 6.3 V2 backlog
- Fibonacci（公式：`5n²±4` 是 perfect square）
- Perfect number（10 个表查就够）
- Highly composite（top 100 表查，覆盖 2520 等评论热议数字）
- Multiple of 3 / 5 / 7

---

## 7. 角色素材策略

### 7.1 来源（方案 🅰）
1. **主：Numberblocks Wiki (fandom)** — 大部分角色页面有干净 PNG
2. **备：YouTube 官方频道截图** — 1080p 暂停截图补漏

### 7.2 资产范围（首版）
- **1-30**：必须有（核心角色）
- **100, 1000, 10000, 100000, 1M**：有则用（覆盖 Tier 3-4 整数节点）
- **infinity**：用通用抽象图（紫色星空 + ∞ 文字，自制）

### 7.3 资产规范
- 透明背景 PNG
- 单角色裁剪
- 资源压缩 < 30KB / 图（TinyPNG / ImageOptim）
- 命名：`public/characters/{n}.png`
- 加载策略：lazy load + LRU 缓存（避免一次性加载 30 张）

### 7.4 时间估计
- Wiki 抓取 + 整理 30 个角色：1-2 小时
- YouTube 补差 5-8 个：1-2 小时
- 压缩 + 命名：30 分钟
- **总计：3-5 小时（半天）**

---

## 8. 站点架构

### 8.1 4 页结构

| URL | 用途 | 主关键词 |
|---|---|---|
| `/` | 主游戏页 + 落地内容 | numberblocks generator |
| `/clubs` | 8 个 club 解释 + 例子 | numberblocks clubs, prime numberblocks |
| `/faq` | FAQ（含 1 句话提原 Scratch 版本） | numberblocks faq |
| `/about` | IP disclaimer + 项目介绍 | (no SEO target) |

### 8.2 URL 参数
- `/?n=1000` → 直接定位到 1000
- `/?n=infinity` → 直接 infinity 模式
- 主页 canonical = `/`，所有 `?n=X` 归权重到主页

### 8.3 SEO 关键词阵地

**主词层（落地 `/`）：**
- `numberblocks generator` ⭐
- `numberblocks online`
- `numberblocks 1 to infinity`

**Clubs 词层（落地 `/clubs`）：**
- `prime numberblocks` / `square numberblocks` / `triangular numberblocks`
- `numberblocks clubs explained`
- `which numberblock has the most clubs`

**数字长尾词层（靠 `/` + URL 参数自然吃）：**
- `numberblocks 100 / 1000 / million / billion / trillion`
- `numberblocks infinity`
- `what does numberblock X look like`

### 8.4 落地页文案要点（`/`）
- H1: `Numberblocks Generator — Play Online`
- 副标: `Build any Numberblock from 1 to infinity. Fast, no lag, on mobile.`
- 游戏组件占首屏中央
- 下方 fold：How it works / Famous numbers / Clubs explained 短内容（不堆 1000 字水文）

---

## 9. IP 防御包

| 项 | 配置 |
|---|---|
| **域名** | `numberblocxgenerator.com`（'x' 替 'k'，软化 trademark） |
| **Footer 全站** | "Fan-made tool. Numberblocks is © Alphablocks Ltd / BBC Studios. Not affiliated, endorsed, or sponsored." |
| **/about** | Footer 内容 + "Made by a Numberblocks fan to help kids explore numbers" |
| **AdSense 账号** | 单独 Google 账号注册，不连累 divcalc / aismartmoney |
| **Hosting** | Cloudflare Pages（DMCA 14 天反应期） |
| **Plan B 域名** | 预备 `numbuddies.com` / `nb-explorer.com`，收 DMCA 后 7 天切换 |
| **Takedown SOP** | 收 BBC notice 后流程：(1) 24h 内下架被点名内容 (2) 48h 评估范围 (3) 7 天切 Plan B 域名 + 通用脸方案 |

---

## 10. 部署

- **域名注册**：Cloudflare Registrar
- **托管**：Cloudflare Pages + GitHub 仓库自动部署 main 分支
- **CDN**：Cloudflare 自带
- **Search Console**：GSC 验证 + 提交 sitemap.xml
- **AdSense**：单独账号申请，审核约 2 周
- **Analytics**：GA4，开 child-directed 模式（关 ad personalization）

---

## 11. KPI（上线 3 个月目标）

| 指标 | 目标 |
|---|---|
| PV/月 | ≥ 5,000 |
| 平均 session 时长 | ≥ 2 分钟（游戏站关键指标） |
| 输入到出图 P95 | < 100ms |
| Lighthouse Perf (mobile) | ≥ 90 |
| "Copy Link" 点击率 | ≥ 5%（自传播种子） |

---

## 12. 工期估计

| Week | 内容 | 交付里程碑 |
|---|---|---|
| **W1** | 项目脚手架 + Canvas 基础 + Tier 1+2 渲染 + 抓取 1-30 + 大数字角色截图 | 1-100 完整可玩 |
| **W2** | Tier 3+4+5 + Clubs 引擎 + BigInt + Quick jump + Share/Save | 全数字范围可玩 |
| **W3** | 4 页内容 + SEO meta + 移动端打磨 + IP 防御包 + 部署 + AdSense 申请 | 上线 |

**总计：2-3 周首版**

---

## 13. 验证标准（first-ship "done" 定义）

### 13.1 功能 done
- [ ] 1-30 显示对应 BBC 角色图
- [ ] 31-100 自画方块阵列正确（如 64 = 8×8, 31 顶行 1 块居中）
- [ ] 100, 1K, 1M（如有图）显示对应角色图
- [ ] 101-9999（无图区间）压缩网格 + 数字 label
- [ ] 10K-1B 抽象大方块 + 网格纹理
- [ ] > 1B 或 ∞ 紫色星空 mode
- [ ] 8 个 club 用 Wolfram Alpha 抽 20 个数字验证全对
- [ ] QuickJump 7 个按钮 + ±10/±100 + 🎲 全可用
- [ ] URL `?n=X` / `?n=infinity` 进入即定位
- [ ] Copy Link 写入剪贴板，UI 反馈 "Copied"
- [ ] Save PNG 导出文件名 `numberblock-{n}.png`
- [ ] 移动端 375px 宽度无溢出，所有按钮可点

### 13.2 性能 done
- [ ] Lighthouse Performance ≥ 90 (mobile, throttled 4G)
- [ ] FCP < 1s (LCP < 2s)
- [ ] 输入到出图 P95 < 100ms（Performance API 自测，10 个代表数字）

### 13.3 SEO done
- [ ] 4 页全部 title/meta description（≤ 160 字符）
- [ ] sitemap.xml 提交 GSC
- [ ] Footer fan disclaimer 全站可见
- [ ] OG / Twitter card meta（含 canvas snapshot 图）

### 13.4 IP 防御 done
- [ ] 域名 numberblocxgenerator.com 注册
- [ ] Plan B 域名 1 个注册（备用）
- [ ] Footer disclaimer 全站
- [ ] /about 完整 disclaimer
- [ ] AdSense 单独 Google 账号

### 13.5 部署 done
- [ ] Cloudflare Pages 部署 main 分支自动
- [ ] AdSense 申请提交
- [ ] GSC 验证 + sitemap 提交
- [ ] GA4 安装，child-directed 模式 + ad personalization off

---

## 14. 风险登记

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| BBC 律师函 takedown | 中（流量起来后 10-20%/年） | 高 | Plan B 域名 + 全站 fan disclaimer + 24h takedown SOP |
| AdSense child-directed RPM 太低 | 高（确定） | 中 | RPM $1 心理预期，靠流量补 |
| Wiki / YouTube 截图质量参差 | 中 | 中 | 5-8 张需手工补，预留 1-2 小时 |
| 主词竞争升温（其他人也看到 Trends rising） | 中 | 中 | 上线后 30 天内拿首页排名是关键，速度优势 |
| AdSense 审核不过 | 低 | 高 | 备用 Ezoic / 自营 affiliate（亚马逊 numberblocks 玩具） |
| 性能预算超标 | 低 | 中 | 已有分级渲染策略，Web Worker fallback |

---

## 15. 决策回顾索引

| 决策点 | 选择 | 备选放弃理由 |
|---|---|---|
| 变现路线 | 路 ① 免费 + 广告 | 路 ② SaaS IP 风险大；路 ③ 去 IP 失关键词 |
| IP 立场 | 甲 = 用原 IP 视觉 | 乙/丙 流量受限 |
| 域名 | numberblocxgenerator.com | fan/play 前后缀过长，不如 'x' 替 'k' 简洁 |
| 站点架构 | 4 页（游戏站） | 380 页 programmatic SEO 不适合游戏站 |
| Clubs | 8 类起步（无 Fibonacci） | Fibonacci 算法略贵且非 BBC 重点 |
| 角色素材 | 🅰 BBC 截图 1-30 + 大数字 | 🅱 自画 5-8 天工作量 |
| 工期档位 | ⏱⏱ 2-3 周首版（4 件套全做） | MVP 砍 Clubs / 完整品 5-6 周 |

---

## 16. 原型参考

**已建：** `/Users/yona/numberblocks-prototype/index.html`

**实现内容：**
- 4 层渲染（Tier 1 全自画方块，未用 BBC 截图）
- 8 个 Clubs 实时计算 + UI
- Quick jump + ±step + 🎲 + Copy Link + Save PNG
- 移动端响应式布局
- URL 参数 `?n=X` 进入即定位

**与最终实现差异：**
- 原型 1-100 全自画方块；正式版 1-30 改用 BBC 截图
- 原型用通用 happy face；正式版 1-30 用 BBC 角色独有面部特征
- 原型单文件 inline；正式版 Astro + React island 拆组件
- 原型未做 4 页 SEO 内容；正式版含 /clubs + /faq + /about

原型作为设计验证工具保留，**不直接发布**。

---

## Appendix A: 命名 / 文案术语表

| 术语 | 中文 | 用法 |
|---|---|---|
| Numberblock | 数字方块 | 一个 N 对应的角色 |
| Club | 俱乐部 | 数字属性分类（even/prime/...） |
| Tier | 渲染层 | 按 N 大小切换的 5 个渲染策略 |
| Generator | 生成器 | 产品本身名字的一部分 |
| Stage | 舞台 | Canvas 主渲染区 |
