## 报告首先要回答“这个结论来自哪里”

本章要解决的是一个实际阅读困难：工具已经交回很多数据，怎样判断模型接下来的解释有没有越界？先用普通语言区分材料和结论，再看 Evidence 字段、unknown 规则以及真实比较输出。

逆向分析容易产生看起来很合理的解释：字符串像接口名，两个函数名称相似，某次运行恰好出现了预期结果。要继续验证，必须能回到具体文件、地址、工具版本、请求参数和观察范围。

REA 的 Evidence 契约包含 subject 的 SHA-256、provider/version、analysis profile、operation/parameters、原始与归一化结果、locations、limitations 和证据引用。它为追查提供结构；结论是否正确，还需要检查产生这些数据的过程。[Evidence schema](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/evidence.ts#L113)

## 不同材料，只支持对应范围内的声明

先区分材料与解释。下面列的是阅读和记录规则，不是一份已经完成的应用调查报告。

[rea-diagram:verification]

| 可以记录的材料 | 目前支持的声明 | 不能直接推出的结论 | 下一步核对 |
| --- | --- | --- | --- |
| 产物内出现指定字符串 | 指定字节或模块中包含该字符串 | 用户这次操作执行了此模块 | 查引用、入口与实际加载位置 |
| 静态图连接接口与一个返回消费者 | 存在工具可表达的候选关系 | 实际操作必然经过这条路径 | 核对分支、动态调用与场景观察 |
| 一次操作后记录到指定结果 | 这个环境和窗口内出现了该现象 | 该现象必由某个静态差异造成 | 对照条件、替代解释及干预实验 |
| 新旧版本有关模块结构不同 | 在已覆盖产物中存在差异 | 差异是回归的原因 | 固定环境、输入与观察面后比较 |
| 候选实现通过约定的行为测试 | 指定实现满足该项测试要求 | 复刻了整个原应用 | 扩充已声明范围，保留范围外未知 |

这种写法把“观察到了什么”与“我认为为什么发生”拆开。模型可以帮助提出假设，但不能通过把语言写得更肯定，替代尚未取得的证据。

特别是静态变化与运行变化同时出现，只说明值得调查的共同变化。因果判断还需要更强的依据，例如在控制其他条件后改变有关实现、重放同一输入，并查看现象是否随之改变。REA 的 `correlate_static_and_runtime` 契约也明确要求调用方声明假设，不把相似名称或共同变化自动当作因果。[静态与运行相关契约](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/contracts/sessionToolContracts.ts#L129)

## confidence 不是“有多大概率正确”

REA 顶层 Evidence 的 `confidence` 有三个类别；图内观察的 `confidence` 属于另一套契约，不能混读：

| 类别 | 阅读时应该追问 |
| --- | --- |
| observed | 实际观察了什么，在哪个工具和范围内？ |
| derived | 根据哪些观察，通过什么规则派生？ |
| inferred | 推断用了哪些假设，还有哪些解释？ |

这些类别不提供概率校准或统计正确率。静态 JavaScript 图可以是从发布产物派生的结果，但不因此变成对运行时行为的观察。本网站的 [Jev 概率研究](/topics/jev)讨论另一种数值输出，两者不能混用。[confidence 与 authority 的定义](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/evidence.ts#L98)

例如本轮实跑的 Evidence 顶层为 `derived`，其中部分 AST 观察为 `exact`。后者表达该观察在相应图契约内的身份与来源强度，不是概率值，也不会把整份静态分析提升为运行时事实。

还要区分 `confidence` 与 `authority`：前者描述 observed、derived、inferred 的类别，后者帮助辨别发布产物、运行观察或其他来源。同一句“返回 canceled”如果来自静态候选、一次实际运行或模型解释，证据意义不同。不能只摘出一个字段，省略来源和 limitations 后说“工具确认了”。

## 哈希证明一致性，不替代真值

`authenticatedEvidence` 会重新计算规范化内容的标识并检查是否匹配。源码实现的是内容与 ID 的一致性检查，没有把这条记录变成独立第三方签名或事实认证。

换句话说，拿当前内容重算标识并对上，说明两者自洽；如果内容和标识一起被替换，单靠这一步并没有外部可信锚点。因此不能将它写成“保证记录从未被篡改”。文件哈希与预先可信的参考值比较，可以帮助识别字节是否变化；可信参考从哪里来，是另外一个问题。

因此，一个完全自洽的错误观察仍可能拥有正确哈希。文件哈希能绑定目标字节，不能证明伪代码准确、模型理解正确，或某次有限观察覆盖了全部行为。[标识检查源码](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/evidence.ts#L161)

## unknown 是分析结果的一部分

考虑下面的短程序：

```javascript
const selected = condition ? left : right;
selected(input);
receiver[key](input);
```

第一处调用有多个可能目标，第二处取决于运行时属性。若静态分析把它们强行写成一条确定调用链，后续模型会在错误前提上继续推理。REA 的对应测试要求保留歧义调用和动态属性边界。[动态调用测试](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/javascript/javascriptSemanticAnalysis.calls.test.ts#L255)

对象字段也有类似问题：一个后出现的计算属性可能覆盖前面的 `preload`。测试要求把结果保留为动态或未知，而不是只提取前面那个看起来明确的值。[计算属性覆盖测试](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/javascript/electronStaticAnalysisOptions.test.ts#L42)

### 未解决、被反驳和不在范围内，并不是同一种状态

调查中，我们可能不知道某个 native 函数是否实际被调用；可能已经发现反驳某条候选路径的证据；也可能主动决定不研究其他操作系统上的行为。第一种需要继续取证，第二种需要修正解释，第三种只是范围决定，不是真值结论。

REA 的 unknown 契约包含记录、修订和 resolution 校验。`update_unknown` 要求准确的 `expected_revision`，旧修订不能悄悄覆盖新结论；resolution 也需要对应证据和来源要求。这个机制值得借鉴，但前提仍是调用方如实提供材料，并把范围决定与证明分开。[unknown 生命周期契约](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/contracts/sessionToolContracts.ts#L140)

## 读完所有页，不等于分析完整

REA 能保留完整证据，并通过摘要和后续视图交付较大结果。需要分别检查原始分析的覆盖范围、服务保留的集合和模型实际读取的内容。分页的 `exhausted` 只表示当前查询窗口到达该集合末尾；它不证明前页已经读过，也不覆盖同一记录的其他视图。[页窗口的计算](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/analysisView/analysisViewCoverage.ts#L14)

如果解析失败、图被资源限制截断，或运行时只观察了某个场景，即使模型读完所有页，也不能把“没有看到”改成“确定不存在”。transport 响应预算、producer 的分析覆盖、模型实际读取的上下文，应分别检查。[MCP 的保留结果与交付边界](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/mcp-contracts.md#L71)

## 实跑对照：零个 changed 为什么不是没有变化

先把“返回形状”理解为一个函数可能交出的结果对象具有哪些字段、分支和字面量状态。比较需要建立两侧的对应关系；没有足够依据时，不能靠名字相似或“看起来应该对应”强行匹配。

本轮对两份完整导出样本 Evidence 调用了发布版 `compare-javascript-export-shapes`，精确选择两侧 `present.mjs` 的 `presentExportResult`。先用配对示意建立直觉，再看原始结果中的字段。

[rea-diagram:pairing]

下面的 JSON 片段从实际 `normalized_result` 摘取，只显示有关字段，不是可直接导入的完整 Evidence：

```json
{
  "summary": { "added": 0, "removed": 0, "changed": 0, "unknown": 1 },
  "coverage": {
    "status": "partial",
    "paired_variants": 2,
    "unpaired_left_variants": 1,
    "unpaired_right_variants": 0
  }
}
```

输出将正确版中 `present.mjs` 第 2 行的一个返回 variant 保留为未配对，理由是没有 reciprocal unique literal discriminant，也就是没有能在两侧互相唯一对应的字面量判别依据。其他两项返回 variant 得到了配对。它并没有将这个未知自动归类为 removed，更没有直接诊断“取消 bug”。

写作 Agent 核对该来源位置与样本源码，解释“缺陷版缺少取消状态处理”。行为证据则来自事先固定的独立 Node 探针：同一个 `{ canceled: true }` 输入，正确版返回 idle，缺陷版返回 success。这个样本和故障原本就是我们设计的，不能说 REA 首次发现了未知 bug。完整命令、样本和五项验收在[实践章](/topics/rea/hands-on)。

如果只把 `changed: 0` 摘出来，报告就会得出错误的“没有变化”；如果把 `unknown: 1` 改写成工具已经证明删除，则夸大了静态结果。真正有用的调查是保留未知、定位相关材料，再提出能区分解释的实验。

同样，缺陷版的 unknown 数量比正确版少一个，不能当成质量提升或工具更确定。代码少了一个分支，也可能让需要表达的事实和未知一起减少。计数必须和范围、内容及验收一起阅读。

这组数字本身并不误导；误读发生在读者跳过 `unknown` 和 `coverage`，或把人工核对得出的解释归功于工具已经证明。配对图帮助理解这个实例，不将其提升为整个专题的真实应用案例。

## 重建怎样才算通过验证

`verify_reconstruction` 检查一组有限、类型化的行为和结构声明。通过只说明这些声明拥有完整且可比较的证据；缺失、受限和未解决的证据仍保持未知。不能把它扩大为原始源码或全局行为等价。[工具契约](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/contracts/sessionToolContracts.ts#L135)

重建 obligation ledger 更进一步：每项必须由明确 owner、所需类型或 fixture、可比较 authority 的 verifier 等共同关闭。矛盾、缺少依赖和残留未知会阻止关闭。这种“要满足哪些可核查义务”的设计，比让模型说一句“已完成重建”更有工程意义。[重建义务账本](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/reconstruction-obligation-ledgers.md#L10)

为候选实现声明义务时，应分别写清输入、预期返回、允许的副作用与错误条件。自定义的业务规范不能假称为已经观察到的原软件协议。随后为每项准备输入、环境、观察方法和 oracle，也就是判断结果的独立依据。

只检查界面文案，不能证明文件副作用；未覆盖错误分支，也不能关闭“所有错误正确处理”。验证的关键不是测试数量，而是每项声明需要什么证据，以及缺少时是否保持 unknown。

## 防止模型与验证形成一个自我确认圈

如果模型先猜测规范，再根据猜测生成实现，最后生成只覆盖自身实现的测试，三者一致仍可能都偏离目标。人类复核也有同样风险：看到似乎合理的伪代码后，只挑能支持解释的样本。

更可靠的研究设计是把真值与候选分开。自有小实验把源码或参考实现留在 oracle 一侧；候选只接受约定接口与产物调查材料。测试不仅检查典型输入，也包含能区分不同解释的边界、异常与状态组合，避免不同实现仅在顺利路径上表现相同。

这不是宣称 REA 自动隔离 oracle 或自动建立独立评测，而是我们使用它时应该遵守的实验方法。测试失败必须反过来修改解释和未知记录，不要为了让候选通过而悄悄修改验收标准。

## 怎样阅读测试证据

本轮看到了动态语义、图标识一致性、会话绑定和清理方面的测试。但 fake provider 或模拟协议测试，只证明对应的集成逻辑。真实引擎、实际宿主平台与具体语义，需要另外的验证路径。项目自己的测试文档也区分了这些层次；本专题没有独立重跑它们。[测试的行为层次](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/testing.md#L190)

至少有四层验证需要分别阅读：领域测试检查图、身份和未知规则；适配器测试检查请求、响应、错误和生命周期；真实引擎测试检查对应版本与平台能否分析目标；场景测试检查特定输入与环境的实际行为。前面几层通过，不意味着最后一层的业务结论已成立。

TDD 在这里最有价值的地方，是先写出“不应该被误判”的条件：动态调用不能变成确定边；截断不能变成完整；provider 不同不能直接比较为相同；没有运行观察不能声称执行；新证据不能被旧修订覆盖。此类测试守住的是结论强度，而不只是 JSON 能否成功返回。

实际复盘时，至少记录问题、产物与工具版本、观察依据、未知项、独立测试及失败样本。后续即使换一个模型，别人仍应能复查这条结论。

下一章把这套证据要求带入实际工程：不是罗列“可以逆向哪些东西”，而是为每个场景明确输入、调查步骤、交付物和停止条件。
