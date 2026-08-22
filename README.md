# Office Vibe Check · 班味鉴定所

一个面向小红书小组件的轻量职场趣味测试。

完成 7 道职场场景选择题，测出你更接近哪一种“打工人体质”，并生成一张可以分享的班味档案。

> 不是职业测评。只是想知道，你每天到底是怎么活下来的。

## 功能

- 7 道真实职场场景单选题，每题 4 个选项
- 8 种打工人体质：摸鱼隐士体、低调卷王体、画饼免疫体等
- 进度展示、返回修改和重新测试
- 本地确定性计分，结果可重复复现
- 本地保存最近一次结果
- 页面内展示结果档案，并提供平台分享入口
- 深色档案局视觉风格，适合移动端快速浏览

## 技术边界

这是一个单页面原生小红书小组件工程，不是普通 HTML 页面，也不是多页小程序。

- 只有 `pages/index/index` 一个页面
- 不接后端、不接网络、不接登录
- 不申请用户身份权限
- 不使用第三方 UI 框架、CDN 或远程资源
- 不使用未确认的 Canvas、相册保存等小程序专属能力
- 题目、体质文案和评分规则全部本地化
- 包体积远低于小红书小组件 2MB 限制

工程结构参考小红书官方[小组件代码构成](https://miniapp.xiaohongshu.com/doc/DC602239)。小组件是否可创建、预览和发布，以账号后台实际资格和官方开发者工具版本为准。

## 导入小红书开发者工具

1. 下载或克隆本仓库。
2. 打开小红书官方开发者工具当前的小组件模板。
3. 将 `dagongren-tizhi-widget/` 作为项目根目录导入。
4. 如果 IDE 自动生成项目配置文件，以官方模板生成的配置为准。
5. 预览首页、完成 7 道题，并检查结果页和分享入口。

也可以直接使用仓库中的 [`dagongren-tizhi-widget.zip`](./dagongren-tizhi-widget.zip) 作为轻量交付包。

## 本地测试

项目逻辑使用 Node.js 原生测试，不需要安装第三方依赖：

```bash
node --test tests/dagongren/quiz-core.test.js tests/dagongren/widget-contract.test.js
```

当前测试覆盖：

- 题目数量和选项数量
- 体质库完整性和可达性
- 计分结果稳定性
- 不完整答案和未知答案拦截
- 单页面 XHSML 结构
- 本地运行和 API 边界
- 不误用 Canvas、相册保存等能力
- 包体积限制

## 目录结构

```text
.
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
│  └─ widget-contract.test.js   # 小组件结构约束测试
└─ docs/superpowers/
   ├─ specs/                    # 产品设计文档
   └─ plans/                    # 开发计划
```

## 内容与隐私

内容围绕摸鱼、内卷、画饼、背锅、班味、会议和下班等常见职场语境设计。结果仅供娱乐，不代表真实职业能力或人格判断。

工具不保存姓名、手机号、头像、账号、工作单位、职业等身份信息，也不上传完整答题记录。

## 当前验证边界

本仓库已经完成代码结构、核心逻辑、包体积和静态 API 约束验证。由于开发环境没有小红书原生开发者工具和灰度发布权限，真机预览、平台分享行为和正式审核仍需在官方工具中完成最终确认。

## 相关文档

- [产品设计文档](./docs/superpowers/specs/2026-08-19-dagongren-tizhi-detector-design.md)
- [开发计划](./docs/superpowers/plans/2026-08-19-dagongren-tizhi-detector-implementation-plan.md)
- [小红书小组件介绍](https://miniapp.xiaohongshu.com/doc/DC026740)
