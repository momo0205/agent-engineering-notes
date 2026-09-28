## 先说清楚：Laya 是参照物，不是 Jev 的源码

[Laya](https://github.com/NandhaKishorM/laya/tree/9d955671415fc19f069b9cc998928075c1f255ec) 是一个公开源代码的非自回归决策模型项目。它很适合拿来回答一个具体问题：**不生成一段自由文本，模型还能怎样消费上下文并给出有限类型的决策？**

它不能替我们回答 Jev 内部究竟怎么实现。Laya 的代码、模型卡和基准是 Laya 项目的材料；TypeSafe 并没有因此公开 Jev 的模型结构。两者都把自己放在“直接返回决策”的方向，不等于它们是同一种架构，也不等于 Laya 的测试结果可以代表 Jev。

## 从请求到答案：文本仍然在输入侧

Laya 的 Python API 接收一段状态（可以是文本或结构化对象）和一组有类型的问题。每个问题可以声明 `choice`（有限选项）、`score`（有序等级）或 `noul`（是/否概率），并带有说明和候选项描述。项目文档中的最小例子如下：

```python
from laya import Router

router = Router()
state = "Customer was charged twice and asks for a refund."
questions = {
    "department": {
        "type": "choice",
        "instructions": "Which team should handle this?",
        "criteria": {"billing": "invoices, payments, refunds", "other": "everything else"},
    }
}

result = router.predict(state, questions)
answer = result["answers"]["department"]
print(answer["choice"], answer["probabilities"])
```

入口把任务边界交给调用方：可以问什么、答案空间有多大、每个答案是什么意思。这些说明和状态文本仍然是模型的输入；“不输出自由文本”绝不是“上下文被删掉了”。

从代码结构看，`laya/common.py` 中的 `build_sequence` 负责把问题说明、候选项和状态组织成模型可读的序列；`DecisionModel` 的类注释将其概括为**双向 Transformer 编码器 + 类型化决策头**。模型对输入整体做编码，再在候选决策位置计算分数，而不是像常见自回归对话模型那样逐 token 接着写一段回答。`laya/agent.py` 中的 `Agent.system_one` 负责单次请求，`predict_batch` 则把多个状态打包推理。

```text
状态文本/结构化状态 + 问题说明 + 候选项
                    │
          序列构造与 tokenizer
                    │
      双向 Transformer 编码器
                    │
      类型化决策头 → 候选分数
                    │
       概率/置信度 → choice / score / noul
```

输出不是“什么都没有”，而是有限选项及其分布。代码还会应用温度参数，并提供 `answer_confidence` 一类字段；这让调用方更容易消费结果，却不使概率自动成为正确率保证。置信门槛、拒答、转人工、故障回退仍需应用系统定义。Laya 当前接口提供可选的低置信拒答入口，也不意味着任意领域的默认阈值已经校准好。

训练目标也要与结构分开看。Laya README 将训练描述为 RLCD：用严格适当评分规则奖励决策概率分布。直觉上，这类目标不只问“最大概率标签有没有猜中”，还关心给出的概率分布是否与标签相符。但它仍依赖训练标签、样本分布、目标函数实现和校准流程；一个评分规则的名字不能证明模型在新领域中已校准，更不能验证输入事实本身。关于训练细节，本章只把 README 当作项目方说明；要确认训练实现，还需追到对应脚本、配置、数据和 checkpoint 版本，不能只依据摘要下结论。

## 它和 Transformer、分类器是什么关系

这几个词不在同一个分类维度上：**Transformer 是模型结构家族；分类器描述输入到标签/分数的任务形态；Jev 是一个封装模型、训练和 API 的产品/服务；Laya 则是公开可检查的决策系统实现。** 分类器完全可以由 Transformer 编码器实现。Laya 展示的正是这种组合：编码器读上下文，任务头输出有限决策。

因此，“没有自然语言输出”本身不能证明它不是 Transformer 或分类器。更有区分度的问题是：它接受什么输入、如何表示候选项、用什么目标训练、如何产生/校准概率、如何处理不确定性，以及模型和服务能否被独立复现。Laya 的实现让这些问题具体可查；但不能据此推断 Jev 也采用同一条实现路径。

## 基准数字：把项目自报与独立结论分开

截至本章审阅时，Laya 仓库的 `BENCHMARKS.md` 将 typed-decisions 评测描述为 2,000 个判断、覆盖四类工作流，并公布了下列准确率。以下是**项目自报数字**，不是我们独立复现，也不是相同条件下的 Jev 对照：

| checkpoint / 基线 | 仓库报告的 accuracy | 阅读时不能漏掉的边界 |
| --- | ---: | --- |
| `laya-typed-decisions` 微调 checkpoint | 0.766 | 依赖领域微调；不能当成开箱即用零样本表现 |
| 基础英文 `laya` checkpoint | 0.361 | 低于同一表中的多数类基线 |
| 基础多语言 checkpoint | 0.352 | 同样不能用来概括经过微调的版本 |
| 多数类基线 | 0.461 | 一个必须比较的简单参照 |

分数的关键不是“0.766 看起来很高”，而是**基础 checkpoint 与微调 checkpoint 的差距很大**。这提醒我们：要把预训练模型、任务微调、选项设计、校准数据和测试集分开记录。还要特别注意：仓库的限制说明把这个 0.766 明确归于在该 benchmark 自身训练集上微调的 checkpoint，因此不能把它当成独立保留测试集上的泛化成绩。仓库同一评测还报告了 Brier、ECE 等指标；指标口径不同，不能只挑一列 accuracy 当结论。详见 [Laya 基准说明](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/BENCHMARKS.md) 与[研究索引](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/research/README.md)。

数字也不构成 Jev 与 Laya 的公平竞赛。评测集、数据划分、硬件、批量方式、计时边界、提示/问题写法、微调过程和版本都可能不同。TypeSafe 的 Jev 数字是另一套发布材料；除非两边在同一冻结样本、相同业务定义和可审计配置上运行，否则把表格并排不等于 head-to-head。对性能与价格的具体主张，仍应回到《审计 193.6×、444.6× 与 67.8%》所要求的口径。

## 中文诊断很有用，但还不是中文能力证明

一个很能说明问题的例子来自仓库的[中文短命令诊断](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/research/benchmarks/zh_short_commands/README.md)。它固定了 18 条清洁机器人语音命令，并逐步改变问题说明、候选项描述和状态格式。项目保存的 Laya multilingual 0.3.20 档案报告：

| 任务形状 / 输入配置 | 正确数与准确率 | 观察 |
| --- | --- | --- |
| `choice`，只给六个候选项 | 13/18，0.7222 | 多分类路径仍会区分不同候选项 |
| `choice`，加一句场景说明 | 14/18，0.7778 | 这组样本中比只给候选项多对 1 条 |
| `choice`，再给结构化 JSON 状态 | 12/18，0.6667 | 更多结构不保证这组样本更准 |
| 四个独立 `noul` 问题，不加 criteria | 48/72，0.6667 | 是/否路径的简单版本 |
| 四个 `noul` 问题，加 criteria 与结构化状态 | 30/72，0.4167 | 72 个答案全部变成 true，准确率恰等于全答 true 的基线 |

这里的要点不是“多分类一定好于是/否”，而是**答案空间和提示写法改变了模型的决策分布**。在报告的最高一级配置里，模型对 18 条输入的四个 `noul` 维度全部回答 true；平均置信度却达到 0.9437。比如 `wants_stop` 对 18 条都给 true，其中 14 条并非停止命令。相反，`choice` 路径没有塌成单一答案，但单条错误仍可能高置信：`太慢了` 的人工标签是 `faster`，档案记录三个 `choice` 配置都给出 `slower`，置信度分别约 0.990、0.993、0.898。

这正好说明了接口、概率和正确性是三回事：结构化输出不会因类型合法而语义正确，给出置信度也不代表它真的知道自己何时读错。还要注意，这不是“中文普遍失败”的证明：它是**18 条手写案例、单一 checkpoint、一次运行**，不是留出测试集、独立标注语料或官方评测。标签数量不平衡、任务定义本身也影响结果；报告明确要求把这些作为廉价、可证伪的下一轮测试假设，而不是语言能力结论。

另一份[飞书风格工作流诊断](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/research/benchmarks/feishu_zh/README.md)保存了 64 个合成中文场景和模型请求档案。其 2026-09-21 的首轮结果中，Laya multilingual 在 `choice` 上为 20/64，在四个独立是/否问题上为 18/64；同一报告归档的 Jev 1.13.0 分别为 64/64 和 63/64。这个结果值得我们继续复现，却不能直接写成“Jev 普遍胜过 Laya”：参考标签为 AI 辅助合成，只有 64 个相关场景，质量分使用预先选定的首轮；Laya 在 M4 MPS 本地运行，Jev 走远端 API，软硬件与延迟口径也不同。更重要的是，`choice` 与四个 `noul` 问的是不同工作流，不能合并成一个总分。

对中文系统尤其值得进一步检验：候选标签是否平衡、否定与程度表达是否覆盖、`choice` 与 `noul` 是否采用了不同的问题分解、语言路由是否正确、模型会不会在答案退化成常量时仍给出高置信。上面两份材料的价值，是留下具体输入、版本、输出和审计程序，让我们知道下一批独立盲标样本应该测什么。

## 自己动手：先复现接口，不先相信成绩

Laya 提供 Python 包。可以在隔离环境安装后运行上面的最小程序；首次实际推理通常需要从模型仓库取得 checkpoint，运行时延迟也受机器、模型是否已加载、输入长度和批处理影响。记录实验时至少冻结 Laya 版本、checkpoint/revision、硬件、原始输入、候选项定义和数据切分，不能只记最终 accuracy。

适合我们的第一个小实验不是追逐更大的分数，而是把现有路由任务整理成一小批人工核对样本，先比较规则、普通分类器与 Laya，再分开查看：总体准确率、每类 precision/recall、Brier、校准曲线、低置信拒答后的 coverage、P50/P95 延迟和失败案例。开发集用于改问题与阈值，保留测试集只在配置冻结后使用。若 checkpoint 要用本地任务微调，微调样本与测试集必须按来源/模板分组隔离，不能把近重复样本拆进两边。

这个实验仍不接入现有业务，也不把 Laya 结果外推为 Jev 结论。它的作用是练习如何验证一种结构化决策方案，并帮助我们识别当前评估框架的盲区。

## 对本专题的结论

Laya 给我们的最大价值，是提供了一个可以读源码、读基准、亲手运行的实例：决策模型可以继续使用自然语言上下文，也可以采用 Transformer 编码器，同时不生成面向人的自由文本。它因此有力地区分了“输出接口没有长文本”与“模型没有上下文或内部计算”这两件事。

它没有消除最初的疑虑：输出类型正确不等于语义正确；概率需要本地校准；零样本、微调与不同语言必须分别评测；高风险动作依然需要规则、拒答和人工把关。Laya 能让研究更具体，但不能替代对 Jev 的独立实验，更不能仅凭源码相似就断言两者内部相同。

## 资料与证据边界

- [Laya 源码：`laya/common.py`](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/laya/common.py)：`build_sequence`、`DecisionModel` 等模型构造与序列处理。
- [Laya 源码：`laya/agent.py`](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/laya/agent.py)：`Agent.system_one`、批量推理、概率和置信度输出。
- [仓库 README](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/README.md)：安装入口、checkpoint、API 类型与项目方能力说明。
- [基准文档](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/BENCHMARKS.md)：项目方报告的指标、基线及其自述限制。
- [研究索引](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/research/README.md)：多语言、中文诊断与复现实验脚本索引。
- [中文短命令诊断](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/research/benchmarks/zh_short_commands/README.md) 与[飞书风格诊断](https://github.com/NandhaKishorM/laya/blob/9d955671415fc19f069b9cc998928075c1f255ec/research/benchmarks/feishu_zh/README.md)：小规模、合成样本下的错误剖析，不是通用中文能力结论。

本文源码观察固定在 Laya commit `9d955671415fc19f069b9cc998928075c1f255ec`（仓库包版本标为 0.3.21）。模型权重和评测数据也可能独立更新；正式比较或复现实验仍应分别固定包版本、checkpoint revision、数据集与运行配置。
