## 报告首先要回答“这个结论来自哪里”

逆向分析容易产生看起来很合理的解释：字符串像接口名，两个函数名称相似，某次运行恰好出现了预期结果。要继续验证，必须能回到具体文件、地址、工具版本、请求参数和观察范围。

REA 的 Evidence 契约包含 subject 的 SHA-256、provider/version、analysis profile、operation/parameters、原始与归一化结果、locations、limitations 和证据引用。它为追查提供结构；结论是否正确，还需要检查产生这些数据的过程。[Evidence schema](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/evidence.ts#L113)

## confidence 不是“有多大概率正确”

REA 的 `confidence` 只有三个类别：

| 类别 | 阅读时应该追问 |
| --- | --- |
| observed | 实际观察了什么，在哪个工具和范围内？ |
| derived | 根据哪些观察，通过什么规则派生？ |
| inferred | 推断用了哪些假设，还有哪些解释？ |

这些类别不提供概率校准或统计正确率。静态 JavaScript 图可以是从发布产物派生的结果，但不因此变成对运行时行为的观察。本网站的 [Jev 概率研究](/topics/jev)讨论另一种数值输出，两者不能混用。[confidence 与 authority 的定义](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/evidence.ts#L98)

## 哈希证明一致性，不替代真值

`authenticatedEvidence` 会重新计算规范化内容的标识并检查是否匹配。源码实现的是内容与 ID 的一致性检查，没有把这条记录变成独立第三方签名或事实认证。

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

## 读完所有页，不等于分析完整

REA 能保留完整证据，并通过摘要和后续视图交付较大结果。需要分别检查原始分析的覆盖范围、服务保留的集合和模型实际读取的内容。分页的 `exhausted` 只表示当前查询窗口到达该集合末尾；它不证明前页已经读过，也不覆盖同一记录的其他视图。[页窗口的计算](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/analysisView/analysisViewCoverage.ts#L14)

如果解析失败、图被资源限制截断，或运行时只观察了某个场景，即使模型读完所有页，也不能把“没有看到”改成“确定不存在”。transport 响应预算、producer 的分析覆盖、模型实际读取的上下文，应分别检查。[MCP 的保留结果与交付边界](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/mcp-contracts.md#L71)

## 重建怎样才算通过验证

`verify_reconstruction` 检查一组有限、类型化的行为和结构声明。通过只说明这些声明拥有完整且可比较的证据；缺失、受限和未解决的证据仍保持未知。不能把它扩大为原始源码或全局行为等价。[工具契约](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/contracts/sessionToolContracts.ts#L135)

重建 obligation ledger 更进一步：每项必须由明确 owner、所需类型或 fixture、可比较 authority 的 verifier 等共同关闭。矛盾、缺少依赖和残留未知会阻止关闭。这种“要满足哪些可核查义务”的设计，比让模型说一句“已完成重建”更有工程意义。[重建义务账本](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/reconstruction-obligation-ledgers.md#L10)

## 怎样阅读测试证据

本轮看到了动态语义、图标识一致性、会话绑定和清理方面的测试。但 fake provider 或模拟协议测试，只证明对应的集成逻辑。真实引擎、实际宿主平台与具体语义，需要另外的验证路径。项目自己的测试文档也区分了这些层次；本专题没有独立重跑它们。[测试的行为层次](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/testing.md#L190)

实际复盘时，至少记录问题、产物与工具版本、观察依据、未知项、独立测试及失败样本。后续即使换一个模型，别人仍应能复查这条结论。
