# 首发内容审核清单

状态：五篇文章均已由 owner 逐篇明确批准并设为 `published`。本文只记录公开安全的来源逻辑名，不包含机器路径、远端、账号、网络拓扑或凭据。

## 来源盘点

| 公开安全的逻辑来源 | 目标文章 | 敏感类别 | 计划脱敏/泛化 | 事实可信度与证据类型 |
|---|---|---|---|---|
| `Agent Evidence Lab / docs/ROADMAP.md` | 全部 | 历史提交、远端运行链接、运维细节 | 只保留里程碑状态与未完成项 | 高：版本化路线图，与验收矩阵交叉核对 |
| `Agent Evidence Lab / docs/ACCEPTANCE.md` | 全部 | 真实运行环境、端口、远端链接 | 只保留能力状态和测试类别 | 高：验收矩阵与运行证据摘要 |
| `Agent Evidence Lab / docs/architecture/decisions/ADR-0001-agent-execution-runtime.md` | Java vs Python Worker | 机器相关性能、镜像细节 | 仅保留量级与不可等价比较的限制 | 高：已接受 ADR + 固定实验 |
| `Agent Evidence Lab / docs/evaluation/M3-RUNTIME-REPORT.md` | Bounded Loop；Java vs Python Worker | 本机性能、测试语料细节 | 不写主机信息；指标只作实验语境说明 | 高：机器可读结果与故障实验报告 |
| `Agent Evidence Lab / docs/evaluation/M3-REAL-MODEL-DECISION-REPORT.md` | Stance 误判；LLM/Context/Harness | 模型配置、联网凭据 | 不写凭据；5/5 明确限定为固定集单次验收 | 中高：真实模型报告，样本很小 |
| `Agent Evidence Lab / agent/loop` | Bounded Loop；LLM/Context/Harness | 私有包名与实现全文 | 只写逻辑模块与小型流程，不复制源码 | 高：生产源码 + 单元测试 |
| `Agent Evidence Lab / agent/runtime` | Stance 误判；Java/Python；Context | Prompt 全文、错误细节 | 只解释规则与边界，不复制完整 Prompt | 高：生产源码 + 协议/适配测试 |
| `Agent Evidence Lab / tests/agent` | Bounded Loop；Stance；Java/Python | 固定 UUID、测试 URL、内部类名 | 只概述已证明行为 | 高：自动化测试与可选真实模型 IT |
| `Agent Evidence Lab / evidence` 与 `ingestion` | Java 迁移；Context | 来源与数据结构细节 | 只保留模块职责和数据流 | 高：源码、数据库集成测试、E2E |

### 来源冲突处理

`Agent Evidence Lab / README.md` 的首页状态摘要仍写着 M2 收尾中、Agent Loop 尚未实现，
与 2026-08-17 更新的路线图、验收矩阵、M3 设计、生产源码和 Loop 测试冲突。本文不采用这段
过期摘要，而以多份较新证据交叉确认：M0—M2 已关闭，M3 已有受限 Loop 和模型决策垂直切片，
但 M3 尚未关闭。README 里的部署与安全原则只作辅助来源，不用来判断里程碑现状。

## 全局敏感处理

- 未复制任何真实 API Key；示例只允许 `DEEPSEEK_API_KEY=[REDACTED]`。
- 未写私人绝对路径、域名、IP、SSH 配置、Git remote、账号或个人身份信息。
- 删除具体历史 commit、CI 运行链接、宿主端口和真实来源记录数；它们不影响文章结论。
- 源码只按逻辑模块引用，不复制完整类、Prompt、测试夹具或内部包拓扑。
- 性能结果不写成语言基准，明确 Java 完整服务与 Python 微型 Worker 不可直接比较。
- `5/5` 只描述五类固定集的一次真实模型验收，不写为准确率、SLA 或生产质量。

## 逐篇 owner checklist

### `java-to-agent`

- 事实摘要：Java 控制面可复用；M0—M2 已关闭；M3 进行中；模型概率性要求新增 Context/Harness 边界。
- 删除/泛化：移除远端运行、端口、真实来源数量和历史提交；模块名改为逻辑层级。
- Owner 审核：已明确批准，批准日期为 2026-08-18；个人叙事以及“先做里程碑，再决定框架或执行面”的表达获准保留。
- 审核决定：`published`。

### `agent-llm-context-harness`

- 事实摘要：API Key 只是 LLM 访问凭据；Context 跨检索、Resolver、观察和 Prompt；Harness 跨 Loop、协议、工具、Verifier 和测试；ReAct 已有受限切片。
- 删除/泛化：不写真实配置值，不复制系统 Prompt；只保留最多十个候选、三步上限等公开安全边界。
- Owner 审核：已明确批准，批准日期为 2026-08-18。
- 审核决定：`published`。

### `bounded-agent-loop`

- 事实摘要：已实现 Search → Observe → Decide → Verify → Stop、步数/deadline/重复动作/一次恢复；实际预算扣减、持久化 checkpoint、生产 trace、工具恢复和 Agent API 尚缺。
- 删除/泛化：测试 UUID、内部 URL、完整源码和错误堆栈全部省略。
- Owner 审核：已明确批准，批准日期为 2026-08-18；“三步上限”和“一次恢复”作为当前版本快照获批保留。
- 审核决定：`published`。参数描述不承诺未来版本继续使用相同数值。

### `stance-misclassification`

- 事实摘要：首次有效真实运行为 4/5，明确反对被误判支持；命题相对规则、严格七字段协议、temperature 0 和选项转发修复后固定集 5/5、0 false completion。
- 删除/泛化：不写模型调用凭据、内部完整 Prompt、Token/延迟具体值和测试 ID。
- Owner 审核：已明确批准，批准日期为 2026-08-18；首次 4/5 失败与修复后 fixed-set 5/5 获准公开。
- 审核决定：`published`。必须保留固定集规模很小、结果不可外推为准确率或生产质量的边界。

### `java-vs-python-worker`

- 事实摘要：同协议切片语义结果相同；一次一进程 Python 有约百毫秒边界成本；四类故障被隔离；ADR 选择 Java 默认、Python 保留可选边界。
- 删除/泛化：不公开机器配置、精确内存/镜像数字、容器拓扑细节和内部脚本路径。
- Owner 审核：已明确批准，批准日期为 2026-08-18；两个确定性策略均为 40% 的失败结果、Java 默认决策，以及 Python Worker 已有实验实现但不在默认路径，均获准公开。
- 审核决定：`published`。实验中的镜像、内存与延迟对比描述部署边界，不得作为 Java/Python 语言效率基准。

## 发布门

逐篇审核时，owner 需要确认：事实、个人语气、可公开失败、当前/未来边界和标题。只有明确批准的单篇文章才能改为 `published`；未回复、笼统回复或只批准版式，都不等同于内容发布批准。
