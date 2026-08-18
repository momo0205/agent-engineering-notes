import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const calendarDateSchema = z
  .string()
  .regex(datePattern)
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(`${value}T00:00:00Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day
    );
  }, "Invalid calendar date");

export const articleMetadataSchema = z
  .object({
    title: z.string().min(4).max(120),
    summary: z.string().min(8).max(240),
    status: z.enum(["draft", "review", "published"]),
    category: z.enum(["学习路径", "工程实践", "真实复盘", "架构决策"]),
    publishedAt: calendarDateSchema,
    updatedAt: calendarDateSchema,
    readingMinutes: z.number().int().positive().max(60),
    tags: z.array(z.string().min(1).max(30)).min(1).max(8),
  })
  .strict();

export type ArticleMetadata = z.infer<typeof articleMetadataSchema>;

export type Article = ArticleMetadata & {
  slug: string;
  body: string;
};
