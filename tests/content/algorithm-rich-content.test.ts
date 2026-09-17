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

const base64DataUrlPattern = /data:[^,\s]*;base64,/i;
const markdownImagePattern = /!\[/;
const htmlImagePattern = /<img\b/i;

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

    expect(publicPayload).not.toMatch(base64DataUrlPattern);
    expect(publicPayload).not.toMatch(markdownImagePattern);
    expect(publicPayload).not.toMatch(htmlImagePattern);
    expect(publicPayload).not.toContain("paperDeepDive.v1");
    expect(publicPayload).not.toMatch(/<textarea|自动保存|中文全文翻译/i);
    expect(Math.max(...algorithmFoundationsChapters.map((chapter) => chapter.body.length))).toBeLessThan(120_000);
  });

  it("recognizes every forbidden image representation without rejecting normal links", () => {
    for (const sample of [
      "data:;base64,AAAA",
      "data:text/plain;charset=utf-8;base64,AAAA",
      "data:image/png;base64,AAAA",
    ]) {
      expect(sample).toMatch(base64DataUrlPattern);
    }

    for (const sample of [
      "![paper](https://example.com/paper.png)",
      "![paper][figure-one]",
      "![paper][]",
      "![paper]",
      "![]()",
    ]) {
      expect(sample).toMatch(markdownImagePattern);
    }

    expect("[paper](https://example.com/paper)").not.toMatch(markdownImagePattern);
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

  it("separates gradient stabilization from the degradation problem in the ResNet chapter", () => {
    const resnet = algorithmFoundationsChapters.find(({ slug }) => slug === "resnet");

    expect(resnet?.body).toContain("### 梯度稳定不等于解决退化");
    expect(resnet?.body).toContain("Xavier");
    expect(resnet?.body).toContain("He 初始化");
    expect(resnet?.body).toContain("Batch Normalization");
    expect(resnet?.body).toContain("并不等于退化问题已经解决");
  });
});
