import { afterEach, describe, expect, it, vi } from "vitest";
import type { Article } from "../../lib/content/article-schema";

const articles: Article[] = [
  {
    slug: "visible-note",
    title: "可见的 Agent & 工程笔记",
    summary: "关于 <边界> 与 \"可信\" 输出的说明。",
    status: "published",
    category: "工程实践",
    publishedAt: "2026-08-17",
    updatedAt: "2026-08-18",
    readingMinutes: 5,
    tags: ["Agent"],
    body: "绝不能进入 RSS 的 **Markdown** <script>alert(1)</script>",
  },
  {
    slug: "private-draft",
    title: "不公开的草稿",
    summary: "这篇草稿不能出现在任何发布元数据中。",
    status: "draft",
    category: "架构决策",
    publishedAt: "2026-08-16",
    updatedAt: "2026-08-16",
    readingMinutes: 3,
    tags: ["draft"],
    body: "draft-secret-marker",
  },
  {
    slug: "pending-review",
    title: "等待审核的文章",
    summary: "这篇审核稿也不能出现在公开输出中。",
    status: "review",
    category: "真实复盘",
    publishedAt: "2026-08-15",
    updatedAt: "2026-08-15",
    readingMinutes: 4,
    tags: ["review"],
    body: "review-secret-marker",
  },
];

vi.mock("../../lib/content/article-repository", () => ({
  allArticles: () => articles,
  visibleArticles: (input = articles) =>
    input.filter((article: Article) => article.status === "published"),
  articleBySlug: (slug: string) =>
    articles.find(
      (article) => article.slug === slug && article.status === "published",
    ),
}));

const originalSiteUrl = process.env.SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = originalSiteUrl;
});

describe("canonical site URL", () => {
  it.each([
    undefined,
    "file:///tmp/site",
    "https://intranet.local",
    "http://127.0.0.1:8787",
    "http://10.1.2.3",
    "http://172.16.4.2",
    "http://192.168.1.3",
    "http://100.64.0.1",
    "http://198.18.0.1",
    "http://224.0.0.1",
    "https://[2001:4860:4860::8888]",
    "https://notes.example.com/base",
  ])("fails closed for unsafe SITE_URL %s", async (siteUrl) => {
    if (siteUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = siteUrl;
    const { canonicalBaseUrl } = await import("../../lib/publishing/site-url");

    expect(canonicalBaseUrl()).toBe("http://localhost:3000");
  });

  it("normalizes a public HTTP(S) URL without a trailing slash", async () => {
    process.env.SITE_URL = "https://notes.example.com/";
    const { canonicalBaseUrl } = await import("../../lib/publishing/site-url");

    expect(canonicalBaseUrl()).toBe("https://notes.example.com");
  });
});

describe("publishing metadata", () => {
  it("publishes escaped metadata for visible articles only in RSS", async () => {
    process.env.SITE_URL = "https://notes.example.com/";
    const { GET } = await import("../../app/rss.xml/route");

    const response = GET();
    const xml = await response.text();

    expect(response.headers.get("content-type")).toMatch(/application\/rss\+xml|application\/xml/);
    expect(xml).toContain("<title>Agent 工程笔记</title>");
    expect(xml).toContain("<link>https://notes.example.com</link>");
    expect(xml).toContain("可见的 Agent &amp; 工程笔记");
    expect(xml).toContain("关于 &lt;边界&gt; 与 &quot;可信&quot; 输出的说明。");
    expect(xml).toContain("<guid>https://notes.example.com/articles/visible-note</guid>");
    expect(xml).toContain("<pubDate>Mon, 17 Aug 2026 00:00:00 GMT</pubDate>");
    expect(xml).not.toContain("private-draft");
    expect(xml).not.toContain("pending-review");
    expect(xml).not.toContain("Markdown");
    expect(xml).not.toContain("&lt;script&gt;");
    expect(xml).not.toContain("alert(1)");
  });

  it("sitemaps static routes and visible articles only", async () => {
    process.env.SITE_URL = "https://notes.example.com/";
    const { default: sitemap } = await import("../../app/sitemap");

    expect(sitemap()).toEqual([
      { url: "https://notes.example.com/" },
      { url: "https://notes.example.com/journey" },
      { url: "https://notes.example.com/articles" },
      { url: "https://notes.example.com/topics/deepseek-harness" },
      { url: "https://notes.example.com/topics/deepseek-harness/capability-boundary" },
      { url: "https://notes.example.com/topics/deepseek-harness/source-walkthrough" },
      { url: "https://notes.example.com/topics/deepseek-harness/plugin-context-security" },
      { url: "https://notes.example.com/topics/deepseek-harness/integration-decision" },
      { url: "https://notes.example.com/topics/deepseek-harness/harness-fit" },
      { url: "https://notes.example.com/topics/deepseek-harness/tool-to-agent" },
      { url: "https://notes.example.com/topics/deepseek-harness/reversible-poc" },
      { url: "https://notes.example.com/topics/algorithm-foundations" },
      { url: "https://notes.example.com/topics/algorithm-foundations/reading-method" },
      { url: "https://notes.example.com/topics/algorithm-foundations/resnet" },
      { url: "https://notes.example.com/topics/algorithm-foundations/transformer" },
      { url: "https://notes.example.com/topics/algorithm-foundations/ddpm" },
      { url: "https://notes.example.com/topics/jev" },
      { url: "https://notes.example.com/topics/jev/why-jev" },
      { url: "https://notes.example.com/topics/jev/capability-boundary" },
      { url: "https://notes.example.com/topics/jev/text-context-reasoning" },
      { url: "https://notes.example.com/topics/jev/benchmark-audit" },
      { url: "https://notes.example.com/topics/jev/quickstart" },
      { url: "https://notes.example.com/topics/jev/experiment-plan" },
      { url: "https://notes.example.com/projects/agent-evidence-lab" },
      { url: "https://notes.example.com/about" },
      {
        url: "https://notes.example.com/articles/visible-note",
        lastModified: new Date("2026-08-18T00:00:00.000Z"),
      },
    ]);
  });

  it("allows indexing and advertises the canonical sitemap", async () => {
    process.env.SITE_URL = "https://notes.example.com/";
    const { default: robots } = await import("../../app/robots");

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://notes.example.com/sitemap.xml",
    });
  });

  it("sets canonical, Open Graph, and Twitter metadata", async () => {
    process.env.SITE_URL = "https://notes.example.com/";
    vi.resetModules();
    const { metadata } = await import("../../app/layout");

    expect(metadata.metadataBase).toEqual(new URL("https://notes.example.com"));
    expect(metadata.title).toEqual({
      default: "Agent 工程笔记",
      template: "%s · Agent 工程笔记",
    });
    expect(metadata.description).toBe("从 Java 后端到 Agent Engineering：代码、失败、实验和工程判断。");
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toMatchObject({
      title: "Agent 工程笔记",
      description: "从 Java 后端到 Agent Engineering：代码、失败、实验和工程判断。",
      images: ["/og.png"],
    });
    expect(metadata.twitter).toMatchObject({
      title: "Agent 工程笔记",
      description: "从 Java 后端到 Agent Engineering：代码、失败、实验和工程判断。",
      images: ["/og.png"],
    });
  });

  it("sets a route-specific canonical on every static page", async () => {
    const routes = [
      ["../../app/page", "/"],
      ["../../app/journey/page", "/journey"],
      ["../../app/articles/page", "/articles"],
      [
        "../../app/projects/agent-evidence-lab/page",
        "/projects/agent-evidence-lab",
      ],
      ["../../app/about/page", "/about"],
    ] as const;

    for (const [modulePath, canonical] of routes) {
      const page = await import(modulePath);
      expect(page.metadata.alternates).toEqual({ canonical });
      if (canonical !== "/") {
        expect(page.metadata.alternates).not.toEqual({ canonical: "/" });
      }
    }
  });

  it("publishes a unique title and canonical path for every algorithm topic route", async () => {
    const overview = await import("../../app/topics/algorithm-foundations/page");
    const { generateMetadata } = await import(
      "../../app/topics/algorithm-foundations/[chapter]/page"
    );
    const routes = [
      [overview.metadata, "算法原理与复现", "/topics/algorithm-foundations"],
      [
        await generateMetadata({ params: Promise.resolve({ chapter: "reading-method" }) }),
        "学习方法",
        "/topics/algorithm-foundations/reading-method",
      ],
      [
        await generateMetadata({ params: Promise.resolve({ chapter: "resnet" }) }),
        "Deep Residual Learning for Image Recognition",
        "/topics/algorithm-foundations/resnet",
      ],
      [
        await generateMetadata({ params: Promise.resolve({ chapter: "transformer" }) }),
        "Attention Is All You Need",
        "/topics/algorithm-foundations/transformer",
      ],
      [
        await generateMetadata({ params: Promise.resolve({ chapter: "ddpm" }) }),
        "Denoising Diffusion Probabilistic Models",
        "/topics/algorithm-foundations/ddpm",
      ],
    ] as const;

    expect([...new Set(routes.map(([metadata]) => metadata.title))]).toHaveLength(5);
    for (const [metadata, title, canonical] of routes) {
      expect(metadata).toMatchObject({ title, alternates: { canonical } });
    }
  });

  it("publishes a unique title and canonical path for every Jev topic route", async () => {
    const overview = await import("../../app/topics/jev/page");
    const { generateMetadata } = await import("../../app/topics/jev/[chapter]/page");
    const chapters = [
      ["why-jev", "为什么研究一个不写文本的模型"],
      ["capability-boundary", "Jev 是什么，不是什么"],
      ["text-context-reasoning", "没有文本，它还在“思考”吗"],
      ["benchmark-audit", "审计 193.6×、444.6× 与 67.8%"],
      ["quickstart", "从零开始调用 Jev"],
      ["experiment-plan", "我们准备怎样验证它"],
    ] as const;
    const routes = [
      [overview.metadata, "Jev：无文本决策模型研究", "/topics/jev"],
      ...await Promise.all(chapters.map(async ([slug, title]) => [
        await generateMetadata({ params: Promise.resolve({ chapter: slug }) }),
        title,
        `/topics/jev/${slug}`,
      ] as const)),
    ] as const;

    expect([...new Set(routes.map(([metadata]) => metadata.title))]).toHaveLength(7);
    for (const [metadata, title, canonical] of routes) {
      expect(metadata).toMatchObject({ title, alternates: { canonical } });
    }
  });

  it("publishes article metadata only for a visible article", async () => {
    const { generateArticleMetadata } = await import(
      "../../app/articles/[slug]/route-metadata"
    );

    await expect(
      generateArticleMetadata({ params: Promise.resolve({ slug: "visible-note" }) }),
    ).resolves.toMatchObject({
      title: "可见的 Agent & 工程笔记",
      description: "关于 <边界> 与 \"可信\" 输出的说明。",
      alternates: { canonical: "/articles/visible-note" },
    });
    await expect(
      generateArticleMetadata({ params: Promise.resolve({ slug: "private-draft" }) }),
    ).resolves.toEqual({});
    await expect(
      generateArticleMetadata({ params: Promise.resolve({ slug: "pending-review" }) }),
    ).resolves.toEqual({});
    await expect(
      generateArticleMetadata({ params: Promise.resolve({ slug: "missing" }) }),
    ).resolves.toEqual({});
  });
});
