## 先把学习变成可检查的循环

这不是一份“读完三篇论文就掌握全部深度学习”的承诺。它是一条面向工程师的起跑线：每次只回答一个可检验的问题，把原文、一个尽可能小的程序和自己尚不能解释的地方放在同一张桌面上。专题的三篇论文分别讨论深层网络、序列关系和生成过程；它们共享“信息怎样稳定流动”这一视角，却不是一条严格的技术演进链。

每一章都把陈述分成三类。带有论文链接的内容是原作者在固定版本中提出的说法；与脚本、参数和输出绑定的内容才可以叫作复现实验观察；没有足够证据的文字只是一种待检验的个人理解。这样的区分有些慢，但能避免把读后感伪装成结论。

## 建议的阅读顺序

先读 ResNet，观察“层数更多并不自然等于更容易优化”这个工程问题。再读 Transformer，关注注意力如何建立 token 间的直接通路，以及残差和归一化如何仍然承担信息路径。最后读 DDPM，把“逐步变化的分布”与“网络要预测什么”分开。这一顺序是为了降低切换成本，不是在宣称后两篇从第一篇必然推导而来。

一轮学习可以用六步完成：写下问题、快速浏览原文、摘录定义和公式、运行最小程序、记录观察、做一次自测。先写答案尤其重要：它让你之后能指出自己究竟修正了什么，而不是只留下“看懂了”的感觉。

## 三篇论文的关系

课程顺序服务于理解，不替代论文之间的历史或技术考证。第一层关系是信息路径：

- [ResNet](https://notes.ironmao.com/topics/algorithm-foundations/resnet)：改善深层网络中的信息与梯度传递；
- [Transformer](https://notes.ironmao.com/topics/algorithm-foundations/transformer)：用残差结构承载多层注意力和前馈计算；
- [DDPM](https://notes.ironmao.com/topics/algorithm-foundations/ddpm)：在去噪网络中继续使用残差块，并可引入注意力。

这三句话只描述本专题的阅读线索，不表示后两篇由前一篇严格推导而来。对应的固定原文是 [ResNet abstract](https://arxiv.org/abs/1512.03385v1)、[Transformer abstract](https://arxiv.org/abs/1706.03762v7) 和 [DDPM abstract](https://arxiv.org/abs/2006.11239v2)。

## 官方原文与事实源

本专题只链接官方 arXiv 固定版本，不重新托管 PDF。阅读时请在相应论文页打开 abstract 与 PDF；版本号是引用的一部分。完整的代码、测试、下载元数据和原始学习材料属于公开的 [paper-deep-dive 固定提交](https://github.com/momo0205/paper-deep-dive/tree/2b8b41e63608725e6d4f25a44599014b1c22596e)。网站内容是在该提交于 2026-09-16 复核后人工挑选的表达层，并不会随着仓库后续变化自动改变。

## 最小复现

先克隆固定提交，再选择当前章节的离线 smoke。需要 Python 3.11；以下命令在 macOS 上显式使用 `python3`，脚本路径和 `--smoke --offline` 参数与公开仓库 README 的 smoke 入口一致。下面命令只是启动一个小型检查，不下载论文或训练数据集；它不能代替论文中的完整训练设置。

```bash
git clone https://github.com/momo0205/paper-deep-dive.git
cd paper-deep-dive
git checkout 2b8b41e63608725e6d4f25a44599014b1c22596e
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
python3 code/resnet/plain_vs_residual.py --smoke --offline --output-dir /tmp/paper-deep-dive-resnet
```

运行前请阅读仓库的 README 和可复现性说明，确认 Python 版本、依赖和输出目录。若命令失败，首先记录环境、完整报错和提交号；不要把一次失败归因于论文，也不要悄悄换参数后只保留成功结果。

## 已验证

已核对本专题绑定的 GitHub 提交为 `2b8b41e63608725e6d4f25a44599014b1c22596e`，并核对该提交的 `papers.yml` 为三篇论文分别记录了固定 arXiv 版本、官方 abstract/PDF URL 与下载校验值。网站不把这些元数据转换成新的实验指标，也不把外部 PDF 复制进发布内容。

## 尚未得出结论

本首发版本没有公布任何“复现达到论文指标”的结论，也没有完成三篇论文的个人推导笔记。每个最小程序能说明的范围、数值观察和失败案例，需要在实际运行、保留环境与参数后才能公开。读者也不应把六步清单当作能力认证。

## 自测

1. 你能否指出一句话是论文结论、实验观察还是个人解释？
2. 当最小脚本成功运行时，它证明了什么，又没有证明什么？
3. 为什么固定 arXiv 版本和 GitHub 提交都要写进学习记录？

如果其中一题只能回答“感觉如此”，回到原文链接和命令输出，补上可定位的证据再继续。
