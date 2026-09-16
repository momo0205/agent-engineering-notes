## 核心问题

为什么网络越深越难训练，而残差连接能让信息继续流动？这是本章要追的问题，不是“ResNet 一定比所有网络都好”的口号。论文讨论的是在当时的图像识别设置中，增加 plain network 深度可能出现训练误差反而更高的退化现象，并提出把目标映射改写为残差函数的结构选择。

## 论文背景与固定原文

原论文是 Kaiming He、Xiangyu Zhang、Shaoqing Ren 与 Jian Sun 的 *Deep Residual Learning for Image Recognition*。本页固定引用 [arXiv:1512.03385v1 abstract](https://arxiv.org/abs/1512.03385v1) 与 [官方 PDF](https://arxiv.org/pdf/1512.03385v1)。版本号不是装饰：后续笔记、代码和讨论应当能回到同一个原文状态。

阅读时先找三件事：退化问题和过拟合如何区分；论文把哪些层封装成残差单元；对照实验到底比较了什么。不要只记住“shortcut 能传梯度”这一句，因为它省略了优化、初始化、归一化、数据和训练策略等上下文。

## 结构直觉

残差块常写作 `y = F(x) + x`。当某些新增层暂时不需要改变输入时，恒等路径给出了一个直接的信息通路，学习部分只需关注相对输入的变化。这个式子帮助理解为什么“让网络接近恒等”可能比从头拟合完整映射更容易；它本身不是对任意深度、任意任务都能成功优化的证明。

本章把 ResNet 标为“学习中”。这表示问题、原文版本和可运行入口已经发布，但个人对训练曲线、梯度路径及实验差异的解释仍在收集证据，不能把草稿当作定论。

## 最小复现

完整事实源固定在 [paper-deep-dive 的此提交](https://github.com/momo0205/paper-deep-dive/tree/2b8b41e63608725e6d4f25a44599014b1c22596e)。需要 Python 3.11；以下命令在 macOS 上显式使用 `python3`，并保留公开仓库 README 所列 smoke 的脚本路径和参数。离线 smoke 用合成或仓库内小输入运行 plain 与 residual 的最小对照；输出目录显式写在临时位置，便于检查或删除。

```bash
git clone https://github.com/momo0205/paper-deep-dive.git
cd paper-deep-dive
git checkout 2b8b41e63608725e6d4f25a44599014b1c22596e
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
python3 code/resnet/plain_vs_residual.py --smoke --offline --output-dir /tmp/paper-deep-dive-resnet
```

运行前后都应记录 Python 与依赖版本、命令、提交号和输出文件。最小对照的目的在于让结构和测试入口可检查，不是在 CPU smoke 中重做 ImageNet 训练，也不应把它的任何数值当作论文指标。

## 已验证

已核对该固定提交公开存在，并且它的 `papers.yml` 将 ResNet 绑定到 `1512.03385v1` 的官方链接，同时列出下载校验信息。已核对仓库 README 为 `plain_vs_residual.py` 提供上述离线 smoke 命令。这里的“已验证”只覆盖来源与运行入口；本页没有发布个人训练结果。

## 尚未得出结论

尚未在本页给出论文表格的独立复现、top-1/top-5 指标、个人推导完成声明，或“残差连接总能解决梯度问题”的泛化结论。若未来公开实验，将同时给出固定提交、环境、参数、完整输出和它与论文设置的差别；否则只保留问题与证据链接。

## 自测

1. 退化问题与过拟合在观测上有什么不同？
2. `F(x) + x` 中的 `F` 为什么被称为残差，而不是“网络不用学习了”？
3. 一个离线 smoke 成功，为什么不足以声称复现了论文指标？

能用固定原文位置和实际命令回答，再进入下一篇；不能时，把不确定处写成下一轮要验证的假设。
