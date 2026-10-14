## 从一次请求理解系统

第一章回答了“为什么需要工具材料”。这一章接着追问：一项用户请求进入 REA 后，谁检查输入、谁读取目标、谁保留记录，模型最后拿到了什么？读完应能沿文件定位这几个责任，而不是只记住分层名称。

为了看清源码，先选择一条不依赖原生反编译器的路径：`analyze_javascript_application`。它接收本地 JavaScript/Electron 目录或 ASAR，建立结构和语义关系，再形成 Evidence。这里讨论的是固定 `d13c9f84` 的实现，没有把代码阅读写成运行成功。

项目的[架构图](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/architecture.mermaid)大致可以按 Java 工程师熟悉的分层理解：入口适配器处理 CLI/MCP，application 层组织工作流，domain 层表达证据与分析关系，provider 和 bridge 负责连接实际工具。composition 层集中装配这些依赖。

[rea-diagram:pipeline]

图中的分析器不是大模型。源码中建立关系、校验对象和计算身份的流程可以在没有模型参与时完成。大模型在图外，通过宿主选择入口、读结果和提出下一步。

如果熟悉后端开发，可以先把入口视为适配协议的 Controller，把 application 视为组织用例的 Service，把 provider 视为外部能力适配层。这只是帮助理解的类比，不是 REA 中这些层真的按 Java 框架运行。接下来要核对的仍是实际 TypeScript 实现。

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

服务读的是调用方指定的产物，而不是根据名字在网上找一段相似代码。根产物身份把后续关系绑定到这次输入。若新旧版本被混淆，后面的图再精细也回答不了版本回归问题，所以目标身份是语义解释之前的前提。

另一个前提是完整性。文件无法读取、某个模块无法解析、分析被取消时，要保留失败和已知范围。对于调查系统，“把一部分结果包装成全部成功”比直接失败更危险，因为 Agent 可能把缺少的边当作行为不存在。

## 第三层：图把问题变成可查询的关系

产物图表达模块、入口及边界；语义关系图进一步表达定义与读取、局部调用、参数与返回流、部分 Promise 和资源关系。比如模型找到一个 IPC channel 后，可以查询相关模块和处理路径，而不必把全部文件不断塞回上下文。

静态关系仍然有范围。运行时选出的函数、计算属性和外部调用，可能无法唯一解析。文档区分静态目标可解析、运行时已经执行、以及因果得到证明；这三个状态不能互换。`trace_application_feature` 的可达图帮助寻找调查线索，不保证每条路径都会执行。[跨层工作流与语义范围](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L94)

版本比较也保持这种约束。缺失节点只有在相反一侧覆盖完整时，才能解释为新增或删除；输入不完整时应保留未知。名称相似和结构指纹也有不同于内容哈希的证据强度。[版本比较规则](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L149)

### 结构图与语义图为什么都需要

结构图更接近“有哪些东西、它们怎样连接”：模块、入口、IPC、native handoff。语义关系图进一步接近“信息怎样流动”：一个变量来自哪里，调用参数经过什么转换，返回值由哪个消费者读取，Promise 有没有被等待或脱离当前路径。两者绑定到相同根产物，但不能互相替代。

调查时，可以先从已经观察到的字符串或接口名称定位边界，再追问返回对象怎样被下游使用。若返回值由动态属性、间接调用或不支持的 API 形状处理，查询结果应该带着未知，而不是自动补成一条看似连贯的成功路径。

这些查询消费的是已经生成的、经过身份检查的图，不再次执行应用，也不暗中启动 native provider。遇到 native handoff 时，匹配已有证据要求准确的产物 digest；否则给出后续分析需求。这样才能避免把另一个版本的 native 函数解释接到当前 JS 图上。[功能追踪与 handoff 规则](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L45)

## 第四层：封装为可以继续核查的 Evidence

`JavaScriptApplicationEvidence.ts` 将结果固化、校验 JSON 并计算证据标识，绑定根产物 SHA-256。此路径把结果标为 `derived`，来源 authority 为 `shipped-artifact`，同时保存 limitations。随后 Agent 得到的是有来源的分析产物，再决定怎样解释。[Evidence 创建路径](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/application/javascript/JavaScriptApplicationEvidence.ts#L17)

完整数据流因此是：用户给出目标和问题 → 宿主选择工具 → MCP 契约校验请求 → 服务读取与解析产物 → 建立关系图并保留未知 → 结果校验及 Evidence 封装 → 模型读取证据并继续查询 → 用实际样本验证最终解释或实现。

### 深读时怎样建立源码索引

下面是人工整理的阅读索引，不是额外的 REA 配置或完整执行栈。它适合让读者或协作 Agent 逐项定位；真正调用时仍以所用版本的 schema 为准。

```text
协议与输入边界
  src/server/registerElectronTools.ts
  src/contracts/sessionToolContracts.ts
          ↓
JavaScript 用例与失败处理
  src/application/javascript/JavaScriptApplicationService.ts
          ↓
工作进程与语法解析
  src/composition/javascriptAnalysisWorkerProcess.ts
  src/domain/javascript/javascriptSourceParser.ts
          ↓
证据封装与通用结构
  src/application/javascript/JavaScriptApplicationEvidence.ts
  src/domain/evidence.ts
```

阅读时为每个文件留下三条笔记：它接收哪类输入；返回或保留什么；在哪些条件下失败或保持未知。不要把索引里的顺序扩写成每个分支都必经的调用轨迹，也不要把省略的内部调用当成不存在。

### 用一次真实小样本检查这条链

2026-10-14 的自有导出样本实跑使用发布版 6.4.0 CLI，不是 MCP。正确版与缺陷版都包含 `app.mjs`、`present.mjs` 两个文件。Linux 环境中的两次分析均正常退出，结果分别保留目标 digest、`analyze_javascript_application` 操作、`derived` 类别和 `shipped-artifact` 来源。

两版的 `parsed_javascript_files` 都为 2、`parse_failures` 都为 0；结构图都是 7 个节点、8 条边，结构覆盖为 `complete`。但正确版语义图有 42 个节点、26 条关系、14 个 unknown，缺陷版为 38、24、13，语义覆盖都为 `unknown`。这些数字来自实际输出，不是预计值。[命令与行为验收](/topics/rea/hands-on)

这组结果说明两件具体的事。第一，相同的结构图数量不代表行为相同；第二，解析成功不意味着工具完整理解了这段程序。样本中的依赖注入调用与跨模块关系仍有保守未知，不能画成一条已经证明执行的完整链。版本差异还需要选定函数的进一步查询与行为测试。

在 Mac 上，同样的固定包与样本先因进程所有权 Swift helper 编译失败而退出；Linux 完成了这里描述的解析、图封装和 Evidence 阶段。两份结果不能合并成“Mac 已跑通”。失败也并未让 REA 忽略保护继续启动分析工作进程，这是教程记录中必须保留的边界。

## 上下文不是“把所有代码倒给模型”

真实产物的完整分析可能远超一次模型请求适合携带的体积。REA 的保留 Evidence 与 `inspect_analysis_view` 提供了一种问题导向的读取方式：先拿摘要与身份，再按模块、集合或具体关系继续查询。这是确定的记录与视图，不应该笼统叫做“AI 已经记住整个应用”。[CLI 的保存与视图示例](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/cli.md)

宿主可以先保留问题、目标 digest、证据 ID、有关模块与接口、当前假设和未知项。下一轮只查询能区分这些假设的记录；无关的图片资源或所有字符串不必进入同一轮上下文。是否进行压缩、怎样恢复长任务、怎样避免模型忘记先前反证，仍是宿主 Harness 和调查工作流的责任。

这里需要区分三种状态：服务保留了某条记录；工具交付了记录中的某个视图；模型实际读到了并正确使用了它。第一种不自动推出后两种。证据 ID 只是找到记录的入口，不会让模型天然拥有该记录的全部内容。

## CLI 和 MCP 的状态边界

CLI 一条命令对应一个独立进程，下一次命令不能直接依赖上一次内存中的会话。需要跨命令继续时，应保存完整 Evidence 或符合要求的 snapshot，再按对应契约读取。MCP 是长连接适配器，可以保留会话、目标与分析结果；retained-evidence 引用属于相应连接，不是任意客户端永久可用的全局地址。[CLI 生命周期与 MCP 引用说明](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/cli.md)

snapshot 也不是“把反编译器所有状态完整存起来”。它复用符合目标字节、操作、参数、provider 和配置要求的结果；游标相关操作和变更不按普通精确结果缓存。源码明确区分保留观察与 provider 数据库。缓存命中可能节省重复分析，但旧观察不能悄悄成为新目标的事实。

因此，一个调用 REA 的 Agent 至少应该知道自己正调查哪个目标、处在哪个会话、用的是新分析还是保存记录、下一步是否仍有对应 provider。否则“模型的对话上下文还在”也不能保证工具状态仍然有效。

### MCP、Skill、Harness 与 RAG 放在哪一层

这几个名字容易让人误以为系统提供了四套相同能力。MCP 是宿主取得工具结果的协议；Skill 是组织调查的工作流说明；Harness 是推进模型与工具循环的宿主运行环境。只安装 REA 的 Skill，不等于分析服务和引擎已经可用。[Skill 与工具的区分](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/.agents/skills/reverse-engineer-anything/SKILL.md#L16)

RAG 通常从已有资料中检索相关内容；REA 的关键路径还会对指定产物执行分析，生成新的目标绑定记录。两者可以组合，但文档检索不是当前安装包的运行观察，关系图也不自动意味着已经具备向量检索、长期记忆或完整上下文管理。

## 原生引擎为什么另设 Provider

Hopper、Ghidra、IDA 的接口、宿主要求、会话方式和可提供事实不同。REA 使用 provider 适配这些差异，但不能靠统一名称消除差异。注册表的 `auto` 选择在只有一个可用候选时才自动绑定；多个候选可用时返回歧义，要求明确选择。

这体现了一条值得借鉴的 Agent 工程原则：在工具选择会影响结果含义时，把选择依据写进契约和证据，比悄悄换一个工具重试更容易复现。[Provider 选择源码](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/application/binary/AnalysisProviderRegistry.ts#L309)

## 真正进入原生函数时，怎样组织调查

JavaScript 路径让我们看清架构，但原生逆向还需要理解不同表示。反汇编把机器指令表示为汇编；反编译器再依据控制流与类型信息生成伪代码。伪代码便于理解，汇编帮助核对引擎是否误判了位宽、符号、分支和间接调用；两者都不是原作者源码。

对一个已经选定、明确授权的原生函数调查，可以按下面的顺序缩小范围。这是依据工具路径整理的方法，不是本轮已经执行的原生实验。

| 步骤 | 具体要取得的材料 | AI 可以怎样辅助 |
| --- | --- | --- |
| 固定目标与 provider | 文件 digest、格式、架构、引擎版本与实际可用能力 | 依据问题建议入口，不能暗中换目标或引擎 |
| 定位候选 | 函数清单、有关字符串与引用位置 | 把 UI 文案、错误码或协议名改写成聚焦查询 |
| 读取函数 | 选定地址的汇编、伪代码、调用与引用 | 整理分支、输入输出和待核对的类型假设 |
| 跨边界追踪 | 调用者、被调用者、导入、资源及 ABI 线索 | 连接候选路径，保留间接调用与外部语义的未知 |
| 提出有限行为声明 | 比如哪个条件下返回失败、哪些数据会被转换 | 把解释变成可区分的样本，而不是只写注释 |
| 独立验证 | 对应环境、输入、参考结果与候选结果 | 辅助实现和归纳失败，不能替代 oracle |

实际工具选择要从返回的函数名或地址开始，不能默认所有目标都有 `main`，也不能靠名称相似认定某个函数就是处理器。原生查询中的地址属于选定映像、架构和 provider；文件偏移、加载地址和函数入口也不是天然相同的坐标。

读伪代码时可以问五个具体问题：参数是值还是指针？长度按字节还是元素？比较是有符号还是无符号？返回值是成功布尔、错误码还是有效长度？谁负责释放内存？这些往往比“让模型给变量起好名字”更接近接口正确性。工具未取得可靠类型与观察时，就把答案写成假设。

例如某个返回值为零，可能表示成功、取消、零长度结果或空指针。模型根据常见库习惯推断一种解释，不能算已恢复目标协议；需要调用位置、错误处理、已授权样本或文档支持。静态数据库中的调用路径也不证明这条路径在当前操作中执行。

本专题固定 main 的[原生调查指南](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/native-investigation.md)提供函数、指令、引用与 provider 范围说明。具体命令和可用能力应按实际安装版本确认。当前没有本机 Hopper、Ghidra 或 IDA 的分析记录，不能把上表写成已恢复某个真实原生实现。

对当前的 Agent 学习，可以把 [Harness 专题](/topics/deepseek-harness)与本章一起读：前者解释宿主怎样组织循环，REA 展示工具取得的观察怎样进入这个循环。

本章串起了请求、目标、解析、图、Evidence、视图和上下文。它说明系统如何取得与交付材料，尚未证明某个解释正确。下一章进一步判断：什么时候只是静态候选，什么时候拥有运行观察，什么时候足以关闭一项有限的验证要求。
