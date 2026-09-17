import ddpm from "../../content/topics/algorithm-foundations/ddpm.md?raw";
import readingMethod from "../../content/topics/algorithm-foundations/reading-method.md?raw";
import resnet from "../../content/topics/algorithm-foundations/resnet.md?raw";
import transformer from "../../content/topics/algorithm-foundations/transformer.md?raw";

export type AlgorithmChapterStatus = "framework" | "learning" | "verified";

export type SelfCheckQuestion = {
  id: string;
  prompt: string;
  answer: string;
};

export type AlgorithmChapter = {
  kind: "paper";
  slug: string;
  order: string;
  paperTitle: string;
  question: string;
  status: AlgorithmChapterStatus;
  summary: string;
  readingMinutes: number;
  arxivId: string;
  arxivVersion: string;
  abstractUrl: string;
  pdfUrl: string;
  body: string;
  reproductionCommand: string;
  selfChecks: readonly SelfCheckQuestion[];
};

export type AlgorithmFoundationsReadingMethod = {
  kind: "reading-method";
  slug: "reading-method";
  order: "00";
  title: string;
  summary: string;
  body: string;
};

export type AlgorithmFoundationsRoute = AlgorithmChapter | AlgorithmFoundationsReadingMethod;

export const algorithmFoundationsRevision = "2b8b41e63608725e6d4f25a44599014b1c22596e";
export const algorithmFoundationsReviewedAt = "2026-09-16";
export const algorithmFoundationsReadingMethod = readingMethod;
export const algorithmFoundationsReadingMethodPage: AlgorithmFoundationsReadingMethod = {
  kind: "reading-method",
  slug: "reading-method",
  order: "00",
  title: "学习方法",
  summary: "把问题、原文、最小复现和自测连成可检查的学习循环，再开始三篇论文的阅读。",
  body: readingMethod,
};

export const algorithmFoundationsChapters: readonly AlgorithmChapter[] = [
  {
    kind: "paper",
    slug: "resnet",
    order: "01",
    paperTitle: "Deep Residual Learning for Image Recognition",
    question: "为什么网络越深越难训练，而残差连接能让信息继续流动？",
    status: "learning",
    summary: "从退化问题进入 ResNet；先读原文与最小对照脚本，再把自己的解释写成可被实验推翻的假设。",
    readingMinutes: 18,
    arxivId: "1512.03385",
    arxivVersion: "v1",
    abstractUrl: "https://arxiv.org/abs/1512.03385v1",
    pdfUrl: "https://arxiv.org/pdf/1512.03385v1",
    body: resnet,
    reproductionCommand: "python3 code/resnet/plain_vs_residual.py --smoke --offline --output-dir /tmp/paper-deep-dive-resnet",
    selfChecks: [
      {
        id: "degradation-vs-overfitting",
        prompt: "退化问题与过拟合在观测上有什么不同？",
        answer: "退化可表现为更深模型连训练误差也更高；过拟合则通常是训练集表现较好而验证表现变差。两者仍需结合具体实验判断。",
      },
      {
        id: "residual-function",
        prompt: "F(x) + x 中的 F 为什么被称为残差？",
        answer: "F 学习相对输入 x 的补充变换；恒等路径保留 x，不表示网络不再需要学习。",
      },
      {
        id: "smoke-scope",
        prompt: "一个离线 smoke 成功，为什么不足以声称复现了论文指标？",
        answer: "它只说明这条小型脚本路径在该环境可运行；没有覆盖论文的数据集、训练配置、评测协议或指标，因此不能替代论文级对照。",
      },
      {
        id: "identity-optimization",
        prompt: "为什么‘更深网络可以学恒等映射’不等于优化器一定能找到它？",
        answer: "表达空间中存在恒等解，只说明模型能够表示它；非线性参数化下的优化路径、初始化和训练条件仍可能让求解器难以到达该解。",
      },
      {
        id: "projection-shortcut",
        prompt: "输入输出维度不一致时，shortcut 为什么可能需要投影？",
        answer: "逐元素相加要求形状一致；空间尺寸或通道数变化时，需要用投影或其他对齐方案把旁路变换到相同形状。",
      },
      {
        id: "bottleneck-purpose",
        prompt: "bottleneck 的 1×1、3×3、1×1 结构主要解决什么工程约束？",
        answer: "前后的 1×1 卷积调整通道数，使成本较高的 3×3 卷积在较窄表示上工作，从而控制深层网络的参数量与计算量。",
      },
    ],
  },
  {
    kind: "paper",
    slug: "transformer",
    order: "02",
    paperTitle: "Attention Is All You Need",
    question: "为什么注意力可以直接建立序列元素之间的关系？",
    status: "framework",
    summary: "把缩放点积注意力、并行计算与残差路径拆开，建立一个尚待逐项验证的阅读和实验框架。",
    readingMinutes: 20,
    arxivId: "1706.03762",
    arxivVersion: "v7",
    abstractUrl: "https://arxiv.org/abs/1706.03762v7",
    pdfUrl: "https://arxiv.org/pdf/1706.03762v7",
    body: transformer,
    reproductionCommand: "python3 code/transformer/tiny_attention.py --smoke --offline --output-dir /tmp/paper-deep-dive-transformer",
    selfChecks: [
      {
        id: "attention-roles",
        prompt: "QK^T、softmax 和 V 分别在决定什么？",
        answer: "QK^T 给出 query 与 key 的相关性分数，softmax 将分数归一化为权重，V 是按这些权重混合的信息内容。",
      },
      {
        id: "attention-scaling",
        prompt: "为什么要对点积做缩放？",
        answer: "维度增大时点积的数值幅度可能变大，使 softmax 过于尖锐并影响训练；缩放是为缓和这个问题的计算选择。",
      },
      {
        id: "residual-comparison",
        prompt: "Transformer 的残差路径与 ResNet 有何相似，又有哪些不能直接类比？",
        answer: "两者都保留较直接的信息路径；但模块、任务和实验设置不同，不能据此推出两篇论文有严格的线性继承或相同效果。",
      },
      {
        id: "multi-head-shape",
        prompt: "多头注意力为什么不是把完整维度的单头计算简单复制多次？",
        answer: "常见实现把总表示维度分配到多个头，各头使用不同投影，在各自子空间计算后再拼接；具体成本仍取决于实现和维度配置。",
      },
      {
        id: "position-information",
        prompt: "如果不加入位置信息，自注意力缺少什么？",
        answer: "它能根据内容建立关系，却不能仅凭相同的集合判断 token 的顺序；位置表示用于把序列位置注入计算。",
      },
      {
        id: "mask-difference",
        prompt: "padding mask 与 causal mask 分别阻止哪类注意力？",
        answer: "padding mask 排除补齐的无效位置；causal mask 排除未来位置，防止生成时使用尚未出现的信息。",
      },
    ],
  },
  {
    kind: "paper",
    slug: "ddpm",
    order: "03",
    paperTitle: "Denoising Diffusion Probabilistic Models",
    question: "为什么逐步加噪再去噪的过程能够成为生成模型？",
    status: "framework",
    summary: "以正向噪声、反向参数化和小型离线脚本为骨架，明确区分论文主张、待跑实验与未形成的解释。",
    readingMinutes: 20,
    arxivId: "2006.11239",
    arxivVersion: "v2",
    abstractUrl: "https://arxiv.org/abs/2006.11239v2",
    pdfUrl: "https://arxiv.org/pdf/2006.11239v2",
    body: ddpm,
    reproductionCommand: "python3 code/ddpm/simple_ddpm.py --smoke --offline --output-dir /tmp/paper-deep-dive-ddpm",
    selfChecks: [
      {
        id: "forward-reverse-information",
        prompt: "正向加噪过程和反向生成过程各自需要哪些信息？",
        answer: "正向过程需要数据、时间步和噪声日程来定义扰动；反向过程需要当前带噪样本、时间步与训练得到的预测，逐步形成样本。",
      },
      {
        id: "smoke-evidence-scope",
        prompt: "为什么能运行一个 smoke 不等于生成质量已经复现论文？",
        answer: "smoke 只检查小型数据流和脚本接口；生成质量还依赖数据、训练、采样和评测条件，需公开完整条件和结果才能比较。",
      },
      {
        id: "architecture-claims",
        prompt: "残差块和注意力与 DDPM 的关系，哪些是架构选择，哪些不是原论文的必然结论？",
        answer: "它们可作为去噪网络的架构选择来支持信息流或长程交互；不能仅凭这一关联就把某种网络设计说成 DDPM 原论文必然要求。",
      },
      {
        id: "closed-form-forward",
        prompt: "为什么训练时可以直接构造任意时间步的 x_t，而不必从第 1 步依次加噪？",
        answer: "线性高斯转移的复合仍有高斯闭式，可以由 x_0、累计系数和一次标准高斯噪声直接采样 x_t。",
      },
      {
        id: "simple-loss-boundary",
        prompt: "为什么不能把 L_simple 与完整变分目标不加区分地视为同一件事？",
        answer: "L_simple 来自特定参数化和权重简化；它与变分推导有关，但省略或重加权了完整目标中的条件，解释实验时必须保留这一区别。",
      },
      {
        id: "sampling-serial-cost",
        prompt: "为什么 DDPM 的反向采样通常比一次前向生成慢？",
        answer: "它从 x_T 开始按时间步重复调用去噪网络，后一步依赖前一步结果；这种串行链路需要多次模型前向。",
      },
    ],
  },
] as const;

export type AlgorithmChapterSlug = "resnet" | "transformer" | "ddpm";

export function algorithmFoundationsChapter(slug: AlgorithmChapterSlug): AlgorithmChapter | undefined;
export function algorithmFoundationsChapter(slug: "reading-method"): AlgorithmFoundationsReadingMethod | undefined;
export function algorithmFoundationsChapter(slug: string): AlgorithmFoundationsRoute | undefined;
export function algorithmFoundationsChapter(slug: string): AlgorithmFoundationsRoute | undefined {
  if (slug === algorithmFoundationsReadingMethodPage.slug) {
    return algorithmFoundationsReadingMethodPage;
  }

  return algorithmFoundationsChapters.find((chapter) => chapter.slug === slug);
}
