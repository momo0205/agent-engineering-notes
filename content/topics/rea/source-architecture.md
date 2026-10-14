## 从一次请求理解系统

为了看清源码，先选择一条不依赖原生反编译器的路径：`analyze_javascript_application`。它接收本地 JavaScript/Electron 目录或 ASAR，建立结构和语义关系，再形成 Evidence。这里讨论的是固定 `d13c9f84` 的实现，没有把代码阅读写成运行成功。

项目的[架构图](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/architecture.mermaid)大致可以按 Java 工程师熟悉的分层理解：入口适配器处理 CLI/MCP，application 层组织工作流，domain 层表达证据与分析关系，provider 和 bridge 负责连接实际工具。composition 层集中装配这些依赖。

```text
CLI 一次性命令                 宿主 Agent 的 MCP 调用
       └──────────────┬──────────────┘
                     ↓
       契约：输入 / 输出 / 工具效果 / 错误
                     ↓
       Application：目标、分析、比较、验证工作流
             ┌───────┴────────┐
             ↓                ↓
   Domain：图 / Evidence   Provider / Bridge / Worker
        / unknown             ↓
                      解析器、引擎或观察目标
             └───────┬────────┘
                     ↓
       保留结果 → 摘要或选定视图 → 宿主上下文
```

图中的分析器不是大模型。源码中建立关系、校验对象和计算身份的流程可以在没有模型参与时完成。大模型在图外，通过宿主选择入口、读结果和提出下一步。

## 第一层：把协议请求交给工作流

`src/server/registerElectronTools.ts` 从统一工具契约取得 schema，再注册处理函数。`analyze_javascript_application` 被交给 `analyzeJavaScriptApplicationValidated`；如果调用方选择摘要，成功后才生成保留证据的视图。

```typescript
// 根据实际处理链压缩出的阅读示意，并非独立可运行程序。
const analyzed = await analyzeJavaScriptApplicationValidated(
  request, artifactResources, { signal, progress },
);
return detail === "summary" && analyzed.ok
  ? summarizeRetainedAnalysis(analyzed.value, options)
  : analyzed;
```

这一层负责协议与参数边界，不负责猜测应用行为。摘要也需要保留完整 Evidence，避免模型看到一个无法继续核查的结论。[MCP 注册处理](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/server/registerElectronTools.ts#L95)

这里值得关注的不只是“注册一个工具”。如果输入、输出、错误和操作效果各自散在不同调用处，模型容易不知道哪些操作只读、哪些会启动目标；客户端也难以一致地解释失败。统一契约让这些边界有一个可以检查的定义。它仍然需要实现与测试兑现，schema 本身不是安全或正确性证明。[工具契约源码](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/contracts/sessionToolContracts.ts)

## 第二层：分析产物，保留中断和失败

`JavaScriptApplicationService.ts` 验证输入，组织产物重建，校验结果及跨图绑定，然后封装 Evidence。取消、资源限制或解析失败有专门的结果处理；在能够保留部分观察时，错误仍带着已完成的证据。

静态路径不把目标应用加载到 Node 中执行。它读取产物，并交给解析与分析流程。分析工作进程中的 `parseJavaScriptSource` 使用 Babel 生成 AST，再提取静态事实、语义关系和图节点。这与启动 Electron、操作浏览器或执行目标命令是不同的工具路径。[工作流服务](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/application/javascript/JavaScriptApplicationService.ts#L46)、[分析工作进程](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/composition/javascriptAnalysisWorkerProcess.ts#L22)、[Babel 解析边界](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/javascript/javascriptSourceParser.ts#L110)

把这层放回教学案例：服务读的是指定导出工具的安装产物，而不是根据名字在网上找一段相似代码。根产物身份把后续关系绑定到这次输入。若新旧版本被混淆，后面的图再精细也回答不了版本回归问题，所以目标身份是语义解释之前的前提。

另一个前提是完整性。文件无法读取、某个模块无法解析、分析被取消时，要保留失败和已知范围。对于调查系统，“把一部分结果包装成全部成功”比直接失败更危险，因为 Agent 可能把缺少的边当作行为不存在。

## 第三层：图把问题变成可查询的关系

产物图表达模块、入口及边界；语义关系图进一步表达定义与读取、局部调用、参数与返回流、部分 Promise 和资源关系。比如模型找到一个 IPC channel 后，可以查询相关模块和处理路径，而不必把全部文件不断塞回上下文。

静态关系仍然有范围。运行时选出的函数、计算属性和外部调用，可能无法唯一解析。文档区分静态目标可解析、运行时已经执行、以及因果得到证明；这三个状态不能互换。`trace_application_feature` 的可达图帮助寻找调查线索，不保证每条路径都会执行。[跨层工作流与语义范围](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L94)

版本比较也保持这种约束。缺失节点只有在相反一侧覆盖完整时，才能解释为新增或删除；输入不完整时应保留未知。名称相似和结构指纹也有不同于内容哈希的证据强度。[版本比较规则](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L149)

### 结构图与语义图为什么都需要

结构图更接近“有哪些东西、它们怎样连接”：模块、入口、IPC、native handoff。语义关系图进一步接近“信息怎样流动”：一个变量来自哪里，调用参数经过什么转换，返回值由哪个消费者读取，Promise 有没有被等待或脱离当前路径。两者绑定到相同根产物，但不能互相替代。

例如假设案例中的字符串 `report:export` 可能先帮助找到有关边界；随后才追问返回对象怎样进入 UI 状态。这里的 channel 是教学示例，不能当作某款软件的真实名称。若返回值由动态属性、间接调用或不支持的 API 形状处理，查询结果应该带着未知，而不是自动补成一条看似连贯的成功路径。

这些查询消费的是已经生成的、经过身份检查的图，不再次执行应用，也不暗中启动 native provider。遇到 native handoff 时，匹配已有证据要求准确的产物 digest；否则给出后续分析需求。这样才能避免把另一个版本的 native 函数解释接到当前 JS 图上。[功能追踪与 handoff 规则](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L45)

## 第四层：封装为可以继续核查的 Evidence

`JavaScriptApplicationEvidence.ts` 将结果固化、校验 JSON 并计算证据标识，绑定根产物 SHA-256。此路径把结果标为 `derived`，来源 authority 为 `shipped-artifact`，同时保存 limitations。随后 Agent 得到的是有来源的分析产物，再决定怎样解释。[Evidence 创建路径](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/application/javascript/JavaScriptApplicationEvidence.ts#L17)

完整数据流因此是：用户给出目标和问题 → 宿主选择工具 → MCP 契约校验请求 → 服务读取与解析产物 → 建立关系图并保留未知 → 结果校验及 Evidence 封装 → 模型读取证据并继续查询 → 用实际样本验证最终解释或实现。

## 上下文不是“把所有代码倒给模型”

真实产物的完整分析可能远超一次模型请求适合携带的体积。REA 的保留 Evidence 与 `inspect_analysis_view` 提供了一种问题导向的读取方式：先拿摘要与身份，再按模块、集合或具体关系继续查询。这是确定的记录与视图，不应该笼统叫做“AI 已经记住整个应用”。[CLI 的保存与视图示例](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/cli.md)

对导出案例，宿主可以先保留问题、两个目标的 digest、证据 ID、有关模块与 IPC、当前假设和未知项。下一轮只查询取消分支相关记录；无关的图片资源或所有字符串不必进入同一轮上下文。是否进行压缩、怎样恢复长任务、怎样避免模型忘记先前反证，仍是宿主 Harness 和调查工作流的责任。

这里需要区分三种状态：服务保留了某条记录；工具交付了记录中的某个视图；模型实际读到了并正确使用了它。第一种不自动推出后两种。证据 ID 只是找到记录的入口，不会让模型天然拥有该记录的全部内容。

## CLI 和 MCP 的状态边界

CLI 一条命令对应一个独立进程，下一次命令不能直接依赖上一次内存中的会话。需要跨命令继续时，应保存完整 Evidence 或符合要求的 snapshot，再按对应契约读取。MCP 是长连接适配器，可以保留会话、目标与分析结果；retained-evidence 引用属于相应连接，不是任意客户端永久可用的全局地址。[CLI 生命周期与 MCP 引用说明](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/cli.md)

snapshot 也不是“把反编译器所有状态完整存起来”。它复用符合目标字节、操作、参数、provider 和配置要求的结果；游标相关操作和变更不按普通精确结果缓存。源码明确区分保留观察与 provider 数据库。缓存命中可能节省重复分析，但旧观察不能悄悄成为新目标的事实。

因此，一个调用 REA 的 Agent 至少应该知道自己正调查哪个目标、处在哪个会话、用的是新分析还是保存记录、下一步是否仍有对应 provider。否则“模型的对话上下文还在”也不能保证工具状态仍然有效。

## 原生引擎为什么另设 Provider

Hopper、Ghidra、IDA 的接口、宿主要求、会话方式和可提供事实不同。REA 使用 provider 适配这些差异，但不能靠统一名称消除差异。注册表的 `auto` 选择在只有一个可用候选时才自动绑定；多个候选可用时返回歧义，要求明确选择。

这体现了一条值得借鉴的 Agent 工程原则：在工具选择会影响结果含义时，把选择依据写进契约和证据，比悄悄换一个工具重试更容易复现。[Provider 选择源码](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/application/binary/AnalysisProviderRegistry.ts#L309)

对当前的 Agent 学习，可以把 [Harness 专题](/topics/deepseek-harness)与本章一起读：前者解释宿主怎样组织循环，REA 展示工具取得的观察怎样进入这个循环。

本章串起了请求、目标、解析、图、Evidence、视图和上下文。它说明系统如何取得与交付材料，尚未证明某个解释正确。下一章继续用导出案例判断：什么时候只是静态候选，什么时候拥有运行观察，什么时候足以关闭一项有限的验证要求。
