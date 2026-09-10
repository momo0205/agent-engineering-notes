## 从类名开始，而不是从宣传语开始

默认循环的核心类叫 `ReactLoopAgent`，位于 `packages/core/agent-loop/src/agent.ts`；负责创建、恢复和持有 Agent 的服务叫 `AgentLoop`，位于同包的 `index.ts`。这个命名说明它采用 ReAct 式的“模型输出动作—工具产生观察—模型继续判断”，但源码没有要求模型暴露自由思维链。

## 一条完整主链路

```text
followup / steer / inject
        ↓
ReactLoopInbox
        ↓ wake
ReactLoopAgent.kick()
        ↓
turn() → preStep() → step()
        ↓               ↓
Session append      LLM stream
                        ↓
                 executeToolCalls()
                        ↓
                 Tool result 回到 Session
                        ↓
                 是否需要下一 step
```

### 输入并不只有一种

`Agent` 暴露三个容易混淆的方法：

- `followup()`：进入 `next-turn`，单独开启后续 turn；
- `steer()`：进入 `next-step` 并唤醒 Agent，可以影响正在运行任务的下一步；
- `inject()`：同样进入 `next-step`，但不会唤醒空闲 Agent，只在下一次请求中作为上下文出现。

这比把所有消息都塞进一个数组精细。它让“新任务”“运行中纠偏”和“补充上下文”拥有不同调度语义。

### `kick()` 只负责驱动到静止

`kick()` 循环调用 `turn()`，并在异常或取消后把状态收敛回 idle。`whenIdle()` 观察的是整个 Agent 是否静止，不承诺某一条用户消息必然对应某个输出。因此，调用方如果需要“请求—结果”语义，必须自己持有更明确的运行区间或协议。

### turn 和 step 是两层生命周期

一次 turn 可以包含多个 step。`turn()` 会先写入 `turn/start`，随后反复：

1. 从 Inbox claim 输入；
2. 组装 system prompt 和 context；
3. 经过 `agent/pre-step` waterfall，允许插件修改或拒绝输入；
4. 写入 `step/start`；
5. 调用模型并执行工具；
6. 写入 `step/end`；
7. 没有待处理工具结果或新输入时写入 `turn/end`。

模型没有调用工具时，step 正常完成；调用了工具时，工具结果成为下一 step 的上下文。经典 ReAct 的“Observation”在这里不是一段随意文本，而是持久化的 `tool/result` 事件。

## Session log 是真正的上下文源

源码中最值得注意的原则是：**model-visible means logged**。凡是进入模型请求的事实，都必须能从 Session log 重建。

因此系统不会把某个隐蔽内存数组直接拼给模型。系统提示、用户消息、模型输出、工具调用、工具结果、turn/step 边界都会成为事件；下一次请求由这些事件投影生成。这样 fork、resume、transcript 和 telemetry 才能对同一份历史达成一致。

这也解释了为什么 streaming 同时存在两种表示：

- `agent/assistant-stream` 是进程内的增量 UI 事件；
- 完成或失败后，紧凑 stream 被写入 `assistant/message` 或 `assistant/attempt`，成为持久事实。

如果进程在持久化 settlement 之前硬崩溃，最后那段流可能丢失。源码没有掩盖这个边界。

## 模型请求如何形成

在 `step()` 中，系统先通过 `prepareRequest()` 解析 provider、model、reasoning effort 和 token 上限，再冻结请求。插件可以在 `agent/request` 阶段参与路由；模型适配器通过 `PreparedLlmCall` 绑定实际调用。

请求失败时，`agent/request-error` waterfall 可以决定是否重试。重试不会重新运行 pre-step，也不会重复追加用户消息；失败尝试写为 `assistant/attempt`，避免污染模型历史，却保留排障证据。

## 工具调用不是简单的函数调用

`executeToolCalls()` 处理模型一次返回的多个 tool-call：

- 先按模型顺序准备调用；
- 默认独占执行，只有工具明确声明 `isConcurrencySafe()` 才能进入并发组；
- 并发可以重叠执行，但持久化结果仍按模型调用顺序提交；
- 取消后，已开始的调用先收敛，未开始调用写入合成的 aborted result；
- 每个 `tool/result` 都引用对应 `tool/call` 的序号。

这个策略避免“并发完成顺序”改变下一轮模型上下文，也避免模型发出的 tool-call 永远没有配对结果。

## 生命周期比循环本身更难

`AgentLoop` 创建 Agent 时，要同时处理 Session、持久化 handle、作用域、Registry、父 Agent 关系和取消信号。创建与恢复采用回滚式事务：只有 setup、注册和事件发布都成功后，Agent 才对外可见；失败时反向释放资源。

销毁也不是直接从 Map 删除。它先发送 disposed cancellation，等待循环静止，关闭持久化写入，再撤销 Agent、Session 和 scoped plugins。这里体现了 Harness 工程与 Demo 的差距：困难常常不是“怎么调用模型”，而是“失败发生在任意 await 前后时，谁负责把世界收拾干净”。

## ReAct 在哪里，哪里又不是 ReAct

ReAct 体现在模型和工具观察之间的多 step 循环；但终止、重试、权限、上下文压缩、持久化和并发调度都不是 ReAct 论文自动提供的。这些才是 Harness 增加的工程层。

同样，类名叫 `ReactLoopAgent` 并不意味着它能自动解决任何任务。能否结束、何时结束、最终结果是否正确，仍取决于模型、提示、工具和上层验证机制。

## 本章依据

- [`ReactLoopAgent` 源码](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/packages/core/agent-loop/src/agent.ts)
- [工具调用调度器](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/packages/core/agent-loop/src/tool-calls.ts)
- [Agent 生命周期文档](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/docs/agent-lifecycle.md)

_本文分析固定在 2026-09-10 的源码版本 aa8262ec。_
