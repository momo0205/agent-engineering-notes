## 先声明这份教程的状态

下面是一份依据[发布版 6.4.0](https://github.com/morluto/rea/tree/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895)接口整理的学习实验。我们尚未在本机执行这些步骤；文中的观察目标和验收条件是预期，不是运行报告。后续实跑应追加原始版本、命令、结果和失败记录。

第一步选静态 JavaScript，便于把注意力放在证据上。它只需要相应 Node.js/npm 环境，不需要先装 Hopper、Ghidra 或 IDA。发布项目要求 Node.js 22.x 至少 22.19、24.x 至少 24.11，或 26+。在专用学习目录里使用固定包版本。[发布版安装说明](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/docs/installation.md)

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

## 下一组实验：带已知真值的原生函数

进阶时可以自己编写一个小型 C 函数，编译成发布产物，把源码保留在独立 oracle 目录。通过已经安装并允许使用的 Ghidra 或 Hopper，取得汇编、伪代码和目标身份；再让 Agent 实现相同接口。

验证应覆盖零、负数、边界、溢出与随机输入，并分别记录编译器、优化参数、架构和引擎。行为相同的样本、结构相似、机器码一致，代表不同强度的结论。这组实验当前只有设计，未执行。[发布版原生引擎准备](https://github.com/morluto/rea/blob/a56f7bb668ab23fec8d33f7af353ac7ed2fe1895/docs/installation.md)

## 实验记录留下哪些空间

每次追加一条独立记录：日期、REA release/commit、宿主与 Node 版本、目标 digest、完整命令或 MCP 参数、使用的模型和引擎、工具结果、未知项、独立测试、失败案例与当前结论。保留原记录，再标明后续修正。

不要把真实源码、终端响应或捕获文件直接贴到公开网站。原始资料可以留在学习工作目录，公开文章用人工核查后的片段和汇总。运行在本地的 REA 仍可能把工具结果交给远端模型；数据流需要按照实际宿主确认，第六章会继续讨论这个边界。
