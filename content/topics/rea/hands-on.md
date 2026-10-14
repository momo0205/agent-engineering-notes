## 从一条真实的最小调查链开始

2026-10-14，我们实际运行了自有 JavaScript 导出样本的 REA 6.4.0 分析、返回形状比较和五项行为验收。本章先交付这份实跑记录，再保留原先的 normalize 入门练习与原生实验设计。后两部分没有因为新实验完成而自动变成已验证教程。

这里最重要的不是让一个很小的函数看起来难，而是看清四件事：工具实际返回了什么；模型怎样使用这些材料；测试提供了什么额外依据；环境失败和残留未知怎样影响结论。

## 实跑目标：取消为什么被当成成功

样本收录在[网站仓库的 examples/rea-export-investigation](https://github.com/momo0205/agent-engineering-notes/tree/main/examples/rea-export-investigation)，包含 baseline、defective、candidate 和统一测试。它模拟导出结果处理，不含 Electron、真实 IPC、UI 或文件写入。`bridge.invoke` 是依赖注入的接口，测试提供可控替身。

两版的 `app.mjs` 相同：

```javascript
import { presentExportResult } from "./present.mjs";

export async function exportReport(bridge, document) {
  const result = await bridge.invoke("report:export", { document });
  return presentExportResult(result);
}
```

正确版的 `present.mjs` 对取消、错误和成功分别处理。缺陷版故意漏掉取消分支：

```javascript
// defective/present.mjs：故意保留的实验缺陷，不是推荐实现。
export function presentExportResult(result) {
  if (result.error) return { status: "failed", message: result.error };
  return { status: "success", message: "Exported" };
}
```

我们在分析前已经知道样本源码、故障和预期，并先冻结了行为测试。因此这是已知答案的白盒工作流演示，不是盲测，不是恢复未知闭源应用，也不能用来评价模型的独立逆向正确率。

## 实际运行环境与一次失败

运行包为 `rea-agents@6.4.0`，没有给本实验配置模型 API Key，也没有修改 Agent client 的 MCP 设置。终端曾因工作目录切换用到不支持的 Node 25.6.0，随后固定到已有的 Node 22.22.2；REA 支持的是文档声明的版本分支，不是任意“更高版本”。

Mac 原环境执行分析时返回 `execution_failure`。diagnostics 指向 `xcrun swiftc` 编译进程所有权 helper 失败，包含 `SwiftBridging` 重定义及 SDK/compiler 不兼容提示。选择已有的另一份 SDK 后仍失败。本轮没有修复或替换 Command Line Tools，也没有跳过进程所有权保护。

我们保留了这次错误中的 `partial_observation`：它绑定了样本 digest，但图覆盖不完整。不能从里面的空关系或零计数推断这个程序没有有关行为，也不能把错误结果当作成功分析。这是 Mac 环境的真实失败记录，不代表所有 Mac 都会失败。

随后使用已有 OrbStack，启动一次性 Linux arm64 容器，只读挂载这几份自有样本。镜像是 `node:22.22.2-bookworm-slim`，镜像 digest 为 `sha256:9f6d5975c7dca860947d3915877f85607946403fc55349f39b4bc3688448bb6e`；容器中准备 procps 后执行同一固定 npm 包。两次分析均以 0 退出。容器只用于解决兼容性问题，不是 REA 自动提供的隔离服务。

正常环境中的分析命令如下，实际容器内目标分别为 `/lab/baseline` 与 `/lab/defective`：

```bash
mkdir -p rea-output
npx --yes rea-agents@6.4.0 analyze-javascript-application \
  "$PWD/examples/rea-export-investigation/baseline" --json \
  > rea-output/baseline-analysis.json

npx --yes rea-agents@6.4.0 analyze-javascript-application \
  "$PWD/examples/rea-export-investigation/defective" --json \
  > rea-output/defective-analysis.json
```

完整容器重现命令在样本 README 中。首次取包和准备容器需要网络；静态分析本身不执行样本，也不请求一个真实导出服务。仓库将 `rea-output/` 忽略，原始分析、请求与比较输出统一放在这里，避免直接混入文章提交；公开前仍需人工审核，gitignore 不是脱敏机制。

## 第一次读输出：不要把解析成功当成全部理解

| 实际结果 | baseline | defective |
| --- | --- | --- |
| 目标 digest 前缀 | `159a2d43` | `d949214a` |
| 已解析 JavaScript 文件 | 2 | 2 |
| 解析失败 | 0 | 0 |
| 结构图节点 / 边 | 7 / 8 | 7 / 8 |
| 结构图 coverage | complete | complete |
| 语义图节点 / 关系 | 42 / 26 | 38 / 24 |
| 语义 unknown 数量 | 14 | 13 |
| 语义 coverage | unknown | unknown |

两版的 `app.mjs`、导入与导出等结构材料可以被定位，但仅凭上述数量看不出哪个输入触发错误。完整结构覆盖也没有消除语义中的动态调用、未知值与歧义。这正是继续选择一项聚焦查询的理由，而不是让模型宣布“完整调用链已恢复”。

## 第二步：聚焦返回形状，工具没有直接替我们下结论

我们从已保存的两份完整 Evidence 构造比较请求，精确指定 `present.mjs` 与 `presentExportResult`。这是对原始 JSON 的机械包装，不修改 Evidence 内容：

```bash
jq -n --slurpfile left rea-output/baseline-analysis.json \
  --slurpfile right rea-output/defective-analysis.json \
  '{left:$left[0],right:$right[0],
    left_module_path:"present.mjs",left_export_name:"presentExportResult",
    right_module_path:"present.mjs",right_export_name:"presentExportResult"}' \
  > rea-output/shape-request.json

npx --yes rea-agents@6.4.0 compare-javascript-export-shapes \
  rea-output/shape-request.json --json > rea-output/shapes.json
```

这项比较实际在 Mac 上完成，消费 Linux 已产生的 Evidence，不重新启动解析工作进程。结果 `added/removed/changed` 都是 0，但 `unknown` 是 1、coverage 为 partial，并定位到 baseline 的 `present.mjs` 第 2 行。两个返回 variant 配对，一个左侧 variant 未配对。

它给出的原因是缺少两侧互相唯一对应的字面量判别依据，而不是“软件没变化”。这个输出不能直接宣称取消分支已被工具证明删除；但它把调查聚焦到一个可核查的返回位置。第三章对[这个真实 unknown 的含义](/topics/rea/evidence-and-validation)作了详细解释。

## AI 在这一次到底做了什么

本轮参与的是当前撰写专题的 Agent，经终端工具运行 REA、读取结果并核对来源，没有新增一次 live 模型 API 调用，也不是通过 REA MCP 进行的宿主循环测试。它事先知道自制样本的答案，不能把这一轮描述成独立发现未知缺陷。

为了让过程可检查，可以把公开调查摘要写成四个阶段，而不是倾倒模型的中间推理文本：

| 阶段 | 本次采取的行动 | 依据或限制 |
| --- | --- | --- |
| 取得材料 | 保留 Mac 错误，再在 Linux 得到两份分析 Evidence | 失败不得当成完整成功；目标字节保持一致 |
| 缩小范围 | 精确比较返回处理函数，而不是浏览全部工具 | 两版结构计数相同，聚焦问题涉及的输出边界 |
| 解释材料 | 将未配对位置与样本源码、已知契约对照 | `unknown` 是线索，源码阅读与已知答案也是解释依据 |
| 验证候选 | 保留故障版，另写 candidate 并运行冻结的测试 | 用行为结果验收，不修改预期迁就实现 |

模型的辅助在于组织查询、读懂错误与覆盖、连接位置和规范、生成候选。包解析、哈希和静态比较由 REA 完成；行为差异由 Node 测试取得。这个样本没有证明 REA 更快、模型比人工更强，或者大模型可以取代独立验收。

## 第三步：同一套测试怎样区分三个版本

在网站仓库根目录运行：

```bash
REA_LAB_TARGET=baseline node --test examples/rea-export-investigation/verify-export.mjs
REA_LAB_TARGET=defective node --test examples/rea-export-investigation/verify-export.mjs
REA_LAB_TARGET=candidate node --test examples/rea-export-investigation/verify-export.mjs
```

| 冻结的验收条件 | baseline | defective | candidate |
| --- | --- | --- | --- |
| 完成结果映射为 success | 通过 | 通过 | 通过 |
| `{ canceled: true }` 映射为 idle | 通过 | **失败：得到 success** | 通过 |
| 显式错误映射为 failed | 通过 | 通过 | 通过 |
| bridge 收到约定 channel 与 payload | 通过 | 通过 | 通过 |
| backend Promise 拒绝仍为拒绝 | 通过 | 通过 | 通过 |
| 实际通过 / 失败 | 5 / 0 | 4 / 1 | 5 / 0 |

缺陷版退出码 1 是实验预期，不是要掩盖的 CI 故障。candidate 没有修改缺陷版，而是在独立模块中先处理 canceled，再处理 error，最后成功返回。它通过了同一组测试，但这只证明五个声明；没有验证真实 IPC、UI、文件写入、任意输入形状或完整 Electron 行为。

这份实验的有限结论是：REA 能在此次 Linux 环境中取得目标绑定的静态材料，并给出带未知的精确返回形状比较；Agent 可以将其与其他材料组合；冻结的行为探针能区分这个已知缺陷与候选修复。它还不是闭源逆向能力或工程提效的评测。

## 后续入门练习的状态

下面的 normalize 练习依据[发布版 6.4.0](https://github.com/morluto/rea/tree/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895)接口整理，仍是待执行的独立练习。不要把它与上面的实际导出记录混为一份结果。

第一步选静态 JavaScript，便于把注意力放在证据上。它只需要相应 Node.js/npm 环境，不需要先装 Hopper、Ghidra 或 IDA。发布项目要求 Node.js 22.x 至少 22.19、24.x 至少 24.11，或 26+。在专用学习目录里使用固定包版本。[发布版安装说明](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/docs/installation.md)

## 学习顺序与每一步的产出

前面四章用 Electron 导出问题串起调查。但第一次练习不应该同时承担 Electron、运行时观察、native 引擎和模型配置的全部环境成本。先用两个小文件，把“工具取得什么、模型解释什么、测试证明什么”分清，再回到跨进程案例。

| 阶段 | 练习目标 | 应留下的东西 |
| --- | --- | --- |
| 静态产物 | 不执行目标，也能提取有关结构 | 原始分析、目标身份、人工检查点、未知 |
| AI 解释 | 让每条说明有来源、范围与假设 | 引用证据的解释，不接受无来源的完整叙事 |
| 候选实现 | 把解释变成可测试的小接口 | 独立文件与已声明输入契约 |
| 独立验证 | 区分真实符合与自我确认 | 测试、失败输入、修订结论 |
| 原生进阶 | 在编译产物上调查有已知真值的函数 | 编译配置、引擎与证据、有限对照结果 |
| 跨进程案例 | 最后调查成功、取消、失败等分支 | 行为矩阵、观察范围、仍未关闭的义务 |

完成第一项不要求模型 API Key。需要模型时使用你已经配置的宿主；需要原生引擎时再单独安装并核对平台。这里没有让网站服务器代替本机执行分析，也没有自动改动读者的现有 Agent 系统。

## 实验一：读懂一个自有 JavaScript 产物

在当前学习目录创建：

```bash
mkdir -p rea-lab/artifact rea-lab/tests rea-lab/output
```

手动保存 `rea-lab/artifact/normalize.mjs`：

```javascript
export function normalize(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
```

手动保存 `rea-lab/artifact/main.mjs`：

```javascript
import { normalize } from "./normalize.mjs";

export async function search(input) {
  const response = await fetch("https://example.invalid/search", {
    method: "POST",
    body: JSON.stringify({ query: normalize(input) }),
  });
  if (!response.ok) throw new Error("Search failed");
  return response.json();
}
```

这里用不可用的示例域名表达静态请求位置。分析命令的任务是读取文件；不要把执行 `search` 或访问这个 URL 当作静态分析的一部分。

运行：

```bash
node --version
npm --version
npx --yes rea-agents@6.4.0 analyze-javascript-application \
  "$PWD/rea-lab/artifact" --json \
  > rea-lab/output/static-analysis.json
```

`npx` 首次会取得 npm 包并执行其 CLI。这个命令不注册 Agent 配置。遇到错误时先保留退出状态和诊断，检查 Node、包版本与输入；不要把错误 JSON 当作有效分析结果。[发布版 JavaScript 分析契约](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/docs/javascript-application-graph.md)

阅读 JSON 时要核对四件事：目标与 digest 是否对应本次目录；模块与导入关系是否识别；哪些信息是静态派生；是否出现 partial、unknown、truncation 或 limitations。两个文件、相对导入、固定请求字符串和规范化调用，是本例人工已知的检查点。字段位置以实际版本结果为准，不预先编造输出。

### 先写下人工已知的真值

我们知道 `search` 是异步函数、调用了 `normalize`，并把转换后的值写进请求 body；同时知道目标 URL 不可用。这些已知条件帮助检查工具结果，但还需要区分源码中可读的表达与工具实际提取的事实。

不要要求第一次结果必须证明所有运行语义。例如出现 `fetch` 调用不是请求已经发出；发现 `response.ok` 分支不是该服务一定会返回什么。若工具没有恢复某项关系，记录该版本能力缺口或 unknown，再用输出支持的查询继续检查。学习价值就在于看到解释在哪一步需要更多材料。

这个样本是刻意保留源码的白盒练习，适合检查工具与证据流程，不适合用来证明模型具备复杂闭源逆向能力。后面的原生实验才会把产物与 oracle 分开，减少直接阅读答案的影响。

## 实验二：让 Agent 给出可以测试的解释

若需要通过 MCP 继续调查，先看配置计划：

```bash
npx --yes rea-agents@6.4.0 setup --client codex --dry-run --json
```

核对计划中的配置路径、备份、所选 client 和 skill。计划本身不改 Agent 配置；实际应用可运行交互命令，再按安装提示重启或重连对应 Agent：

```bash
npx --yes rea-agents@6.4.0 setup --client codex
```

模型账号或 API 配置仍由宿主 Agent 管理。REA 的 skill-only 安装也不等于 MCP 已连接。以当前会话实际可见的工具和 schema 判断连接状态。[发布版 setup 工作流](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/docs/installation.md)

给 Agent 的任务可以写成：

> 分析指定学习目录的 JavaScript 产物。解释 search 怎样构造请求、normalize 怎样转换输入，每条判断给出来源和未知项。先做静态检查，不执行 search。将独立重写的 normalize 保存到 candidate 目录，并用单独的测试验证。

第一轮先停在解释，不急着要求实现。检查它是否真的使用了当前工具，是否提供目标与来源，是否把静态候选写成已执行行为。第二轮再要求生成候选，并明确只允许写 candidate，不修改 artifact 和 tests。这个文件权限划分是实验任务要求，实际是否能被技术强制执行取决于宿主权限机制，不由这段提示词自动保证。

如果模型在没有调用 REA 的情况下直接读两份源码得出正确答案，要如实记录“通过普通源码阅读完成”。它可以是有效学习，但不能把它计入 REA 工具链的验证成绩。

自己在 `rea-lab/tests/normalize.test.mjs` 保存测试，等待 Agent 生成 `rea-lab/candidate/normalize.mjs` 后运行：

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { normalize } from "../candidate/normalize.mjs";

test("normalize agrees with the declared examples", () => {
  assert.equal(normalize("  HELLO  "), "hello");
  assert.equal(normalize("A\t B\nC"), "a b c");
  assert.equal(normalize("   "), "");
  assert.equal(normalize("ＡBC"), "ａbc");
});
```

```bash
node --test rea-lab/tests/normalize.test.mjs
```

最后一项刻意区分大小写转换和字符宽度归一化。通过这些例子只说明有限输入符合规范；还要考察非字符串、Unicode、超长输入，以及目标应用的真实输入契约。本例是学习证据与验证的最小练习，不是复杂闭源软件重建成绩。

### 测试失败以后做什么

先确认接口与实验路径没有写错，再保留失败输入、预期值和实际值。若候选把全角字符转换成半角，而目标只做大小写转换，就把它记为语义差异；要求 Agent 解释原先依据，再修订实现。不要删除这个用例，也不要把规范改成“更合理的文本处理”。研究对象是目标的行为，而不是我们偏好的新功能。

对非字符串输入，可以另加 `assert.throws` 检查约定类型的异常；对更多 Unicode 输入，可在 oracle 一侧生成期望值，再检验候选。随机样本需要记录种子或完整输入才能复查。无论通过多少样本，都应说明输入范围、运行环境和未覆盖的状态。

一次练习的最低完成条件是：工具命令有明确成功或失败状态；分析输出能追溯到本次目标；解释不超出证据；候选通过约定测试，或者留下可重现失败。仅有一句 Agent 的“已完成”不算完成记录。

## 下一组实验：带已知真值的原生函数

进阶时可以自己编写一个小型 C 函数，编译成发布产物，把源码保留在独立 oracle 目录。通过已经安装并允许使用的 Ghidra 或 Hopper，取得汇编、伪代码和目标身份；再让 Agent 实现相同接口。

验证应覆盖零、负数、边界、溢出与随机输入，并分别记录编译器、优化参数、架构和引擎。行为相同的样本、结构相似、机器码一致，代表不同强度的结论。这组实验当前只有设计，未执行。[发布版原生引擎准备](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/docs/installation.md)

函数本身应先定义明确的数值类型与溢出规则，避免把 C 的未定义行为当成可移植规范。先选一个小而确定的函数，再改变优化等级或去掉符号，观察工具和模型的结果如何变化。不同版本实验一次只改变少量条件，否则很难判断变化来自引擎、编译器还是模型。

编译源码、参考程序与预期值由 oracle 一侧保留；候选调查只提供需要研究的产物和接口。REA 没有替我们自动建立这种实验隔离，它需要由实验目录、会话和权限安排落实。结果中要明确有没有泄漏源码，以及分析者是否事先知道答案。

## 回到导出案例：先有行为矩阵，再选观察工具

完成最小练习后，可以用自有 Electron 样本设计成功、取消、写入失败三条路径。先定义每条路径的期望文件结果、返回形状和 UI 状态，再决定哪些静态与运行观察能支持它们。不要从“所有可用工具各调用一次”开始。

实验应按顺序记录：选定两个产物 → 静态关系候选 → 未知与假设 → 支持该目标的观察路径 → 行为对照 → 候选实现与测试。这个阶段当前仍是实验设计，没有伪装成已复现的产品案例；具体 MCP 参数需要在实跑时依据所用 release 的实际 schema 填写，而不是照抄 main 的工具名。

尤其不要为了取得更多观察直接运行不可信安装包、连接日常浏览器资料或开启未授权插桩。先选自己可控的目标，用专用测试环境和无敏感数据的样本。

## 实验记录留下哪些空间

每次追加一条独立记录：日期、REA release/commit、宿主与 Node 版本、目标 digest、完整命令或 MCP 参数、使用的模型和引擎、工具结果、未知项、独立测试、失败案例与当前结论。保留原记录，再标明后续修正。

公开摘要可以按“问题 → 目标 → 方法 → 有依据的发现 → 反例 → 未知 → 有限结论”来写。源码审查、工具实跑、真实引擎测试和模型调查分别标记。这样后续换版本或修正解释，不会把原本不同强度的材料合成一个无法复查的成功故事。

不要把真实源码、终端响应或捕获文件直接贴到公开网站。原始资料可以留在学习工作目录，公开文章用人工核查后的片段和汇总。运行在本地的 REA 仍可能把工具结果交给远端模型；数据流需要按照实际宿主确认，第六章会继续讨论这个边界。
