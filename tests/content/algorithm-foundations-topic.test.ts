import { describe, expect, it } from "vitest";
import {
  algorithmFoundationsChapter,
  algorithmFoundationsChapters,
  algorithmFoundationsReadingMethod,
  algorithmFoundationsRevision,
  algorithmFoundationsReviewedAt,
} from "../../lib/content/algorithm-foundations-topic";

const publicRepository = "https://github.com/momo0205/paper-deep-dive.git";
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
      expect(chapter.body).toContain("## 核心问题");
      expect(chapter.body).toContain("## 最小复现");
      expect(chapter.body).toContain("## 已验证");
      expect(chapter.body).toContain("## 尚未得出结论");
      expect(chapter.body).toContain("## 自测");
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

    expect(algorithmFoundationsReadingMethod).toContain("改善深层网络中的信息与梯度传递");
    expect(algorithmFoundationsReadingMethod).toContain("用残差结构承载多层注意力和前馈计算");
    expect(algorithmFoundationsReadingMethod).toContain("在去噪网络中继续使用残差块，并可引入注意力");

    for (const chapter of algorithmFoundationsChapters) {
      expect(algorithmFoundationsReadingMethod).toContain(
        `[${chapter.slug === "ddpm" ? "DDPM" : chapter.slug === "resnet" ? "ResNet" : "Transformer"}](https://notes.ironmao.com/topics/algorithm-foundations/${chapter.slug})`,
      );
      expect(algorithmFoundationsReadingMethod).toContain(chapter.abstractUrl);
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
      expect(chapter.body).toContain(`git checkout ${algorithmFoundationsRevision}`);
      expect(chapter.body).toContain(expectedCommands[chapter.slug as keyof typeof expectedCommands]);
      for (const requiredText of reproductionSetup.slice(2)) {
        expect(chapter.body).toContain(requiredText);
      }
      expect(chapter.body).not.toContain("\npython code/");
    }
  });
});
