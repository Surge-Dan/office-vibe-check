# Office Vibe Check · 班味鉴定所

一个为小红书离线 H5 小工具设计的动态职场趣味测评：用国内真实工作场景，测出你靠哪套求生本能撑到今天。

## 发布信息

- 小工具名称：`班味鉴定所`
- 简介：`测测你靠啥撑到下班`
- 图标：`dagongren-mini-tool/tool-icon.png`
- 部署包：`dagongren-mini-tool.zip`
- 推荐版本号：`2.0.0`
- 所需权限：选择`相册照片与视频`，仅用于把用户主动生成的报告保存到相册；不选择摄像头和麦克风

## 这次重构了什么

旧版固定 7 题、8 类简单结果已经替换为完整动态测评：

- 54 道原创职场场景题：12 道必答锚点、36 道维度分支、4 道一致性校准、2 道隐藏题
- 每位用户实际回答 18–21 题，后续问题由前 12 题结果确定
- 9 个连续维度：卷入驱动、情绪内耗、边界主权、向上表达、躺平阈值、执行闭环、讨好倾向、冲突策略、利益博弈
- 每个选项同时影响 2–4 个维度，按用户实际回答路径归一化到 0–100
- 18 种常规动物体质和 4 种隐藏体质，相同答案稳定得到相同路径、分数和报告
- 完整报告包含体质总览、九维雷达图、优势、雷区、行动建议、工作模式、止损提醒和第二相似体质
- 生成 1080×2400、非透明背景的高清社交长图
- 使用小红书官方 `writeTempFile → saveImageToPhotosAlbum` 保存相册，使用 `postNote` 打开图文笔记发布页
- 页面刷新可恢复未完成答题，完成后只缓存最近一份报告；不收集姓名、公司、账号等身份信息

## 测评逻辑

### 动态路径

1. 用户先完成 12 道基础画像题。
2. 引擎计算九维临时得分、证据数和答题一致性。
3. 选择偏离中位值最大的三个维度，每个维度确定性抽取两道深挖题。
4. 同一维度同时出现明显正负极端反应时，追加 0–2 道校准题。
5. 特定组合满足证据条件时，追加 0–1 道隐藏题。
6. 最终路径为 `12 + 6 + 0–2 + 0–1 = 18–21` 题，无随机数、无循环、无重复题。

返回修改锚点答案时，尚未作答的旧分支会被清除并重新计算，防止旧路径污染新结果。

### 计分与人设匹配

每个维度按实际回答题目的理论最低分和最高分归一化：

```text
score = (chosenSum - minPossibleSum) / (maxPossibleSum - minPossibleSum) × 100
```

人设使用置信度加权的九维原型距离匹配；隐藏人设还必须同时满足题目选项和分数区间，不能靠一道题随机覆盖主结果。本工具不宣称使用未经样本校准的 IRT、CAT、MBTI 或临床量表。

## 视觉设计

视觉概念是“职场动物观察所”：

- 档案白、复写蓝、检验红、荧光便签构成纸质检材系统
- 标题使用系统宋体，正文使用系统黑体，编号和分数使用等宽字体
- 动物不是 Emoji 或通用 AI 插画，而是由本地 Canvas 生成的原创橡皮章线刻符号
- 页面报告与导出长图共享同一套动物、维度颜色和档案语言
- 支持 360/390/430px 移动宽度、键盘焦点、安全区和 `prefers-reduced-motion`

设计只保留一个强记忆点——“动物档案长卷”，没有蓝紫渐变、玻璃卡片、机器人、霓虹光和仪表盘堆叠。

## 小红书离线 H5 约束

`dagongren-mini-tool/` 是最终源码目录，所有发布文件保持扁平：

```text
index.html
style.css
dimensions.js
questions.js
archetypes.js
animals.js
assessment-engine.js
radar-renderer.js
report-renderer.js
exporter.js
main.js
tool-icon.png
```

- `index.html` 直接位于 ZIP 根目录
- 只使用外置经典脚本和 `./` 相对路径
- 不使用 ES Module、内联脚本、行内事件、外部 CDN、网络请求、剪贴板、文件下载、Worker、WASM、iframe 或新窗口
- Canvas 只做本地雷达图、动物印章和报告绘制
- `localStorage` 仅保存本地会话和报告，不保证永久持久化
- Bridge 缺失或用户拒绝相册权限时，文字报告仍可阅读，并可在页面预览长图
- 最终 ZIP 实际保持全扁平，兼容发布后台曾出现的“子路径不安全”校验

本轮平台适配依据仓库 `.codex/SKILL.md` 中的小红书官方 `minitool-zip-builder` 及其四份 reference 完成。平台上传、真机 WebView 和正式审核仍需在小红书后台完成最终确认。

## 本地运行

不需要构建步骤或第三方前端依赖：

```powershell
python -m http.server 4174 --bind 127.0.0.1 --directory dagongren-mini-tool
```

浏览器访问 `http://127.0.0.1:4174/index.html`。

## 测试

核心逻辑与平台契约：

```powershell
node --test tests/dagongren/assessment-engine.test.js tests/dagongren/exporter.test.js tests/dagongren/renderers.test.js tests/dagongren/mini-tool.test.js
```

其中包含 100,000 条确定性路径模拟，会验证：

- 18/19/20/21 四种路径长度均实际出现
- 22 种体质均能由真实答题路径到达
- 所有维度分数保持在 0–100
- 路径无重复、结果稳定、隐藏类型不误触发

浏览器端验收：

```powershell
$env:MINI_TOOL_PORT = '4174'
python tests/dagongren/mini-tool.browser.py
```

浏览器测试覆盖首页、漏答拦截、返回保留、三次过渡、动态路径、完整报告、雷达图、1080×2400 图片、最近报告恢复、360/390/430px 响应式、控制台错误和外部请求。

原生 XHSML 小组件仍保留在 `dagongren-tizhi-widget/`，它是历史版本，与本次发布后台要求的离线 H5 ZIP 不是同一种格式，本次重构没有修改它。

## 研究与产品边界

出题和结果结构参考了多维连续测评、职场行为定义、动物原型和规则分支的公开产品思路，但题目、人设和文案均重新创作：

- [O*NET Work Styles](https://www.onetonline.org/find/descriptor/browse/1.D)
- [IPIP](https://ipip.ori.org/)
- [16Personalities methodology](https://www.16personalities.com/articles/our-theory)
- [ETS branching-item research](https://www.ets.org/research/policy_research_reports/publications/report/2022/kero.html)

完整产品、算法、内容和验收规格见：

- `docs/superpowers/specs/2026-08-23-dagongren-assessment-rebuild-design.md`
- `docs/superpowers/plans/2026-08-23-dagongren-assessment-rebuild-implementation-plan.md`
