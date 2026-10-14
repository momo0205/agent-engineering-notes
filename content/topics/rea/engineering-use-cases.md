## 工程价值取决于缺少哪类信息

读到这里，工具怎样取得材料、材料怎样支持结论已经分开。本章转向采用之前的问题：在你的工作里，哪一类缺口值得准备这些能力？先读场景与交付物；需要查工具名时，再进入章末的能力参考。

对有源码的日常后端开发，代码搜索、测试和已有诊断工具通常已经足够。REA 更值得关注的时刻，是关键事实在发布文件、闭源本地库或实际运行中，而没有完整地出现在当前仓库里。

下面是基于已审查能力提出的工程应用判断，尚未在我们的项目里验证效率收益。采用前应选一个具体问题，让工具输出和独立验证可以一一对应。

## 场景一：核对真正部署的产物

仓库里修了某个 bug，安装包里的行为却没有变化。原因可能是错误打包、入口不同、旧 chunk 仍被加载，也可能是部署环境决定了另一条路径。

REA 的 JavaScript 产物分析和版本比较可以帮助建立发布文件之间的模块关系，追踪一个已知字符串、API 或 IPC channel。源码到 bundle 的映射也有明确的候选与歧义规则。它能提供调查线索，但弱路径匹配、source map 和结构指纹不能自动证明语义相同。[产物与版本比较](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L149)

一个可执行的问题是：“导出错误提示对应哪个发布模块，与上个版本有哪些有依据的变化？”验收应包含目标哈希、原始位置、候选路径和能够重现错误的操作。若静态图只能找到两个候选，就继续取得运行时证据。

具体实施时，先保留实际部署包，而不是重新构建一个“应该一样”的版本。分别生成产物分析，使用稳定的文案、channel 或已知 API 缩小范围，然后比较有关模块及匹配依据。历史源码可以成为额外材料，但需要记录它的身份，不能因为 Git HEAD 一样就假设工作目录或部署包相同。

交付物应该是一份差异说明：涉及哪两个目标、对应位置是什么、哪里是强匹配、哪里只是候选、哪些运行步骤能区分解释。若拥有可靠的构建记录、签名清单或 source map，先使用这些更直接的依据；REA 是补充调查能力，不必取代现有发布追踪链路。

## 场景二：理解 Electron 的跨进程功能

一个看起来简单的按钮，可能跨越 renderer、preload、IPC、main process 和 native addon。源码工具需要能表示这些边界，Agent 才能把一次界面操作与底层实现联系起来。

REA 的静态图和 Electron 工作流可以调查这类关系。很适合从“点击复制之后，发送了什么消息、由谁处理、使用了什么剪贴板格式”开始。调用关系只是候选，需要在实际场景里核对数据形状、失败路径和权限条件。[Electron 图与功能追踪](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md#L45)

重建时先定义需要达到的行为，例如纯文本、富文本、空输入和失败返回，再用这些条件测试自己的实现。外观相似不能替代协议与边界条件的一致。

### 把功能调查限定为可交付任务

上面的场景说明了潜在用途，真正启动调查仍要限定输入、问题与验收。下面是通用的任务边界，不代表已经选定一个完整应用案例。

1. 固定输入：明确授权产物、版本、测试环境，以及不含敏感内容的操作样本。
2. 寻找静态入口：由已知文案或接口追踪有关模块的候选关系，记录涉及的产物位置和动态边界。
3. 提出可区分假设：明确每种解释预期哪些输入、分支和结果，不要一次只保留一种解释。
4. 在支持且已授权的观察路径中取得运行材料。如果工具不能观察所需字段，就保留缺口，改用自有调试版本、已有日志或更合适的诊断工具，不能靠模型补值。
5. 编写行为说明或候选实现，在明确的测试环境中验证声明的结果与副作用。每项结论附来源与范围。

最低验收不是“画出了一条完整调用链”，而是能说明选定操作取得了哪些观察、支持哪些判断、哪些仍未知。若目标没有可复现操作，或者动态边界无法获得任何区分证据，应该提交调查状态，而不是强行给根因。

模型在这里适合组织假设、解释跨进程关系和整理报告；协议、样本和错误语义由证据决定。它生成的兼容实现仍要接受与原先解释相独立的验收。

## 场景三：Java 系统依赖的本地 SDK

Java 服务可能通过 JNI/JNA 调用本地库，也可能启动一个闭源转换器。遇到崩溃、格式兼容或升级问题时，函数、字符串、导入、引用和伪代码可以补充调查材料。这是原生分析的工程用途，需要实际引擎支持目标格式和架构。[原生调查指南](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/native-investigation.md)

不要由“分析器使用 Java”推断成“它能完整读懂 JVM 服务”。REA 的 JADX provider 对目标有 APK 检查；普通服务器 JAR、Spring 调用链、JFR 和 heap dump 并不是这条 APK 能力的自然延伸。[APK 限定源码](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/android/JadxProvider.ts#L331)

如果问题发生在 JVM 层，先选择相应 JVM 工具；如果问题来自 `.so`、`.dylib`、`.dll` 或外部命令，再判断 REA 的原生或进程路径能补足什么。

例如 Java 端只看见“转换失败”，但 native SDK 的文档没有说明参数边界。任务可以缩成：确认某个导出函数的参数用途、错误返回候选与字符串引用，并对自有调用样本观察零值、空输入和边界长度。先核对真实加载的库与架构，不能分析磁盘上的另一份旧库。

交付物可以是一个针对 JNI/JNA 调用边界的契约和回归测试，而不必恢复整个 SDK。函数签名、ABI、内存所有权或副作用若只有静态猜测，必须保留未知；此时增加模型解释不会让调用变安全。只有需要进入 native 层，而且引擎与许可条件满足时，准备反编译环境的成本才有明确理由。

另一个不同场景是 .NET 组件升级。REA 的 managed 路径能读 PE/CLI metadata 与 CIL，比较成员及声明的 native 边界，而不加载或运行程序集。它不覆盖 managed runtime 执行，也不由普通 PE 推断完整 NativeAOT 或 IL2CPP 语义。不能把这套静态能力扩写成“支持所有虚拟机语言”。[managed 的具体范围](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/managed-code-analysis.md)

## 场景四：比较两版 CLI 的外部行为

同一输入在新版本中可能改变退出码、终端输出或文件结果。Process Capture 允许定义一个场景，记录目标进程及选定观察，再比较运行记录。

这个路径实际启动目标命令。源码继承宿主环境，再覆盖场景配置；结果也明确指出可能遗漏短命子进程，文件前后快照不等于系统调用轨迹，网络未观察。若环境或隐藏副作用缺少证据，不能声称两版完全等价。[启动与环境](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/process/capture/ProcessHarness.ts#L266)、[捕获限制](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/src/process/capture/ProcessCaptureLifecycle.ts#L339)

对团队来说，更合适的起点是已经拥有的测试 CLI 和隔离测试目录。先测非法参数、配置优先级和退出码，再增加需要额外观察能力的网络或子进程场景。

建议为一个场景准备固定输入文件、预期退出码和选定结果文件。比较前确认工作目录、必要环境变量、配置和工具版本一致；进程捕获继承宿主环境，所以它不会替你自动建立完全可复现的干净环境。原始终端数据中的 ANSI 控制、提示与输出，也应按实际捕获语义阅读。

可交付结论是“这些已声明场景中的哪些观察发生变化”，不是“两个 CLI 对所有输入完全等价”。普通单元或集成测试已经能直接验证的问题，就继续用测试；REA 的价值在于帮助取得原来缺少的外部观察和证据组织。

## 场景五：互操作和软件保留

旧软件的格式或行为没有完整文档时，静态产物和有限运行记录能帮助定义兼容实现。工作仍需要明确目标、已有权限、输入样本和 oracle——也就是用来判断结果的独立依据。

可以把调查输出分成三个交付物：协议或行为说明、来源位置与未知项、独立测试。REA 的证据账本与重建验证提供组织方式；工程团队还要判断观察是否覆盖自己的业务需求。[重建义务账本](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/reconstruction-obligation-ledgers.md#L10)

比如迁移一个自有旧文件格式，先用授权样本确定 header、长度、编码和错误处理，再编写读取器，并用原工具或已知规范作为 oracle。样本中从没出现过的压缩、加密或版本字段不能被模型“合理设计”后当成已还原事实。

学习某个产品的交互思想与复制其受保护内容也是不同事情。此处只讨论自有或已授权的工程研究，不把工具许可当成目标软件、数据或商业引擎的授权。

## 场景六：前端行为与历史网络记录

如果要解释一个自有网页的请求由哪个脚本发起，可先取得已授权页面中的脚本与选定窗口的网络 metadata，再做静态 bundle 查询。如果手中只有 HAR 等保存文件，可走历史捕获解析，不需要为了查看记录重新访问其中的 URL。这两种路径回答的问题不同：一个观察当前页面，一个检查历史文件。[浏览器观察](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/browser-observation.md)、[保存的网络捕获](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/web-network-captures.md)

工程产出可以是某个请求的候选构造路径、观察到的 method/status、相关脚本位置与未取得的内容。被动窗口没有历史活动，不保留正文的 capture 不能支持正文值的结论；记录中出现 URL 也不证明现在该服务仍存在。公开沉淀之前还要处理 query、截图与日志中的敏感信息。

## 哪些工作不值得为此引入 REA

拥有完整源码、问题就在业务计算或数据库查询里时，通常先用代码搜索、断点、日志与测试。普通 Java 服务性能问题先从 JVM 与服务诊断工具入手；算法、策略收益或模型概率的正确性也不能靠软件逆向工具直接证明。若只有“想让系统更像 Agent”这个动机，而没有缺少的观察能力，暂不接入更合理。

同样，未知来源的二进制不能因为需要分析就放进日常工作账号执行。是否准备隔离环境与具备目标授权，是调查之前的条件，不是遇到危险行为之后才补的手续。

## 第一次采用怎样衡量

| 要记录的内容 | 它帮助判断什么 |
| --- | --- |
| 原问题与可验收条件 | 调查有没有回答实际问题 |
| 使用的工具、版本、目标哈希 | 别人能否复查同一目标 |
| 有来源的发现与残留未知 | 哪些部分仍需要人工判断 |
| 工具调用、引擎准备与人工时间 | 工程成本是否值得 |
| 独立测试及失败输入 | 解释或重建是否可靠 |

这会比“Agent 用了一次反编译工具”更接近采用决策。后续若在自己的项目里完成案例，再把真实运行记录追加到专题；当前不声称效率提升或完整重建已经得到验证。

如果以后比较人工与 Agent 调查，可以固定同一问题、目标和停止条件，分别记录准备时间、查询次数、实际有效发现、错误解释、未解决项和人工复核成本。单次成功演示不适合直接推广成普遍效率数字。本章提出的是可以落地的任务设计；下一章用自有小样本先练习取证、解释和验证。

实践章另外保留了一个[最小导出样本实跑](/topics/rea/hands-on)：真实静态分析保留了 unknown，同一行为测试复现取消被当成成功，独立候选通过了有限验收。它只是可控的结果处理练习，不是上面六类工程场景的完成报告，也不是完整 Electron 调用链。

## 深入参考：按调查问题选择工具

下面承接第一章后移的工具地图。它供查证与任务准备使用，不要求首次阅读逐项记忆。名称依据固定 `d13c9f84` 源码与文档，不是 npm 6.4.0 的逐项发布清单，更不是本专题已经实跑的功能清单。实际安装时要核对 release 与 schema；工具出现在列表里，不代表引擎可用。

### JavaScript 产物与功能关系

`analyze_javascript_application` 建立结构图与语义关系；`trace_application_feature`、`trace_javascript_semantics` 沿选定字符串或功能继续查询。得到的是有来源的静态候选与未知，不是应用执行轨迹。支持的目录或 ASAR、解析覆盖和动态边界都要一起记录。

`compare_application_versions` 比较应用版本；`compare_source_to_bundle` 核对源码与 bundle 的候选对应。比较必须带着匹配依据、覆盖和缺口阅读。弱路径匹配或结构相似，不自动证明语义等价。[JS 工作流与比较规则](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/javascript-application-workflows.md)

### 原生函数、Android 与 .NET

`open_binary`、`analyze_function` 提供所选 Provider 的汇编、伪代码、调用与引用材料，需要准备适用的 Hopper、Ghidra 或 IDA 及其目标格式、架构和许可。它们不是同一个引擎的不同名字。

`inspect_android_package` 与 `inspect_managed_artifact` 分别处理 APK 和 .NET 程序集。APK 不是通用 JVM 服务分析，PE/CLI metadata 与 CIL 也不等于 native 或 managed runtime 的全部实现。[原生调查](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/native-investigation.md)、[.NET 范围](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/managed-code-analysis.md)

### 当前观察、历史记录与主动执行

`inspect_web_page`、`observe_web_session` 取得授权 CDP 目标在选定窗口内的信息，不回溯 attach 前活动。`inspect_web_network_capture` 读取历史捕获文件，不访问记录中的 URL，也不启动代理监听。

同样是浏览器路径，被动连接既有浏览器，与主动启动、驱动交互场景也不同。REA 将 CDP/V8 观察与 Playwright 场景能力区分；后者涉及浏览器启动或操作，权限、生命周期与证据来源不能按被动 attach 来理解。按选定路径核对实际可用性，不把它们笼统概括成“能操作网站”。

`capture_process_scenario`、`compare_process_captures` 则涉及目标命令和声明场景：前者会实际执行目标，不能当成安全沙箱。浏览器、包、资源和保存捕获都要核对具体载体、工具版本与读取范围。[浏览器观察](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/browser-observation.md)、[历史网络捕获](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/web-network-captures.md)

### 未知与有限验收

`record_unknown` 记录尚无依据的部分；`verify_reconstruction` 检查有限的行为或结构声明。它们帮助写清“还缺什么”和“哪些条件通过”，不提供一句全局的“重建成功”保证。[工具契约与可用性](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/mcp-contracts.md#L285)

### 还有哪些专用载体

这些路径说明同一工具系统可以连接不同检查能力，而不是任何文件都能交给同一个反编译器。下列内容仍是固定 main 的源码能力地图；本轮没有安装或实跑这些引擎。

| 载体与入口 | 能回答的问题 | 关键边界与准备 |
| --- | --- | --- |
| Go：`inspect_go_binary` | 嵌入的 Go 版本、模块、替换与构建设置 | 不执行目标，不恢复完整源码；未嵌入的设置保持未知 |
| SQLite：`inspect_sqlite_database` | 选定 schema 与表数据怎样组织 | 需要静止或一致快照；该路径有单独的、更高 Node 版本要求 |
| WASM：`inspect_wasm_artifact` | section、import/export 与解码后的 WAT | 调用方准备 WABT；不执行 WASM，WAT 不是原始源码 |
| 固件：`inspect_firmware_regions` / `extract_firmware` | 区域与明确选定的提取内容 | 准备 Binwalk/Unblob 及依赖；第一阶段核验为 Linux x64。会运行外部提取器并写新目录，但不执行提取出的目标 |
| EVM：`inspect_evm_interface` | 本地字节码的 interface 候选 | 离线推断，不查询链、不操作钱包；候选不是已验证源码 ABI |
| 已录制 crash：`inspect_recorded_crash` | 支持的 core 中记录的线程、寄存器和信号 | 限定格式与外部依赖；历史 PID 不等于 live attach 授权 |

可以分别核对：[Go](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/go-binaries.md)、[SQLite](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/sqlite-databases.md)、[WASM](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/wasm-artifacts.md)、[固件](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/firmware-analysis.md)、[EVM](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/evm-bytecode.md)、[录制 crash](https://github.com/morluto/rea/blob/d13c9f840d36a321a56917e75c48afcb8d72920e/docs/recorded-crashes.md)。

功能广度和一次任务的最小工具集应该分开。先选需要的材料，再准备能取得它的路径；不要为了“支持得全”把所有引擎和高权限观察器一起开放给模型。
