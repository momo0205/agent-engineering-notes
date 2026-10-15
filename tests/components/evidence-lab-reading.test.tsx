import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleBody } from "../../components/article-body";
import { renderMarkdown } from "../../lib/content/markdown-renderer";

describe("Agent Evidence Lab illustrated reading", () => {
  it("renders registered figures and accessible tables from sanitized content", () => {
    render(<ArticleBody profile="evidence-lab" html={renderMarkdown(
      "[evidence-lab-diagram:loop]\n\n| 判断者 | 执行者 |\n| --- | --- |\n| 模型 | 代码 |",
    )} />);
    expect(screen.getByRole("figure").querySelector("figcaption")).not.toBeNull();
    const region = screen.getByRole("region", { name: "数据表，可横向滚动" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(within(region).getAllByRole("columnheader")[0]).toHaveAttribute("scope", "col");
  });

  it("leaves code and unknown diagram tokens literal and removes unsafe markup", () => {
    const { container } = render(<ArticleBody profile="evidence-lab" html={renderMarkdown(
      "```text\n[evidence-lab-diagram:loop]\n```\n\n[evidence-lab-diagram:unknown]\n\n<script>alert(1)</script>\n\n<a href=\"javascript:alert(1)\">bad</a>",
    )} />);
    expect(screen.queryByRole("figure")).toBeNull();
    expect(container.querySelector("pre code")).toHaveTextContent("[evidence-lab-diagram:loop]");
    expect(container.querySelector("script, [href^='javascript:']")).toBeNull();
  });
});
