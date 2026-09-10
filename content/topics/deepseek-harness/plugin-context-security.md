## “一切皆插件”究竟意味着什么

DeepSeek Harness 基于 vendored Cordis。插件向一个共享 `Context` 注册服务、事件监听器和可撤销 effect；插件卸载时，这些注册按生命周期反向撤销。模型适配器、工具注册表、Session persistence，甚至 Agent Loop 本身都不是不可替换的内核。

这不是传统 Spring Bean 容器的简单翻版。Cordis 还强调两件事：作用域和可逆生命周期。

## Profile、Bundle 与 Patch

产品通过配置树启动：

```text
Profile
 ├─ Bundle: base
 ├─ Bundle: web / headless / sdk / acp
 ├─ profile cordis.patch.yml
 ├─ home-level patch
 └─ command-line patch
```

Bundle 提供一组默认插件，Patch 可以按 row id 替换完整配置或插入新插件。`web`、`headless`、`sdk`、`sdk-minimal` 和 `acp` 不是五套独立 Harness，而是不同组合。

这种方式的收益是：换模型、文件系统或沙箱 Provider 时，不必 fork Agent Loop。代价是：最终行为由多层配置和事件监听共同决定，排障时必须看到“实际启动的插件树”，只看某个包的源码不够。

## Agent Scope 解决什么问题

一个服务可以全局注册，也可以只对某个 Agent 可见。`createScope()` 为 Agent 建立 scoped context；工具、Prompt section 或监听器通过该 context 注册后，只在对应 Agent 生命周期内存在。

这让不同 Agent 拥有不同工具集和策略，也让子 Agent 结束时自动撤销资源。但作用域不是安全沙箱：同进程插件仍是受信任代码，可以访问它被注入的 Context 和 Node.js 能力。Scope 解决可见性与生命周期，不等于进程隔离。

## 上下文不是一个 Prompt 字符串

DeepSeek Harness 的上下文至少来自：

- Session log 投影出的模型历史；
- system-prompt 插件注册的 section 和 variable；
- `AGENTS.md` 指令链；
- `inject()` 放入 next-step Inbox 的动态信息；
- 文件、时间、tmux、session reference 等 context 插件；
- compaction 对历史生成的摘要与保留区间。

系统提示与工具 Schema 在每一步重新组装，但真正进入模型的内容必须写入 Session。`agent/pre-step` 可以重写或拒绝输入，`agent/request` 可以调整模型路由。上下文因此是多个插件在明确时点共同产生的可持久化视图。

## Compaction 的能力与损失

Basic Compaction 会选择可压缩的 Session 区间，调用 summarizer，再以事件形式提交摘要。它会检查所选范围在摘要期间是否变化，避免用过期视图覆盖新历史；tool-result pruner 则可以减少旧工具输出占用。

但压缩仍是有损操作。它能控制 token 压力，不能保证摘要保留所有未来任务需要的细节。文件路径、错误文本和关键决策是否被保留，依赖 summarizer 规则和模型表现。对高风险任务，外部状态仍应保存到结构化存储，而不是只依赖自然语言摘要。

## 工具安全有多层，但没有魔法

工具执行经过参数 Schema、`tools/pre-execute`、`tools/execute`、`tools/post-execute`、输出 Schema 和 `finalizeContent`。审批服务可以采用 `ask` 或 `never` policy；sandbox policy 决定执行模式；filesystem policy 和 subprocess Provider 再约束实际操作。

这形成了多层防线，但要注意：

- `execute()` 是同进程 TypeScript 时，取消是协作式的，Harness 不能硬杀不响应 signal 的代码；
- 工具错误声明 `isConcurrencySafe` 不会被 Harness 自动发现；
- approval 为 `never` 时，不会有人类兜底；
- sandbox 是否真正隔离，取决于 macOS Seatbelt、Linux Landlock/bwrap、Windows ACL 或远端 Provider 的实现与配置；
- Prompt Injection 仍可能诱导模型调用“合法但危险”的工具。

## 凭据边界

Credentials service 把环境变量引用和持久授权记录分开。配置界面可以查询“是否已配置、来源、是否可写”，却不能通过该接口读取并展示秘密值。消费者每次操作重新 resolve，避免长期缓存过期 token。

不过，当外部模型、Web Search、MCP 或插件被主动启用时，数据会流向对应服务。官方的数据处理说明也明确指出：本地保存不意味着第三方调用不上传数据。

## 插件化真正适合什么

适合：需要替换模型、工具、存储、沙箱或 UI，并愿意为组合测试投入成本的平台型团队。

不一定适合：只有一个固定业务流程、两三个工具、强领域状态机的应用。此时显式代码可能比配置树更容易审计。

## 本章依据

- [Cordis Primer](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/docs/cordis-primer.md)
- [Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/docs/architecture.md)
- [Compaction subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/aa8262ec091698bae9a6b04773a6b5b06ad4aef2/docs/subsystems/compaction.md)
- [Data Processing Statement](https://www.deepseek.com/harness/data-processing/)

_本文分析固定在 2026-09-10 的源码版本 aa8262ec。_
