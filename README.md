# Agent 工程笔记

一个记录 Agent Engineering 学习过程的中文内容站。它从 Java 后端工程师的视角出发，关注代码、实验、失败和工程判断，而不是堆叠 AI 名词或框架教程。

首发内容围绕 Agent Evidence Lab，覆盖 LLM、Context、Harness、受约束 Agent Loop、真实模型评测，以及 Java/Python 执行面的取舍。

## Public boundary

这个仓库是独立的公开发布面，不读取、挂载或同步私人工作区。进入这里的内容必须经过脱敏、自动检查和 owner 逐篇批准。

禁止提交：

- API Key、Token、Cookie、Authorization Header 或私钥；
- 私人绝对路径、账号、主机名、IP、SSH 和内部 Git remote；
- 可推导私人基础设施拓扑的配置；
- 未经允许的第三方源码或大段受版权保护内容；
- 尚未审核的私人项目事实。

CI 只读取当前公开仓库，不需要模型 API Key，也不访问私人工作区。

## Local development

需要 Node.js 22.13.0 或更高版本。

```bash
npm install
npm run dev
```

默认本地地址由开发服务器输出。生产构建读取可选的 `SITE_URL` 作为公开 canonical origin；未设置时使用本地回退地址。`SITE_URL` 必须是无路径、查询参数和凭据的 HTTP(S) origin。

## Verification

```bash
npm run verify
```

该命令依次运行测试、公开内容敏感信息扫描、站内链接检查和生产构建。

额外的独立检查：

```bash
npm run lint
npm run typecheck
```

发布或提交内容前，以上三条命令都应通过。

## Content model

文章位于 `content/articles/*.md`，由严格 Frontmatter Schema 校验。必要字段包括标题、摘要、状态、分类、发布日期、更新时间、阅读时间和标签。

状态流转：

```text
draft -> review -> published
```

- `draft`：本地草稿，不进入公开查询。
- `review`：等待事实、语气和公开边界审核，不进入文章列表、详情、RSS 或 sitemap。
- `published`：仅在 owner 明确逐篇批准并通过所有检查后使用。

不要通过修改查询逻辑绕过状态门。审核证据和脱敏记录保存在 `docs/review/`。

## Architecture

- React/Vinext：页面、路由和 Cloudflare Worker-compatible 构建；
- Markdown + `gray-matter`：版本化文章源文件；
- Zod：严格 Frontmatter；
- `marked` + `sanitize-html`：唯一 HTML 信任边界；
- 构建期文章仓库与客户端元数据搜索；
- GitHub Actions：无 secret 的验证流水线；
- RSS、sitemap、robots、canonical 和 Open Graph；
- Sites：首个在线预览与托管目标。

视觉、页面结构和延期范围见 `docs/design/site-design.md`。跨账号或跨机器继续工作前先读 `HANDOFF.md`。

## Deployment

首次发布前：

1. 运行完整验证；
2. 创建公开 GitHub 仓库并推送 `main`；
3. 通过 Sites 发布预览；
4. 设置公开 `SITE_URL`；
5. 检查首页、代表性文章、RSS、sitemap、robots 和 canonical；
6. 经 owner 最终验收后再考虑绑定域名。

自定义域名不是首发前置条件。
