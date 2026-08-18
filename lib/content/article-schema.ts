import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const articleMetadataSchema = z
  .object({
    title: z.string().min(4).max(120),
    summary: z.string().min(8).max(240),
    status: z.enum(["draft", "review", "published"]),
    category: z.enum(["学习路径", "工程实践", "真实复盘", "架构决策"]),
    publishedAt: z.string().regex(datePattern),
    updatedAt: z.string().regex(datePattern),
    readingMinutes: z.number().int().positive().max(60),
    tags: z.array(z.string().min(1).max(30)).min(1).max(8),
  })
  .strict();

export type ArticleMetadata = z.infer<typeof articleMetadataSchema>;

export type Article = ArticleMetadata & {
  slug: string;
  body: string;
};
