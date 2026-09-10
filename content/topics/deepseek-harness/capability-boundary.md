## 先给结论

DeepSeek Harness 不是一个模型，也不只是模型外面的一层 Tool Calling 封装。更准确地说，它是一套本地优先的 Agent 运行时和开发框架：负责把模型、工具、会话、上下文、权限、沙箱、后台任务、子 Agent、工作流和界面组装起来，并为这些部件定义生命周期。

它最有价值的地方不是“内置很多工具”，而是把这些能力做成可以替换的插件，并尝试让运行过程可恢复、可观察、可约束。但它不能把不可靠的模型自动变可靠，也不能替业务系统定义什么叫成功。

## 四层能力不要混在一起

理解能力边界时，最好把系统拆成四层：

```text
模型层      生成文本、选择工具、提出下一步
Harness 层  组织 turn/step、上下文、执行、日志、取消与恢复
插件层      文件、Shell、搜索、Skills、子 Agent、工作流、UI
外部世界    操作系统、网络、模型服务、MCP、远端沙箱和凭据
```

模型是否能正确规划，不是 Harness 的保证；Shell 能否访问某个目录，也取决于操作系统和沙箱配置；搜索结果是否可信，更不由 Agent Loop 决定。Harness 能保证的是：在实现覆盖的路径里，输入如何进入、工具如何调度、事件如何记录、取消如何传播，以及插件卸载时哪些注册应被撤销。

## 它已经提供的核心能力

在分析版本 `aa8262ec` 中，官方代码仓库包含以下完整能力面：

- `dsh-agent-loop`：默认 Agent Loop，管理 turn、step、重试、工具调用和取消；
- `dsh-session` 与 JSONL persistence：追加式事件日志、恢复、迁移和导出；
- `dsh-tools`：工具 Schema、参数校验、结果校验、执行拦截和 UI 展示；
- system prompt 与 context 插件：拼装系统提示、项目指令、文件引用和时间等上下文；
- compaction：在上下文压力下压缩已记录历史，而不是简单截断数组；
- sandbox、filesystem、subprocess 与 shell：提供本地执行和隔离接缝；
- approval、credentials：把权限确认与密钥存储从业务工具中拆开；
- goals、jobs、subagents、workflow、schedule：承载更长任务和多 Agent 协作；
- Web、Headless、SDK、ACP 和桌面端：用不同 profile 复用相同后端能力。

这比一个教学用 ReAct Demo 完整得多。它已经处理了大量“模型之外”的工程问题。

## 它不能保证什么

### 不能保证任务正确

Loop 能保证步骤被执行和记录，却不能判断业务答案是否正确。一个模型可能选择错误工具、误读结果或过早停止。除非业务插件增加验证器、测试或人工审批，Harness 不知道“最终答案是否可信”。

### 不能保证任务最终完成

长任务仍可能因为模型错误、上下文压缩损失、网络故障、凭据过期、工具不合作或进程崩溃而失败。Session persistence 让恢复成为可能，但“有日志”不等于“所有外部副作用都能安全重放”。

### 不能保证沙箱绝对安全

官方安全政策仍建议使用权限受限的 VM 或容器。原因很直接：Agent 能执行本机命令，Prompt Injection 可能诱导它读取文件或调用外部服务。沙箱是可配置能力，不是自动覆盖所有插件和操作系统的安全证明。

### 不能保证插件彼此兼容

“一切皆插件”提高了可替换性，也把组合正确性的责任交给 profile、依赖声明和测试。插件能注册服务和事件，不代表任意两个插件组合后语义仍然正确。

### 不能保证 API 稳定

项目仍是 Developer Preview。仓库明确写着会有 compatibility-breaking changes；Session 格式有版本和迁移机制，但公共插件 API 目前不应被当作长期稳定平台。

## 容易被夸大的三句话

“一切皆插件”不等于所有代码都能热插拔。一次性 Headless、SDK、ACP profile 会在启动时固定组合；正在运行的 Agent 也受生命周期和作用域约束。

“本地优先”不等于完全离线。会话默认可以本地保存，但模型 API、Web Search、MCP 或远端沙箱仍会把数据发送给对应服务商。

“能恢复 Session”不等于事务性恢复现实世界。文件写入、Git push、邮件发送等外部副作用，需要工具自身提供幂等性、检查点或补偿逻辑。

## 判断一个能力是否真的存在

阅读源码时，我采用三个条件：

1. 是否有明确的 Service Definition 或事件扩展点；
2. 是否有实际 Provider 或默认组合把它挂进产品；
3. 是否有测试覆盖失败、取消、恢复或卸载，而不只是 happy path。

只满足第一条，说明它只是扩展接口；满足前两条，说明产品能跑；三条都满足，才接近工程能力。

## 本章依据

- [官方产品页](https://deepseek.com/harness/)
- [源码架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/docs/architecture.md)
- [测试策略](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/docs/testing.md)
- [官方安全使用政策](https://www.deepseek.com/harness/privacy/)

_本文分析固定在 2026-09-10 的源码版本 aa8262ec。_
