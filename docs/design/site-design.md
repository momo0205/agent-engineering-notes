# Agent 工程笔记：公共设计说明

状态：首发视觉与信息架构已批准并实现。  
更新时间：2026-08-18。

## Product goal

这是一个面向已有后端经验、正在学习 Agent Engineering 的中文技术内容站。它记录真实的代码、实验、失败和工程判断，先解释人面对的问题与选择，再进入接口和实现。

内容必须区分：已经实现、仅在固定实验中验证、正在进行，以及尚未完成或只是未来方向。小型评测不能外推为准确率、SLA 或生产可靠性。

## Information architecture

```text
/
├── /journey
├── /articles
├── /articles/{slug}
├── /projects/agent-evidence-lab
└── /about
```

- 首页：个人学习叙事、当前项目和最近文章；
- Journey：LLM API → Tool Calling → Context → Harness → RAG → Loop → Evaluation → Production；
- Articles：只浏览和搜索 `published` 元数据；
- Article detail：安全渲染 Markdown；
- Project：记录 Agent Evidence Lab 已完成、当前与剩余工作；
- About：背景、写作原则、公开边界与免责声明。

## Visual language

目标是克制、柔和、有人味的编辑型技术站。内容层级清楚，色块有明显区别，但共享统一的圆角、字阶、间距与交互语言。

```css
--paper: #f7f6f2;
--ink: #202124;
--muted: #6d6d69;
--line: #deddd7;
--feature: #262b3a;
--feature-ink: #f7f7f5;
--accent: #536fd7;
--card-blue: #e4e8f3;
--card-green: #e3ece7;
--card-warm: #eee5df;
--radius-large: 20px;
--radius-card: 17px;
--content-width: 1120px;
```

排版规则：

- 中文标题和正文使用柔和的系统 sans 字体栈；
- 分类、日期和技术元信息使用 monospace；
- 暖白背景承载内容，深靛色只突出当前核心项目；
- 蓝灰、绿灰、暖灰卡片保持相近明度和低饱和度；
- 小字号文字必须保持 AA 对比度；
- 手机与桌面端保持同一内容顺序，而非创建另一套信息架构。

明确禁止：网格纸背景、标签墙、终端状态面板、渐变、霓虹发光、机器人/大脑/电路等通用 AI 图像、玻璃拟态和高成本视差动画。

## Homepage hierarchy

1. 品牌：`Agent 工程笔记`；
2. Hero：学习怎样造出真正能工作的 Agent，并记录代码、失败和判断；
3. 深靛色 Agent Evidence Lab 主项目块；
4. 三张不同低饱和色的真实已发布文章卡；
5. “为什么写下来”；
6. 简洁页脚。

## Content and trust boundaries

文章状态为 `draft`、`review`、`published`。只有 `published` 可以进入导航、详情、客户端搜索、RSS 和 sitemap。

Markdown 经过 `marked` 解析和 `sanitize-html` 净化。`ArticleBody` 是唯一允许使用 `dangerouslySetInnerHTML` 的组件。脚本、事件属性、危险协议和未经允许的 HTML 属性必须被删除。

服务端只向客户端搜索组件发送展示所需的公开元数据，不传正文、状态或内部日期字段。

## Accessibility and responsive behavior

- 所有页面提供统一的 skip-link 目标；
- 键盘焦点清晰可见；
- 表单具有显式 label，无结果状态可被辅助技术读取；
- 使用语义化的 `main`、`section`、`article` 和标题层级；
- 尊重 `prefers-reduced-motion`；
- 在窄屏上将网格自然降为单列或双列，不隐藏核心内容。

## Publishing quality gates

以下任一情况都必须阻断发布：

- Frontmatter 缺失或非法；
- 敏感信息命中；
- 内部链接失效或尝试引用本地绝对路径；
- draft/review 进入生产查询；
- 测试、类型检查或生产构建失败。

部署失败时应保留上一版线上站点。自定义域名、评论、CMS、数据库、统计和 AI 问答均不属于首发范围。
