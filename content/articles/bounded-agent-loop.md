---
title: 第一个 Bounded Agent Loop：先限制，再谈自主
summary: 一个只有三步上限的证据 Agent Loop，已经能做什么、为什么仍不能称为生产可用。
status: published
category: 工程实践
publishedAt: "2026-08-18"
updatedAt: "2026-08-18"
readingMinutes: 10
tags:
  - Agent Loop
  - 安全
  - 测试
  - Java
---

## 这篇解决什么困惑

第一次实现 Agent Loop 时，我最想写的是“模型决定下一步、调用工具、直到完成”。但“直到完成”恰好是最危险的部分：谁判断完成？模型重复调用怎么办？工具返回空结果怎么办？服务器重启后状态在哪里？

因此第一个版本刻意叫 Bounded Agent Loop。它的目标不是最大自主性，而是在一个狭窄任务里证明 Observe、Decide、Act、Verify、Recover、Stop 能形成闭环，同时每条路径都有确定终态。

## 关键结论

现在的 Loop 已能完成固定证据搜索任务：先搜索，再根据观察到的证据判断用户命题，最后由独立 Verifier 检查引用。它有最大步数、deadline、Token 预算存在性、重复决策检测和一次恢复机会。

但这些还不足以称为 production-ready。当前 Trace 主要存在于单次运行返回值中；checkpoint 没有持久化；Token 预算尚未按供应商实际用量扣减；工具异常没有统一分类、退避和重规划；对外运行、查询、取消和恢复 API 也尚未开放。

## 一次运行如何流动

运行请求包含运行 ID、问题、画像版本、最大步骤、截止时间和模型 Token 预算。Loop 每一步先检查 deadline 和预算，然后构造 `DecisionRequest`。请求不把整份证据正文交给任意执行面，只携带问题、步骤、剩余预算与观察记录。

没有观察时，当前决策引擎返回 `SEARCH_EVIDENCE`。类型化工具调用既有检索端口，将结果转换为 Claim ID，Loop 把 ID 加入观察集合。下一步，进程内模型适配器只解析这些已观察 ID，构建最多十条候选的上下文，并要求模型返回严格的 `STOP` JSON。

模型说停止后仍不算完成。`CompletionVerifier` 会合并支持和反对引用，检查它们是否都属于观察集合；`SUPPORTED` 必须有支持引用，`CONTRADICTED` 必须有反对引用。失败时，Loop 允许一次恢复决策；再次失败就进入 `FAILED`。

```text
Run request
  → budget check
  → Decide: SEARCH_EVIDENCE
  → Act: typed search tool
  → Observe: bounded Claim IDs
  → Decide: strict model STOP
  → Verify: citation policy
  → COMPLETED / one Recover / FAILED
```

## “受限”具体限制了什么

第一是步骤。测试确认达到上限后不会偷偷多给模型一次机会。第二是时间。deadline 在决策前检查，过期直接产生 `BUDGET_EXHAUSTED`。第三是重复动作。同一搜索词与数量组成签名，重复搜索触发恢复，再重复则失败，避免原地循环。

第四是观察边界。Loop 只把工具实际返回的 Claim ID 记为已观察；模型不能凭空引用数据库中的其他对象。第五是完成权。模型只能提出完成，Verifier 才能接受完成。第六是上下文数量，模型最多看到十个已观察候选，每个候选的证据片段也有限制。

这里有一个容易误读的细节：请求里存在 `modelTokenBudget`，并会在零值时停止，但当前代码没有根据每次真实模型 usage 持续扣减它。因此它还是“预算护栏的形状”，不是完整的成本控制。

## 对应代码与测试证据

核心逻辑位于公开可描述的 `agent/loop` 模块：Loop、运行请求、步骤记录、终态和 Completion Verifier。`agent/loop/protocol` 定义版本化决策；`agent/runtime` 负责 Java 模型决策和受限证据解析；检索工具复用 `evidence/retrieval` 端口。

自动化测试至少证明了这些行为：搜索后可用已观察引用完成；空搜索可安全返回 `INCONCLUSIVE`；未知引用只允许一次恢复；同一搜索不会重复执行工具；deadline 到期时决策引擎不会被调用；步骤耗尽没有额外决策。模型侧还测试严格 Schema、候选 ID 约束和供应商错误不泄露原始内容。

真实模型固定集覆盖支持、反对、证据不足、类似提示词注入和无关干扰，最终一次记录为 5/5 正确终态、0 false completion。这个结果只能说明固定门通过，不能外推到开放世界输入。

## 真实踩坑

早期确定性策略只要检索到 Claim 就当作支持，导致五类固定任务只有两类语义正确。Java 和 Python Worker 得到相同的 40% 结果，说明执行速度和隔离都无法弥补判断策略错误。

另一个坑是把内存里的 `AgentStepTrace` 当成可观测性完成。它对测试很有价值，但服务重启后无法恢复，也不能按运行查询模型用量和工具调用。真正的生产 trace 需要持久化结构、关联 ID、敏感数据策略和查询接口。

## 适用边界

当前实现适合证明证据搜索 Agent 的控制流，也适合作为后续 checkpoint、trace 和恢复的骨架。它不适合直接接入任意 shell、浏览器或高风险工具，更不能用于未经审批的实验执行。工具数量从一个增加到多个后，还需要注册表、权限和错误策略，而不是简单增加几个 `if`。

## 当前与未来

M3 仍在进行。后续至少要完成：持久化 Run/Step checkpoint 与重启恢复；生产级 Decision、Tool 和模型用量 trace；按真实 usage 扣减 Token/费用；工具超时、失败和部分结果的分类恢复；认证的运行、状态、结果、取消与恢复 API。

更晚的 M4 才会引入人工批准和隔离实验执行。Bounded Loop 不是缩水版目标，而是先把自主性拆成可证明的权限。每增加一种自由，就增加一条预算、校验和恢复证据。

_更新时间：2026-08-18_
