import { describe, expect, it } from "vitest";
import {
  algorithmFoundationsChapters,
  algorithmFoundationsRevision,
} from "../../lib/content/algorithm-foundations-topic";

const sevenLayerHeadings = [
  "## 前置知识",
  "## 核心问题",
  "## 逐节中文精读导读",
  "## 关键公式与结构",
  "## 最小复现",
  "## 自测与能力边界",
  "## 一页纸总结",
] as const;

describe("algorithm rich-content publication boundary", () => {
  it("publishes every paper through the approved seven-layer study structure", () => {
    for (const chapter of algorithmFoundationsChapters) {
      for (const heading of sevenLayerHeadings) {
        expect(chapter.body, `${chapter.slug} is missing ${heading}`).toContain(heading);
      }

      expect(chapter.body).toContain(chapter.abstractUrl);
      expect(chapter.body).toContain(chapter.pdfUrl);
      expect(chapter.body).toContain(algorithmFoundationsRevision);
      expect(chapter.selfChecks.length).toBeGreaterThanOrEqual(6);
      expect(new Set(chapter.selfChecks.map(({ id }) => id)).size).toBe(chapter.selfChecks.length);
    }
  });

  it("keeps full translations, embedded paper images, and private workbench state out of public content", () => {
    const publicPayload = JSON.stringify({
      bodies: algorithmFoundationsChapters.map((chapter) => chapter.body),
      questions: algorithmFoundationsChapters.map((chapter) => chapter.selfChecks),
    });

    expect(publicPayload).not.toMatch(/data:[^;,]+;base64,/i);
    expect(publicPayload).not.toMatch(/!\[[^\]]*\]\([^)]+\)/);
    expect(publicPayload).not.toMatch(/<img\b/i);
    expect(publicPayload).not.toContain("paperDeepDive.v1");
    expect(publicPayload).not.toMatch(/<textarea|自动保存|中文全文翻译/i);
    expect(Math.max(...algorithmFoundationsChapters.map((chapter) => chapter.body.length))).toBeLessThan(120_000);
  });

  it("keeps experiment observations attached to their small offline scope", () => {
    for (const chapter of algorithmFoundationsChapters) {
      const reproduction = chapter.body.slice(chapter.body.indexOf("## 最小复现"));
      expect(reproduction).toContain("--smoke");
      expect(reproduction).toContain("--offline");
      expect(reproduction).toContain("Python 3.11");
      expect(reproduction).toContain("不能代表论文发表指标");
    }
  });
});
