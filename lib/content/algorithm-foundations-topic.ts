import ddpm from "../../content/topics/algorithm-foundations/ddpm.md?raw";
import readingMethod from "../../content/topics/algorithm-foundations/reading-method.md?raw";
import resnet from "../../content/topics/algorithm-foundations/resnet.md?raw";
import transformer from "../../content/topics/algorithm-foundations/transformer.md?raw";

export type AlgorithmChapterStatus = "framework" | "learning" | "verified";

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
