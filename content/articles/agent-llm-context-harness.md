---
title: Agent = LLM + Context + Harness，在代码里分别是什么
summary: 用一个真实项目拆开 LLM、Context 与 Harness，并说明 ReAct 和 Agent Loop 当前走到了哪里。
status: published
category: 工程实践
publishedAt: "2026-08-18"
updatedAt: "2026-08-18"
readingMinutes: 11
tags:
  - LLM
  - Context
  - Harness
  - ReAct
---

## 这篇解决什么困惑

“Agent = LLM + Context + Harness”很好记，但落到代码里很容易变成三个误解：LLM 就是 API Key，Context 就是一段 Prompt，Harness 就是某个 Agent 框架。我的项目恰好说明了为什么这三个等式都不完整。

## 关键结论

LLM 是一个外部推理能力，API Key 只是访问凭据；Context 是一次决策能看到的全部信息，以及这些信息的来源、权限和信任标记；Harness 是围绕模型的确定性控制系统。Context 和 Harness 都不是单一文件，而是跨越检索、协议、状态、校验、测试和运行时配置的一组边界。

当前代码已经有小型 ReAct 思想和受限 Agent Loop，但没有实现一个通用自治 Agent。它只服务“搜索证据并判断命题”这一类任务，而且尚缺持久化恢复、生产 trace、真实预算扣减和完整工具异常恢复。

## LLM 在哪里

访问模型时确实需要运行时注入凭据，例如：

```text
DEEPSEEK_API_KEY=[REDACTED]
```

但这只是认证。真正的 LLM 边界还包括模型客户端、请求参数、系统策略、输出协议、供应商异常转换和真实模型评测。

M0 的 Smoke Test 只问一个小问题，用来确认模型连接可用。到了 M2，模型参与 Claim/Evidence 抽取、画像相关性和证据合成；M3 的模型决策适配器则根据已观察证据，在 `SUPPORTED`、`CONTRADICTED` 和 `INCONCLUSIVE` 中作出受约束判断。不同调用共享模型基础设施，但职责、上下文和输出协议并不相同。

## Context 在哪里

Context 不是“把数据库内容全部拼进 Prompt”。在 M3 中，它由多道程序共同形成：

1. Loop 保存当前问题、步骤号、剩余预算和已观察 Claim ID。
2. Evidence Search Tool 只能从既有检索端口获得有上限的证据卡片。
3. `ObservedEvidenceResolver` 只解析 Loop 已观察到的 ID，最多返回十条候选。
4. 模型用户消息只携带判断立场所需的主张、证据片段和有限元数据。
5. 外部文本被标记为不可信 JSON 数据，不能改变系统策略。

因此 Context 是“经过选择、裁剪、标注和授权的数据视图”。数据库、检索排序、用户画像、运行状态、工具结果和 Prompt 共同决定它。少一层，模型可能看不到必要证据；多一层，模型可能得到秘密、无关正文或可执行指令。

## Harness 在哪里

Harness 是把概率模型关进可测试流程的部分。在当前代码里，它至少包括：

- `BoundedEvidenceAgentLoop`：控制步骤、deadline、观察集合、重复搜索和终态。
- `DecisionProtocolCodec`：严格解析版本化 JSON 决策，拒绝未知字段、重复键和尾随内容。
- `SearchEvidenceTool`：把工具能力压缩成受类型约束的搜索接口。
- `CompletionVerifier`：检查结论引用是否真的在本轮观察过。
- 模型决策适配器：限制候选 ID、提示词、模型参数和安全错误码。
- 单元、集成、固定集与可选真实模型评测：验证边界没有只停留在设计图里。

Harness 还包含“系统不做什么”：模型不能直接查数据库、不能执行任意工具、不能发明 URL，也不能因为输出了 `STOP` 就自行宣布成功。

## ReAct 思想如何体现

ReAct 的核心不是一定要让模型输出英文 `Thought`，而是让推理与行动在反馈中交替。当前流程可以简化为：

```text
Observe：读取问题、预算和已有观察
Decide：无观察时决定 SEARCH；有证据时由模型判断
Act：执行受类型约束的 Evidence Search
Observe：把返回的 Claim ID 记入观察
Verify：校验 STOP 引用和状态
Recover / Stop：一次恢复，或进入确定终态
```

第一步没有证据时，决策引擎确定性地产生搜索动作，不调用模型。搜索后，Resolver 把已观察 ID 转为有界证据上下文，模型再给出停止决策。Verifier 不信任这个决策，只接受引用过已观察 Claim 的合规结论。这已经具有“行动—观察—再判断”的循环结构。

它与经典 ReAct Demo 的差别是：系统不保存或展示模型的自由思维链，决策使用严格 JSON；工具只有证据搜索；循环最多三步；恢复也只有一次。对当前任务而言，这种收缩是优势，因为每一步都能被测试。

## 对应测试证据

Loop 测试覆盖搜索后只能引用已观察 Claim、空检索可得出无结论、重复搜索只恢复一次、伪造引用失败、deadline 和步数耗尽不会多执行一步。模型决策测试覆盖未知引用、非法 Schema、供应商故障和不完整上下文失败关闭。真实模型固定集完整经过 Search → Resolve → Decide → Verify → Stop，但它只有五类样本。

## 真实踩坑

我曾把“LLM 已接入”听成“AI 部分已完成”，后来才意识到模型调用只是一个组件。另一个坑是 Context 过于抽象：如果只在文档中说“使用 RAG”，就看不出谁选择数据、上限是多少、模型能否越权。把 Context 拆到 Resolver、检索和协议后，安全边界才真正可检查。

还有一个坑是把 Harness 理解为外部框架。实际上，项目最关键的 Harness 多数是自己写的普通 Java 类和测试。框架能提供客户端和扩展点，却不能替我定义什么算完成、哪些引用可信、失败后是否应恢复。

## 适用边界、当前与未来

这个拆法适合工具型、证据型 Agent，不代表所有 Agent 都需要相同组件。当前 Loop 没有开放 HTTP Agent API，没有持久化 checkpoint，没有完整的步骤、工具调用和模型用量记录，也没有按真实用量扣减预算。未来还要补充通用工具异常恢复和重规划；M4 才会加入人工审批与隔离实验执行。

所以，答案是：受 ReAct 启发的行动—观察闭环与 Bounded Loop 已写，但它只是一条受限、可验证的垂直切片。它证明架构方向成立，还没有证明完整 ReAct 或通用自主执行能力成立。

_更新时间：2026-08-18_
