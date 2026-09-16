## 核心问题

为什么注意力可以直接建立序列元素之间的关系？本章关注的是 Transformer 的计算结构：给定 query、key、value，模型如何形成依赖、为何对点积做缩放、以及堆叠后信息如何穿过注意力、前馈层和残差路径。它不是“所有序列问题从此不需要任何归纳偏置”的结论。

## 论文背景与固定原文

原论文为 Vaswani 等人的 *Attention Is All You Need*。本页固定使用 [arXiv:1706.03762v7 abstract](https://arxiv.org/abs/1706.03762v7) 和 [官方 PDF](https://arxiv.org/pdf/1706.03762v7)。阅读时可先定位 scaled dot-product attention、多头注意力、位置编码，以及训练设置分别出现在哪些段落；定义、实现选择和实验报告不要混成一句泛泛的“注意力很强”。

固定版本保证讨论能指向同一原文，不代表网站替 arXiv 提供可用性保证。若 PDF 暂时不可访问，仍可从 abstract 页确认元数据，稍后再阅读官方 PDF。

## 结构直觉

注意力的常见形式是 `softmax(QK^T / sqrt(d_k))V`。可先把它看作：每个 query 对所有 key 计算相关性，再以归一化权重混合 value。`sqrt(d_k)` 出现在公式里，是为了控制点积随维度增大而过度放大的问题；多头机制则让不同投影子空间有机会学习不同关系。这些是阅读公式的入口，不是本页宣称已经完成的数学推导。

Transformer 同样反复使用残差连接。与 ResNet 的并列关系值得注意：两者都让深层计算保留较直接的信息路径，但论文任务、模块和实验设置不同，不能把这个相似性误读为严格的前后继承。

## 最小复现

在 [paper-deep-dive 固定提交](https://github.com/momo0205/paper-deep-dive/tree/2b8b41e63608725e6d4f25a44599014b1c22596e) 中，以下命令运行一个小型 attention 检查。需要 Python 3.11；命令在 macOS 上显式使用 `python3`，并保留公开仓库 README 所列 smoke 的脚本路径和参数。它用离线输入检查张量路径与基本行为，不下载数据集，也不训练机器翻译模型；这是小型检查，不能代表论文发表指标的复现。

```bash
git clone https://github.com/momo0205/paper-deep-dive.git
cd paper-deep-dive
git checkout 2b8b41e63608725e6d4f25a44599014b1c22596e
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
python3 code/transformer/tiny_attention.py --smoke --offline --output-dir /tmp/paper-deep-dive-transformer
```

为了让观察可复核，请保留命令、环境、提交号与输出目录。若你改变维度、mask 或随机种子，应把它们当作新的实验条件，而不是继续沿用本页的已验证陈述。

## 已验证

已核对固定提交的 `papers.yml` 指向 `1706.03762v7` 的官方 abstract/PDF URL，README 记录了 `tiny_attention.py` 的离线 smoke 入口。已验证的是公开来源和最小程序入口的对应关系；本页没有声称完成原论文的翻译任务、BLEU 对照或个人公式推导。

## 尚未得出结论

本首发版尚未发布关于多头数、位置编码、层数或训练策略的个人实验解释，也没有给出“注意力替代 RNN 的普遍性能结论”。论文中的具体实验数值属于原文报告；只有在同样公开参数、环境和输出后，新的数值才可以被称为本项目的复现实验观察。

## 自测

1. `QK^T`、softmax 和 `V` 分别在决定什么？
2. 为什么要对点积做缩放，而不是把缩放当成无关紧要的实现细节？
3. 残差路径在 Transformer 中与 ResNet 有什么相似处，又有哪些不能直接类比？

先用原文中可定位的段落和一次实际运行回答；把不能解释的符号留给下一轮阅读。
