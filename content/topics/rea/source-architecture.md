## 从一次请求理解系统

为了看清源码，先选择一条不依赖原生反编译器的路径：`analyze_javascript_application`。它接收本地 JavaScript/Electron 目录或 ASAR，建立结构和语义关系，再形成 Evidence。这里讨论的是固定 `d13c9f84` 的实现，没有把代码阅读写成运行成功。

项目的[架构图](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/architecture.mermaid)大致可以按 Java 工程师熟悉的分层理解：入口适配器处理 CLI/MCP，application 层组织工作流，domain 层表达证据与分析关系，provider 和 bridge 负责连接实际工具。composition 层集中装配这些依赖。

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

## 第二层：分析产物，保留中断和失败

`JavaScriptApplicationService.ts` 验证输入，组织产物重建，校验结果及跨图绑定，然后封装 Evidence。取消、资源限制或解析失败有专门的结果处理；在能够保留部分观察时，错误仍带着已完成的证据。

静态路径不把目标应用加载到 Node 中执行。它读取产物，并交给解析与分析流程。分析工作进程中的 `parseJavaScriptSource` 使用 Babel 生成 AST，再提取静态事实、语义关系和图节点。这与启动 Electron、操作浏览器或执行目标命令是不同的工具路径。[工作流服务](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/application/javascript/JavaScriptApplicationService.ts#L46)、[分析工作进程](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/composition/javascriptAnalysisWorkerProcess.ts#L22)、[Babel 解析边界](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/javascript/javascriptSourceParser.ts#L110)

## 第三层：图把问题变成可查询的关系

产物图表达模块、入口及边界；语义关系图进一步表达定义与读取、局部调用、参数与返回流、部分 Promise 和资源关系。比如模型找到一个 IPC channel 后，可以查询相关模块和处理路径，而不必把全部文件不断塞回上下文。

静态关系仍然有范围。运行时选出的函数、计算属性和外部调用，可能无法唯一解析。文档区分静态目标可解析、运行时已经执行、以及因果得到证明；这三个状态不能互换。`trace_application_feature` 的可达图帮助寻找调查线索，不保证每条路径都会执行。[跨层工作流与语义范围](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L94)

版本比较也保持这种约束。缺失节点只有在相反一侧覆盖完整时，才能解释为新增或删除；输入不完整时应保留未知。名称相似和结构指纹也有不同于内容哈希的证据强度。[版本比较规则](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L149)

## 第四层：封装为可以继续核查的 Evidence

`JavaScriptApplicationEvidence.ts` 将结果固化、校验 JSON 并计算证据标识，绑定根产物 SHA-256。此路径把结果标为 `derived`，来源 authority 为 `shipped-artifact`，同时保存 limitations。随后 Agent 得到的是有来源的分析产物，再决定怎样解释。[Evidence 创建路径](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/application/javascript/JavaScriptApplicationEvidence.ts#L17)

完整数据流因此是：用户给出目标和问题 → 宿主选择工具 → MCP 契约校验请求 → 服务读取与解析产物 → 建立关系图并保留未知 → 结果校验及 Evidence 封装 → 模型读取证据并继续查询 → 用实际样本验证最终解释或实现。

## 原生引擎为什么另设 Provider

Hopper、Ghidra、IDA 的接口、宿主要求、会话方式和可提供事实不同。REA 使用 provider 适配这些差异，但不能靠统一名称消除差异。注册表的 `auto` 选择在只有一个可用候选时才自动绑定；多个候选可用时返回歧义，要求明确选择。

这体现了一条值得借鉴的 Agent 工程原则：在工具选择会影响结果含义时，把选择依据写进契约和证据，比悄悄换一个工具重试更容易复现。[Provider 选择源码](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/application/binary/AnalysisProviderRegistry.ts#L309)

对当前的 Agent 学习，可以把 [Harness 专题](/topics/deepseek-harness)与本章一起读：前者解释宿主怎样组织循环，REA 展示工具取得的观察怎样进入这个循环。
