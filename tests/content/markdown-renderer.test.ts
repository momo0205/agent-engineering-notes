import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../../lib/content/markdown-renderer";

describe("renderMarkdown", () => {
  it("renders Markdown while removing executable raw HTML", () => {
    const html = renderMarkdown(
      "# 标题\n\n`code`\n\n<script>alert(1)</script>",
    );

    expect(html).toContain("<h1>标题</h1>");
    expect(html).toContain("<code>code</code>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  it("keeps safe links and images, including site-relative URLs and fragments", () => {
    const html = renderMarkdown(
      "[HTTPS](https://example.com/docs) [relative](/articles/intro) [fragment](#details)\n\n![image](https://example.com/image.png)",
    );

    expect(html).toContain('href="https://example.com/docs"');
    expect(html).toContain('href="/articles/intro"');
    expect(html).toContain('href="#details"');
    expect(html).toContain('src="https://example.com/image.png"');
  });

  it("removes javascript and data URLs and unsafe attributes", () => {
    const html = renderMarkdown(
      '<a href="javascript:alert(1)" onclick="alert(2)" style="color:red">bad</a>\n\n<img src="data:text/html;base64,evil" onerror="alert(3)" alt="bad">',
    );

    expect(html).not.toMatch(/(?:href|src)=/);
    expect(html).not.toMatch(/(?:onclick|onerror|style)=/);
    expect(html).not.toContain("alert(1)");
    expect(html).not.toContain("alert(2)");
    expect(html).not.toContain("alert(3)");
  });
});
