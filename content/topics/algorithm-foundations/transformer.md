## 前置知识

先把序列建模看成“把一串符号映射为另一串符号”。RNN 按时间步串行更新隐藏状态，长距离信息需要经过多次传递；Transformer 试图减少这种串行路径。

理解本章只需要四个入口：

- query 表示当前位置想寻找什么，key 表示可被匹配的特征，value 表示被汇聚的信息；
- softmax 把相关性分数变成归一化权重；
- 多头注意力在多个投影子空间并行计算关系；
- 自注意力本身没有顺序概念，需要显式位置表示。

阅读前还应复习矩阵乘法的形状。若 `Q` 为 `n×d_k`、`K` 为 `n×d_k`，则 `QK^T` 为 `n×n`：序列中每个位置都能与其他位置形成分数，这既解释了直接依赖，也解释了长序列的平方成本。

## 核心问题

为什么注意力可以直接建立序列元素之间的关系，同时摆脱 RNN 的严格串行计算？核心公式是：

```text
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V
```

本页固定使用 *Attention Is All You Need* 的 [arXiv:1706.03762v7 abstract](https://arxiv.org/abs/1706.03762v7) 与 [官方 PDF](https://arxiv.org/pdf/1706.03762v7)。阅读时追踪六个子问题：缩放因子、多头投影、位置编码、mask、序列长度复杂度，以及残差/归一化如何包围子层。

## 逐节中文精读导读

### 引言：论文先改变计算路径

引言把 RNN/CNN 的序列计算限制与注意力的并行能力并列。这里的主张不是“顺序不重要”，而是顺序信息可以由位置编码注入，元素关系不必依赖逐步递归才能建立。

### 第 2 节：背景工作告诉你比较对象

作者回顾 recurrent、convolutional 和 attention 模型，目的是说明当时多数注意力仍依附于循环结构。阅读这一节时记录“完全移除 recurrence”是什么变化，不必把所有引用展开成技术史。

### 第 3.1 节：先看完整 encoder-decoder 图

图 1 可以拆成重复的子层：注意力、前馈网络、残差连接和归一化。encoder 建立输入表示；decoder 还要处理已生成前缀，并通过 encoder-decoder attention 读取输入。先辨清三种注意力的 Q/K/V 来源，再看具体矩阵。

### 第 3.2 节：注意力公式是本章核心

`QK^T` 产生相关性，除以 `sqrt(d_k)` 控制数值尺度，softmax 形成权重，再对 `V` 汇聚。multi-head 不是简单复制同一个结果，而是为每个头使用不同的投影矩阵，最后拼接并重新投影。

### 第 3.3–3.5 节：位置、前馈和 embedding 补齐模型

每个位置共享同一个前馈网络，但各位置独立计算。embedding 将离散 token 变成向量；位置编码让相同 token 在不同位置拥有不同表示。正弦方案是论文选择，不意味着所有 Transformer 都必须使用同一种位置编码。

### 第 4–6 节：效率、训练和结果必须一起看

表 1 比较每层复杂度、并行操作数和最大路径长度。训练细节包含 optimizer、学习率调度、regularization 等条件；BLEU 等结果不能脱离这些条件单独归因于某个公式。本项目尚未复现翻译训练和指标。

## 关键公式与结构

缩放点积注意力中的 `sqrt(d_k)` 用于避免高维点积幅度增大后让 softmax 进入过于尖锐的区域。因果 mask 则在 softmax 前把未来位置设为不可选，使位置 `t` 只能读取不晚于 `t` 的信息。

多头注意力可写为：

```text
head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)
MultiHead(Q,K,V) = Concat(head_1, ..., head_h)W^O
```

残差路径与 ResNet 有相似的“保留较直接信息通路”直觉，但模块、任务与实验完全不同，不能把它们写成相同机制或严格继承关系。

## 最小复现

[固定提交 2b8b41e63608725e6d4f25a44599014b1c22596e](https://github.com/momo0205/paper-deep-dive/tree/2b8b41e63608725e6d4f25a44599014b1c22596e) 提供一个 Python 3.11 小型离线 attention 脚本。它使用内置输入检查张量路径、训练反向传播和因果 mask，不下载数据集；这不能代表论文发表指标的复现，也没有重跑机器翻译训练。

```bash
git clone https://github.com/momo0205/paper-deep-dive.git
cd paper-deep-dive
git checkout 2b8b41e63608725e6d4f25a44599014b1c22596e
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
python3 code/transformer/tiny_attention.py --smoke --offline --output-dir /tmp/paper-deep-dive-transformer
```

检查输出时，先确认 attention shape，再确认因果 mask 后上三角权重是否为零。工作台中的 loss 变化只属于这个 tiny 脚本与固定随机设置，不能外推成翻译质量或架构优越性结论。

## 自测与能力边界

本章仍是“框架已发布”。自测应覆盖：`QK^T`、softmax、`V` 分别承担什么；为什么缩放；多头是否增加总表示维度；位置编码为何必要；padding mask 与 causal mask 的用途；`O(n²d)` 的瓶颈在哪里。

当前没有 BLEU 对照、长序列消融、位置编码比较或完整推导。能运行 smoke 只说明实现路径可执行，不能说明注意力在所有长距离任务上都能学到正确关系。

## 一页纸总结

Transformer 用注意力把任意两个位置之间的计算路径缩短为一次权重计算，并通过多头投影、位置编码、前馈层、残差和归一化构成可堆叠结构。它换来了更强的并行能力，也引入随序列长度平方增长的注意力矩阵。

首发内容已经固定原文、概念路径和离线代码入口；论文级翻译实验、指标与个人消融仍未形成公开结论。
