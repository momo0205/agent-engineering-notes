## 决策先行

当前不使用 DeepSeek Harness 替换 Agent Evidence Lab，也不把两者强行合并。我们把它作为成熟 Harness 设计的源码样本，吸收设计思想；等现有系统出现明确扩展痛点后，再做隔离的插件实验。

这不是保守地拒绝新技术，而是尊重两套系统不同的目标。

## 两个项目解决的问题不同

Agent Evidence Lab 是一个证据型垂直 Agent。它的核心是：检索证据、限制上下文、验证引用、得出有边界的结论。`BoundedEvidenceAgentLoop` 有明确步数、deadline、工具集合和终态；正确性来自领域协议和测试。

DeepSeek Harness 是通用 Agent 运行平台。它要同时支持 Coding Agent、Web、Headless、SDK、ACP、插件、子 Agent、沙箱、调度和多种模型。它的抽象必须覆盖更大的能力面。

```text
Agent Evidence Lab                DeepSeek Harness
领域目标优先                      通用组合能力优先
固定、受限的证据 Loop             可扩展的多 step ReAct Loop
业务状态和验证器明确              Session event 与插件扩展点明确
Java / Spring 服务                TypeScript / Cordis 插件树
少量工具，刻意收窄                大量可替换能力
```

## 为什么现在替换不划算

### 会丢失学习价值

Evidence Lab 的目的之一，是亲手理解 Context、Harness、Loop、Checkpoint 和 Trace。直接把循环交给大型框架，会让“会配置插件”替代“理解状态机为什么成立”。

### 领域验证不能被框架替代

Harness 能执行 Search Tool，却不知道某个结论引用是否确实来自本轮观察，也不知道 `SUPPORTED` 的业务标准。我们仍需保留 Resolver、Decision Protocol 和 Completion Verifier。替换 Loop 并不会删除核心业务代码。

### 技术栈与成熟度成本明显

现有服务是 Java，DeepSeek Harness 是快速变化的 TypeScript monorepo，公共 API 仍未稳定。现在接入意味着引入 Node 运行时、Cordis 概念、profile/patch 配置、版本跟进和跨进程协议，而业务收益尚不明确。

### 两套持久化语义难以直接叠加

Evidence Lab 的 checkpoint 和 trace 面向领域步骤；DeepSeek Harness 的 Session log 面向通用对话事件。若不先定义谁是事实源，失败恢复时可能同时重放两套状态，产生重复工具调用或冲突终态。

## 三种结合方式

### 方案 A：只吸收设计思想——当前选择

借鉴 append-only 事件、model-visible means logged、工具 call/result 配对、取消收敛、作用域撤销和能力接缝。继续保持现有 Java Loop 和领域协议。

收益最高、风险最低，也最符合当前学习目标。

### 方案 B：把 Evidence Lab 作为外部工具

未来可以提供一个 MCP、HTTP 或 CLI 边界，让 DeepSeek Harness 把“运行一次证据研究”视为单个工具。领域 Loop 仍在 Java 服务内部，Harness 只负责上层交互、文件和工作流。

这是最值得做的实验，因为状态所有权清晰：Harness 负责会话，Evidence Lab 负责证据任务。

### 方案 C：重写为原生插件

把检索、Resolver、Verifier 和领域终态拆成 Cordis 插件，直接参与 `agent/pre-step`、工具执行和 Session events。它能得到最深的组合能力，但耦合预稳定 API，迁移成本最高。

目前没有必要。

## 什么时候值得启动结合实验

满足至少两个信号再开始：

1. Evidence Lab 需要多种 UI、SDK 或 ACP 客户端；
2. 需要频繁替换沙箱、文件系统、模型或子 Agent Provider；
3. 自己维护通用 Session、审批和调度的成本开始超过领域开发；
4. DeepSeek Harness 发布稳定版本，并给出插件 API 的兼容承诺；
5. 有一个可量化实验能比较成功率、恢复率、成本和复杂度，而不是只比较 Demo 观感。

## 如果以后实验，怎样保持可撤回

建立独立 PoC，不改现有生产链路。只暴露一个幂等的 `run_evidence_research` 边界，输入为问题和预算，输出为任务 ID、状态和可验证结论。双方各自持有自己的持久化；Harness 不直接修改 Evidence Lab 内部 checkpoint。

验收指标至少包括：固定集正确率、异常恢复、重复请求幂等性、工具调用次数、token 成本、端到端耗时和运维复杂度。只有明确优于现状，才讨论更深集成。

## 对我们的直接启发

最值得带回现有项目的不是 Cordis 本身，而是三条工程原则：

- 任何模型可见信息都能从持久事实重建；
- 每个外部动作都要有可配对、可审计的结果；
- 取消和恢复必须等资源真正静止，不能只改一个状态字段。

这些原则可以在 Java 中实现，不依赖 DeepSeek Harness。

## 本章依据

- [DeepSeek Harness Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/docs/architecture.md)
- [Agent Loop README](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/packages/core/agent-loop/README.md)
- [ACP 边界说明](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/packages/acp/acp/README.md)

_当前结论：不替换现有系统；先学习，后续只在明确收益下做隔离实验。_
