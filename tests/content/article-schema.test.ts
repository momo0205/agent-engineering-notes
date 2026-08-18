import { describe, expect, it } from "vitest";
import { articleMetadataSchema } from "../../lib/content/article-schema";

const validMetadata = {
  title: "从 Java 后端到 Agent 开发",
  summary: "技术栈变化与学习路径。",
  status: "published",
  category: "学习路径",
  publishedAt: "2026-08-18",
  updatedAt: "2026-08-18",
  readingMinutes: 12,
  tags: ["Java", "Agent"],
} as const;

describe("articleMetadataSchema", () => {
  it("accepts complete article metadata", () => {
    expect(articleMetadataSchema.parse(validMetadata)).toEqual(validMetadata);
  });

  it("rejects an unknown status", () => {
    expect(() =>
      articleMetadataSchema.parse({ ...validMetadata, status: "public" }),
    ).toThrow();
  });

  it("rejects metadata without a summary", () => {
    const metadataWithoutSummary: Partial<typeof validMetadata> = {
      ...validMetadata,
    };
    Reflect.deleteProperty(metadataWithoutSummary, "summary");

    expect(() => articleMetadataSchema.parse(metadataWithoutSummary)).toThrow();
  });
});
