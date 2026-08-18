# Handoff

## Current outcome

`Agent 工程笔记` 已完成首发站点的核心实现：文章模型、安全 Markdown、文章路由、批准的首页视觉、学习路线、项目页、关于页、静态搜索、公开内容安全门禁、CI、RSS、sitemap、robots 和社交分享图。

五篇首发文章已由 owner 在 2026-08-18 逐篇明确批准，状态均为 `published`。不要在未重新审核的情况下扩大、改写或新增可公开的私人项目事实。

## Repository and branch

- Repository: 本机 `agent-engineering-notes` checkout（实际位置由新账号启动时选择）
- Branch: `main`
- Remote: 尚未配置
- 本文件所在提交是跨账号交接基线；启动后以 `git log -5 --oneline` 确认实际 SHA。

## Last verified commands

交接前运行：

```bash
npm run lint
npm run typecheck
npm run verify
git diff --check
```

`npm run verify` 依次执行测试、敏感内容扫描、内部链接检查和生产构建。

## Published and review articles

Published:

- `java-to-agent`
- `agent-llm-context-harness`
- `bounded-agent-loop`
- `stance-misclassification`
- `java-vs-python-worker`

Review: 无。

逐篇授权与脱敏记录见 `docs/review/first-release-content-review.md`。

## Security boundaries

- 公开仓库不得读取或依赖私人 `ai-instructure` 工作区。
- 不提交 API Key、账号、私人绝对路径、内部域名/IP、SSH 信息或 Git remote 细节。
- 文章必须经过 `draft -> review -> published`；只有 owner 明确逐篇批准后才能进入 `published`。
- `scripts/scan-public-content.mjs` 固定扫描公开根目录，并拒绝符号链接越界。
- `scripts/check-internal-links.mjs` 拒绝本地绝对路径、`file://` 和越界路径。
- CI 不需要任何模型 API Key，也不得挂载私人工作区。

## Remaining work

1. 对本次五篇内容改动做最终规格与内容质量审查（若交接前未完成）。
2. 需要时补 `docs/design/site-design.md`，将已批准视觉设计整理为公共文档。
3. 在 GitHub 创建公开仓库 `agent-engineering-notes`，配置 remote 并 push。
4. 使用 Sites 发布预览，设置公开 `SITE_URL` 后复核 canonical、RSS、sitemap 与 robots。
5. 将预览链接交给 owner 做最终视觉和内容验收，再决定是否绑定域名。
6. 私人工作区根仓库还有两个本地文档提交未推送；此前因 SSH 权限失败。这与本公开仓库相互独立。

已知非阻塞项：`gray-matter` 在构建中产生上游 direct-eval warning；当前测试与构建通过，但后续可评估替代解析器。

## New Codex account startup

在新账号开始任何编辑前，依次执行：

```bash
cd <local-checkout>/agent-engineering-notes
sed -n '1,240p' README.md
sed -n '1,280p' HANDOFF.md
test -f docs/design/site-design.md && sed -n '1,260p' docs/design/site-design.md || true
git log -10 --oneline
git status --short
npm run verify
```

然后告诉新 Codex：

> 请先阅读 README.md、HANDOFF.md、docs/review/first-release-content-review.md、最近 10 条 Git 记录和当前状态，再继续 Agent 工程笔记。不要读取或复制私人工作区内容；优先完成 HANDOFF 的 Remaining work。

不要复制旧账号的认证目录、账号文件、Cookie、token 或 `~/.codex`。代码、Git 历史、本文和审核记录才是跨账号交接的事实来源。
