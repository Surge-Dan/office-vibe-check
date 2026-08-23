# Office Vibe Check · 班味鉴定所

一个面向小红书小工具 / 小组件的轻量职场趣味测试。

完成 7 道职场场景选择题，测出你更接近哪一种“打工人体质”，并生成一个可以转发的班味档案。

> 不是职业测评。只是想知道，你每天到底是怎么活下来的。

## 功能

- 7 道真实职场场景单选题，每题 4 个选项
- 8 种打工人体质：摸鱼隐士体、低调卷王体、画饼免疫体等
- 每种体质保留 5 条短批注，按确定性变体索引展示和分享
- 进度展示、返回修改和重新测试
- 本地确定性计分，结果可重复复现
- 本地保存最近一次结果
- 页面内展示结果档案，并提供平台分享入口
- 深色档案局视觉风格，适合移动端快速浏览

发布后台截图对应的是离线 H5 小工具版本：`班味鉴定所`，简介为 `7道题，测出你的打工人体质`。

## 可上传的小红书小工具版本

如果你进入的是截图中的“上传部署代码”页面，请上传 [`dagongren-mini-tool.zip`](./dagongren-mini-tool.zip)，不要上传原生 XHSML 包。

- H5 根目录入口：`index.html`
- 交付包大小：约 1.23 MB，低于 10 MB 上限，也低于建议的 2 MB
- 图标：[`tool-icon.png`](./dagongren-mini-tool/assets/tool-icon.png)，1:1 PNG，约 1.23 MB，符合截图中的 5 MB 限制
- 小工具名称：`班味鉴定所`
- 简介：`7道题，测出你的打工人体质`
- 运行方式：纯本地、离线、单页面，无网络、登录、外链、剪贴板和下载能力

H5 包的目录内容直接位于 ZIP 根目录，包含 `index.html`、外置经典脚本、外置 CSS、本地题库和图标，符合官方离线 H5 ZIP 规范。

## 技术边界

仓库同时保留两个明确隔离的交付版本：

1. `dagongren-mini-tool/`：对应发布后台截图的离线 H5 小工具；
2. `dagongren-tizhi-widget/`：此前完成的原生 XHSML 小组件版本。

### H5 离线小工具

- 根目录必须是 `index.html`
- 脚本全部外置并使用经典脚本，不使用 ES Module
- 所有资源使用 `./` 相对路径并打进 ZIP
- 不使用网络、外链、`eval`、`new Function`、`iframe`、下载、剪贴板、Worker 或设备权限
- 使用 `localStorage` 保存最近一次结果，不保存身份信息和完整答案

### 原生 XHSML 小组件

- 只有 `pages/index/index` 一个页面
- 不接后端、不接网络、不接登录
- 不申请用户身份权限
- 不使用第三方 UI 框架、CDN 或远程资源
- 不使用未确认的 Canvas、相册保存等小程序专属能力
- 题目、体质文案和评分规则全部本地化
- 包体积远低于小红书小组件 2MB 限制
- 交付包只保留小红书允许上传的源码和资源后缀，不把 Markdown 文档混入小组件包

工程结构参考小红书官方[小组件代码构成](https://miniapp.xiaohongshu.com/doc/DC602239)和[小组件结构及上传文件白名单](https://miniapp.xiaohongshu.com/doc/DC923374)。小组件是否可创建、预览和发布，以账号后台实际资格和官方开发者工具版本为准。

## 设计哲学

这个项目不把“测评”做成一张堆满标签的问卷，而是把一次职场自嘲压缩成一个可复述的结果。

- **减法优先**：只有一个主任务——完成测试并看懂自己的结果；不做登录、排行榜、评论和后台。
- **内容即界面**：`CASE 001`、`SPECIMEN / F-01`、体质短句和编号系统共同构成产品记忆点，而不是靠装饰性卡片堆层次。
- **先给反馈，再讲道理**：每题立即反馈选中态，结果先给一句能被转发的判断，再补充解释。
- **确定性优先**：相同答案得到相同结果，题库、计分和文案都能离线验证，避免“AI 测评”式的不可解释。
- **不伪装专业**：明确标注“仅供娱乐”，把共鸣和表达放在职业诊断之前。

视觉上采用“职场档案局”方向：石墨黑负责压住班味，荧光黄绿表示状态确认，低饱和珊瑚红负责主要行动，形成更接近小红书内容封面而不是后台工具的识别度。

## 导入小红书发布后台 / 开发者工具

### 发布后台截图对应的 H5 小工具

1. 小工具名称填写：`班味鉴定所`。
2. 简介填写：`7道题，测出你的打工人体质`。
3. 图标上传：`dagongren-mini-tool/assets/tool-icon.png`。
4. 部署代码上传：`dagongren-mini-tool.zip`。
5. 版本号可从 `1.0.0` 开始，最终以后台要求为准。

### 原生小组件开发者工具

1. 下载或克隆本仓库。
2. 打开小红书官方开发者工具当前的小组件模板。
3. 将 `dagongren-tizhi-widget/` 作为项目根目录导入。
4. 如果 IDE 自动生成项目配置文件，以官方模板生成的配置为准。
5. 预览首页、完成 7 道题，并检查结果页和分享入口。

原生版本可以使用 [`dagongren-tizhi-widget.zip`](./dagongren-tizhi-widget.zip)；它与 H5 ZIP 不是同一种发布格式。

## 本地测试

项目逻辑使用 Node.js 原生测试，不需要安装第三方依赖：

```bash
node --test tests/dagongren/quiz-core.test.js tests/dagongren/widget-contract.test.js tests/dagongren/page-flow.test.js tests/dagongren/mini-tool.test.js
```

浏览器流程测试需要 Playwright：

```powershell
# 终端 A：启动本地静态服务器
python -m http.server 4177 --directory dagongren-mini-tool

# 终端 B：运行浏览器验收（Windows）
$env:MINI_TOOL_PORT = "4177"
python tests/dagongren/mini-tool.browser.py
```

浏览器测试完成后，在终端 A 按 `Ctrl+C` 停止服务器。测试脚本会覆盖启动、答题、返回保留答案、完成结果、刷新恢复、异常选择拦截，以及“无外网请求”检查。

当前测试覆盖：

- 题目数量和选项数量
- 体质库完整性和可达性
- 计分结果稳定性
- 结果短批注变体、最近一次结果和分享 query 的一致性
- 不完整答案、跨题答案和未知答案拦截
- 选择、继续、返回、完成、重测和上次结果流程
- 异常本地缓存不渲染空白结果
- 单页面 XHSML 结构
- 页面文件和 `app.json` 路径一致
- 上传文件后缀白名单
- 本地运行和 API 边界
- 不误用 Canvas、相册保存等能力
- 包体积限制
- H5 `index.html` 根入口、外置脚本、相对资源和 ZIP 平铺结构
- H5 禁用能力扫描、图标资源和 10 MB 上传包限制
- H5 浏览器首页、答题、返回、完成、结果和最近结果流程

## 目录结构

```text
.
├─ dagongren-mini-tool/
│  ├─ index.html                # H5 根入口
│  ├─ assets/main.js            # 单页状态和 DOM 事件
│  ├─ assets/quiz-core.js       # 题库校验和计分
│  ├─ assets/style.css          # 职场档案局视觉样式
│  ├─ assets/tool-icon.png      # 发布后台图标
│  └─ data/                     # 本地题库和体质库
├─ dagongren-tizhi-widget/
│  ├─ app.json                 # 小组件全局配置
│  ├─ app.js                   # 小组件入口
│  ├─ assets/quiz-core.js      # 题库校验、进度和计分逻辑
│  ├─ data/questions.js        # 7 道题目
│  ├─ data/types.js             # 8 种打工人体质
│  └─ pages/index/
│     ├─ index.xhsml            # 唯一页面模板
│     ├─ index.js               # home / quiz / result 状态机
│     └─ index.css              # 档案局视觉样式
├─ tests/dagongren/
│  ├─ quiz-core.test.js         # 核心逻辑测试
│  ├─ widget-contract.test.js   # 小组件结构约束测试
│  ├─ page-flow.test.js         # 原生小组件页面流程测试
│  ├─ mini-tool.test.js         # H5 静态、算法和 ZIP 契约
│  └─ mini-tool.browser.py      # H5 Playwright 浏览器流程
└─ docs/superpowers/
   ├─ specs/                    # 产品设计文档
   └─ plans/                    # 开发计划
```

## 内容与隐私

内容围绕摸鱼、内卷、画饼、背锅、班味、会议和下班等常见职场语境设计。结果仅供娱乐，不代表真实职业能力或人格判断。

工具不保存姓名、手机号、头像、账号、工作单位、职业等身份信息，也不上传完整答题记录。

## 当前验证边界

本仓库已经完成原生 XHSML 与离线 H5 两种版本的代码结构、核心逻辑、页面流程、浏览器流程、包体积和静态能力约束验证。本轮 H5 适配依据工作区 `.codex/SKILL.md`（从官方提供的 `minitool-zip-builder` skill 下载）及其 4 份 reference 执行。由于开发环境没有小红书发布后台的真实上传权限，真机 WebView、容器外壳表现、发布后台预览和正式审核仍需在官方页面中完成最终确认。

官方资料显示，小组件目前要求单页面、包体积不超过 2MB，并限制支付、交易、导航等复杂能力；当前仍处于邀请制灰度阶段。[小组件介绍](https://miniapp.xiaohongshu.com/doc/DC026740)

平台分享当前实现为“结果页 + 自定义分享标题 + 结果类型/文案变体 query + 站内分享入口”：接收者打开分享链接后会直接看到对应体质和同一条短批注，不会只回到首页。它不是本地生成图片或写入相册，这样能保持交付包轻量，也避免把未确认的 Canvas/相册能力伪装成已验证功能。[小组件转发](https://miniapp.xiaohongshu.com/doc/DC835356)

## 相关文档

- [产品设计文档](./docs/superpowers/specs/2026-08-19-dagongren-tizhi-detector-design.md)
- [开发计划](./docs/superpowers/plans/2026-08-19-dagongren-tizhi-detector-implementation-plan.md)
- [离线 H5 适配设计](./docs/superpowers/specs/2026-08-23-dagongren-mini-tool-design.md)
- [小红书小组件介绍](https://miniapp.xiaohongshu.com/doc/DC026740)
