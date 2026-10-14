## 先把问题说具体

你接手一个没有完整源码的桌面工具，想知道它怎样处理剪贴板；一个本地 SDK 升级后，同样的输入产生了不同结果；线上使用的打包文件似乎与仓库里的代码不一致。这些问题都需要取得软件产物或运行行为的证据，再逐步缩小调查范围。

REA（Reverse Engineer Anything）为这种调查提供统一入口。它把原本分散的解析器、反编译器、浏览器观察器和进程观察工具，接到终端与 Agent 上。它的用途需要从具体目标、可用引擎和待验证的问题来判断，项目名称不能被当作完整还原任意软件的保证。

本专题审查的是 2026-10-13 的[固定源码 d13c9f84](https://github.com/morluto/rea/tree/d13c9f840d36a321a56917e75c48afcb8d72920e)。当时最新公开发布为 [rea-agents 6.4.0](https://github.com/morluto/rea/releases/tag/rea-agents-6.4.0)，发布提交为 `a56f7bb6`。两棵源码树不同。本轮完成了源码、文档与测试设计的交叉阅读，还没有本地运行 REA 或第三方分析引擎。

## 六章共同追踪的问题：导出为什么变了

为了避免把专题写成互不相连的工具说明，六章沿用一个调查案例：**一个自有或明确授权的 Electron 桌面工具升级后，用户取消导出，界面却显示成功。怎样找出有关实现，并验证自己的修复或兼容实现？**

这是教学用的假设案例，不是我们已经发现或复现的真实产品缺陷。假设手中有新旧安装包、可操作的测试环境和少量已知操作，没有完整源码。调查不从“还原整个应用”开始，而是从一个可以重现、可以判断对错的行为开始。

```text
问题：取消导出为什么显示成功？
  → 固定新旧产物、版本、哈希与测试环境
  → 从界面文案或 IPC channel 找静态候选
  → 追踪 renderer → preload → main → 文件操作
  → 记录尚未确定的分支、输入和 native 边界
  → 在授权场景中取得取消、成功、失败的运行观察
  → 宿主大模型整理证据，提出解释或候选实现
  → 独立测试逐条验收，留下未解决的问题
```

第一章确定工具与 AI 的分工；第二章解释事实怎样从请求进入上下文；第三章判断证据能证明什么；第四章把调查改写成工程任务；第五章先用小实验练习这一流程；第六章决定是否值得接入、以什么权限接入。最终交付物是有来源的行为说明、有限的验证结果和未知项，不是一篇听起来完整的猜测。

## “逆向”究竟要逆到哪一层

逆向工程是从可取得的产物和行为反推结构、接口或实现。读 JavaScript bundle、检查资源、观察 IPC、分析机器指令，都是不同层次的逆向，不必一开始就反编译整个二进制。

必须先确定目标：我们想知道按钮发出的消息、取消操作的返回形状，还是某个 native 函数怎样计算？越接近机器层，工具、平台和专业知识的成本通常越高。若 IPC 和少量运行样本已经回答问题，就没有必要继续分析所有底层函数。这是本专题的工程判断，不是项目的性能测试结论。

反编译也不是撤销编译。产物可能已经丢失注释、局部变量名、原始类型和模块结构；优化可能合并、内联或消除函数。伪代码是引擎依据产物生成的表达，不能直接当作原作者源码。即使重新实现后若干输入输出相同，也不能由此推出所有状态、平台和异常条件下都等价。

## AI 在哪里

REA 的生产入口创建分析会话，再启动 MCP 服务。宿主 Agent 根据用户的问题选择工具，读取工具返回的观察，再决定下一步调查。审查到的核心产品路径没有独立的模型推理与自动工具选择循环；MCP prompt 的实现也只是返回给宿主的任务文本。

```text
人提出一个具体问题
    ↓
宿主 Agent：模型 + 上下文 + 工具选择循环
    ↓ MCP 调用
REA：参数契约、目标绑定、分析工作流、证据记录
    ↓
静态解析器 / 本地分析引擎 / 运行时观察器
    ↓
Evidence：结果、来源、限制、未知项
    ↓
Agent 继续调查、解释，或编写待验证的实现
```

因此，REA 很适合用来理解 Agent 的工具层：模型提出调查方向，工具取得新的事实，上下文保留这些事实，宿主循环继续行动。更强的模型可能提出更好的问题，但它仍然受工具实际观察范围限制。[运行入口](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/main.ts#L50)、[Prompt 返回实现](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/server/registerPrompts.ts#L100)

终端命令可以直接进行分析，不要求先调用 LLM。接入 Agent 后，模型的成本、上下文容量和数据政策来自宿主及其模型提供方。REA 的本地分析位置，与模型是否在本地运行，是两个需要分别确认的问题。

### 模型有用在哪里，又不负责什么

在导出案例中，大模型可以把“取消仍显示成功”的描述改写成调查步骤；从字符串、模块和 IPC 关系中选下一条查询；比较不同证据中的命名与结构；解释一段伪代码；编写候选实现与测试草案。这些任务需要语义理解和跨工具组织，适合让模型辅助。

但模型不能凭命名决定某条调用已经发生，也不能替代分析器读取目标字节。它提出的“取消结果被当成正常返回”只是待验证假设。实际消息形状、观察到的返回值、产物中的位置和测试结果，必须来自相应工具或独立实验。

| 参与者 | 在调查中承担什么 | 不能自动保证什么 |
| --- | --- | --- |
| 人 | 定义问题、授权范围和验收标准 | 仅凭描述知道内部实现 |
| 宿主模型 | 拆问题、解释材料、提出假设和候选实现 | 对工具看不到的行为给出事实保证 |
| 宿主 Harness | 执行循环、管理上下文、工具权限和预算 | 工具结论一定正确、任务一定完成 |
| REA | 统一契约、绑定目标、组织分析、交付 Evidence | 恢复任意原始源码、建立通用 sandbox |
| Parser / Provider / Observer | 解析指定产物或取得指定范围的观察 | 完整覆盖所有运行分支与环境 |
| 独立验证 | 判断已声明条件是否满足 | 有限样本推出全局等价 |

因此“用了 AI”不意味着 REA 的每项功能都靠模型生成。它的分析工具可以通过 CLI 单独使用；接上模型以后，改变的是调查的组织方式，而不是让哈希、AST 或观察结果变成模型的语言预测。

### MCP、Skill、Harness 和 RAG 不要混成一个东西

MCP 是宿主调用工具、取得结果的接口；Skill 是告诉 Agent 如何组织调查的工作流说明；Harness 是推进模型与工具循环的宿主运行环境。REA 的 skill-only 安装不等于分析服务已经可用。[REA 对 Skill 与工具的区分](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/.agents/skills/reverse-engineer-anything/SKILL.md#L16)

RAG 通常帮助从已有资料中检索相关内容。这里的关键区别是，REA 可以对当前指定的真实产物执行分析，产生新的目标绑定证据；关系图和分页又帮助按问题读取这些证据。两者可以组合，但不能把文档检索结果当作某个安装包的实际行为，也不能把 REA 自动视为已经具备向量检索、长期记忆和完整上下文管理的 RAG 系统。

## 它检查什么

| 目标 | 典型产物 | 必须确认的前提 |
| --- | --- | --- |
| JavaScript / Electron | 模块、导入、静态调用候选、IPC 与打包结构 | 支持的文件或 ASAR，解析覆盖范围 |
| 原生二进制 | 汇编、伪代码、字符串、符号、调用与引用 | Hopper、Ghidra 或 IDA 及其平台能力 |
| 浏览器与应用运行时 | 页面、脚本、选定网络或交互观察 | 已授权的目标与对应观察器 |
| Android / .NET | APK 或程序集的结构与代码信息 | 目标格式及对应提供方；两者是不同路径 |
| 包、资源与录制数据 | 文件清单、哈希、资源、保存的捕获信息 | 具体载体、工具版本和读取范围 |

这张表帮助选择路径，不是本专题已经跑通的能力清单。实际使用时要查看所连接服务的工具 schema 和可用性；工具出现在 MCP 列表里，不代表引擎已安装或当前平台可以运行。[工具契约与可用性](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/mcp-contracts.md#L285)

### 功能地图：按调查问题选择工具

以下名称依据本专题固定的 `d13c9f84` 源码与文档，用来理解功能家族。它们不是 npm 6.4.0 的逐项发布清单，也不是已通过本机验证的安装教程。

| 要回答的问题 | 代表入口 | 得到什么、仍缺什么 |
| --- | --- | --- |
| 产物中有哪些 JS 模块与静态关系？ | `analyze_javascript_application` | 结构图、语义关系、来源和未知；不是应用执行轨迹 |
| 某个字符串或 IPC 功能连接哪些模块？ | `trace_application_feature`、`trace_javascript_semantics` | 指定图中的可达关系；可达不等于执行 |
| 两版应用的有关实现有什么变化？ | `compare_application_versions`、`compare_source_to_bundle` | 有依据的匹配、差异和缺口；弱匹配不是语义等价 |
| 原生函数有哪些指令、调用和引用？ | `open_binary`、`analyze_function` | Provider 的分析记录；需要另行准备支持该目标的引擎 |
| 当前页面实际暴露了哪些脚本或事件？ | `inspect_web_page`、`observe_web_session` | 授权 CDP 目标和观察窗口内的信息；不回溯 attach 前活动 |
| 已保存的网络捕获里有什么？ | `inspect_web_network_capture` | 历史文件中的记录；不访问记录里的 URL，也不启动代理监听 |
| 一次命令执行做了什么？ | `capture_process_scenario`、`compare_process_captures` | 声明场景中的终端、退出和选定观察；实际执行目标，不是安全沙箱 |
| APK 或 .NET 程序集包含什么？ | `inspect_android_package`、`inspect_managed_artifact` | 各自格式的结构与代码信息；APK 不等于通用 JVM，CIL 不等于 native 实现 |
| 结论还有哪些没有证据支持？ | `record_unknown`、`verify_reconstruction` | 明确的未知和有限声明验证；不是一句全局“重建成功” |

进一步阅读：[JS 工作流](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md)、[原生调查](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/native-investigation.md)、[浏览器观察](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/browser-observation.md)、[历史网络捕获](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/web-network-captures.md)、[.NET 分析](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/managed-code-analysis.md)。

同样是“运行时”，被动连接既有浏览器与主动运行交互场景也不同：前者观察选定窗口，后者会启动或驱动目标。REA 将 CDP/V8 与 Playwright 等 provider 分开，原因正是权限、生命周期和证据来源不同。不要把所有浏览器能力概括成一个可以随意操作网站的工具。

### 主流程之外，还有哪些专用载体

固定 main 源码还包含下面的专用检查路径。它们说明“一个 MCP 入口”后面可以接多种不同分析能力，并不意味着任意文件都能被同一个反编译器处理。此处仍是源码能力地图，不是发布版安装清单或已完成实验。

| 载体与入口 | 能回答的问题 | 关键边界与准备 |
| --- | --- | --- |
| Go 二进制：`inspect_go_binary` | 嵌入的 Go 版本、模块、替换与构建设置 | 不执行目标，不恢复完整 Go 源码；未嵌入的设置保持未知 |
| SQLite 快照：`inspect_sqlite_database` | 选定 schema 与表数据怎样组织 | 需要静止或一致快照；该路径要求更高的 Node 版本，不能只套用通用最低版本 |
| WASM：`inspect_wasm_artifact` | section、import/export 与解码后的 WAT | 调用方准备支持的 WABT；不执行 WASM，WAT 不是原始源码 |
| 固件：`inspect_firmware_regions` / `extract_firmware` | 区域与明确选定的提取内容 | 调用方准备对应 Binwalk/Unblob 及依赖；第一阶段核验为 Linux x64。会启动外部提取器并写入新目录，但不执行提取出的目标程序 |
| EVM：`inspect_evm_interface` | 本地字节码的 interface 候选 | 离线推断，不查询链、不操作钱包；候选不是已验证源码 ABI |
| 已录制 crash：`inspect_recorded_crash` | 支持的 core 中记录了哪些线程、寄存器和信号 | 限定 core 格式及外部依赖；历史 PID 不是 live attach 授权 |

这些范围可以分别核对：[Go](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/go-binaries.md)、[SQLite](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/sqlite-databases.md)、[WASM](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/wasm-artifacts.md)、[固件](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/firmware-analysis.md)、[EVM](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/evm-bytecode.md)、[录制 crash](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/recorded-crashes.md)。

第一次学习不需要把它们全部安装。导出案例若没有 WASM、固件或 EVM 边界，就不必调用这些工具；如果问题后来落到 SQLite 配置或一个 native 组件，再选择能回答该问题的路径。功能广度与某次任务的最小工具集应该分开。

## 哪种问题值得用

问题越具体，调查越容易验证。例如“导出按钮发出了哪个 IPC 消息”“两个版本的 CLI 怎样处理非法参数”“这个本地函数怎样处理越界输入”。每个问题都能给出目标、观察位置、预期输出和后续验证。

若问题是“读懂这个已经拥有完整源码的项目”，通常先用代码搜索、构建和测试更直接。REA 自带的工作流说明也要求普通源码架构分析使用常规仓库工具。本专题对 REA 自身的调查就是按这条路径完成的。[工作流的适用范围](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/.agents/skills/reverse-engineer-anything/SKILL.md#L9)

本章的结论是：REA 的价值在于让调查接触真实目标，并把发现变成可继续核查的材料；AI 的价值在于组织和解释这条调查。下一章从源码解释，在“导出为什么变了”这类问题中，一次分析请求怎样变成模型可读的上下文，而不是直接变成正确答案。
