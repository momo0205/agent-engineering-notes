# 算法原理与复现专题设计

**日期：** 2026-09-16  
**状态：** 已完成讨论，等待用户审阅书面设计  
**涉及项目：** `agent-engineering-notes`、待创建的 `paper-deep-dive`

## 1. 背景

现有工作区已经形成一套围绕 ResNet、Attention Is All You Need 和 DDPM 的“问题驱动 + 最小复现”学习工程，包括三篇论文原文、三份核心问题文档、三套 CPU 可运行的最小复现、自动化测试、自测题和离线学习页面。

这些材料适合沉淀到 `notes.ironmao.com`，但不能把本地工作台原样复制到公开网站。网站面向有编程经验、正在补算法基础的工程师，需要把原始学习材料改写成可阅读、可验证、可持续扩展的公开专题；完整代码和实验事实则应进入独立 GitHub 仓库。

## 2. 目标与非目标

### 2.1 目标

- 在网站新增与 DeepSeek Harness 平级的“算法原理与复现”专题。
- 以课程顺序作为主线，同时清楚呈现三篇论文之间的知识关系。
- 让读者通过“问题、原文、推导、复现、实验、自测”完成学习闭环。
- 建立独立公开仓库 `momo0205/paper-deep-dive`，保存完整代码、测试、实验记录和学习材料。
- 为原文提供网站直接阅读入口，并让仓库用户可以从官方来源一键获取和校验 PDF。
- 第一版先发布公开学习工作台，内容明确标记真实完成状态，后续随实际学习持续更新。

### 2.2 非目标

- 第一版不提供账号、云端笔记或跨设备进度同步。
- 网站不运行训练任务，也不写回 GitHub。
- 不把尚未完成的笔记包装成成熟教程。
- 不为了仓库外观重写已经通过验证的三个最小复现。
- 不声称用户能够通过三篇论文“精通深度学习”。
- 不在未取得再分发授权时，将论文 PDF 重新托管到网站或公开 GitHub 仓库。

## 3. 受众与内容原则

主要受众是有编程经验、但算法和数学基础仍需补强的工程师。内容从工程问题和直觉进入，只引入理解核心机制所必需的公式，并提供普通 CPU 可以运行的验证代码。

公开内容必须区分三种陈述：

1. **论文结论：** 明确引用论文版本和位置；
2. **复现实验观察：** 绑定代码 commit、环境、参数和输出；
3. **个人理解或推断：** 使用明确的主观表述，不伪装成论文结论。

## 4. 信息架构

专题位于：

```text
Agent 工程笔记
├── Agent 开发文章
├── 项目实践
├── DeepSeek Harness 源码专题
└── 算法原理与复现专题
```

首发路由：

```text
/topics/algorithm-foundations
/topics/algorithm-foundations/reading-method
/topics/algorithm-foundations/resnet
/topics/algorithm-foundations/transformer
/topics/algorithm-foundations/ddpm
```

### 4.1 专题首页

首页采用“课程式路径 + 知识关系”组合结构：

1. 首屏说明专题目标，并提供唯一的“继续学习”入口；
2. 以 01 ResNet、02 Transformer、03 DDPM 呈现课程顺序；
3. 在课程卡片后展示三篇论文的知识连接；
4. 展示统一学习循环和当前设备上的本地进度；
5. 提供学习方法、公开边界和 GitHub 仓库入口。

知识关系的首版叙事为：

```text
ResNet：改善深层网络中的信息与梯度传递
   ↓
Transformer：用残差结构承载多层注意力和前馈计算
   ↓
DDPM：在去噪网络中继续使用残差块，并可引入注意力
```

贯穿问题是：“信息如何在越来越深、越来越复杂的模型中稳定流动？”该叙事用于建立联系，不暗示三篇论文构成严格的线性技术演进。

### 4.2 单篇论文页

三篇论文使用统一结构：

1. 核心问题；
2. 论文出现前的问题；
3. 核心直觉与必要公式；
4. 模型结构和信息流；
5. 最小复现；
6. 对照实验及结果解释；
7. 踩坑、误解与能力边界；
8. 自测与下一步；
9. 论文、仓库 commit、环境和验证日期。

公开状态只有三种：

- `framework`：框架已发布；
- `learning`：学习中；
- `verified`：完成首轮验证。

页面不得使用“精通”“完整证明”“生产就绪”等超出证据的状态描述。

### 4.3 首发内容状态

- 专题首页：正式内容；
- 学习方法：正式内容；
- ResNet：`learning`；
- Transformer：`framework`；
- DDPM：`framework`。

三篇论文页可以首发已有的问题树、背景、复现说明、运行方式和自测入口。未完成的个人推导、实验解释和总结显示真实的“尚未形成公开结论”状态，不生成占位式答案。

## 5. 系统边界

### 5.1 `paper-deep-dive`：完整事实源

独立仓库保存：

- 论文元数据和官方下载信息；
- 问题树、原始学习笔记、推导和总结；
- 完整复现代码和测试；
- 原始实验记录、失败记录和小型参考输出；
- 代码与实验的版本历史。

它回答“代码能否运行、实验实际得到什么”。

### 5.2 `agent-engineering-notes`：精选表达层

网站仓库保存：

- 专题首页和学习方法；
- 经过审阅的论文讲解；
- 少量关键代码片段和实验图；
- 自测交互、进度交互和 GitHub 固定链接；
- 公开内容的来源与验证信息。

它回答“读者如何理解、验证并继续学习”。

### 5.3 人工精选发布

两个仓库不自动同步。一次发布遵循：

```text
完成学习或实验
→ 在 paper-deep-dive 保存代码、测试和原始记录
→ 测试并提交
→ 选择适合公开的结论、代码和图表
→ 脱敏、来源和授权检查
→ 写入网站文章并绑定 commit
→ 网站自动检查与本地预览
→ 用户确认
→ 发布
```

GitHub 暂时不可访问时，已经发布的网站内容仍可阅读。草稿和实验目录的变化不会自动进入网站。

## 6. 论文原文策略

用户要求原文是专题的一部分，并希望从网站和 GitHub 两侧都能获得原文体验。三篇论文当前 arXiv 页面所列许可均为 arXiv Non-exclusive License to Distribute，该许可授予 arXiv 分发权，并不自动授予第三方重新托管权。

因此第一版采用“官方来源双入口”，而不是未经确认的 PDF 双重托管：

### 6.1 网站

- 论文页提供直接阅读官方原文的入口；
- 在浏览器和安全策略允许时，可内嵌官方 arXiv PDF；
- 内嵌失败时退化为论文信息和“前往官方页面”；
- 展示标题、作者、arXiv ID、论文版本和引用信息。

### 6.2 GitHub

- `papers.yml` 保存官方 URL、版本、访问日期和预期 SHA-256；
- `scripts/fetch_papers.py` 将 PDF 下载到本地忽略目录；
- 下载后验证 hash，发现官方版本变化时停止并要求人工更新元数据；
- 公开仓库不提交未明确允许第三方再分发的 PDF。

### 6.3 本地

当前本地工作区可以继续保存已下载 PDF。迁移到公开仓库时，通过 `.gitignore` 和迁移检查防止 PDF 进入公开历史。

若未来确认某篇论文采用允许第三方再分发的许可，可以单独启用网站与 GitHub 托管，并保留许可证文件和署名；不能因为其他论文获得授权而批量放开。

## 7. 仓库结构

### 7.1 `paper-deep-dive`

第一版结构：

```text
paper-deep-dive/
├── README.md
├── pyproject.toml
├── papers.yml
├── scripts/
│   └── fetch_papers.py
├── questions/
├── notes/
│   ├── resnet/
│   ├── transformer/
│   └── ddpm/
├── code/
│   ├── common/
│   ├── resnet/
│   ├── transformer/
│   └── ddpm/
├── checkpoints/
├── tests/
└── outputs/
    └── reference/
```

第一版优先保持现有代码的运行方式，只进行公开边界、依赖和测试整理。可复用包结构等重构等待真实复用需求出现后再做。

### 7.2 `agent-engineering-notes`

```text
content/topics/algorithm-foundations/
├── overview.md
├── reading-method.md
├── resnet.md
├── transformer.md
└── ddpm.md

lib/content/algorithm-topic.ts
app/topics/algorithm-foundations/
tests/pages/algorithm-foundations-topic.test.tsx
```

具体组件应复用现有 Markdown renderer、站点导航、专题卡片风格和发布检查，不复制 DeepSeek Harness 的数据模型时才新增必要字段。

## 8. 轻交互与本地状态

第一版支持：

- 专题整体进度；
- 每篇六步学习检查；
- 自测答案展开与掌握标记；
- 代码和运行命令复制。

状态使用带版本号的单一命名空间，例如：

```text
agent-engineering-notes:algorithm-foundations:v1
```

约束：

- 页面明确说明状态仅保存在当前浏览器；
- `localStorage` 不可用时，功能退化为当前会话状态；
- 状态解析失败时，只清理该专题键；
- 新版本必须迁移旧状态或安全重置，不能影响其他网站数据；
- 不保存自由文本笔记，避免用户误以为网站承担可靠存储责任。

## 9. 失败处理

- **官方原文不可达：** 显示元数据、官方摘要页链接和稍后重试提示，专题正文继续可用；
- **GitHub 不可达：** 保留文章、已发布图表和 commit 文本，不阻塞阅读；
- **进度存储失败：** 显示非阻塞提示并使用内存状态；
- **文章绑定不存在的 commit：** 发布检查失败；
- **实验图缺少参数、环境或来源：** 不允许进入公开内容；
- **论文 hash 改变：** 下载脚本停止，要求人工核对版本；
- **Markdown 或公式渲染失败：** 页面保留可读源文本，构建测试覆盖已知格式。

## 10. 测试与发布门槛

### 10.1 `paper-deep-dive`

- 现有六项算法测试迁移后继续通过；
- 三个复现脚本提供适合 CI 的快速 smoke 模式；
- 下载脚本在临时目录中测试，不依赖真实网络完成单元测试；
- 校验论文元数据的必填字段、URL、版本和 hash 格式；
- GitHub Actions 使用 CPU、无 API Key；
- 敏感信息、本地绝对路径、PDF 和大型临时输出不得进入公开历史。

### 10.2 `agent-engineering-notes`

- 五个新路由及站点导航测试；
- 三篇论文状态标签测试；
- Markdown、公式、代码块和自测渲染测试；
- 本地进度保存、恢复、旧版本与损坏降级测试；
- sitemap、内部链接、敏感信息和生产构建检查；
- 桌面和移动端人工验收。

### 10.3 发布完成标准

必须同时满足：

- 独立公开仓库可访问；
- GitHub Actions 全部通过；
- 三篇论文都能从官方来源打开；
- 网站中的代码链接绑定明确 commit；
- 页面不包含公司内部信息、本地绝对路径或私人笔记；
- 网站完整校验通过；
- 用户确认专题首页和至少一篇论文页的本地预览。

## 11. 实施顺序

1. 清理当前 `paper-deep-dive` 工作区的公开边界，包括未跟踪的 Transformer `input.txt`、PDF、生成图和缓存；
2. 创建独立 GitHub 仓库并迁移经过筛选的历史或内容；
3. 增加论文元数据、下载与校验脚本、CI 和公开 README；
4. 对迁移结果运行完整测试并固定首个网站引用 commit；
5. 在网站实现专题数据模型、首页、学习方法和三篇论文页；
6. 增加本地进度与自测交互；
7. 补齐自动测试、敏感信息检查和生产构建；
8. 本地预览并由用户验收；
9. 提交、推送并发布 Sites 新版本。

## 12. 后续扩展

第一版完成后，可以按同一结构增加 BERT、ViT、U-Net、GAN 等论文。只有当论文数量显著增加，人工精选发布成为稳定瓶颈时，才设计版本化内容包或自动同步；第一版不提前建设这套基础设施。

## 13. 设计依据

- [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239)
- [arXiv Non-exclusive License to Distribute](https://arxiv.org/licenses/nonexclusive-distrib/1.0/license.html)
- 本地学习工程 `03-research/paper-deep-dive`，审查日期 2026-09-15
