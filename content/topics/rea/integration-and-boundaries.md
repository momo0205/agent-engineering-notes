## 接入决策从目标开始

先写出待调查的软件产物、一个具体问题，以及能够判断回答对错的依据。再检查提供方、平台和真实可用工具。若没有可验收的问题，安装更多工具往往只是增加环境成本。

本章的源码事实绑定 `d13c9f84`。公开 npm 6.4.0 来自 `a56f7bb6`；main 保留相同 package version，但已经增加功能与修正。因此版本字符串不足以辨别两份安装的内容。[发布与 main 的区别](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/installation.md#L200)

## 两项特别容易混淆的新能力

| 项目 | 审查时的状态 | 应怎样写教程 |
| --- | --- | --- |
| DeepSeek Harness 自动 setup | main 已有，npm 6.4.0 没有对应 client 注册 | 不提供声称 6.4.0 已支持的 dsh setup 命令 |
| Frida 插桩路径 | 发布提交之后在 main 新增 | 标记源码能力，并另做设备、权限及运行验证 |

这不意味着发布版完全无法经手工 MCP 配置接入 Harness；“自动 setup 尚未发布”与“任何方式均不能连接”是不同结论。REA 的 main 配置走 Harness 官方的 `@deepseek-ai/dsh-mcp-client`，把外部 MCP 工具接入宿主工具注册表。

宿主的 Agent Loop 和模型调用仍在 Harness 中。该 bridge 不支持 MCP prompt templates；REA 的验证脚本使用本地 OpenAI-compatible 模型 fixture，文档没有把它声明为 live DeepSeek API 验证。[REA client 配置说明](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/client-configuration.md#L203)、[Harness 官方 MCP-client 文档](https://github.com/deepseek-ai/deepseek-harness/blob/639ed015397290b3745d163aafe02ffee4aa3f84/packages/mcp/mcp-client/README.md#L167)

## 本地运行的真实含义

REA 取得本地分析结果后，宿主 Agent 会消费这些结果。若宿主使用远端模型，相关内容可能进入模型请求。分析引擎自身也有不同模式与数据政策，需要按实际配置确认。不能从“本地解析”直接推出整个调查过程离线或所有资料都留在本机。[项目的数据说明](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/README.md#L279)

部分观察器会减少敏感字段，但范围有限。例如浏览器 metadata 测试明确要求删除 Authorization、Cookie 等 header，同时保留完整链接中的 query。截图、源码、日志或终端输出也可能包含待审查内容。[具体脱敏测试](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/browser/CdpSafeMetadata.test.ts#L8)

运行进程时，`sensitive` 输入字段可以被隐藏；这不能被理解为终端回显会自动消失。结果记录有保留 raw terminal data 的路径，应根据实际输出判断公开边界。[输入表示](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/domain/process/processScenario.ts#L79)、[终端数据保留](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/process/capture/ProcessCaptureLifecycle.ts#L1313)

## 资源控制与执行权限

REA 为多个路径设计了私有工作目录、进程所有权、超时、响应预算和清理机制。这有助于控制资源、绑定目标和处理失败，但不是通用操作系统 sandbox。打开不可信二进制，会让实际分析引擎以当前用户权限解析它；运行时捕获则会执行或操作选定目标。[项目的安全边界](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/SECURITY.md#L25)

Frida 的用户脚本在目标进程中执行，拥有该进程的内存、文件系统和网络权限。消息保留预算不限制脚本的全部资源；它与只读静态分析应采用不同的使用判断。[main 的 Frida 说明](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/frida-instrumentation.md)

我们的练习先使用自己编写或明确允许分析的目标。REA 本身为 MIT 许可，外部引擎及第三方材料保留各自许可；REA 不提供商业工具的授权。[第三方说明](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/THIRD_PARTY_NOTICES.md)

## 如何与已有 Agent 系统结合

如果系统的任务需要调查软件产物，可以把 REA 接在工具层：明确目标和允许的操作，保存分析配置，取得证据，再由宿主控制循环与预算。最终业务决策还要使用可验证的规范与独立测试。

如果现有任务只是搜索文档、计算确定性指标或处理拥有完整源码的普通业务逻辑，先用已有工具更直接。是否采用 REA，应由缺少的观察能力决定。REA 的加入也不会自动解决 Agent 的上下文整理、长任务恢复或业务正确性问题。

与 [Harness 专题](/topics/deepseek-harness)中的接入判断交叉阅读时，可以分别问三个问题：宿主怎样推进任务？工具实际能观察什么？结论由谁、用什么证据验证？

## 这个专题接下来怎样增长

第一版完成源码阅读、能力与边界分析，以及待实跑教程。下一阶段按自有 JavaScript 产物 → 原生小函数 → 两版产物比较逐步取得本地证据。每项结果独立绑定版本和目标，不覆盖旧观察。

仍待回答的研究问题包括：Agent 比人工调查节省了哪些步骤；复杂动态应用的 unknown 怎样影响结果；摘要与证据分页怎样影响上下文；不同模型怎样改变调查质量；失败后怎样可靠恢复。完成对应实验后，再追加数字、失败记录和采用判断。
