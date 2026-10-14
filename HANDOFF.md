# Handoff

## Agent Evidence Lab project update — 2026-10-14

The existing `/projects/agent-evidence-lab` page now describes the research-Agent goal, code/model responsibilities, verified local capabilities, the saved-source review sample, remaining work and the next problem-driven evidence-reading direction. The next direction is proposed, not implemented. Full M4/M5 and long-running server deployment remain incomplete.

Owner authorization covers this project-page update and publication; it does not extend to rewriting historical articles or other project pages. PR #11 was independently rechecked as merged on 2026-10-14, with test/image CI successful. The latest review sample still has zero experiment runs, and its sandbox rule details remain PARTIAL. Read `docs/review/2026-10-14-agent-evidence-lab-project-review.md` for the source and publication boundary.

Project-page checks: full verify (244 tests plus 5+5 REA example cases), typecheck and changed-file lint pass; desktop/mobile preview is readable without horizontal overflow. Full lint still reports three pre-existing internal-anchor errors on the REA topic page after excluding local worktrees. These were reproduced from the unchanged HEAD version and left outside this update's scope.

## Research-directory update — 2026-10-13

The main navigation now leads to `/topics`, a searchable grouped directory. Agent engineering contains Harness and REA; algorithms/models contains the existing algorithm notebook and Jev. Original topic URLs remain available.

REA has six chapters at `/topics/rea`: positioning, source architecture, Evidence/verification, engineering use cases, hands-on learning and integration boundaries. Source review is pinned to `d13c9f84`; release-based examples use npm 6.4.0 / `a56f7bb6`. The first source and test-design audit is complete; REA tutorials and external engines have not been locally run. Future work should append controlled self-owned JavaScript and native-function experiments with versions, observations, unknowns and independent tests.

Read `docs/review/2026-10-13-rea-topic-review.md` for the current review boundary. Older startup and security instructions below still describe the original site; confirm the actual Git state before treating their historical progress as current.

## Current outcome

`Agent 工程笔记` 已完成首发站点的核心实现：文章模型、安全 Markdown、文章路由、批准的首页视觉、学习路线、项目页、关于页、静态搜索、公开内容安全门禁、CI、RSS、sitemap、robots 和社交分享图。

五篇首发文章已由 owner 在 2026-08-18 逐篇明确批准，状态均为 `published`。不要在未重新审核的情况下扩大、改写或新增可公开的私人项目事实。

## Repository and branch

- Repository: 本机 `agent-engineering-notes` checkout（实际位置由新账号启动时选择）
- Branch: `main`
- Remote: `https://github.com/momo0205/agent-engineering-notes`
- Public site: `https://notes.ironmao.com`
- Platform fallback URL: `https://agent-engineering-notes.team-gpt-8741.chatgpt.site`
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

首发视觉、内容验收、公开访问和自定义域名均已完成。生产 `SITE_URL` 使用 `https://notes.ironmao.com`。

私人工作区根仓库还有两个本地文档提交未推送；此前因 SSH 权限失败。这与本公开仓库相互独立。

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
