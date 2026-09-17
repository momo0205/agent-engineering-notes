import { describe, expect, it } from "vitest";
import {
  algorithmFoundationsChapter,
  algorithmFoundationsChapters,
  algorithmFoundationsReadingMethod,
  algorithmFoundationsRevision,
  algorithmFoundationsReviewedAt,
} from "../../lib/content/algorithm-foundations-topic";

const publicRepository = "https://github.com/momo0205/paper-deep-dive.git";
const publicRepositoryTree = `https://github.com/momo0205/paper-deep-dive/tree/${algorithmFoundationsRevision}`;
const chapterLabels = {
  resnet: "ResNet",
  transformer: "Transformer",
  ddpm: "DDPM",
} as const;
const relationshipTerms = {
  resnet: ["信息", "梯度"],
  transformer: ["残差", "注意力", "前馈"],
  ddpm: ["去噪", "残差", "注意力"],
} as const;
const reproductionSetup = [
  `git clone ${publicRepository}`,
  `git checkout ${algorithmFoundationsRevision}`,
  "Python 3.11",
  "python3 -m venv .venv",
  "source .venv/bin/activate",
  "python3 -m pip install -e .",
] as const;

describe("algorithm foundations topic registry", () => {
  it("binds the three first-release chapters to the reviewed public repository revision", () => {
    expect(algorithmFoundationsRevision).toBe("2b8b41e63608725e6d4f25a44599014b1c22596e");
    expect(algorithmFoundationsRevision).toMatch(/^[0-9a-f]{40}$/);
    expect(algorithmFoundationsReviewedAt).toBe("2026-09-16");
    expect(algorithmFoundationsChapters.map(({ slug, status }) => [slug, status])).toEqual([
      ["resnet", "learning"],
      ["transformer", "framework"],
      ["ddpm", "framework"],
    ]);
  });

  it("uses official fixed arXiv versions and substantial Markdown source for every chapter", () => {
    expect(algorithmFoundationsChapters).toHaveLength(3);
    expect(algorithmFoundationsChapters.map(({ order }) => order)).toEqual(["01", "02", "03"]);

    expect(algorithmFoundationsChapters.map(({ arxivId, arxivVersion, abstractUrl, pdfUrl }) => ({
      arxivId,
      arxivVersion,
      abstractUrl,
      pdfUrl,
    }))).toEqual([
      {
        arxivId: "1512.03385",
        arxivVersion: "v1",
        abstractUrl: "https://arxiv.org/abs/1512.03385v1",
        pdfUrl: "https://arxiv.org/pdf/1512.03385v1",
      },
      {
        arxivId: "1706.03762",
        arxivVersion: "v7",
        abstractUrl: "https://arxiv.org/abs/1706.03762v7",
        pdfUrl: "https://arxiv.org/pdf/1706.03762v7",
      },
      {
        arxivId: "2006.11239",
        arxivVersion: "v2",
        abstractUrl: "https://arxiv.org/abs/2006.11239v2",
        pdfUrl: "https://arxiv.org/pdf/2006.11239v2",
      },
    ]);

    for (const chapter of algorithmFoundationsChapters) {
      expect(chapter.abstractUrl).toMatch(/^https:\/\/arxiv\.org\/abs\/\d+\.\d+v\d+$/);
      expect(chapter.pdfUrl).toMatch(/^https:\/\/arxiv\.org\/pdf\/\d+\.\d+v\d+$/);
      expect(chapter.body.length).toBeGreaterThan(1_000);
      expect(chapter.body).toContain("## 前置知识");
      expect(chapter.body).toContain("## 核心问题");
      expect(chapter.body).toContain("## 逐节中文精读导读");
      expect(chapter.body).toContain("## 关键公式与结构");
      expect(chapter.body).toContain("## 最小复现");
      expect(chapter.body).toContain("## 自测与能力边界");
      expect(chapter.body).toContain("## 一页纸总结");
    }
  });

  it("finds a chapter by slug without inventing a fallback", () => {
    expect(algorithmFoundationsChapter("resnet")?.paperTitle).toBe(
      "Deep Residual Learning for Image Recognition",
    );
    expect(algorithmFoundationsChapter("not-a-paper")).toBeUndefined();
  });

  it("publishes a reading method with setup, paper relationships, and links to all three chapters", () => {
    for (const requiredText of reproductionSetup) {
      expect(algorithmFoundationsReadingMethod).toContain(requiredText);
    }

    expect(algorithmFoundationsReadingMethod).toContain("## 三篇论文的关系");

    for (const chapter of algorithmFoundationsChapters) {
      expect(algorithmFoundationsReadingMethod).toContain(
        `[${chapterLabels[chapter.slug as keyof typeof chapterLabels]}](https://notes.ironmao.com/topics/algorithm-foundations/${chapter.slug})`,
      );
      expect(algorithmFoundationsReadingMethod).toContain(chapter.abstractUrl);
      expect(algorithmFoundationsReadingMethod).toContain(chapter.pdfUrl);
      for (const term of relationshipTerms[chapter.slug as keyof typeof relationshipTerms]) {
        expect(algorithmFoundationsReadingMethod).toContain(term);
      }
    }
  });

  it("keeps every paper body's pinned source and reproducible command together", () => {
    const expectedCommands = {
      resnet: "python3 code/resnet/plain_vs_residual.py --smoke --offline --output-dir /tmp/paper-deep-dive-resnet",
      transformer:
        "python3 code/transformer/tiny_attention.py --smoke --offline --output-dir /tmp/paper-deep-dive-transformer",
      ddpm: "python3 code/ddpm/simple_ddpm.py --smoke --offline --output-dir /tmp/paper-deep-dive-ddpm",
    } as const;

    for (const chapter of algorithmFoundationsChapters) {
      expect(chapter.body).toContain(chapter.paperTitle);
      expect(chapter.body).toContain(chapter.abstractUrl);
      expect(chapter.body).toContain(chapter.pdfUrl);
      expect(chapter.body).toContain(algorithmFoundationsRevision);
      expect(chapter.body).toContain(publicRepository);
      expect(chapter.body).toContain(publicRepositoryTree);
      expect(chapter.body).toContain(`git checkout ${algorithmFoundationsRevision}`);
      expect(chapter.body).toContain(expectedCommands[chapter.slug as keyof typeof expectedCommands]);
      for (const requiredText of reproductionSetup.slice(2)) {
        expect(chapter.body).toContain(requiredText);
      }
      for (const requiredText of ["--smoke", "--offline", "小型", "不下载数据集", "论文", "复现"]) {
        expect(chapter.body).toContain(requiredText);
      }
      expect(chapter.body).not.toContain("\npython code/");
    }
  });
});
